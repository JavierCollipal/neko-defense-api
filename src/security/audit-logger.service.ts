// 🐾⚡ AUDIT LOGGER SERVICE - 2025 Structured Logging ⚡🐾
// Advanced logging with audit trails for compliance & forensics, nyaa~!

import { Injectable, Logger, LogLevel } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

export interface AuditEvent {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'critical';
  category: 'auth' | 'access' | 'security' | 'data' | 'system';
  action: string;
  actor?: {
    ip: string;
    userId?: string;
    userAgent?: string;
  };
  resource?: {
    type: string;
    id?: string;
  };
  result: 'success' | 'failure' | 'blocked';
  details?: Record<string, any>;
  threatScore?: number;
  tags?: string[];
}

@Injectable()
export class AuditLoggerService {
  private readonly logger = new Logger(AuditLoggerService.name);
  private auditBuffer: AuditEvent[] = [];
  private readonly BUFFER_SIZE = 100;
  private readonly FLUSH_INTERVAL = 10000; // 10 seconds

  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {
    this.logger.log('📝 Audit Logger initialized with structured logging (2025 standard)!');

    // Periodically flush audit logs to MongoDB
    setInterval(() => this.flushAuditLogs(), this.FLUSH_INTERVAL);
  }

  /**
   * 📝 Log audit event with structured format
   */
  async log(event: Partial<AuditEvent>): Promise<void> {
    const fullEvent: AuditEvent = {
      timestamp: new Date(),
      level: event.level || 'info',
      category: event.category || 'system',
      action: event.action || 'unknown',
      result: event.result || 'success',
      actor: event.actor,
      resource: event.resource,
      details: event.details,
      threatScore: event.threatScore,
      tags: event.tags || [],
    };

    // Add to buffer
    this.auditBuffer.push(fullEvent);

    // Console log for immediate visibility
    const logMessage = this.formatLogMessage(fullEvent);
    switch (fullEvent.level) {
      case 'critical':
      case 'error':
        this.logger.error(logMessage);
        break;
      case 'warn':
        this.logger.warn(logMessage);
        break;
      default:
        this.logger.log(logMessage);
    }

    // Flush if buffer is full
    if (this.auditBuffer.length >= this.BUFFER_SIZE) {
      await this.flushAuditLogs();
    }
  }

  /**
   * 🔐 Log authentication events
   */
  async logAuth(
    action: 'login' | 'logout' | 'token_refresh' | 'token_revoked',
    result: 'success' | 'failure',
    ip: string,
    userId?: string,
    details?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      level: result === 'failure' ? 'warn' : 'info',
      category: 'auth',
      action,
      result,
      actor: { ip, userId },
      details,
      tags: ['authentication'],
    });
  }

  /**
   * 🚨 Log security events
   */
  async logSecurity(
    action: string,
    ip: string,
    threatScore: number,
    result: 'success' | 'failure' | 'blocked',
    details?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      level: threatScore >= 70 ? 'critical' : threatScore >= 40 ? 'warn' : 'info',
      category: 'security',
      action,
      result,
      actor: { ip },
      threatScore,
      details,
      tags: ['threat-detection', 'ai-ml'],
    });
  }

  /**
   * 📊 Log data access events (for compliance)
   */
  async logDataAccess(
    action: 'read' | 'write' | 'delete' | 'export',
    resourceType: string,
    resourceId: string,
    userId: string,
    ip: string,
    result: 'success' | 'failure',
  ): Promise<void> {
    await this.log({
      level: 'info',
      category: 'data',
      action: `data_${action}`,
      result,
      actor: { ip, userId },
      resource: { type: resourceType, id: resourceId },
      tags: ['data-access', 'compliance'],
    });
  }

  /**
   * 💾 Flush audit logs to MongoDB
   */
  private async flushAuditLogs(): Promise<void> {
    if (this.auditBuffer.length === 0) return;

    try {
      const collection = this.connection.db.collection('audit_logs');
      await collection.insertMany([...this.auditBuffer]);

      this.logger.debug(
        `📝 Flushed ${this.auditBuffer.length} audit logs to MongoDB`,
      );
      this.auditBuffer = [];
    } catch (error) {
      this.logger.error(
        `❌ Failed to flush audit logs: ${error.message}`,
        error.stack,
      );
      // Keep logs in buffer for retry
    }
  }

  /**
   * 📋 Format log message for console output
   */
  private formatLogMessage(event: AuditEvent): string {
    const parts = [
      `[${event.category.toUpperCase()}]`,
      event.action,
      `(${event.result})`,
    ];

    if (event.actor?.ip) {
      parts.push(`IP: ${event.actor.ip}`);
    }

    if (event.threatScore !== undefined) {
      parts.push(`Threat: ${event.threatScore}`);
    }

    if (event.details) {
      const detailsStr = JSON.stringify(event.details);
      if (detailsStr.length < 100) {
        parts.push(detailsStr);
      }
    }

    return parts.join(' | ');
  }

  /**
   * 🔍 Query audit logs (for investigation)
   */
  async queryLogs(
    filters: {
      startDate?: Date;
      endDate?: Date;
      category?: string;
      level?: string;
      ip?: string;
      userId?: string;
      minThreatScore?: number;
    },
    limit: number = 100,
  ): Promise<AuditEvent[]> {
    // First flush current buffer
    await this.flushAuditLogs();

    const query: any = {};

    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = filters.startDate;
      if (filters.endDate) query.timestamp.$lte = filters.endDate;
    }

    if (filters.category) query.category = filters.category;
    if (filters.level) query.level = filters.level;
    if (filters.ip) query['actor.ip'] = filters.ip;
    if (filters.userId) query['actor.userId'] = filters.userId;
    if (filters.minThreatScore !== undefined) {
      query.threatScore = { $gte: filters.minThreatScore };
    }

    const collection = this.connection.db.collection('audit_logs');
    return collection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray() as unknown as Promise<AuditEvent[]>;
  }

  /**
   * 📊 Get audit statistics
   */
  async getStatistics(hours: number = 24): Promise<any> {
    await this.flushAuditLogs();

    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    const collection = this.connection.db.collection('audit_logs');

    const [totalCount, byCategory, byLevel, highThreat] = await Promise.all([
      collection.countDocuments({ timestamp: { $gte: startDate } }),
      collection
        .aggregate([
          { $match: { timestamp: { $gte: startDate } } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
        ])
        .toArray(),
      collection
        .aggregate([
          { $match: { timestamp: { $gte: startDate } } },
          { $group: { _id: '$level', count: { $sum: 1 } } },
        ])
        .toArray(),
      collection.countDocuments({
        timestamp: { $gte: startDate },
        threatScore: { $gte: 40 },
      }),
    ]);

    return {
      period: `Last ${hours} hours`,
      totalEvents: totalCount,
      byCategory: Object.fromEntries(byCategory.map(c => [c._id, c.count])),
      byLevel: Object.fromEntries(byLevel.map(l => [l._id, l.count])),
      highThreatEvents: highThreat,
    };
  }
}
