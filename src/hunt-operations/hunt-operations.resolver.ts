// 🐾🎯 NEKO DEFENSE - Hunt Operations GraphQL Resolver 🎯🐾
import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { HuntOperationsServiceFunctional } from './hunt-operations.service.functional';
import { HuntConversationType, HuntStatsType } from './dto/hunt-conversation.type';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';

@Resolver(() => HuntConversationType)
export class HuntOperationsResolver {
  constructor(private huntOperationsService: HuntOperationsServiceFunctional) {}

  /**
   * 🎯 Get all hunt conversations
   * 🔒 Requires authentication
   */
  @Query(() => [HuntConversationType], {
    description: '🎯 Get hunt conversations with optional status filtering, nyaa~!',
  })
  @UseGuards(GqlAuthGuard)
  async huntConversations(
    @Args('status', { type: () => String, nullable: true }) status?: string,
    @Args('limit', { type: () => Int, defaultValue: 50 }) limit?: number,
  ): Promise<HuntConversationType[]> {
    console.log(`🎯 [HuntOperationsResolver] Fetching hunts, status: ${status || 'all'}`);
    return this.huntOperationsService.getHuntConversations(status, limit) as Promise<HuntConversationType[]>;
  }

  /**
   * 📊 Get hunt statistics
   * 🔒 Requires authentication
   */
  @Query(() => HuntStatsType, {
    description: '📊 Get comprehensive hunt operation statistics, desu~!',
  })
  @UseGuards(GqlAuthGuard)
  async huntStats(): Promise<HuntStatsType> {
    console.log('📊 [HuntOperationsResolver] Fetching hunt stats');
    return this.huntOperationsService.getHuntStats();
  }

  /**
   * 🔍 Get hunt by session ID
   * 🔒 Requires authentication
   */
  @Query(() => HuntConversationType, {
    nullable: true,
    description: '🔍 Get specific hunt conversation by session ID, nyaa~!',
  })
  @UseGuards(GqlAuthGuard)
  async huntConversation(
    @Args('sessionId', { type: () => String }) sessionId: string,
  ): Promise<HuntConversationType> {
    console.log(`🔍 [HuntOperationsResolver] Fetching hunt: ${sessionId}`);
    return this.huntOperationsService.getHuntBySessionId(sessionId) as Promise<HuntConversationType>;
  }
}
