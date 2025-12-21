import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackingService } from './tracking.service';
import { Shipment } from '../../entities/shipment.entity';
import { TrackingLog } from '../../entities/tracking-log.entity';

describe('TrackingService', () => {
  let service: TrackingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackingService,
        {
          provide: getRepositoryToken(Shipment),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(TrackingLog),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<TrackingService>(TrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});