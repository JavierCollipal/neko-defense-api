// 🐾⚡ NEKO DEFENSE - Main App Controller Tests ⚡🐾
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { ThreatActorsService } from './threat-actors/threat-actors.service';

describe('AppController', () => {
  let controller: AppController;
  let threatActorsService: ThreatActorsService;

  const mockThreatActorsService = {
    getThreatActorsByCategory: jest.fn(),
  };

  const mockDatabaseConnection = {
    db: {
      stats: jest.fn(),
      admin: jest.fn(),
      listCollections: jest.fn(),
      collection: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: ThreatActorsService,
          useValue: mockThreatActorsService,
        },
        {
          provide: 'DatabaseConnection',
          useValue: mockDatabaseConnection,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    threatActorsService = module.get<ThreatActorsService>(ThreatActorsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/stats', () => {
    it('should return dashboard statistics', async () => {
      const result = await controller.getStats();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.total_threats).toBe(127);
      expect(result.data.active_hunts).toBe(3);
      expect(result.data.threats_neutralized).toBe(89);
      expect(result.data.system_status).toBe('FORTRESS MODE ACTIVE');
      expect(result.data.kawaii_level).toBe('MAXIMUM');
      expect(result.data.neko_mode).toBe('LEGENDARY');
      expect(result.data.last_updated).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should return timestamp in ISO format', async () => {
      const result = await controller.getStats();

      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('GET /api/ascii-art', () => {
    it('should return ASCII art array', async () => {
      const result = await controller.getAsciiArt();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.count).toBe(3);
      expect(result.timestamp).toBeDefined();
    });

    it('should return correct ASCII art items', async () => {
      const result = await controller.getAsciiArt();

      expect(result.data).toHaveLength(3);
      expect(result.data[0].title).toBe('NEKO-ARC DEFENSE');
      expect(result.data[0].category).toBe('system');
      expect(result.data[1].title).toBe('THREAT DETECTION');
      expect(result.data[1].category).toBe('security');
      expect(result.data[2].title).toBe('DINA JUSTICE');
      expect(result.data[2].category).toBe('dina');
    });

    it('should include art content in each item', async () => {
      const result = await controller.getAsciiArt();

      result.data.forEach((item) => {
        expect(item.id).toBeDefined();
        expect(item.title).toBeDefined();
        expect(item.art).toBeDefined();
        expect(item.category).toBeDefined();
      });
    });
  });

  describe('GET /api/threat-counts', () => {
    it('should return threat counts by category', async () => {
      const result = await controller.getThreatCounts();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.all).toBe(127);
      expect(result.data.predators).toBe(45);
      expect(result.data.pedophiles).toBe(23);
      expect(result.data.dina_network).toBe(8);
      expect(result.data.ransomware).toBe(18);
      expect(result.data.state_sponsored).toBe(21);
      expect(result.data.crypto_crime).toBe(12);
      expect(result.timestamp).toBeDefined();
    });

    it('should return all expected threat categories', async () => {
      const result = await controller.getThreatCounts();

      const expectedCategories = [
        'all',
        'predators',
        'pedophiles',
        'dina_network',
        'ransomware',
        'state_sponsored',
        'crypto_crime',
      ];

      expectedCategories.forEach((category) => {
        expect(result.data[category]).toBeDefined();
        expect(typeof result.data[category]).toBe('number');
      });
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const result = await controller.health();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.status).toBe('NEKO DEFENSE API operational, nyaa~! ⚡🐾');
      expect(result.timestamp).toBeDefined();
    });

    it('should return timestamp in ISO format', async () => {
      const result = await controller.health();

      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('GET /api/threat-actors', () => {
    it('should return threat actors successfully', async () => {
      const mockThreatActors = [
        {
          actor_id: 'mikhail_matveev',
          name: 'Mikhail Matveev',
          threat_level: 'CRITICAL',
        },
        {
          actor_id: 'apt29',
          name: 'APT29 / Cozy Bear',
          threat_level: 'CRITICAL',
        },
      ];

      mockThreatActorsService.getThreatActorsByCategory.mockResolvedValue(
        mockThreatActors,
      );

      const result = await controller.getThreatActors();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockThreatActors);
      expect(result.count).toBe(2);
      expect(result.timestamp).toBeDefined();
      expect(threatActorsService.getThreatActorsByCategory).toHaveBeenCalledWith(
        'all',
      );
    });

    it('should return empty array when no threat actors found', async () => {
      mockThreatActorsService.getThreatActorsByCategory.mockResolvedValue([]);

      const result = await controller.getThreatActors();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database connection failed');
      mockThreatActorsService.getThreatActorsByCategory.mockRejectedValue(
        error,
      );

      const result = await controller.getThreatActors();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
      expect(result.timestamp).toBeDefined();
    });

    it('should call service with correct parameter', async () => {
      mockThreatActorsService.getThreatActorsByCategory.mockResolvedValue([]);

      await controller.getThreatActors();

      expect(threatActorsService.getThreatActorsByCategory).toHaveBeenCalledTimes(
        1,
      );
      expect(threatActorsService.getThreatActorsByCategory).toHaveBeenCalledWith(
        'all',
      );
    });
  });
});
