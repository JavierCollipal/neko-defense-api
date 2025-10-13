# 🐾⚡ NEKO DEFENSE API - Production-Ready GraphQL Backend ⚡🐾

**Enterprise-grade NestJS + GraphQL API with MongoDB Atlas**

Built with MAXIMUM SECURITY and NEKO POWER, nyaa~! 😸✨

---

## 🎯 Architecture Overview

### **Layer Separation (PUBLIC vs PRIVATE)**

```
┌─────────────────────────────────────────────────────┐
│  🌐 PUBLIC LAYER (React App)                        │
│  - Runs on port 3000 or 5000                        │
│  - Uses Apollo Client for GraphQL queries           │
│  - NO direct MongoDB access!                         │
│  - Authentication required for ALL requests          │
└──────────────────┬──────────────────────────────────┘
                   │ JWT Token Required
                   │ GraphQL over HTTPS
┌──────────────────▼──────────────────────────────────┐
│  🔐 PRIVATE LAYER (NestJS API)                       │
│  - Runs on port 4000                                │
│  - GraphQL API with Apollo Server                   │
│  - JWT authentication & authorization                │
│  - Rate limiting & security middleware               │
│  - ONLY wakibaka can access! 🛡️                     │
└──────────────────┬──────────────────────────────────┘
                   │ Secure Connection
                   │ MongoDB Driver
┌──────────────────▼──────────────────────────────────┐
│  🗄️ DATABASE LAYER (MongoDB Atlas)                  │
│  - Connection string secured in environment          │
│  - NO public access                                  │
│  - Collections: threat_actors, dina_perpetrators     │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Features

✅ **GraphQL API** - Modern query language with type safety
✅ **JWT Authentication** - Secure token-based auth
✅ **Rate Limiting** - DDoS protection (100 req/min)
✅ **Helmet Security** - HTTP security headers
✅ **CORS Protection** - Only allow specified origins
✅ **MongoDB Integration** - Mongoose ODM with schemas
✅ **TypeScript** - Full type safety
✅ **Environment Configuration** - Secure credentials management
✅ **Input Validation** - class-validator for DTOs

---

## 📦 Installation

### **1. Install Dependencies**

```bash
cd ~/neko-defense-api
npm install
```

### **2. Configure Environment**

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
nano .env  # Edit with your credentials
```

**CRITICAL**: Update these values in `.env`:

```env
# MongoDB Atlas (KEEP SECRET!)
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/
MONGODB_DATABASE=neko-defense-system

# JWT Secret (Generate strong random key!)
JWT_SECRET=your-super-secret-jwt-key-CHANGE-THIS
JWT_EXPIRATION=7d

# Admin Credentials (CHANGE IMMEDIATELY!)
ADMIN_USERNAME=wakibaka
ADMIN_PASSWORD=your-strong-password-here

# CORS (Add your frontend URL)
CORS_ORIGIN=http://localhost:3000,http://localhost:5000
```

### **3. Build & Run**

```bash
# Development mode (with auto-reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

---

## 🎮 GraphQL API Usage

### **Access GraphQL Playground**

Open in browser (development only):
```
http://localhost:4000/graphql
```

### **Authentication Flow**

#### **1. Login to get JWT token**

```graphql
mutation Login {
  login(input: {
    username: "wakibaka"
    password: "your-password"
  }) {
    access_token
    user {
      username
      role
    }
  }
}
```

**Response:**
```json
{
  "data": {
    "login": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "username": "wakibaka",
        "role": "admin"
      }
    }
  }
}
```

#### **2. Use token for authenticated requests**

Add to HTTP Headers:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Available GraphQL Queries

### **Threat Actors**

```graphql
# Get threat counts by category
query ThreatCounts {
  threatCounts {
    all
    predators
    pedophiles
    dina_network
    ransomware
    state_sponsored
    crypto_crime
  }
}

# Get threat actors by category
query ThreatActors($category: String!) {
  threatActors(category: $category) {
    actor_id
    name
    description
    type
    category
    threat_level
    rank
  }
}

# Get specific threat actor
query ThreatActor($actorId: String!) {
  threatActor(actorId: $actorId) {
    actor_id
    name
    description
    techniques
    iocs
    metadata
  }
}
```

### **DINA Documentation**

```graphql
# Get DINA statistics
query DinaStats {
  dinaStats {
    total_documents
    perpetrators {
      total
      convicted
      unprosecuted
      total_known_agents
    }
    victims_estimated
    disappeared
    executed
    last_updated
  }
}

# Get all DINA perpetrators
query DinaPerpetrators {
  dinaPerpetrators {
    id
    fullName
    role
    organization
    legalStatus {
      convicted
      status
    }
    crimesAccused
  }
}
```

---

## 🔐 Security Features

### **1. JWT Authentication**
- All GraphQL queries (except `login`) require JWT token
- Tokens expire after 7 days (configurable)
- Admin-only access

### **2. Rate Limiting**
- 100 requests per minute per IP
- Protects against DDoS attacks

### **3. Helmet Security**
- HTTP headers protection
- XSS prevention
- Content Security Policy

### **4. CORS Protection**
- Only specified origins allowed
- Credentials support for cookies

### **5. Input Validation**
- All inputs validated with class-validator
- SQL/NoSQL injection prevention
- Whitelist-based validation

---

## 🏗️ Project Structure

```
neko-defense-api/
├── src/
│   ├── main.ts                      # Entry point
│   ├── app.module.ts                # Root module
│   ├── auth/                        # Authentication
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── auth.resolver.ts
│   │   ├── dto/                     # Data Transfer Objects
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   ├── common/                      # Shared code
│   │   ├── guards/
│   │   │   └── gql-auth.guard.ts
│   │   └── decorators/
│   │       ├── current-user.decorator.ts
│   │       └── roles.decorator.ts
│   ├── database/                    # MongoDB schemas
│   │   └── schemas/
│   │       ├── threat-actor.schema.ts
│   │       └── dina-perpetrator.schema.ts
│   ├── threat-actors/               # Threat Actors module
│   │   ├── threat-actors.module.ts
│   │   ├── threat-actors.service.ts
│   │   ├── threat-actors.resolver.ts
│   │   └── dto/
│   │       └── threat-actor.type.ts
│   └── dina/                        # DINA module
│       ├── dina.module.ts
│       ├── dina.service.ts
│       ├── dina.resolver.ts
│       └── dto/
│           └── dina.type.ts
├── .env                             # Environment variables (NEVER COMMIT!)
├── .env.example                     # Environment template
├── tsconfig.json                    # TypeScript config
├── nest-cli.json                    # NestJS config
└── package.json                     # Dependencies
```

---

## 🌐 React App Integration Guide

### **Install Apollo Client in React App**

```bash
cd ~/neko-defense-dashboard
npm install @apollo/client graphql
```

### **Create Apollo Client Setup**

Create `src/apollo/client.js`:

```javascript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// HTTP connection to GraphQL API
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

// Add auth token to requests
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('neko_auth_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

### **Wrap App with ApolloProvider**

Update `src/index.js`:

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './apollo/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
```

### **Example: Login Component**

```javascript
import { gql, useMutation } from '@apollo/client';

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      access_token
      user {
        username
        role
      }
    }
  }
`;

function LoginComponent() {
  const [login, { data, loading, error }] = useMutation(LOGIN_MUTATION);

  const handleLogin = async () => {
    try {
      const result = await login({
        variables: {
          username: 'wakibaka',
          password: 'your-password',
        },
      });

      // Save token to localStorage
      localStorage.setItem('neko_auth_token', result.data.login.access_token);
      console.log('✅ Login successful, nyaa~!');
    } catch (err) {
      console.error('❌ Login failed:', err);
    }
  };

  return (
    <button onClick={handleLogin} disabled={loading}>
      {loading ? 'Logging in...' : '🔐 Login'}
    </button>
  );
}
```

### **Example: Query Threat Actors**

```javascript
import { gql, useQuery } from '@apollo/client';

const GET_THREAT_ACTORS = gql`
  query ThreatActors($category: String!) {
    threatActors(category: $category) {
      actor_id
      name
      description
      threat_level
    }
  }
`;

function ThreatActorsList() {
  const { data, loading, error } = useQuery(GET_THREAT_ACTORS, {
    variables: { category: 'all' },
  });

  if (loading) return <div>Loading threat actors, nyaa~...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>🎯 Threat Actors</h2>
      {data.threatActors.map((actor) => (
        <div key={actor.actor_id}>
          <h3>{actor.name}</h3>
          <p>{actor.description}</p>
          <p>Threat Level: {actor.threat_level}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🚀 Production Deployment

### **1. Environment Setup**

```bash
# Set production environment
export NODE_ENV=production

# Update CORS_ORIGIN to production domain
CORS_ORIGIN=https://your-domain.com
```

### **2. Security Checklist**

- [ ] Change `JWT_SECRET` to strong random key
- [ ] Change `ADMIN_PASSWORD` to strong password
- [ ] Update `CORS_ORIGIN` to production domain
- [ ] Enable HTTPS (use nginx/apache reverse proxy)
- [ ] Set up firewall (block direct MongoDB access)
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Set up rate limiting (adjust for production)
- [ ] Disable GraphQL Playground in production
- [ ] Set up monitoring (logs, errors)
- [ ] Set up backups for MongoDB

### **3. Run in Production**

```bash
npm run build
npm run start:prod
```

### **4. Process Manager (PM2)**

```bash
npm install -g pm2

# Start with PM2
pm2 start dist/main.js --name neko-defense-api

# Monitor
pm2 logs neko-defense-api
pm2 status

# Auto-restart on system reboot
pm2 startup
pm2 save
```

---

## 🧪 Testing the API

### **Health Check**

```bash
curl http://localhost:4000/graphql
# Should return GraphQL Playground (development) or error (production)
```

### **Login Test**

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { login(input: {username: \"wakibaka\", password: \"your-password\"}) { access_token user { username } } }"}'
```

### **Authenticated Query Test**

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{"query":"query { threatCounts { all predators } }"}'
```

---

## 🐛 Troubleshooting

### **Build Errors**

```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build
```

### **MongoDB Connection Failed**

- Check `MONGODB_URI` in `.env`
- Verify IP whitelist in MongoDB Atlas
- Check network connectivity

### **JWT Token Expired**

- Login again to get new token
- Adjust `JWT_EXPIRATION` if needed

### **CORS Errors**

- Verify `CORS_ORIGIN` includes your React app URL
- Check if frontend is sending credentials

---

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [GraphQL Documentation](https://graphql.org/)
- [Apollo Client Docs](https://www.apollographql.com/docs/react/)
- [MongoDB Mongoose](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)

---

## 🐾 NEKO POWER ACTIVATED! ✨

**Status**: ✅ PRODUCTION READY
**Security Level**: 🛡️ FORTRESS MODE
**Kawaii Level**: 💖💖💖 MAXIMUM

*purrs in architectural excellence* 😻

**Ready to deploy, nyaa~!** 🚀✨

---

**© 2025 NEKO DEFENSE SYSTEM - Built with LEGENDARY POWER! 🐾⚡**
