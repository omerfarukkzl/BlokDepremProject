import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { OfficialRole } from '../../entities/official.entity';

export interface JwtPayload {
  sub: number;
  walletAddress: string;
  role: OfficialRole;
  iat?: number;
  exp?: number;
}

export interface ValidatedUser {
  userId: number;
  walletAddress: string;
  role: OfficialRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'dev-secret-key-change-in-production',
    });
  }

  async validate(payload: JwtPayload): Promise<ValidatedUser> {
    return {
      userId: payload.sub,
      walletAddress: payload.walletAddress,
      role: payload.role,
    };
  }
}

