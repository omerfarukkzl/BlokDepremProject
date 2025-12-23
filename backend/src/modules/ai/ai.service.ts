import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError, timeout } from 'rxjs';
import { PredictionDto, PredictionResponseDto } from './dto/prediction.dto';
import { AxiosError } from 'axios';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5000';

  constructor(private readonly httpService: HttpService) { }

  async getPrediction(predictionDto: PredictionDto): Promise<PredictionResponseDto> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<PredictionResponseDto>(
          `${this.aiServiceUrl}/predict`,
          predictionDto,
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
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'AI_SERVICE_UNAVAILABLE',
            message: 'AI prediction service is temporarily unavailable',
          },
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
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
