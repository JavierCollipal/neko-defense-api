// 🐾🎯 NEKO DEFENSE - Threat Actors Service (FUNCTIONAL REFACTOR) 🎯🐾
// Fully functional programming style with immutability, nyaa~!

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ThreatActor, ThreatActorDocument } from '../database/schemas/threat-actor.schema';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import { toDbError, log, tap } from '../common/fp-utils';
import { buildThreatActorFilter, buildThreatActorSort } from '../common/fp-utils/filter-builders';
import {
  calculateThreatCounts,
  findActorById,
  sortByPriority,
  filterByCategory,
  toReadonlyActors,
  ThreatCounts,
} from './domain/threat-actor.domain';

@Injectable()
export class ThreatActorsServiceFunctional {
  constructor(
    @InjectModel(ThreatActor.name)
    private threatActorModel: Model<ThreatActorDocument>,
  ) {
    console.log('🎯 [ThreatActorsServiceFunctional] Initialized with PURE FUNCTIONS, nyaa~!');
  }

  /**
   * 📊 Get threat counts by category (FUNCTIONAL VERSION)
   * Pure function pipeline with TaskEither error handling
   */
  async getThreatCounts(): Promise<ThreatCounts> {
    console.log('📊 [ThreatActorsServiceFunctional] Calculating threat counts (functional style)');

    return pipe(
      // Step 1: Fetch all actors (wrapped in TaskEither for error handling)
      TE.tryCatch(
        () => this.threatActorModel.find().exec(),
        toDbError,
      ),
      // Step 2: Convert to immutable readonly array
      TE.map(toReadonlyActors),
      // Step 3: Calculate counts using pure function
      TE.map(calculateThreatCounts),
      // Step 4: Log result (side effect contained)
      TE.map(tap(counts =>
        console.log('✅ [ThreatActorsServiceFunctional] Threat counts calculated:', counts)
      )),
      // Step 5: Execute and unwrap (throw on error)
      task => task(),
      promise => promise.then(either => {
        if (either._tag === 'Left') throw either.left;
        return either.right;
      }),
    );
  }

  /**
   * 🎯 Get threat actors by category (FUNCTIONAL VERSION)
   * Pure function pipeline with immutable operations
   */
  async getThreatActorsByCategory(category: string = 'all'): Promise<readonly ThreatActor[]> {
    console.log(`🎯 [ThreatActorsServiceFunctional] Fetching threat actors (functional), category: ${category}`);

    // Build filter using pure function
    const filterOption = buildThreatActorFilter(category);
    const filter = pipe(
      filterOption,
      O.getOrElse(() => ({} as const)),
    );

    const sortCriteria = buildThreatActorSort();

    return pipe(
      // Step 1: Fetch actors with filter
      TE.tryCatch(
        () => this.threatActorModel.find(filter).sort(sortCriteria).exec(),
        toDbError,
      ),
      // Step 2: Convert to immutable
      TE.map(toReadonlyActors),
      // Step 3: Log result
      TE.map(tap(actors =>
        console.log(`✅ [ThreatActorsServiceFunctional] Retrieved ${actors.length} threat actors`)
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
   * 🔍 Get single threat actor by ID (FUNCTIONAL VERSION)
   * Uses Option type for null safety
   */
  async getThreatActorById(actorId: string): Promise<ThreatActor | null> {
    console.log(`🔍 [ThreatActorsServiceFunctional] Fetching threat actor (functional): ${actorId}`);

    return pipe(
      // Step 1: Fetch single actor
      TE.tryCatch(
        () => this.threatActorModel.findOne({ actor_id: actorId }).exec(),
        toDbError,
      ),
      // Step 2: Convert to Option (null-safe)
      TE.map(actor => O.fromNullable(actor)),
      // Step 3: Log result
      TE.map(tap(option => {
        if (option._tag === 'None') {
          console.log(`⚠️ [ThreatActorsServiceFunctional] Threat actor not found: ${actorId}`);
        } else {
          console.log(`✅ [ThreatActorsServiceFunctional] Found threat actor: ${option.value.name}`);
        }
      })),
      // Step 4: Convert Option back to nullable
      TE.map(option => option._tag === 'Some' ? option.value : null),
      // Execute
      task => task(),
      promise => promise.then(either => {
        if (either._tag === 'Left') throw either.left;
        return either.right;
      }),
    );
  }
}
