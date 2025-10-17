// 🐾⚡ NEKO SECURITY MODULE - 2025 White Hat Defense ⚡🐾

import { Module, Global } from '@nestjs/common';
import { AnomalyDetectorService } from './anomaly-detector.service';
import { ThreatDetectionGuard } from './threat-detection.guard';
import { AuditLoggerService } from './audit-logger.service';
import { IncidentResponseService } from './incident-response.service';
import { MongoSanitizeInterceptor } from './mongo-sanitize.interceptor';
import { SecurityMonitorController } from './security-monitor.controller';
import { RedisThrottlerStorage } from './redis-throttler.storage';
import { DatabaseModule } from '../database/database.module';

@Global() // Make security services available everywhere!
@Module({
  imports: [DatabaseModule],
  controllers: [SecurityMonitorController],
  providers: [
    AnomalyDetectorService,
    ThreatDetectionGuard,
    AuditLoggerService,
    IncidentResponseService,
    MongoSanitizeInterceptor,
    RedisThrottlerStorage,
  ],
  exports: [
    AnomalyDetectorService,
    ThreatDetectionGuard,
    AuditLoggerService,
    IncidentResponseService,
    MongoSanitizeInterceptor,
    RedisThrottlerStorage,
  ],
})
export class SecurityModule {
  constructor() {
    console.log('🛡️ NEKO SECURITY MODULE LOADED - 2025 DEFENSE ACTIVATED, NYAA~! ⚡✨');
    console.log('   🤖 AI/ML Anomaly Detection: ONLINE');
    console.log('   📝 Structured Audit Logging: ONLINE');
    console.log('   🚨 Automated Incident Response: ONLINE');
    console.log('   🚀 Redis Distributed Rate Limiting: ONLINE');
    console.log('   🛡️ MAXIMUM PROTECTION MODE: ENGAGED!');
  }
}
