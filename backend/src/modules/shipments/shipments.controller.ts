import { Controller, Post, Put, Get, Param, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) { }

  @Post('create')
  @HttpCode(HttpStatus.ACCEPTED) // 202: Async blockchain recording in progress
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createShipmentDto: CreateShipmentDto, @Req() req) {
    const userId = req.user.userId;
    return this.shipmentsService.create(createShipmentDto, userId);
  }

  @Put('update-status')
  @HttpCode(HttpStatus.ACCEPTED) // 202: Async blockchain recording in progress
  @UseGuards(AuthGuard('jwt'))
  async updateStatus(@Body() updateShipmentStatusDto: UpdateShipmentStatusDto) {
    return this.shipmentsService.updateStatus(updateShipmentStatusDto);
  }

  @Get('recent')
  @UseGuards(AuthGuard('jwt'))
  async getRecentShipments(@Req() req) {
    const userId = req.user.userId;
    return this.shipmentsService.getRecentShipments(userId);
  }

  @Get(':id/items')
  async getShipmentItems(@Param('id') id: string) {
    return this.shipmentsService.getShipmentItems(parseInt(id));
  }
}
