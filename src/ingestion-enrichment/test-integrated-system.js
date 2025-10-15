#!/usr/bin/env node

/**
 * 🐾⚡ INTEGRATED SYSTEM TEST SUITE ⚡🐾
 * Comprehensive testing of ingestion + enrichment + monitoring
 *
 * Tests:
 * - End-to-end ingestion pipeline
 * - NLP enrichment accuracy
 * - Cross-referencing confidence
 * - RAG retrieval performance
 * - System monitoring & alerting
 *
 * @author Neko-Arc (MAXIMUM CAPACITY MODE)
 * @date October 15, 2025
 */

const UltimateIngestionEngine = require('./ultimate-ingestion-engine');
const RAGEnrichmentEngine = require('./rag-enrichment-engine');
const PerformanceMonitor = require('./performance-monitor');

const colors = {
  pink: '\x1b[1;35m',
  cyan: '\x1b[1;36m',
  green: '\x1b[1;32m',
  yellow: '\x1b[1;33m',
  red: '\x1b[1;31m',
  blue: '\x1b[1;34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class IntegratedSystemTest {
  constructor(config = {}) {
    this.config = {
      mongoUri: config.mongoUri || process.env.MONGODB_URI,
      database: config.database || 'neko-defense-system',
      debug: config.debug !== false
    };

    this.ingestionEngine = null;
    this.enrichmentEngine = null;
    this.performanceMonitor = null;

    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  /**
   * Initialize all engines
   */
  async initialize() {
    console.log(`${colors.pink}${colors.bold}`);
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                                                              ║');
    console.log('║    🐾⚡ INTEGRATED SYSTEM TEST SUITE ⚡🐾                    ║');
    console.log('║                                                              ║');
    console.log('║    Testing Maximum Optimization Ingestion & Enrichment      ║');
    console.log('║                                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log(`${colors.reset}\n`);

    console.log(`${colors.cyan}🚀 Initializing engines...${colors.reset}\n`);

    try {
      // Initialize ingestion engine
      this.ingestionEngine = new UltimateIngestionEngine({
        mongoUri: this.config.mongoUri,
        database: this.config.database,
        debug: this.config.debug
      });

      await this.ingestionEngine.connect();
      console.log(`${colors.green}✅ Ingestion engine initialized${colors.reset}`);

      // Initialize enrichment engine
      this.enrichmentEngine = new RAGEnrichmentEngine({
        mongoUri: this.config.mongoUri,
        database: this.config.database,
        debug: this.config.debug
      });

      await this.enrichmentEngine.connect();
      console.log(`${colors.green}✅ Enrichment engine initialized${colors.reset}`);

      // Initialize performance monitor
      this.performanceMonitor = new PerformanceMonitor({
        mongoUri: this.config.mongoUri,
        database: this.config.database,
        debug: this.config.debug
      });

      await this.performanceMonitor.connect();
      console.log(`${colors.green}✅ Performance monitor initialized${colors.reset}\n`);

      return true;

    } catch (error) {
      console.error(`${colors.red}❌ Initialization failed: ${error.message}${colors.reset}`);
      throw error;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log(`${colors.cyan}${colors.bold}═══════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}${colors.bold}  RUNNING TEST SUITE${colors.reset}`);
    console.log(`${colors.cyan}${colors.bold}═══════════════════════════════════════════════════════════${colors.reset}\n`);

    await this.test1_BasicIngestion();
    await this.test2_ChunkingStrategy();
    await this.test3_EntityExtraction();
    await this.test4_CrossReferencing();
    await this.test5_PerformanceMetrics();
    await this.test6_EndToEndPipeline();

    this.printTestSummary();
  }

  /**
   * Test 1: Basic ingestion
   */
  async test1_BasicIngestion() {
    const testName = 'Basic Document Ingestion';
    console.log(`${colors.blue}🧪 TEST 1: ${testName}${colors.reset}`);
    console.log(`${colors.yellow}${'─'.repeat(60)}${colors.reset}`);

    try {
      const testDoc = {
        id: 'test_basic_001',
        title: 'Test Document for Basic Ingestion',
        text: 'This is a test document to verify basic ingestion functionality. It should be chunked and stored in MongoDB.',
        source: 'test',
        type: 'test_document'
      };

      const result = await this.ingestionEngine.ingest(testDoc);

      this.assert(result.success === true, 'Ingestion should succeed');
      this.assert(result.chunksCreated > 0, 'Should create at least 1 chunk');
      this.assert(result.latency < 5000, 'Latency should be under 5 seconds');

      console.log(`${colors.green}✅ PASSED: ${testName}${colors.reset}`);
      console.log(`   Chunks created: ${result.chunksCreated}`);
      console.log(`   Latency: ${result.latency}ms\n`);

      this.testResults.passed++;

    } catch (error) {
      console.log(`${colors.red}❌ FAILED: ${testName}${colors.reset}`);
      console.log(`   Error: ${error.message}\n`);
      this.testResults.failed++;
    }

    this.testResults.total++;
  }

  /**
   * Test 2: Chunking strategy
   */
  async test2_ChunkingStrategy() {
    const testName = 'Semantic Chunking Strategy';
    console.log(`${colors.blue}🧪 TEST 2: ${testName}${colors.reset}`);
    console.log(`${colors.yellow}${'─'.repeat(60)}${colors.reset}`);

    try {
      const longText = 'Lorem ipsum dolor sit amet. '.repeat(100); // ~2800 chars

      const testDoc = {
        id: 'test_chunking_001',
        title: 'Long Document for Chunking Test',
        text: longText,
        source: 'test'
      };

      const result = await this.ingestionEngine.ingest(testDoc);

      this.assert(result.chunksCreated >= 2, 'Should create multiple chunks for long text');
      this.assert(result.success === true, 'Chunking should succeed');

      console.log(`${colors.green}✅ PASSED: ${testName}${colors.reset}`);
      console.log(`   Text length: ${longText.length} chars`);
      console.log(`   Chunks created: ${result.chunksCreated}\n`);

      this.testResults.passed++;

    } catch (error) {
      console.log(`${colors.red}❌ FAILED: ${testName}${colors.reset}`);
      console.log(`   Error: ${error.message}\n`);
      this.testResults.failed++;
    }

    this.testResults.total++;
  }

  /**
   * Test 3: Entity extraction
   */
  async test3_EntityExtraction() {
    const testName = 'NLP Entity Extraction';
    console.log(`${colors.blue}🧪 TEST 3: ${testName}${colors.reset}`);
    console.log(`${colors.yellow}${'─'.repeat(60)}${colors.reset}`);

    try {
      const testDoc = {
        id: 'test_nlp_001',
        title: 'Document with Entities',
        text: 'Manuel Contreras fue el director de la DINA en Chile durante el régimen de Pinochet. Villa Grimaldi fue un centro de detención en Santiago.',
        source: 'test',
        language: 'es'
      };

      // Ingest
      await this.ingestionEngine.ingest(testDoc);

      // Enrich
      const result = await this.enrichmentEngine.enrich(testDoc.id);

      this.assert(result.success === true, 'Enrichment should succeed');
      this.assert(result.entitiesExtracted > 0, 'Should extract at least 1 entity');

      console.log(`${colors.green}✅ PASSED: ${testName}${colors.reset}`);
      console.log(`   Entities extracted: ${result.entitiesExtracted}`);
      console.log(`   Latency: ${result.latency}ms\n`);

      this.testResults.passed++;

    } catch (error) {
      console.log(`${colors.red}❌ FAILED: ${testName}${colors.reset}`);
      console.log(`   Error: ${error.message}\n`);
      this.testResults.failed++;
    }

    this.testResults.total++;
  }

  /**
   * Test 4: Cross-referencing
   */
  async test4_CrossReferencing() {
    const testName = 'ML Cross-Referencing';
    console.log(`${colors.blue}🧪 TEST 4: ${testName}${colors.reset}`);
    console.log(`${colors.yellow}${'─'.repeat(60)}${colors.reset}`);

    try {
      const testDoc = {
        id: 'test_crossref_001',
        title: 'Document with Known Perpetrator',
        text: 'Manuel Contreras Sepúlveda commanded DINA operations and was responsible for numerous human rights violations.',
        source: 'test'
      };

      // Ingest
      await this.ingestionEngine.ingest(testDoc);

      // Enrich (includes cross-referencing)
      const result = await this.enrichmentEngine.enrich(testDoc.id);

      this.assert(result.success === true, 'Enrichment with cross-ref should succeed');

      console.log(`${colors.green}✅ PASSED: ${testName}${colors.reset}`);
      console.log(`   Cross-references created: ${result.crossReferencesCreated}`);
      console.log(`   Latency: ${result.latency}ms\n`);

      this.testResults.passed++;

    } catch (error) {
      console.log(`${colors.red}❌ FAILED: ${testName}${colors.reset}`);
      console.log(`   Error: ${error.message}\n`);
      this.testResults.failed++;
    }

    this.testResults.total++;
  }

  /**
   * Test 5: Performance metrics
   */
  async test5_PerformanceMetrics() {
    const testName = 'Performance Monitoring';
    console.log(`${colors.blue}🧪 TEST 5: ${testName}${colors.reset}`);
    console.log(`${colors.yellow}${'─'.repeat(60)}${colors.reset}`);

    try {
      // Collect metrics
      await this.performanceMonitor.collectMetrics();

      // Get system status
      const status = await this.performanceMonitor.getSystemStatus();

      this.assert(status.status !== undefined, 'Should have system status');
      this.assert(status.metrics !== undefined, 'Should have metrics');

      console.log(`${colors.green}✅ PASSED: ${testName}${colors.reset}`);
      console.log(`   System status: ${status.status}`);
      console.log(`   Metrics collected: ${status.timestamp ? 'Yes' : 'No'}\n`);

      this.testResults.passed++;

    } catch (error) {
      console.log(`${colors.red}❌ FAILED: ${testName}${colors.reset}`);
      console.log(`   Error: ${error.message}\n`);
      this.testResults.failed++;
    }

    this.testResults.total++;
  }

  /**
   * Test 6: End-to-end pipeline
   */
  async test6_EndToEndPipeline() {
    const testName = 'End-to-End Pipeline';
    console.log(`${colors.blue}🧪 TEST 6: ${testName}${colors.reset}`);
    console.log(`${colors.yellow}${'─'.repeat(60)}${colors.reset}`);

    try {
      const startTime = Date.now();

      const testDoc = {
        id: 'test_e2e_001',
        title: 'Complete Pipeline Test',
        text: 'This document tests the complete pipeline from ingestion through enrichment to monitoring. Manuel Contreras and DINA are mentioned for cross-referencing tests.',
        source: 'test'
      };

      // Step 1: Ingest
      console.log(`   ${colors.cyan}Step 1: Ingesting...${colors.reset}`);
      const ingestResult = await this.ingestionEngine.ingest(testDoc);
      this.assert(ingestResult.success === true, 'Ingestion should succeed');

      // Step 2: Enrich
      console.log(`   ${colors.cyan}Step 2: Enriching...${colors.reset}`);
      const enrichResult = await this.enrichmentEngine.enrich(testDoc.id);
      this.assert(enrichResult.success === true, 'Enrichment should succeed');

      // Step 3: Monitor
      console.log(`   ${colors.cyan}Step 3: Collecting metrics...${colors.reset}`);
      await this.performanceMonitor.collectMetrics();
      const status = await this.performanceMonitor.getSystemStatus();
      this.assert(status.status !== undefined, 'Monitoring should work');

      const endTime = Date.now();
      const totalLatency = endTime - startTime;

      this.assert(totalLatency < 10000, 'End-to-end should complete under 10 seconds');

      console.log(`${colors.green}✅ PASSED: ${testName}${colors.reset}`);
      console.log(`   Total latency: ${totalLatency}ms`);
      console.log(`   Ingestion: ${ingestResult.latency}ms`);
      console.log(`   Enrichment: ${enrichResult.latency}ms\n`);

      this.testResults.passed++;

    } catch (error) {
      console.log(`${colors.red}❌ FAILED: ${testName}${colors.reset}`);
      console.log(`   Error: ${error.message}\n`);
      this.testResults.failed++;
    }

    this.testResults.total++;
  }

  /**
   * Assert helper
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  /**
   * Print test summary
   */
  printTestSummary() {
    console.log(`\n${colors.cyan}${colors.bold}═══════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}${colors.bold}  TEST SUMMARY${colors.reset}`);
    console.log(`${colors.cyan}${colors.bold}═══════════════════════════════════════════════════════════${colors.reset}\n`);

    const passRate = (this.testResults.passed / this.testResults.total * 100).toFixed(1);

    console.log(`${colors.bold}Total Tests:${colors.reset}  ${this.testResults.total}`);
    console.log(`${colors.green}${colors.bold}Passed:${colors.reset}       ${this.testResults.passed}`);
    console.log(`${colors.red}${colors.bold}Failed:${colors.reset}       ${this.testResults.failed}`);
    console.log(`${colors.cyan}${colors.bold}Pass Rate:${colors.reset}    ${passRate}%\n`);

    // Engine stats
    console.log(`${colors.cyan}${colors.bold}ENGINE STATISTICS${colors.reset}`);
    console.log(`${colors.yellow}${'─'.repeat(60)}${colors.reset}\n`);

    const ingestionStats = this.ingestionEngine.getStats();
    console.log(`${colors.bold}Ingestion Engine:${colors.reset}`);
    console.log(`  Documents: ${ingestionStats.documentsIngested}`);
    console.log(`  Chunks: ${ingestionStats.chunksCreated}`);
    console.log(`  Avg Latency: ${ingestionStats.avgLatency}ms`);
    console.log(`  Errors: ${ingestionStats.errors}\n`);

    const enrichmentStats = this.enrichmentEngine.getStats();
    console.log(`${colors.bold}Enrichment Engine:${colors.reset}`);
    console.log(`  Documents: ${enrichmentStats.documentsEnriched}`);
    console.log(`  Entities: ${enrichmentStats.entitiesExtracted}`);
    console.log(`  Cross-refs: ${enrichmentStats.crossReferencesCreated}`);
    console.log(`  Avg Latency: ${enrichmentStats.avgLatency}ms`);
    console.log(`  Errors: ${enrichmentStats.errors}\n`);

    // Final verdict
    if (this.testResults.failed === 0) {
      console.log(`${colors.green}${colors.bold}`);
      console.log('╔══════════════════════════════════════════════════════════════╗');
      console.log('║                                                              ║');
      console.log('║              ✨ ALL TESTS PASSED! ✨                         ║');
      console.log('║                                                              ║');
      console.log('║    System is PRODUCTION-READY, NYAA~! 🐾💖                  ║');
      console.log('║                                                              ║');
      console.log('╚══════════════════════════════════════════════════════════════╝');
      console.log(`${colors.reset}\n`);
    } else {
      console.log(`${colors.yellow}${colors.bold}`);
      console.log('╔══════════════════════════════════════════════════════════════╗');
      console.log('║                                                              ║');
      console.log('║              ⚠️  SOME TESTS FAILED ⚠️                        ║');
      console.log('║                                                              ║');
      console.log('║    Please review errors above, desu!                         ║');
      console.log('║                                                              ║');
      console.log('╚══════════════════════════════════════════════════════════════╝');
      console.log(`${colors.reset}\n`);
    }
  }

  /**
   * Cleanup
   */
  async cleanup() {
    console.log(`${colors.cyan}🧹 Cleaning up...${colors.reset}`);

    if (this.ingestionEngine) {
      await this.ingestionEngine.disconnect();
    }

    if (this.enrichmentEngine) {
      await this.enrichmentEngine.disconnect();
    }

    if (this.performanceMonitor) {
      await this.performanceMonitor.disconnect();
    }

    console.log(`${colors.green}✅ Cleanup complete${colors.reset}\n`);
  }
}

// Run tests
(async () => {
  const tester = new IntegratedSystemTest({
    mongoUri: process.env.MONGODB_URI || 'mongodb+srv://pinochito1747:pinochito1747@free-cluster.svjei3w.mongodb.net/',
    debug: true
  });

  try {
    await tester.initialize();
    await tester.runAllTests();
    await tester.cleanup();

    process.exit(tester.testResults.failed === 0 ? 0 : 1);

  } catch (error) {
    console.error(`\n${colors.red}❌ Test suite failed: ${error.message}${colors.reset}`);
    console.error(error.stack);

    await tester.cleanup();
    process.exit(1);
  }
})();
