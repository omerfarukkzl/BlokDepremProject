import { Controller, Post, Put, Get, Param, Body, UseGuards, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { CreateShipmentFromPredictionDto } from './dto/create-shipment-from-prediction.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { ConfirmDeliveryDto } from './dto/confirm-delivery.dto';
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

  @Post('from-prediction')
  @HttpCode(HttpStatus.ACCEPTED) // 202: Async blockchain recording in progress
  @UseGuards(AuthGuard('jwt'))
  async createFromPrediction(@Body() dto: CreateShipmentFromPredictionDto, @Req() req) {
    const userId = req.user.userId;
    return this.shipmentsService.createFromPrediction(dto, userId);
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

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getShipmentById(@Param('id') id: string) {
    return this.shipmentsService.getShipmentById(parseInt(id));
  }

  @Get(':id/items')
  async getShipmentItems(@Param('id') id: string) {
    return this.shipmentsService.getShipmentItems(parseInt(id));
  }

  @Get(':id/barcode')
  async getShipmentBarcode(@Param('id') id: string, @Res() res: Response) {
    const imageBuffer = await this.shipmentsService.getShipmentBarcodeImage(parseInt(id));
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="barcode-${id}.png"`);
    res.send(imageBuffer);
  }

  @Post(':id/delivery')
  @HttpCode(HttpStatus.ACCEPTED) // 202: Async blockchain recording in progress
  @UseGuards(AuthGuard('jwt'))
  async confirmDelivery(
    @Param('id') id: string,
    @Body() confirmDeliveryDto: ConfirmDeliveryDto,
    @Req() req,
  ) {
    const userId = req.user.userId;
    return this.shipmentsService.confirmDelivery(
      parseInt(id),
      confirmDeliveryDto.actual_quantities,
      userId,
    );
  }
}
