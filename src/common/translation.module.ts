// 🐾🌍 NEKO DEFENSE API - Translation Module 🌍🐾
import { Module, Global } from '@nestjs/common';
import { TranslationService } from './services/translation.service';

@Global() // Make translation service available everywhere, nyaa~!
@Module({
  providers: [TranslationService],
  exports: [TranslationService],
})
export class TranslationModule {
  constructor() {
    console.log('🌍 TRANSLATION MODULE LOADED - Multilingual support active, desu~! ⚡');
  }
}
