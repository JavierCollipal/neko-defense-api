// 🐾🎯 NEKO DEFENSE - Threat Actor Domain Logic 🎯🐾
// Pure functions for threat actor business logic, nyaa~!

import { pipe } from 'fp-ts/function';
import * as A from 'fp-ts/Array';
import * as R from 'fp-ts/Record';
import { ThreatActor } from '../../database/schemas/threat-actor.schema';

/**
 * 📊 Threat count types (immutable)
 */
export type ThreatCounts = Readonly<{
  all: number;
  predators: number;
  pedophiles: number;
  dina_network: number;
  ransomware: number;
  state_sponsored: number;
  crypto_crime: number;
}>;

/**
 * 🔍 Category matcher predicates (pure functions)
 */
const isPredator = (actor: ThreatActor): boolean =>
  actor.type === 'predator' ||
  actor.actor_classification === 'INDIVIDUAL_PREDATOR' ||
  actor.category === 'predator';

const isPedophile = (actor: ThreatActor): boolean =>
  actor.type === 'pedophile' ||
  actor.actor_classification === 'PEDOPHILE' ||
  actor.category === 'pedophile' ||
  actor.target_type === 'children' ||
  (!!actor.description && /pedophil|child abuse|csam/i.test(actor.description));

const isDinaNetwork = (actor: ThreatActor): boolean =>
  actor.network === 'DINA' ||
  actor.actor_classification === 'DINA_NETWORK' ||
  actor.category === 'dina_network';

const isRansomware = (actor: ThreatActor): boolean =>
  actor.type === 'cybercrime_group' ||
  actor.actor_classification === 'CYBERCRIME_RANSOMWARE' ||
  actor.category === 'ransomware';

const isStateSponsored = (actor: ThreatActor): boolean =>
  actor.state_actor === true ||
  actor.state_sponsored === true ||
  (!!actor.actor_classification && /STATE_SPONSORED/i.test(actor.actor_classification));

const isCryptoCrime = (actor: ThreatActor): boolean =>
  actor.category === 'crypto_crime' ||
  actor.actor_classification === 'CRYPTO_CRIME' ||
  actor.type === 'crypto_thief';

/**
 * 📊 Calculate threat counts (pure function, immutable)
 * Input: readonly array of threat actors
 * Output: immutable counts object
 */
export const calculateThreatCounts = (
  actors: readonly ThreatActor[],
): ThreatCounts => {
  const counts = {
    all: actors.length,
    predators: pipe(actors, A.filter(isPredator), a => a.length),
    pedophiles: pipe(actors, A.filter(isPedophile), a => a.length),
    dina_network: pipe(actors, A.filter(isDinaNetwork), a => a.length),
    ransomware: pipe(actors, A.filter(isRansomware), a => a.length),
    state_sponsored: pipe(actors, A.filter(isStateSponsored), a => a.length),
    crypto_crime: pipe(actors, A.filter(isCryptoCrime), a => a.length),
  } as const;

  return counts;
};

/**
 * 🔍 Find threat actor by ID (pure function)
 * Returns option type for null safety
 */
export const findActorById = (actorId: string) => (
  actors: readonly ThreatActor[],
): ThreatActor | undefined =>
  pipe(
    actors,
    A.findFirst(actor => actor.actor_id === actorId),
    option => (option._tag === 'Some' ? option.value : undefined),
  );

/**
 * 📋 Sort threat actors by priority (pure function, immutable)
 */
export const sortByPriority = (
  actors: readonly ThreatActor[],
): readonly ThreatActor[] => {
  // Manual sort implementation since fp-ts sortBy expects Ord instances
  const sorted = [...actors].sort((a, b) => {
    // First compare by threat level
    const levelMap: Record<string, number> = {
      CRITICAL: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
    };
    const aLevel = levelMap[a.threat_level] ?? 999;
    const bLevel = levelMap[b.threat_level] ?? 999;

    if (aLevel !== bLevel) {
      return aLevel - bLevel;
    }

    // Then by rank
    const aRank = a.rank ?? 999;
    const bRank = b.rank ?? 999;
    return aRank - bRank;
  });

  return sorted as readonly ThreatActor[];
};

/**
 * 🎯 Filter actors by category (pure function)
 */
export const filterByCategory = (category: string) => (
  actors: readonly ThreatActor[],
): readonly ThreatActor[] => {
  if (category === 'all') return actors;

  const filterMap: Readonly<Record<string, (a: ThreatActor) => boolean>> = {
    predators: isPredator,
    pedophiles: isPedophile,
    dina_network: isDinaNetwork,
    ransomware: isRansomware,
    state_sponsored: isStateSponsored,
    crypto_crime: isCryptoCrime,
  };

  const predicate = filterMap[category];
  return predicate ? pipe(actors, A.filter(predicate)) : actors;
};

/**
 * 🔄 Transform actors to immutable readonly array
 */
export const toReadonlyActors = (actors: ThreatActor[]): readonly ThreatActor[] =>
  actors as readonly ThreatActor[];
