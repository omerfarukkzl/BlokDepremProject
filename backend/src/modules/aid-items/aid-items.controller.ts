import { Controller, Get, Post, Body } from '@nestjs/common';
import { AidItemsService } from './aid-items.service';
import { CreateAidItemDto } from './dto/create-aid-item.dto';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

@Controller('aid-items')
export class AidItemsController {
  constructor(private readonly aidItemsService: AidItemsService) { }

  @Post()
  async create(@Body() createAidItemDto: CreateAidItemDto): Promise<ApiResponse<any>> {
    try {
      const data = await this.aidItemsService.create(createAidItemDto);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get()
  async findAll(): Promise<ApiResponse<any>> {
    try {
      const data = await this.aidItemsService.findAll();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
