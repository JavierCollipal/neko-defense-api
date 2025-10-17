// 🐾📚 NEKO DEFENSE - Case Patterns Module 📚🐾
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CasePattern, CasePatternSchema } from '../database/schemas/case-pattern.schema';
import { CasePatternsServiceFunctional } from './case-patterns.service.functional';
import { CasePatternsResolver } from './case-patterns.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CasePattern.name, schema: CasePatternSchema },
    ]),
  ],
  providers: [
    CasePatternsServiceFunctional,
    CasePatternsResolver,
  ],
  exports: [CasePatternsServiceFunctional],
})
export class CasePatternsModule {
  constructor() {
    console.log('📚 CasePatternsModule initialized, nyaa~!');
  }
}
