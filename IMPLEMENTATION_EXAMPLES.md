# NEKO DEFENSE API - IMPLEMENTATION EXAMPLES
## Code Examples for Worldwide Scalability Improvements

---

## 1. CLUSTERING IMPLEMENTATION (Week 1)

### Option A: PM2 Cluster Mode (Easiest)

**Installation:**
```bash
npm install -g pm2
```

**Ecosystem File** (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [
    {
      name: 'neko-defense-api',
      script: './dist/main.js',
      instances: 'max',  // Use all CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      watch: false,
      max_memory_restart: '1G',
      kill_timeout: 5000,
    },
  ],
};
```

**Deployment:**
```bash
pm2 start ecosystem.config.js
pm2 monit                    # Monitor
pm2 logs neko-defense-api    # View logs
pm2 save                     # Persist on reboot
pm2 startup                  # Auto-restart on system boot
```

**Expected Result:** 4-8x throughput improvement on 4-core machine

---

### Option B: Node.js Cluster Module (Native)

**Modified `src/main.ts`:**
```typescript
import { NestFactory } from '@nestjs/core';
import { cluster } from 'cluster';
import * as os from 'os';
import { AppModule } from './app.module';

const numCPUs = os.cpus().length;

async function bootstrap() {
  if (cluster.isPrimary) {
    console.log(`🐾 Master process ${process.pid} starting...`);
    
    // Fork workers for each CPU core
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    // Handle worker death
    cluster.on('exit', (worker, code, signal) => {
      console.log(`🐾 Worker ${worker.process.pid} died (${signal || code}). Restarting...`);
      cluster.fork();
    });

    console.log(`✅ Cluster with ${numCPUs} workers created!`);
  } else {
    // Worker process
    const app = await NestFactory.create(AppModule);
    
    // ... existing security middleware ...
    
    const port = process.env.PORT || 4000;
    await app.listen(port);
    console.log(`✅ Worker ${process.pid} listening on port ${port}`);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start:', error);
  process.exit(1);
});
```

---

## 2. REDIS-BASED DISTRIBUTED RATE LIMITING (Week 1-2)

### Installation

```bash
npm install redis @nestjs/throttler ioredis
docker run -d -p 6379:6379 redis:7-alpine  # Local Redis for testing
```

### Redis Throttler Module

**`src/rate-limiting/redis-throttler.module.ts`:**
```typescript
import { Module } from '@nestjs/common';
import { RedisThrottlerService } from './redis-throttler.service';
import { RedisModule } from '@nestjs-modules/redis';

@Module({
  imports: [
    RedisModule.forRoot({
      config: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        db: 0,
      },
    }),
  ],
  providers: [RedisThrottlerService],
  exports: [RedisThrottlerService],
})
export class RedisThrottlerModule {}
```

**`src/rate-limiting/redis-throttler.service.ts`:**
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/redis';
import { Redis } from 'ioredis';

interface RateLimitConfig {
  ttl: number;        // Window in seconds
  limit: number;      // Max requests in window
}

@Injectable()
export class RedisThrottlerService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async checkRateLimit(
    key: string,
    config: RateLimitConfig,
  ): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    const now = Date.now();
    const windowStart = now - (config.ttl * 1000);
    
    // Remove old entries
    await this.redis.zremrangebyscore(key, 0, windowStart);
    
    // Count current requests
    const current = await this.redis.zcard(key);
    const allowed = current < config.limit;
    
    if (allowed) {
      // Add current request
      await this.redis.zadd(key, now, `${now}-${Math.random()}`);
      // Set expiration
      await this.redis.expire(key, config.ttl);
    }
    
    // Calculate reset time
    const oldest = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
    const resetIn = oldest.length > 1 
      ? Math.ceil((parseInt(oldest[1]) + (config.ttl * 1000) - now) / 1000)
      : config.ttl;

    return {
      allowed,
      remaining: Math.max(0, config.limit - current - 1),
      resetIn: Math.max(1, resetIn),
    };
  }
}
```

### Update app.module.ts

```typescript
import { RedisThrottlerModule } from './rate-limiting/redis-throttler.module';

@Module({
  imports: [
    // ... existing imports ...
    RedisThrottlerModule,
  ],
  // ...
})
export class AppModule {}
```

### Update main.ts

```typescript
import { RedisThrottlerService } from './rate-limiting/redis-throttler.service';

// In bootstrap():
const redisThrottler = app.get(RedisThrottlerService);

// Replace global throttler guard
app.useGlobalGuards(
  new ThrottleGuard(redisThrottler, {
    ttl: parseInt(process.env.RATE_LIMIT_TTL) || 60,
    limit: parseInt(process.env.RATE_LIMIT_MAX) || 1000, // Increased to 1000
  }),
);
```

**Expected Result:** 10-100x more sustainable load, shared across all instances

---

## 3. RESPONSE CACHING WITH REDIS (Week 2-3)

### Installation

```bash
npm install @nestjs/cache-manager cache-manager cache-manager-redis-store
```

### Caching Module

**`src/caching/cache.module.ts`:**
```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      ttl: 300, // 5 minutes default
    }),
  ],
})
export class CacheModule {}
```

### GraphQL Query Caching

**`src/common/decorators/cacheable.decorator.ts`:**
```typescript
import { Resolver, Query, Args } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export function CacheableQuery(ttl: number = 300) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: any, ...args: any[]) {
      const cacheManager = this.cacheManager as Cache;
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;

      // Try to get from cache
      const cached = await cacheManager.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Call original method
      const result = await originalMethod.apply(this, args);

      // Store in cache
      await cacheManager.set(cacheKey, result, ttl * 1000);

      return result;
    };

    return descriptor;
  };
}
```

### Example Usage in Resolver

```typescript
@Resolver()
export class ThreatActorsResolver {
  constructor(
    private threatActorsService: ThreatActorsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Query('threatCounts')
  async getThreatCounts() {
    const cacheKey = 'threat_counts';
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const result = await this.threatActorsService.getCountsByCategory();
    await this.cacheManager.set(cacheKey, result, 300 * 1000); // 5 min
    
    return result;
  }

  @Query('threatActors')
  async getThreatActors(@Args('category') category: string) {
    const cacheKey = `threat_actors:${category}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const result = await this.threatActorsService.findByCategory(category);
    await this.cacheManager.set(cacheKey, result, 600 * 1000); // 10 min
    
    return result;
  }
}
```

**Expected Result:** 2-5x reduction in database queries

---

## 4. CIRCUIT BREAKER PATTERN (Week 3-4)

### Installation

```bash
npm install opossum @nestjs/cqrs
```

### Circuit Breaker Service

**`src/resilience/circuit-breaker.service.ts`:**
```typescript
import { Injectable, Logger } from '@nestjs/common';
import CircuitBreaker from 'opossum';

interface CircuitBreakerConfig {
  name: string;
  timeout: number;
  errorThresholdPercentage: number;
  resetTimeout: number;
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private breakers = new Map<string, CircuitBreaker>();

  createBreaker<T>(
    name: string,
    fn: () => Promise<T>,
    config?: Partial<CircuitBreakerConfig>,
  ): CircuitBreaker {
    if (this.breakers.has(name)) {
      return this.breakers.get(name);
    }

    const options = {
      timeout: config?.timeout || 30000,
      errorThresholdPercentage: config?.errorThresholdPercentage || 50,
      resetTimeout: config?.resetTimeout || 30000,
      name,
    };

    const breaker = new CircuitBreaker(fn, options);

    breaker.fallback(() => {
      this.logger.warn(`Circuit breaker ${name} fallback triggered`);
      return null;
    });

    breaker.on('open', () => {
      this.logger.error(`Circuit breaker ${name} is OPEN - service unavailable`);
    });

    breaker.on('halfOpen', () => {
      this.logger.warn(`Circuit breaker ${name} is HALF_OPEN - testing recovery`);
    });

    breaker.on('close', () => {
      this.logger.log(`Circuit breaker ${name} is CLOSED - service recovered`);
    });

    this.breakers.set(name, breaker);
    return breaker;
  }

  async execute<T>(
    name: string,
    fn: () => Promise<T>,
    config?: Partial<CircuitBreakerConfig>,
  ): Promise<T | null> {
    const breaker = this.createBreaker(name, fn, config);
    return breaker.fire();
  }

  getStatus(name: string) {
    const breaker = this.breakers.get(name);
    return breaker
      ? {
          name,
          state: breaker.opened ? 'OPEN' : 'CLOSED',
          stats: breaker.stats,
        }
      : null;
  }
}
```

### Usage in Service

```typescript
@Injectable()
export class ThreatActorsService {
  constructor(
    private threatActorsModel: Model<ThreatActor>,
    private circuitBreaker: CircuitBreakerService,
  ) {}

  async findByCategory(category: string) {
    return this.circuitBreaker.execute(
      'threat-actors-find',
      () => this.threatActorsModel.find({ category }).exec(),
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
      },
    );
  }

  async getCountsByCategory() {
    return this.circuitBreaker.execute(
      'threat-actors-counts',
      () => this.threatActorsModel.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]).exec(),
      { timeout: 10000 },
    );
  }
}
```

**Expected Result:** Graceful degradation when database is slow/down

---

## 5. LOAD BALANCER CONFIGURATION (Week 2)

### Nginx Reverse Proxy

**`nginx.conf`:**
```nginx
upstream neko_backend {
  least_conn;  # Load balancing strategy
  
  server localhost:4000 max_fails=3 fail_timeout=10s;
  server localhost:4001 max_fails=3 fail_timeout=10s;
  server localhost:4002 max_fails=3 fail_timeout=10s;
  server localhost:4003 max_fails=3 fail_timeout=10s;
  
  keepalive 32;
}

server {
  listen 80;
  server_name api.example.com;

  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name api.example.com;

  ssl_certificate /etc/ssl/certs/your-cert.pem;
  ssl_certificate_key /etc/ssl/private/your-key.pem;

  # Security headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;

  location / {
    proxy_pass http://neko_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # Buffering
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
  }

  # Health check endpoint
  location /health {
    access_log off;
    proxy_pass http://neko_backend;
  }
}
```

**Docker Compose for Local Testing:**
```yaml
version: '3.9'

services:
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis-data:/data

  api-1:
    build: .
    environment:
      PORT: 4000
      NODE_ENV: production
      REDIS_HOST: redis
    depends_on:
      - redis

  api-2:
    build: .
    environment:
      PORT: 4001
      NODE_ENV: production
      REDIS_HOST: redis
    depends_on:
      - redis

  api-3:
    build: .
    environment:
      PORT: 4002
      NODE_ENV: production
      REDIS_HOST: redis
    depends_on:
      - redis

  api-4:
    build: .
    environment:
      PORT: 4003
      NODE_ENV: production
      REDIS_HOST: redis
    depends_on:
      - redis

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - api-1
      - api-2
      - api-3
      - api-4

volumes:
  redis-data:
```

**Deploy with:**
```bash
docker-compose up -d
# Access via http://localhost (load balanced across 4 instances)
```

**Expected Result:** Request distribution across multiple instances, 4-8x capacity

---

## 6. KUBERNETES DEPLOYMENT (Week 5-6)

### Deployment Manifest

**`k8s/deployment.yaml`:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: neko-defense-api
  namespace: default
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: neko-defense-api
  template:
    metadata:
      labels:
        app: neko-defense-api
    spec:
      containers:
      - name: api
        image: your-registry/neko-defense-api:latest
        ports:
        - containerPort: 4000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "4000"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: neko-secrets
              key: mongodb-uri
        - name: REDIS_HOST
          value: redis-service
        - name: RATE_LIMIT_MAX
          value: "1000"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 4000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Service & Ingress

**`k8s/service.yaml`:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: neko-defense-api
spec:
  selector:
    app: neko-defense-api
  ports:
  - port: 80
    targetPort: 4000
  type: ClusterIP
```

**`k8s/ingress.yaml`:**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: neko-defense-api
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: neko-defense-api
            port:
              number: 80
  tls:
  - hosts:
    - api.example.com
    secretName: neko-tls
```

### Auto-Scaling

**`k8s/hpa.yaml`:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: neko-defense-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: neko-defense-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

**Deploy:**
```bash
kubectl apply -f k8s/
kubectl get pods -w  # Watch pods
kubectl logs -f deployment/neko-defense-api  # View logs
```

---

## 7. ENVIRONMENT VARIABLES UPDATE

### Updated `.env` for Production

```bash
# Server
NODE_ENV=production
PORT=4000

# Database
MONGODB_URI=mongodb+srv://pinochito1747:pinochito1747@free-cluster.svjei3w.mongodb.net/
MONGODB_DATABASE=neko-defense-system

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRATION=7d

# Rate Limiting (INCREASED for worldwide)
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=1000  # Changed from 100 to 1000

# Redis (NEW)
REDIS_HOST=redis-service  # Or localhost for local
REDIS_PORT=6379

# Cache Settings (NEW)
CACHE_TTL=300  # 5 minutes

# CORS (Production domains)
CORS_ORIGIN=https://dashboard.example.com,https://app.example.com

# Admin Credentials
ADMIN_USERNAME=wakibaka
ADMIN_PASSWORD=your-strong-password
```

---

## Performance Improvement Timeline

```
Week 1-2: Clustering + Redis Rate Limiting
├─ Throughput: 50-100 req/s → 200-800 req/s (4-8x)
├─ P95 Latency: Similar (1000ms)
└─ Cost: +$10-20/mo (Redis)

Week 3-4: Caching + Circuit Breaker
├─ Throughput: 200-800 req/s (maintained)
├─ P95 Latency: 1000ms → 200-500ms (2-5x improvement)
└─ DB Load: -70% from cache hits

Week 5-6: Kubernetes + Auto-scaling
├─ Throughput: Unlimited (scales with demand)
├─ P95 Latency: Maintained <500ms
└─ Cost: +$50-100/mo (k8s cluster)

Week 7-8: CDN + Multi-region
├─ Global Latency: -50% (CDN edge caching)
├─ Database Replicas: Multi-region failover
└─ Cost: +$20-50/mo (CDN + replicas)
```

---

## Testing Commands

```bash
# Load test baseline
npm run load:test

# After clustering
npm run spike:test

# Monitor everything
npm run stress:test

# Production validation
k6 run stress-tests/k6/load-test.js -u 1000 -d 5m
```

**Report Generated**: October 16, 2025
**Status**: Ready for implementation
