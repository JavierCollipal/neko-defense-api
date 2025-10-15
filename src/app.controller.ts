// 🐾⚡ NEKO DEFENSE - Main App Controller ⚡🐾
import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ThreatActorsService } from './threat-actors/threat-actors.service';

@Controller('api')
export class AppController {
  constructor(
    private readonly threatActorsService: ThreatActorsService,
    @InjectConnection() private readonly mongoConnection: Connection,
  ) {
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

  /**
   * 📊 GET /api/mongodb-stats
   * Returns real-time MongoDB Atlas statistics for hunting operations, nyaa~! 🐾💖
   */
  @Get('mongodb-stats')
  @HttpCode(HttpStatus.OK)
  async getMongoDBStats() {
    console.log('📊 [AppController] GET /api/mongodb-stats - Fetching hunting database metrics, desu~!');

    try {
      const db = this.mongoConnection.db;
      const adminDb = this.mongoConnection.db.admin();

      // Get database statistics
      const dbStats = await db.stats();

      // Get server status (includes connection info)
      let serverStatus;
      try {
        serverStatus = await adminDb.serverStatus();
      } catch (adminError) {
        // If we don't have admin privileges, use limited stats
        console.log('⚠️ [MongoDB] Limited admin access, using basic stats only');
        serverStatus = null;
      }

      // Get collection list and their stats
      const collections = await db.listCollections().toArray();
      const collectionStats = await Promise.all(
        collections.slice(0, 10).map(async (coll) => {
          try {
            const count = await db.collection(coll.name).countDocuments();
            return {
              name: coll.name,
              count,
              type: coll.type || 'collection',
            };
          } catch (e) {
            return {
              name: coll.name,
              count: 0,
              type: coll.type || 'collection',
            };
          }
        })
      );

      // Format response with MAXIMUM NEKO POWER! ⚡🐾
      const response = {
        success: true,
        data: {
          // Database info
          database: {
            name: dbStats.db,
            collections: dbStats.collections,
            views: dbStats.views || 0,
            dataSize: dbStats.dataSize,
            storageSize: dbStats.storageSize,
            indexes: dbStats.indexes,
            indexSize: dbStats.indexSize,
            totalSize: dbStats.totalSize || (dbStats.dataSize + dbStats.indexSize),
            avgObjSize: Math.round(dbStats.avgObjSize || 0),
          },

          // Server info (if available)
          server: serverStatus ? {
            host: serverStatus.host,
            version: serverStatus.version,
            uptime: serverStatus.uptimeEstimate || serverStatus.uptime,
            uptimeFormatted: this.formatUptime(serverStatus.uptimeEstimate || serverStatus.uptime),
            process: serverStatus.process,
            pid: serverStatus.pid,
          } : {
            host: 'Atlas Cloud',
            version: 'Unknown',
            uptime: 0,
            uptimeFormatted: 'N/A',
            process: 'mongod',
            pid: null,
          },

          // Connection info (if available)
          connections: serverStatus?.connections ? {
            current: serverStatus.connections.current,
            available: serverStatus.connections.available,
            totalCreated: serverStatus.connections.totalCreated,
            active: serverStatus.connections.active || 0,
            rejected: serverStatus.connections.rejected || 0,
            utilization: serverStatus.connections.available > 0
              ? Math.round((serverStatus.connections.current / (serverStatus.connections.current + serverStatus.connections.available)) * 100)
              : 0,
          } : {
            current: 1,
            available: 999,
            totalCreated: 1,
            active: 1,
            rejected: 0,
            utilization: 0,
          },

          // Top collections (hunting data!)
          topCollections: collectionStats,

          // Hunting operation status
          huntingStatus: {
            status: 'OPERATIONAL',
            mode: 'ACTIVE HUNTING',
            kawaii_level: 'MAXIMUM',
            threat_tracking: 'ENABLED',
            ready: true,
          },

          // Performance metrics
          performance: {
            dataSizeHuman: this.formatBytes(dbStats.dataSize),
            storageSizeHuman: this.formatBytes(dbStats.storageSize),
            indexSizeHuman: this.formatBytes(dbStats.indexSize),
            totalSizeHuman: this.formatBytes(dbStats.totalSize || (dbStats.dataSize + dbStats.indexSize)),
            avgObjSizeHuman: this.formatBytes(dbStats.avgObjSize || 0),
          },
        },
        timestamp: new Date().toISOString(),
        message: 'MongoDB hunting database metrics loaded with NEKO POWER, nyaa~! ⚡🐾',
      };

      console.log('✅ [MongoDB Stats] Database metrics fetched successfully!');
      console.log(`   📦 Collections: ${dbStats.collections}`);
      console.log(`   💾 Data Size: ${this.formatBytes(dbStats.dataSize)}`);
      console.log(`   🔌 Connections: ${response.data.connections.current}/${response.data.connections.current + response.data.connections.available}`);

      return response;
    } catch (error) {
      console.error('❌ [AppController] Error fetching MongoDB stats:', error);
      return {
        success: false,
        error: error.message,
        data: null,
        timestamp: new Date().toISOString(),
        message: 'Failed to fetch MongoDB stats, nya~! Check connection!',
      };
    }
  }

  /**
   * 🔧 Helper: Format bytes to human-readable
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * 🔧 Helper: Format uptime to human-readable
   */
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
}
