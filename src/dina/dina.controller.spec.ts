// 🐾⚖️ NEKO DEFENSE - DINA Controller Tests ⚖️🐾
import { Test, TestingModule } from '@nestjs/testing';
import { DinaController } from './dina.controller';
import { DinaService } from './dina.service';

describe('DinaController', () => {
  let controller: DinaController;
  let dinaService: DinaService;

  const mockDinaService = {
    getDinaStats: jest.fn(),
    getDinaPerpetrators: jest.fn(),
    getComprehensiveAgents: jest.fn(),
    getWantedAgents: jest.fn(),
    getResearchSummary: jest.fn(),
    getAllAgentsPaginated: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DinaController],
      providers: [
        {
          provide: DinaService,
          useValue: mockDinaService,
        },
      ],
    }).compile();

    controller = module.get<DinaController>(DinaController);
    dinaService = module.get<DinaService>(DinaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/dina/stats', () => {
    it('should return DINA statistics', async () => {
      const mockStats = {
        total_agents: 1097,
        convicted: 800,
        at_large: 297,
      };

      mockDinaService.getDinaStats.mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStats);
      expect(result.timestamp).toBeDefined();
      expect(dinaService.getDinaStats).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      mockDinaService.getDinaStats.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await controller.getStats();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch DINA statistics');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('GET /api/dina/perpetrators', () => {
    it('should return DINA perpetrators', async () => {
      const mockPerpetrators = [
        { name: 'Manuel Contreras', status: 'convicted' },
        { name: 'Alvaro Corbalán', status: 'convicted' },
      ];

      mockDinaService.getDinaPerpetrators.mockResolvedValue(mockPerpetrators);

      const result = await controller.getPerpetrators();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPerpetrators);
      expect(result.count).toBe(2);
      expect(result.timestamp).toBeDefined();
      expect(dinaService.getDinaPerpetrators).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no perpetrators found', async () => {
      mockDinaService.getDinaPerpetrators.mockResolvedValue([]);

      const result = await controller.getPerpetrators();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      mockDinaService.getDinaPerpetrators.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await controller.getPerpetrators();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch DINA perpetrators');
    });
  });

  describe('GET /api/dina/comprehensive', () => {
    it('should return comprehensive agents', async () => {
      const mockAgents = [
        { name: 'Agent 1', role: 'Operative' },
        { name: 'Agent 2', role: 'Director' },
      ];

      mockDinaService.getComprehensiveAgents.mockResolvedValue(mockAgents);

      const result = await controller.getComprehensive();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAgents);
      expect(result.count).toBe(2);
      expect(result.timestamp).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      mockDinaService.getComprehensiveAgents.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await controller.getComprehensive();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch comprehensive agents');
    });
  });

  describe('GET /api/dina/wanted', () => {
    it('should return wanted agents', async () => {
      const mockWanted = [
        { name: 'Fugitive 1', status: 'at_large' },
        { name: 'Fugitive 2', status: 'fighting_extradition' },
      ];

      mockDinaService.getWantedAgents.mockResolvedValue(mockWanted);

      const result = await controller.getWanted();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockWanted);
      expect(result.count).toBe(2);
      expect(result.timestamp).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      mockDinaService.getWantedAgents.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await controller.getWanted();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch wanted agents');
    });
  });

  describe('GET /api/dina/research-summary', () => {
    it('should return research summary', async () => {
      const mockSummary = {
        methodology: 'Historical research',
        sources: ['National Archives', 'Declassified documents'],
        total_agents: 1097,
      };

      mockDinaService.getResearchSummary.mockResolvedValue(mockSummary);

      const result = await controller.getResearchSummary();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSummary);
      expect(result.timestamp).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      mockDinaService.getResearchSummary.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await controller.getResearchSummary();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch research summary');
    });
  });

  describe('GET /api/dina/all-agents', () => {
    it('should return paginated agents with default parameters', async () => {
      const mockPaginatedResult = {
        agents: [{ name: 'Agent 1' }, { name: 'Agent 2' }],
        currentPage: 1,
        pageSize: 50,
        totalAgents: 1097,
        totalPages: 22,
        hasNext: true,
        hasPrevious: false,
      };

      mockDinaService.getAllAgentsPaginated.mockResolvedValue(
        mockPaginatedResult,
      );

      const result = await controller.getAllAgentsPaginated();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPaginatedResult.agents);
      expect(result.pagination.current_page).toBe(1);
      expect(result.pagination.page_size).toBe(50);
      expect(result.pagination.total_agents).toBe(1097);
      expect(result.pagination.total_pages).toBe(22);
      expect(result.pagination.has_next).toBe(true);
      expect(result.pagination.has_previous).toBe(false);
      expect(dinaService.getAllAgentsPaginated).toHaveBeenCalledWith(1, 50);
    });

    it('should accept custom page and limit parameters', async () => {
      const mockPaginatedResult = {
        agents: [{ name: 'Agent 1' }],
        currentPage: 2,
        pageSize: 100,
        totalAgents: 1097,
        totalPages: 11,
        hasNext: true,
        hasPrevious: true,
      };

      mockDinaService.getAllAgentsPaginated.mockResolvedValue(
        mockPaginatedResult,
      );

      const result = await controller.getAllAgentsPaginated('2', '100');

      expect(result.success).toBe(true);
      expect(result.pagination.current_page).toBe(2);
      expect(result.pagination.page_size).toBe(100);
      expect(dinaService.getAllAgentsPaginated).toHaveBeenCalledWith(2, 100);
    });

    it('should handle invalid page/limit parameters', async () => {
      const mockPaginatedResult = {
        agents: [],
        currentPage: 1,
        pageSize: 50,
        totalAgents: 1097,
        totalPages: 22,
        hasNext: true,
        hasPrevious: false,
      };

      mockDinaService.getAllAgentsPaginated.mockResolvedValue(
        mockPaginatedResult,
      );

      const result = await controller.getAllAgentsPaginated(
        'invalid',
        'invalid',
      );

      expect(result.success).toBe(true);
      expect(dinaService.getAllAgentsPaginated).toHaveBeenCalledWith(1, 50);
    });

    it('should handle errors gracefully', async () => {
      mockDinaService.getAllAgentsPaginated.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await controller.getAllAgentsPaginated();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch paginated agents');
    });
  });

  describe('GET /api/dina/health', () => {
    it('should return health status', async () => {
      const result = await controller.health();

      expect(result.success).toBe(true);
      expect(result.status).toBe('DINA API operational, nyaa~! ⚖️🐾');
      expect(result.timestamp).toBeDefined();
    });
  });
});
