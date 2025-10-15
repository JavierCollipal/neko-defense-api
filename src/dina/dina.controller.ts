// 🐾⚖️ NEKO DEFENSE - DINA REST Controller ⚖️🐾
import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { DinaService } from './dina.service';

@Controller('api/dina')
export class DinaController {
  constructor(private readonly dinaService: DinaService) {
    console.log('⚖️ [DinaController] REST API endpoints initialized, nyaa~!');
  }

  /**
   * 📊 GET /api/dina/stats
   * Returns DINA statistics for the dashboard
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getStats() {
    console.log('📊 [DinaController] GET /api/dina/stats - Fetching DINA statistics');

    try {
      const stats = await this.dinaService.getDinaStats();

      return {
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ [DinaController] Error fetching DINA stats:', error);
      return {
        success: false,
        error: 'Failed to fetch DINA statistics',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 🎯 GET /api/dina/perpetrators
   * Returns all documented DINA perpetrators
   */
  @Get('perpetrators')
  @HttpCode(HttpStatus.OK)
  async getPerpetrators() {
    console.log('🎯 [DinaController] GET /api/dina/perpetrators - Fetching DINA agents');

    try {
      const perpetrators = await this.dinaService.getDinaPerpetrators();

      return {
        success: true,
        data: perpetrators,
        count: perpetrators.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ [DinaController] Error fetching DINA perpetrators:', error);
      return {
        success: false,
        error: 'Failed to fetch DINA perpetrators',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 🎯 GET /api/dina/comprehensive
   * Returns comprehensive DINA agents from research database
   */
  @Get('comprehensive')
  @HttpCode(HttpStatus.OK)
  async getComprehensive() {
    console.log('🎯 [DinaController] GET /api/dina/comprehensive - Fetching comprehensive DINA agents');

    try {
      const agents = await this.dinaService.getComprehensiveAgents();

      return {
        success: true,
        data: agents,
        count: agents.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ [DinaController] Error fetching comprehensive agents:', error);
      return {
        success: false,
        error: 'Failed to fetch comprehensive agents',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 📋 GET /api/dina/wanted
   * Returns agents at large / fighting extradition
   */
  @Get('wanted')
  @HttpCode(HttpStatus.OK)
  async getWanted() {
    console.log('⚠️ [DinaController] GET /api/dina/wanted - Fetching wanted agents');

    try {
      const wanted = await this.dinaService.getWantedAgents();

      return {
        success: true,
        data: wanted,
        count: wanted.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ [DinaController] Error fetching wanted agents:', error);
      return {
        success: false,
        error: 'Failed to fetch wanted agents',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 📊 GET /api/dina/research-summary
   * Returns research summary with methodology and sources
   */
  @Get('research-summary')
  @HttpCode(HttpStatus.OK)
  async getResearchSummary() {
    console.log('📊 [DinaController] GET /api/dina/research-summary - Fetching research summary');

    try {
      const summary = await this.dinaService.getResearchSummary();

      return {
        success: true,
        data: summary,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ [DinaController] Error fetching research summary:', error);
      return {
        success: false,
        error: 'Failed to fetch research summary',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 📋 GET /api/dina/all-agents?page=1&limit=50&filter=unprosecuted
   * Returns paginated list of all 1,097 known DINA agents
   * Now supports filtering by unprosecuted status, nyaa~! ⚖️🐾
   */
  @Get('all-agents')
  @HttpCode(HttpStatus.OK)
  async getAllAgentsPaginated(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('filter') filter?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    console.log(`📋 [DinaController] GET /api/dina/all-agents?page=${pageNum}&limit=${limitNum}&filter=${filter || 'none'}`);

    try {
      const result = await this.dinaService.getAllAgentsPaginated(pageNum, limitNum, filter);

      return {
        success: true,
        data: result.agents,
        pagination: {
          current_page: result.currentPage,
          page_size: result.pageSize,
          total_agents: result.totalAgents,
          total_pages: result.totalPages,
          has_next: result.hasNext,
          has_previous: result.hasPrevious,
        },
        filter: filter || 'none',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ [DinaController] Error fetching paginated agents:', error);
      return {
        success: false,
        error: 'Failed to fetch paginated agents',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 🏥 GET /api/dina/health
   * Health check endpoint
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async health() {
    return {
      success: true,
      status: 'DINA API operational, nyaa~! ⚖️🐾',
      timestamp: new Date().toISOString()
    };
  }
}
