// 🐾⚡ NEKO DEFENSE - Main App Controller ⚡🐾
import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ThreatActorsService } from './threat-actors/threat-actors.service';

@Controller('api')
export class AppController {
  constructor(private readonly threatActorsService: ThreatActorsService) {
    console.log('⚡ [AppController] Main dashboard endpoints initialized, nyaa~!');
  }

  /**
   * 📊 GET /api/stats
   * Returns main dashboard statistics
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getStats() {
    console.log('📊 [AppController] GET /api/stats');

    return {
      success: true,
      data: {
        total_threats: 127,
        active_hunts: 3,
        threats_neutralized: 89,
        system_status: 'FORTRESS MODE ACTIVE',
        kawaii_level: 'MAXIMUM',
        neko_mode: 'LEGENDARY',
        last_updated: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 🎨 GET /api/ascii-art
   * Returns ASCII art for TV display
   */
  @Get('ascii-art')
  @HttpCode(HttpStatus.OK)
  async getAsciiArt() {
    console.log('🎨 [AppController] GET /api/ascii-art');

    const asciiArt = [
      {
        id: 1,
        title: 'NEKO-ARC DEFENSE',
        art: `
    🐾⚡ NEKO-ARC ⚡🐾
    DEFENSE SYSTEM
    ================
    STATUS: ACTIVE
    MODE: LEGENDARY
    KAWAII: MAXIMUM
        `,
        category: 'system',
      },
      {
        id: 2,
        title: 'THREAT DETECTION',
        art: `
    🎯 THREAT RADAR 🎯
    ==================
    Scanning...
    [████████████] 100%

    Threats detected: 127
    Active hunts: 3
        `,
        category: 'security',
      },
      {
        id: 3,
        title: 'DINA JUSTICE',
        art: `
    ⚖️ DINA HUNT ⚖️
    ===============
    Agents tracked: 8
    At large: 1
    Convicted: 6

    Justice Mode: ACTIVE
        `,
        category: 'dina',
      },
    ];

    return {
      success: true,
      data: asciiArt,
      count: asciiArt.length,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 📊 GET /api/threat-counts
   * Returns threat counts by category
   */
  @Get('threat-counts')
  @HttpCode(HttpStatus.OK)
  async getThreatCounts() {
    console.log('📊 [AppController] GET /api/threat-counts');

    return {
      success: true,
      data: {
        all: 127,
        predators: 45,
        pedophiles: 23,
        dina_network: 8,
        ransomware: 18,
        state_sponsored: 21,
        crypto_crime: 12,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 🏥 GET /api/health
   * Health check endpoint
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async health() {
    return {
      success: true,
      status: 'NEKO DEFENSE API operational, nyaa~! ⚡🐾',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 🎯 GET /api/threat-actors
   * Returns all threat actors from MongoDB
   */
  @Get('threat-actors')
  @HttpCode(HttpStatus.OK)
  async getThreatActors() {
    console.log('🎯 [AppController] GET /api/threat-actors');

    try {
      const threatActors = await this.threatActorsService.getThreatActorsByCategory('all');

      return {
        success: true,
        data: threatActors,
        count: threatActors.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ [AppController] Error fetching threat actors:', error);
      return {
        success: false,
        error: error.message,
        data: [],
        count: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
