// 🐾⚡ NEKO DEFENSE API - Root Module ⚡🐾
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

// Import custom modules
import { AuthModule } from './auth/auth.module';
import { ThreatActorsModule } from './threat-actors/threat-actors.module';
import { DinaModule } from './dina/dina.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    // 🔧 Configuration - Load .env file, nyaa~!
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 🗄️ MongoDB Connection - Mongoose magic, desu~!
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DATABASE || 'neko-defense-system',
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
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.RATE_LIMIT_TTL) || 60,
      limit: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    }]),

    // 🎯 Feature Modules
    AuthModule,
    ThreatActorsModule,
    DinaModule,
  ],
  controllers: [AppController],
})
export class AppModule {
  constructor() {
    console.log('🐾 AppModule initialized - NEKO POWER ACTIVATED! ⚡✨');
  }
}
