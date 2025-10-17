// 🐾🎯 NEKO DEFENSE - Hunt Conversation Schema 🎯🐾
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HuntConversationDocument = HuntConversation & Document;

@Schema({ collection: 'hunt_conversations', timestamps: true })
export class HuntConversation {
  @Prop({ required: true })
  session_id: string;

  @Prop({ type: [String] })
  keywords: string[];

  @Prop()
  hunt_type: string;

  @Prop()
  target_actor: string;

  @Prop()
  status: string; // active, completed, abandoned

  @Prop()
  outcome: string; // captured, escaped, monitoring

  @Prop({ type: Date })
  started_at: Date;

  @Prop({ type: Date })
  completed_at: Date;

  @Prop()
  evidence_collected: boolean;

  @Prop()
  evidence_package_id: string;

  @Prop({ type: Object })
  hunt_summary: Record<string, any>;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const HuntConversationSchema = SchemaFactory.createForClass(HuntConversation);
