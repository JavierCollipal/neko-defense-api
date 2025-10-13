// 🐾⚖️ NEKO DEFENSE - DINA GraphQL Types ⚖️🐾
import { ObjectType, Field, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class LegalStatusType {
  @Field()
  convicted: boolean;

  @Field({ nullable: true })
  status?: string;
}

@ObjectType()
export class DinaPerpType {
  @Field()
  id: string;

  @Field()
  fullName: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  position?: string;

  @Field({ nullable: true })
  role?: string;

  @Field(() => [String], { nullable: true })
  organization?: string[];

  @Field({ nullable: true })
  prosecution_status?: string;

  @Field({ nullable: true })
  legal_status?: string;

  @Field(() => LegalStatusType, { nullable: true })
  legalStatus?: LegalStatusType;

  @Field(() => [String], { nullable: true })
  major_crimes?: string[];

  @Field(() => [String], { nullable: true })
  crimesAccused?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;
}

@ObjectType()
export class DinaPerpetratorsStatsType {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  convicted: number;

  @Field(() => Int)
  unprosecuted: number;

  @Field(() => Int)
  total_known_agents: number;
}

@ObjectType()
export class DinaStatsType {
  @Field(() => Int)
  total_documents: number;

  @Field(() => DinaPerpetratorsStatsType)
  perpetrators: DinaPerpetratorsStatsType;

  @Field(() => Int)
  torture_centers: number;

  @Field(() => Int)
  international_crimes: number;

  @Field(() => Int)
  victims_estimated: number;

  @Field(() => Int)
  disappeared: number;

  @Field(() => Int)
  executed: number;

  @Field()
  last_updated: string;
}
