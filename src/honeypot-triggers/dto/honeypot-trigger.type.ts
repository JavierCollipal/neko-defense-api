// 🐾🍯 NEKO DEFENSE - Honeypot Trigger GraphQL Type 🍯🐾
import { ObjectType, Field, ID } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class HoneypotTriggerType {
  @Field(() => ID)
  _id: string;

  @Field()
  trap_name: string;

  @Field()
  ip_address: string;

  @Field()
  triggered_at: Date;

  @Field({ nullable: true })
  user_agent?: string;

  @Field({ nullable: true })
  request_path?: string;

  @Field({ nullable: true })
  request_method?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  request_headers?: Record<string, any>;

  @Field(() => GraphQLJSON, { nullable: true })
  request_body?: Record<string, any>;

  @Field({ nullable: true })
  threat_level?: string;

  @Field({ nullable: true })
  action_taken?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;
}

@ObjectType()
export class HoneypotStatsType {
  @Field()
  trap_name: string;

  @Field()
  trigger_count: number;

  @Field({ nullable: true })
  last_triggered?: Date;

  @Field(() => [String])
  unique_ips: string[];
}

@ObjectType()
export class HoneypotSummaryType {
  @Field()
  total_triggers: number;

  @Field()
  unique_traps: number;

  @Field()
  unique_ips: number;

  @Field(() => HoneypotStatsType, { nullable: true })
  most_active_trap?: HoneypotStatsType;

  @Field(() => [HoneypotStatsType])
  trap_stats: HoneypotStatsType[];
}
