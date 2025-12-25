import { Injectable, NotFoundException, Logger, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bwipjs from 'bwip-js';
import { Shipment } from '../../entities/shipment.entity';
import { ShipmentDetail } from '../../entities/shipment-detail.entity';
import { TrackingLog } from '../../entities/tracking-log.entity';
import { Prediction } from '../../entities/prediction.entity';
import { AidItem } from '../../entities/aid-item.entity';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { CreateShipmentFromPredictionDto } from './dto/create-shipment-from-prediction.dto';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class ShipmentsService {
  private readonly logger = new Logger(ShipmentsService.name);

  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(ShipmentDetail)
    private readonly shipmentDetailRepository: Repository<ShipmentDetail>,
    @InjectRepository(TrackingLog)
    private readonly trackingLogRepository: Repository<TrackingLog>,
    @InjectRepository(Prediction)
    private readonly predictionRepository: Repository<Prediction>,
    @InjectRepository(AidItem)
    private readonly aidItemRepository: Repository<AidItem>,
    private readonly blockchainService: BlockchainService,
  ) { }

  /**
   * Generates a unique barcode in format BD-2025-XXXXX
   * where XXXXX is a random alphanumeric string
   */
  private async generateBarcode(): Promise<string> {
    const maxRetries = 5;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const year = new Date().getFullYear();

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      // Generate random 5-character string
      let randomPart = '';
      for (let i = 0; i < 5; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const barcode = `BD-${year}-${randomPart}`;

      // Check uniqueness in database
      const existing = await this.shipmentRepository.findOne({
        where: { barcode },
      });

      if (!existing) {
        return barcode;
      }

      this.logger.warn(`Barcode collision detected: ${barcode}, retrying...`);
    }

    throw new ConflictException('Failed to generate unique barcode after maximum retries');
  }

  /**
   * Generates a barcode image as PNG buffer
   */
  async getShipmentBarcodeImage(shipmentId: number): Promise<Buffer> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${shipmentId} not found`);
    }

    try {
      const png = await bwipjs.toBuffer({
        bcid: 'code128', // Barcode type (Code 128 is widely supported)
        text: shipment.barcode,
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: 'center',
      });

      return png;
    } catch (error) {
      this.logger.error(`Failed to generate barcode image: ${error.message}`);
      throw error;
    }
  }

  async create(createShipmentDto: CreateShipmentDto, userId: number): Promise<Shipment> {
    const { source_location_id, destination_location_id, items } = createShipmentDto;

    // Generate unique barcode in BD-2025-XXXXX format
    const barcode = await this.generateBarcode();

    const shipment = this.shipmentRepository.create({
      barcode,
      source_location_id,
      destination_location_id,
      created_by_official_id: userId,
      status: 'Registered',
    });

    const savedShipment = await this.shipmentRepository.save(shipment);

    const shipmentDetails = items.map(item => {
      return this.shipmentDetailRepository.create({
        shipment_id: savedShipment.id,
        item_id: item.item_id,
        quantity: item.quantity,
      });
    });

    await this.shipmentDetailRepository.save(shipmentDetails);

    // Create initial tracking log with pending transaction hash
    const trackingLog = this.trackingLogRepository.create({
      shipment_id: savedShipment.id,
      status: 'Registered',
      transaction_hash: 'pending',
      timestamp: new Date(),
    });
    const savedTrackingLog = await this.trackingLogRepository.save(trackingLog);

    // Load source location for blockchain recording
    const sourceLocation = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.sourceLocation', 'sourceLocation')
      .where('shipment.id = :id', { id: savedShipment.id })
      .getOne();

    const locationName = sourceLocation?.sourceLocation?.name || `location_${source_location_id}`;

    // Fire-and-forget blockchain recording (NFR10: non-blocking)
    this.blockchainService
      .addShipmentLog(barcode, 'Registered', locationName)
      .then(txHash => {
        savedTrackingLog.transaction_hash = txHash;
        this.trackingLogRepository.save(savedTrackingLog);
        this.logger.log(`Blockchain recorded for ${barcode}: ${txHash}`);
      })
      .catch(async err => {
        this.logger.warn(`Blockchain recording failed for ${barcode}: ${err.message}`);
        savedTrackingLog.transaction_hash = 'failed';
        await this.trackingLogRepository.save(savedTrackingLog);
      });

    return savedShipment;
  }

  async createFromPrediction(dto: CreateShipmentFromPredictionDto, userId: number): Promise<Shipment> {
    const { prediction_id, source_location_id, destination_location_id, adjusted_quantities } = dto;

    // Verify prediction exists
    const prediction = await this.predictionRepository.findOne({ where: { id: prediction_id } });
    if (!prediction) {
      throw new NotFoundException(`Prediction with ID ${prediction_id} not found`);
    }

    // Check if prediction is already linked to a shipment (AC: #2)
    if (prediction.shipment_id) {
      throw new ConflictException(`Prediction ${prediction_id} is already linked to shipment ${prediction.shipment_id}`);
    }

    // Use adjusted quantities if provided, otherwise use predicted quantities
    const quantities = adjusted_quantities || prediction.predicted_quantities;

    // Generate unique barcode in BD-2025-XXXXX format
    const barcode = await this.generateBarcode();

    // Create shipment with 'Created' status (AC: #4)
    const shipment = this.shipmentRepository.create({
      barcode,
      source_location_id,
      destination_location_id,
      created_by_official_id: userId,
      status: 'Created',
      prediction_id,
    });

    const savedShipment = await this.shipmentRepository.save(shipment);

    // Map prediction quantities to ShipmentDetail items
    // Quantities keys are aid item names (e.g., 'tent', 'blanket')
    const aidItems = await this.aidItemRepository.find();
    const aidItemMap = new Map(aidItems.map(item => [item.name.toLowerCase(), item.id]));

    const shipmentDetails: ShipmentDetail[] = [];
    for (const [itemName, quantity] of Object.entries(quantities)) {
      const itemId = aidItemMap.get(itemName.toLowerCase());
      if (itemId && quantity > 0) {
        const detail = this.shipmentDetailRepository.create({
          shipment_id: savedShipment.id,
          item_id: itemId,
          quantity: quantity,
        });
        shipmentDetails.push(detail);
      } else {
        this.logger.warn(`Aid item '${itemName}' not found in database, skipping`);
      }
    }

    if (shipmentDetails.length > 0) {
      await this.shipmentDetailRepository.save(shipmentDetails);
    }

    // Link prediction to shipment (AC: #2)
    prediction.shipment_id = savedShipment.id;
    await this.predictionRepository.save(prediction);

    // Create initial tracking log with pending transaction hash
    const trackingLog = this.trackingLogRepository.create({
      shipment_id: savedShipment.id,
      status: 'Created',
      transaction_hash: 'pending',
      timestamp: new Date(),
    });
    const savedTrackingLog = await this.trackingLogRepository.save(trackingLog);

    // Load source location for blockchain recording
    const sourceLocation = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.sourceLocation', 'sourceLocation')
      .where('shipment.id = :id', { id: savedShipment.id })
      .getOne();

    const locationName = sourceLocation?.sourceLocation?.name || `location_${source_location_id}`;

    // Fire-and-forget blockchain recording (NFR10: non-blocking)
    this.blockchainService
      .addShipmentLog(barcode, 'Created', locationName)
      .then(txHash => {
        savedTrackingLog.transaction_hash = txHash;
        this.trackingLogRepository.save(savedTrackingLog);
        this.logger.log(`Blockchain recorded for ${barcode}: ${txHash}`);
      })
      .catch(async err => {
        this.logger.warn(`Blockchain recording failed for ${barcode}: ${err.message}`);
        savedTrackingLog.transaction_hash = 'failed';
        await this.trackingLogRepository.save(savedTrackingLog);
      });

    return savedShipment;
  }

  async updateStatus(updateShipmentStatusDto: UpdateShipmentStatusDto): Promise<Shipment> {
    const { barcode, status } = updateShipmentStatusDto;

    const shipment = await this.shipmentRepository.findOne({
      where: { barcode },
      relations: ['sourceLocation', 'destinationLocation'],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with barcode ${barcode} not found`);
    }

    // Strict Status Transition Logic (State Machine)
    // Created/Registered -> Departed -> Arrived -> Delivered
    const currentStatus = shipment.status;

    // Allow transition from Created OR Registered to Departed (as shipments might start in either state)
    if (status === 'Departed') {
      if (currentStatus !== 'Created' && currentStatus !== 'Registered') {
        throw new BadRequestException(`Invalid status transition from ${currentStatus} to Departed. Must be Created or Registered.`);
      }
    } else if (status === 'Arrived') {
      if (currentStatus !== 'Departed') {
        throw new BadRequestException(`Invalid status transition from ${currentStatus} to Arrived. Must be Departed.`);
      }
    } else if (status === 'Delivered') {
      if (currentStatus !== 'Arrived') {
        throw new BadRequestException(`Invalid status transition from ${currentStatus} to Delivered. Must be Arrived.`);
      }
    } else {
      // For any other status (e.g., trying to set back to Created/Registered/InTransit) - block it unless logic allows
      // Assuming loop-back is NOT allowed for this linear workflow
      throw new BadRequestException(`Invalid status update directly to ${status}.`);
    }

    shipment.status = status;
    const updatedShipment = await this.shipmentRepository.save(shipment);

    // Determine location based on status
    // Departed -> Source Location name
    // Arrived/Delivered -> Destination Location name
    let locationName = '';

    if (status === 'Departed') {
      locationName = shipment.sourceLocation?.name || `location_${shipment.source_location_id}`;
    } else { // Arrived or Delivered
      locationName = shipment.destinationLocation?.name || `location_${shipment.destination_location_id}`;
    }

    // Create tracking log with pending transaction hash
    const trackingLog = this.trackingLogRepository.create({
      shipment_id: shipment.id,
      status: status,
      transaction_hash: 'pending',
      timestamp: new Date(),
    });
    const savedTrackingLog = await this.trackingLogRepository.save(trackingLog);

    // Fire-and-forget blockchain recording (NFR10: non-blocking)
    this.blockchainService
      .addShipmentLog(barcode, status, locationName)
      .then(txHash => {
        savedTrackingLog.transaction_hash = txHash;
        this.trackingLogRepository.save(savedTrackingLog);
        this.logger.log(`Blockchain recorded for ${barcode} status ${status}: ${txHash}`);
      })
      .catch(async err => {
        this.logger.warn(`Blockchain recording failed for ${barcode}: ${err.message}`);
        savedTrackingLog.transaction_hash = 'failed';
        await this.trackingLogRepository.save(savedTrackingLog);
      });

    return updatedShipment;
  }

  async getRecentShipments(userId: number): Promise<Shipment[]> {
    return this.shipmentRepository.find({
      where: { created_by_official_id: userId },
      relations: ['sourceLocation', 'destinationLocation', 'official'],
      order: { created_at: 'DESC' },
      take: 10,
    });
  }

  async getShipmentItems(shipmentId: number): Promise<ShipmentDetail[]> {
    return this.shipmentDetailRepository.find({
      where: { shipment_id: shipmentId },
      relations: ['item'],
    });
  }

  async getShipmentById(shipmentId: number): Promise<Shipment | null> {
    return this.shipmentRepository.findOne({
      where: { id: shipmentId },
      relations: ['sourceLocation', 'destinationLocation', 'official', 'prediction'],
    });
  }
}

