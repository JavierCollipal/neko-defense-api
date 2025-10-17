// 🐾🍯 NEKO DEFENSE - Honeypot Triggers GraphQL Resolver 🍯🐾
import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { HoneypotTriggersServiceFunctional } from './honeypot-triggers.service.functional';
import { HoneypotTriggerType, HoneypotSummaryType } from './dto/honeypot-trigger.type';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';

@Resolver(() => HoneypotTriggerType)
export class HoneypotTriggersResolver {
  constructor(private honeypotTriggersService: HoneypotTriggersServiceFunctional) {}

  /**
   * 🍯 Get all honeypot triggers
   * 🔒 Requires authentication
   */
  @Query(() => [HoneypotTriggerType], {
    description: '🍯 Get honeypot triggers with optional filtering, nyaa~!',
  })
  @UseGuards(GqlAuthGuard)
  async honeypotTriggers(
    @Args('trapName', { type: () => String, nullable: true }) trapName?: string,
    @Args('limit', { type: () => Int, defaultValue: 100 }) limit?: number,
  ): Promise<HoneypotTriggerType[]> {
    console.log(`🍯 [HoneypotTriggersResolver] Fetching triggers, trap: ${trapName || 'all'}`);
    return this.honeypotTriggersService.getHoneypotTriggers(trapName, limit) as Promise<HoneypotTriggerType[]>;
  }

  /**
   * 📊 Get honeypot statistics summary
   * 🔒 Requires authentication
   */
  @Query(() => HoneypotSummaryType, {
    description: '📊 Get honeypot activity summary and stats, desu~!',
  })
  @UseGuards(GqlAuthGuard)
  async honeypotSummary(): Promise<HoneypotSummaryType> {
    console.log('📊 [HoneypotTriggersResolver] Fetching honeypot summary');
    return this.honeypotTriggersService.getHoneypotSummary();
  }

  /**
   * 🔍 Get triggers by IP address
   * 🔒 Requires authentication
   */
  @Query(() => [HoneypotTriggerType], {
    description: '🔍 Get all triggers from a specific IP address, nyaa~!',
  })
  @UseGuards(GqlAuthGuard)
  async honeypotTriggersByIp(
    @Args('ipAddress', { type: () => String }) ipAddress: string,
  ): Promise<HoneypotTriggerType[]> {
    console.log(`🔍 [HoneypotTriggersResolver] Fetching triggers for IP: ${ipAddress}`);
    return this.honeypotTriggersService.getTriggersByIp(ipAddress) as Promise<HoneypotTriggerType[]>;
  }

  /**
   * 🚨 Get recent high-threat triggers
   * 🔒 Requires authentication
   */
  @Query(() => [HoneypotTriggerType], {
    description: '🚨 Get recent high-threat honeypot triggers, desu~!',
  })
  @UseGuards(GqlAuthGuard)
  async recentHighThreatTriggers(
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit?: number,
  ): Promise<HoneypotTriggerType[]> {
    console.log(`🚨 [HoneypotTriggersResolver] Fetching recent high-threat triggers`);
    return this.honeypotTriggersService.getRecentHighThreatTriggers(limit) as Promise<HoneypotTriggerType[]>;
  }
}
