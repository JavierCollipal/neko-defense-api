// 🐾🎯 NEKO DEFENSE - Threat Actors GraphQL Resolver 🎯🐾
import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ThreatActorsService } from './threat-actors.service';
import { ThreatActorType, ThreatCountsType } from './dto/threat-actor.type';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';

@Resolver(() => ThreatActorType)
export class ThreatActorsResolver {
  constructor(private threatActorsService: ThreatActorsService) {}

  /**
   * 📊 Get threat counts by category
   * 🔒 Requires authentication
   */
  @Query(() => ThreatCountsType, {
    description: '📊 Get threat actor counts by category, nyaa~!',
  })
  @UseGuards(GqlAuthGuard)
  async threatCounts(): Promise<ThreatCountsType> {
    console.log('📊 [ThreatActorsResolver] Fetching threat counts');
    return this.threatActorsService.getThreatCounts();
  }

  /**
   * 🎯 Get threat actors by category
   * 🔒 Requires authentication
   */
  @Query(() => [ThreatActorType], {
    description: '🎯 Get threat actors filtered by category, desu~!',
  })
  @UseGuards(GqlAuthGuard)
  async threatActors(
    @Args('category', { type: () => String, defaultValue: 'all' }) category: string,
  ): Promise<ThreatActorType[]> {
    console.log(`🎯 [ThreatActorsResolver] Fetching threat actors, category: ${category}`);
    return this.threatActorsService.getThreatActorsByCategory(category);
  }

  /**
   * 🔍 Get single threat actor by ID
   * 🔒 Requires authentication
   */
  @Query(() => ThreatActorType, {
    nullable: true,
    description: '🔍 Get specific threat actor by ID, nyaa~!',
  })
  @UseGuards(GqlAuthGuard)
  async threatActor(
    @Args('actorId', { type: () => String }) actorId: string,
  ): Promise<ThreatActorType> {
    console.log(`🔍 [ThreatActorsResolver] Fetching threat actor: ${actorId}`);
    return this.threatActorsService.getThreatActorById(actorId);
  }
}
