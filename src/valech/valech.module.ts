// 🐾⚡ VALECH MODULE - Feature Module ⚡🐾
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ValechController } from './valech.controller';
import { ValechService } from './valech.service';
import { ValechVictim, ValechVictimSchema } from './schemas/valech-victim.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ValechVictim.name, schema: ValechVictimSchema },
    ]),
  ],
  controllers: [ValechController],
  providers: [ValechService],
  exports: [ValechService], // Export service for use in other modules
})
export class ValechModule {
  constructor() {
    console.log('🐾 ValechModule initialized - Historical justice API ready, nyaa~! ⚡✨');
  }
}
