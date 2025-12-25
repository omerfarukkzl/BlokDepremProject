import { IsNumber, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateShipmentFromPredictionDto {
    @IsNumber()
    @IsNotEmpty()
    prediction_id: number;

    @IsNumber()
    @IsNotEmpty()
    source_location_id: number;

    @IsNumber()
    @IsNotEmpty()
    destination_location_id: number;

    @IsOptional()
    @IsObject()
    adjusted_quantities?: Record<string, number>;
}
