// 🐾⚡ VALECH SERVICE - Business Logic ⚡🐾
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ValechVictim, ValechVictimDocument } from './schemas/valech-victim.schema';

@Injectable()
export class ValechService {
  private readonly logger = new Logger(ValechService.name);

  constructor(
    @InjectModel(ValechVictim.name)
    private valechVictimModel: Model<ValechVictimDocument>,
  ) {
    this.logger.log('🐾 ValechService initialized, nyaa~! ⚡');
  }

  // 📊 Get all victims with pagination
  async findAll(skip = 0, limit = 50): Promise<ValechVictim[]> {
    this.logger.log(`Fetching victims with skip=${skip}, limit=${limit}`);
    return this.valechVictimModel.find().skip(skip).limit(limit).exec();
  }

  // 🔍 Get victim by ID
  async findById(id: string): Promise<ValechVictim> {
    this.logger.log(`Fetching victim by ID: ${id}`);
    return this.valechVictimModel.findById(id).exec();
  }

  // 🔍 Search victims by name
  async searchByName(name: string): Promise<ValechVictim[]> {
    this.logger.log(`Searching victims by name: ${name}`);
    return this.valechVictimModel
      .find({ fullName: { $regex: name, $options: 'i' } })
      .exec();
  }

  // 🏢 Get victims by detention center
  async findByDetentionCenter(centerName: string): Promise<ValechVictim[]> {
    this.logger.log(`Finding victims by detention center: ${centerName}`);
    return this.valechVictimModel
      .find({ 'detentionCenters.name': { $regex: centerName, $options: 'i' } })
      .exec();
  }

  // 👤 Get victims by perpetrator
  async findByPerpetrator(perpetratorName: string): Promise<ValechVictim[]> {
    this.logger.log(`Finding victims by perpetrator: ${perpetratorName}`);
    return this.valechVictimModel
      .find({ linkedPerpetrators: { $regex: perpetratorName, $options: 'i' } })
      .exec();
  }

  // 📈 Get outcome statistics
  async getOutcomeStats(): Promise<any> {
    this.logger.log('Calculating outcome statistics');
    const stats = await this.valechVictimModel.aggregate([
      {
        $group: {
          _id: '$outcome',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    return stats.reduce((acc, stat) => {
      acc[stat._id || 'UNKNOWN'] = stat.count;
      return acc;
    }, {});
  }

  // 📊 Get comprehensive statistics
  async getStats(): Promise<any> {
    this.logger.log('Calculating comprehensive statistics');

    const [
      total,
      survived,
      executed,
      disappeared,
      assassinated,
      male,
      female,
      withTestimony,
      withLinkedPerpetrators,
      outcomeStats,
    ] = await Promise.all([
      this.valechVictimModel.countDocuments(),
      this.valechVictimModel.countDocuments({ outcome: 'SURVIVED' }),
      this.valechVictimModel.countDocuments({ outcome: 'EXECUTED' }),
      this.valechVictimModel.countDocuments({ outcome: { $regex: 'DISAPPEARED' } }),
      this.valechVictimModel.countDocuments({ outcome: 'ASSASSINATED' }),
      this.valechVictimModel.countDocuments({ gender: 'Male' }),
      this.valechVictimModel.countDocuments({ gender: 'Female' }),
      this.valechVictimModel.countDocuments({ testimonyText: { $exists: true, $ne: '' } }),
      this.valechVictimModel.countDocuments({ linkedPerpetrators: { $exists: true, $ne: [] } }),
      this.getOutcomeStats(),
    ]);

    return {
      total,
      survived,
      executed,
      disappeared,
      assassinated,
      male,
      female,
      withTestimony,
      withLinkedPerpetrators,
      outcomeBreakdown: outcomeStats,
    };
  }

  // 🏛️ Get all unique detention centers
  async getDetentionCenters(): Promise<string[]> {
    this.logger.log('Fetching all unique detention centers');
    const centers = await this.valechVictimModel.distinct('detentionCenters.name');
    return centers.filter(Boolean); // Remove nulls/undefined
  }

  // 👥 Get all unique perpetrators
  async getPerpetrators(): Promise<string[]> {
    this.logger.log('Fetching all unique perpetrators');
    const perpetrators = await this.valechVictimModel.distinct('linkedPerpetrators');
    return perpetrators.filter(Boolean); // Remove nulls/undefined
  }

  // 🔍 Advanced search with filters
  async advancedSearch(filters: {
    name?: string;
    gender?: string;
    outcome?: string;
    detentionCenter?: string;
    perpetrator?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ValechVictim[]> {
    this.logger.log(`Advanced search with filters: ${JSON.stringify(filters)}`);

    const query: any = {};

    if (filters.name) {
      query.fullName = { $regex: filters.name, $options: 'i' };
    }

    if (filters.gender) {
      query.gender = filters.gender;
    }

    if (filters.outcome) {
      query.outcome = { $regex: filters.outcome, $options: 'i' };
    }

    if (filters.detentionCenter) {
      query['detentionCenters.name'] = { $regex: filters.detentionCenter, $options: 'i' };
    }

    if (filters.perpetrator) {
      query.linkedPerpetrators = { $regex: filters.perpetrator, $options: 'i' };
    }

    if (filters.startDate || filters.endDate) {
      query['detentionInfo.arrested'] = {};
      if (filters.startDate) {
        query['detentionInfo.arrested'].$gte = filters.startDate;
      }
      if (filters.endDate) {
        query['detentionInfo.arrested'].$lte = filters.endDate;
      }
    }

    return this.valechVictimModel.find(query).exec();
  }
}
