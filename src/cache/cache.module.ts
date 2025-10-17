// 🐾⚡ NEKO DEFENSE API - Cache Module ⚡🐾
// WORLDWIDE SCALE CACHING INFRASTRUCTURE, NYAA~! 🌍✨

import { Module, Global } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';
import { CacheInterceptor } from './cache-interceptor.interceptor';

@Global() // Make cache services available everywhere!
@Module({
  providers: [RedisCacheService, CacheInterceptor],
  exports: [RedisCacheService, CacheInterceptor],
})
export class CacheModule {
  constructor() {
    console.log('⚡ CACHE MODULE LOADED - Response caching activated, nyaa~! 🚀✨');
  }
}
