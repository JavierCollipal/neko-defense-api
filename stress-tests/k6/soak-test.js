// 🐾⚡ K6 SOAK TEST - Extended Endurance (1 Hour) ⚡🐾
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics for long-running stability
const memoryLeakIndicator = new Trend('response_time_trend');
const stabilityErrors = new Rate('stability_errors');

// Soak test configuration - MARATHON MODE!
export const options = {
  stages: [
    { duration: '2m', target: 20 },     // Ramp-up
    { duration: '56m', target: 20 },    // Hold for 56 minutes (total 1 hour)
    { duration: '2m', target: 0 },      // Ramp-down
  ],

  thresholds: {
    'http_req_failed': ['rate<0.02'],      // < 2% errors
    'http_req_duration': ['p(95)<1500'],   // Stable latency
    'stability_errors': ['rate<0.05'],     // < 5% stability errors
  },
};

const BASE_URL = 'http://localhost:5001';

export function setup() {
  console.log('🐾⚡ NEKO K6 SOAK TEST - 1 HOUR ENDURANCE, NYAA~! ⚡🐾\n');
  console.log('⏰ This is a marathon test!');
  console.log('   Duration: 1 hour');
  console.log('   Purpose: Detect memory leaks and stability issues');
  console.log('   Users: 20 concurrent (sustained)\n');
  console.log('💡 TIP: Monitor system resources (RAM, CPU, DB connections)\n');
  console.log('   during this test, desu~!\n');

  return {
    startTime: Date.now(),
    checkpoints: [],
  };
}

export default function(data) {
  // Realistic user behavior - cycles through different endpoints

  // 1. Health check
  const healthRes = http.get(`${BASE_URL}/api/health`);
  check(healthRes, {
    'health is 200': (r) => r.status === 200,
  });
  memoryLeakIndicator.add(healthRes.timings.duration);
  sleep(5);

  // 2. Stats
  const statsRes = http.get(`${BASE_URL}/api/stats`);
  check(statsRes, {
    'stats is 200': (r) => r.status === 200,
  });
  memoryLeakIndicator.add(statsRes.timings.duration);
  sleep(10);

  // 3. Threat counts
  const countsRes = http.get(`${BASE_URL}/api/threat-counts`);
  check(countsRes, {
    'counts is 200': (r) => r.status === 200,
  });
  memoryLeakIndicator.add(countsRes.timings.duration);
  sleep(15);

  // 4. Occasionally hit heavy endpoint (20% of time)
  if (Math.random() > 0.8) {
    const threatsRes = http.get(`${BASE_URL}/api/threat-actors`);
    const success = check(threatsRes, {
      'threats is 200': (r) => r.status === 200,
      'threats under 2s': (r) => r.timings.duration < 2000,
    });
    stabilityErrors.add(!success);
    memoryLeakIndicator.add(threatsRes.timings.duration);
    sleep(20);
  }

  // 5. Occasionally check MongoDB stats (10% of time)
  if (Math.random() > 0.9) {
    const mongoRes = http.get(`${BASE_URL}/api/mongodb-stats`);
    check(mongoRes, {
      'mongo stats available': (r) => r.status === 200,
    });
    memoryLeakIndicator.add(mongoRes.timings.duration);
    sleep(25);
  }

  sleep(30);  // Long pause between cycles (realistic user)
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000 / 60;
  console.log(`\n🐾⚡ SOAK TEST COMPLETE! Duration: ${duration.toFixed(1)} minutes, NYAA~! ⚡🐾\n`);
}

export function handleSummary(data) {
  console.log('\n' + '═'.repeat(80));
  console.log('⏰ K6 SOAK TEST SUMMARY - ENDURANCE ANALYSIS');
  console.log('═'.repeat(80) + '\n');

  const duration = data.metrics.http_req_duration;
  const failed = data.metrics.http_req_failed;
  const iterations = data.metrics.iterations;

  console.log(`⚡ Total Requests: ${data.metrics.http_reqs.values.count}`);
  console.log(`🔄 Total Iterations: ${iterations.values.count}`);
  console.log(`⏱️  Avg Response: ${duration.values.avg.toFixed(2)}ms`);
  console.log(`⏱️  P95 Response: ${duration.values['p(95)'].toFixed(2)}ms`);
  console.log(`⏱️  Max Response: ${duration.values.max.toFixed(2)}ms`);
  console.log(`❌ Failed Rate: ${(failed.values.rate * 100).toFixed(2)}%`);

  // Memory leak detection heuristic
  const avgResponseTime = duration.values.avg;
  const maxResponseTime = duration.values.max;
  const responseVariance = maxResponseTime / avgResponseTime;

  console.log(`\n🔍 STABILITY ANALYSIS:`);

  if (failed.values.rate < 0.01 && avgResponseTime < 500) {
    console.log(`   ✅ EXCELLENT - System rock solid for 1 hour, nyaa~! ⚡✨`);
    console.log(`   💖 No signs of memory leaks or degradation!`);
  } else if (failed.values.rate < 0.05 && avgResponseTime < 1000) {
    console.log(`   ✅ GOOD - System stable throughout test`);
    console.log(`   💡 Minor performance variations within acceptable range`);
  } else {
    console.log(`   ⚠️  NEEDS INVESTIGATION - Performance degradation detected`);
    console.log(`   💡 Potential issues:`);
    console.log(`      - Memory leak (check RAM usage over time)`);
    console.log(`      - Connection pool exhaustion (check DB connections)`);
    console.log(`      - Resource accumulation (check file handles, etc.)`);
  }

  if (responseVariance > 10) {
    console.log(`\n   🚨 HIGH RESPONSE VARIANCE DETECTED!`);
    console.log(`      Max/Avg ratio: ${responseVariance.toFixed(2)}x`);
    console.log(`      This could indicate instability or memory pressure`);
  }

  console.log(`\n💡 RECOMMENDATIONS:`);
  console.log(`   - Review application logs for warnings`);
  console.log(`   - Check MongoDB connection pool metrics`);
  console.log(`   - Monitor system resources (RAM, CPU, disk I/O)`);
  console.log(`   - Verify no slow memory leaks over time`);

  console.log('\n' + '═'.repeat(80) + '\n');

  return {
    'stdout': '\n',
    'soak-summary.json': JSON.stringify(data, null, 2),
  };
}
