// 🐾🛡️ NEKO DEFENSE - GraphQL Auth Guard 🛡️🐾
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * 🛡️ GraphQL authentication guard
 * Protects GraphQL resolvers with JWT authentication, nyaa~!
 */
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  /**
   * 🔍 Extract request from GraphQL context
   */
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    console.log('🛡️ [GqlAuthGuard] Checking authentication for GraphQL request, desu~');

    return request;
  }

  /**
   * 🔓 Handle authentication result
   */
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      console.log('❌ [GqlAuthGuard] Authentication failed:', info?.message || 'No user');
      throw err || new Error('Unauthorized access, nyaa~! 🐾');
    }

    console.log(`✅ [GqlAuthGuard] Authentication successful: ${user.username}`);
    return user;
  }
}
