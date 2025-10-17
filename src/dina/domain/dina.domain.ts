// 🐾⚖️ NEKO DEFENSE - DINA Domain Logic ⚖️🐾
// Pure functions for DINA business logic, nyaa~!

import { pipe } from 'fp-ts/function';
import * as A from 'fp-ts/Array';
import * as R from 'fp-ts/Record';

/**
 * 📊 DINA Statistics (immutable)
 */
export type DinaStats = Readonly<{
  total_documents: number;
  perpetrators: Readonly<{
    total: number;
    convicted: number;
    unprosecuted: number;
    atLarge: number;
    imprisoned: number;
    deceased: number;
    neverProsecuted: number;
    total_known_agents: number;
  }>;
  torture_centers: number;
  international_crimes: number;
  victims_estimated: number;
  disappeared: number;
  executed: number;
  last_updated: string;
}>;

/**
 * 📋 DINA Agent type (from MongoDB)
 */
export type DinaAgent = Readonly<{
  fullName?: string;
  alias?: string;
  role?: string;
  rank?: string;
  organization?: readonly string[];
  status?: string;
  legalStatus?: Readonly<{
    convicted?: boolean;
    currentStatus?: string;
    sentences?: any;
    prisonLocation?: string;
  }>;
  crimesAccused?: readonly string[];
  notableOperations?: readonly string[];
  verificationStatus?: string;
  significance?: string;
  tags?: readonly string[];
  timeline?: any;
  priority?: number;
}>;

/**
 * 🔍 Status matcher predicates (pure functions)
 */
const isConvicted = (agent: DinaAgent): boolean =>
  agent.legalStatus?.convicted === true;

const isAtLarge = (agent: DinaAgent): boolean =>
  !!agent.status && /AT LARGE/i.test(agent.status);

const isImprisoned = (agent: DinaAgent): boolean =>
  agent.status === 'CONVICTED - IMPRISONED';

const isDeceased = (agent: DinaAgent): boolean =>
  !!agent.status && /DECEASED/i.test(agent.status);

const isNeverProsecuted = (agent: DinaAgent): boolean =>
  !!agent.status && /NEVER PROSECUTED/i.test(agent.status);

const isUnprosecuted = (agent: DinaAgent): boolean =>
  !agent.legalStatus?.convicted ||
  (!!agent.status && /UNPROSECUTED/i.test(agent.status));

/**
 * 📊 Calculate DINA statistics (pure function, immutable)
 */
export const calculateDinaStats = (
  agents: readonly DinaAgent[],
): DinaStats => {
  const convicted = pipe(agents, A.filter(isConvicted), a => a.length);
  const atLarge = pipe(agents, A.filter(isAtLarge), a => a.length);
  const imprisoned = pipe(agents, A.filter(isImprisoned), a => a.length);
  const deceased = pipe(agents, A.filter(isDeceased), a => a.length);
  const neverProsecuted = pipe(agents, A.filter(isNeverProsecuted), a => a.length);

  return {
    total_documents: agents.length,
    perpetrators: {
      total: agents.length,
      convicted,
      unprosecuted: agents.length - convicted,
      atLarge,
      imprisoned,
      deceased,
      neverProsecuted,
      total_known_agents: 1097, // From 2008 Chilean Army list
    },
    torture_centers: 4, // Villa Grimaldi, Londres 38, José Domingo Cañas, Cuatro Alamos
    international_crimes: 4, // Letelier, Prats, Leighton, Operation Condor
    victims_estimated: 30000,
    disappeared: 957,
    executed: 2279,
    last_updated: new Date().toISOString(),
  } as const;
};

/**
 * 🎯 Filter agents by status (pure function)
 */
export const filterByStatus = (filter: string) => (
  agents: readonly DinaAgent[],
): readonly DinaAgent[] => {
  if (!filter || filter === 'all') return agents;

  const filterMap: Readonly<Record<string, (a: DinaAgent) => boolean>> = {
    unprosecuted: isUnprosecuted,
    at_large: isAtLarge,
    convicted: isConvicted,
    deceased: isDeceased,
    never_prosecuted: isNeverProsecuted,
  };

  const predicate = filterMap[filter];
  return predicate ? pipe(agents, A.filter(predicate)) : agents;
};

/**
 * 📋 Transform agent for frontend (pure function)
 */
export const transformAgent = (agent: any): DinaAgent => ({
  fullName: agent.fullName,
  alias: agent.alias,
  role: agent.role,
  rank: agent.rank,
  organization: agent.organization || ['DINA'],
  status: agent.status,
  legalStatus: {
    convicted: agent.legalStatus?.convicted || false,
    currentStatus: agent.legalStatus?.currentStatus || agent.status,
    sentences: agent.legalStatus?.sentences,
    prisonLocation: agent.legalStatus?.prisonLocation,
  },
  crimesAccused: agent.crimesAccused || [],
  notableOperations: agent.notableOperations || [],
  verificationStatus: agent.verificationStatus,
  significance: agent.significance,
  tags: agent.tags || [],
  timeline: agent.timeline,
  priority: agent.priority,
} as const);

/**
 * 📋 Paginate agents (pure function, immutable)
 */
export type PaginationParams = Readonly<{
  page: number;
  limit: number;
}>;

export type PaginatedResult<T> = Readonly<{
  data: readonly T[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}>;

export const paginate = <T>(params: PaginationParams) => (
  items: readonly T[],
): PaginatedResult<T> => {
  const { page, limit } = params;
  const skip = (page - 1) * limit;
  const paginatedItems = items.slice(skip, skip + limit);
  const totalPages = Math.ceil(items.length / limit);

  return {
    data: paginatedItems,
    currentPage: page,
    pageSize: limit,
    totalItems: items.length,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  } as const;
};

/**
 * 🔄 Convert to readonly array
 */
export const toReadonlyAgents = (agents: any[]): readonly DinaAgent[] =>
  agents as readonly DinaAgent[];
