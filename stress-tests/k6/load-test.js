// 🐾⚡ K6 LOAD TEST - Standard Load Testing ⚡🐾
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics - NEKO POWER! ⚡
const errorRate = new Rate('errors');
const nekoResponseTime = new Trend('neko_response_time');
const nekoRequests = new Counter('neko_requests');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp-up to 50 users
    { duration: '5m', target: 50 },   // Hold 50 users
    { duration: '2m', target: 100 },  // Ramp-up to 100 users
    { duration: '3m', target: 100 },  // Hold 100 users
    { duration: '2m', target: 0 },    // Ramp-down
  ],

  // Performance thresholds
  thresholds: {
    // HTTP errors should be less than 1%
    'http_req_failed': ['rate<0.01'],

    // 95% of requests should complete in <500ms for lightweight endpoints
    'http_req_duration{endpoint:health}': ['p(95)<500'],
    'http_req_duration{endpoint:stats}': ['p(95)<1000'],

    // Heavy endpoints can be slower
    'http_req_duration{endpoint:threats}': ['p(95)<2000'],

    // Custom neko metrics
    'errors': ['rate<0.05'],
    'neko_response_time': ['p(95)<1000'],
  },

  // Save results
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

const BASE_URL = 'http://localhost:5001';

export function setup() {
  console.log('🐾⚡ NEKO K6 LOAD TEST STARTING, NYAA~! ⚡🐾\n');

  // Verify API is running
  const res = http.get(`${BASE_URL}/api/health`);
  if (res.status !== 200) {
    throw new Error('API is not responding! Start the API first, desu~!');
  }

  console.log('✅ API is operational, starting load test...\n');
  return { startTime: Date.now() };
}

export default function(data) {
  // Group 1: Health Check (lightweight)
  group('Health Endpoint', function() {
    const res = http.get(`${BASE_URL}/api/health`, {
      tags: { endpoint: 'health' },
    });

    const success = check(res, {
      'health status is 200': (r) => r.status === 200,
      'health has success field': (r) => r.json('success') === true,
      'health response < 200ms': (r) => r.timings.duration < 200,
    });

    errorRate.add(!success);
    nekoResponseTime.add(res.timings.duration);
    nekoRequests.add(1);
  });

  sleep(1);

  // Group 2: Stats Endpoint (medium)
  group('Stats Endpoint', function() {
    const res = http.get(`${BASE_URL}/api/stats`, {
      tags: { endpoint: 'stats' },
    });

    const success = check(res, {
      'stats status is 200': (r) => r.status === 200,
      'stats has total_threats': (r) => r.json('data.total_threats') !== undefined,
      'stats response < 500ms': (r) => r.timings.duration < 500,
    });

    errorRate.add(!success);
    nekoResponseTime.add(res.timings.duration);
    nekoRequests.add(1);
  });

  sleep(2);

  // Group 3: Threat Counts (medium)
  group('Threat Counts Endpoint', function() {
    const res = http.get(`${BASE_URL}/api/threat-counts`, {
      tags: { endpoint: 'threat-counts' },
    });

    const success = check(res, {
      'threat counts status is 200': (r) => r.status === 200,
      'threat counts has data': (r) => r.json('data') !== undefined,
    });

    errorRate.add(!success);
    nekoResponseTime.add(res.timings.duration);
    nekoRequests.add(1);
  });

  sleep(1);

  // Group 4: Threat Actors (heavy - run less often)
  if (Math.random() > 0.7) {  // Only 30% of iterations
    group('Threat Actors Endpoint (Heavy)', function() {
      const res = http.get(`${BASE_URL}/api/threat-actors`, {
        tags: { endpoint: 'threats' },
      });

      const success = check(res, {
        'threat actors status is 200': (r) => r.status === 200,
        'threat actors has data': (r) => r.json('data') !== undefined,
        'threat actors response < 2000ms': (r) => r.timings.duration < 2000,
      });

      errorRate.add(!success);
      nekoResponseTime.add(res.timings.duration);
      nekoRequests.add(1);
    });

    sleep(3);
  }
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`\n🐾⚡ LOAD TEST COMPLETE! Duration: ${duration}s, NYAA~! ⚡🐾\n`);
}

export function handleSummary(data) {
  console.log('\n' + '═'.repeat(80));
  console.log('🎯 K6 LOAD TEST SUMMARY - NEKO ASSESSMENT');
  console.log('═'.repeat(80) + '\n');

  const httpReqDuration = data.metrics.http_req_duration;
  const httpReqFailed = data.metrics.http_req_failed;
  const iterations = data.metrics.iterations;

  console.log(`⚡ Total Requests: ${data.metrics.http_reqs.values.count}`);
  console.log(`📊 Total Iterations: ${iterations.values.count}`);
  console.log(`⏱️  Avg Response Time: ${httpReqDuration.values.avg.toFixed(2)}ms`);
  console.log(`⏱️  P95 Response Time: ${httpReqDuration.values['p(95)'].toFixed(2)}ms`);
  console.log(`⏱️  P99 Response Time: ${httpReqDuration.values['p(99)'].toFixed(2)}ms`);
  console.log(`❌ Failed Requests: ${(httpReqFailed.values.rate * 100).toFixed(2)}%`);

  // Neko Assessment
  const p95 = httpReqDuration.values['p(95)'];
  const errorPercent = httpReqFailed.values.rate * 100;

  let nekoMode = 'NEEDS WORK ⚠️';
  let kawaiiLevel = '💔';

  if (p95 < 500 && errorPercent < 0.5) {
    nekoMode = 'LEGENDARY ⚡✨';
    kawaiiLevel = '💖💖💖';
  } else if (p95 < 1000 && errorPercent < 2) {
    nekoMode = 'EPIC 🎯';
    kawaiiLevel = '💖💖';
  } else if (p95 < 2000 && errorPercent < 5) {
    nekoMode = 'GOOD ✅';
    kawaiiLevel = '💖';
  }

  console.log(`\n🐾 NEKO MODE: ${nekoMode}`);
  console.log(`💖 KAWAII LEVEL: ${kawaiiLevel}`);

  if (p95 < 1000 && errorPercent < 1) {
    console.log(`\n✅ LOAD TEST PASSED, NYAA~! 🐾⚡`);
  } else {
    console.log(`\n⚠️  LOAD TEST NEEDS IMPROVEMENT, DESU~! 🐾`);
  }

  console.log('\n' + '═'.repeat(80) + '\n');

  // Return summary for JSON export
  return {
    'stdout': '\n',
    'summary.json': JSON.stringify(data, null, 2),
    'summary.txt': `K6 Load Test - ${new Date().toISOString()}\n` +
                   `Neko Mode: ${nekoMode}\n` +
                   `P95 Latency: ${p95.toFixed(2)}ms\n` +
                   `Error Rate: ${errorPercent.toFixed(2)}%\n`,
  };
}
