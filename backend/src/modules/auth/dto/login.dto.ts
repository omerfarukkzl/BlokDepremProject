import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class LoginDto {
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
}
