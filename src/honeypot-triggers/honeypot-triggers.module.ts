// 🐾🍯 NEKO DEFENSE - Honeypot Triggers Module 🍯🐾
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HoneypotTrigger, HoneypotTriggerSchema } from '../database/schemas/honeypot-trigger.schema';
import { HoneypotTriggersServiceFunctional } from './honeypot-triggers.service.functional';
import { HoneypotTriggersResolver } from './honeypot-triggers.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HoneypotTrigger.name, schema: HoneypotTriggerSchema },
    ]),
  ],
  providers: [
    HoneypotTriggersServiceFunctional,
    HoneypotTriggersResolver,
  ],
  exports: [HoneypotTriggersServiceFunctional],
})
export class HoneypotTriggersModule {
  constructor() {
    console.log('🍯 HoneypotTriggersModule initialized with FUNCTIONAL PROGRAMMING, nyaa~!');
  }
}
