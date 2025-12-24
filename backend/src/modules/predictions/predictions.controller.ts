import { Controller, Get, Param, ParseIntPipe, UseGuards, NotFoundException } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('predictions')
export class PredictionsController {
    constructor(private readonly predictionsService: PredictionsService) { }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    async findAll() {
        return this.predictionsService.findAll();
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const prediction = await this.predictionsService.findById(id);
        if (!prediction) {
            throw new NotFoundException(`Prediction with ID ${id} not found`);
        }
        return prediction;
    }
}
