import { Controller, Get, Post, Body } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) { }

  @Post()
  async create(@Body() createLocationDto: CreateLocationDto): Promise<ApiResponse<any>> {
    try {
      const data = await this.locationsService.create(createLocationDto);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get()
  async findAll(): Promise<ApiResponse<any>> {
    try {
      const data = await this.locationsService.findAll();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
