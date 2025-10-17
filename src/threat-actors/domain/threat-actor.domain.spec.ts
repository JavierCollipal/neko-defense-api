// 🐾🧪 NEKO DEFENSE - Threat Actor Domain Logic Unit Tests 🧪🐾
import {
  calculateThreatCounts,
  findActorById,
  sortByPriority,
  filterByCategory,
  toReadonlyActors,
  ThreatCounts,
} from './threat-actor.domain';
import { ThreatActor } from '../../database/schemas/threat-actor.schema';

describe('Threat Actor Domain Logic', () => {
  // Mock threat actors for testing
  const mockActors: ThreatActor[] = [
    {
      actor_id: 'predator-1',
      name: 'Test Predator',
      type: 'predator',
      threat_level: 'CRITICAL',
      rank: 1,
    } as ThreatActor,
    {
      actor_id: 'pedophile-1',
      name: 'Test Pedophile',
      type: 'pedophile',
      target_type: 'children',
      threat_level: 'CRITICAL',
      rank: 2,
    } as ThreatActor,
    {
      actor_id: 'dina-1',
      name: 'DINA Agent',
      network: 'DINA',
      actor_classification: 'DINA_NETWORK',
      threat_level: 'HIGH',
      rank: 3,
    } as ThreatActor,
    {
      actor_id: 'ransomware-1',
      name: 'Ransomware Group',
      type: 'cybercrime_group',
      actor_classification: 'CYBERCRIME_RANSOMWARE',
      threat_level: 'HIGH',
      rank: 4,
    } as ThreatActor,
    {
      actor_id: 'state-1',
      name: 'State Actor',
      state_actor: true,
      state_sponsored: true,
      threat_level: 'CRITICAL',
      rank: 5,
    } as ThreatActor,
    {
      actor_id: 'crypto-1',
      name: 'Crypto Thief',
      type: 'crypto_thief',
      category: 'crypto_crime',
      threat_level: 'MEDIUM',
      rank: 6,
    } as ThreatActor,
  ];

  describe('calculateThreatCounts', () => {
    it('should calculate correct counts for all categories', () => {
      const counts = calculateThreatCounts(mockActors);

      expect(counts.all).toBe(6);
      expect(counts.predators).toBe(1);
      expect(counts.pedophiles).toBe(1);
      expect(counts.dina_network).toBe(1);
      expect(counts.ransomware).toBe(1);
      expect(counts.state_sponsored).toBe(1);
      expect(counts.crypto_crime).toBe(1);
    });

    it('should return zero counts for empty array', () => {
      const counts = calculateThreatCounts([]);

      expect(counts.all).toBe(0);
      expect(counts.predators).toBe(0);
      expect(counts.pedophiles).toBe(0);
      expect(counts.dina_network).toBe(0);
      expect(counts.ransomware).toBe(0);
      expect(counts.state_sponsored).toBe(0);
      expect(counts.crypto_crime).toBe(0);
    });

    it('should handle actors with multiple classifications', () => {
      const multiClassActor: ThreatActor = {
        actor_id: 'multi-1',
        name: 'Multi Class',
        type: 'predator',
        category: 'pedophile',
        description: 'pedophile activity detected',
        threat_level: 'CRITICAL',
      } as ThreatActor;

      const counts = calculateThreatCounts([multiClassActor]);

      expect(counts.predators).toBe(1);
      expect(counts.pedophiles).toBe(1); // Should count in both
    });

    it('should be pure (same input produces same output)', () => {
      const counts1 = calculateThreatCounts(mockActors);
      const counts2 = calculateThreatCounts(mockActors);

      expect(counts1).toEqual(counts2);
    });

    it('should not mutate input array', () => {
      const input = [...mockActors];
      calculateThreatCounts(input);

      expect(input).toEqual(mockActors);
    });
  });

  describe('findActorById', () => {
    it('should find actor by ID', () => {
      const result = findActorById('predator-1')(mockActors);

      expect(result).toBeDefined();
      expect(result?.actor_id).toBe('predator-1');
      expect(result?.name).toBe('Test Predator');
    });

    it('should return undefined for non-existent ID', () => {
      const result = findActorById('non-existent')(mockActors);

      expect(result).toBeUndefined();
    });

    it('should return undefined for empty array', () => {
      const result = findActorById('any-id')([]);

      expect(result).toBeUndefined();
    });

    it('should find first match if multiple actors have same ID', () => {
      const duplicates = [
        { actor_id: 'dup', name: 'First' } as ThreatActor,
        { actor_id: 'dup', name: 'Second' } as ThreatActor,
      ];

      const result = findActorById('dup')(duplicates);

      expect(result?.name).toBe('First');
    });

    it('should be pure function', () => {
      const input = [...mockActors];
      const result1 = findActorById('predator-1')(input);
      const result2 = findActorById('predator-1')(input);

      expect(result1).toEqual(result2);
      expect(input).toEqual(mockActors); // No mutation
    });
  });

  describe('sortByPriority', () => {
    it('should sort by threat_level descending, then rank ascending', () => {
      const unsorted: ThreatActor[] = [
        { actor_id: '1', threat_level: 'MEDIUM', rank: 3 } as ThreatActor,
        { actor_id: '2', threat_level: 'CRITICAL', rank: 2 } as ThreatActor,
        { actor_id: '3', threat_level: 'CRITICAL', rank: 1 } as ThreatActor,
        { actor_id: '4', threat_level: 'HIGH', rank: 1 } as ThreatActor,
        { actor_id: '5', threat_level: 'LOW', rank: 1 } as ThreatActor,
      ];

      const sorted = sortByPriority(unsorted);

      expect(sorted[0].actor_id).toBe('3'); // CRITICAL, rank 1
      expect(sorted[1].actor_id).toBe('2'); // CRITICAL, rank 2
      expect(sorted[2].actor_id).toBe('4'); // HIGH, rank 1
      expect(sorted[3].actor_id).toBe('1'); // MEDIUM, rank 3
      expect(sorted[4].actor_id).toBe('5'); // LOW, rank 1
    });

    it('should handle missing rank (default to 999)', () => {
      const actors: ThreatActor[] = [
        { actor_id: '1', threat_level: 'CRITICAL', rank: 1 } as ThreatActor,
        { actor_id: '2', threat_level: 'CRITICAL' } as ThreatActor,
      ];

      const sorted = sortByPriority(actors);

      expect(sorted[0].actor_id).toBe('1'); // Has rank
      expect(sorted[1].actor_id).toBe('2'); // No rank (999)
    });

    it('should handle unknown threat levels', () => {
      const actors: ThreatActor[] = [
        { actor_id: '1', threat_level: 'CRITICAL' } as ThreatActor,
        { actor_id: '2', threat_level: 'UNKNOWN' as any } as ThreatActor,
      ];

      const sorted = sortByPriority(actors);

      expect(sorted[0].actor_id).toBe('1'); // CRITICAL comes first
      expect(sorted[1].actor_id).toBe('2'); // UNKNOWN goes last
    });

    it('should return empty array for empty input', () => {
      const sorted = sortByPriority([]);

      expect(sorted).toEqual([]);
    });

    it('should not mutate original array', () => {
      const original = [...mockActors];
      const sorted = sortByPriority(original);

      expect(original).toEqual(mockActors); // Original unchanged
      expect(sorted).not.toBe(original); // New array
    });
  });

  describe('filterByCategory', () => {
    it('should return all actors for "all" category', () => {
      const filtered = filterByCategory('all')(mockActors);

      expect(filtered).toHaveLength(6);
      expect(filtered).toEqual(mockActors);
    });

    it('should filter predators', () => {
      const filtered = filterByCategory('predators')(mockActors);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].actor_id).toBe('predator-1');
    });

    it('should filter pedophiles', () => {
      const filtered = filterByCategory('pedophiles')(mockActors);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].actor_id).toBe('pedophile-1');
    });

    it('should filter DINA network', () => {
      const filtered = filterByCategory('dina_network')(mockActors);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].actor_id).toBe('dina-1');
    });

    it('should filter ransomware', () => {
      const filtered = filterByCategory('ransomware')(mockActors);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].actor_id).toBe('ransomware-1');
    });

    it('should filter state sponsored', () => {
      const filtered = filterByCategory('state_sponsored')(mockActors);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].actor_id).toBe('state-1');
    });

    it('should filter crypto crime', () => {
      const filtered = filterByCategory('crypto_crime')(mockActors);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].actor_id).toBe('crypto-1');
    });

    it('should return all actors for unknown category', () => {
      const filtered = filterByCategory('unknown')(mockActors);

      expect(filtered).toEqual(mockActors);
    });

    it('should return empty array for empty input', () => {
      const filtered = filterByCategory('predators')([]);

      expect(filtered).toEqual([]);
    });

    it('should not mutate original array', () => {
      const original = [...mockActors];
      filterByCategory('predators')(original);

      expect(original).toEqual(mockActors);
    });
  });

  describe('toReadonlyActors', () => {
    it('should convert array to readonly', () => {
      const mutable = [...mockActors];
      const readonly = toReadonlyActors(mutable);

      expect(readonly).toEqual(mutable);
      expect(Array.isArray(readonly)).toBe(true);
    });

    it('should handle empty array', () => {
      const readonly = toReadonlyActors([]);

      expect(readonly).toEqual([]);
    });

    it('should preserve actor properties', () => {
      const readonly = toReadonlyActors(mockActors);

      expect(readonly[0].actor_id).toBe('predator-1');
      expect(readonly[0].name).toBe('Test Predator');
    });
  });

  describe('Integration Tests', () => {
    it('should compose multiple functions correctly', () => {
      const result = sortByPriority(
        filterByCategory('predators')(mockActors)
      );

      expect(result).toHaveLength(1);
      expect(result[0].actor_id).toBe('predator-1');
    });

    it('should handle empty results through composition', () => {
      const result = sortByPriority(
        filterByCategory('predators')([])
      );

      expect(result).toEqual([]);
    });

    it('should maintain immutability through composition', () => {
      const original = [...mockActors];

      const result = sortByPriority(
        filterByCategory('predators')(original)
      );

      expect(original).toEqual(mockActors);
      expect(result).not.toBe(original);
    });
  });
});
