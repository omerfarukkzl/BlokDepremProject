import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AidItem } from '../../entities/aid-item.entity';
import { CreateAidItemDto } from './dto/create-aid-item.dto';

@Injectable()
export class AidItemsService {
  constructor(
    @InjectRepository(AidItem)
    private readonly aidItemRepository: Repository<AidItem>,
  ) {}

  async create(createAidItemDto: CreateAidItemDto): Promise<AidItem> {
    const aidItem = this.aidItemRepository.create(createAidItemDto);
    return this.aidItemRepository.save(aidItem);
  }

  async findAll(): Promise<AidItem[]> {
    return this.aidItemRepository.find();
  }
}
