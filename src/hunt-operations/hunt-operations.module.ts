// 🐾🎯 NEKO DEFENSE - Hunt Operations Module 🎯🐾
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HuntConversation, HuntConversationSchema } from '../database/schemas/hunt-conversation.schema';
import { HuntOperationsServiceFunctional } from './hunt-operations.service.functional';
import { HuntOperationsResolver } from './hunt-operations.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HuntConversation.name, schema: HuntConversationSchema },
    ]),
  ],
  providers: [
    HuntOperationsServiceFunctional,
    HuntOperationsResolver,
  ],
  exports: [HuntOperationsServiceFunctional],
})
export class HuntOperationsModule {
  constructor() {
    console.log('🎯 HuntOperationsModule initialized, nyaa~!');
  }
}
