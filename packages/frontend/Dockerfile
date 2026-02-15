# -------------------------
# Stage 1: Builder
# -------------------------
FROM node:24-alpine AS builder

WORKDIR /app

# Build arg for Vite
ARG VITE_API_URL=http://localhost:4004
ENV VITE_API_URL=$VITE_API_URL

# Copy root package files (workspace-aware)
COPY package*.json ./

# Copy all workspace packages
COPY packages ./packages

# Install dependencies (workspace supported)
RUN npm ci

# Build frontend only
RUN npm run build --workspace=@muminbook/frontend


# -------------------------
# Stage 2: Nginx Runner
# -------------------------
FROM nginx:1.25-alpine

# Copy custom nginx config
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
