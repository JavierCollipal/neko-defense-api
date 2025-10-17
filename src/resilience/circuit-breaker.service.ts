// 🐾⚡ NEKO DEFENSE API - Circuit Breaker Service ⚡🐾
// FAULT TOLERANCE FOR WORLDWIDE SCALE, NYAA~! 🌍✨

import { Injectable } from '@nestjs/common';
import CircuitBreaker from 'opossum';

/**
 * 🛡️ Circuit Breaker Service for Fault Tolerance
 *
 * What is a Circuit Breaker?
 * - Protects your API from cascading failures
 * - If external service (DB, API) fails repeatedly, stop calling it temporarily
 * - Allows system to recover gracefully instead of crashing
 *
 * States:
 * - 🟢 CLOSED: Normal operation, all requests pass through
 * - 🔴 OPEN: Service is failing, requests fail immediately (fast-fail)
 * - 🟡 HALF_OPEN: Testing if service recovered, allow few requests
 *
 * BENEFITS:
 * - ✅ Prevents cascade failures
 * - ✅ Fast failure (don't wait for timeout)
 * - ✅ Automatic recovery detection
 * - ✅ Protects downstream services
 * - ✅ Better error messages to users
 *
 * CONFIGURATION:
 * - Timeout: 3000ms (fail if operation takes longer)
 * - Error threshold: 50% (open circuit if >50% requests fail)
 * - Reset timeout: 30s (try to recover after 30s)
 * - Rolling count timeout: 10s (measure errors over 10s window)
 */
@Injectable()
export class CircuitBreakerService {
  private breakers = new Map<string, CircuitBreaker>();

  /**
   * 🔧 Create or get existing circuit breaker
   *
   * @param name - Unique identifier for this breaker
   * @param options - Circuit breaker configuration
   */
  getBreaker<T>(
    name: string,
    asyncFunction: (...args: any[]) => Promise<T>,
    options?: {
      timeout?: number;
      errorThresholdPercentage?: number;
      resetTimeout?: number;
      rollingCountTimeout?: number;
    },
  ): CircuitBreaker<any[], T> {
    // Return existing breaker if already created
    if (this.breakers.has(name)) {
      return this.breakers.get(name) as CircuitBreaker<any[], T>;
    }

    // Create new circuit breaker
    const breaker = new CircuitBreaker<any[], T>(asyncFunction, {
      timeout: options?.timeout || 3000, // 3 seconds
      errorThresholdPercentage: options?.errorThresholdPercentage || 50, // 50%
      resetTimeout: options?.resetTimeout || 30000, // 30 seconds
      rollingCountTimeout: options?.rollingCountTimeout || 10000, // 10 seconds
    });

    // Event listeners for monitoring
    breaker.on('open', () => {
      console.warn(`🔴 Circuit breaker OPENED for: ${name} (service failing!)`);
    });

    breaker.on('halfOpen', () => {
      console.log(`🟡 Circuit breaker HALF-OPEN for: ${name} (testing recovery...)`);
    });

    breaker.on('close', () => {
      console.log(`🟢 Circuit breaker CLOSED for: ${name} (service recovered!)`);
    });

    breaker.on('timeout', () => {
      console.error(`⏱️ Circuit breaker TIMEOUT for: ${name}`);
    });

    breaker.on('failure', (error) => {
      console.error(`❌ Circuit breaker FAILURE for: ${name}:`, error.message);
    });

    breaker.on('success', () => {
      // Success logging (can be commented out if too verbose)
      // console.log(`✅ Circuit breaker SUCCESS for: ${name}`);
    });

    // Store breaker for reuse
    this.breakers.set(name, breaker);

    console.log(`🛡️ Circuit breaker created for: ${name}, nyaa~!`);

    return breaker;
  }

  /**
   * 📊 Get circuit breaker stats
   */
  getStats(name: string): any {
    const breaker = this.breakers.get(name);
    if (!breaker) {
      return null;
    }

    return {
      name,
      state: breaker.opened ? 'OPEN' : breaker.halfOpen ? 'HALF_OPEN' : 'CLOSED',
      stats: breaker.stats,
    };
  }

  /**
   * 📊 Get all circuit breakers stats
   */
  getAllStats(): any[] {
    const stats: any[] = [];

    this.breakers.forEach((breaker, name) => {
      stats.push(this.getStats(name));
    });

    return stats;
  }

  /**
   * 🔄 Manually reset a circuit breaker
   */
  reset(name: string): void {
    const breaker = this.breakers.get(name);
    if (breaker) {
      breaker.close();
      console.log(`🔄 Circuit breaker RESET for: ${name}, desu~!`);
    }
  }

  /**
   * 🔄 Reset all circuit breakers
   */
  resetAll(): void {
    this.breakers.forEach((breaker, name) => {
      breaker.close();
      console.log(`🔄 Circuit breaker RESET for: ${name}`);
    });
    console.log('🔄 All circuit breakers RESET, nyaa~!');
  }
}
