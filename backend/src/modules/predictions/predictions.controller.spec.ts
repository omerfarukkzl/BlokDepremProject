import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { Prediction } from '../../entities/prediction.entity';

describe('PredictionsController', () => {
    let controller: PredictionsController;
    let service: jest.Mocked<PredictionsService>;

    const mockPrediction: Partial<Prediction> = {
        id: 1,
        region_id: 'istanbul',
        predicted_quantities: { tent: 100, blanket: 500 },
        confidence: 0.85,
        prediction_hash: 'abc123hash',
        created_by_official_id: 1,
        created_at: new Date(),
    };

    beforeEach(async () => {
        const mockPredictionsService = {
            findAll: jest.fn(),
            findById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PredictionsController],
            providers: [
                {
                    provide: PredictionsService,
                    useValue: mockPredictionsService,
                },
            ],
        }).compile();

        controller = module.get<PredictionsController>(PredictionsController);
        service = module.get(PredictionsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return array of predictions', async () => {
            const mockPredictions = [mockPrediction];
            service.findAll.mockResolvedValue(mockPredictions as Prediction[]);

            const result = await controller.findAll();

            expect(service.findAll).toHaveBeenCalled();
            expect(result).toEqual(mockPredictions);
        });
    });

    describe('findOne', () => {
        it('should return a prediction by id', async () => {
            service.findById.mockResolvedValue(mockPrediction as Prediction);

            const result = await controller.findOne(1);

            expect(service.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockPrediction);
        });

        it('should throw NotFoundException for non-existent prediction', async () => {
            service.findById.mockResolvedValue(null);

            await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });
});
