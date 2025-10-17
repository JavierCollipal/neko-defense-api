// 🐾🧪 NEKO DEFENSE - DINA Domain Logic Unit Tests 🧪🐾
import {
  calculateDinaStats,
  filterByStatus,
  transformAgent,
  paginate,
  toReadonlyAgents,
  DinaAgent,
  DinaStats,
} from './dina.domain';

describe('DINA Domain Logic', () => {
  // Mock DINA agents for testing
  const mockAgents: DinaAgent[] = [
    {
      fullName: 'Convicted Agent',
      status: 'CONVICTED - IMPRISONED',
      legalStatus: { convicted: true, currentStatus: 'IMPRISONED', prisonLocation: 'Prison A' },
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
      legalStatus: { convicted: false, currentStatus: 'DECEASED' },
      rank: 'Lieutenant',
      organization: ['DINA'],
    },
    {
      fullName: 'Never Prosecuted Agent',
      status: 'NEVER PROSECUTED',
      legalStatus: { convicted: false, currentStatus: 'NEVER PROSECUTED' },
      rank: 'Sergeant',
      organization: ['DINA'],
    },
    {
      fullName: 'Unprosecuted Agent',
      status: 'UNPROSECUTED',
      legalStatus: { convicted: false },
      rank: 'Agent',
      organization: ['DINA'],
    },
  ];

  describe('calculateDinaStats', () => {
    it('should calculate correct statistics', () => {
      const stats = calculateDinaStats(mockAgents);

      expect(stats.total_documents).toBe(5);
      expect(stats.perpetrators.total).toBe(5);
      expect(stats.perpetrators.convicted).toBe(1);
      expect(stats.perpetrators.unprosecuted).toBe(4);
      expect(stats.perpetrators.atLarge).toBe(1);
      expect(stats.perpetrators.imprisoned).toBe(1);
      expect(stats.perpetrators.deceased).toBe(1);
      expect(stats.perpetrators.neverProsecuted).toBe(1);
      expect(stats.perpetrators.total_known_agents).toBe(1097);
    });

    it('should include historical data', () => {
      const stats = calculateDinaStats(mockAgents);

      expect(stats.torture_centers).toBe(4);
      expect(stats.international_crimes).toBe(4);
      expect(stats.victims_estimated).toBe(30000);
      expect(stats.disappeared).toBe(957);
      expect(stats.executed).toBe(2279);
    });

    it('should have last_updated timestamp', () => {
      const stats = calculateDinaStats(mockAgents);

      expect(stats.last_updated).toBeDefined();
      expect(new Date(stats.last_updated)).toBeInstanceOf(Date);
    });

    it('should return zero counts for empty array', () => {
      const stats = calculateDinaStats([]);

      expect(stats.total_documents).toBe(0);
      expect(stats.perpetrators.total).toBe(0);
      expect(stats.perpetrators.convicted).toBe(0);
      expect(stats.perpetrators.unprosecuted).toBe(0);
    });

    it('should be pure (same input produces same output)', () => {
      const stats1 = calculateDinaStats(mockAgents);
      const stats2 = calculateDinaStats(mockAgents);

      expect(stats1.total_documents).toBe(stats2.total_documents);
      expect(stats1.perpetrators).toEqual(stats2.perpetrators);
    });

    it('should not mutate input array', () => {
      const input = [...mockAgents];
      calculateDinaStats(input);

      expect(input).toEqual(mockAgents);
    });
  });

  describe('filterByStatus', () => {
    it('should return all agents for undefined filter', () => {
      const filtered = filterByStatus(undefined as any)(mockAgents);

      expect(filtered).toHaveLength(5);
      expect(filtered).toEqual(mockAgents);
    });

    it('should return all agents for "all" filter', () => {
      const filtered = filterByStatus('all')(mockAgents);

      expect(filtered).toHaveLength(5);
    });

    it('should filter unprosecuted agents', () => {
      const filtered = filterByStatus('unprosecuted')(mockAgents);

      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every(a => !a.legalStatus?.convicted)).toBe(true);
    });

    it('should filter at_large agents', () => {
      const filtered = filterByStatus('at_large')(mockAgents);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].fullName).toBe('At Large Agent');
    });

    it('should filter convicted agents', () => {
      const filtered = filterByStatus('convicted')(mockAgents);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].fullName).toBe('Convicted Agent');
    });

    it('should filter deceased agents', () => {
      const filtered = filterByStatus('deceased')(mockAgents);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].fullName).toBe('Deceased Agent');
    });

    it('should filter never_prosecuted agents', () => {
      const filtered = filterByStatus('never_prosecuted')(mockAgents);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].fullName).toBe('Never Prosecuted Agent');
    });

    it('should return all for unknown filter', () => {
      const filtered = filterByStatus('unknown')(mockAgents);

      expect(filtered).toEqual(mockAgents);
    });

    it('should not mutate original array', () => {
      const original = [...mockAgents];
      filterByStatus('convicted')(original);

      expect(original).toEqual(mockAgents);
    });
  });

  describe('transformAgent', () => {
    it('should transform agent with all fields', () => {
      const input = {
        fullName: 'Test Agent',
        alias: 'The Ghost',
        role: 'Interrogator',
        rank: 'Colonel',
        organization: ['DINA', 'CNI'],
        status: 'CONVICTED',
        legalStatus: {
          convicted: true,
          currentStatus: 'IMPRISONED',
          sentences: '20 years',
          prisonLocation: 'Prison X',
        },
        crimesAccused: ['Torture', 'Murder'],
        notableOperations: ['Operation Condor'],
        verificationStatus: 'VERIFIED',
        significance: 'High-ranking officer',
        tags: ['VERIFIED', 'CONVICTED'],
        timeline: { start: '1973', end: '1977' },
        priority: 1,
      };

      const transformed = transformAgent(input);

      expect(transformed.fullName).toBe('Test Agent');
      expect(transformed.alias).toBe('The Ghost');
      expect(transformed.role).toBe('Interrogator');
      expect(transformed.rank).toBe('Colonel');
      expect(transformed.organization).toEqual(['DINA', 'CNI']);
      expect(transformed.legalStatus?.convicted).toBe(true);
      expect(transformed.crimesAccused).toEqual(['Torture', 'Murder']);
    });

    it('should handle missing optional fields', () => {
      const input = {
        fullName: 'Minimal Agent',
      };

      const transformed = transformAgent(input);

      expect(transformed.fullName).toBe('Minimal Agent');
      expect(transformed.organization).toEqual(['DINA']);
      expect(transformed.legalStatus?.convicted).toBe(false);
      expect(transformed.crimesAccused).toEqual([]);
      expect(transformed.notableOperations).toEqual([]);
      expect(transformed.tags).toEqual([]);
    });

    it('should set default organization to DINA', () => {
      const input = { fullName: 'Test' };
      const transformed = transformAgent(input);

      expect(transformed.organization).toEqual(['DINA']);
    });

    it('should set default convicted to false', () => {
      const input = { fullName: 'Test', legalStatus: {} };
      const transformed = transformAgent(input);

      expect(transformed.legalStatus?.convicted).toBe(false);
    });

    it('should preserve legal status fields', () => {
      const input = {
        fullName: 'Test',
        legalStatus: {
          convicted: true,
          currentStatus: 'IMPRISONED',
          sentences: '15 years',
          prisonLocation: 'Punta Peuco',
        },
      };

      const transformed = transformAgent(input);

      expect(transformed.legalStatus?.sentences).toBe('15 years');
      expect(transformed.legalStatus?.prisonLocation).toBe('Punta Peuco');
    });
  });

  describe('paginate', () => {
    it('should paginate correctly (page 1)', () => {
      const result = paginate({ page: 1, limit: 2 })(mockAgents);

      expect(result.data).toHaveLength(2);
      expect(result.currentPage).toBe(1);
      expect(result.pageSize).toBe(2);
      expect(result.totalItems).toBe(5);
      expect(result.totalPages).toBe(3);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrevious).toBe(false);
    });

    it('should paginate correctly (page 2)', () => {
      const result = paginate({ page: 2, limit: 2 })(mockAgents);

      expect(result.data).toHaveLength(2);
      expect(result.currentPage).toBe(2);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrevious).toBe(true);
    });

    it('should paginate correctly (last page)', () => {
      const result = paginate({ page: 3, limit: 2 })(mockAgents);

      expect(result.data).toHaveLength(1); // Only 1 item on last page
      expect(result.currentPage).toBe(3);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrevious).toBe(true);
    });

    it('should handle empty array', () => {
      const result = paginate({ page: 1, limit: 10 })([]);

      expect(result.data).toEqual([]);
      expect(result.totalItems).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrevious).toBe(false);
    });

    it('should handle page beyond total pages', () => {
      const result = paginate({ page: 10, limit: 2 })(mockAgents);

      expect(result.data).toEqual([]);
      expect(result.currentPage).toBe(10);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrevious).toBe(true);
    });

    it('should handle large limit (all items on one page)', () => {
      const result = paginate({ page: 1, limit: 100 })(mockAgents);

      expect(result.data).toHaveLength(5);
      expect(result.totalPages).toBe(1);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrevious).toBe(false);
    });

    it('should be pure (not mutate input)', () => {
      const original = [...mockAgents];
      paginate({ page: 1, limit: 2 })(original);

      expect(original).toEqual(mockAgents);
    });
  });

  describe('toReadonlyAgents', () => {
    it('should convert array to readonly', () => {
      const mutable = [...mockAgents];
      const readonly = toReadonlyAgents(mutable);

      expect(readonly).toEqual(mutable);
      expect(Array.isArray(readonly)).toBe(true);
    });

    it('should handle empty array', () => {
      const readonly = toReadonlyAgents([]);

      expect(readonly).toEqual([]);
    });

    it('should preserve agent properties', () => {
      const readonly = toReadonlyAgents(mockAgents);

      expect(readonly[0].fullName).toBe('Convicted Agent');
      expect(readonly[0].rank).toBe('Colonel');
    });
  });

  describe('Integration Tests', () => {
    it('should compose filter and paginate', () => {
      const result = paginate({ page: 1, limit: 2 })(
        filterByStatus('unprosecuted')(mockAgents)
      );

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.totalItems).toBeGreaterThan(0);
    });

    it('should maintain immutability through composition', () => {
      const original = [...mockAgents];

      const result = paginate({ page: 1, limit: 2 })(
        filterByStatus('convicted')(original)
      );

      expect(original).toEqual(mockAgents);
      expect(result.data).not.toBe(original);
    });

    it('should handle empty results through composition', () => {
      const result = paginate({ page: 1, limit: 10 })(
        filterByStatus('convicted')([])
      );

      expect(result.data).toEqual([]);
      expect(result.totalItems).toBe(0);
    });
  });
});
