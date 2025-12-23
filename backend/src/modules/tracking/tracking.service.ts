import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from '../../entities/shipment.entity';
import { TrackingLog } from '../../entities/tracking-log.entity';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(TrackingLog)
    private readonly trackingLogRepository: Repository<TrackingLog>,
  ) { }

  async trackByBarcode(barcode: string): Promise<{ shipment: Shipment; history: TrackingLog[] }> {
    const shipment = await this.shipmentRepository.findOne({
      where: { barcode },
      relations: ['sourceLocation', 'destinationLocation', 'official'],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with barcode ${barcode} not found`);
    }

    const history = await this.trackingLogRepository.find({
      where: { shipment_id: shipment.id },
      order: { timestamp: 'DESC' },
    });

    return { shipment, history };
  }
}
