// 🐾🎯 NEKO DEFENSE - Threat Actors Service 🎯🐾
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ThreatActor, ThreatActorDocument } from '../database/schemas/threat-actor.schema';

@Injectable()
export class ThreatActorsService {
  constructor(
    @InjectModel(ThreatActor.name)
    private threatActorModel: Model<ThreatActorDocument>,
  ) {
    console.log('🎯 [ThreatActorsService] Initialized, nyaa~!');
  }

  /**
   * 📊 Get threat counts by category
   */
  async getThreatCounts() {
    console.log('📊 [ThreatActorsService] Calculating threat counts, nyaa~');

    const allActors = await this.threatActorModel.find().exec();

    const counts = {
      all: allActors.length,
      predators: 0,
      pedophiles: 0,
      dina_network: 0,
      ransomware: 0,
      state_sponsored: 0,
      crypto_crime: 0,
    };

    allActors.forEach((actor) => {
      // Predators
      if (
        actor.type === 'predator' ||
        actor.actor_classification === 'INDIVIDUAL_PREDATOR' ||
        actor.category === 'predator'
      ) {
        counts.predators++;
      }

      // Pedophiles
      if (
        actor.type === 'pedophile' ||
        actor.actor_classification === 'PEDOPHILE' ||
        actor.category === 'pedophile' ||
        actor.target_type === 'children' ||
        (actor.description && /pedophil|child abuse|csam/i.test(actor.description))
      ) {
        counts.pedophiles++;
      }

      // DINA Network
      if (
        actor.network === 'DINA' ||
        actor.actor_classification === 'DINA_NETWORK' ||
        actor.category === 'dina_network'
      ) {
        counts.dina_network++;
      }

      // Ransomware
      if (
        actor.type === 'cybercrime_group' ||
        actor.actor_classification === 'CYBERCRIME_RANSOMWARE' ||
        actor.category === 'ransomware'
      ) {
        counts.ransomware++;
      }

      // State Sponsored
      if (
        actor.state_actor === true ||
        actor.state_sponsored === true ||
        (actor.actor_classification && /STATE_SPONSORED/i.test(actor.actor_classification))
      ) {
        counts.state_sponsored++;
      }

      // Crypto Crime
      if (
        actor.category === 'crypto_crime' ||
        actor.actor_classification === 'CRYPTO_CRIME' ||
        actor.type === 'crypto_thief'
      ) {
        counts.crypto_crime++;
      }
    });

    console.log('✅ [ThreatActorsService] Threat counts calculated:', counts);
    return counts;
  }

  /**
   * 🎯 Get threat actors by category with filtering
   */
  async getThreatActorsByCategory(category: string = 'all'): Promise<ThreatActor[]> {
    console.log(`🎯 [ThreatActorsService] Fetching threat actors, category: ${category}`);

    let filter: any = {};

    if (category !== 'all') {
      switch (category) {
        case 'predators':
          filter = {
            $or: [
              { type: 'predator' },
              { actor_classification: 'INDIVIDUAL_PREDATOR' },
              { category: 'predator' },
            ],
          };
          break;

        case 'pedophiles':
          filter = {
            $or: [
              { type: 'pedophile' },
              { actor_classification: 'PEDOPHILE' },
              { category: 'pedophile' },
              { target_type: 'children' },
              { description: { $regex: /pedophil|child abuse|csam/i } },
            ],
          };
          break;

        case 'dina_network':
          filter = {
            $or: [
              { network: 'DINA' },
              { actor_classification: 'DINA_NETWORK' },
              { category: 'dina_network' },
            ],
          };
          break;

        case 'ransomware':
          filter = {
            $or: [
              { type: 'cybercrime_group' },
              { actor_classification: 'CYBERCRIME_RANSOMWARE' },
              { category: 'ransomware' },
            ],
          };
          break;

        case 'state_sponsored':
          filter = {
            $or: [
              { state_actor: true },
              { state_sponsored: true },
              { actor_classification: { $regex: /STATE_SPONSORED/i } },
            ],
          };
          break;

        case 'crypto_crime':
          filter = {
            $or: [
              { category: 'crypto_crime' },
              { actor_classification: 'CRYPTO_CRIME' },
              { type: 'crypto_thief' },
            ],
          };
          break;
      }
    }

    const threatActors = await this.threatActorModel
      .find(filter)
      .sort({ threat_level: -1, rank: 1 })
      .exec();

    console.log(`✅ [ThreatActorsService] Retrieved ${threatActors.length} threat actors`);
    return threatActors;
  }

  /**
   * 🔍 Get single threat actor by ID
   */
  async getThreatActorById(actorId: string): Promise<ThreatActor> {
    console.log(`🔍 [ThreatActorsService] Fetching threat actor: ${actorId}`);

    const actor = await this.threatActorModel.findOne({ actor_id: actorId }).exec();

    if (!actor) {
      console.log(`⚠️ [ThreatActorsService] Threat actor not found: ${actorId}`);
      return null;
    }

    console.log(`✅ [ThreatActorsService] Found threat actor: ${actor.name}`);
    return actor;
  }
}
