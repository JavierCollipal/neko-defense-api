// 🐾🔐 NEKO DEFENSE - Authentication GraphQL Resolver 🔐🐾
import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './dto/auth-response.type';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  /**
   * 🎫 Login mutation - Returns JWT token
   */
  @Mutation(() => AuthResponse, {
    description: '🔐 Login with credentials and receive JWT token, nyaa~!',
  })
  async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
    console.log(`🎫 [AuthResolver] Login request: ${input.username} | Language: ${input.language || 'en'}`);
    return this.authService.login(input.username, input.password, input.language || 'en');
  }

  /**
   * 👤 Get current user info (requires authentication)
   */
  @Query(() => String, {
    description: '👤 Get current authenticated user info, desu~!',
  })
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: any): Promise<string> {
    console.log(`👤 [AuthResolver] Current user request: ${user.username}`);
    return `🐾 Authenticated as: ${user.username} (${user.role}), nyaa~!`;
  }
}
