// 🐾🎯 NEKO DEFENSE - Hunt Conversation GraphQL Type 🎯🐾
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class HuntConversationType {
  @Field(() => ID)
  _id: string;

  @Field()
  session_id: string;

  @Field(() => [String], { nullable: true })
  keywords?: string[];

  @Field({ nullable: true })
  hunt_type?: string;

  @Field({ nullable: true })
  target_actor?: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  outcome?: string;

  @Field({ nullable: true })
  started_at?: Date;

  @Field({ nullable: true })
  completed_at?: Date;

  @Field({ nullable: true })
  evidence_collected?: boolean;

  @Field({ nullable: true })
  evidence_package_id?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  hunt_summary?: Record<string, any>;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;
}

@ObjectType()
export class HuntStatsType {
  @Field(() => Int)
  total_hunts: number;

  @Field(() => Int)
  active_hunts: number;

  @Field(() => Int)
  completed_hunts: number;

  @Field(() => Int)
  successful_captures: number;

  @Field(() => [String])
  recent_targets: string[];

  @Field(() => [String])
  top_keywords: string[];
}
