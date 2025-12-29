import { IsOptional, IsDateString, IsString, IsIn } from 'class-validator';

/**
 * DTO for filtering reports/stats by date range, region, and aid category.
 * Used as query parameters for GET /ai/reports/stats endpoint.
 */
export class GetReportsStatsDto {
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsString()
    regionId?: string;

    @IsOptional()
    @IsString()
    @IsIn(['tent', 'container', 'food_package', 'blanket'])
    category?: 'tent' | 'container' | 'food_package' | 'blanket';
}
