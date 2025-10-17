// 🐾🔐 NEKO DEFENSE - JWT Strategy 🔐🐾
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'neko-ultra-secret-key',
    });
    console.log('🔐 [JwtStrategy] JWT authentication strategy initialized, nyaa~!');
  }

  /**
   * 🔓 Validate JWT payload
   * Called automatically by Passport after token verification
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload || !payload.username) {
      throw new UnauthorizedException('Invalid token payload, desu~! 🐾');
    }

    console.log(`✅ [JwtStrategy] Token validated for user: ${payload.username} | Language: ${payload.language || 'en'}`);

    // Return payload - this will be attached to request object
    return {
      username: payload.username,
      role: payload.role,
      language: payload.language || 'en', // 🌍 Include language preference, nyaa~!
    };
  }
}
