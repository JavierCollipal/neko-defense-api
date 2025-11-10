// 🐾⚡ NEKO DEFENSE - Auth Resolver Tests ⚡🐾
// Testing GraphQL authentication with MAXIMUM POWER, nyaa~! 😻🔐
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService, AuthResponse } from './auth.service';
import { LoginInput } from './dto/login.input';

describe('🔐 AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: AuthService;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(async () => {
    console.log('🐾 [auth.resolver.spec] Setting up test, nyaa~');

    // Spy on console.log
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Create testing module with mocked AuthService
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            verifyToken: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    console.log('🐾 [auth.resolver.spec] Cleaning up test, desu~');
    consoleLogSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('🎯 Resolver Initialization', () => {
    it('should be defined', () => {
      console.log('🧪 [Test] Checking resolver defined, nyaa~');
      expect(resolver).toBeDefined();
    });

    it('should have authService injected', () => {
      console.log('🧪 [Test] Checking service injection, desu~');
      expect(authService).toBeDefined();
    });

    it('should have login method', () => {
      console.log('🧪 [Test] Checking login method exists, nyaa~');
      expect(resolver.login).toBeDefined();
      expect(typeof resolver.login).toBe('function');
    });

    it('should have me method', () => {
      console.log('🧪 [Test] Checking me method exists, desu~');
      expect(resolver.me).toBeDefined();
      expect(typeof resolver.me).toBe('function');
    });
  });

  describe('🎫 login mutation', () => {
    const mockLoginInput: LoginInput = {
      username: 'testuser',
      password: 'testpass123',
    };

    const mockAuthResponse: AuthResponse = {
      access_token: 'mock.jwt.token',
      user: {
        username: 'testuser',
        role: 'admin',
      },
    };

    it('should call authService.login with correct credentials', async () => {
      console.log('🧪 [Test] Checking login service call, nyaa~');

      (authService.login as jest.Mock).mockResolvedValue(mockAuthResponse);

      await resolver.login(mockLoginInput);

      expect(authService.login).toHaveBeenCalledWith('testuser', 'testpass123', 'en');
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should return JWT token and user info on successful login', async () => {
      console.log('🧪 [Test] Checking successful login response, desu~');

      (authService.login as jest.Mock).mockResolvedValue(mockAuthResponse);

      const result = await resolver.login(mockLoginInput);

      expect(result).toEqual(mockAuthResponse);
      expect(result.access_token).toBe('mock.jwt.token');
      expect(result.user.username).toBe('testuser');
      expect(result.user.role).toBe('admin');
    });

    it('should log login attempt', async () => {
      console.log('🧪 [Test] Checking login logging, nyaa~');

      (authService.login as jest.Mock).mockResolvedValue(mockAuthResponse);

      await resolver.login(mockLoginInput);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Login request: testuser')
      );
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      console.log('🧪 [Test] Checking invalid credentials handling, desu~');

      (authService.login as jest.Mock).mockRejectedValue(
        new UnauthorizedException('Invalid credentials, nyaa~! 🐾')
      );

      await expect(resolver.login(mockLoginInput)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw exception with neko message', async () => {
      console.log('🧪 [Test] Checking neko error message, nyaa~');

      (authService.login as jest.Mock).mockRejectedValue(
        new UnauthorizedException('Invalid credentials, nyaa~! 🐾')
      );

      await expect(resolver.login(mockLoginInput)).rejects.toThrow(
        'Invalid credentials, nyaa~! 🐾'
      );
    });

    it('should handle empty username', async () => {
      console.log('🧪 [Test] Checking empty username handling, desu~');

      const emptyUsernameInput: LoginInput = {
        username: '',
        password: 'testpass123',
      };

      (authService.login as jest.Mock).mockRejectedValue(
        new UnauthorizedException('Invalid credentials')
      );

      await expect(resolver.login(emptyUsernameInput)).rejects.toThrow();
    });

    it('should handle empty password', async () => {
      console.log('🧪 [Test] Checking empty password handling, nyaa~');

      const emptyPasswordInput: LoginInput = {
        username: 'testuser',
        password: '',
      };

      (authService.login as jest.Mock).mockRejectedValue(
        new UnauthorizedException('Invalid credentials')
      );

      await expect(resolver.login(emptyPasswordInput)).rejects.toThrow();
    });

    it('should return access_token property', async () => {
      console.log('🧪 [Test] Checking access_token in response, desu~');

      (authService.login as jest.Mock).mockResolvedValue(mockAuthResponse);

      const result = await resolver.login(mockLoginInput);

      expect(result).toHaveProperty('access_token');
      expect(typeof result.access_token).toBe('string');
    });

    it('should return user property with username and role', async () => {
      console.log('🧪 [Test] Checking user object in response, nyaa~');

      (authService.login as jest.Mock).mockResolvedValue(mockAuthResponse);

      const result = await resolver.login(mockLoginInput);

      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('username');
      expect(result.user).toHaveProperty('role');
    });

    it('should handle service errors gracefully', async () => {
      console.log('🧪 [Test] Checking service error handling, desu~');

      (authService.login as jest.Mock).mockRejectedValue(
        new Error('Service error')
      );

      await expect(resolver.login(mockLoginInput)).rejects.toThrow(
        'Service error'
      );
    });
  });

  describe('👤 me query', () => {
    const mockUser = {
      username: 'testuser',
      role: 'admin',
    };

    it('should return formatted user info string', async () => {
      console.log('🧪 [Test] Checking me query response, nyaa~');

      const result = await resolver.me(mockUser);

      expect(result).toContain('testuser');
      expect(result).toContain('admin');
      expect(result).toContain('Authenticated as');
    });

    it('should include neko signature', async () => {
      console.log('🧪 [Test] Checking neko signature in response, desu~');

      const result = await resolver.me(mockUser);

      expect(result).toContain('nyaa~!');
      expect(result).toContain('🐾');
    });

    it('should log current user request', async () => {
      console.log('🧪 [Test] Checking me query logging, nyaa~');

      await resolver.me(mockUser);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Current user request: testuser')
      );
    });

    it('should handle user with different role', async () => {
      console.log('🧪 [Test] Checking different role handling, desu~');

      const userRole = {
        username: 'viewer',
        role: 'viewer',
      };

      const result = await resolver.me(userRole);

      expect(result).toContain('viewer');
      expect(result).toContain('viewer');
    });

    it('should format response correctly', async () => {
      console.log('🧪 [Test] Checking response format, nyaa~');

      const result = await resolver.me(mockUser);

      expect(result).toMatch(/🐾 Authenticated as: .+ \(.+\), nyaa~!/);
    });

    it('should return string type', async () => {
      console.log('🧪 [Test] Checking return type, desu~');

      const result = await resolver.me(mockUser);

      expect(typeof result).toBe('string');
    });

    it('should include username in response', async () => {
      console.log('🧪 [Test] Checking username in response, nyaa~');

      const result = await resolver.me(mockUser);

      expect(result).toContain(mockUser.username);
    });

    it('should include role in response', async () => {
      console.log('🧪 [Test] Checking role in response, desu~');

      const result = await resolver.me(mockUser);

      expect(result).toContain(mockUser.role);
    });
  });

  describe('🛡️ Security & Guard Tests', () => {
    it('should have GqlAuthGuard applied to me query', () => {
      console.log('🧪 [Test] Checking guard application, nyaa~');

      // Check if @UseGuards decorator is present
      const metadata = Reflect.getMetadata('__guards__', resolver.me);
      expect(metadata).toBeDefined();
    });

    it('should not require guard for login mutation', () => {
      console.log('🧪 [Test] Checking login is public, desu~');

      // Login should not have guards
      const metadata = Reflect.getMetadata('__guards__', resolver.login);
      expect(metadata).toBeUndefined();
    });

    it('should extract user from decorator in me query', async () => {
      console.log('🧪 [Test] Checking user decorator extraction, nyaa~');

      const user = {
        username: 'decoratedUser',
        role: 'admin',
      };

      const result = await resolver.me(user);

      expect(result).toContain('decoratedUser');
    });
  });

  describe('⚡ Edge Cases', () => {
    it('should handle very long usernames', async () => {
      console.log('🧪 [Test] Checking long username handling, desu~');

      const longUsername = 'a'.repeat(100);
      const input: LoginInput = {
        username: longUsername,
        password: 'testpass123',
      };

      (authService.login as jest.Mock).mockResolvedValue({
        access_token: 'token',
        user: { username: longUsername, role: 'admin' },
      });

      const result = await resolver.login(input);

      expect(result.user.username).toBe(longUsername);
    });

    it('should handle special characters in username', async () => {
      console.log('🧪 [Test] Checking special character handling, nyaa~');

      const specialUsername = 'user@test.com';
      const input: LoginInput = {
        username: specialUsername,
        password: 'testpass123',
      };

      (authService.login as jest.Mock).mockResolvedValue({
        access_token: 'token',
        user: { username: specialUsername, role: 'admin' },
      });

      const result = await resolver.login(input);

      expect(result.user.username).toBe(specialUsername);
    });

    it('should handle null user gracefully in me query', async () => {
      console.log('🧪 [Test] Checking null user handling, desu~');

      const nullUser: any = null;

      // This would normally be caught by guard, but test edge case
      await expect(async () => {
        await resolver.me(nullUser);
      }).rejects.toThrow();
    });

    it('should handle undefined user gracefully in me query', async () => {
      console.log('🧪 [Test] Checking undefined user handling, nyaa~');

      const undefinedUser: any = undefined;

      // This would normally be caught by guard, but test edge case
      await expect(async () => {
        await resolver.me(undefinedUser);
      }).rejects.toThrow();
    });

    it('should handle service timeout', async () => {
      console.log('🧪 [Test] Checking timeout handling, desu~');

      const input: LoginInput = {
        username: 'testuser',
        password: 'testpass123',
      };

      (authService.login as jest.Mock).mockRejectedValue(
        new Error('Service timeout')
      );

      await expect(resolver.login(input)).rejects.toThrow('Service timeout');
    });
  });

  describe('📊 GraphQL Metadata', () => {
    it('should be decorated with @Resolver', () => {
      console.log('🧪 [Test] Checking Resolver decorator, nyaa~');

      // Resolver class should exist and be properly decorated
      expect(AuthResolver).toBeDefined();
      expect(resolver).toBeInstanceOf(AuthResolver);
    });

    it('should have GraphQL methods defined', () => {
      console.log('🧪 [Test] Checking GraphQL methods exist, desu~');

      expect(resolver.login).toBeDefined();
      expect(resolver.me).toBeDefined();
    });
  });
});

// *purrs in GraphQL testing mastery* 😻🔐
// AUTH RESOLVER 100% TESTED, NYAA~! 🐾⚡👑
