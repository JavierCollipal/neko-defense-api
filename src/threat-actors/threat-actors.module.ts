// 🐾🎯 NEKO DEFENSE - Threat Actors Module (FUNCTIONAL REFACTOR) 🎯🐾
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThreatActor, ThreatActorSchema } from '../database/schemas/threat-actor.schema';
import { ThreatActorsService } from './threat-actors.service';
import { ThreatActorsServiceFunctional } from './threat-actors.service.functional';
import { ThreatActorsResolver } from './threat-actors.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ThreatActor.name, schema: ThreatActorSchema },
    ]),
  ],
  providers: [
    // Use functional service (pure functions, immutable)
    ThreatActorsServiceFunctional,
    // Provide alias for backward compatibility
    { provide: ThreatActorsService, useClass: ThreatActorsServiceFunctional },
    ThreatActorsResolver,
  ],
  exports: [ThreatActorsService, ThreatActorsServiceFunctional],
})
export class ThreatActorsModule {
  constructor() {
    console.log('🎯 ThreatActorsModule initialized with FUNCTIONAL PROGRAMMING, nyaa~!');
  }
}
