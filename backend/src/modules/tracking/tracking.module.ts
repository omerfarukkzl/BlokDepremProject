import { Module } from '@nestjs/common';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipment } from '../../entities/shipment.entity';
import { TrackingLog } from '../../entities/tracking-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, TrackingLog])],
  controllers: [TrackingController],
  providers: [TrackingService],
})
export class TrackingModule {}
