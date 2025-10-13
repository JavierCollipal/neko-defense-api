// 🐾⚖️ NEKO DEFENSE - DINA Perpetrator Schema ⚖️🐾
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DinaPerpDocument = DinaPerp & Document;

@Schema({ collection: 'dina_perpetrators', timestamps: true })
export class DinaPerp {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  fullName: string;

  @Prop()
  name: string;

  @Prop()
  position: string;

  @Prop()
  role: string;

  @Prop({ type: [String] })
  organization: string[];

  @Prop()
  prosecution_status: string;

  @Prop()
  legal_status: string;

  @Prop({ type: Object })
  legalStatus: {
    convicted: boolean;
    status: string;
  };

  @Prop({ type: [String] })
  major_crimes: string[];

  @Prop({ type: [String] })
  crimesAccused: string[];

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const DinaPerpSchema = SchemaFactory.createForClass(DinaPerp);
