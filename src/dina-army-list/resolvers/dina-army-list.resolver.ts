/**
 * DINA Army List GraphQL Resolver
 *
 * NestJS GraphQL resolver for 1097 DINA agents
 *
 * Generated with Claude Code (Neko-Arc + Mario + Noel + Glam + Hannibal + Tetora)
 */

import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DINAArmyListService } from '../services/dina-army-list.service';
import {
  DINAAgent,
  DINAAgentsPaginated,
  DINAStatistics,
  DINAAgentFilter,
  DINASortBy,
  CreateDINAAgentInput,
  UpdateDINAAgentInput,
} from '../dto/dina-army-list.dto';

@Resolver(() => DINAAgent)
export class DINAArmyListResolver {
  constructor(private readonly dinaService: DINAArmyListService) {}

  /**
   * Get paginated DINA agents
   */
  @Query(() => DINAAgentsPaginated, {
    description: 'Get paginated list of DINA agents with optional filters',
  })
  async getDINAAgents(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
    @Args('sortBy', { type: () => DINASortBy, nullable: true })
    sortBy?: DINASortBy,
    @Args('filter', { type: () => DINAAgentFilter, nullable: true })
    filter?: DINAAgentFilter
  ): Promise<DINAAgentsPaginated> {
    // Limit maximum results per page
    const safeLimit = Math.min(limit, 100);

    const result = await this.dinaService.findAll(
      page,
      safeLimit,
      sortBy || DINASortBy.FULL_NAME_ASC,
      filter
    );

    return {
      agents: result.items as any, // Type assertion for Mongoose Document to GraphQL DTO
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      },
    };
  }

  /**
   * Get single DINA agent by ID
   */
  @Query(() => DINAAgent, {
    nullable: true,
    description: 'Get a single DINA agent by agent_id',
  })
  async getDINAAgent(
    @Args('agent_id', { type: () => String }) agent_id: string
  ): Promise<DINAAgent | null> {
    return this.dinaService.findOne(agent_id) as any;
  }

  /**
   * Search DINA agents by name
   */
  @Query(() => [DINAAgent], {
    description: 'Search DINA agents by name using text search',
  })
  async searchDINAAgents(
    @Args('query', { type: () => String}) query: string,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number
  ): Promise<DINAAgent[]> {
    const safeLimit = Math.min(limit, 50);
    return this.dinaService.search(query, safeLimit) as any;
  }

  /**
   * Get DINA statistics
   */
  @Query(() => DINAStatistics, {
    description: 'Get aggregated statistics for DINA agents database',
  })
  async getDINAStatistics(): Promise<DINAStatistics> {
    return this.dinaService.getStatistics();
  }

  /**
   * Create new DINA agent (admin only)
   */
  @Mutation(() => DINAAgent, {
    description: 'Create new DINA agent record (admin only)',
  })
  // @UseGuards(JwtAuthGuard, AdminGuard) // Uncomment when auth is implemented
  async createDINAAgent(
    @Args('input', { type: () => CreateDINAAgentInput }) input: CreateDINAAgentInput,
    @Context() context: any
  ): Promise<DINAAgent> {
    const userId = context.req?.user?.id || 'admin';
    return this.dinaService.create(input, userId) as any;
  }

  /**
   * Update DINA agent (admin only)
   */
  @Mutation(() => DINAAgent, {
    nullable: true,
    description: 'Update DINA agent record (admin only)',
  })
  // @UseGuards(JwtAuthGuard, AdminGuard) // Uncomment when auth is implemented
  async updateDINAAgent(
    @Args('agent_id', { type: () => String }) agent_id: string,
    @Args('input', { type: () => UpdateDINAAgentInput }) input: UpdateDINAAgentInput
  ): Promise<DINAAgent | null> {
    return this.dinaService.update(agent_id, input) as any;
  }

  /**
   * Delete DINA agent (admin only)
   */
  @Mutation(() => Boolean, {
    description: 'Delete DINA agent record (admin only)',
  })
  // @UseGuards(JwtAuthGuard, AdminGuard) // Uncomment when auth is implemented
  async deleteDINAAgent(
    @Args('agent_id', { type: () => String }) agent_id: string
  ): Promise<boolean> {
    return this.dinaService.delete(agent_id);
  }
}
