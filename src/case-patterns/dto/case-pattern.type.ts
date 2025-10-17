// 🐾📚 NEKO DEFENSE - Case Pattern GraphQL Type 📚🐾
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class CasePatternType {
  @Field(() => ID)
  _id: string;

  @Field()
  pattern_id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  problem?: string;

  @Field({ nullable: true })
  solution?: string;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  reusability?: string;

  @Field({ nullable: true })
  difficulty?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => [String], { nullable: true })
  related_patterns?: string[];

  @Field(() => Int, { nullable: true })
  usage_count?: number;

  @Field({ nullable: true })
  last_used?: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;
}

@ObjectType()
export class CasePatternStatsType {
  @Field(() => Int)
  total_patterns: number;

  @Field(() => Int)
  high_reusability: number;

  @Field(() => [String])
  top_categories: string[];

  @Field(() => [CasePatternType])
  most_used: CasePatternType[];
}
