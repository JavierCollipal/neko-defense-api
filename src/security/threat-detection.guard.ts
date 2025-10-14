// 🐾⚡ THREAT DETECTION GUARD - 2025 Zero-Trust Security ⚡🐾
// Intercepts ALL requests and applies AI/ML threat analysis, nyaa~!

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { AnomalyDetectorService, RequestProfile } from './anomaly-detector.service';

@Injectable()
export class ThreatDetectionGuard implements CanActivate {
  private readonly logger = new Logger(ThreatDetectionGuard.name);

  constructor(private readonly anomalyDetector: AnomalyDetectorService) {
    this.logger.log('🛡️ Threat Detection Guard activated with AI/ML protection!');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Track request start time for response time analysis
    const startTime = Date.now();

    // 🔍 Build request profile for AI analysis
    const profile: RequestProfile = {
      ip: this.extractClientIp(request),
      userAgent: request.headers['user-agent'] || '',
      endpoint: request.url || request.path || '/',
      method: request.method,
      timestamp: new Date(),
      responseTime: 0, // Will be calculated
      statusCode: 200, // Default, will be updated
      payloadSize: this.calculatePayloadSize(request),
      headers: this.sanitizeHeaders(request.headers),
    };

    try {
      // 🤖 Run AI/ML threat analysis
      const threatScore = await this.anomalyDetector.analyzeRequest(profile);

      // 📊 Add threat metadata to request for logging
      request.nekoThreatScore = threatScore;

      // 🚦 Handle threat level
      if (threatScore.recommendation === 'block') {
        this.logger.warn(
          `🚫 REQUEST BLOCKED - IP: ${profile.ip}, Score: ${threatScore.score}, Factors: ${threatScore.factors.join(', ')}`,
        );

        // Add security headers
        response.setHeader('X-Neko-Threat-Score', threatScore.score.toString());
        response.setHeader('X-Neko-Defense', 'BLOCKED');

        throw new ForbiddenException({
          message: 'Request blocked by security policy',
          threatScore: threatScore.score,
          securityId: this.generateSecurityId(),
        });
      }

      if (threatScore.recommendation === 'challenge') {
        // Add warning headers but allow request
        response.setHeader('X-Neko-Threat-Score', threatScore.score.toString());
        response.setHeader('X-Neko-Defense', 'MONITORING');

        this.logger.warn(
          `⚠️ SUSPICIOUS REQUEST - IP: ${profile.ip}, Score: ${threatScore.score}, Factors: ${threatScore.factors.join(', ')}`,
        );
      }

      // ✅ Request allowed (but still monitored)
      if (threatScore.score > 0) {
        response.setHeader('X-Neko-Threat-Score', threatScore.score.toString());
        response.setHeader('X-Neko-Defense', 'ACTIVE');
      }

      // 📈 Update response time after request completes
      response.on('finish', () => {
        profile.responseTime = Date.now() - startTime;
        profile.statusCode = response.statusCode;
      });

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      // Don't let security errors break the application
      this.logger.error(`❌ Threat detection error: ${error.message}`, error.stack);
      return true; // Fail open (allow request if security check fails)
    }
  }

  /**
   * 🌐 Extract real client IP (handles proxies, load balancers)
   * 2025 best practice: Trust X-Forwarded-For but validate
   */
  private extractClientIp(request: any): string {
    // Priority order for IP detection
    const candidates = [
      request.headers['x-forwarded-for']?.split(',')[0]?.trim(),
      request.headers['x-real-ip'],
      request.headers['cf-connecting-ip'], // Cloudflare
      request.connection?.remoteAddress,
      request.socket?.remoteAddress,
      request.ip,
    ];

    for (const candidate of candidates) {
      if (candidate && this.isValidIp(candidate)) {
        return candidate;
      }
    }

    return 'unknown';
  }

  /**
   * ✅ Validate IP address format
   */
  private isValidIp(ip: string): boolean {
    // IPv4 or IPv6 validation
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * 📦 Calculate request payload size
   */
  private calculatePayloadSize(request: any): number {
    try {
      if (request.headers['content-length']) {
        return parseInt(request.headers['content-length'], 10) || 0;
      }

      if (request.body) {
        return JSON.stringify(request.body).length;
      }

      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * 🧹 Sanitize headers for security analysis
   */
  private sanitizeHeaders(headers: any): Record<string, string> {
    const sanitized: Record<string, string> = {};

    // Only keep relevant headers for analysis
    const relevantHeaders = [
      'user-agent',
      'accept',
      'accept-language',
      'accept-encoding',
      'referer',
      'origin',
      'connection',
      'content-type',
    ];

    for (const header of relevantHeaders) {
      if (headers[header]) {
        sanitized[header] = String(headers[header]).substring(0, 200); // Limit length
      }
    }

    return sanitized;
  }

  /**
   * 🆔 Generate unique security incident ID
   */
  private generateSecurityId(): string {
    return `NEKO-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }
}
