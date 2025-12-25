import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';
import { TrackingLog } from '../../entities/tracking-log.entity';
import { Shipment } from '../../entities/shipment.entity';

@Module({
    imports: [ConfigModule, TypeOrmModule.forFeature([TrackingLog, Shipment])],
    controllers: [BlockchainController],
    providers: [BlockchainService],
    exports: [BlockchainService],
})
export class BlockchainModule { }

