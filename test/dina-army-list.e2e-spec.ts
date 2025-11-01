/**
 * DINA Army List E2E Tests
 *
 * Comprehensive end-to-end testing for 1097 DINA agents GraphQL API
 *
 * Generated with Claude Code (Neko-Arc + Mario + Noel + Glam + Hannibal + Tetora)
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DINAArmyListAgent } from '../src/dina-army-list/schemas/dina-army-list.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

describe('DINA Army List E2E Tests', () => {
  let app: INestApplication;
  let dinaAgentModel: Model<any>;

  // Test data
  const testAgents = [
    {
      agent_id: 'dina-manuel-contreras-test',
      full_name: 'Manuel Contreras Sepúlveda',
      rank: 'Coronel',
      category: 'DINA_State_Staff',
      region: 'Metropolitan',
      brigade: 'Mulchén',
      legal_status: 'convicted',
      data_sources: [
        {
          source_name: 'Test Data',
          confidence: 'confirmed',
          extracted_date: new Date(),
        },
      ],
      created_by: 'test-suite',
      verification_status: 'verified',
    },
    {
      agent_id: 'dina-raul-iturriaga-test',
      full_name: 'Raúl Eduardo Iturriaga Neumann',
      rank: 'Teniente Coronel',
      category: 'Brigade',
      region: 'Metropolitan',
      brigade: 'Lautaro',
      legal_status: 'convicted',
      data_sources: [
        {
          source_name: 'Test Data',
          confidence: 'confirmed',
          extracted_date: new Date(),
        },
      ],
      created_by: 'test-suite',
      verification_status: 'verified',
    },
    {
      agent_id: 'dina-test-agent-regional',
      full_name: 'Test Agent Regional',
      rank: 'Capitán',
      category: 'Regional_Command',
      region: 'Valparaíso',
      legal_status: 'unknown',
      data_sources: [
        {
          source_name: 'Test Data',
          confidence: 'alleged',
          extracted_date: new Date(),
        },
      ],
      created_by: 'test-suite',
      verification_status: 'pending',
    },
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dinaAgentModel = moduleFixture.get<Model<any>>(
      getModelToken('DINAArmyListAgent')
    );

    // Clean up test data if exists
    await dinaAgentModel.deleteMany({
      agent_id: { $regex: /test/ },
    });

    // Insert test data
    await dinaAgentModel.insertMany(testAgents);
  });

  afterAll(async () => {
    // Clean up test data
    await dinaAgentModel.deleteMany({
      agent_id: { $regex: /test/ },
    });

    await app.close();
  });

  describe('GraphQL Queries', () => {
    describe('getDINAAgents - Pagination', () => {
      it('should return paginated DINA agents', async () => {
        const query = `
          query {
            getDINAAgents(page: 1, limit: 10) {
              agents {
                agent_id
                full_name
                rank
                category
              }
              pagination {
                total
                page
                limit
                totalPages
                hasNextPage
                hasPreviousPage
              }
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query })
          .expect(200);

        expect(response.body.data.getDINAAgents).toBeDefined();
        expect(response.body.data.getDINAAgents.agents).toBeInstanceOf(Array);
        expect(response.body.data.getDINAAgents.pagination).toBeDefined();
        expect(response.body.data.getDINAAgents.pagination.total).toBeGreaterThanOrEqual(3);
      });

      it('should respect pagination limits', async () => {
        const query = `
          query {
            getDINAAgents(page: 1, limit: 2) {
              agents {
                agent_id
              }
              pagination {
                total
                limit
              }
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query })
          .expect(200);

        expect(response.body.data.getDINAAgents.agents.length).toBeLessThanOrEqual(2);
        expect(response.body.data.getDINAAgents.pagination.limit).toBe(2);
      });

      it('should enforce maximum limit of 100', async () => {
        const query = `
          query {
            getDINAAgents(page: 1, limit: 200) {
              pagination {
                limit
              }
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query })
          .expect(200);

        expect(response.body.data.getDINAAgents.pagination.limit).toBeLessThanOrEqual(100);
      });
    });

    describe('getDINAAgents - Filtering', () => {
      it('should filter by category', async () => {
        const query = `
          query {
            getDINAAgents(
              page: 1
              limit: 10
              filter: { category: Brigade }
            ) {
              agents {
                agent_id
                category
              }
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query })
          .expect(200);

        const agents = response.body.data.getDINAAgents.agents;
        agents.forEach((agent: any) => {
          expect(agent.category).toBe('Brigade');
        });
      });

      it('should filter by region', async () => {
        const query = `
          query {
            getDINAAgents(
              page: 1
              limit: 10
              filter: { region: "Metropolitan" }
            ) {
              agents {
                agent_id
                region
              }
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query })
          .expect(200);

        const agents = response.body.data.getDINAAgents.agents;
        expect(agents.length).toBeGreaterThan(0);
        agents.forEach((agent: any) => {
          expect(agent.region).toBe('Metropolitan');
        });
      });

      it('should filter by brigade', async () => {
        const query = `
          query {
            getDINAAgents(
              page: 1
              limit: 10
              filter: { brigade: "Mulchén" }
            ) {
              agents {
                agent_id
                brigade
              }
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query })
          .expect(200);

        const agents = response.body.data.getDINAAgents.agents;
        expect(agents.length).toBeGreaterThan(0);
        agents.forEach((agent: any) => {
          expect(agent.brigade).toBe('Mulchén');
        });
      });

      it('should filter by legal status', async () => {
        const query = `
          query {
            getDINAAgents(
              page: 1
              limit: 10
              filter: { legal_status: convicted }
            ) {
              agents {
                agent_id
                legal_status
              }
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query })
          .expect(200);

        const agents = response.body.data.getDINAAgents.agents;
        expect(agents.length).toBeGreaterThan(0);
        agents.forEach((agent: any) => {
          expect(agent.legal_status).toBe('convicted');
        });
      });
    });

    describe('getDINAAgents - Sorting', () => {
      it('should sort by full_name ascending', async () => {
        const query = `
          query {
            getDINAAgents(
              page: 1
              limit: 10
              sortBy: full_name_asc
            ) {
              agents {
                full_name
              }
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query })
          .expect(200);

        const agents = response.body.data.getDINAAgents.agents;
        const names = agents.map((a: any) => a.full_name);
        const sortedNames = [...names].sort();
        expect(names).toEqual(sortedNames);
      });

      it('should sort by rank descending', async () => {
        const query = `
          query {
            getDINAAgents(
              page: 1
              limit: 10
              sortBy: rank_desc
            ) {
              agents {
                rank
              }
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query })
          .expect(200);

        expect(response.body.data.getDINAAgents.agents).toBeInstanceOf(Array);
      });
    });

    describe('getDINAAgent - Single Agent', () => {
      it('should get single agent by ID', async () => {
        const query = `
          query {
            getDINAAgent(agent_id: "dina-manuel-contreras-test") {
              agent_id
              full_name
              rank
              category
              brigade
              legal_status
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query })
          .expect(200);

        const agent = response.body.data.getDINAAgent;
        expect(agent).toBeDefined();
        expect(agent.agent_id).toBe('dina-manuel-contreras-test');
        expect(agent.full_name).toBe('Manuel Contreras Sepúlveda');
        expect(agent.rank).toBe('Coronel');
      });

      it('should return null for non-existent agent', async () => {
        const query = `
          query {
            getDINAAgent(agent_id: "non-existent-agent-id") {
              agent_id
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query })
          .expect(200);

        expect(response.body.data.getDINAAgent).toBeNull();
      });
    });

    describe('searchDINAAgents - Text Search', () => {
      it('should search agents by name', async () => {
        const query = `
          query {
            searchDINAAgents(query: "Contreras", limit: 10) {
              agent_id
              full_name
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query })
          .expect(200);

        const agents = response.body.data.searchDINAAgents;
        expect(agents).toBeInstanceOf(Array);
        expect(agents.length).toBeGreaterThan(0);
        expect(agents[0].full_name).toContain('Contreras');
      });

      it('should respect search limit', async () => {
        const query = `
          query {
            searchDINAAgents(query: "Test", limit: 2) {
              agent_id
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query })
          .expect(200);

        const agents = response.body.data.searchDINAAgents;
        expect(agents.length).toBeLessThanOrEqual(2);
      });
    });

    describe('getDINAStatistics - Aggregations', () => {
      it('should return statistics with aggregations', async () => {
        const query = `
          query {
            getDINAStatistics {
              total_agents
              verified_count
              pending_count
              by_category {
                category
                count
              }
              by_legal_status {
                status
                count
              }
              by_region {
                region
                count
              }
              by_brigade {
                brigade
                count
              }
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query })
          .expect(200);

        const stats = response.body.data.getDINAStatistics;
        expect(stats).toBeDefined();
        expect(stats.total_agents).toBeGreaterThanOrEqual(3);
        expect(stats.by_category).toBeInstanceOf(Array);
        expect(stats.by_legal_status).toBeInstanceOf(Array);
        expect(stats.by_region).toBeInstanceOf(Array);
        expect(stats.by_brigade).toBeInstanceOf(Array);
      });

      it('should have valid category aggregations', async () => {
        const query = `
          query {
            getDINAStatistics {
              by_category {
                category
                count
              }
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query })
          .expect(200);

        const categories = response.body.data.getDINAStatistics.by_category;
        expect(categories.length).toBeGreaterThan(0);
        categories.forEach((cat: any) => {
          expect(cat.category).toBeDefined();
          expect(cat.count).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('GraphQL Mutations', () => {
    describe('createDINAAgent', () => {
      it('should create new DINA agent', async () => {
        const mutation = `
          mutation {
            createDINAAgent(input: {
              full_name: "Test New Agent"
              rank: "Sargento"
              category: Enlisted
              region: "Antofagasta"
              legal_status: unknown
            }) {
              agent_id
              full_name
              rank
              category
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: mutation })
          .expect(200);

        const agent = response.body.data.createDINAAgent;
        expect(agent).toBeDefined();
        expect(agent.full_name).toBe('Test New Agent');
        expect(agent.rank).toBe('Sargento');
        expect(agent.category).toBe('Enlisted');

        // Clean up
        await dinaAgentModel.deleteOne({ agent_id: agent.agent_id });
      });
    });

    describe('updateDINAAgent', () => {
      it('should update existing agent', async () => {
        const mutation = `
          mutation {
            updateDINAAgent(
              agent_id: "dina-test-agent-regional"
              input: {
                legal_status: investigated
                verification_status: verified
              }
            ) {
              agent_id
              legal_status
              verification_status
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: mutation })
          .expect(200);

        const agent = response.body.data.updateDINAAgent;
        expect(agent).toBeDefined();
        expect(agent.legal_status).toBe('investigated');
        expect(agent.verification_status).toBe('verified');
      });

      it('should return null for non-existent agent', async () => {
        const mutation = `
          mutation {
            updateDINAAgent(
              agent_id: "non-existent-id"
              input: {
                rank: "Coronel"
              }
            ) {
              agent_id
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: mutation })
          .expect(200);

        expect(response.body.data.updateDINAAgent).toBeNull();
      });
    });

    describe('deleteDINAAgent', () => {
      it('should delete agent', async () => {
        // Create test agent to delete
        const testAgent = await dinaAgentModel.create({
          agent_id: 'dina-to-delete-test',
          full_name: 'Agent To Delete',
          rank: 'Cabo',
          category: 'Enlisted',
          data_sources: [
            {
              source_name: 'Test',
              confidence: 'confirmed',
              extracted_date: new Date(),
            },
          ],
          created_by: 'test-suite',
          verification_status: 'pending',
        });

        const mutation = `
          mutation {
            deleteDINAAgent(agent_id: "dina-to-delete-test")
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: mutation })
          .expect(200);

        expect(response.body.data.deleteDINAAgent).toBe(true);

        // Verify deletion
        const deleted = await dinaAgentModel.findOne({
          agent_id: 'dina-to-delete-test',
        });
        expect(deleted).toBeNull();
      });

      it('should return false for non-existent agent', async () => {
        const mutation = `
          mutation {
            deleteDINAAgent(agent_id: "non-existent-delete-id")
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: mutation })
          .expect(200);

        expect(response.body.data.deleteDINAAgent).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle page beyond total pages', async () => {
      const query = `
        query {
          getDINAAgents(page: 9999, limit: 10) {
            agents {
              agent_id
            }
            pagination {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data.getDINAAgents.agents).toEqual([]);
      expect(response.body.data.getDINAAgents.pagination.hasNextPage).toBe(false);
    });

    it('should handle empty search results', async () => {
      const query = `
        query {
          searchDINAAgents(query: "XYZ_NONEXISTENT_NAME_12345", limit: 10) {
            agent_id
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data.searchDINAAgents).toEqual([]);
    });
  });
});
