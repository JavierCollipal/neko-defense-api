// 🐾🔐 NEKO DEFENSE - Authentication Service 🔐🐾
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export interface JwtPayload {
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  access_token: string;
  user: {
    username: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  // 🔐 In production, store users in MongoDB with hashed passwords!
  // For now, using environment variables for simplicity, nyaa~
  private readonly adminUsername = process.env.ADMIN_USERNAME || 'wakibaka';
  private readonly adminPasswordHash: string;

  constructor(private jwtService: JwtService) {
    // Hash the admin password on startup, desu~
    const adminPassword = process.env.ADMIN_PASSWORD || 'change-me';
    this.adminPasswordHash = bcrypt.hashSync(adminPassword, 10);
    console.log('🔐 [AuthService] Admin credentials configured, nyaa~');
  }

  /**
   * 🎯 Validate user credentials
   * @param username - Username to validate
   * @param password - Plain text password
   * @returns User object if valid, null otherwise
   */
  async validateUser(username: string, password: string): Promise<any> {
    console.log(`🔍 [AuthService] Validating user: ${username}`);

    // Check if admin user
    if (username === this.adminUsername) {
      const isValidPassword = await bcrypt.compare(password, this.adminPasswordHash);

      if (isValidPassword) {
        console.log(`✅ [AuthService] Admin login successful: ${username}`);
        return {
          username: this.adminUsername,
          role: 'admin',
        };
      }
    }

    console.log(`❌ [AuthService] Invalid credentials for: ${username}`);
    return null;
  }

  /**
   * 🎫 Generate JWT token for authenticated user
   * @param username - Username
   * @param password - Plain text password
   * @returns JWT access token and user info
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    console.log(`🎫 [AuthService] Login attempt: ${username}`);

    const user = await this.validateUser(username, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials, nyaa~! 🐾');
    }

    const payload: JwtPayload = {
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    console.log(`✅ [AuthService] JWT token generated for: ${username}`);

    return {
      access_token: accessToken,
      user: {
        username: user.username,
        role: user.role,
      },
    };
  }

  /**
   * 🔓 Verify JWT token
   * @param token - JWT token to verify
   * @returns Decoded payload if valid
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      console.log(`✅ [AuthService] Token verified for: ${payload.username}`);
      return payload;
    } catch (error) {
      console.log(`❌ [AuthService] Invalid token: ${error.message}`);
      throw new UnauthorizedException('Invalid token, desu~! 🐾');
    }
  }
}
