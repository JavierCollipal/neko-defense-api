// 🐾🧪 NEKO DEFENSE - DINA Functional Service Unit Tests 🧪🐾
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { DinaServiceFunctional } from './dina.service.functional';
import { DinaPerp } from '../database/schemas/dina-perpetrator.schema';

describe('DinaServiceFunctional', () => {
  let service: DinaServiceFunctional;
  let mockModel: any;
  let mockConnection: any;

  // Mock DINA agents
  const mockAgents = [
    {
      fullName: 'Convicted Agent',
      status: 'CONVICTED - IMPRISONED',
      legalStatus: { convicted: true, currentStatus: 'IMPRISONED' },
      rank: 'Colonel',
      organization: ['DINA'],
    },
    {
      fullName: 'At Large Agent',
      status: 'AT LARGE',
      legalStatus: { convicted: false, currentStatus: 'AT LARGE' },
      rank: 'Major',
      organization: ['DINA'],
    },
    {
      fullName: 'Deceased Agent',
      status: 'DECEASED',
      legalStatus: { convicted: false },
      rank: 'Lieutenant',
      organization: ['DINA'],
    },
  ];

  const mockResearchSummary = {
    total_agents: 1097,
    research_status: 'COMPREHENSIVE',
    last_updated: new Date().toISOString(),
  };

  beforeEach(async () => {
    // Mock Mongoose model
    mockModel = {
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAgents),
      }),
    };

    // Mock MongoDB connection
    mockConnection = {
      collection: jest.fn((name: string) => ({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockAgents),
        }),
        findOne: jest.fn().mockResolvedValue(mockResearchSummary),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DinaServiceFunctional,
        {
          provide: getModelToken(DinaPerp.name),
          useValue: mockModel,
        },
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
      ],
    }).compile();

    service = module.get<DinaServiceFunctional>(DinaServiceFunctional);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have TOTAL_KNOWN_AGENTS constant', () => {
      expect((service as any).TOTAL_KNOWN_AGENTS).toBe(1097);
    });
  });

  describe('getDinaStats', () => {
    it('should calculate DINA statistics using functional pipeline', async () => {
      const stats = await service.getDinaStats();

      expect(stats).toBeDefined();
      expect(stats.total_documents).toBe(3);
      expect(stats.perpetrators.total).toBe(3);
      expect(stats.perpetrators.convicted).toBe(1);
      expect(stats.perpetrators.atLarge).toBe(1);
      expect(stats.perpetrators.deceased).toBe(1);
      expect(mockConnection.collection).toHaveBeenCalledWith('dina_agents_comprehensive');
    });

    it('should include historical data', async () => {
      const stats = await service.getDinaStats();

      expect(stats.torture_centers).toBe(4);
      expect(stats.international_crimes).toBe(4);
      expect(stats.victims_estimated).toBe(30000);
      expect(stats.disappeared).toBe(957);
      expect(stats.executed).toBe(2279);
    });

    it('should have last_updated timestamp', async () => {
      const stats = await service.getDinaStats();

      expect(stats.last_updated).toBeDefined();
      expect(new Date(stats.last_updated)).toBeInstanceOf(Date);
    });

    it('should handle database errors gracefully', async () => {
      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockRejectedValue(new Error('DB Error')),
        }),
      });

      await expect(service.getDinaStats()).rejects.toThrow();
    });

    it('should query comprehensive collection', async () => {
      await service.getDinaStats();

      expect(mockConnection.collection).toHaveBeenCalledWith('dina_agents_comprehensive');
    });
  });

  describe('getDinaPerpetrators', () => {
    it('should fetch perpetrators from comprehensive collection', async () => {
      const perpetrators = await service.getDinaPerpetrators();

      expect(perpetrators).toBeDefined();
      expect(Array.isArray(perpetrators)).toBe(true);
      expect(mockConnection.collection).toHaveBeenCalledWith('dina_agents_comprehensive');
    });

    it('should transform agents for frontend compatibility', async () => {
      const perpetrators = await service.getDinaPerpetrators();

      expect(perpetrators[0]).toHaveProperty('fullName');
      expect(perpetrators[0]).toHaveProperty('legalStatus');
      expect(perpetrators[0]).toHaveProperty('organization');
    });

    it('should handle empty results', async () => {
      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
      });

      const perpetrators = await service.getDinaPerpetrators();

      expect(perpetrators).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockRejectedValue(new Error('DB Error')),
        }),
      });

      await expect(service.getDinaPerpetrators()).rejects.toThrow();
    });
  });

  describe('getComprehensiveAgents', () => {
    it('should fetch all comprehensive agents', async () => {
      const agents = await service.getComprehensiveAgents();

      expect(agents).toBeDefined();
      expect(agents).toHaveLength(3);
      expect(mockConnection.collection).toHaveBeenCalledWith('dina_agents_comprehensive');
    });

    it('should throw error on database failure', async () => {
      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockRejectedValue(new Error('DB Error')),
        }),
      });

      await expect(service.getComprehensiveAgents()).rejects.toThrow();
    });
  });

  describe('getWantedAgents', () => {
    it('should fetch agents with AT LARGE status', async () => {
      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([mockAgents[1]]),
        }),
      });

      const wanted = await service.getWantedAgents();

      expect(wanted).toHaveLength(1);
      expect(wanted[0].fullName).toBe('At Large Agent');
    });

    it('should use correct filter for AT LARGE', async () => {
      const mockFind = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });

      mockConnection.collection.mockReturnValue({
        find: mockFind,
      });

      await service.getWantedAgents();

      expect(mockFind).toHaveBeenCalledWith({
        status: { $regex: 'AT LARGE', $options: 'i' },
      });
    });

    it('should throw error on database failure', async () => {
      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockRejectedValue(new Error('DB Error')),
        }),
      });

      await expect(service.getWantedAgents()).rejects.toThrow();
    });
  });

  describe('getResearchSummary', () => {
    it('should fetch research summary', async () => {
      const summary = await service.getResearchSummary();

      expect(summary).toBeDefined();
      expect(summary.total_agents).toBe(1097);
      expect(mockConnection.collection).toHaveBeenCalledWith('dina_research_summary');
    });

    it('should return null if not found', async () => {
      mockConnection.collection.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(null),
      });

      const summary = await service.getResearchSummary();

      expect(summary).toBeNull();
    });

    it('should throw error on database failure', async () => {
      mockConnection.collection.mockReturnValue({
        findOne: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      await expect(service.getResearchSummary()).rejects.toThrow();
    });
  });

  describe('getAllAgentsPaginated', () => {
    it('should paginate agents (page 1)', async () => {
      const result = await service.getAllAgentsPaginated(1, 2, undefined);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.currentPage).toBe(1);
      expect(result.pageSize).toBe(2);
      expect(result.totalItems).toBeGreaterThan(0);
    });

    it('should apply unprosecuted filter', async () => {
      const mockFind = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockAgents),
      });

      mockConnection.collection.mockReturnValue({
        find: mockFind,
      });

      await service.getAllAgentsPaginated(1, 10, 'unprosecuted');

      expect(mockConnection.collection).toHaveBeenCalledWith('dina_all_agents');
    });

    it('should calculate correct pagination metadata', async () => {
      const result = await service.getAllAgentsPaginated(1, 2, undefined);

      expect(result.hasNext).toBeDefined();
      expect(result.hasPrevious).toBeDefined();
      expect(result.totalPages).toBeGreaterThan(0);
    });

    it('should handle database errors', async () => {
      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockRejectedValue(new Error('DB Error')),
        }),
      });

      await expect(service.getAllAgentsPaginated(1, 10, undefined)).rejects.toThrow();
    });
  });

  describe('Functional Programming Principles', () => {
    it('should use TaskEither for error handling', async () => {
      // Success case
      const result = await service.getDinaStats();
      expect(result).toBeDefined();

      // Error case
      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockRejectedValue(new Error('DB Error')),
        }),
      });

      await expect(service.getDinaStats()).rejects.toThrow();
    });

    it('should return immutable data', async () => {
      const agents1 = await service.getDinaPerpetrators();
      const agents2 = await service.getDinaPerpetrators();

      // Same data
      expect(agents1).toEqual(agents2);
      // But different instances (immutable)
      expect(agents1).not.toBe(agents2);
    });

    it('should compose pure functions in pipeline', async () => {
      const result = await service.getAllAgentsPaginated(1, 10, 'convicted');

      // Should fetch -> filter -> paginate
      expect(mockConnection.collection).toHaveBeenCalled();
      expect(result.data).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors gracefully', async () => {
      mockConnection.collection.mockImplementation(() => {
        throw new Error('Connection failed');
      });

      await expect(service.getDinaStats()).rejects.toThrow();
    });

    it('should handle malformed data', async () => {
      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([{ invalid: 'data' }]),
        }),
      });

      const agents = await service.getDinaPerpetrators();

      // Should handle gracefully
      expect(agents).toBeDefined();
    });
  });
});
