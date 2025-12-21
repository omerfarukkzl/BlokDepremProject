import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateNeedDto {
    @IsNumber()
    @IsOptional()
    needed_quantity?: number;

    @IsNumber()
    @IsOptional()
    supplied_quantity?: number;

    @IsString()
    @IsOptional()
    priority?: string;

    @IsString()
    @IsOptional()
    status?: string;

    @IsString()
    @IsOptional()
    description?: string;
}
