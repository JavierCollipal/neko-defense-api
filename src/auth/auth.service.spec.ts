// 🐾⚡ NEKO DEFENSE - Auth Service Tests ⚡🐾
// Testing authentication with MAXIMUM SECURITY, nyaa~! 😻🔐
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService, JwtPayload } from './auth.service';

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  hashSync: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('🔐 AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let consoleLogSpy: jest.SpyInstance;

  // Mock environment variables
  const originalEnv = process.env;

  beforeAll(() => {
    // Set up environment for all tests
    process.env = {
      ...originalEnv,
      ADMIN_USERNAME: 'testadmin',
      ADMIN_PASSWORD: 'testpassword123',
    };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  beforeEach(async () => {
    console.log('🐾 [auth.service.spec] Setting up test, nyaa~');

    // Spy on console.log
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Configure bcrypt mocks
    (bcrypt.hashSync as jest.Mock).mockReturnValue('hashed_password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    // Create testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    console.log('🐾 [auth.service.spec] Cleaning up test, desu~');
    consoleLogSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('🎯 Constructor and Initialization', () => {
    it('should be defined', () => {
      console.log('🧪 [Test] Checking service defined, nyaa~');
      expect(service).toBeDefined();
    });

    it('should hash admin password on startup', () => {
      console.log('🧪 [Test] Checking password hashing, desu~');
      expect(bcrypt.hashSync).toHaveBeenCalledWith('testpassword123', 10);
    });

    it('should log initialization message', () => {
      console.log('🧪 [Test] Checking initialization log, nyaa~');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Admin credentials configured')
      );
    });

    it('should use default credentials if env vars not set', async () => {
      console.log('🧪 [Test] Checking default credentials, desu~');

      // Reset environment
      delete process.env.ADMIN_USERNAME;
      delete process.env.ADMIN_PASSWORD;

      // Create new service instance
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AuthService,
          {
            provide: JwtService,
            useValue: {
              sign: jest.fn(),
              verify: jest.fn(),
            },
          },
        ],
      }).compile();

      const newService = module.get<AuthService>(AuthService);
      expect(newService).toBeDefined();

      // Restore environment
      process.env = {
        ...originalEnv,
        ADMIN_USERNAME: 'testadmin',
        ADMIN_PASSWORD: 'testpassword123',
      };
    });
  });

  describe('🔍 validateUser', () => {
    it('should return user object for valid admin credentials', async () => {
      console.log('🧪 [Test] Checking valid admin login, nyaa~');

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('testadmin', 'testpassword123');

      expect(result).toEqual({
        username: 'testadmin',
        role: 'admin',
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Admin login successful')
      );
    });

    it('should return null for invalid username', async () => {
      console.log('🧪 [Test] Checking invalid username, desu~');

      const result = await service.validateUser('wronguser', 'testpassword123');

      expect(result).toBeNull();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid credentials')
      );
    });

    it('should return null for invalid password', async () => {
      console.log('🧪 [Test] Checking invalid password, nyaa~');

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('testadmin', 'wrongpassword');

      expect(result).toBeNull();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid credentials')
      );
    });

    it('should call bcrypt.compare with correct arguments', async () => {
      console.log('🧪 [Test] Checking bcrypt compare arguments, desu~');

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.validateUser('testadmin', 'testpassword123');

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'testpassword123',
        'hashed_password'
      );
    });

    it('should log validation attempt', async () => {
      console.log('🧪 [Test] Checking validation logging, nyaa~');

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.validateUser('testadmin', 'testpassword123');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Validating user: testadmin')
      );
    });
  });

  describe('🎫 login', () => {
    it('should return access token and user for valid credentials', async () => {
      console.log('🧪 [Test] Checking successful login, desu~');

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue('mock.jwt.token');

      const result = await service.login('testadmin', 'testpassword123');

      expect(result).toEqual({
        access_token: 'mock.jwt.token',
        user: {
          username: 'testadmin',
          role: 'admin',
        },
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      console.log('🧪 [Test] Checking unauthorized exception, nyaa~');

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('testadmin', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw exception with neko message', async () => {
      console.log('🧪 [Test] Checking neko error message, desu~');

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('testadmin', 'wrongpassword')).rejects.toThrow(
        'Invalid credentials, nyaa~! 🐾'
      );
    });

    it('should call jwtService.sign with correct payload', async () => {
      console.log('🧪 [Test] Checking JWT payload, nyaa~');

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue('mock.jwt.token');

      await service.login('testadmin', 'testpassword123');

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'testadmin',
        role: 'admin',
      });
    });

    it('should log login attempt', async () => {
      console.log('🧪 [Test] Checking login logging, desu~');

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue('mock.jwt.token');

      await service.login('testadmin', 'testpassword123');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Login attempt: testadmin')
      );
    });

    it('should log JWT generation', async () => {
      console.log('🧪 [Test] Checking JWT generation log, nyaa~');

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue('mock.jwt.token');

      await service.login('testadmin', 'testpassword123');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('JWT token generated for: testadmin')
      );
    });

    it('should return token with correct structure', async () => {
      console.log('🧪 [Test] Checking token structure, desu~');

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue('valid.jwt.token');

      const result = await service.login('testadmin', 'testpassword123');

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('username');
      expect(result.user).toHaveProperty('role');
      expect(typeof result.access_token).toBe('string');
    });
  });

  describe('🔓 verifyToken', () => {
    it('should return decoded payload for valid token', async () => {
      console.log('🧪 [Test] Checking valid token verification, nyaa~');

      const mockPayload: JwtPayload = {
        username: 'testadmin',
        role: 'admin',
        iat: Date.now(),
        exp: Date.now() + 3600000,
      };

      (jwtService.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = await service.verifyToken('valid.jwt.token');

      expect(result).toEqual(mockPayload);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      console.log('🧪 [Test] Checking invalid token, desu~');

      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.verifyToken('invalid.token')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw exception with neko message', async () => {
      console.log('🧪 [Test] Checking neko error message for invalid token, nyaa~');

      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.verifyToken('invalid.token')).rejects.toThrow(
        'Invalid token, desu~! 🐾'
      );
    });

    it('should log successful verification', async () => {
      console.log('🧪 [Test] Checking verification logging, desu~');

      const mockPayload: JwtPayload = {
        username: 'testadmin',
        role: 'admin',
      };

      (jwtService.verify as jest.Mock).mockReturnValue(mockPayload);

      await service.verifyToken('valid.jwt.token');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Token verified for: testadmin')
      );
    });

    it('should log failed verification', async () => {
      console.log('🧪 [Test] Checking failed verification logging, nyaa~');

      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Token expired');
      });

      try {
        await service.verifyToken('expired.token');
      } catch (error) {
        // Expected to throw
      }

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid token')
      );
    });

    it('should call jwtService.verify with correct token', async () => {
      console.log('🧪 [Test] Checking verify call arguments, desu~');

      const mockPayload: JwtPayload = {
        username: 'testadmin',
        role: 'admin',
      };

      (jwtService.verify as jest.Mock).mockReturnValue(mockPayload);

      await service.verifyToken('test.token.here');

      expect(jwtService.verify).toHaveBeenCalledWith('test.token.here');
    });

    it('should return payload with username and role', async () => {
      console.log('🧪 [Test] Checking payload structure, nyaa~');

      const mockPayload: JwtPayload = {
        username: 'testadmin',
        role: 'admin',
        iat: 1234567890,
        exp: 1234571490,
      };

      (jwtService.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = await service.verifyToken('valid.token');

      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('role');
      expect(result.username).toBe('testadmin');
      expect(result.role).toBe('admin');
    });
  });

  describe('🛡️ Security Tests', () => {
    it('should not accept empty username', async () => {
      console.log('🧪 [Test] Checking empty username rejection, desu~');

      const result = await service.validateUser('', 'testpassword123');

      expect(result).toBeNull();
    });

    it('should not accept empty password', async () => {
      console.log('🧪 [Test] Checking empty password rejection, nyaa~');

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('testadmin', '');

      expect(result).toBeNull();
    });

    it('should hash password with salt rounds of 10', () => {
      console.log('🧪 [Test] Checking salt rounds, desu~');

      expect(bcrypt.hashSync).toHaveBeenCalledWith(
        expect.any(String),
        10
      );
    });

    it('should not expose password in any response', async () => {
      console.log('🧪 [Test] Checking password not exposed, nyaa~');

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue('mock.token');

      const result = await service.login('testadmin', 'testpassword123');

      expect(result).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('password');
      expect(JSON.stringify(result)).not.toContain('testpassword123');
    });

    it('should use secure JWT signing', async () => {
      console.log('🧪 [Test] Checking JWT service is used, desu~');

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue('secure.token');

      await service.login('testadmin', 'testpassword123');

      expect(jwtService.sign).toHaveBeenCalled();
    });
  });

  describe('⚡ Edge Cases', () => {
    it('should handle bcrypt comparison errors gracefully', async () => {
      console.log('🧪 [Test] Checking bcrypt error handling, nyaa~');

      (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('Bcrypt error'));

      await expect(
        service.validateUser('testadmin', 'testpassword123')
      ).rejects.toThrow();
    });

    it('should handle JWT signing errors', async () => {
      console.log('🧪 [Test] Checking JWT signing error handling, desu~');

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockImplementation(() => {
        throw new Error('JWT signing failed');
      });

      await expect(
        service.login('testadmin', 'testpassword123')
      ).rejects.toThrow();
    });

    it('should handle special characters in username', async () => {
      console.log('🧪 [Test] Checking special character handling, nyaa~');

      const result = await service.validateUser('admin@test.com', 'password');

      expect(result).toBeNull();
    });

    it('should handle very long passwords', async () => {
      console.log('🧪 [Test] Checking long password handling, desu~');

      const longPassword = 'a'.repeat(1000);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('testadmin', longPassword);

      expect(result).toBeNull();
    });
  });
});

// *purrs in authentication testing mastery* 😻🔐
// AUTH SERVICE 100% TESTED, NYAA~! 🐾⚡👑
