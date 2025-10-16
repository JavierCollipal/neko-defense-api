// 🐾⚖️ NEKO DEFENSE - DINA Perpetrator Schema ⚖️🐾
// COMPREHENSIVE SCHEMA - Updated to match frontend wanted agents data structure
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
  codename: string; // NEW: Agent codename/alias for operations

  @Prop()
  alias: string; // NEW: Public alias

  @Prop()
  position: string;

  @Prop()
  role: string;

  @Prop()
  rank: string; // NEW: Military rank

  @Prop({ type: [String] })
  organization: string[];

  @Prop()
  status: string; // NEW: Current status (AT LARGE, CONVICTED - IMPRISONED, DECEASED, etc.)

  @Prop()
  prosecution_status: string;

  @Prop()
  legal_status: string;

  // COMPREHENSIVE Legal Status Object
  @Prop({ type: Object })
  legalStatus: {
    convicted: boolean;
    status?: string;
    currentStatus?: string;
    sentences?: string;
    charges?: string;
    prisonLocation?: string;
    extraditionStatus?: string;
    prosecution?: string;
    recentConvictions?: string;
    specialNotes?: string;
  };

  // Research & Work Capabilities - NEW!
  @Prop()
  researchCapability: string; // Intelligence/research capabilities

  @Prop()
  workCapability: string; // Operational work capabilities

  @Prop({ type: [String] })
  major_crimes: string[];

  @Prop({ type: [String] })
  crimesAccused: string[];

  @Prop({ type: [String] })
  notableOperations: string[]; // NEW: Major operations participated in

  @Prop({ type: [String] })
  timeline: string[]; // NEW: Timeline of events

  @Prop()
  verificationStatus: string; // NEW: Research verification status

  @Prop()
  significance: string; // NEW: Historical significance

  @Prop({ type: [String] })
  tags: string[]; // NEW: Classification tags

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const DinaPerpSchema = SchemaFactory.createForClass(DinaPerp);
