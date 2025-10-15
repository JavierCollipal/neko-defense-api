// 🐾⚖️ NEKO DEFENSE - DINA Service Tests ⚖️🐾
// Testing DINA agent filtering with MAXIMUM JUSTICE, nyaa~! 😻⚖️
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { DinaService } from './dina.service';
import { DinaPerp } from '../database/schemas/dina-perpetrator.schema';

describe('🔐 DinaService', () => {
  let service: DinaService;
  let dinaPerpModel: Model<any>;
  let connection: Connection;
  let consoleLogSpy: jest.SpyInstance;

  const mockDinaPerpModel = {
    find: jest.fn(),
    exec: jest.fn(),
  };

  const mockConnection = {
    collection: jest.fn(),
    db: {
      stats: jest.fn(),
    },
  };

  const mockCollection = {
    find: jest.fn(),
    findOne: jest.fn(),
    toArray: jest.fn(),
  };

  beforeEach(async () => {
    // Spy on console logs
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Reset mocks
    mockConnection.collection.mockReturnValue(mockCollection);
    mockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DinaService,
        {
          provide: getModelToken(DinaPerp.name),
          useValue: mockDinaPerpModel,
        },
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
      ],
    }).compile();

    service = module.get<DinaService>(DinaService);
    dinaPerpModel = module.get<Model<any>>(getModelToken(DinaPerp.name));
    connection = module.get<Connection>(getConnectionToken());
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockRestore();
  });

  describe('🎯 Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should log initialization message', () => {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('DinaService] Initialized'),
      );
    });
  });

  describe('📊 getDinaStats', () => {
    it('should return comprehensive DINA statistics', async () => {
      const mockAgents = [
        { fullName: 'Agent 1', status: 'CONVICTED - IMPRISONED', legalStatus: { convicted: true } },
        { fullName: 'Agent 2', status: 'UNPROSECUTED', legalStatus: { convicted: false } },
        { fullName: 'Agent 3', status: 'AT LARGE', legalStatus: { convicted: false } },
        { fullName: 'Agent 4', status: 'DECEASED', legalStatus: { convicted: true } },
        { fullName: 'Agent 5', status: 'NEVER PROSECUTED', legalStatus: { convicted: false } },
      ];

      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockAgents),
        }),
      });

      const result = await service.getDinaStats();

      expect(result).toHaveProperty('total_documents', 5);
      expect(result.perpetrators).toHaveProperty('total', 5);
      expect(result.perpetrators).toHaveProperty('convicted', 2);
      expect(result.perpetrators).toHaveProperty('atLarge', 1);
      expect(result.perpetrators).toHaveProperty('deceased', 1);
      expect(result.perpetrators).toHaveProperty('neverProsecuted', 1);
      expect(result).toHaveProperty('last_updated');
    });

    it('should fallback to old collection on error', async () => {
      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockRejectedValue(new Error('Collection error')),
        }),
      });

      mockDinaPerpModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          { id: 1, fullName: 'Agent 1', prosecution_status: 'convicted' },
          { id: 2, fullName: 'Agent 2', prosecution_status: 'unprosecuted' },
        ]),
      });

      const result = await service.getDinaStats();

      expect(result).toHaveProperty('total_documents', 2);
      expect(result.perpetrators).toHaveProperty('convicted', 1);
    });
  });

  describe('🎯 getAllAgentsPaginated - UNPROSECUTED FILTER TESTS', () => {
    it('should return all agents when no filter is applied', async () => {
      const mockAgents = Array.from({ length: 1097 }, (_, i) => ({
        fullName: `Agent ${i + 1}`,
        status: i % 2 === 0 ? 'CONVICTED' : 'UNPROSECUTED',
        legalStatus: { convicted: i % 2 === 0 },
      }));

      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockAgents),
        }),
      });

      const result = await service.getAllAgentsPaginated(1, 50);

      expect(result.totalAgents).toBe(1097);
      expect(result.agents.length).toBe(50);
      expect(result.currentPage).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrevious).toBe(false);
    });

    it('should filter agents by unprosecuted status', async () => {
      const mockAllAgents = [
        { fullName: 'Agent 1', status: 'CONVICTED', legalStatus: { convicted: true } },
        { fullName: 'Agent 2', status: 'UNPROSECUTED', legalStatus: { convicted: false } },
        { fullName: 'Agent 3', status: 'UNPROSECUTED', legalStatus: { convicted: false } },
        { fullName: 'Agent 4', status: 'CONVICTED', legalStatus: { convicted: true } },
        { fullName: 'Agent 5', status: 'UNPROSECUTED', legalStatus: { convicted: false } },
      ];

      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockImplementation((query) => {
          let filtered = mockAllAgents;

          if (query.$or) {
            // Simulate MongoDB $or query filtering
            filtered = mockAllAgents.filter(agent =>
              agent.status.includes('UNPROSECUTED') ||
              agent.legalStatus?.convicted === false
            );
          }

          return {
            toArray: jest.fn().mockResolvedValue(filtered),
          };
        }),
      });

      const result = await service.getAllAgentsPaginated(1, 50, 'unprosecuted');

      expect(result.agents.length).toBe(3);
      expect(result.totalAgents).toBe(3);
      expect(result.agents.every(agent =>
        agent.status === 'UNPROSECUTED' ||
        agent.legalStatus?.convicted === false
      )).toBe(true);
    });

    it('should apply pagination after filtering', async () => {
      const mockUnprosecuted = Array.from({ length: 297 }, (_, i) => ({
        fullName: `Unprosecuted Agent ${i + 1}`,
        status: 'UNPROSECUTED',
        legalStatus: { convicted: false },
      }));

      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockUnprosecuted),
        }),
      });

      const result = await service.getAllAgentsPaginated(2, 50, 'unprosecuted');

      expect(result.currentPage).toBe(2);
      expect(result.pageSize).toBe(50);
      expect(result.agents.length).toBe(50); // Page 2 of 297 total
      expect(result.totalAgents).toBe(297);
      expect(result.totalPages).toBe(6); // 297 / 50 = 6 pages
      expect(result.hasNext).toBe(true);
      expect(result.hasPrevious).toBe(true);
    });

    it('should handle last page correctly with unprosecuted filter', async () => {
      const mockUnprosecuted = Array.from({ length: 297 }, (_, i) => ({
        fullName: `Unprosecuted Agent ${i + 1}`,
        status: 'UNPROSECUTED',
        legalStatus: { convicted: false },
      }));

      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockUnprosecuted),
        }),
      });

      const result = await service.getAllAgentsPaginated(6, 50, 'unprosecuted');

      expect(result.currentPage).toBe(6);
      expect(result.agents.length).toBe(47); // 297 - (5 * 50) = 47 on last page
      expect(result.hasNext).toBe(false);
      expect(result.hasPrevious).toBe(true);
    });

    it('should filter out convicted agents and return only unprosecuted', async () => {
      const mockMixedAgents = [
        { fullName: 'Agent 1', status: 'CONVICTED', legalStatus: { convicted: true } },
        { fullName: 'Agent 2', status: 'UNPROSECUTED', legalStatus: { convicted: false } },
        { fullName: 'Agent 3', status: 'CONVICTED', legalStatus: { convicted: true } },
      ];

      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockImplementation((query) => {
          // If unprosecuted filter is applied
          if (query.$or) {
            const filtered = mockMixedAgents.filter(agent =>
              agent.status.includes('UNPROSECUTED') ||
              agent.legalStatus?.convicted === false
            );
            return {
              toArray: jest.fn().mockResolvedValue(filtered),
            };
          }
          return {
            toArray: jest.fn().mockResolvedValue(mockMixedAgents),
          };
        }),
      });

      const result = await service.getAllAgentsPaginated(1, 50, 'unprosecuted');

      expect(result.agents.length).toBe(1);
      expect(result.agents[0].fullName).toBe('Agent 2');
      expect(result.agents[0].status).toBe('UNPROSECUTED');
      expect(result.totalAgents).toBe(1);
    });

    it('should pass correct MongoDB query for unprosecuted filter', async () => {
      const findMock = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });

      mockConnection.collection.mockReturnValue({
        find: findMock,
      });

      await service.getAllAgentsPaginated(1, 50, 'unprosecuted');

      expect(findMock).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            { status: { $regex: 'UNPROSECUTED', $options: 'i' } },
            { 'legalStatus.convicted': false },
            { 'legalStatus.convicted': { $exists: false } },
          ]),
        })
      );
    });

    it('should generate mock data when database collection is empty', async () => {
      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.getAllAgentsPaginated(1, 50);

      expect(result.agents.length).toBeGreaterThan(0);
      expect(result.totalAgents).toBe(1097); // Total known DINA agents
    });

    it('should filter mock data when no database collection exists', async () => {
      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.getAllAgentsPaginated(1, 50, 'unprosecuted');

      // Mock data should generate some unprosecuted agents
      expect(result.agents.length).toBeGreaterThan(0);
      expect(result.agents.every(agent =>
        agent.status === 'UNPROSECUTED' ||
        !agent.legalStatus?.convicted
      )).toBe(true);
    });

    it('should handle edge case: page beyond total pages', async () => {
      const mockUnprosecuted = Array.from({ length: 10 }, (_, i) => ({
        fullName: `Agent ${i + 1}`,
        status: 'UNPROSECUTED',
      }));

      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockUnprosecuted),
        }),
      });

      const result = await service.getAllAgentsPaginated(100, 50, 'unprosecuted');

      expect(result.agents).toEqual([]);
      expect(result.hasNext).toBe(false);
    });

    it('should handle error and throw exception', async () => {
      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockRejectedValue(new Error('Database connection failed')),
        }),
      });

      // Should throw because fallback also fails
      mockDinaPerpModel.find.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Model query failed')),
      });

      await expect(
        service.getAllAgentsPaginated(1, 50, 'unprosecuted')
      ).rejects.toThrow();
    });
  });

  describe('🎯 getDinaPerpetrators', () => {
    it('should fetch from comprehensive collection', async () => {
      const mockAgents = [
        { fullName: 'Agent 1', role: 'Operative', status: 'CONVICTED' },
        { fullName: 'Agent 2', role: 'Director', status: 'UNPROSECUTED' },
      ];

      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockAgents),
        }),
      });

      const result = await service.getDinaPerpetrators();

      expect(result.length).toBe(2);
      expect(result[0]).toHaveProperty('fullName');
      expect(result[0]).toHaveProperty('role');
    });

    it('should fallback to old collection on error', async () => {
      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockRejectedValue(new Error('Collection error')),
        }),
      });

      const mockPerpetrators = [
        {
          id: 1,
          fullName: 'Agent 1',
          position: 'Director',
          toObject: jest.fn().mockReturnThis(),
        },
      ];

      mockDinaPerpModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPerpetrators),
      });

      const result = await service.getDinaPerpetrators();

      expect(result.length).toBe(1);
    });
  });

  describe('🎯 getComprehensiveAgents', () => {
    it('should fetch comprehensive agents', async () => {
      const mockAgents = [
        { fullName: 'Agent 1', role: 'Operative' },
        { fullName: 'Agent 2', role: 'Director' },
      ];

      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockAgents),
        }),
      });

      const result = await service.getComprehensiveAgents();

      expect(result.length).toBe(2);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Retrieved 2 comprehensive DINA agents')
      );
    });

    it('should return empty array on error', async () => {
      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockRejectedValue(new Error('Error')),
        }),
      });

      const result = await service.getComprehensiveAgents();

      expect(result).toEqual([]);
    });
  });

  describe('⚠️ getWantedAgents', () => {
    it('should fetch agents with AT LARGE status', async () => {
      const mockWanted = [
        { fullName: 'Fugitive 1', status: 'AT LARGE' },
        { fullName: 'Fugitive 2', status: 'AT LARGE - FIGHTING EXTRADITION' },
      ];

      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockWanted),
        }),
      });

      const result = await service.getWantedAgents();

      expect(result.length).toBe(2);
      expect(result.every(agent => agent.status.includes('AT LARGE'))).toBe(true);
    });

    it('should return empty array on error', async () => {
      mockConnection.collection.mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockRejectedValue(new Error('Error')),
        }),
      });

      const result = await service.getWantedAgents();

      expect(result).toEqual([]);
    });
  });

  describe('📊 getResearchSummary', () => {
    it('should fetch research summary', async () => {
      const mockSummary = {
        methodology: 'Historical research',
        sources: ['Archives'],
        total_agents: 1097,
      };

      mockConnection.collection.mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockSummary),
      });

      const result = await service.getResearchSummary();

      expect(result).toEqual(mockSummary);
    });

    it('should return null on error', async () => {
      mockConnection.collection.mockReturnValue({
        findOne: jest.fn().mockRejectedValue(new Error('Error')),
      });

      const result = await service.getResearchSummary();

      expect(result).toBeNull();
    });
  });
});

// *purrs in comprehensive testing mastery* 😻⚖️
// DINA SERVICE FULLY TESTED WITH UNPROSECUTED FILTER, NYAA~! 🐾⚡👑
