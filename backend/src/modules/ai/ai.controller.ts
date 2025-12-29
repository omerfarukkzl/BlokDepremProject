import { Controller, Get, Post, Body, UseGuards, Request, HttpException, HttpStatus, Logger, Query } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '@nestjs/passport';
import { PredictionDto } from './dto/prediction.dto';
import { GetReportsStatsDto } from './dto/get-reports-stats.dto';
import { PredictionsService } from '../predictions/predictions.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { OfficialRole } from '../../entities/official.entity';


@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(
    private readonly aiService: AiService,
    private readonly predictionsService: PredictionsService,
  ) { }

  @Get('distribution-suggestions')
  @UseGuards(AuthGuard('jwt'))
  async getDistributionSuggestions() {
    return this.aiService.getDistributionSuggestions();
  }

  @Post('predict')
  @UseGuards(AuthGuard('jwt'))
  async getPrediction(
    @Body() predictionDto: PredictionDto,
    @Request() req: any,
  ): Promise<any> {
    try {
      const response = await this.aiService.getPrediction(predictionDto);

      // Persist prediction with hash to database
      const prediction = await this.predictionsService.createPrediction(
        predictionDto.region_id,
        response.data.predictions,
        response.data.confidence,
        req.user.userId, // Official ID from JWT (userId from JwtStrategy.validate)
        response.data.prediction_hash,
      );

      return {
        ...response,
        predictionId: prediction.id,
      };
    } catch (error) {
      this.logger.error(`Failed to create prediction: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to process prediction request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Admin Reports Dashboard Statistics (Story 6.1 + 6.2 + 6.3)
   * Returns real accuracy metrics from completed predictions.
   * Supports filtering by date range, region, and category.
   */
  @Get('reports/stats')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(OfficialRole.ADMIN)
  async getReportsStats(@Query() filterDto: GetReportsStatsDto): Promise<any> {
    const metrics = await this.aiService.getAccuracyMetrics(filterDto);
    return {
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    };
  }
}
