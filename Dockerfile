# Build stage
FROM node:18-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Production stage
FROM node:18-slim

# Set working directory
WORKDIR /app

# Create a non-root user for security
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

# Copy only necessary files from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/*.js ./
COPY --from=builder --chown=nodejs:nodejs /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/views ./views
COPY --from=builder --chown=nodejs:nodejs /app/routes ./routes
COPY --from=builder --chown=nodejs:nodejs /app/middleware ./middleware

# Set environment to production
ENV NODE_ENV=production

# Switch to non-root user
USER nodejs

# Expose the application port
EXPOSE 3002

# Start the application
CMD ["node", "app.js"]