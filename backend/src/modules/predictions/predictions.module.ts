import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prediction } from '../../entities/prediction.entity';
import { PredictionsService } from './predictions.service';
import { PredictionsController } from './predictions.controller';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Prediction]),
        BlockchainModule,
    ],
    providers: [PredictionsService],
    controllers: [PredictionsController],
    exports: [PredictionsService], // Export for AiModule injection
})
export class PredictionsModule { }
