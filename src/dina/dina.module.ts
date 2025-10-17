// 🐾⚖️ NEKO DEFENSE - DINA Module (FUNCTIONAL REFACTOR) ⚖️🐾
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DinaPerp, DinaPerpSchema } from '../database/schemas/dina-perpetrator.schema';
import { DinaService } from './dina.service';
import { DinaServiceFunctional } from './dina.service.functional';
import { DinaResolver } from './dina.resolver';
import { DinaController } from './dina.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DinaPerp.name, schema: DinaPerpSchema },
    ]),
  ],
  controllers: [DinaController],
  providers: [
    // Use functional service (pure functions, immutable)
    DinaServiceFunctional,
    // Provide alias for backward compatibility
    { provide: DinaService, useClass: DinaServiceFunctional },
    DinaResolver,
  ],
  exports: [DinaService, DinaServiceFunctional],
})
export class DinaModule {
  constructor() {
    console.log('⚖️ DinaModule initialized with FUNCTIONAL PROGRAMMING - DINA documentation ready (REST + GraphQL), nyaa~!');
  }
}
