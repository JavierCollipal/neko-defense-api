// 🐾📚 NEKO DEFENSE - Case Pattern Schema 📚🐾
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CasePatternDocument = CasePattern & Document;

@Schema({ collection: 'case_patterns', timestamps: true })
export class CasePattern {
  @Prop({ required: true })
  pattern_id: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  problem: string;

  @Prop()
  solution: string;

  @Prop()
  category: string;

  @Prop()
  reusability: string; // high, medium, low

  @Prop()
  difficulty: string; // trivial, intermediate, advanced

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ type: [String] })
  related_patterns: string[];

  @Prop({ type: Number, default: 0 })
  usage_count: number;

  @Prop({ type: Date })
  last_used: Date;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const CasePatternSchema = SchemaFactory.createForClass(CasePattern);
