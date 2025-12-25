import { Injectable, NotFoundException, Logger, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bwipjs from 'bwip-js';
import { Shipment } from '../../entities/shipment.entity';
import { ShipmentDetail } from '../../entities/shipment-detail.entity';
import { TrackingLog } from '../../entities/tracking-log.entity';
import { Prediction } from '../../entities/prediction.entity';
import { AidItem } from '../../entities/aid-item.entity';
import { Official } from '../../entities/official.entity';
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
    @InjectRepository(Official)
    private readonly officialRepository: Repository<Official>,
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
    } else if (status === 'Cancelled') {
      if (currentStatus === 'Delivered') {
        throw new BadRequestException(`Cannot cancel a shipment that has already been delivered.`);
      }
      // Allow transition to Cancelled from Created, Registered, Departed, Arrived
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

  /**
   * Tracks a shipment by barcode (case-insensitive) and returns shipment details with history.
   * Public endpoint - no authentication required.
   * Returns data in format expected by frontend trackingService (snake_case for raw DB fields).
   * 
   * @param barcode - The shipment barcode to search for (case-insensitive)
   * @returns Shipment details including items and tracking history
   * @throws NotFoundException if shipment not found
   */
  async trackShipmentByBarcode(barcode: string): Promise<{
    shipment: {
      id: number;
      barcode: string;
      source_location_id: number | null;
      destination_location_id: number;
      created_by_official_id: number;
      status: string;
      created_at: Date;
      updated_at: Date;
      sourceLocation?: {
        id: number;
        name: string;
        address: string;
        city: string;
        region: string;
        latitude?: number;
        longitude?: number;
      };
      destinationLocation?: {
        id: number;
        name: string;
        address: string;
        city: string;
        region: string;
        latitude?: number;
        longitude?: number;
      };
      official?: {
        id: number;
        name: string;
        wallet_address: string;
      };
      items?: Array<{
        id: number;
        quantity: number;
        aidItem: {
          id: number;
          name: string;
          category?: string;
          unit?: string;
        };
      }>;
    };
    history: Array<{
      id: number;
      shipment_id: number;
      status: string;
      location?: string;
      timestamp: Date;
      notes?: string;
      recorded_by?: number;
      is_on_blockchain: boolean;
      blockchain_tx_hash?: string;
    }>;
  }> {
    // Case-insensitive barcode search
    const shipment = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.sourceLocation', 'sourceLocation')
      .leftJoinAndSelect('shipment.destinationLocation', 'destinationLocation')
      .leftJoinAndSelect('shipment.official', 'official')
      .where('LOWER(shipment.barcode) = LOWER(:barcode)', { barcode })
      .getOne();

    if (!shipment) {
      throw new NotFoundException(`Shipment with barcode '${barcode}' not found`);
    }

    // Get shipment items with aid item details
    const shipmentItems = await this.shipmentDetailRepository.find({
      where: { shipment_id: shipment.id },
      relations: ['item'],
    });

    // Get tracking history for shipment
    const trackingLogs = await this.trackingLogRepository.find({
      where: { shipment_id: shipment.id },
      order: { timestamp: 'DESC' },
    });

    // Helper function to determine location based on status
    const getLocationForStatus = (status: string): string | undefined => {
      const normalizedStatus = status.toLowerCase();
      // Departed/Registered/Created -> Source Location
      if (['departed', 'registered', 'created'].includes(normalizedStatus)) {
        return shipment.sourceLocation?.name;
      }
      // Arrived/Delivered -> Destination Location
      if (['arrived', 'delivered'].includes(normalizedStatus)) {
        return shipment.destinationLocation?.name;
      }
      // In Transit -> Could be either, return undefined
      return undefined;
    };

    // Transform to expected response format
    // Note: Location entity has only name, latitude, longitude (no address/city/region)
    // TrackingLog entity has only id, shipment_id, status, transaction_hash, timestamp
    return {
      shipment: {
        id: shipment.id,
        barcode: shipment.barcode,
        source_location_id: shipment.source_location_id,
        destination_location_id: shipment.destination_location_id,
        created_by_official_id: shipment.created_by_official_id,
        status: shipment.status,
        created_at: shipment.created_at,
        updated_at: shipment.updated_at,
        sourceLocation: shipment.sourceLocation ? {
          id: shipment.sourceLocation.id,
          name: shipment.sourceLocation.name,
          address: '', // Location entity doesn't have address
          city: '',    // Location entity doesn't have city
          region: '',  // Location entity doesn't have region
          latitude: shipment.sourceLocation.latitude,
          longitude: shipment.sourceLocation.longitude,
        } : undefined,
        destinationLocation: shipment.destinationLocation ? {
          id: shipment.destinationLocation.id,
          name: shipment.destinationLocation.name,
          address: '', // Location entity doesn't have address
          city: '',    // Location entity doesn't have city
          region: '',  // Location entity doesn't have region
          latitude: shipment.destinationLocation.latitude,
          longitude: shipment.destinationLocation.longitude,
        } : undefined,
        official: shipment.official ? {
          id: shipment.official.id,
          name: shipment.official.name,
          wallet_address: shipment.official.wallet_address,
        } : undefined,
        items: shipmentItems.map(detail => ({
          id: detail.id,
          quantity: detail.quantity,
          aidItem: {
            id: detail.item?.id || 0,
            name: detail.item?.name || 'Unknown',
            category: detail.item?.category,
          },
        })),
      },
      history: trackingLogs.map(log => ({
        id: log.id,
        shipment_id: log.shipment_id,
        status: log.status,
        location: getLocationForStatus(log.status), // Infer location from status
        timestamp: log.timestamp,
        notes: undefined,    // TrackingLog entity doesn't have notes field
        recorded_by: undefined, // TrackingLog entity doesn't have recorded_by field
        is_on_blockchain: !!log.transaction_hash && log.transaction_hash !== 'pending' && log.transaction_hash !== 'failed',
        blockchain_tx_hash: (log.transaction_hash && log.transaction_hash !== 'pending' && log.transaction_hash !== 'failed') ? log.transaction_hash : undefined,
      })),
    };
  }

  /**
   * Calculates the overall prediction accuracy between predicted and actual quantities.
   * Per-item accuracy: max(0, 100 - (|Actual - Predicted| / Predicted) * 100)
   * Overall accuracy: Average of all per-item accuracies, rounded to 2 decimal places.
   * Edge cases:
   *   - If Predicted is 0 and Actual is 0 → 100% accuracy for that item
   *   - If Predicted is 0 and Actual > 0 → 0% accuracy for that item
   */
  private calculatePredictionAccuracy(
    predicted: Record<string, number>,
    actual: Record<string, number>,
  ): number {
    // Union of all keys from both predicted and actual
    const allKeys = new Set([
      ...Object.keys(predicted),
      ...Object.keys(actual)
    ]);

    if (allKeys.size === 0) {
      return 100.0; // Both empty implies perfect match
    }

    let totalAccuracy = 0;
    let itemCount = 0;

    for (const key of allKeys) {
      // Normalize key lookup (assuming keys might have case diffs, though we normalize actuals now)
      // predicted keys come from DB jsonb, usually lowercase but good to be safe if 'Tent' vs 'tent'
      // actual keys are normalized in confirmDelivery

      // Need to find the key in predicted regardless of case if possible, or assume predicted is clean.
      // For safety, let's lower case everything for lookup.
      const predKey = Object.keys(predicted).find(k => k.toLowerCase() === key.toLowerCase());
      const actKey = Object.keys(actual).find(k => k.toLowerCase() === key.toLowerCase());

      const pred = predKey ? predicted[predKey] : 0;
      const act = actKey ? actual[actKey] : 0;

      let itemAccuracy: number;
      if (pred === 0) {
        // Edge case: If predicted is 0, accuracy is 100% only if actual is also 0
        itemAccuracy = act === 0 ? 100 : 0;
      } else {
        // Standard formula: max(0, 100 - (|Actual - Predicted| / Predicted) * 100)
        itemAccuracy = Math.max(0, 100 - (Math.abs(act - pred) / pred) * 100);
      }

      totalAccuracy += itemAccuracy;
      itemCount++;
    }

    const overallAccuracy = itemCount > 0 ? totalAccuracy / itemCount : 100;
    // Round to 2 decimal places (e.g., 87.50)
    return Math.round(overallAccuracy * 100) / 100;
  }

  /**
   * Confirms delivery of a shipment and records actual quantities received.
   * - Validates shipment is in 'Arrived' state
   * - Updates shipment status to 'Delivered'
   * - Saves actual quantities to the linked Prediction entity
   * - Triggers blockchain recording for 'Delivered' status
   */
  async confirmDelivery(
    shipmentId: number,
    actualQuantities: Record<string, number>,
    userId: number,
  ): Promise<Shipment> {
    // Load shipment with relations
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
      relations: ['sourceLocation', 'destinationLocation', 'prediction'],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${shipmentId} not found`);
    }

    // Validate shipment is in 'Arrived' state (AC: #1, #2)
    if (shipment.status !== 'Arrived') {
      throw new BadRequestException(
        `Cannot confirm delivery. Shipment must be in 'Arrived' state, but is currently '${shipment.status}'.`,
      );
    }

    // Security Check: Verify official belongs to destination location
    const official = await this.officialRepository.findOne({ where: { id: userId } });
    if (!official) {
      throw new NotFoundException(`Official with ID ${userId} not found`);
    }

    // Admins can confirm anywhere, but regular officials must be at the destination
    if (official.role !== 'admin' && official.location_id !== shipment.destination_location_id) {
      throw new ConflictException(
        `Official is at location ${official.location_id} but shipment destination is ${shipment.destination_location_id}. Only officials at the destination can confirm delivery.`,
      );
    }

    // Validate Actual Quantities Integrety (Aid Item Keys)
    // Normalize actual quantities keys to lowercase
    const normalizedActualQuantities: Record<string, number> = {};
    for (const [key, value] of Object.entries(actualQuantities)) {
      normalizedActualQuantities[key.toLowerCase()] = value;
    }

    // Validate Actual Quantities Integrety (Aid Item Keys)
    const aidItems = await this.aidItemRepository.find();
    const validItemNames = new Set(aidItems.map(item => item.name.toLowerCase()));

    for (const key of Object.keys(normalizedActualQuantities)) {
      if (!validItemNames.has(key)) {
        this.logger.warn(`Invalid aid item key replaced or ignored: ${key}`);
        // Option 1: Throw error (Strict) - chosen for data integrity
        throw new BadRequestException(`Invalid aid item type: '${key}'. Allowed types: ${Array.from(validItemNames).join(', ')}`);
      }
    }

    // Update shipment status to 'Delivered' (AC: #2) and record actor (Audit)
    shipment.status = 'Delivered';
    shipment.delivered_by_official_id = userId;
    const updatedShipment = await this.shipmentRepository.save(shipment);

    // Save actual quantities and calculate accuracy for the linked Prediction entity (AC: #1, #3, #4)
    if (shipment.prediction) {
      shipment.prediction.actual_quantities = normalizedActualQuantities;
      // Calculate and persist overall accuracy (Story 4.5)
      shipment.prediction.accuracy = this.calculatePredictionAccuracy(
        shipment.prediction.predicted_quantities,
        normalizedActualQuantities,
      );
      await this.predictionRepository.save(shipment.prediction);
      this.logger.log(
        `Actual quantities and accuracy (${shipment.prediction.accuracy}%) saved for prediction ${shipment.prediction.id}`,
      );
    } else {
      this.logger.warn(`Shipment ${shipmentId} has no linked prediction, skipping actual quantities save`);
    }

    // Create tracking log with pending transaction hash
    const trackingLog = this.trackingLogRepository.create({
      shipment_id: shipment.id,
      status: 'Delivered',
      transaction_hash: 'pending',
      timestamp: new Date(),
    });
    const savedTrackingLog = await this.trackingLogRepository.save(trackingLog);

    // Determine location (Delivered uses destination location)
    const locationName =
      shipment.destinationLocation?.name || `location_${shipment.destination_location_id}`;

    // Fire-and-forget blockchain recording (NFR10: non-blocking) (AC: #4)
    this.blockchainService
      .addShipmentLog(shipment.barcode, 'Delivered', locationName)
      .then((txHash) => {
        savedTrackingLog.transaction_hash = txHash;
        this.trackingLogRepository.save(savedTrackingLog);
        this.logger.log(`Blockchain recorded for ${shipment.barcode} delivery: ${txHash}`);
      })
      .catch(async (err) => {
        this.logger.warn(`Blockchain recording failed for ${shipment.barcode}: ${err.message}`);
        savedTrackingLog.transaction_hash = 'failed';
        await this.trackingLogRepository.save(savedTrackingLog);
      });

    return updatedShipment;
  }
}

