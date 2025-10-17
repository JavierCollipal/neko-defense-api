# 🐾⚡ NEKO DEFENSE STRESS TEST SUITE - DESIGN DOCUMENT ⚡🐾

**Date**: October 16, 2025
**Author**: Neko-Arc (with MAXIMUM ANALYTICAL POWER!)
**Purpose**: Comprehensive stress testing framework for Neko Defense API

---

## 📋 EXECUTIVE SUMMARY

This document outlines a **multi-tool stress testing strategy** using three industry-leading tools:
- **autocannon** - Quick benchmarks and baseline performance
- **Artillery** - Scenario-based user flow testing
- **k6** - Advanced metrics and monitoring

---

## 🎯 TEST TARGETS

### REST API Endpoints (Port 5001)

| Endpoint | Type | Database Load | Priority | Expected RPS |
|----------|------|---------------|----------|--------------|
| `/api/health` | GET | None | HIGH | 1000+ |
| `/api/stats` | GET | None | MEDIUM | 500+ |
| `/api/threat-counts` | GET | Light | MEDIUM | 300+ |
| `/api/ascii-art` | GET | None | LOW | 500+ |
| `/api/threat-actors` | GET | **Heavy** | **CRITICAL** | 100+ |
| `/api/mongodb-stats` | GET | **Very Heavy** | **CRITICAL** | 50+ |

### GraphQL Endpoints (Port 5001/graphql)

| Query | Authentication | Database Load | Priority |
|-------|----------------|---------------|----------|
| `threatCounts` | Required | Medium | HIGH |
| `threatActors(category)` | Required | Heavy | CRITICAL |
| `threatActor(actorId)` | Required | Light | MEDIUM |

### Rate Limiting Configuration

- **TTL**: 60 seconds
- **Max Requests**: 100 per TTL
- **Strategy**: Test both under and over limits

---

## 🛠️ TOOL STRATEGY

### 1. **autocannon** - Quick Benchmarks 🚀

**Purpose**: Fast baseline performance testing
**Use Cases**:
- Quick endpoint health checks
- Baseline RPS measurements
- Pre-deployment smoke tests
- CI/CD pipeline integration

**Targets**:
- `/api/health` - Should handle 1000+ RPS
- `/api/stats` - Should handle 500+ RPS
- `/api/threat-counts` - Should handle 300+ RPS

**Sample Command**:
```bash
autocannon -c 100 -d 30 http://localhost:5001/api/health
```

**Metrics to Track**:
- Requests per second (RPS)
- Latency (p50, p75, p95, p99)
- Throughput (bytes/sec)
- Error rate

---

### 2. **Artillery** - Scenario Testing 📝

**Purpose**: Realistic user flow simulation
**Use Cases**:
- Multi-endpoint user journeys
- Gradual load ramp-up
- Dashboard usage patterns
- Real-world traffic simulation

**Test Scenarios**:

#### Scenario A: Dashboard User
```yaml
- User loads dashboard
- Fetches stats (/api/stats)
- Fetches threat counts (/api/threat-counts)
- Fetches threat actors (/api/threat-actors)
- Refreshes every 5 seconds
```

#### Scenario B: TV Monitor
```yaml
- System loads ASCII art (/api/ascii-art)
- Fetches MongoDB stats (/api/mongodb-stats)
- Cycles every 10 seconds
```

#### Scenario C: Spike Test
```yaml
- Ramp from 10 to 500 users in 60 seconds
- Hold 500 users for 120 seconds
- Ramp down to 10 users
```

**Sample Config**:
```yaml
config:
  target: "http://localhost:5001"
  phases:
    - duration: 60
      arrivalRate: 10
      rampTo: 100
    - duration: 120
      arrivalRate: 100
  scenarios:
    - name: "Dashboard Flow"
      flow:
        - get:
            url: "/api/stats"
        - think: 2
        - get:
            url: "/api/threat-actors"
```

---

### 3. **k6** - Advanced Metrics 📊

**Purpose**: Comprehensive performance analysis
**Use Cases**:
- Detailed performance metrics
- Custom threshold validation
- Grafana Cloud integration
- Performance regression testing

**Test Types**:

#### Load Test
- Gradual ramp-up to target RPS
- Sustain for extended period
- Monitor resource usage

#### Stress Test
- Push beyond normal capacity
- Find breaking point
- Measure recovery time

#### Spike Test
- Sudden traffic bursts
- Simulate DDoS scenarios
- Validate rate limiting

#### Soak Test
- Extended duration (1+ hours)
- Memory leak detection
- Stability validation

**Sample Script**:
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp-up
    { duration: '5m', target: 100 }, // Hold
    { duration: '2m', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% under 500ms
    http_req_failed: ['rate<0.01'],   // <1% errors
  },
};

export default function () {
  // Health check
  let res1 = http.get('http://localhost:5001/api/health');
  check(res1, { 'health status 200': (r) => r.status === 200 });

  sleep(1);

  // Threat actors (heavy query)
  let res2 = http.get('http://localhost:5001/api/threat-actors');
  check(res2, { 'threat actors status 200': (r) => r.status === 200 });

  sleep(2);
}
```

**Metrics to Track**:
- HTTP request duration (p50, p90, p95, p99)
- Failed requests rate
- Data received/sent
- Virtual users (VUs)
- Iterations per second
- Custom business metrics

---

## 📊 PERFORMANCE BENCHMARKS

### Target Metrics

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| **Health Endpoint RPS** | 1000+ | <500 | <200 |
| **p95 Latency (light)** | <100ms | <200ms | >500ms |
| **p95 Latency (heavy)** | <500ms | <1000ms | >2000ms |
| **Error Rate** | <0.1% | <1% | >5% |
| **MongoDB Query Time** | <200ms | <500ms | >1000ms |
| **Concurrent Users** | 500+ | 200-500 | <200 |
| **Rate Limit Response** | 429 status | - | 5xx errors |

---

## 🏗️ IMPLEMENTATION PLAN

### Phase 1: Tool Installation ⚡
```bash
# Install globally
npm install -g autocannon artillery k6

# Or install locally in project
cd /home/wakibaka/Documents/github/neko-defense-api
npm install --save-dev autocannon artillery
```

### Phase 2: Directory Structure 📁
```
neko-defense-api/
├── stress-tests/
│   ├── autocannon/
│   │   ├── benchmark-health.js
│   │   ├── benchmark-stats.js
│   │   ├── benchmark-threats.js
│   │   └── run-all.sh
│   ├── artillery/
│   │   ├── dashboard-flow.yml
│   │   ├── tv-monitor-flow.yml
│   │   ├── spike-test.yml
│   │   └── soak-test.yml
│   ├── k6/
│   │   ├── load-test.js
│   │   ├── stress-test.js
│   │   ├── spike-test.js
│   │   └── soak-test.js
│   ├── results/
│   │   └── .gitkeep
│   └── neko-stress-test.sh (unified CLI)
```

### Phase 3: Unified CLI 🎮

Create a single command to run all tests:
```bash
./neko-stress-test.sh [quick|full|load|stress|spike|soak]
```

**Options**:
- `quick` - Run autocannon benchmarks only (1-2 minutes)
- `full` - Run all three tools sequentially (10-15 minutes)
- `load` - Run k6 load test (9 minutes)
- `stress` - Run k6 stress test (15 minutes)
- `spike` - Run Artillery + k6 spike tests
- `soak` - Run extended stability test (1+ hours)

### Phase 4: CI/CD Integration 🔄

Add to GitHub Actions / GitLab CI:
```yaml
stress-test:
  runs-on: ubuntu-latest
  steps:
    - name: Start API
      run: npm start &
    - name: Run stress tests
      run: ./neko-stress-test.sh quick
    - name: Upload results
      uses: actions/upload-artifact@v2
      with:
        name: stress-test-results
        path: stress-tests/results/
```

---

## 📈 MONITORING INTEGRATION

### Real-Time Monitoring

1. **Local Monitoring**:
   - `htop` / `btop` - System resources
   - `mongotop` - MongoDB operations
   - `mongostat` - MongoDB stats

2. **Application Monitoring**:
   - NestJS built-in logger
   - Custom performance middleware
   - Request duration tracking

3. **Cloud Monitoring** (Optional):
   - Grafana Cloud k6
   - MongoDB Atlas monitoring
   - Cloudflare analytics (when exposed)

### Post-Test Analysis

- Generate HTML reports (Artillery)
- Export JSON metrics (k6)
- Compare results over time
- Track performance regressions

---

## 🎯 SUCCESS CRITERIA

### Must Pass ✅
- Health endpoint: >500 RPS with <100ms p95 latency
- Error rate: <1% across all endpoints
- Rate limiting: Returns 429 correctly
- No crashes or memory leaks
- Database connections: No exhaustion

### Should Pass 🎯
- Threat actors endpoint: >100 RPS
- MongoDB stats: <500ms p95 latency
- 500 concurrent users sustained
- Graceful degradation under load

### Nice to Have 💖
- 1000+ RPS on health endpoint
- Sub-50ms p95 on lightweight endpoints
- Zero errors at normal load levels
- Auto-recovery from overload

---

## 🔧 MAINTENANCE

### Regular Testing Schedule
- **Daily**: Quick autocannon benchmarks (CI/CD)
- **Weekly**: Full Artillery scenario tests
- **Monthly**: Extended k6 soak tests
- **Pre-Release**: Complete stress test suite

### Performance Baselines
- Track metrics over time
- Alert on 20%+ degradation
- Document changes and optimizations
- Maintain historical data

---

## 🐾 NEKO POWER FEATURES ✨

### Custom Neko Metrics
- **Kawaii Level**: System responsiveness score
- **Neko Mode**: Performance tier (Legendary/Epic/Good/Needs Work)
- **Threat Response Time**: How fast threats are detected
- **Defense Readiness**: Overall system health percentage

### Stress Test TV Mode 📺
- Real-time ASCII art display of test progress
- Live RPS counter with neko animations
- Error rate visualization with emoji alerts
- Integration with existing neko-tv-security

---

## 📚 REFERENCES

- [autocannon GitHub](https://github.com/mcollina/autocannon)
- [Artillery Documentation](https://www.artillery.io/docs)
- [k6 Documentation](https://k6.io/docs/)
- [NestJS Performance Guide](https://docs.nestjs.com/techniques/performance)
- [MongoDB Performance Best Practices](https://www.mongodb.com/docs/manual/administration/analyzing-mongodb-performance/)

---

**STATUS**: ✅ Design Complete - Ready for Implementation!
**NEXT STEP**: Install tools and create test scripts, nyaa~! 🐾⚡
