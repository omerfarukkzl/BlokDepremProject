import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { PredictionsService } from '../predictions/predictions.service';

describe('AiController', () => {
  let controller: AiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: {
            getDistributionSuggestions: jest.fn(),
            getPrediction: jest.fn(),
          },
        },
        {
          provide: PredictionsService,
          useValue: {
            createPrediction: jest.fn().mockResolvedValue({ id: 1 }),
            findAll: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});