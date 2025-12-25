import { Module } from '@nestjs/common';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipment } from '../../entities/shipment.entity';
import { ShipmentDetail } from '../../entities/shipment-detail.entity';
import { TrackingLog } from '../../entities/tracking-log.entity';
import { Prediction } from '../../entities/prediction.entity';
import { AidItem } from '../../entities/aid-item.entity';
import { Official } from '../../entities/official.entity';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, ShipmentDetail, TrackingLog, Prediction, AidItem, Official]), BlockchainModule],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
})
export class ShipmentsModule { }
