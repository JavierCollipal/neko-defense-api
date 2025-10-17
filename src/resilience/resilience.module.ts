// 🐾⚡ NEKO DEFENSE API - Resilience Module ⚡🐾
// FAULT TOLERANCE & CIRCUIT BREAKERS, NYAA~! 🌍✨

import { Module, Global } from '@nestjs/common';
import { CircuitBreakerService } from './circuit-breaker.service';

@Global() // Make resilience services available everywhere!
@Module({
  providers: [CircuitBreakerService],
  exports: [CircuitBreakerService],
})
export class ResilienceModule {
  constructor() {
    console.log('🛡️ RESILIENCE MODULE LOADED - Circuit breakers activated, nyaa~! ⚡✨');
  }
}
