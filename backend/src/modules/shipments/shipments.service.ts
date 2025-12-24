import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from '../../entities/shipment.entity';
import { ShipmentDetail } from '../../entities/shipment-detail.entity';
import { TrackingLog } from '../../entities/tracking-log.entity';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
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
    private readonly blockchainService: BlockchainService,
  ) { }

  async create(createShipmentDto: CreateShipmentDto, userId: number): Promise<Shipment> {
    const { source_location_id, destination_location_id, items } = createShipmentDto;

    // Generate a unique barcode (simple implementation)
    const barcode = `SHIP-${Date.now()}`;

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
      .catch(err => {
        this.logger.warn(`Blockchain recording failed for ${barcode}: ${err.message}`);
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

    shipment.status = status;
    const updatedShipment = await this.shipmentRepository.save(shipment);

    // Determine location: use destination for Delivered, source for InTransit
    // Use actual location names from loaded relations
    const location =
      status === 'Delivered'
        ? shipment.destinationLocation?.name || `location_${shipment.destination_location_id}`
        : shipment.sourceLocation?.name || `location_${shipment.source_location_id}`;

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
      .addShipmentLog(barcode, status, location)
      .then(txHash => {
        savedTrackingLog.transaction_hash = txHash;
        this.trackingLogRepository.save(savedTrackingLog);
        this.logger.log(`Blockchain recorded for ${barcode} status ${status}: ${txHash}`);
      })
      .catch(err => {
        this.logger.warn(`Blockchain recording failed for ${barcode}: ${err.message}`);
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
}
