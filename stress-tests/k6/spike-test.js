// 🐾⚡ K6 SPIKE TEST - Sudden Traffic Bursts ⚡🐾
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const spikeErrors = new Rate('spike_errors');
const spikeRecovery = new Trend('spike_recovery_time');
const spikeRequests = new Counter('spike_requests');

// Spike test configuration - SUDDEN BURSTS!
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Normal baseline
    { duration: '10s', target: 200 },  // 🚨 SPIKE #1!
    { duration: '30s', target: 200 },  // Hold spike
    { duration: '30s', target: 10 },   // Recovery
    { duration: '30s', target: 10 },   // Stable
    { duration: '10s', target: 300 },  // 🚨 MEGA SPIKE #2!
    { duration: '30s', target: 300 },  // Hold mega spike
    { duration: '30s', target: 10 },   // Final recovery
  ],

  thresholds: {
    'http_req_failed': ['rate<0.25'],
    'http_req_duration': ['p(95)<3000'],
    'spike_errors': ['rate<0.30'],
  },
};

const BASE_URL = 'http://localhost:5001';

export function setup() {
  console.log('🐾⚡ NEKO K6 SPIKE TEST - SUDDEN TRAFFIC BURSTS, NYAA~! ⚡🐾\n');
  console.log('🚨 This test simulates DDoS-like traffic patterns!');
  console.log('   Spike #1: 10 → 200 users in 10 seconds');
  console.log('   Spike #2: 10 → 300 users in 10 seconds');
  console.log('   Duration: ~4 minutes\n');

  return { startTime: Date.now(), spikeTimes: [] };
}

export default function(data) {
  // Mix of endpoints
  const endpoints = [
    '/api/health',
    '/api/stats',
    '/api/threat-counts',
  ];

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

  const res = http.get(`${BASE_URL}${endpoint}`);

  const success = check(res, {
    'status OK or rate limited': (r) => r.status === 200 || r.status === 429,
    'response under 3s': (r) => r.timings.duration < 3000,
  });

  spikeErrors.add(!success);
  spikeRecovery.add(res.timings.duration);
  spikeRequests.add(1);

  sleep(Math.random() * 2);
}

export function teardown(data) {
  console.log(`\n🐾⚡ SPIKE TEST COMPLETE, NYAA~! ⚡🐾\n`);
}

export function handleSummary(data) {
  console.log('\n' + '═'.repeat(80));
  console.log('🚨 K6 SPIKE TEST SUMMARY');
  console.log('═'.repeat(80) + '\n');

  const duration = data.metrics.http_req_duration;
  const failed = data.metrics.http_req_failed;

  console.log(`⚡ Total Requests: ${data.metrics.http_reqs.values.count}`);
  console.log(`⏱️  Avg Response: ${duration.values.avg.toFixed(2)}ms`);
  console.log(`⏱️  P95 Response: ${duration.values['p(95)'].toFixed(2)}ms`);
  console.log(`⏱️  Max Response: ${duration.values.max.toFixed(2)}ms`);
  console.log(`❌ Failed Rate: ${(failed.values.rate * 100).toFixed(2)}%`);

  const failRate = failed.values.rate * 100;

  console.log(`\n🔍 SPIKE RESILIENCE:`);

  if (failRate < 10) {
    console.log(`   ✅ EXCELLENT - System handled spikes gracefully!`);
    console.log(`   🛡️ Rate limiting and throttling working perfectly, nyaa~!`);
  } else if (failRate < 25) {
    console.log(`   ⚠️  GOOD - Some degradation during spikes but recovered`);
    console.log(`   💡 Consider increasing rate limits or caching`);
  } else {
    console.log(`   🚨 NEEDS IMPROVEMENT - High failure rate during spikes`);
    console.log(`   💡 Implement better burst protection`);
  }

  console.log('\n' + '═'.repeat(80) + '\n');

  return {
    'stdout': '\n',
    'spike-summary.json': JSON.stringify(data, null, 2),
  };
}
