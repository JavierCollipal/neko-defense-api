// 🐾📚 NEKO DEFENSE - Case Patterns GraphQL Resolver 📚🐾
import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CasePatternsServiceFunctional } from './case-patterns.service.functional';
import { CasePatternType, CasePatternStatsType } from './dto/case-pattern.type';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';

@Resolver(() => CasePatternType)
export class CasePatternsResolver {
  constructor(private casePatternsService: CasePatternsServiceFunctional) {}

  /**
   * 📚 Get all case patterns
   * 🔒 Requires authentication
   */
  @Query(() => [CasePatternType], {
    description: '📚 Get learned case patterns with optional filtering, nyaa~!',
  })
  @UseGuards(GqlAuthGuard)
  async casePatterns(
    @Args('reusability', { type: () => String, nullable: true }) reusability?: string,
    @Args('limit', { type: () => Int, defaultValue: 100 }) limit?: number,
  ): Promise<CasePatternType[]> {
    console.log(`📚 [CasePatternsResolver] Fetching patterns, reusability: ${reusability || 'all'}`);
    return this.casePatternsService.getCasePatterns(reusability, limit) as Promise<CasePatternType[]>;
  }

  /**
   * 📊 Get case pattern statistics
   * 🔒 Requires authentication
   */
  @Query(() => CasePatternStatsType, {
    description: '📊 Get case pattern statistics and insights, desu~!',
  })
  @UseGuards(GqlAuthGuard)
  async casePatternStats(): Promise<CasePatternStatsType> {
    console.log('📊 [CasePatternsResolver] Fetching stats');
    return this.casePatternsService.getCasePatternStats();
  }

  /**
   * 🔍 Get pattern by ID
   * 🔒 Requires authentication
   */
  @Query(() => CasePatternType, {
    nullable: true,
    description: '🔍 Get specific case pattern by ID, nyaa~!',
  })
  @UseGuards(GqlAuthGuard)
  async casePattern(
    @Args('patternId', { type: () => String }) patternId: string,
  ): Promise<CasePatternType> {
    console.log(`🔍 [CasePatternsResolver] Fetching pattern: ${patternId}`);
    return this.casePatternsService.getCasePatternById(patternId) as Promise<CasePatternType>;
  }
}
