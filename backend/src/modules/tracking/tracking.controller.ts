import { Controller, Get, Param } from '@nestjs/common';
import { TrackingService } from './tracking.service';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

@Controller('track') // Matches the README: /track/:barcode
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) { }

  @Get(':barcode')
  async trackByBarcode(@Param('barcode') barcode: string): Promise<ApiResponse<any>> {
    try {
      const data = await this.trackingService.trackByBarcode(barcode);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
