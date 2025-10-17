// 🐾🍯 NEKO DEFENSE - Honeypot Triggers Service (FUNCTIONAL) 🍯🐾
// Fully functional programming style with immutability, nyaa~!

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HoneypotTrigger, HoneypotTriggerDocument } from '../database/schemas/honeypot-trigger.schema';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { toDbError } from '../common/fp-utils';
import { HoneypotStatsType, HoneypotSummaryType } from './dto/honeypot-trigger.type';

@Injectable()
export class HoneypotTriggersServiceFunctional {
  constructor(
    @InjectModel(HoneypotTrigger.name)
    private honeypotTriggerModel: Model<HoneypotTriggerDocument>,
  ) {
    console.log('🍯 [HoneypotTriggersServiceFunctional] Initialized with PURE FUNCTIONS, nyaa~!');
  }

  /**
   * 🍯 Get all honeypot triggers with optional filtering
   */
  async getHoneypotTriggers(trapName?: string, limit: number = 100): Promise<readonly HoneypotTrigger[]> {
    console.log(`🍯 [HoneypotTriggersServiceFunctional] Fetching triggers, trap: ${trapName || 'all'}`);

    const filter = trapName ? { trap_name: trapName } : {};

    return pipe(
      TE.tryCatch(
        () => this.honeypotTriggerModel
          .find(filter)
          .sort({ triggered_at: -1 })
          .limit(limit)
          .exec(),
        toDbError,
      ),
      TE.map(triggers => triggers as readonly HoneypotTrigger[]),
      TE.map(triggers => {
        console.log(`✅ [HoneypotTriggersServiceFunctional] Retrieved ${triggers.length} triggers`);
        return triggers;
      }),
      task => task(),
      promise => promise.then(either => {
        if (either._tag === 'Left') throw either.left;
        return either.right;
      }),
    );
  }

  /**
   * 📊 Get honeypot statistics summary
   */
  async getHoneypotSummary(): Promise<HoneypotSummaryType> {
    console.log('📊 [HoneypotTriggersServiceFunctional] Calculating honeypot summary');

    return pipe(
      TE.tryCatch(
        () => this.honeypotTriggerModel.find().exec(),
        toDbError,
      ),
      TE.map(triggers => {
        // Calculate total triggers
        const total_triggers = triggers.length;

        // Group by trap name
        const trapGroups = triggers.reduce((acc, trigger) => {
          const trapName = trigger.trap_name;
          if (!acc[trapName]) {
            acc[trapName] = [];
          }
          acc[trapName].push(trigger);
          return acc;
        }, {} as Record<string, HoneypotTrigger[]>);

        // Calculate stats per trap
        const trap_stats: HoneypotStatsType[] = Object.entries(trapGroups).map(([trapName, trapTriggers]) => {
          const unique_ips = [...new Set(trapTriggers.map(t => t.ip_address))];
          const last_triggered = trapTriggers.reduce((latest, t) => {
            const triggerDate = new Date(t.triggered_at);
            return triggerDate > latest ? triggerDate : latest;
          }, new Date(0));

          return {
            trap_name: trapName,
            trigger_count: trapTriggers.length,
            last_triggered,
            unique_ips,
          };
        });

        // Sort by trigger count descending
        trap_stats.sort((a, b) => b.trigger_count - a.trigger_count);

        // Calculate unique counts
        const unique_traps = trap_stats.length;
        const unique_ips = [...new Set(triggers.map(t => t.ip_address))].length;
        const most_active_trap = trap_stats[0] || null;

        return {
          total_triggers,
          unique_traps,
          unique_ips,
          most_active_trap,
          trap_stats,
        };
      }),
      TE.map(summary => {
        console.log(`✅ [HoneypotTriggersServiceFunctional] Summary calculated: ${summary.total_triggers} total triggers`);
        return summary;
      }),
      task => task(),
      promise => promise.then(either => {
        if (either._tag === 'Left') throw either.left;
        return either.right;
      }),
    );
  }

  /**
   * 🔍 Get triggers by IP address
   */
  async getTriggersByIp(ipAddress: string): Promise<readonly HoneypotTrigger[]> {
    console.log(`🔍 [HoneypotTriggersServiceFunctional] Fetching triggers for IP: ${ipAddress}`);

    return pipe(
      TE.tryCatch(
        () => this.honeypotTriggerModel
          .find({ ip_address: ipAddress })
          .sort({ triggered_at: -1 })
          .exec(),
        toDbError,
      ),
      TE.map(triggers => triggers as readonly HoneypotTrigger[]),
      TE.map(triggers => {
        console.log(`✅ [HoneypotTriggersServiceFunctional] Found ${triggers.length} triggers for IP ${ipAddress}`);
        return triggers;
      }),
      task => task(),
      promise => promise.then(either => {
        if (either._tag === 'Left') throw either.left;
        return either.right;
      }),
    );
  }

  /**
   * 🚨 Get recent high-threat triggers
   */
  async getRecentHighThreatTriggers(limit: number = 20): Promise<readonly HoneypotTrigger[]> {
    console.log(`🚨 [HoneypotTriggersServiceFunctional] Fetching recent high-threat triggers`);

    return pipe(
      TE.tryCatch(
        () => this.honeypotTriggerModel
          .find({ threat_level: { $in: ['HIGH', 'CRITICAL'] } })
          .sort({ triggered_at: -1 })
          .limit(limit)
          .exec(),
        toDbError,
      ),
      TE.map(triggers => triggers as readonly HoneypotTrigger[]),
      TE.map(triggers => {
        console.log(`✅ [HoneypotTriggersServiceFunctional] Found ${triggers.length} high-threat triggers`);
        return triggers;
      }),
      task => task(),
      promise => promise.then(either => {
        if (either._tag === 'Left') throw either.left;
        return either.right;
      }),
    );
  }
}
