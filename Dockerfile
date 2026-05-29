# Multi-stage build for backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci --only=production

COPY server/ ./

# Multi-stage build for frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY --from=backend-builder /app/server/node_modules ./server/node_modules
COPY --from=backend-builder /app/server/package*.json ./server/

# Copy backend source
COPY server/ ./server/

# Copy frontend build
COPY --from=frontend-builder /app/client/dist ./client/dist

# Expose port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "server/server.js"]
