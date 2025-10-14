// 🐾⚡ VALECH CONTROLLER - REST API Endpoints ⚡🐾
import {
  Controller,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ValechService } from './valech.service';

@Controller('api/valech')
export class ValechController {
  private readonly logger = new Logger(ValechController.name);

  constructor(private readonly valechService: ValechService) {
    this.logger.log('🐾 ValechController initialized, nyaa~! ⚡');
  }

  // 📊 GET /api/valech - Get all victims with pagination
  @Get()
  async getAllVictims(
    @Query('skip') skip?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const skipNum = skip ? parseInt(skip, 10) : 0;
      const limitNum = limit ? parseInt(limit, 10) : 50;

      this.logger.log(`Fetching victims: skip=${skipNum}, limit=${limitNum}`);

      const victims = await this.valechService.findAll(skipNum, limitNum);

      return {
        success: true,
        count: victims.length,
        data: victims,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch victims: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch victims',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 🔍 GET /api/valech/:id - Get victim by ID
  @Get(':id')
  async getVictimById(@Param('id') id: string) {
    try {
      this.logger.log(`Fetching victim by ID: ${id}`);

      const victim = await this.valechService.findById(id);

      if (!victim) {
        throw new HttpException(
          {
            success: false,
            message: `Victim with ID ${id} not found`,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: victim,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`Failed to fetch victim by ID: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch victim',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 🔍 GET /api/valech/search/name - Search by name
  @Get('search/name')
  async searchByName(@Query('q') query: string) {
    try {
      if (!query) {
        throw new HttpException(
          {
            success: false,
            message: 'Search query is required',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(`Searching victims by name: ${query}`);

      const victims = await this.valechService.searchByName(query);

      return {
        success: true,
        count: victims.length,
        data: victims,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`Failed to search victims: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to search victims',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 🏢 GET /api/valech/detention-center/:name - Get victims by detention center
  @Get('detention-center/:name')
  async getByDetentionCenter(@Param('name') name: string) {
    try {
      this.logger.log(`Fetching victims by detention center: ${name}`);

      const victims = await this.valechService.findByDetentionCenter(name);

      return {
        success: true,
        count: victims.length,
        detentionCenter: name,
        data: victims,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch victims by detention center: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch victims by detention center',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 👤 GET /api/valech/perpetrator/:name - Get victims by perpetrator
  @Get('perpetrator/:name')
  async getByPerpetrator(@Param('name') name: string) {
    try {
      this.logger.log(`Fetching victims by perpetrator: ${name}`);

      const victims = await this.valechService.findByPerpetrator(name);

      return {
        success: true,
        count: victims.length,
        perpetrator: name,
        data: victims,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch victims by perpetrator: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch victims by perpetrator',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 📊 GET /api/valech/stats - Get comprehensive statistics
  @Get('stats/all')
  async getStats() {
    try {
      this.logger.log('Fetching comprehensive statistics');

      const stats = await this.valechService.getStats();

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch statistics: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch statistics',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 🏛️ GET /api/valech/lists/detention-centers - Get all detention centers
  @Get('lists/detention-centers')
  async getDetentionCenters() {
    try {
      this.logger.log('Fetching all detention centers');

      const centers = await this.valechService.getDetentionCenters();

      return {
        success: true,
        count: centers.length,
        data: centers,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch detention centers: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch detention centers',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 👥 GET /api/valech/lists/perpetrators - Get all perpetrators
  @Get('lists/perpetrators')
  async getPerpetrators() {
    try {
      this.logger.log('Fetching all perpetrators');

      const perpetrators = await this.valechService.getPerpetrators();

      return {
        success: true,
        count: perpetrators.length,
        data: perpetrators,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch perpetrators: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch perpetrators',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 🔍 GET /api/valech/search/advanced - Advanced search with filters
  @Get('search/advanced')
  async advancedSearch(
    @Query('name') name?: string,
    @Query('gender') gender?: string,
    @Query('outcome') outcome?: string,
    @Query('detentionCenter') detentionCenter?: string,
    @Query('perpetrator') perpetrator?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      this.logger.log('Advanced search request');

      const filters: any = {};

      if (name) filters.name = name;
      if (gender) filters.gender = gender;
      if (outcome) filters.outcome = outcome;
      if (detentionCenter) filters.detentionCenter = detentionCenter;
      if (perpetrator) filters.perpetrator = perpetrator;
      if (startDate) filters.startDate = new Date(startDate);
      if (endDate) filters.endDate = new Date(endDate);

      const victims = await this.valechService.advancedSearch(filters);

      return {
        success: true,
        count: victims.length,
        filters: filters,
        data: victims,
      };
    } catch (error) {
      this.logger.error(`Failed to perform advanced search: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to perform advanced search',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
