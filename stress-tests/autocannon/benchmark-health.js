#!/usr/bin/env node
// 🐾⚡ AUTOCANNON BENCHMARK - Health Endpoint ⚡🐾

const autocannon = require('autocannon');
const fs = require('fs');
const path = require('path');

console.log('🐾⚡ NEKO DEFENSE STRESS TEST - Health Endpoint ⚡🐾\n');
console.log('Starting autocannon benchmark, nyaa~!\n');

const instance = autocannon({
  url: 'http://localhost:5001/api/health',
  connections: 100, // concurrent connections
  duration: 30, // seconds
  pipelining: 1, // requests per connection
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
  console.log('🎯 BENCHMARK RESULTS - /api/health');
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

  if (rps > 1000 && p95 < 100 && errorRate < 0.1) {
    nekoMode = 'LEGENDARY ⚡✨';
    kawaiiLevel = '💖💖💖';
  } else if (rps > 500 && p95 < 200 && errorRate < 1) {
    nekoMode = 'EPIC 🎯';
    kawaiiLevel = '💖💖';
  } else if (rps > 200 && p95 < 500 && errorRate < 5) {
    nekoMode = 'GOOD ✅';
    kawaiiLevel = '💖';
  }

  console.log('🐾 NEKO ASSESSMENT:');
  console.log(`   Mode: ${nekoMode}`);
  console.log(`   Kawaii Level: ${kawaiiLevel}`);
  console.log(`   Error Rate: ${errorRate.toFixed(3)}%`);
  console.log('');

  // Pass/fail criteria
  if (rps > 500 && p95 < 100 && errorRate < 1) {
    console.log('✅ BENCHMARK PASSED, NYAA~! 🐾⚡\n');
  } else {
    console.log('⚠️  BENCHMARK NEEDS IMPROVEMENT, DESU~! 🐾\n');
  }

  console.log('═'.repeat(70));

  // Save results to JSON
  const resultsDir = path.join(__dirname, '..', 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsFile = path.join(resultsDir, `autocannon-health-${timestamp}.json`);

  fs.writeFileSync(resultsFile, JSON.stringify({
    endpoint: '/api/health',
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
