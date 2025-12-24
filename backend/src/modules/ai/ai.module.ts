import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { HttpModule } from '@nestjs/axios';
import { PredictionsModule } from '../predictions/predictions.module';

@Module({
  imports: [HttpModule, PredictionsModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule { }
