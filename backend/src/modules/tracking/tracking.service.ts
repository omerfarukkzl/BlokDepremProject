import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from '../../entities/shipment.entity';
import { TrackingLog } from '../../entities/tracking-log.entity';

interface TrackingLogResponse {
  id: number;
  shipment_id: number;
  status: string;
  transaction_hash: string;
  timestamp: Date;
  is_on_blockchain: boolean;
  blockchain_tx_hash: string | null;
}

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(TrackingLog)
    private readonly trackingLogRepository: Repository<TrackingLog>,
  ) { }

  async trackByBarcode(barcode: string): Promise<{ shipment: Shipment; history: TrackingLogResponse[] }> {
    const shipment = await this.shipmentRepository.findOne({
      where: { barcode },
      relations: ['sourceLocation', 'destinationLocation', 'official'],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with barcode ${barcode} not found`);
    }

    const trackingLogs = await this.trackingLogRepository.find({
      where: { shipment_id: shipment.id },
      order: { timestamp: 'DESC' },
    });

    // Transform tracking logs to include computed blockchain fields
    // TypeScript getters don't serialize to JSON automatically
    const history: TrackingLogResponse[] = trackingLogs.map(log => ({
      id: log.id,
      shipment_id: log.shipment_id,
      status: log.status,
      transaction_hash: log.transaction_hash,
      timestamp: log.timestamp,
      is_on_blockchain: log.is_on_blockchain,
      blockchain_tx_hash: log.blockchain_tx_hash,
    }));

    return { shipment, history };
  }
}
