# -------------------------
# Stage 1: Builder
# -------------------------
FROM node:24-alpine AS builder

WORKDIR /app

# Copy root package files (workspace-aware)
COPY package*.json ./

# Copy workspace packages
COPY packages ./packages

# Install dependencies with workspace support
RUN npm ci

# Build backend only
RUN npm run build --workspace=@muminbook/backend


# -------------------------
# Stage 2: Production Runner
# -------------------------
FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -S nodejs && adduser -S appuser -G nodejs

# Copy production node_modules
COPY --from=builder /app/node_modules ./node_modules

# Copy built backend
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/package.json ./package.json

# Copy JSON data folder
COPY --from=builder /app/packages/backend/json ./json

USER appuser

EXPOSE 4004

CMD ["node", "dist/index.js"]
