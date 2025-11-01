/**
 * DINA Army List DTOs
 *
 * GraphQL object types and input types for NestJS
 *
 * Generated with Claude Code (Neko-Arc + Mario + Noel + Glam + Hannibal + Tetora)
 */

import { ObjectType, Field, ID, Int, InputType, registerEnumType } from '@nestjs/graphql';

/**
 * Enums
 */
export enum DINACategory {
  DINA_STATE_STAFF = 'DINA_State_Staff',
  REGIONAL_COMMAND = 'Regional_Command',
  BRIGADE = 'Brigade',
  DEPARTMENT = 'Department',
  ENLISTED = 'Enlisted',
  OTHER = 'Other',
}

export enum LegalStatus {
  CONVICTED = 'convicted',
  INDICTED = 'indicted',
  INVESTIGATED = 'investigated',
  AT_LARGE = 'at_large',
  DECEASED = 'deceased',
  UNPROSECUTED = 'unprosecuted',
  UNKNOWN = 'unknown',
}

export enum Confidence {
  CONFIRMED = 'confirmed',
  PROBABLE = 'probable',
  ALLEGED = 'alleged',
}

export enum VerificationStatus {
  VERIFIED = 'verified',
  PENDING = 'pending',
  DISPUTED = 'disputed',
}

export enum DINASortBy {
  FULL_NAME_ASC = 'full_name_asc',
  FULL_NAME_DESC = 'full_name_desc',
  RANK_ASC = 'rank_asc',
  RANK_DESC = 'rank_desc',
  CATEGORY_ASC = 'category_asc',
  CATEGORY_DESC = 'category_desc',
  LEGAL_STATUS_ASC = 'legal_status_asc',
  LEGAL_STATUS_DESC = 'legal_status_desc',
  CREATED_AT_ASC = 'created_at_asc',
  CREATED_AT_DESC = 'created_at_desc',
}

// Register enums for GraphQL
registerEnumType(DINACategory, { name: 'DINACategory' });
registerEnumType(LegalStatus, { name: 'LegalStatus' });
registerEnumType(Confidence, { name: 'Confidence' });
registerEnumType(VerificationStatus, { name: 'VerificationStatus' });
registerEnumType(DINASortBy, { name: 'DINASortBy' });

/**
 * Nested object types
 */
@ObjectType()
export class Conviction {
  @Field()
  case_name: string;

  @Field()
  verdict: string;

  @Field({ nullable: true })
  sentence?: string;

  @Field()
  date: string;
}

@ObjectType()
export class Investigation {
  @Field()
  case_name: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  judge?: string;
}

@ObjectType()
export class PostDINAPosition {
  @Field()
  institution: string;

  @Field()
  rank: string;

  @Field()
  position: string;

  @Field({ nullable: true })
  period_start?: string;

  @Field({ nullable: true })
  period_end?: string;
}

@ObjectType()
export class DataSource {
  @Field()
  source_name: string;

  @Field(() => Confidence)
  confidence: Confidence;

  @Field()
  extracted_date: string;
}

/**
 * Main DINA Agent type
 */
@ObjectType()
export class DINAAgent {
  @Field(() => ID)
  agent_id: string;

  @Field()
  full_name: string;

  @Field({ nullable: true })
  rut?: string;

  @Field()
  rank: string;

  @Field({ nullable: true })
  branch?: string;

  @Field({ nullable: true })
  service_number?: string;

  @Field(() => DINACategory)
  category: DINACategory;

  @Field({ nullable: true })
  region?: string;

  @Field({ nullable: true })
  brigade?: string;

  @Field({ nullable: true })
  department?: string;

  @Field({ nullable: true })
  position?: string;

  @Field(() => Int, { nullable: true })
  position_number?: number;

  @Field({ nullable: true })
  service_period_start?: string;

  @Field({ nullable: true })
  service_period_end?: string;

  @Field({ nullable: true })
  service_period_text?: string;

  @Field(() => LegalStatus, { nullable: true })
  legal_status?: LegalStatus;

  @Field(() => [Conviction], { nullable: true })
  convictions?: Conviction[];

  @Field(() => [Investigation], { nullable: true })
  investigations?: Investigation[];

  @Field(() => [PostDINAPosition], { nullable: true })
  post_dina_positions?: PostDINAPosition[];

  @Field(() => [String], { nullable: true })
  known_operations?: string[];

  @Field(() => [String], { nullable: true })
  alleged_crimes?: string[];

  @Field(() => [String], { nullable: true })
  victims_linked?: string[];

  @Field(() => [DataSource])
  data_sources: DataSource[];

  @Field(() => [String], { nullable: true })
  aliases?: string[];

  @Field({ nullable: true })
  photo_url?: string;

  @Field({ nullable: true })
  biographical_notes?: string;

  @Field()
  created_at: string;

  @Field()
  updated_at: string;

  @Field()
  created_by: string;

  @Field(() => VerificationStatus)
  verification_status: VerificationStatus;
}

/**
 * Pagination info
 */
@ObjectType()
export class PaginationInfo {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;
}

/**
 * Paginated agents response
 */
@ObjectType()
export class DINAAgentsPaginated {
  @Field(() => [DINAAgent])
  agents: DINAAgent[];

  @Field(() => PaginationInfo)
  pagination: PaginationInfo;
}

/**
 * Statistics aggregations
 */
@ObjectType()
export class CategoryCount {
  @Field(() => DINACategory)
  category: DINACategory;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class LegalStatusCount {
  @Field(() => LegalStatus)
  status: LegalStatus;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class RegionCount {
  @Field()
  region: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class BrigadeCount {
  @Field()
  brigade: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class DINAStatistics {
  @Field(() => Int)
  total_agents: number;

  @Field(() => [CategoryCount])
  by_category: CategoryCount[];

  @Field(() => [LegalStatusCount])
  by_legal_status: LegalStatusCount[];

  @Field(() => [RegionCount])
  by_region: RegionCount[];

  @Field(() => [BrigadeCount])
  by_brigade: BrigadeCount[];

  @Field(() => Int)
  verified_count: number;

  @Field(() => Int)
  pending_count: number;
}

/**
 * Input Types
 */
@InputType()
export class DINAAgentFilter {
  @Field(() => DINACategory, { nullable: true })
  category?: DINACategory;

  @Field({ nullable: true })
  region?: string;

  @Field({ nullable: true })
  brigade?: string;

  @Field(() => LegalStatus, { nullable: true })
  legal_status?: LegalStatus;

  @Field({ nullable: true })
  rank?: string;

  @Field(() => VerificationStatus, { nullable: true })
  verification_status?: VerificationStatus;

  @Field({ nullable: true })
  search?: string;
}

@InputType()
export class CreateDINAAgentInput {
  @Field()
  full_name: string;

  @Field({ nullable: true })
  rut?: string;

  @Field()
  rank: string;

  @Field({ nullable: true })
  branch?: string;

  @Field(() => DINACategory)
  category: DINACategory;

  @Field({ nullable: true })
  region?: string;

  @Field({ nullable: true })
  brigade?: string;

  @Field({ nullable: true })
  department?: string;

  @Field({ nullable: true })
  position?: string;

  @Field({ nullable: true })
  service_period_text?: string;

  @Field(() => LegalStatus, { nullable: true })
  legal_status?: LegalStatus;

  @Field({ nullable: true })
  biographical_notes?: string;
}

@InputType()
export class UpdateDINAAgentInput {
  @Field({ nullable: true })
  full_name?: string;

  @Field({ nullable: true })
  rut?: string;

  @Field({ nullable: true })
  rank?: string;

  @Field({ nullable: true })
  branch?: string;

  @Field(() => DINACategory, { nullable: true })
  category?: DINACategory;

  @Field({ nullable: true })
  region?: string;

  @Field({ nullable: true })
  brigade?: string;

  @Field(() => LegalStatus, { nullable: true })
  legal_status?: LegalStatus;

  @Field({ nullable: true })
  biographical_notes?: string;

  @Field(() => VerificationStatus, { nullable: true })
  verification_status?: VerificationStatus;
}
