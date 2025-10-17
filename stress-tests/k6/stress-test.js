// 🐾⚡ K6 STRESS TEST - Find Breaking Point ⚡🐾
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

// Stress test configuration - PUSH IT TO THE LIMIT!
export const options = {
  stages: [
    { duration: '1m', target: 50 },    // Start gentle
    { duration: '2m', target: 100 },   // Increase
    { duration: '2m', target: 200 },   // More stress
    { duration: '2m', target: 300 },   // Even more!
    { duration: '2m', target: 400 },   // MAXIMUM STRESS!
    { duration: '2m', target: 500 },   // BREAKING POINT?!
    { duration: '3m', target: 500 },   // Hold at peak
    { duration: '2m', target: 0 },     // Recovery
  ],

  // Relaxed thresholds for stress testing
  thresholds: {
    'http_req_failed': ['rate<0.20'],  // Allow 20% errors at peak
    'http_req_duration': ['p(95)<5000'], // 5 seconds max
    'errors': ['rate<0.30'],           // Up to 30% failure acceptable
  },
};

const BASE_URL = 'http://localhost:5001';

export function setup() {
  console.log('🐾⚡ NEKO K6 STRESS TEST - FINDING BREAKING POINT, NYAA~! ⚡🐾\n');
  console.log('⚠️  WARNING: This test will push the API to its limits!');
  console.log('   Expect errors and rate limiting!');
  console.log('   Duration: ~16 minutes\n');

  return { startTime: Date.now() };
}

export default function() {
  // Health check
  group('Stress - Health', function() {
    const res = http.get(`${BASE_URL}/api/health`);
    const success = check(res, {
      'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    });
    errorRate.add(!success);
    responseTime.add(res.timings.duration);
  });

  sleep(0.5);

  // Stats endpoint
  group('Stress - Stats', function() {
    const res = http.get(`${BASE_URL}/api/stats`);
    const success = check(res, {
      'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    });
    errorRate.add(!success);
    responseTime.add(res.timings.duration);
  });

  sleep(0.5);

  // Sometimes hit heavy endpoint
  if (Math.random() > 0.8) {
    group('Stress - Threats (Heavy)', function() {
      const res = http.get(`${BASE_URL}/api/threat-actors`);
      const success = check(res, {
        'status not 5xx': (r) => r.status < 500,
      });
      errorRate.add(!success);
      responseTime.add(res.timings.duration);
    });
  }

  sleep(1);
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000 / 60;
  console.log(`\n🐾⚡ STRESS TEST COMPLETE! Duration: ${duration.toFixed(1)} minutes, NYAA~! ⚡🐾\n`);
}

export function handleSummary(data) {
  console.log('\n' + '═'.repeat(80));
  console.log('🔥 K6 STRESS TEST SUMMARY - BREAKING POINT ANALYSIS');
  console.log('═'.repeat(80) + '\n');

  const httpReqDuration = data.metrics.http_req_duration;
  const httpReqFailed = data.metrics.http_req_failed;

  console.log(`⚡ Total Requests: ${data.metrics.http_reqs.values.count}`);
  console.log(`⏱️  Avg Response: ${httpReqDuration.values.avg.toFixed(2)}ms`);
  console.log(`⏱️  P95 Response: ${httpReqDuration.values['p(95)'].toFixed(2)}ms`);
  console.log(`⏱️  Max Response: ${httpReqDuration.values.max.toFixed(2)}ms`);
  console.log(`❌ Failed Rate: ${(httpReqFailed.values.rate * 100).toFixed(2)}%`);

  // Breaking point analysis
  const failRate = httpReqFailed.values.rate * 100;
  const maxLatency = httpReqDuration.values.max;

  console.log(`\n🔍 BREAKING POINT ANALYSIS:`);

  if (failRate < 5) {
    console.log(`   ✅ System handled 500 concurrent users gracefully!`);
    console.log(`   🎯 No breaking point found - LEGENDARY, NYAA~! ⚡✨`);
  } else if (failRate < 20) {
    console.log(`   ⚠️  System degraded but survived 500 users`);
    console.log(`   🎯 Breaking point likely between 400-500 users`);
  } else {
    console.log(`   🚨 System breaking point reached!`);
    console.log(`   🎯 Recommend max load: ~300-400 concurrent users`);
  }

  console.log(`\n💡 RECOMMENDATIONS:`);
  console.log(`   - Rate limiting kicked in (expected)`);
  console.log(`   - Consider caching for heavy endpoints`);
  console.log(`   - Monitor MongoDB connection pool`);
  console.log(`   - Scale horizontally if needed`);

  console.log('\n' + '═'.repeat(80) + '\n');

  return {
    'stdout': '\n',
    'stress-summary.json': JSON.stringify(data, null, 2),
  };
}
