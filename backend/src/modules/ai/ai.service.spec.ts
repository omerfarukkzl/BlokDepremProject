import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpException } from '@nestjs/common';

describe('AiService', () => {
  let service: AiService;
  let httpService: HttpService;

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
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
