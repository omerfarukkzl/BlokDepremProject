import { Controller, Get, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('distribution-suggestions')
  @UseGuards(AuthGuard('jwt'))
  async getDistributionSuggestions() {
    return this.aiService.getDistributionSuggestions();
  }
}
