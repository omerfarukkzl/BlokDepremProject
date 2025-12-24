import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PredictionsService } from './predictions.service';
import { Prediction } from '../../entities/prediction.entity';
import { createHash } from 'crypto';
import { BlockchainService } from '../blockchain/blockchain.service';

describe('PredictionsService', () => {
    let service: PredictionsService;
    let repository: jest.Mocked<Repository<Prediction>>;
    let blockchainService: jest.Mocked<BlockchainService>;

    const mockPrediction: Partial<Prediction> = {
        id: 1,
        region_id: 'istanbul',
        predicted_quantities: { tent: 100, blanket: 500, food_package: 200 },
        confidence: 0.85,
        prediction_hash: 'abc123hash',
        created_by_official_id: 1,
        created_at: new Date(),
        actual_quantities: null,
        blockchain_tx_hash: null,
        accuracy: null,
        shipment_id: null,
    };

    beforeEach(async () => {
        const mockRepository = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
        };

        const mockBlockchainService = {
            addPredictionHash: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PredictionsService,
                {
                    provide: getRepositoryToken(Prediction),
                    useValue: mockRepository,
                },
                {
                    provide: BlockchainService,
                    useValue: mockBlockchainService,
                },
            ],
        }).compile();

        service = module.get<PredictionsService>(PredictionsService);
        repository = module.get(getRepositoryToken(Prediction));
        blockchainService = module.get(BlockchainService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createPrediction', () => {
        it('should create a prediction with provided hash', async () => {
            const regionId = 'istanbul';
            const predictedQuantities = { tent: 100, blanket: 500 };
            const confidence = 0.85;
            const officialId = 1;
            const predictionHash = 'provided-hash-123';
            const expectedSavedEntity = { ...mockPrediction, prediction_hash: predictionHash };

            repository.create.mockReturnValue(expectedSavedEntity as Prediction);
            repository.save.mockResolvedValue(expectedSavedEntity as Prediction);
            blockchainService.addPredictionHash.mockResolvedValue('0xmocktransactionhash');

            const result = await service.createPrediction(
                regionId,
                predictedQuantities,
                confidence,
                officialId,
                predictionHash,
            );

            expect(repository.create).toHaveBeenCalledWith({
                region_id: regionId,
                predicted_quantities: predictedQuantities,
                confidence,
                prediction_hash: predictionHash,
                created_by_official_id: officialId,
            });
            expect(repository.save).toHaveBeenCalled();
            // result matches expectedSavedEntity (ignoring side-effect mutation timing for robustness)
            expect(result).toMatchObject({
                ...expectedSavedEntity,
                // If the async operation runs fast enough, this might be set, or null.
                // We mainly care that it returns the entity we saved.
                prediction_hash: predictionHash,
            });

            // Verify async blockchain call - need to wait a tick since it's fire-and-forget
            await new Promise(resolve => setTimeout(resolve, 0));
            expect(blockchainService.addPredictionHash).toHaveBeenCalledWith(regionId, predictionHash);
        });

        it('should generate hash when not provided', async () => {
            const regionId = 'izmir';
            const predictedQuantities = { tent: 50, food_package: 100 };
            const confidence = 0.9;
            const officialId = 2;

            repository.create.mockImplementation((entity) => entity as Prediction);
            repository.save.mockImplementation((entity) =>
                Promise.resolve({ ...entity, id: 1, created_at: new Date() } as Prediction)
            );

            const result = await service.createPrediction(
                regionId,
                predictedQuantities,
                confidence,
                officialId,
            );

            expect(repository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    region_id: regionId,
                    predicted_quantities: predictedQuantities,
                    confidence,
                    created_by_official_id: officialId,
                    prediction_hash: expect.any(String),
                })
            );
            expect(result.prediction_hash).toBeDefined();
            expect(result.prediction_hash).toHaveLength(64); // SHA-256 hex length
        });

        it('should log error but not fail when blockchain recording fails', async () => {
            const regionId = 'ankara';
            const predictedQuantities = { tent: 50 };

            repository.create.mockReturnValue(mockPrediction as Prediction);
            repository.save.mockResolvedValue(mockPrediction as Prediction);
            blockchainService.addPredictionHash.mockRejectedValue(new Error('Blockchain unavailable'));

            await expect(service.createPrediction(
                regionId,
                predictedQuantities,
                0.9,
                1
            )).resolves.not.toThrow();

            // Verify error was handled gracefully (test passes if no exception thrown)
            expect(repository.save).toHaveBeenCalled();
        });
    });

    describe('generateHash', () => {
        it('should generate deterministic SHA-256 hash', () => {
            const predictions = { tent: 100, blanket: 500 };
            const regionId = 'istanbul';

            const hash1 = service.generateHash(predictions, regionId);
            const hash2 = service.generateHash(predictions, regionId);

            expect(hash1).toEqual(hash2);
            expect(hash1).toHaveLength(64); // SHA-256 hex is 64 chars
        });

        it('should sort keys for consistent hash', () => {
            const predictions1 = { blanket: 500, tent: 100 };
            const predictions2 = { tent: 100, blanket: 500 };
            const regionId = 'istanbul';

            const hash1 = service.generateHash(predictions1, regionId);
            const hash2 = service.generateHash(predictions2, regionId);

            // Different key order should still produce same hash due to sorting
            expect(hash1).toEqual(hash2);
        });

        it('should match Python json.dumps(sort_keys=True) format', () => {
            const predictions = { blanket: 500, tent: 100 };
            const regionId = 'istanbul';

            // Expected format: {"predictions": {...sorted...}, "region_id": "..."}
            // Sorted: predictions first, then region_id alphabetically
            const expectedData = { predictions: { blanket: 500, tent: 100 }, region_id: regionId };
            const expectedJson = JSON.stringify(expectedData);
            const expectedHash = createHash('sha256').update(expectedJson).digest('hex');

            const generatedHash = service.generateHash(predictions, regionId);

            expect(generatedHash).toEqual(expectedHash);
        });

        it('should produce different hashes for different data', () => {
            const predictions1 = { tent: 100 };
            const predictions2 = { tent: 200 };
            const regionId = 'istanbul';

            const hash1 = service.generateHash(predictions1, regionId);
            const hash2 = service.generateHash(predictions2, regionId);

            expect(hash1).not.toEqual(hash2);
        });
    });

    describe('findById', () => {
        it('should find a prediction by id', async () => {
            repository.findOne.mockResolvedValue(mockPrediction as Prediction);

            const result = await service.findById(1);

            expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(result).toEqual(mockPrediction);
        });

        it('should return null when prediction not found', async () => {
            repository.findOne.mockResolvedValue(null);

            const result = await service.findById(999);

            expect(result).toBeNull();
        });
    });

    describe('findAll', () => {
        it('should return all predictions ordered by created_at DESC', async () => {
            const mockPredictions = [mockPrediction, { ...mockPrediction, id: 2 }];
            repository.find.mockResolvedValue(mockPredictions as Prediction[]);

            const result = await service.findAll();

            expect(repository.find).toHaveBeenCalledWith({
                order: { created_at: 'DESC' },
            });
            expect(result).toEqual(mockPredictions);
        });
    });
});
