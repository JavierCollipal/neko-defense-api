// 🐾🎯 NEKO DEFENSE - Threat Actors GraphQL Resolver 🎯🐾
import { Resolver, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ThreatActorsService } from './threat-actors.service';
import { ThreatActorType, ThreatCountsType } from './dto/threat-actor.type';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

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
   * 🌍 Supports translation via JWT language preference
   */
  @Query(() => [ThreatActorType], {
    description: '🎯 Get threat actors filtered by category with i18n support, desu~!',
  })
  @UseGuards(GqlAuthGuard)
  async threatActors(
    @Args('category', { type: () => String, defaultValue: 'all' }) category: string,
    @CurrentUser() user: any, // Get user from JWT (includes language)
  ): Promise<ThreatActorType[]> {
    const language = user?.language || 'en';
    console.log(`🎯 [ThreatActorsResolver] Fetching threat actors, category: ${category} | Language: ${language}`);
    return this.threatActorsService.getThreatActorsByCategory(category, language);
  }

  /**
   * 🔍 Get single threat actor by ID
   * 🔒 Requires authentication
   * 🌍 Supports translation via JWT language preference
   */
  @Query(() => ThreatActorType, {
    nullable: true,
    description: '🔍 Get specific threat actor by ID with i18n support, nyaa~!',
  })
  @UseGuards(GqlAuthGuard)
  async threatActor(
    @Args('actorId', { type: () => String }) actorId: string,
    @CurrentUser() user: any, // Get user from JWT (includes language)
  ): Promise<ThreatActorType> {
    const language = user?.language || 'en';
    console.log(`🔍 [ThreatActorsResolver] Fetching threat actor: ${actorId} | Language: ${language}`);
    return this.threatActorsService.getThreatActorById(actorId, language);
  }
}
