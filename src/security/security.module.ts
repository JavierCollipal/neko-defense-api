// 🐾⚡ NEKO SECURITY MODULE - 2025 White Hat Defense ⚡🐾

import { Module, Global } from '@nestjs/common';
import { AnomalyDetectorService } from './anomaly-detector.service';
import { ThreatDetectionGuard } from './threat-detection.guard';
import { AuditLoggerService } from './audit-logger.service';
import { IncidentResponseService } from './incident-response.service';

@Global() // Make security services available everywhere!
@Module({
  providers: [
    AnomalyDetectorService,
    ThreatDetectionGuard,
    AuditLoggerService,
    IncidentResponseService,
  ],
  exports: [
    AnomalyDetectorService,
    ThreatDetectionGuard,
    AuditLoggerService,
    IncidentResponseService,
  ],
})
export class SecurityModule {
  constructor() {
    console.log('🛡️ NEKO SECURITY MODULE LOADED - 2025 DEFENSE ACTIVATED, NYAA~! ⚡✨');
    console.log('   🤖 AI/ML Anomaly Detection: ONLINE');
    console.log('   📝 Structured Audit Logging: ONLINE');
    console.log('   🚨 Automated Incident Response: ONLINE');
    console.log('   🛡️ MAXIMUM PROTECTION MODE: ENGAGED!');
  }
}
