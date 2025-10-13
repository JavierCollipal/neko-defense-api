// 🐾⚖️ NEKO DEFENSE - DINA Module ⚖️🐾
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DinaPerp, DinaPerpSchema } from '../database/schemas/dina-perpetrator.schema';
import { DinaService } from './dina.service';
import { DinaResolver } from './dina.resolver';
import { DinaController } from './dina.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DinaPerp.name, schema: DinaPerpSchema },
    ]),
  ],
  controllers: [DinaController],
  providers: [DinaService, DinaResolver],
  exports: [DinaService],
})
export class DinaModule {
  constructor() {
    console.log('⚖️ DinaModule initialized - DINA documentation ready (REST + GraphQL), nyaa~!');
  }
}
