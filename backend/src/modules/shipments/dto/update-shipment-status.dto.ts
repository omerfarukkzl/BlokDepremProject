import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class UpdateShipmentStatusDto {
  @IsString()
  @IsNotEmpty()
  barcode: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['Departed', 'Arrived', 'Delivered'])
  status: string;
}
