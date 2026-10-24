# ==============================================================================
# DYF Leather Atelier — Production Multi-Stage Dockerfile (FE-025)
# Stage 1: Build Frontend Assets with Node.js
# Stage 2: Serve Production Assets with Hardened Nginx Alpine
# ==============================================================================

# Stage 1: Builder
FROM node:24-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install clean production and development build dependencies
RUN npm ci

# Copy full source tree
COPY . .

# Build production bundles
RUN npm run build

# Stage 2: Production Server
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static output from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY deploy/nginx.conf /etc/nginx/nginx.conf

# Expose HTTP port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
