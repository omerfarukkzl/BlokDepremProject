import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([])],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule { }
