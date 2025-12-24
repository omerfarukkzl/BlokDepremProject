import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prediction } from '../../entities/prediction.entity';
import { PredictionsService } from './predictions.service';
import { PredictionsController } from './predictions.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Prediction])],
    providers: [PredictionsService],
    controllers: [PredictionsController],
    exports: [PredictionsService], // Export for AiModule injection
})
export class PredictionsModule { }
