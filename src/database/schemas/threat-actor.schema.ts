// 🐾🎯 NEKO DEFENSE - Threat Actor Schema 🎯🐾
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ThreatActorDocument = ThreatActor & Document;

@Schema({ collection: 'threat_actors', timestamps: true })
export class ThreatActor {
  @Prop({ required: true })
  actor_id: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  type: string;

  @Prop()
  category: string;

  @Prop()
  actor_classification: string;

  @Prop()
  network: string;

  @Prop({ type: Number })
  threat_level: number;

  @Prop({ type: Number })
  rank: number;

  @Prop()
  state_actor: boolean;

  @Prop()
  state_sponsored: boolean;

  @Prop()
  target_type: string;

  @Prop({ type: [String] })
  techniques: string[];

  @Prop({ type: [String] })
  iocs: string[];

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const ThreatActorSchema = SchemaFactory.createForClass(ThreatActor);
