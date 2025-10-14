// 🐾⚡ VALECH CONTROLLER - Unit Tests ⚡🐾
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ValechController } from './valech.controller';
import { ValechService } from './valech.service';

describe('ValechController', () => {
  let controller: ValechController;
  let valechService: ValechService;

  const mockValechService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    searchByName: jest.fn(),
    findByDetentionCenter: jest.fn(),
    findByPerpetrator: jest.fn(),
    getStats: jest.fn(),
    getDetentionCenters: jest.fn(),
    getPerpetrators: jest.fn(),
    advancedSearch: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ValechController],
      providers: [
        {
          provide: ValechService,
          useValue: mockValechService,
        },
      ],
    }).compile();

    controller = module.get<ValechController>(ValechController);
    valechService = module.get<ValechService>(ValechService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/valech', () => {
    it('should return all victims with default pagination', async () => {
      const mockVictims = [
        { name: 'Juan Pérez', gender: 'M' },
        { name: 'María González', gender: 'F' },
      ];

      mockValechService.findAll.mockResolvedValue(mockVictims);

      const result = await controller.getAllVictims();

      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
      expect(result.data).toEqual(mockVictims);
      expect(valechService.findAll).toHaveBeenCalledWith(0, 50);
    });

    it('should accept custom skip and limit parameters', async () => {
      const mockVictims = [{ name: 'Test Victim' }];

      mockValechService.findAll.mockResolvedValue(mockVictims);

      const result = await controller.getAllVictims('10', '20');

      expect(result.success).toBe(true);
      expect(valechService.findAll).toHaveBeenCalledWith(10, 20);
    });

    it('should handle errors and throw HttpException', async () => {
      mockValechService.findAll.mockRejectedValue(new Error('Database error'));

      await expect(controller.getAllVictims()).rejects.toThrow(HttpException);
      await expect(controller.getAllVictims()).rejects.toThrow(
        'Failed to fetch victims',
      );
    });
  });

  describe('GET /api/valech/:id', () => {
    it('should return victim by ID', async () => {
      const mockVictim = {
        _id: '123',
        name: 'Juan Pérez',
        gender: 'M',
      };

      mockValechService.findById.mockResolvedValue(mockVictim);

      const result = await controller.getVictimById('123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockVictim);
      expect(valechService.findById).toHaveBeenCalledWith('123');
    });

    it('should throw 404 when victim not found', async () => {
      mockValechService.findById.mockResolvedValue(null);

      await expect(controller.getVictimById('999')).rejects.toThrow(
        HttpException,
      );
      await expect(controller.getVictimById('999')).rejects.toThrow(
        'Victim with ID 999 not found',
      );
    });

    it('should handle service errors', async () => {
      mockValechService.findById.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.getVictimById('123')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('GET /api/valech/search/name', () => {
    it('should search victims by name', async () => {
      const mockVictims = [
        { name: 'Juan Pérez' },
        { name: 'Juan García' },
      ];

      mockValechService.searchByName.mockResolvedValue(mockVictims);

      const result = await controller.searchByName('Juan');

      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
      expect(result.data).toEqual(mockVictims);
      expect(valechService.searchByName).toHaveBeenCalledWith('Juan');
    });

    it('should throw 400 when query is missing', async () => {
      await expect(controller.searchByName(undefined)).rejects.toThrow(
        HttpException,
      );
      await expect(controller.searchByName(undefined)).rejects.toThrow(
        'Search query is required',
      );
    });

    it('should handle service errors', async () => {
      mockValechService.searchByName.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.searchByName('test')).rejects.toThrow(
        HttpException,
      );
    });

    it('should return empty array when no matches found', async () => {
      mockValechService.searchByName.mockResolvedValue([]);

      const result = await controller.searchByName('NonexistentName');

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
      expect(result.data).toEqual([]);
    });
  });

  describe('GET /api/valech/detention-center/:name', () => {
    it('should return victims by detention center', async () => {
      const mockVictims = [
        { name: 'Victim 1', detentionCenter: 'Villa Grimaldi' },
        { name: 'Victim 2', detentionCenter: 'Villa Grimaldi' },
      ];

      mockValechService.findByDetentionCenter.mockResolvedValue(mockVictims);

      const result = await controller.getByDetentionCenter('Villa Grimaldi');

      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
      expect(result.detentionCenter).toBe('Villa Grimaldi');
      expect(result.data).toEqual(mockVictims);
      expect(valechService.findByDetentionCenter).toHaveBeenCalledWith(
        'Villa Grimaldi',
      );
    });

    it('should handle errors', async () => {
      mockValechService.findByDetentionCenter.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        controller.getByDetentionCenter('Test Center'),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('GET /api/valech/perpetrator/:name', () => {
    it('should return victims by perpetrator', async () => {
      const mockVictims = [
        { name: 'Victim 1', perpetrator: 'Manuel Contreras' },
        { name: 'Victim 2', perpetrator: 'Manuel Contreras' },
      ];

      mockValechService.findByPerpetrator.mockResolvedValue(mockVictims);

      const result = await controller.getByPerpetrator('Manuel Contreras');

      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
      expect(result.perpetrator).toBe('Manuel Contreras');
      expect(result.data).toEqual(mockVictims);
      expect(valechService.findByPerpetrator).toHaveBeenCalledWith(
        'Manuel Contreras',
      );
    });

    it('should handle errors', async () => {
      mockValechService.findByPerpetrator.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.getByPerpetrator('Test')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('GET /api/valech/stats/all', () => {
    it('should return comprehensive statistics', async () => {
      const mockStats = {
        totalVictims: 38000,
        byGender: { M: 30000, F: 8000 },
        byOutcome: { survived: 35000, deceased: 3000 },
      };

      mockValechService.getStats.mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStats);
      expect(valechService.getStats).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      mockValechService.getStats.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.getStats()).rejects.toThrow(HttpException);
    });
  });

  describe('GET /api/valech/lists/detention-centers', () => {
    it('should return all detention centers', async () => {
      const mockCenters = ['Villa Grimaldi', 'Londres 38', 'Estadio Nacional'];

      mockValechService.getDetentionCenters.mockResolvedValue(mockCenters);

      const result = await controller.getDetentionCenters();

      expect(result.success).toBe(true);
      expect(result.count).toBe(3);
      expect(result.data).toEqual(mockCenters);
      expect(valechService.getDetentionCenters).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      mockValechService.getDetentionCenters.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.getDetentionCenters()).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('GET /api/valech/lists/perpetrators', () => {
    it('should return all perpetrators', async () => {
      const mockPerpetrators = [
        'Manuel Contreras',
        'Alvaro Corbalán',
        'Miguel Krassnoff',
      ];

      mockValechService.getPerpetrators.mockResolvedValue(mockPerpetrators);

      const result = await controller.getPerpetrators();

      expect(result.success).toBe(true);
      expect(result.count).toBe(3);
      expect(result.data).toEqual(mockPerpetrators);
      expect(valechService.getPerpetrators).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      mockValechService.getPerpetrators.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.getPerpetrators()).rejects.toThrow(HttpException);
    });
  });

  describe('GET /api/valech/search/advanced', () => {
    it('should perform advanced search with all filters', async () => {
      const mockVictims = [{ name: 'Test Victim', gender: 'M' }];

      mockValechService.advancedSearch.mockResolvedValue(mockVictims);

      const result = await controller.advancedSearch(
        'Juan',
        'M',
        'survived',
        'Villa Grimaldi',
        'Manuel Contreras',
        '1973-09-11',
        '1990-03-11',
      );

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
      expect(result.data).toEqual(mockVictims);
      expect(result.filters).toBeDefined();
      expect(result.filters.name).toBe('Juan');
      expect(result.filters.gender).toBe('M');
      expect(result.filters.outcome).toBe('survived');
      expect(result.filters.detentionCenter).toBe('Villa Grimaldi');
      expect(result.filters.perpetrator).toBe('Manuel Contreras');
      expect(result.filters.startDate).toBeInstanceOf(Date);
      expect(result.filters.endDate).toBeInstanceOf(Date);
    });

    it('should perform advanced search with partial filters', async () => {
      const mockVictims = [{ name: 'Test Victim' }];

      mockValechService.advancedSearch.mockResolvedValue(mockVictims);

      const result = await controller.advancedSearch('Juan', 'M');

      expect(result.success).toBe(true);
      expect(result.filters.name).toBe('Juan');
      expect(result.filters.gender).toBe('M');
      expect(result.filters.outcome).toBeUndefined();
    });

    it('should perform advanced search with no filters', async () => {
      const mockVictims = [];

      mockValechService.advancedSearch.mockResolvedValue(mockVictims);

      const result = await controller.advancedSearch();

      expect(result.success).toBe(true);
      expect(result.filters).toEqual({});
    });

    it('should handle errors', async () => {
      mockValechService.advancedSearch.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.advancedSearch('test')).rejects.toThrow(
        HttpException,
      );
    });
  });
});
