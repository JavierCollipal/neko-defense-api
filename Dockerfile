# 🐾✨ NEKO DEFENSE API - NestJS Production Build ✨🐾
# Secure GraphQL backend with MongoDB integration, nyaa~!

# ═══════════════════════════════════════════════════════════
# STAGE 1: BUILD STAGE
# ═══════════════════════════════════════════════════════════
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency caching
COPY package*.json ./
COPY tsconfig*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci --legacy-peer-deps && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the NestJS application
RUN npm run build

# ═══════════════════════════════════════════════════════════
# STAGE 2: PRODUCTION STAGE
# ═══════════════════════════════════════════════════════════
FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nekousergroup && \
    adduser -S nekouser -u 1001 -G nekousergroup

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --only=production --legacy-peer-deps && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Change ownership to non-root user
RUN chown -R nekouser:nekousergroup /app

# Switch to non-root user
USER nekouser

# Expose port (NestJS default: 3000, but we'll use 5000)
EXPOSE 5000

# Environment variables (can be overridden by docker-compose)
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the NestJS application
CMD ["node", "dist/main"]
