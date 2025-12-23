import { Controller, Get, Param, BadRequestException } from '@nestjs/common';
import { TrackingService } from './tracking.service';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  timestamp: string;
}

@Controller('track') // Matches the README: /track/:barcode - PUBLIC endpoint (no auth guard)
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) { }

  @Get(':barcode')
  async trackByBarcode(@Param('barcode') barcode: string): Promise<ApiResponse<any>> {
    // Validate barcode format (8-50 chars, alphanumeric with dashes/underscores)
    if (!barcode || barcode.length < 8 || barcode.length > 50) {
      throw new BadRequestException('Barcode must be between 8 and 50 characters');
    }
    if (!/^[A-Za-z0-9\-_]+$/.test(barcode)) {
      throw new BadRequestException('Barcode contains invalid characters');
    }

    // Let exceptions propagate naturally - NestJS handles NotFoundException as 404
    const data = await this.trackingService.trackByBarcode(barcode);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
