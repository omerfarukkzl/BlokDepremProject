import { IsNumber, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShipmentItemDto {
  @IsNumber()
  @IsNotEmpty()
  item_id: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class CreateShipmentDto {
  @IsNumber()
  @IsNotEmpty()
  source_location_id: number;

  @IsNumber()
  @IsNotEmpty()
  destination_location_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateShipmentItemDto)
  items: CreateShipmentItemDto[];
}
