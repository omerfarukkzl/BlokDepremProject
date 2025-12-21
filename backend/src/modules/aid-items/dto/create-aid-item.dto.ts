import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAidItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  category?: string;
}
