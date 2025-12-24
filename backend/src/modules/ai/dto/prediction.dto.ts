import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PredictionDto {
    @IsString()
    region_id: string;

    @IsNumber()
    @IsOptional()
    collapsed_buildings?: number;

    @IsNumber()
    @IsOptional()
    urgent_demolition?: number;

    @IsNumber()
    @IsOptional()
    severely_damaged?: number;

    @IsNumber()
    @IsOptional()
    moderately_damaged?: number;

    @IsNumber()
    @IsOptional()
    population?: number;

    @IsNumber()
    @IsOptional()
    population_change?: number;

    @IsNumber()
    @IsOptional()
    max_magnitude?: number;

    @IsNumber()
    @IsOptional()
    earthquake_count?: number;

    @IsNumber()
    @IsOptional()
    damage_ratio?: number;
}

export class PredictionResponseDto {
    success: boolean;
    data: {
        predictions: {
            tent: number;
            container: number;
            food_package: number;
            blanket: number;
        };
        confidence: number;
        prediction_hash: string;
        region_id: string;
    };
}
