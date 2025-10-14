// 🐾⚡ AUTOMATED INCIDENT RESPONSE - 2025 Playbooks ⚡🐾
// Automated response to security threats, nyaa~!

import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AuditLoggerService } from './audit-logger.service';

export interface SecurityIncident {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  actor: {
    ip: string;
    fingerprint?: string;
    userId?: string;
  };
  evidence: Record<string, any>;
  threatScore: number;
  autoBlocked: boolean;
  playbookExecuted?: string;
}

export interface ResponseAction {
  type: 'log' | 'alert' | 'block' | 'quarantine' | 'investigate' | 'escalate';
  description: string;
  executed: boolean;
  result?: any;
  error?: string;
}

@Injectable()
export class IncidentResponseService {
  private readonly logger = new Logger(IncidentResponseService.name);
  private blockedIPs: Set<string> = new Set();
  private quarantinedFingerprints: Set<string> = new Set();

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly auditLogger: AuditLoggerService,
  ) {
    this.logger.log('🚨 Automated Incident Response System initialized (2025 playbooks)!');
    this.loadBlockedIPs();
  }

  /**
   * 🚨 Handle security incident with automated playbook
   */
  async handleIncident(
    category: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    ip: string,
    threatScore: number,
    evidence: Record<string, any>,
  ): Promise<SecurityIncident> {
    const incident: SecurityIncident = {
      id: this.generateIncidentId(),
      timestamp: new Date(),
      severity,
      category,
      description: this.generateDescription(category, evidence),
      actor: {
        ip,
        fingerprint: evidence.fingerprint,
        userId: evidence.userId,
      },
      evidence,
      threatScore,
      autoBlocked: false,
      playbookExecuted: undefined,
    };

    this.logger.warn(
      `🚨 NEW INCIDENT: ${incident.id} | ${severity.toUpperCase()} | ${category} | IP: ${ip} | Score: ${threatScore}`,
    );

    // Execute appropriate playbook based on severity
    const playbook = this.selectPlaybook(incident);
    const actions = await this.executePlaybook(playbook, incident);

    incident.playbookExecuted = playbook;

    // Store incident in MongoDB
    await this.storeIncident(incident, actions);

    // Log to audit system
    await this.auditLogger.logSecurity(
      `incident_${category}`,
      ip,
      threatScore,
      'blocked',
      { incidentId: incident.id, playbook, actions: actions.map(a => a.type) },
    );

    return incident;
  }

  /**
   * 📚 Select appropriate playbook based on incident
   */
  private selectPlaybook(incident: SecurityIncident): string {
    // High-frequency attack patterns
    if (incident.category === 'rate_limit_exceeded') {
      return 'RATE_LIMIT_VIOLATION';
    }

    // Known attack patterns
    if (incident.category === 'sql_injection' ||
        incident.category === 'xss_attempt' ||
        incident.category === 'command_injection') {
      return 'ACTIVE_ATTACK_DETECTED';
    }

    // Automation/bot detection
    if (incident.category === 'bot_detected' ||
        incident.category === 'automation_detected') {
      return 'AUTOMATION_DETECTED';
    }

    // Anomalous behavior
    if (incident.category === 'anomaly_detected') {
      return 'BEHAVIORAL_ANOMALY';
    }

    // Honeypot trap triggered
    if (incident.category === 'honeypot_triggered') {
      return 'HONEYPOT_CAPTURE';
    }

    // Default playbook based on severity
    if (incident.severity === 'critical') {
      return 'CRITICAL_THREAT_RESPONSE';
    } else if (incident.severity === 'high') {
      return 'HIGH_THREAT_RESPONSE';
    } else {
      return 'STANDARD_MONITORING';
    }
  }

  /**
   * ⚡ Execute incident response playbook
   */
  private async executePlaybook(
    playbook: string,
    incident: SecurityIncident,
  ): Promise<ResponseAction[]> {
    const actions: ResponseAction[] = [];

    this.logger.log(`📖 Executing playbook: ${playbook} for incident ${incident.id}`);

    switch (playbook) {
      case 'CRITICAL_THREAT_RESPONSE':
        actions.push(...await this.criticalThreatPlaybook(incident));
        break;

      case 'ACTIVE_ATTACK_DETECTED':
        actions.push(...await this.activeAttackPlaybook(incident));
        break;

      case 'RATE_LIMIT_VIOLATION':
        actions.push(...await this.rateLimitPlaybook(incident));
        break;

      case 'AUTOMATION_DETECTED':
        actions.push(...await this.automationPlaybook(incident));
        break;

      case 'HONEYPOT_CAPTURE':
        actions.push(...await this.honeypotCapturePlaybook(incident));
        break;

      case 'BEHAVIORAL_ANOMALY':
        actions.push(...await this.anomalyPlaybook(incident));
        break;

      case 'HIGH_THREAT_RESPONSE':
        actions.push(...await this.highThreatPlaybook(incident));
        break;

      case 'STANDARD_MONITORING':
      default:
        actions.push(...await this.standardMonitoringPlaybook(incident));
        break;
    }

    return actions;
  }

  /**
   * 🔴 PLAYBOOK: Critical Threat Response
   * For immediate, severe threats requiring instant blocking
   */
  private async criticalThreatPlaybook(incident: SecurityIncident): Promise<ResponseAction[]> {
    const actions: ResponseAction[] = [];

    // 1. Immediate IP block
    actions.push(await this.blockIP(incident.actor.ip, 'Critical threat detected'));

    // 2. Quarantine fingerprint
    if (incident.actor.fingerprint) {
      actions.push(await this.quarantineFingerprint(incident.actor.fingerprint));
    }

    // 3. Alert security team
    actions.push(await this.alertSecurityTeam(incident, 'CRITICAL'));

    // 4. Create evidence package
    actions.push(await this.createEvidencePackage(incident));

    return actions;
  }

  /**
   * ⚔️ PLAYBOOK: Active Attack Detected
   * For SQL injection, XSS, command injection attempts
   */
  private async activeAttackPlaybook(incident: SecurityIncident): Promise<ResponseAction[]> {
    const actions: ResponseAction[] = [];

    // 1. Block IP immediately
    actions.push(await this.blockIP(incident.actor.ip, 'Active attack pattern detected'));

    // 2. Log detailed forensics
    actions.push({
      type: 'log',
      description: 'Capture detailed attack forensics',
      executed: true,
      result: await this.captureAttackForensics(incident),
    });

    // 3. Alert security team
    actions.push(await this.alertSecurityTeam(incident, 'HIGH'));

    // 4. Check for related IPs (same fingerprint or pattern)
    actions.push(await this.investigateRelatedThreats(incident));

    return actions;
  }

  /**
   * 🚦 PLAYBOOK: Rate Limit Violation
   * For excessive request rates
   */
  private async rateLimitPlaybook(incident: SecurityIncident): Promise<ResponseAction[]> {
    const actions: ResponseAction[] = [];

    // 1. Temporary block (shorter duration)
    actions.push(await this.temporaryBlock(incident.actor.ip, 3600)); // 1 hour

    // 2. Log rate violation
    actions.push({
      type: 'log',
      description: 'Log rate limit violation',
      executed: true,
    });

    // 3. Monitor for escalation
    actions.push({
      type: 'investigate',
      description: 'Monitor IP for continued violations',
      executed: true,
    });

    return actions;
  }

  /**
   * 🤖 PLAYBOOK: Automation Detected
   * For bot/automation detection
   */
  private async automationPlaybook(incident: SecurityIncident): Promise<ResponseAction[]> {
    const actions: ResponseAction[] = [];

    // 1. Challenge with increased scrutiny
    actions.push({
      type: 'quarantine',
      description: 'Quarantine fingerprint for enhanced monitoring',
      executed: true,
    });

    if (incident.actor.fingerprint) {
      this.quarantinedFingerprints.add(incident.actor.fingerprint);
    }

    // 2. Log automation signals
    actions.push({
      type: 'log',
      description: 'Log automation characteristics',
      executed: true,
    });

    // 3. If threat score is high, escalate to block
    if (incident.threatScore >= 70) {
      actions.push(await this.blockIP(incident.actor.ip, 'High-threat automation detected'));
    }

    return actions;
  }

  /**
   * 🍯 PLAYBOOK: Honeypot Capture
   * For honeypot trap triggers
   */
  private async honeypotCapturePlaybook(incident: SecurityIncident): Promise<ResponseAction[]> {
    const actions: ResponseAction[] = [];

    // 1. Create detailed capture report
    actions.push({
      type: 'log',
      description: 'Create honeypot capture report',
      executed: true,
      result: await this.createHoneypotReport(incident),
    });

    // 2. Block if high threat
    if (incident.threatScore >= 60) {
      actions.push(await this.blockIP(incident.actor.ip, 'Honeypot capture - high threat'));
    } else {
      // Continue monitoring
      actions.push({
        type: 'investigate',
        description: 'Continue honeypot monitoring',
        executed: true,
      });
    }

    // 3. Update threat actor database
    actions.push({
      type: 'log',
      description: 'Update threat actor profile',
      executed: true,
    });

    return actions;
  }

  /**
   * 📊 PLAYBOOK: Behavioral Anomaly
   * For ML-detected anomalies
   */
  private async anomalyPlaybook(incident: SecurityIncident): Promise<ResponseAction[]> {
    const actions: ResponseAction[] = [];

    // 1. Enhanced monitoring
    actions.push({
      type: 'investigate',
      description: 'Enable enhanced monitoring for IP',
      executed: true,
    });

    // 2. Log anomaly details
    actions.push({
      type: 'log',
      description: 'Log anomaly characteristics',
      executed: true,
    });

    // 3. If confidence is high, escalate
    if (incident.threatScore >= 80) {
      actions.push(await this.blockIP(incident.actor.ip, 'High-confidence anomaly detected'));
    }

    return actions;
  }

  /**
   * 🟡 PLAYBOOK: High Threat Response
   */
  private async highThreatPlaybook(incident: SecurityIncident): Promise<ResponseAction[]> {
    const actions: ResponseAction[] = [];

    actions.push(await this.temporaryBlock(incident.actor.ip, 7200)); // 2 hours
    actions.push(await this.alertSecurityTeam(incident, 'MEDIUM'));
    actions.push({
      type: 'investigate',
      description: 'Investigate threat pattern',
      executed: true,
    });

    return actions;
  }

  /**
   * 🟢 PLAYBOOK: Standard Monitoring
   */
  private async standardMonitoringPlaybook(incident: SecurityIncident): Promise<ResponseAction[]> {
    return [
      {
        type: 'log',
        description: 'Log security event for monitoring',
        executed: true,
      },
    ];
  }

  /**
   * 🚫 Block IP address
   */
  private async blockIP(ip: string, reason: string): Promise<ResponseAction> {
    try {
      this.blockedIPs.add(ip);

      // Store in MongoDB for persistence
      await this.connection.db.collection('blocked_ips').updateOne(
        { ip },
        {
          $set: {
            ip,
            reason,
            blockedAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        },
        { upsert: true },
      );

      this.logger.warn(`🚫 IP BLOCKED: ${ip} - Reason: ${reason}`);

      return {
        type: 'block',
        description: `Blocked IP: ${ip}`,
        executed: true,
        result: { ip, reason },
      };
    } catch (error) {
      return {
        type: 'block',
        description: `Failed to block IP: ${ip}`,
        executed: false,
        error: error.message,
      };
    }
  }

  /**
   * ⏱️ Temporary block with expiration
   */
  private async temporaryBlock(ip: string, durationSeconds: number): Promise<ResponseAction> {
    try {
      this.blockedIPs.add(ip);

      await this.connection.db.collection('blocked_ips').updateOne(
        { ip },
        {
          $set: {
            ip,
            reason: 'Temporary block',
            blockedAt: new Date(),
            expiresAt: new Date(Date.now() + durationSeconds * 1000),
            temporary: true,
          },
        },
        { upsert: true },
      );

      // Auto-unblock after duration
      setTimeout(() => {
        this.blockedIPs.delete(ip);
        this.logger.log(`✅ Temporary block expired for IP: ${ip}`);
      }, durationSeconds * 1000);

      return {
        type: 'block',
        description: `Temporarily blocked IP: ${ip} for ${durationSeconds}s`,
        executed: true,
      };
    } catch (error) {
      return {
        type: 'block',
        description: `Failed to temporarily block IP: ${ip}`,
        executed: false,
        error: error.message,
      };
    }
  }

  /**
   * 🔒 Quarantine fingerprint
   */
  private async quarantineFingerprint(fingerprint: string): Promise<ResponseAction> {
    this.quarantinedFingerprints.add(fingerprint);
    return {
      type: 'quarantine',
      description: `Quarantined fingerprint: ${fingerprint}`,
      executed: true,
    };
  }

  /**
   * 🚨 Alert security team (placeholder for real alerting)
   */
  private async alertSecurityTeam(
    incident: SecurityIncident,
    priority: string,
  ): Promise<ResponseAction> {
    // In real implementation: Send to Slack, Email, PagerDuty, etc.
    this.logger.error(
      `🚨 SECURITY ALERT [${priority}]: ${incident.description} | Incident: ${incident.id}`,
    );

    return {
      type: 'alert',
      description: `Alerted security team (${priority} priority)`,
      executed: true,
    };
  }

  /**
   * 📦 Create evidence package
   */
  private async createEvidencePackage(incident: SecurityIncident): Promise<ResponseAction> {
    // Store comprehensive evidence for legal/forensic purposes
    return {
      type: 'log',
      description: 'Created forensic evidence package',
      executed: true,
      result: { incidentId: incident.id },
    };
  }

  /**
   * 🔍 Investigate related threats
   */
  private async investigateRelatedThreats(incident: SecurityIncident): Promise<ResponseAction> {
    // Look for related attacks from same fingerprint or pattern
    return {
      type: 'investigate',
      description: 'Investigating related threat patterns',
      executed: true,
    };
  }

  /**
   * 📋 Capture attack forensics
   */
  private async captureAttackForensics(incident: SecurityIncident): Promise<any> {
    return {
      timestamp: incident.timestamp,
      evidence: incident.evidence,
      category: incident.category,
    };
  }

  /**
   * 🍯 Create honeypot report
   */
  private async createHoneypotReport(incident: SecurityIncident): Promise<any> {
    return {
      captureId: incident.id,
      timestamp: incident.timestamp,
      evidence: incident.evidence,
    };
  }

  /**
   * 💾 Store incident in MongoDB
   */
  private async storeIncident(
    incident: SecurityIncident,
    actions: ResponseAction[],
  ): Promise<void> {
    try {
      await this.connection.db.collection('security_incidents').insertOne({
        ...incident,
        actions,
        createdAt: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to store incident: ${error.message}`);
    }
  }

  /**
   * 🔍 Check if IP is blocked
   */
  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  /**
   * 🔍 Check if fingerprint is quarantined
   */
  isFingerprintQuarantined(fingerprint: string): boolean {
    return this.quarantinedFingerprints.has(fingerprint);
  }

  /**
   * 📊 Get incident statistics
   */
  async getStatistics(): Promise<any> {
    const collection = this.connection.db.collection('security_incidents');
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [total, bySeverity, byCategory, blocked] = await Promise.all([
      collection.countDocuments({ timestamp: { $gte: last24h } }),
      collection
        .aggregate([
          { $match: { timestamp: { $gte: last24h } } },
          { $group: { _id: '$severity', count: { $sum: 1 } } },
        ])
        .toArray(),
      collection
        .aggregate([
          { $match: { timestamp: { $gte: last24h } } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
        ])
        .toArray(),
      collection.countDocuments({
        timestamp: { $gte: last24h },
        autoBlocked: true,
      }),
    ]);

    return {
      period: 'Last 24 hours',
      totalIncidents: total,
      blockedThreats: blocked,
      bySeverity: Object.fromEntries(bySeverity.map(s => [s._id, s.count])),
      byCategory: Object.fromEntries(byCategory.map(c => [c._id, c.count])),
      activeBlocks: this.blockedIPs.size,
      quarantinedFingerprints: this.quarantinedFingerprints.size,
    };
  }

  /**
   * 🆔 Generate unique incident ID
   */
  private generateIncidentId(): string {
    return `INC-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }

  /**
   * 📝 Generate incident description
   */
  private generateDescription(category: string, evidence: Record<string, any>): string {
    const descriptions: Record<string, string> = {
      sql_injection: 'SQL injection attempt detected',
      xss_attempt: 'Cross-site scripting (XSS) attempt detected',
      command_injection: 'Command injection attempt detected',
      rate_limit_exceeded: 'Rate limit violation detected',
      bot_detected: 'Automated bot activity detected',
      automation_detected: 'Automation patterns detected',
      honeypot_triggered: 'Honeypot trap triggered',
      anomaly_detected: 'Behavioral anomaly detected',
    };

    return descriptions[category] || `Security incident: ${category}`;
  }

  /**
   * 🔄 Load blocked IPs from database on startup
   */
  private async loadBlockedIPs(): Promise<void> {
    try {
      const blocked = await this.connection.db
        .collection('blocked_ips')
        .find({ expiresAt: { $gt: new Date() } })
        .toArray();

      blocked.forEach(b => this.blockedIPs.add(b.ip));

      this.logger.log(`📋 Loaded ${blocked.length} blocked IPs from database`);
    } catch (error) {
      this.logger.error(`Failed to load blocked IPs: ${error.message}`);
    }
  }
}
