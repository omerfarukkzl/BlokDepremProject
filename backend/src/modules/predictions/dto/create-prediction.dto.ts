import { IsString, IsNumber, IsObject, Min, Max, IsOptional } from 'class-validator';

export class CreatePredictionDto {
    @IsString()
    region_id: string;

    @IsObject()
    predicted_quantities: Record<string, number>;

    @IsNumber()
    @Min(0)
    @Max(1)
    confidence: number;

    @IsOptional()
    @IsString()
    prediction_hash?: string;
}
