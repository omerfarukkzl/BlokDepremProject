import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { PredictionsService } from '../predictions/predictions.service';

describe('AiService', () => {
  let service: AiService;
  let httpService: HttpService;
  let predictionsService: PredictionsService;

  const mockPredictionsService = {
    findAll: jest.fn(),
    createPrediction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: PredictionsService,
          useValue: mockPredictionsService,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    httpService = module.get<HttpService>(HttpService);
    predictionsService = module.get<PredictionsService>(PredictionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateAccuracy', () => {
    it('should calculate 100% accuracy when predicted equals actual', () => {
      expect(service.calculateAccuracy(100, 100)).toBe(100);
    });

    it('should calculate correct accuracy for underprediction', () => {
      // Predicted 100, Actual 90 => |100-90|/100 = 10% error => 90% accuracy
      expect(service.calculateAccuracy(100, 90)).toBe(90);
    });

    it('should calculate correct accuracy for overprediction', () => {
      // Predicted 100, Actual 110 => |100-110|/100 = 10% error => 90% accuracy
      expect(service.calculateAccuracy(100, 110)).toBe(90);
    });

    it('should return 0 when error exceeds 100%', () => {
      // Predicted 100, Actual 250 => |100-250|/100 = 150% error => max(0, -50) = 0
      expect(service.calculateAccuracy(100, 250)).toBe(0);
    });

    it('should handle edge case: predicted is 0, actual is 0', () => {
      expect(service.calculateAccuracy(0, 0)).toBe(100);
    });

    it('should handle edge case: predicted is 0, actual is positive', () => {
      expect(service.calculateAccuracy(0, 50)).toBe(0);
    });

    it('should round to 1 decimal place', () => {
      // Predicted 100, Actual 87 => |100-87|/100 = 13% error => 87% accuracy
      expect(service.calculateAccuracy(100, 87)).toBe(87);
      // Predicted 100, Actual 92.5 doesn't work well, test rounding
      // Predicted 150, Actual 140 => |150-140|/150 = 6.666...% error => 93.333...% => 93.3%
      expect(service.calculateAccuracy(150, 140)).toBe(93.3);
    });
  });

  describe('getAccuracyMetrics', () => {
    it('should return zero metrics when no predictions exist', async () => {
      mockPredictionsService.findAll.mockResolvedValue([]);

      const result = await service.getAccuracyMetrics();

      expect(result.totalPredictions).toBe(0);
      expect(result.completedPredictions).toBe(0);
      expect(result.averageAccuracy).toBe(0);
      expect(result.predictedVsActual).toHaveLength(4);
      expect(result.recentPredictions).toHaveLength(0);
    });

    it('should calculate metrics from completed predictions', async () => {
      const mockPredictions = [
        {
          id: 1,
          region_id: 'istanbul',
          predicted_quantities: { tent: 100, container: 50, food_package: 1000, blanket: 500 },
          actual_quantities: { tent: 90, container: 50, food_package: 950, blanket: 480 },
          accuracy: null,
          created_at: new Date('2025-12-28'),
        },
        {
          id: 2,
          region_id: 'ankara',
          predicted_quantities: { tent: 200, container: 100, food_package: 2000, blanket: 1000 },
          actual_quantities: null, // Not completed
          accuracy: null,
          created_at: new Date('2025-12-27'),
        },
      ];

      mockPredictionsService.findAll.mockResolvedValue(mockPredictions);

      const result = await service.getAccuracyMetrics();

      expect(result.totalPredictions).toBe(2);
      expect(result.completedPredictions).toBe(1);
      expect(result.averageAccuracy).toBeGreaterThan(0);
      expect(result.predictedVsActual).toHaveLength(4);
      expect(result.recentPredictions).toHaveLength(1);
      expect(result.recentPredictions[0].regionName).toBe('istanbul');
    });

    it('should handle predictions where some categories are zero', async () => {
      const mockPredictions = [
        {
          id: 1,
          region_id: 'izmir',
          predicted_quantities: { tent: 0, container: 100, food_package: 0, blanket: 200 },
          actual_quantities: { tent: 0, container: 80, food_package: 0, blanket: 190 },
          accuracy: 90,
          created_at: new Date('2025-12-26'),
        },
      ];

      mockPredictionsService.findAll.mockResolvedValue(mockPredictions);

      const result = await service.getAccuracyMetrics();

      expect(result.totalPredictions).toBe(1);
      expect(result.completedPredictions).toBe(1);
      // Only 2 categories have non-zero values (container, blanket)
      expect(result.averageAccuracy).toBeGreaterThan(0);
    });


    it('should filter by region', async () => {
      const mockPredictions = [
        {
          id: 1,
          region_id: 'istanbul',
          predicted_quantities: { tent: 100 },
          actual_quantities: { tent: 100 },
          accuracy: 100,
          created_at: new Date('2025-12-28'),
        },
        {
          id: 2,
          region_id: 'ankara',
          predicted_quantities: { tent: 100 },
          actual_quantities: { tent: 100 },
          accuracy: 100,
          created_at: new Date('2025-12-28'),
        },
      ];
      mockPredictionsService.findAll.mockResolvedValue(mockPredictions);

      const result = await service.getAccuracyMetrics({ regionId: 'istanbul' });

      expect(result.totalPredictions).toBe(2);
      expect(result.completedPredictions).toBe(1);
      expect(result.recentPredictions[0].regionName).toBe('istanbul');
    });

    it('should filter by date range', async () => {
      const mockPredictions = [
        {
          id: 1,
          region_id: 'istanbul',
          predicted_quantities: { tent: 100 },
          actual_quantities: { tent: 100 },
          accuracy: 100,
          created_at: new Date('2025-01-01T10:00:00'),
        },
        {
          id: 2,
          region_id: 'istanbul',
          predicted_quantities: { tent: 100 },
          actual_quantities: { tent: 100 },
          accuracy: 100,
          created_at: new Date('2025-01-05T10:00:00'),
        },
      ];
      mockPredictionsService.findAll.mockResolvedValue(mockPredictions);

      const result = await service.getAccuracyMetrics({
        startDate: '2025-01-04',
        endDate: '2025-01-06'
      });

      expect(result.completedPredictions).toBe(1);
      expect(result.recentPredictions[0].id).toBe('2');
    });

    it('should filter by category', async () => {
      const mockPredictions = [
        {
          id: 1,
          region_id: 'istanbul',
          predicted_quantities: { tent: 100, container: 50 },
          actual_quantities: { tent: 100, container: 40 }, // Tent 100%, Container 80%
          accuracy: null,
          created_at: new Date('2025-12-28'),
        },
      ];
      mockPredictionsService.findAll.mockResolvedValue(mockPredictions);

      // Filter just for 'tent' (100% accuracy)
      const resultTent = await service.getAccuracyMetrics({ category: 'tent' });
      expect(resultTent.averageAccuracy).toBe(100);
      expect(resultTent.predictedVsActual).toHaveLength(1);
      expect(resultTent.predictedVsActual[0].category).toBe('Tent');

      // Filter just for 'container' (80% accuracy)
      const resultContainer = await service.getAccuracyMetrics({ category: 'container' });
      expect(resultContainer.averageAccuracy).toBe(80);
    });
  });

  describe('getPrediction', () => {
    it('should call FastAPI service and return prediction data', async () => {
      // Valid Input
      const validDto = {
        region_id: 'istanbul-id',
        population: 1000,
        collapsed_buildings: 10
      };

      const mockResponse: AxiosResponse = {
        data: { success: true, data: { predictions: {}, confidence: 0.9 } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as any },
      };

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

      const result = await service.getPrediction(validDto as any);
      expect(result).toEqual(mockResponse.data);
      expect(httpService.post).toHaveBeenCalled();
    });

    it('should return fallback mock data when API fails', async () => {
      jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => new Error('API Error')));

      const validDto = { region_id: 'id', population: 100 };

      const result = await service.getPrediction(validDto as any);

      // Service returns fallback mock data for graceful degradation
      expect(result.success).toBe(true);
      expect(result.data.predictions).toBeDefined();
      expect(result.data.confidence).toBe(0.85);
      expect(result.data.region_id).toBe('id');
      expect(result.data.prediction_hash).toContain('mock-fallback-');
    });
  });
});
