// 🐾⚡ AI/ML BEHAVIORAL ANOMALY DETECTION - 2025 Edition ⚡🐾
// Based on latest white hat defensive techniques, nyaa~!

import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

export interface RequestProfile {
  ip: string;
  userAgent: string;
  endpoint: string;
  method: string;
  timestamp: Date;
  responseTime: number;
  statusCode: number;
  payloadSize: number;
  headers: Record<string, string>;
}

export interface ThreatScore {
  score: number; // 0-100 (0 = safe, 100 = maximum threat)
  factors: string[];
  recommendation: 'allow' | 'challenge' | 'block';
  confidence: number; // 0-1
}

@Injectable()
export class AnomalyDetectorService {
  private readonly logger = new Logger(AnomalyDetectorService.name);
  private requestHistory: Map<string, RequestProfile[]> = new Map();
  private readonly HISTORY_WINDOW = 60 * 60 * 1000; // 1 hour
  private readonly MAX_REQUESTS_PER_IP = 1000;

  // 🎯 Threat patterns learned from 2025 attack trends
  private readonly SUSPICIOUS_PATTERNS = {
    userAgents: [
      /sqlmap/i,
      /nikto/i,
      /nmap/i,
      /masscan/i,
      /zgrab/i,
      /censys/i,
      /shodan/i,
      /python-requests/i, // Legitimate but often used in attacks
      /curl\/[0-9]/i, // CLI tools without custom UA
    ],
    paths: [
      /\.\.\//, // Directory traversal
      /(union|select|insert|update|delete|drop).*(from|table)/i, // SQL injection
      /<script|javascript:|onerror=/i, // XSS attempts
      /\.(env|git|sql|bak|backup|config)/i, // Sensitive file access
      /\/admin|\/wp-admin|\/phpmyadmin/i, // Admin panel scanning
      /(cmd|exec|eval|system)\(/i, // Command injection
    ],
    headers: {
      suspiciousCount: 3, // Less than 3 headers is suspicious
      requiredHeaders: ['user-agent', 'accept'],
    },
  };

  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {
    this.logger.log('🤖 AI Anomaly Detector initialized with 2025 threat models!');
    // Cleanup old history every 5 minutes
    setInterval(() => this.cleanupHistory(), 5 * 60 * 1000);
  }

  /**
   * 🧠 Analyze request for anomalous behavior using ML-inspired heuristics
   * Based on 2025 AI threat detection best practices
   */
  async analyzeRequest(profile: RequestProfile): Promise<ThreatScore> {
    const factors: string[] = [];
    let score = 0;

    // 📊 Get historical behavior for this IP
    const history = this.getIpHistory(profile.ip);

    // 🔍 DETECTION RULE 1: Request frequency analysis
    const frequencyScore = this.analyzeRequestFrequency(history, profile);
    score += frequencyScore.score;
    factors.push(...frequencyScore.factors);

    // 🕵️ DETECTION RULE 2: User agent analysis
    const uaScore = this.analyzeUserAgent(profile.userAgent);
    score += uaScore.score;
    factors.push(...uaScore.factors);

    // 🎯 DETECTION RULE 3: Path/endpoint analysis
    const pathScore = this.analyzeEndpoint(profile.endpoint);
    score += pathScore.score;
    factors.push(...pathScore.factors);

    // 🧪 DETECTION RULE 4: Header fingerprinting
    const headerScore = this.analyzeHeaders(profile.headers);
    score += headerScore.score;
    factors.push(...headerScore.factors);

    // ⏱️ DETECTION RULE 5: Response time patterns (slow/fast anomalies)
    const timingScore = this.analyzeResponseTiming(history, profile);
    score += timingScore.score;
    factors.push(...timingScore.factors);

    // 📦 DETECTION RULE 6: Payload size analysis
    const payloadScore = this.analyzePayloadSize(history, profile);
    score += payloadScore.score;
    factors.push(...payloadScore.factors);

    // 🎲 DETECTION RULE 7: Behavioral consistency (2025 AI technique)
    const behaviorScore = this.analyzeBehavioralConsistency(history, profile);
    score += behaviorScore.score;
    factors.push(...behaviorScore.factors);

    // 📝 Store this request in history
    this.addToHistory(profile);

    // 🎯 Calculate confidence based on amount of data
    const confidence = Math.min(history.length / 10, 1.0); // More data = higher confidence

    // 🚦 Make recommendation
    let recommendation: 'allow' | 'challenge' | 'block';
    if (score >= 70) {
      recommendation = 'block';
    } else if (score >= 40) {
      recommendation = 'challenge';
    } else {
      recommendation = 'allow';
    }

    const result: ThreatScore = {
      score: Math.min(score, 100),
      factors: factors.filter(f => f), // Remove empty factors
      recommendation,
      confidence,
    };

    // 📊 Log high-threat detections
    if (score >= 40) {
      this.logger.warn(
        `🚨 Anomaly detected! IP: ${profile.ip}, Score: ${score}, Factors: ${factors.join(', ')}`,
      );
    }

    return result;
  }

  /**
   * 📊 Analyze request frequency for rate-based anomalies
   */
  private analyzeRequestFrequency(
    history: RequestProfile[],
    current: RequestProfile,
  ): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 0;

    const recentRequests = history.filter(
      r => Date.now() - r.timestamp.getTime() < 60000, // Last minute
    );

    // Burst detection (2025 technique)
    if (recentRequests.length > 50) {
      score += 30;
      factors.push(`High request rate: ${recentRequests.length}/min`);
    } else if (recentRequests.length > 30) {
      score += 15;
      factors.push(`Elevated request rate: ${recentRequests.length}/min`);
    }

    // Endpoint scanning detection
    const uniqueEndpoints = new Set(history.slice(-20).map(r => r.endpoint));
    if (uniqueEndpoints.size > 15) {
      score += 25;
      factors.push(`Endpoint scanning detected: ${uniqueEndpoints.size} unique paths`);
    }

    return { score, factors };
  }

  /**
   * 🕵️ Analyze user agent for automation/attack tools
   */
  private analyzeUserAgent(userAgent: string): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 0;

    if (!userAgent || userAgent.length < 10) {
      score += 20;
      factors.push('Missing or suspicious User-Agent');
    }

    // Check against known attack tool patterns
    for (const pattern of this.SUSPICIOUS_PATTERNS.userAgents) {
      if (pattern.test(userAgent)) {
        score += 40;
        factors.push(`Attack tool detected in UA: ${userAgent.substring(0, 50)}`);
        break;
      }
    }

    return { score, factors };
  }

  /**
   * 🎯 Analyze endpoint for malicious patterns
   */
  private analyzeEndpoint(endpoint: string): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 0;

    for (const pattern of this.SUSPICIOUS_PATTERNS.paths) {
      if (pattern.test(endpoint)) {
        score += 35;
        factors.push(`Malicious pattern in path: ${endpoint}`);
      }
    }

    return { score, factors };
  }

  /**
   * 🧪 Analyze HTTP headers for fingerprinting
   */
  private analyzeHeaders(headers: Record<string, string>): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 0;

    const headerKeys = Object.keys(headers).map(k => k.toLowerCase());

    // Too few headers = likely automation
    if (headerKeys.length < this.SUSPICIOUS_PATTERNS.headers.suspiciousCount) {
      score += 15;
      factors.push(`Minimal headers: ${headerKeys.length} headers`);
    }

    // Missing required headers
    for (const required of this.SUSPICIOUS_PATTERNS.headers.requiredHeaders) {
      if (!headerKeys.includes(required.toLowerCase())) {
        score += 10;
        factors.push(`Missing header: ${required}`);
      }
    }

    return { score, factors };
  }

  /**
   * ⏱️ Analyze response timing patterns
   */
  private analyzeResponseTiming(
    history: RequestProfile[],
    current: RequestProfile,
  ): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 0;

    if (history.length < 5) return { score, factors };

    // Calculate average response time
    const avgResponseTime =
      history.reduce((sum, r) => sum + r.responseTime, 0) / history.length;

    // Unusually fast requests (automation indicator)
    if (current.responseTime < avgResponseTime * 0.3 && avgResponseTime > 100) {
      score += 10;
      factors.push(`Unusually fast response: ${current.responseTime}ms vs ${avgResponseTime.toFixed(0)}ms avg`);
    }

    return { score, factors };
  }

  /**
   * 📦 Analyze payload sizes for anomalies
   */
  private analyzePayloadSize(
    history: RequestProfile[],
    current: RequestProfile,
  ): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 0;

    // Unusually large payloads (potential DoS or data exfiltration)
    if (current.payloadSize > 10 * 1024 * 1024) { // 10MB
      score += 20;
      factors.push(`Large payload: ${(current.payloadSize / 1024 / 1024).toFixed(2)}MB`);
    }

    return { score, factors };
  }

  /**
   * 🎲 Analyze behavioral consistency using ML-inspired techniques (2025)
   * Detects when behavior suddenly changes (account takeover indicator)
   */
  private analyzeBehavioralConsistency(
    history: RequestProfile[],
    current: RequestProfile,
  ): { score: number; factors: string[] } {
    const factors: string[] = [];
    let score = 0;

    if (history.length < 10) return { score, factors };

    // Check if User-Agent suddenly changed
    const recentUAs = history.slice(-10).map(r => r.userAgent);
    const uaChanges = new Set(recentUAs).size;
    if (uaChanges > 3) {
      score += 15;
      factors.push(`User-Agent switching detected: ${uaChanges} different UAs`);
    }

    // Check if request patterns suddenly changed
    const recentMethods = history.slice(-10).map(r => r.method);
    const methodVariety = new Set(recentMethods).size;
    if (methodVariety >= 4) {
      score += 10;
      factors.push(`Unusual method variety: ${methodVariety} different methods`);
    }

    return { score, factors };
  }

  /**
   * 📝 Add request to historical tracking
   */
  private addToHistory(profile: RequestProfile): void {
    const history = this.requestHistory.get(profile.ip) || [];
    history.push(profile);

    // Limit history size per IP
    if (history.length > this.MAX_REQUESTS_PER_IP) {
      history.shift();
    }

    this.requestHistory.set(profile.ip, history);
  }

  /**
   * 📊 Get historical requests for an IP
   */
  private getIpHistory(ip: string): RequestProfile[] {
    return this.requestHistory.get(ip) || [];
  }

  /**
   * 🧹 Cleanup old history data
   */
  private cleanupHistory(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [ip, history] of this.requestHistory.entries()) {
      const filtered = history.filter(
        r => now - r.timestamp.getTime() < this.HISTORY_WINDOW,
      );

      if (filtered.length === 0) {
        this.requestHistory.delete(ip);
        cleaned++;
      } else if (filtered.length !== history.length) {
        this.requestHistory.set(ip, filtered);
      }
    }

    if (cleaned > 0) {
      this.logger.log(`🧹 Cleaned up history for ${cleaned} IPs`);
    }
  }

  /**
   * 📈 Get threat statistics
   */
  getStatistics() {
    const totalIPs = this.requestHistory.size;
    const totalRequests = Array.from(this.requestHistory.values())
      .reduce((sum, history) => sum + history.length, 0);

    return {
      totalIPs,
      totalRequests,
      averageRequestsPerIP: totalIPs > 0 ? (totalRequests / totalIPs).toFixed(2) : 0,
      memoryUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
    };
  }
}
