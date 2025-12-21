import { Module } from '@nestjs/common';
import { AidItemsController } from './aid-items.controller';
import { AidItemsService } from './aid-items.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AidItem } from '../../entities/aid-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AidItem])],
  controllers: [AidItemsController],
  providers: [AidItemsService],
})
export class AidItemsModule {}
