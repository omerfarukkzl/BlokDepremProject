import { Controller, Get, Post, Body, UseGuards, Request, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '@nestjs/passport';
import { PredictionDto } from './dto/prediction.dto';
import { PredictionsService } from '../predictions/predictions.service';


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
        req.user.id, // Official ID from JWT
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
}
