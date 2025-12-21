import { Test, TestingModule } from '@nestjs/testing';
import { AidItemsController } from './aid-items.controller';
import { AidItemsService } from './aid-items.service';

describe('AidItemsController', () => {
  let controller: AidItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AidItemsController],
      providers: [
        {
          provide: AidItemsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AidItemsController>(AidItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});