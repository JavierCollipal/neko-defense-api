// 🐾📚 NEKO DEFENSE - Case Patterns Service (FUNCTIONAL) 📚🐾
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CasePattern, CasePatternDocument } from '../database/schemas/case-pattern.schema';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { toDbError } from '../common/fp-utils';
import { CasePatternStatsType } from './dto/case-pattern.type';

@Injectable()
export class CasePatternsServiceFunctional {
  constructor(
    @InjectModel(CasePattern.name)
    private casePatternModel: Model<CasePatternDocument>,
  ) {
    console.log('📚 [CasePatternsServiceFunctional] Initialized, nyaa~!');
  }

  /**
   * 📚 Get all case patterns
   */
  async getCasePatterns(reusability?: string, limit: number = 100): Promise<readonly CasePattern[]> {
    console.log(`📚 [CasePatternsServiceFunctional] Fetching patterns, reusability: ${reusability || 'all'}`);

    const filter = reusability ? { reusability } : {};

    return pipe(
      TE.tryCatch(
        () => this.casePatternModel
          .find(filter)
          .sort({ usage_count: -1, last_used: -1 })
          .limit(limit)
          .exec(),
        toDbError,
      ),
      TE.map(patterns => patterns as readonly CasePattern[]),
      TE.map(patterns => {
        console.log(`✅ [CasePatternsServiceFunctional] Retrieved ${patterns.length} patterns`);
        return patterns;
      }),
      task => task(),
      promise => promise.then(either => {
        if (either._tag === 'Left') throw either.left;
        return either.right;
      }),
    );
  }

  /**
   * 📊 Get case pattern statistics
   */
  async getCasePatternStats(): Promise<CasePatternStatsType> {
    console.log('📊 [CasePatternsServiceFunctional] Calculating stats');

    return pipe(
      TE.tryCatch(
        () => this.casePatternModel.find().exec(),
        toDbError,
      ),
      TE.map(patterns => {
        const total_patterns = patterns.length;
        const high_reusability = patterns.filter(p => p.reusability === 'high').length;

        // Top categories
        const categoryCounts = patterns.reduce((acc, p) => {
          if (p.category) {
            acc[p.category] = (acc[p.category] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);
        const top_categories = Object.entries(categoryCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([cat]) => cat);

        // Most used patterns (top 10) - convert to plain objects
        const most_used = patterns
          .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
          .slice(0, 10)
          .map(p => p.toObject ? p.toObject() : p) as any[];

        return {
          total_patterns,
          high_reusability,
          top_categories,
          most_used,
        };
      }),
      TE.map(stats => {
        console.log(`✅ [CasePatternsServiceFunctional] Stats calculated: ${stats.total_patterns} patterns`);
        return stats;
      }),
      task => task(),
      promise => promise.then(either => {
        if (either._tag === 'Left') throw either.left;
        return either.right;
      }),
    );
  }

  /**
   * 🔍 Get pattern by ID
   */
  async getCasePatternById(patternId: string): Promise<CasePattern | null> {
    console.log(`🔍 [CasePatternsServiceFunctional] Fetching pattern: ${patternId}`);

    return pipe(
      TE.tryCatch(
        () => this.casePatternModel.findOne({ pattern_id: patternId }).exec(),
        toDbError,
      ),
      TE.map(pattern => {
        if (pattern) {
          console.log(`✅ [CasePatternsServiceFunctional] Found pattern: ${pattern.title}`);
        } else {
          console.log(`⚠️ [CasePatternsServiceFunctional] Pattern not found: ${patternId}`);
        }
        return pattern;
      }),
      task => task(),
      promise => promise.then(either => {
        if (either._tag === 'Left') throw either.left;
        return either.right;
      }),
    );
  }
}
