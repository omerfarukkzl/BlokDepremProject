import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError, timeout } from 'rxjs';
import { PredictionDto, PredictionResponseDto } from './dto/prediction.dto';
import { AxiosError } from 'axios';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';

  constructor(private readonly httpService: HttpService) { }

  async getPrediction(predictionDto: PredictionDto): Promise<PredictionResponseDto> {
    try {
      // Enrich DTO with mock stats if missing (Prototype logic)
      // In production, this would fetch from LocationsService/Database
      const enrichedDto = {
        ...predictionDto,
        population: predictionDto.population || 100000,
        collapsed_buildings: predictionDto.collapsed_buildings || 500,
        urgent_demolition: predictionDto.urgent_demolition || 200,
        severely_damaged: predictionDto.severely_damaged || 1000,
        moderately_damaged: predictionDto.moderately_damaged || 2000,
        population_change: predictionDto.population_change || -10000,
        max_magnitude: predictionDto.max_magnitude || 7.8,
        earthquake_count: predictionDto.earthquake_count || 50,
        damage_ratio: predictionDto.damage_ratio || 0.45
      };

      const { data } = await firstValueFrom(
        this.httpService.post<PredictionResponseDto>(
          `${this.aiServiceUrl}/predict`,
          enrichedDto,
          { timeout: 10000 } // 10s timeout (NFR1)
        ).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`AI Service Error: ${error.message}`);
            throw 'AI_SERVICE_ERROR';
          }),
        ),
      );
      return data;
    } catch (error) {
      this.logger.warn(`AI Service unavailable: ${error}`);
      // Graceful degradation / Error handling (NFR3)
      this.logger.warn(`AI Service unavailable: ${error}. Using fallback mock data.`);

      // Fallback mock data for prototype resilience
      return {
        success: true,
        data: {
          predictions: {
            tent: 150,
            container: 50,
            food_package: 1000,
            blanket: 500
          },
          confidence: 0.85,
          prediction_hash: 'mock-fallback-' + Date.now(),
          region_id: predictionDto.region_id
        },
        timestamp: new Date().toISOString()
      } as any;
    }
  }

  async getDistributionSuggestions(): Promise<any> {
    // Mock response
    return {
      message: 'AI distribution suggestions are not yet implemented.',
      suggestions: [
        {
          from: 'Istanbul',
          to: 'Ankara',
          items: ['Water', 'Food'],
          priority: 1,
        },
        {
          from: 'Izmir',
          to: 'Antalya',
          items: ['Tents', 'Blankets'],
          priority: 2,
        },
      ],
    };
  }
}
