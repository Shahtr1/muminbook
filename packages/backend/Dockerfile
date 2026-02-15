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

RUN addgroup -S nodejs && adduser -S appuser -G nodejs

# Copy node_modules (workspace symlinks exist here)
COPY --from=builder /app/node_modules ./node_modules

# Ensure packages directory exists
RUN mkdir -p packages

# Copy shared workspace (required for symlink resolution)
COPY --from=builder /app/packages/shared ./packages/shared

# Copy backend build output
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/package.json ./package.json

# Copy JSON data
COPY --from=builder /app/packages/backend/json ./json

USER appuser

EXPOSE 4004

CMD ["node", "dist/index.js"]
