// 🐾✨ NEKO DEFENSE - Current User Decorator ✨🐾
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * 👤 Extract current authenticated user from GraphQL context
 * Usage: @CurrentUser() user: JwtPayload
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    console.log('👤 [CurrentUser] Extracting user from request, nyaa~');

    return request.user;
  },
);
