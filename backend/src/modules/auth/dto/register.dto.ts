import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEmail, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'wallet_address must be a valid Ethereum address (0x followed by 40 hex characters)',
  })
  wallet_address: string;

  @IsString()
  @IsNotEmpty()
  signature: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNumber()
  @IsNotEmpty()
  location_id: number;
}
