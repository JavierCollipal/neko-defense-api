#!/usr/bin/env node
// 🐾⚡ AUTOCANNON BENCHMARK - Stats Endpoint ⚡🐾

const autocannon = require('autocannon');
const fs = require('fs');
const path = require('path');

console.log('🐾⚡ NEKO DEFENSE STRESS TEST - Stats Endpoint ⚡🐾\n');
console.log('Starting autocannon benchmark, nyaa~!\n');

const instance = autocannon({
  url: 'http://localhost:5001/api/stats',
  connections: 50, // lower for non-health endpoints
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
  console.log('📊 BENCHMARK RESULTS - /api/stats');
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

  // Performance assessment
  const rps = result.requests.average;
  const p95 = result.latency.p95;
  const errorRate = (result.errors / result.requests.total) * 100;

  let nekoMode = 'NEEDS WORK';
  let kawaiiLevel = '⚠️';

  if (rps > 500 && p95 < 100 && errorRate < 0.1) {
    nekoMode = 'LEGENDARY ⚡✨';
    kawaiiLevel = '💖💖💖';
  } else if (rps > 300 && p95 < 200 && errorRate < 1) {
    nekoMode = 'EPIC 🎯';
    kawaiiLevel = '💖💖';
  } else if (rps > 100 && p95 < 500 && errorRate < 5) {
    nekoMode = 'GOOD ✅';
    kawaiiLevel = '💖';
  }

  console.log('🐾 NEKO ASSESSMENT:');
  console.log(`   Mode: ${nekoMode}`);
  console.log(`   Kawaii Level: ${kawaiiLevel}`);
  console.log(`   Error Rate: ${errorRate.toFixed(3)}%`);
  console.log('');

  // Pass/fail criteria
  if (rps > 300 && p95 < 200 && errorRate < 1) {
    console.log('✅ BENCHMARK PASSED, NYAA~! 🐾⚡\n');
  } else {
    console.log('⚠️  BENCHMARK NEEDS IMPROVEMENT, DESU~! 🐾\n');
  }

  console.log('═'.repeat(70));

  // Save results
  const resultsDir = path.join(__dirname, '..', 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsFile = path.join(resultsDir, `autocannon-stats-${timestamp}.json`);

  fs.writeFileSync(resultsFile, JSON.stringify({
    endpoint: '/api/stats',
    tool: 'autocannon',
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
