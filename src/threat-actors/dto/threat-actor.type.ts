// 🐾🎯 NEKO DEFENSE - Threat Actor GraphQL Type 🎯🐾
import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class ThreatActorType {
  @Field(() => ID)
  actor_id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  actor_classification?: string;

  @Field({ nullable: true })
  network?: string;

  @Field(() => Int, { nullable: true })
  threat_level?: number;

  @Field(() => Int, { nullable: true })
  rank?: number;

  @Field({ nullable: true })
  state_actor?: boolean;

  @Field({ nullable: true })
  state_sponsored?: boolean;

  @Field({ nullable: true })
  target_type?: string;

  @Field(() => [String], { nullable: true })
  techniques?: string[];

  @Field(() => [String], { nullable: true })
  iocs?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;
}

@ObjectType()
export class ThreatCountsType {
  @Field(() => Int)
  all: number;

  @Field(() => Int)
  predators: number;

  @Field(() => Int)
  pedophiles: number;

  @Field(() => Int)
  dina_network: number;

  @Field(() => Int)
  ransomware: number;

  @Field(() => Int)
  state_sponsored: number;

  @Field(() => Int)
  crypto_crime: number;
}
