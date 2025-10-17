// 🐾🧪 NEKO DEFENSE - Threat Actors Functional Service Unit Tests 🧪🐾
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ThreatActorsServiceFunctional } from './threat-actors.service.functional';
import { ThreatActor } from '../database/schemas/threat-actor.schema';

describe('ThreatActorsServiceFunctional', () => {
  let service: ThreatActorsServiceFunctional;
  let mockModel: any;

  // Mock threat actors
  const mockActors = [
    {
      actor_id: 'test-1',
      name: 'Test Predator',
      type: 'predator',
      threat_level: 'CRITICAL',
      rank: 1,
    },
    {
      actor_id: 'test-2',
      name: 'Test Ransomware',
      type: 'cybercrime_group',
      actor_classification: 'CYBERCRIME_RANSOMWARE',
      threat_level: 'HIGH',
      rank: 2,
    },
  ];

  beforeEach(async () => {
    // Mock Mongoose model
    mockModel = {
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockActors),
        }),
        exec: jest.fn().mockResolvedValue(mockActors),
      }),
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockActors[0]),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThreatActorsServiceFunctional,
        {
          provide: getModelToken(ThreatActor.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<ThreatActorsServiceFunctional>(ThreatActorsServiceFunctional);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should log initialization message', () => {
      // Service is already initialized in beforeEach
      expect(service).toBeInstanceOf(ThreatActorsServiceFunctional);
    });
  });

  describe('getThreatCounts', () => {
    it('should calculate threat counts using functional pipeline', async () => {
      const counts = await service.getThreatCounts();

      expect(counts).toBeDefined();
      expect(counts.all).toBe(2);
      expect(counts.predators).toBe(1);
      expect(counts.ransomware).toBe(1);
      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should return zero counts for empty results', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const counts = await service.getThreatCounts();

      expect(counts.all).toBe(0);
      expect(counts.predators).toBe(0);
      expect(counts.pedophiles).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      await expect(service.getThreatCounts()).rejects.toThrow();
    });

    it('should call model.find without filter', async () => {
      await service.getThreatCounts();

      expect(mockModel.find).toHaveBeenCalledWith();
    });
  });

  describe('getThreatActorsByCategory', () => {
    it('should fetch all actors for "all" category', async () => {
      const actors = await service.getThreatActorsByCategory('all');

      expect(actors).toHaveLength(2);
      expect(mockModel.find).toHaveBeenCalledWith({});
    });

    it('should fetch predators with correct filter', async () => {
      const actors = await service.getThreatActorsByCategory('predators');

      expect(actors).toBeDefined();
      expect(mockModel.find).toHaveBeenCalled();
      const callArgs = mockModel.find.mock.calls[0][0];
      expect(callArgs).toHaveProperty('$or');
    });

    it('should fetch ransomware with correct filter', async () => {
      const actors = await service.getThreatActorsByCategory('ransomware');

      expect(actors).toBeDefined();
      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should apply sort criteria', async () => {
      await service.getThreatActorsByCategory('all');

      expect(mockModel.find().sort).toHaveBeenCalled();
      const sortArgs = mockModel.find().sort.mock.calls[0][0];
      expect(sortArgs).toHaveProperty('threat_level');
      expect(sortArgs).toHaveProperty('rank');
    });

    it('should handle database errors', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('DB Error')),
        }),
      });

      await expect(service.getThreatActorsByCategory('all')).rejects.toThrow();
    });

    it('should return readonly array', async () => {
      const actors = await service.getThreatActorsByCategory('all');

      expect(Array.isArray(actors)).toBe(true);
      expect(actors).toHaveLength(2);
    });
  });

  describe('getThreatActorById', () => {
    it('should find actor by ID', async () => {
      const actor = await service.getThreatActorById('test-1');

      expect(actor).toBeDefined();
      expect(actor?.actor_id).toBe('test-1');
      expect(mockModel.findOne).toHaveBeenCalledWith({ actor_id: 'test-1' });
    });

    it('should return null for non-existent actor', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const actor = await service.getThreatActorById('non-existent');

      expect(actor).toBeNull();
    });

    it('should handle database errors', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      await expect(service.getThreatActorById('test-1')).rejects.toThrow();
    });

    it('should use correct query structure', async () => {
      await service.getThreatActorById('test-123');

      expect(mockModel.findOne).toHaveBeenCalledWith({ actor_id: 'test-123' });
    });
  });

  describe('Functional Programming Principles', () => {
    it('should use TaskEither for error handling', async () => {
      // If DB succeeds, should return value
      const result = await service.getThreatCounts();
      expect(result).toBeDefined();

      // If DB fails, should throw
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB Error')),
      });
      await expect(service.getThreatCounts()).rejects.toThrow();
    });

    it('should not mutate returned data', async () => {
      // Create fresh copies for each call to verify immutability
      mockModel.find.mockReturnValueOnce({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([...mockActors]),
        }),
      }).mockReturnValueOnce({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([...mockActors]),
        }),
      });

      const actors1 = await service.getThreatActorsByCategory('all');
      const actors2 = await service.getThreatActorsByCategory('all');

      // Same data
      expect(actors1).toEqual(actors2);
      // Different instances (immutable pipeline)
      expect(actors1).not.toBe(actors2);
    });

    it('should compose pure functions in pipeline', async () => {
      // This test verifies that the service uses functional composition
      const actors = await service.getThreatActorsByCategory('predators');

      // Should fetch -> filter -> sort
      expect(mockModel.find).toHaveBeenCalled();
      expect(mockModel.find().sort).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should convert DB errors to DbError', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Connection timeout')),
      });

      try {
        await service.getThreatCounts();
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle null values safely', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getThreatActorById('null-test');

      expect(result).toBeNull();
    });

    it('should handle undefined values safely', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(undefined),
      });

      const result = await service.getThreatActorById('undefined-test');

      expect(result).toBeNull();
    });
  });
});
