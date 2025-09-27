# Backend Dockerfile for NestJS
FROM node:20-alpine

# Install pnpm and curl for health checks
RUN npm install -g pnpm && apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm db:generate

# Build the application
RUN pnpm build

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["pnpm", "start:prod"]
