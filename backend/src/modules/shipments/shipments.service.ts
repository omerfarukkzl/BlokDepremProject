import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from '../../entities/shipment.entity';
import { ShipmentDetail } from '../../entities/shipment-detail.entity';
import { TrackingLog } from '../../entities/tracking-log.entity';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(ShipmentDetail)
    private readonly shipmentDetailRepository: Repository<ShipmentDetail>,
    @InjectRepository(TrackingLog)
    private readonly trackingLogRepository: Repository<TrackingLog>,
  ) {}

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

    // Create initial tracking log
    const trackingLog = this.trackingLogRepository.create({
      shipment_id: savedShipment.id,
      status: 'Registered',
      transaction_hash: 'placeholder_tx_hash_registered',
      timestamp: new Date(),
    });
    await this.trackingLogRepository.save(trackingLog);

    return savedShipment;
  }

  async updateStatus(updateShipmentStatusDto: UpdateShipmentStatusDto): Promise<Shipment> {
    const { barcode, status } = updateShipmentStatusDto;

    const shipment = await this.shipmentRepository.findOne({ where: { barcode } });

    if (!shipment) {
      throw new NotFoundException(`Shipment with barcode ${barcode} not found`);
    }

    shipment.status = status;
    const updatedShipment = await this.shipmentRepository.save(shipment);

    // Create tracking log for the status update
    const trackingLog = this.trackingLogRepository.create({
      shipment_id: shipment.id,
      status: status,
      transaction_hash: `placeholder_tx_hash_${status.toLowerCase()}`,
      timestamp: new Date(),
    });
    await this.trackingLogRepository.save(trackingLog);

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
