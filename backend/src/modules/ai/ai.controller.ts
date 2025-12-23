import { Controller, Get, Post, Body, UseGuards, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '@nestjs/passport';
import { PredictionDto } from './dto/prediction.dto';


@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) { }

  @Get('distribution-suggestions')
  @UseGuards(AuthGuard('jwt'))
  async getDistributionSuggestions() {
    return this.aiService.getDistributionSuggestions();
  }

  @Post('predict')
  @UseGuards(AuthGuard('jwt'))
  async getPrediction(@Body() predictionDto: PredictionDto): Promise<any> {
    const result = await this.aiService.getPrediction(predictionDto);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }
}
