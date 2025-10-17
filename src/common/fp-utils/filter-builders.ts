// 🐾🔍 NEKO DEFENSE - Functional Filter Builders 🔍🐾
// Pure functions for building MongoDB queries immutably, nyaa~!

import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/Array';

// Type-safe MongoDB filter
export type MongoFilter = Readonly<{
  [key: string]: any;
}>;

// Pure filter builder type
export type FilterBuilder = (category: string) => O.Option<MongoFilter>;

/**
 * 🎯 Build filter for threat actor categories
 * Pure function - no side effects, immutable
 */
export const buildThreatActorFilter: FilterBuilder = (category: string): O.Option<MongoFilter> => {
  if (category === 'all') {
    return O.some({} as const);
  }

  const filterMap: Readonly<Record<string, MongoFilter>> = {
    predators: {
      $or: [
        { type: 'predator' },
        { actor_classification: 'INDIVIDUAL_PREDATOR' },
        { category: 'predator' },
      ],
    } as const,

    pedophiles: {
      $or: [
        { type: 'pedophile' },
        { actor_classification: 'PEDOPHILE' },
        { category: 'pedophile' },
        { target_type: 'children' },
        { description: { $regex: /pedophil|child abuse|csam/i } },
      ],
    } as const,

    dina_network: {
      $or: [
        { network: 'DINA' },
        { actor_classification: 'DINA_NETWORK' },
        { category: 'dina_network' },
      ],
    } as const,

    ransomware: {
      $or: [
        { type: 'cybercrime_group' },
        { actor_classification: 'CYBERCRIME_RANSOMWARE' },
        { category: 'ransomware' },
      ],
    } as const,

    state_sponsored: {
      $or: [
        { state_actor: true },
        { state_sponsored: true },
        { actor_classification: { $regex: /STATE_SPONSORED/i } },
      ],
    } as const,

    crypto_crime: {
      $or: [
        { category: 'crypto_crime' },
        { actor_classification: 'CRYPTO_CRIME' },
        { type: 'crypto_thief' },
      ],
    } as const,
  } as const;

  return pipe(
    filterMap[category],
    O.fromNullable,
  );
};

/**
 * 🔍 Build filter for DINA agent status
 * Pure function - immutable filter construction
 */
export const buildDinaStatusFilter = (filter?: string): O.Option<MongoFilter> => {
  if (!filter || filter === 'all') {
    return O.some({} as const);
  }

  const filterMap: Readonly<Record<string, MongoFilter>> = {
    unprosecuted: {
      $or: [
        { status: { $regex: 'UNPROSECUTED', $options: 'i' } },
        { 'legalStatus.convicted': false },
        { 'legalStatus.convicted': { $exists: false } },
      ],
    } as const,

    at_large: {
      status: { $regex: 'AT LARGE', $options: 'i' },
    } as const,

    convicted: {
      'legalStatus.convicted': true,
    } as const,

    deceased: {
      status: { $regex: 'DECEASED', $options: 'i' },
    } as const,
  } as const;

  return pipe(
    filterMap[filter],
    O.fromNullable,
  );
};

/**
 * 📋 Build sort criteria (immutable)
 */
export type SortCriteria = Readonly<{
  [key: string]: 1 | -1;
}>;

export const buildThreatActorSort = (): SortCriteria => ({
  threat_level: -1,
  rank: 1,
} as const);

export const buildDinaAgentSort = (): SortCriteria => ({
  significance: -1,
  fullName: 1,
} as const);
