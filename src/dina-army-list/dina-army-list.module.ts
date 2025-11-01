/**
 * DINA Army List Module
 *
 * NestJS module for 1097 DINA agents GraphQL API
 *
 * Generated with Claude Code (Neko-Arc + Mario + Noel + Glam + Hannibal + Tetora)
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DINAArmyListAgentSchema } from './schemas/dina-army-list.schema';
import { DINAArmyListService } from './services/dina-army-list.service';
import { DINAArmyListResolver } from './resolvers/dina-army-list.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'DINAArmyListAgent',
        schema: DINAArmyListAgentSchema,
        collection: 'dina_army_list_agents',
      },
    ]),
  ],
  providers: [DINAArmyListService, DINAArmyListResolver],
  exports: [DINAArmyListService],
})
export class DINAArmyListModule {}
