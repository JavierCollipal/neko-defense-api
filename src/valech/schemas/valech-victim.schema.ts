// 🐾⚡ VALECH VICTIM SCHEMA - Mongoose Model ⚡🐾
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ValechVictimDocument = ValechVictim & Document;

// Sub-schemas for nested objects
@Schema({ _id: false })
export class DetentionInfo {
  @Prop()
  arrested?: Date;

  @Prop()
  released?: Date;

  @Prop()
  duration?: number;

  @Prop()
  circumstances?: string;
}

@Schema({ _id: false })
export class DetentionCenter {
  @Prop({ required: true })
  name: string;

  @Prop()
  codeName?: string;

  @Prop({ type: Object })
  datesHeld?: {
    from?: Date;
    to?: Date;
  };
}

@Schema({ _id: false })
export class TortureReported {
  @Prop({ type: [String] })
  methods?: string[];

  @Prop({ type: [String] })
  perpetrators?: string[];

  @Prop({ type: [String] })
  witnesses?: string[];

  @Prop()
  medicalConsequences?: string;
}

@Schema({ _id: false })
export class Reparations {
  @Prop({ type: Boolean })
  awarded?: boolean;

  @Prop({ type: [String] })
  types?: string[];

  @Prop({ type: Number })
  amount?: number;

  @Prop()
  dateAwarded?: Date;
}

@Schema({ _id: false })
export class Source {
  @Prop()
  commission?: string;

  @Prop()
  verificationStatus?: string;
}

@Schema({ _id: false })
export class Metadata {
  @Prop()
  ingestionDate?: Date;

  @Prop()
  parserVersion?: string;

  @Prop({ type: Number })
  confidence?: number;

  @Prop()
  category?: string;
}

// Main Valech Victim Schema
@Schema({ collection: 'valech_victims', timestamps: true })
export class ValechVictim {
  @Prop({ required: true, index: true })
  fullName: string;

  @Prop({ index: true })
  idNumber?: string;

  @Prop()
  age?: number;

  @Prop()
  gender?: string;

  @Prop()
  occupation?: string;

  @Prop()
  politicalAffiliation?: string;

  @Prop({ type: DetentionInfo })
  detentionInfo?: DetentionInfo;

  @Prop({ type: [DetentionCenter] })
  detentionCenters?: DetentionCenter[];

  @Prop({ type: TortureReported })
  tortureReported?: TortureReported;

  @Prop()
  outcome?: string;

  @Prop({ type: String })
  testimonyText?: string;

  @Prop({ type: Reparations })
  reparations?: Reparations;

  @Prop({ type: Source })
  source?: Source;

  @Prop({ type: [String], index: true })
  linkedPerpetrators?: string[];

  @Prop()
  significance?: string;

  @Prop({ type: Metadata })
  metadata?: Metadata;
}

export const ValechVictimSchema = SchemaFactory.createForClass(ValechVictim);

// Create indexes for efficient querying
ValechVictimSchema.index({ fullName: 1 });
ValechVictimSchema.index({ idNumber: 1 });
ValechVictimSchema.index({ 'detentionCenters.name': 1 });
ValechVictimSchema.index({ linkedPerpetrators: 1 });
ValechVictimSchema.index({ 'metadata.category': 1 });
ValechVictimSchema.index({ outcome: 1 });
