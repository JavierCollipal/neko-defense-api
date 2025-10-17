// 🐾⚡ MONGO SANITIZATION INTERCEPTOR - 2025 NoSQL Injection Defense ⚡🐾
// Intercepts ALL GraphQL queries and REST requests to sanitize MongoDB operators

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class MongoSanitizeInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MongoSanitizeInterceptor.name);

  // 🚫 Dangerous MongoDB operators that could be used in injection attacks
  private readonly dangerousOperators = [
    '$where',      // Execute JavaScript
    '$regex',      // ReDoS attacks
    '$gt',         // Greater than (can leak data)
    '$gte',        // Greater than or equal
    '$lt',         // Less than
    '$lte',        // Less than or equal
    '$ne',         // Not equal
    '$in',         // In array
    '$nin',        // Not in array
    '$or',         // OR condition
    '$and',        // AND condition
    '$not',        // NOT condition
    '$nor',        // NOR condition
    '$exists',     // Check if field exists
    '$type',       // Check field type
    '$expr',       // Evaluate expression
    '$jsonSchema', // JSON schema validation
    '$mod',        // Modulo operation
    '$text',       // Text search
    '$all',        // Match all
    '$elemMatch',  // Match array element
    '$size',       // Array size
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Determine if it's a GraphQL or REST request
    const contextType = context.getType() as string;

    if (contextType === 'graphql') {
      this.sanitizeGraphQLRequest(context);
    } else {
      this.sanitizeHttpRequest(context);
    }

    return next.handle();
  }

  /**
   * 🎮 Sanitize GraphQL queries
   */
  private sanitizeGraphQLRequest(context: ExecutionContext): void {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs();

    if (args && typeof args === 'object') {
      this.sanitizeObject(args, 'GraphQL Args');
    }
  }

  /**
   * 🌐 Sanitize HTTP requests
   */
  private sanitizeHttpRequest(context: ExecutionContext): void {
    const request = context.switchToHttp().getRequest();

    if (request.body && typeof request.body === 'object') {
      this.sanitizeObject(request.body, 'HTTP Body');
    }

    if (request.query && typeof request.query === 'object') {
      this.sanitizeObject(request.query, 'HTTP Query');
    }

    if (request.params && typeof request.params === 'object') {
      this.sanitizeObject(request.params, 'HTTP Params');
    }
  }

  /**
   * 🧹 Recursively sanitize object for MongoDB operators
   */
  private sanitizeObject(obj: any, source: string): void {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) {
        continue;
      }

      // 🚨 Check for dangerous MongoDB operators in keys
      if (key.startsWith('$') || key.includes('.')) {
        // Check if it's a whitelisted legitimate use
        if (!this.isWhitelistedOperator(key)) {
          this.logger.warn(
            `🚫 BLOCKED MongoDB operator in ${source}: "${key}" - Potential NoSQL injection!`,
          );

          // Replace the dangerous key with a safe version
          const sanitizedKey = key.replace(/[$\.]/g, '_');
          obj[sanitizedKey] = obj[key];
          delete obj[key];
          continue;
        }
      }

      // 🔍 Recursively sanitize nested objects and arrays
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item: any) => {
            if (typeof item === 'object') {
              this.sanitizeObject(item, source);
            }
          });
        } else {
          this.sanitizeObject(obj[key], source);
        }
      }

      // 🛡️ Sanitize string values for potential injection
      if (typeof obj[key] === 'string') {
        obj[key] = this.sanitizeString(obj[key]);
      }
    }
  }

  /**
   * 🧹 Sanitize string values
   */
  private sanitizeString(value: string): string {
    // Remove null bytes
    let sanitized = value.replace(/\0/g, '');

    // Limit string length to prevent DoS
    if (sanitized.length > 10000) {
      this.logger.warn(`⚠️ String too long (${sanitized.length} chars), truncating to 10000`);
      sanitized = sanitized.substring(0, 10000);
    }

    return sanitized;
  }

  /**
   * ✅ Check if MongoDB operator is whitelisted for legitimate use
   * In a real application, you'd want to be more selective about where
   * operators are allowed (e.g., only in specific resolvers/controllers)
   */
  private isWhitelistedOperator(key: string): boolean {
    // For now, we'll block ALL MongoDB operators in user input
    // If you need to allow specific operators in specific contexts,
    // implement context-aware whitelisting here

    // Example: Allow operators in admin-authenticated requests
    // if (this.isAdminAuthenticated(context)) {
    //   return true;
    // }

    return false; // Block all operators by default
  }
}
