// 🐾⚖️ NEKO DEFENSE - DINA Service (FUNCTIONAL REFACTOR) ⚖️🐾
// Fully functional programming style with immutability, nyaa~!

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { DinaPerp, DinaPerpDocument } from '../database/schemas/dina-perpetrator.schema';
import { pipe, flow } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import { toDbError, tap } from '../common/fp-utils';
import { buildDinaStatusFilter } from '../common/fp-utils/filter-builders';
import {
  calculateDinaStats,
  filterByStatus,
  transformAgent,
  paginate,
  toReadonlyAgents,
  DinaStats,
  DinaAgent,
  PaginatedResult,
  PaginationParams,
} from './domain/dina.domain';

@Injectable()
export class DinaServiceFunctional {
  private readonly TOTAL_KNOWN_AGENTS = 1097; // From 2008 Chilean Army List

  constructor(
    @InjectModel(DinaPerp.name)
    private dinaPerpModel: Model<DinaPerpDocument>,
    @InjectConnection() private connection: Connection,
  ) {
    console.log('⚖️ [DinaServiceFunctional] Initialized with PURE FUNCTIONS, nyaa~!');
  }

  /**
   * 📊 Get DINA statistics (FUNCTIONAL VERSION)
   * Pure function pipeline with TaskEither
   */
  async getDinaStats(): Promise<DinaStats> {
    console.log('📊 [DinaServiceFunctional] Calculating DINA statistics (functional style)');

    return pipe(
      // Step 1: Fetch from comprehensive collection
      TE.tryCatch(
        () => this.connection.collection('dina_agents_comprehensive').find({}).toArray(),
        toDbError,
      ),
      // Step 2: Convert to immutable
      TE.map(toReadonlyAgents),
      // Step 3: Calculate stats using pure function
      TE.map(calculateDinaStats),
      // Step 4: Log result
      TE.map(tap(stats =>
        console.log('✅ [DinaServiceFunctional] DINA stats calculated:', stats)
      )),
      // Execute
      task => task(),
      promise => promise.then(either => {
        if (either._tag === 'Left') throw either.left;
        return either.right;
      }),
    );
  }

  /**
   * 🎯 Get all DINA perpetrators (FUNCTIONAL VERSION)
   * Pure pipeline with transformation
   */
  async getDinaPerpetrators(): Promise<readonly DinaAgent[]> {
    console.log('🎯 [DinaServiceFunctional] Fetching DINA perpetrators (functional)');

    return pipe(
      // Step 1: Fetch comprehensive agents
      TE.tryCatch(
        () => this.connection.collection('dina_agents_comprehensive').find({}).toArray(),
        toDbError,
      ),
      // Step 2: Transform each agent (pure function)
      TE.map(agents => pipe(
        agents,
        A.map(transformAgent),
      )),
      // Step 3: Log result
      TE.map(tap(agents =>
        console.log(`✅ [DinaServiceFunctional] Retrieved ${agents.length} comprehensive DINA agents`)
      )),
      // Execute
      task => task(),
      promise => promise.then(either => {
        if (either._tag === 'Left') throw either.left;
        return either.right;
      }),
    );
  }

  /**
   * 🎯 Get comprehensive DINA agents (FUNCTIONAL VERSION)
   */
  async getComprehensiveAgents(): Promise<readonly DinaAgent[]> {
    console.log('🎯 [DinaServiceFunctional] Fetching comprehensive DINA agents (functional)');

    return pipe(
      TE.tryCatch(
        () => this.connection.collection('dina_agents_comprehensive').find({}).toArray(),
        toDbError,
      ),
      TE.map(toReadonlyAgents),
      TE.map(tap(agents =>
        console.log(`✅ [DinaServiceFunctional] Retrieved ${agents.length} comprehensive DINA agents`)
      )),
      task => task(),
      promise => promise.then(either => {
        if (either._tag === 'Left') throw either.left;
        return either.right;
      }),
    );
  }

  /**
   * ⚠️ Get wanted agents (FUNCTIONAL VERSION)
   * Pure filter pipeline
   */
  async getWantedAgents(): Promise<readonly DinaAgent[]> {
    console.log('⚠️ [DinaServiceFunctional] Fetching wanted agents (functional)');

    const filter = { status: { $regex: 'AT LARGE', $options: 'i' } };

    return pipe(
      TE.tryCatch(
        () => this.connection.collection('dina_agents_comprehensive').find(filter).toArray(),
        toDbError,
      ),
      TE.map(toReadonlyAgents),
      TE.map(tap(agents =>
        console.log(`✅ [DinaServiceFunctional] Retrieved ${agents.length} wanted agents`)
      )),
      task => task(),
      promise => promise.then(either => {
        if (either._tag === 'Left') throw either.left;
        return either.right;
      }),
    );
  }

  /**
   * 📊 Get research summary (FUNCTIONAL VERSION)
   */
  async getResearchSummary(): Promise<any> {
    console.log('📊 [DinaServiceFunctional] Fetching research summary (functional)');

    return pipe(
      TE.tryCatch(
        () => this.connection.collection('dina_research_summary').findOne({}),
        toDbError,
      ),
      TE.map(O.fromNullable),
      TE.map(tap(option =>
        console.log(option._tag === 'Some' ? '✅ [DinaServiceFunctional] Retrieved research summary' : '⚠️ [DinaServiceFunctional] No research summary found')
      )),
      TE.map(option => option._tag === 'Some' ? option.value : null),
      task => task(),
      promise => promise.then(either => {
        if (either._tag === 'Left') throw either.left;
        return either.right;
      }),
    );
  }

  /**
   * 📋 Get all 1,097 DINA agents with pagination (FUNCTIONAL VERSION)
   * Pure function pipeline with filter + pagination
   */
  async getAllAgentsPaginated(
    page: number,
    limit: number,
    filter?: string,
  ): Promise<PaginatedResult<DinaAgent>> {
    console.log(`📋 [DinaServiceFunctional] Fetching paginated agents (functional) - Page ${page}, Limit ${limit}, Filter ${filter || 'none'}`);

    const mongoFilter = pipe(
      buildDinaStatusFilter(filter),
      O.getOrElse(() => ({} as const)),
    );

    return pipe(
      // Step 1: Fetch with filter
      TE.tryCatch(
        () => this.connection.collection('dina_all_agents').find(mongoFilter).toArray(),
        toDbError,
      ),
      // Step 2: Convert to immutable
      TE.map(toReadonlyAgents),
      // Step 3: Apply filter (if needed)
      TE.map(filter ? filterByStatus(filter) : (agents: readonly DinaAgent[]) => agents),
      // Step 4: Apply pagination (pure function)
      TE.map(paginate<DinaAgent>({ page, limit })),
      // Step 5: Log result
      TE.map(tap(result =>
        console.log(`✅ [DinaServiceFunctional] Retrieved ${result.data.length} agents for page ${page} (total: ${result.totalItems})`)
      )),
      // Execute
      task => task(),
      promise => promise.then(either => {
        if (either._tag === 'Left') throw either.left;
        return either.right;
      }),
    );
  }
}
