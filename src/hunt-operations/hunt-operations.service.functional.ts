// 🐾🎯 NEKO DEFENSE - Hunt Operations Service (FUNCTIONAL) 🎯🐾
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HuntConversation, HuntConversationDocument } from '../database/schemas/hunt-conversation.schema';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { toDbError } from '../common/fp-utils';
import { HuntStatsType } from './dto/hunt-conversation.type';

@Injectable()
export class HuntOperationsServiceFunctional {
  constructor(
    @InjectModel(HuntConversation.name)
    private huntConversationModel: Model<HuntConversationDocument>,
  ) {
    console.log('🎯 [HuntOperationsServiceFunctional] Initialized, nyaa~!');
  }

  /**
   * 🎯 Get all hunt conversations
   */
  async getHuntConversations(status?: string, limit: number = 50): Promise<readonly HuntConversation[]> {
    console.log(`🎯 [HuntOperationsServiceFunctional] Fetching hunts, status: ${status || 'all'}`);

    const filter = status ? { status } : {};

    return pipe(
      TE.tryCatch(
        () => this.huntConversationModel
          .find(filter)
          .sort({ started_at: -1 })
          .limit(limit)
          .exec(),
        toDbError,
      ),
      TE.map(hunts => hunts as readonly HuntConversation[]),
      TE.map(hunts => {
        console.log(`✅ [HuntOperationsServiceFunctional] Retrieved ${hunts.length} hunts`);
        return hunts;
      }),
      task => task(),
      promise => promise.then(either => {
        if (either._tag === 'Left') throw either.left;
        return either.right;
      }),
    );
  }

  /**
   * 📊 Get hunt statistics
   */
  async getHuntStats(): Promise<HuntStatsType> {
    console.log('📊 [HuntOperationsServiceFunctional] Calculating hunt stats');

    return pipe(
      TE.tryCatch(
        () => this.huntConversationModel.find().exec(),
        toDbError,
      ),
      TE.map(hunts => {
        const total_hunts = hunts.length;
        const active_hunts = hunts.filter(h => h.status === 'active').length;
        const completed_hunts = hunts.filter(h => h.status === 'completed').length;
        const successful_captures = hunts.filter(h => h.outcome === 'captured').length;

        // Extract recent targets (last 10 unique)
        const targets = hunts
          .filter(h => h.target_actor)
          .map(h => h.target_actor)
          .slice(0, 10);
        const recent_targets = [...new Set(targets)];

        // Extract top keywords (flatten and count)
        const allKeywords = hunts.flatMap(h => h.keywords || []);
        const keywordCounts = allKeywords.reduce((acc, kw) => {
          acc[kw] = (acc[kw] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const top_keywords = Object.entries(keywordCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([kw]) => kw);

        return {
          total_hunts,
          active_hunts,
          completed_hunts,
          successful_captures,
          recent_targets,
          top_keywords,
        };
      }),
      TE.map(stats => {
        console.log(`✅ [HuntOperationsServiceFunctional] Stats calculated: ${stats.total_hunts} total hunts`);
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
   * 🔍 Get hunt by session ID
   */
  async getHuntBySessionId(sessionId: string): Promise<HuntConversation | null> {
    console.log(`🔍 [HuntOperationsServiceFunctional] Fetching hunt: ${sessionId}`);

    return pipe(
      TE.tryCatch(
        () => this.huntConversationModel.findOne({ session_id: sessionId }).exec(),
        toDbError,
      ),
      TE.map(hunt => {
        if (hunt) {
          console.log(`✅ [HuntOperationsServiceFunctional] Found hunt: ${hunt.session_id}`);
        } else {
          console.log(`⚠️ [HuntOperationsServiceFunctional] Hunt not found: ${sessionId}`);
        }
        return hunt;
      }),
      task => task(),
      promise => promise.then(either => {
        if (either._tag === 'Left') throw either.left;
        return either.right;
      }),
    );
  }
}
