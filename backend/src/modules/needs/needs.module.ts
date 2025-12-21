import { Module } from '@nestjs/common';
import { NeedsController } from './needs.controller';
import { NeedsService } from './needs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Need } from '../../entities/need.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Need])],
  controllers: [NeedsController],
  providers: [NeedsService],
})
export class NeedsModule {}
