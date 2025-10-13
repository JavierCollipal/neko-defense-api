// 🐾🎯 NEKO DEFENSE - Threat Actors Module 🎯🐾
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThreatActor, ThreatActorSchema } from '../database/schemas/threat-actor.schema';
import { ThreatActorsService } from './threat-actors.service';
import { ThreatActorsResolver } from './threat-actors.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ThreatActor.name, schema: ThreatActorSchema },
    ]),
  ],
  providers: [ThreatActorsService, ThreatActorsResolver],
  exports: [ThreatActorsService],
})
export class ThreatActorsModule {
  constructor() {
    console.log('🎯 ThreatActorsModule initialized, nyaa~!');
  }
}
