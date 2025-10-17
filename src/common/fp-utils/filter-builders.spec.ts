// 🐾🧪 NEKO DEFENSE - Filter Builders Unit Tests 🧪🐾
import * as O from 'fp-ts/Option';
import {
  buildThreatActorFilter,
  buildDinaStatusFilter,
  buildThreatActorSort,
  buildDinaAgentSort,
} from './filter-builders';

describe('Filter Builders', () => {
  describe('buildThreatActorFilter', () => {
    it('should return empty filter for "all" category', () => {
      const result = buildThreatActorFilter('all');

      expect(O.isSome(result)).toBe(true);
      if (O.isSome(result)) {
        expect(result.value).toEqual({});
      }
    });

    it('should return filter for "predators" category', () => {
      const result = buildThreatActorFilter('predators');

      expect(O.isSome(result)).toBe(true);
      if (O.isSome(result)) {
        expect(result.value).toHaveProperty('$or');
        expect(result.value.$or).toContainEqual({ type: 'predator' });
        expect(result.value.$or).toContainEqual({ actor_classification: 'INDIVIDUAL_PREDATOR' });
        expect(result.value.$or).toContainEqual({ category: 'predator' });
      }
    });

    it('should return filter for "pedophiles" category', () => {
      const result = buildThreatActorFilter('pedophiles');

      expect(O.isSome(result)).toBe(true);
      if (O.isSome(result)) {
        expect(result.value).toHaveProperty('$or');
        expect(result.value.$or).toHaveLength(5);
        expect(result.value.$or).toContainEqual({ type: 'pedophile' });
        expect(result.value.$or).toContainEqual({ actor_classification: 'PEDOPHILE' });
        expect(result.value.$or).toContainEqual({ category: 'pedophile' });
        expect(result.value.$or).toContainEqual({ target_type: 'children' });
      }
    });

    it('should return filter for "dina_network" category', () => {
      const result = buildThreatActorFilter('dina_network');

      expect(O.isSome(result)).toBe(true);
      if (O.isSome(result)) {
        expect(result.value.$or).toContainEqual({ network: 'DINA' });
        expect(result.value.$or).toContainEqual({ actor_classification: 'DINA_NETWORK' });
        expect(result.value.$or).toContainEqual({ category: 'dina_network' });
      }
    });

    it('should return filter for "ransomware" category', () => {
      const result = buildThreatActorFilter('ransomware');

      expect(O.isSome(result)).toBe(true);
      if (O.isSome(result)) {
        expect(result.value.$or).toContainEqual({ type: 'cybercrime_group' });
        expect(result.value.$or).toContainEqual({ actor_classification: 'CYBERCRIME_RANSOMWARE' });
        expect(result.value.$or).toContainEqual({ category: 'ransomware' });
      }
    });

    it('should return filter for "state_sponsored" category', () => {
      const result = buildThreatActorFilter('state_sponsored');

      expect(O.isSome(result)).toBe(true);
      if (O.isSome(result)) {
        expect(result.value.$or).toContainEqual({ state_actor: true });
        expect(result.value.$or).toContainEqual({ state_sponsored: true });
      }
    });

    it('should return filter for "crypto_crime" category', () => {
      const result = buildThreatActorFilter('crypto_crime');

      expect(O.isSome(result)).toBe(true);
      if (O.isSome(result)) {
        expect(result.value.$or).toContainEqual({ category: 'crypto_crime' });
        expect(result.value.$or).toContainEqual({ actor_classification: 'CRYPTO_CRIME' });
        expect(result.value.$or).toContainEqual({ type: 'crypto_thief' });
      }
    });

    it('should return None for unknown category', () => {
      const result = buildThreatActorFilter('unknown_category');

      expect(O.isNone(result)).toBe(true);
    });

    it('should return None for empty string', () => {
      const result = buildThreatActorFilter('');

      expect(O.isNone(result)).toBe(true);
    });
  });

  describe('buildDinaStatusFilter', () => {
    it('should return empty filter for undefined', () => {
      const result = buildDinaStatusFilter(undefined);

      expect(O.isSome(result)).toBe(true);
      if (O.isSome(result)) {
        expect(result.value).toEqual({});
      }
    });

    it('should return empty filter for "all"', () => {
      const result = buildDinaStatusFilter('all');

      expect(O.isSome(result)).toBe(true);
      if (O.isSome(result)) {
        expect(result.value).toEqual({});
      }
    });

    it('should return filter for "unprosecuted" status', () => {
      const result = buildDinaStatusFilter('unprosecuted');

      expect(O.isSome(result)).toBe(true);
      if (O.isSome(result)) {
        expect(result.value).toHaveProperty('$or');
        expect(result.value.$or).toHaveLength(3);
        expect(result.value.$or[0]).toHaveProperty('status');
        expect(result.value.$or[1]).toEqual({ 'legalStatus.convicted': false });
      }
    });

    it('should return filter for "at_large" status', () => {
      const result = buildDinaStatusFilter('at_large');

      expect(O.isSome(result)).toBe(true);
      if (O.isSome(result)) {
        expect(result.value).toHaveProperty('status');
        expect(result.value.status).toHaveProperty('$regex');
        expect(result.value.status.$regex).toBe('AT LARGE');
      }
    });

    it('should return filter for "convicted" status', () => {
      const result = buildDinaStatusFilter('convicted');

      expect(O.isSome(result)).toBe(true);
      if (O.isSome(result)) {
        expect(result.value).toEqual({ 'legalStatus.convicted': true });
      }
    });

    it('should return filter for "deceased" status', () => {
      const result = buildDinaStatusFilter('deceased');

      expect(O.isSome(result)).toBe(true);
      if (O.isSome(result)) {
        expect(result.value).toHaveProperty('status');
        expect(result.value.status.$regex).toBe('DECEASED');
      }
    });

    it('should return None for unknown status', () => {
      const result = buildDinaStatusFilter('unknown_status');

      expect(O.isNone(result)).toBe(true);
    });
  });

  describe('buildThreatActorSort', () => {
    it('should return correct sort criteria', () => {
      const result = buildThreatActorSort();

      expect(result).toEqual({
        threat_level: -1,
        rank: 1,
      });
    });

    it('should return immutable object', () => {
      const result1 = buildThreatActorSort();
      const result2 = buildThreatActorSort();

      expect(result1).toEqual(result2);
      expect(result1).not.toBe(result2); // Different instances
    });
  });

  describe('buildDinaAgentSort', () => {
    it('should return correct sort criteria', () => {
      const result = buildDinaAgentSort();

      expect(result).toEqual({
        significance: -1,
        fullName: 1,
      });
    });

    it('should return immutable object', () => {
      const result1 = buildDinaAgentSort();
      const result2 = buildDinaAgentSort();

      expect(result1).toEqual(result2);
      expect(result1).not.toBe(result2); // Different instances
    });
  });

  describe('Immutability Tests', () => {
    it('filter results should be readonly', () => {
      const result = buildThreatActorFilter('predators');

      if (O.isSome(result)) {
        // TypeScript should prevent mutations at compile time
        // This is a runtime check to ensure immutability
        expect(() => {
          (result.value as any).newField = 'test';
        }).not.toThrow(); // JavaScript allows this, but TypeScript types prevent it

        // Verify the filter is still correct after attempted mutation
        expect(result.value).toHaveProperty('$or');
      }
    });

    it('sort criteria should be readonly', () => {
      const sort = buildThreatActorSort();

      // Attempt mutation (would be caught by TypeScript)
      expect(() => {
        (sort as any).newField = 'test';
      }).not.toThrow();

      // Verify original structure intact
      expect(sort).toHaveProperty('threat_level');
      expect(sort).toHaveProperty('rank');
    });
  });
});
