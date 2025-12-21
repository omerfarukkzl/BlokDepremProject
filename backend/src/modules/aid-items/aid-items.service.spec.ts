import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AidItemsService } from './aid-items.service';
import { AidItem } from '../../entities/aid-item.entity';

describe('AidItemsService', () => {
  let service: AidItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AidItemsService,
        {
          provide: getRepositoryToken(AidItem),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AidItemsService>(AidItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});