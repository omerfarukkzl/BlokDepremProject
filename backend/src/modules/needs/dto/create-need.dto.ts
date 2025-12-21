import { IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateNeedDto {
  @IsNumber()
  @IsNotEmpty()
  location_id: number;

  @IsNumber()
  @IsNotEmpty()
  item_id: number;

  @IsNumber()
  @IsNotEmpty()
  needed_quantity: number;

  @IsNumber()
  @IsOptional()
  priority?: number;
}
