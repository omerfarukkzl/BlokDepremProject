import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NeedsService } from './needs.service';
import { Need } from '../../entities/need.entity';

describe('NeedsService', () => {
  let service: NeedsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NeedsService,
        {
          provide: getRepositoryToken(Need),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<NeedsService>(NeedsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});