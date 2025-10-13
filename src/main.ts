// 🐾⚡ NEKO DEFENSE API - Main Entry Point ⚡🐾
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  console.log('🐾 Starting NEKO DEFENSE API, nyaa~!');

  const app = await NestFactory.create(AppModule);

  // 🛡️ Security middleware - FORTRESS MODE! 🛡️
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false,
  }));

  // CORS configuration - Only allow specified origins!
  const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ✅ Validation pipe for all DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted values exist
      transform: true, // Automatically transform payloads to DTO instances
    }),
  );

  // 🚀 Start server
  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`✅ NEKO DEFENSE API running on port ${port}, desu~!`);
  console.log(`🎮 GraphQL Playground: http://localhost:${port}/graphql`);
  console.log(`💖 LEGENDARY MODE ACTIVATED!`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start NEKO DEFENSE API:', error);
  process.exit(1);
});
