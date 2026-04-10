# Multi-stage build for Calendar Booking MVP
# Stage 1: Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Copy all package.json files for workspace resolution
COPY package*.json turbo.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
COPY packages/api-spec/package*.json ./packages/api-spec/
COPY packages/contracts/package*.json ./packages/contracts/
COPY packages/date-utils/package*.json ./packages/date-utils/

# Install dependencies
RUN npm ci

# Stage 2: Build API Spec (TypeSpec -> OpenAPI)
FROM node:20-alpine AS spec-builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./

# Copy source files
COPY packages/api-spec ./packages/api-spec
COPY turbo.json ./

# Generate OpenAPI from TypeSpec
RUN npx turbo run tsp:compile

# Stage 3: Build all applications
FROM node:20-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY --from=spec-builder /app/packages/contracts ./packages/contracts

# Copy all source code
COPY apps/api ./apps/api
COPY apps/web ./apps/web
COPY packages/date-utils ./packages/date-utils
COPY packages/contracts ./packages/contracts
COPY turbo.json ./

# Install tsx for seed script
RUN npm install -g tsx

# Build date-utils first (shared package)
WORKDIR /app/packages/date-utils
RUN npm run build

# Build API
WORKDIR /app/apps/api
RUN npm run build
RUN npx prisma generate

# Build Web frontend
WORKDIR /app/apps/web
# Copy themes (postinstall doesn't run in Docker build)
RUN npm run copy-themes
RUN npm run build

# Stage 4: Production image
FROM nginx:alpine AS production

# Install Node.js for backend in production image
RUN apk add --no-cache nodejs npm

WORKDIR /app

# Copy backend files (selective copy for smaller image)
COPY --from=builder /app/apps/api/dist ./api/dist
COPY --from=builder /app/apps/api/prisma ./api/prisma
COPY --from=builder /app/apps/api/package*.json ./api/
COPY --from=builder /app/node_modules ./api/node_modules
COPY --from=builder /app/packages ./packages

# Copy frontend build to nginx html
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy themes from public folder
COPY --from=builder /app/apps/web/public/themes /usr/share/nginx/html/themes

# Create data directory for SQLite with proper permissions
RUN mkdir -p /app/api/data && chmod 777 /app/api/data

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy startup script
COPY docker/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_URL="file:./data/prod.db"

# Expose ports
EXPOSE 80

# Start both backend and nginx
CMD ["/app/start.sh"]
