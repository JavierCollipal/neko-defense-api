// 🐾⚡ NEKO DEFENSE API - Root Module ⚡🐾
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

// Import custom modules
import { SecurityModule } from './security/security.module';
import { DatabaseModule } from './database/database.module';
import { CacheModule } from './cache/cache.module';
import { ResilienceModule } from './resilience/resilience.module';
import { TranslationModule } from './common/translation.module'; // 🌍 Translation Module, nyaa~!
import { AuthModule } from './auth/auth.module';
import { ThreatActorsModule } from './threat-actors/threat-actors.module';
import { HoneypotTriggersModule } from './honeypot-triggers/honeypot-triggers.module';
import { HuntOperationsModule } from './hunt-operations/hunt-operations.module';
import { CasePatternsModule } from './case-patterns/case-patterns.module';
import { DinaModule } from './dina/dina.module';
import { ValechModule } from './valech/valech.module';
import { AppController } from './app.controller';
import { RedisThrottlerStorage } from './security/redis-throttler.storage';

@Module({
  imports: [
    // 🔧 Configuration - Load .env file, nyaa~!
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 🗄️ MongoDB Connection - FORTRESS LEVEL SECURITY, desu~!
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DATABASE || 'neko-defense-system',
      // 🔒 2025 Security Best Practices
      tls: true, // Enforce TLS/SSL encryption
      tlsAllowInvalidCertificates: false, // Reject invalid certificates
      retryWrites: true, // Retry failed writes
      retryReads: true, // Retry failed reads
      w: 'majority', // Write concern for data durability
      maxPoolSize: 10, // Connection pool limit
      minPoolSize: 2, // Maintain minimum connections
      maxIdleTimeMS: 10000, // Close idle connections
      serverSelectionTimeoutMS: 5000, // Fail fast on connection issues
      socketTimeoutMS: 45000, // Socket timeout
      family: 4, // Use IPv4
      // 🛡️ Connection error handling
      autoIndex: process.env.NODE_ENV !== 'production', // Disable auto-indexing in production
      autoCreate: process.env.NODE_ENV !== 'production', // Disable auto-collection creation in production
    }),

    // 🎮 GraphQL Configuration - Apollo Server, nyaa~!
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      context: ({ req }) => ({ req }), // Pass request to resolvers
      formatError: (error) => {
        // 🔒 Don't leak internal errors in production!
        if (process.env.NODE_ENV === 'production') {
          return {
            message: error.message,
            path: error.path,
          };
        }
        return error;
      },
    }),

    // 🛡️ Rate Limiting - Protection from abuse, desu~!
    // 🚀 Redis storage configured in SecurityModule for distributed rate limiting!
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.RATE_LIMIT_TTL) || 60000, // 60 seconds in milliseconds
      limit: parseInt(process.env.RATE_LIMIT_MAX) || 1000, // 1000 req/min for worldwide scale!
    }]),

    // 🛡️ Security Module (2025 AI/ML Protection) - MUST BE FIRST!
    SecurityModule,

    // 🗄️ Database Module (Connection Management & Health Checks)
    DatabaseModule,

    // ⚡ Cache Module (Redis Response Caching)
    CacheModule,

    // 🛡️ Resilience Module (Circuit Breakers & Fault Tolerance)
    ResilienceModule,

    // 🌍 Translation Module (Multilingual Support)
    TranslationModule,

    // 🎯 Feature Modules
    AuthModule,
    ThreatActorsModule,
    HoneypotTriggersModule,
    HuntOperationsModule,
    CasePatternsModule,
    DinaModule,
    ValechModule,
  ],
  controllers: [AppController],
})
export class AppModule {
  constructor() {
    console.log('🐾 AppModule initialized - NEKO POWER ACTIVATED! ⚡✨');
  }
}
