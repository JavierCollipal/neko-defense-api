#!/usr/bin/env node
// 🐾⚡ AUTOCANNON BENCHMARK - Threat Actors Endpoint (Heavy DB Query) ⚡🐾

const autocannon = require('autocannon');
const fs = require('fs');
const path = require('path');

console.log('🐾⚡ NEKO DEFENSE STRESS TEST - Threat Actors Endpoint ⚡🐾\n');
console.log('⚠️  WARNING: Heavy MongoDB query ahead, nyaa~!\n');
console.log('Starting autocannon benchmark, desu~!\n');

const instance = autocannon({
  url: 'http://localhost:5001/api/threat-actors',
  connections: 20, // much lower for heavy DB queries
  duration: 30, // seconds
  pipelining: 1,
  headers: {
    'Content-Type': 'application/json',
  },
}, (err, result) => {
  if (err) {
    console.error('❌ Benchmark failed, nya~!', err);
    process.exit(1);
  }

  console.log('\n');
  console.log('═'.repeat(70));
  console.log('🎯 BENCHMARK RESULTS - /api/threat-actors (HEAVY DB QUERY)');
  console.log('═'.repeat(70));
  console.log('');
  console.log(`⚡ Total Requests:  ${result.requests.total}`);
  console.log(`📊 Requests/sec:    ${result.requests.average.toFixed(2)}`);
  console.log(`⏱️  Latency p50:     ${result.latency.p50}ms`);
  console.log(`⏱️  Latency p95:     ${result.latency.p95}ms`);
  console.log(`⏱️  Latency p99:     ${result.latency.p99}ms`);
  console.log(`⏱️  Latency Max:     ${result.latency.max}ms`);
  console.log(`📦 Throughput:      ${(result.throughput.average / 1024 / 1024).toFixed(2)} MB/s`);
  console.log(`❌ Errors:          ${result.errors}`);
  console.log(`⏰ Duration:        ${result.duration}s`);
  console.log('');

  // Performance assessment (adjusted for heavy queries)
  const rps = result.requests.average;
  const p95 = result.latency.p95;
  const errorRate = (result.errors / result.requests.total) * 100;

  let nekoMode = 'NEEDS WORK';
  let kawaiiLevel = '⚠️';

  // More lenient criteria for heavy DB queries
  if (rps > 100 && p95 < 500 && errorRate < 0.1) {
    nekoMode = 'LEGENDARY ⚡✨';
    kawaiiLevel = '💖💖💖';
  } else if (rps > 50 && p95 < 1000 && errorRate < 1) {
    nekoMode = 'EPIC 🎯';
    kawaiiLevel = '💖💖';
  } else if (rps > 20 && p95 < 2000 && errorRate < 5) {
    nekoMode = 'GOOD ✅';
    kawaiiLevel = '💖';
  }

  console.log('🐾 NEKO ASSESSMENT (Heavy Query Adjusted):');
  console.log(`   Mode: ${nekoMode}`);
  console.log(`   Kawaii Level: ${kawaiiLevel}`);
  console.log(`   Error Rate: ${errorRate.toFixed(3)}%`);
  console.log('');

  // Pass/fail criteria (adjusted for heavy queries)
  if (rps > 50 && p95 < 1000 && errorRate < 1) {
    console.log('✅ BENCHMARK PASSED, NYAA~! 🐾⚡\n');
    console.log('   💾 MongoDB handling load well, desu~!');
  } else {
    console.log('⚠️  BENCHMARK NEEDS IMPROVEMENT, DESU~! 🐾\n');
    console.log('   💡 Consider: indexing, caching, or query optimization!');
  }

  console.log('');
  console.log('═'.repeat(70));

  // Save results
  const resultsDir = path.join(__dirname, '..', 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsFile = path.join(resultsDir, `autocannon-threats-${timestamp}.json`);

  fs.writeFileSync(resultsFile, JSON.stringify({
    endpoint: '/api/threat-actors',
    tool: 'autocannon',
    queryType: 'heavy-database',
    timestamp: new Date().toISOString(),
    nekoMode,
    kawaiiLevel,
    results: result,
  }, null, 2));

  console.log(`\n📁 Results saved to: ${resultsFile}\n`);
});

// Live progress bar
autocannon.track(instance, {
  renderProgressBar: true,
  renderResultsTable: false,
  renderLatencyTable: false,
});
