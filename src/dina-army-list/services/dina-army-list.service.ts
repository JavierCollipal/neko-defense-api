/**
 * DINA Army List Service
 *
 * Business logic for 1097 DINA agents
 *
 * Generated with Claude Code (Neko-Arc + Mario + Noel + Glam + Hannibal + Tetora)
 */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IDINAArmyListAgent } from '../schemas/dina-army-list.schema';

/**
 * Pagination result interface
 */
export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Filter options interface
 */
export interface DINAAgentFilter {
  category?: string;
  region?: string;
  brigade?: string;
  legal_status?: string;
  rank?: string;
  verification_status?: string;
  search?: string;
}

@Injectable()
export class DINAArmyListService {
  constructor(
    @InjectModel('DINAArmyListAgent')
    private readonly dinaAgentModel: Model<IDINAArmyListAgent>
  ) {}

  /**
   * Get paginated DINA agents
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'full_name_asc',
    filter?: DINAAgentFilter
  ): Promise<PaginationResult<IDINAArmyListAgent>> {
    const skip = (page - 1) * limit;

    // Build filter query
    const query = this.buildFilterQuery(filter);

    // Build sort options
    const sort = this.getSortOptions(sortBy);

    // Execute queries in parallel
    const [items, total] = await Promise.all([
      this.dinaAgentModel.find(query).sort(sort).skip(skip).limit(limit).lean(),
      this.dinaAgentModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: items as any, // Type assertion for Mongoose lean() return
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Find agent by ID
   */
  async findOne(agent_id: string): Promise<IDINAArmyListAgent | null> {
    return this.dinaAgentModel.findOne({ agent_id }).lean() as any;
  }

  /**
   * Search agents by name
   */
  async search(query: string, limit: number = 10): Promise<IDINAArmyListAgent[]> {
    return this.dinaAgentModel
      .find({ $text: { $search: query } })
      .limit(limit)
      .lean() as any;
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    const [
      total_agents,
      by_category,
      by_legal_status,
      by_region,
      by_brigade,
      verified_count,
      pending_count,
    ] = await Promise.all([
      // Total count
      this.dinaAgentModel.countDocuments(),

      // By category
      this.dinaAgentModel.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $project: { category: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ]),

      // By legal status
      this.dinaAgentModel.aggregate([
        { $group: { _id: '$legal_status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ]),

      // By region
      this.dinaAgentModel.aggregate([
        { $match: { region: { $exists: true, $ne: null } } },
        { $group: { _id: '$region', count: { $sum: 1 } } },
        { $project: { region: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ]),

      // By brigade
      this.dinaAgentModel.aggregate([
        { $match: { brigade: { $exists: true, $ne: null } } },
        { $group: { _id: '$brigade', count: { $sum: 1 } } },
        { $project: { brigade: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ]),

      // Verified count
      this.dinaAgentModel.countDocuments({ verification_status: 'verified' }),

      // Pending count
      this.dinaAgentModel.countDocuments({ verification_status: 'pending' }),
    ]);

    return {
      total_agents,
      by_category,
      by_legal_status,
      by_region,
      by_brigade,
      verified_count,
      pending_count,
    };
  }

  /**
   * Create new agent (admin only)
   */
  async create(createAgentDto: any, userId: string): Promise<IDINAArmyListAgent> {
    const newAgent = new this.dinaAgentModel({
      ...createAgentDto,
      created_by: userId,
    });

    return newAgent.save();
  }

  /**
   * Update agent (admin only)
   */
  async update(
    agent_id: string,
    updateAgentDto: any
  ): Promise<IDINAArmyListAgent | null> {
    return this.dinaAgentModel
      .findOneAndUpdate({ agent_id }, { $set: updateAgentDto }, { new: true })
      .lean() as any;
  }

  /**
   * Delete agent (admin only)
   */
  async delete(agent_id: string): Promise<boolean> {
    const result = await this.dinaAgentModel.findOneAndDelete({ agent_id });
    return !!result;
  }

  /**
   * Build filter query
   */
  private buildFilterQuery(filter?: DINAAgentFilter): any {
    if (!filter) return {};

    const query: any = {};

    if (filter.category) {
      query.category = filter.category;
    }

    if (filter.region) {
      query.region = filter.region;
    }

    if (filter.brigade) {
      query.brigade = filter.brigade;
    }

    if (filter.legal_status) {
      query.legal_status = filter.legal_status;
    }

    if (filter.rank) {
      query.rank = filter.rank;
    }

    if (filter.verification_status) {
      query.verification_status = filter.verification_status;
    }

    if (filter.search) {
      query.$text = { $search: filter.search };
    }

    return query;
  }

  /**
   * Get sort options
   */
  private getSortOptions(sortBy: string): any {
    const sortMap: Record<string, any> = {
      full_name_asc: { full_name: 1 },
      full_name_desc: { full_name: -1 },
      rank_asc: { rank: 1 },
      rank_desc: { rank: -1 },
      category_asc: { category: 1 },
      category_desc: { category: -1 },
      legal_status_asc: { legal_status: 1 },
      legal_status_desc: { legal_status: -1 },
      created_at_asc: { created_at: 1 },
      created_at_desc: { created_at: -1 },
    };

    return sortMap[sortBy] || { full_name: 1 };
  }
}
