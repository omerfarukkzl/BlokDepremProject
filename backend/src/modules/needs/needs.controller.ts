import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { NeedsService } from './needs.service';
import type { PaginationParams, PaginatedResponse, NeedsStats } from './needs.service';
import { CreateNeedDto } from './dto/create-need.dto';
import { UpdateNeedDto } from './dto/update-need.dto';
import { AuthGuard } from '@nestjs/passport';
import { Need } from '../../entities/need.entity';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

@Controller('needs')
export class NeedsController {
  constructor(private readonly needsService: NeedsService) { }

  @Get()
  async findAll(@Query() query: PaginationParams): Promise<PaginatedResponse<Need>> {
    return this.needsService.findAll(query);
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  async getStats(): Promise<ApiResponse<NeedsStats>> {
    try {
      const data = await this.needsService.getStats();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get(':location_id')
  async findByLocation(@Param('location_id') locationId: string): Promise<ApiResponse<Need[]>> {
    try {
      const data = await this.needsService.findByLocation(parseInt(locationId));
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createNeedDto: CreateNeedDto): Promise<ApiResponse<Need>> {
    try {
      const data = await this.needsService.create(createNeedDto);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body() updateNeedDto: UpdateNeedDto
  ): Promise<ApiResponse<Need>> {
    try {
      const data = await this.needsService.update(parseInt(id), updateNeedDto);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string): Promise<ApiResponse<void>> {
    try {
      await this.needsService.remove(parseInt(id));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
