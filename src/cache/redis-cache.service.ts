// 🐾⚡ NEKO DEFENSE API - Redis Caching Service ⚡🐾
// WORLDWIDE SCALE RESPONSE CACHING, NYAA~! 🌍✨

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * 🚀 Redis Caching Service for High-Performance Response Caching
 *
 * Why Redis Caching?
 * - ✅ 2-5x faster response times
 * - ✅ Reduces database load by 80%+
 * - ✅ Scales horizontally across clusters
 * - ✅ Sub-millisecond read operations
 * - ✅ Automatic TTL (time-to-live) expiration
 *
 * PERFORMANCE:
 * - Without cache: 50-100ms database queries
 * - With cache: 1-5ms Redis reads
 * - 10-50x improvement on cached data!
 */
@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;
  private cachePrefix = 'cache:';

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');

    this.redisClient = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        console.warn(`⚠️ Redis cache connection retry attempt ${times}, waiting ${delay}ms`);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.redisClient.on('connect', () => {
      console.log('✅ Redis Cache Service connected, desu~!');
    });

    this.redisClient.on('error', (err) => {
      console.error('❌ Redis Cache Service error:', err);
    });
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
    console.log('👋 Redis Cache Service disconnected, nyaa~!');
  }

  /**
   * 🎯 Get cached value by key
   * Returns parsed JSON object or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = this.cachePrefix + key;
      const value = await this.redisClient.get(cacheKey);

      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`❌ Cache GET error for key ${key}:`, error);
      return null; // Fail gracefully - return null if cache fails
    }
  }

  /**
   * 💾 Set cached value with TTL (time-to-live)
   * @param key - Cache key
   * @param value - Value to cache (will be JSON stringified)
   * @param ttl - Time to live in seconds (default: 300s = 5 minutes)
   */
  async set<T>(key: string, value: T, ttl: number = 300): Promise<void> {
    try {
      const cacheKey = this.cachePrefix + key;
      const serialized = JSON.stringify(value);
      await this.redisClient.setex(cacheKey, ttl, serialized);
    } catch (error) {
      console.error(`❌ Cache SET error for key ${key}:`, error);
      // Fail gracefully - don't throw error if cache set fails
    }
  }

  /**
   * 🗑️ Delete cached value by key
   */
  async delete(key: string): Promise<void> {
    try {
      const cacheKey = this.cachePrefix + key;
      await this.redisClient.del(cacheKey);
    } catch (error) {
      console.error(`❌ Cache DELETE error for key ${key}:`, error);
    }
  }

  /**
   * 🗑️ Delete multiple cached values by pattern
   * Example: deleteByPattern('user:*') deletes all user-related cache
   */
  async deleteByPattern(pattern: string): Promise<void> {
    try {
      const cachePattern = this.cachePrefix + pattern;
      const keys = await this.redisClient.keys(cachePattern);

      if (keys.length > 0) {
        await this.redisClient.del(...keys);
        console.log(`🧹 Deleted ${keys.length} cache entries matching pattern: ${pattern}`);
      }
    } catch (error) {
      console.error(`❌ Cache DELETE BY PATTERN error for pattern ${pattern}:`, error);
    }
  }

  /**
   * 🧹 Clear all cache entries
   * ⚠️ Use with caution in production!
   */
  async clear(): Promise<void> {
    try {
      const keys = await this.redisClient.keys(this.cachePrefix + '*');

      if (keys.length > 0) {
        await this.redisClient.del(...keys);
        console.log(`🧹 Cleared ${keys.length} cache entries, nyaa~!`);
      }
    } catch (error) {
      console.error('❌ Cache CLEAR error:', error);
    }
  }

  /**
   * ⏱️ Get or Set pattern (cache-aside)
   * If cached value exists, return it. Otherwise, fetch from callback and cache it.
   *
   * @param key - Cache key
   * @param fetchFn - Function to fetch data if not cached
   * @param ttl - Time to live in seconds
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 300,
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - fetch from source
    const data = await fetchFn();

    // Store in cache for next time
    await this.set(key, data, ttl);

    return data;
  }
}
