// 🐾⚖️ NEKO DEFENSE - DINA GraphQL Resolver ⚖️🐾
import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DinaService } from './dina.service';
import { DinaPerpType, DinaStatsType } from './dto/dina.type';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';

@Resolver(() => DinaPerpType)
export class DinaResolver {
  constructor(private dinaService: DinaService) {}

  /**
   * 📊 Get DINA statistics
   * 🔒 Requires authentication
   */
  @Query(() => DinaStatsType, {
    description: '📊 Get DINA documentation statistics, nyaa~!',
  })
  @UseGuards(GqlAuthGuard)
  async dinaStats(): Promise<DinaStatsType> {
    console.log('📊 [DinaResolver] Fetching DINA statistics');
    return this.dinaService.getDinaStats();
  }

  /**
   * 🎯 Get all DINA perpetrators
   * 🔒 Requires authentication
   */
  @Query(() => [DinaPerpType], {
    description: '🎯 Get all documented DINA perpetrators, desu~!',
  })
  @UseGuards(GqlAuthGuard)
  async dinaPerpetrators(): Promise<DinaPerpType[]> {
    console.log('🎯 [DinaResolver] Fetching DINA perpetrators');
    return this.dinaService.getDinaPerpetrators();
  }
}
