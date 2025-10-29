// 🐾⚡ NEKO DEFENSE API - Main Entry Point ⚡🐾
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ThreatDetectionGuard } from './security/threat-detection.guard';
import helmet from 'helmet';

async function bootstrap() {
  // 🌍 Cluster instance identification
  const instanceId = process.env.INSTANCE_ID || process.env.pm_id || 'standalone';
  const isCluster = process.env.pm_id !== undefined;

  console.log('🐾 Starting NEKO DEFENSE API, nyaa~!');
  console.log(`⚡ Instance ID: ${instanceId} ${isCluster ? '(Cluster Mode)' : '(Standalone)'}`);
  console.log(`🖥️  Process ID: ${process.pid}`);

  const app = await NestFactory.create(AppModule);

  // 🛡️ Security middleware - FORTRESS MODE! 🛡️
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false,
  }));

  // 🚫 NoSQL Injection Protection - 2025 DEFENSE! 🚫
  // NOTE: Removed express-mongo-sanitize middleware (compatibility issues)
  // Using MongoSanitizeInterceptor instead (applied below at line 60)
  console.log('🛡️ NoSQL Injection Protection will be activated via Interceptor, nyaa~!');

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

  // 🤖 AI/ML Threat Detection Guard (2025 Protection!) - Applied to ALL requests
  const threatGuard = app.get(ThreatDetectionGuard);
  app.useGlobalGuards(threatGuard);
  console.log('🛡️ AI/ML Threat Detection ACTIVATED - All requests monitored, nyaa~!');

  // 🧹 MongoDB Sanitization Interceptor - Block NoSQL injection in ALL inputs
  const { MongoSanitizeInterceptor } = await import('./security/mongo-sanitize.interceptor');
  app.useGlobalInterceptors(new MongoSanitizeInterceptor());
  console.log('🧹 MongoDB Input Sanitization ACTIVATED - NoSQL injection blocked, desu~!');

  // 🚀 Start server
  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`✅ NEKO DEFENSE API running on port ${port}, desu~!`);
  console.log(`🎮 GraphQL Playground: http://localhost:${port}/graphql`);
  if (isCluster) {
    console.log(`🌍 Cluster Instance: ${instanceId} ready for worldwide traffic!`);
  }
  console.log(`💖 LEGENDARY MODE ACTIVATED!`);

  // 🛡️ Graceful shutdown for PM2 clustering
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n⚠️  ${signal} received, starting graceful shutdown...`);
    console.log(`🐾 Instance ${instanceId} shutting down, nyaa~!`);

    try {
      await app.close();
      console.log('✅ Application closed successfully, desu~!');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Listen for PM2 reload signals
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('message', (msg) => {
    if (msg === 'shutdown') {
      gracefulShutdown('PM2_SHUTDOWN');
    }
  });
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start NEKO DEFENSE API:', error);
  process.exit(1);
});
