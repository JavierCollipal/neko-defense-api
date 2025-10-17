// 🐾🍯 NEKO DEFENSE - Honeypot Trigger Schema 🍯🐾
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HoneypotTriggerDocument = HoneypotTrigger & Document;

@Schema({ collection: 'honeypot_triggers', timestamps: true })
export class HoneypotTrigger {
  @Prop({ required: true })
  trap_name: string;

  @Prop({ required: true })
  ip_address: string;

  @Prop({ required: true })
  triggered_at: Date;

  @Prop()
  user_agent: string;

  @Prop()
  request_path: string;

  @Prop()
  request_method: string;

  @Prop({ type: Object })
  request_headers: Record<string, any>;

  @Prop({ type: Object })
  request_body: Record<string, any>;

  @Prop()
  threat_level: string;

  @Prop()
  action_taken: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const HoneypotTriggerSchema = SchemaFactory.createForClass(HoneypotTrigger);
