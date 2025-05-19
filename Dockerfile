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

# Copy only necessary files from builder stage - package.json and node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy all JavaScript files and other content
COPY --from=builder --chown=nodejs:nodejs /app/*.js ./
COPY --from=builder --chown=nodejs:nodejs /app/*.json ./

# Copy directories if they exist
# Instead of failing on missing directories, using the shell to conditionally copy
RUN mkdir -p /tmp/src-structure
COPY --from=builder /app /tmp/src-structure

# Set environment to production
ENV NODE_ENV=production

# Switch to non-root user
USER nodejs

# Expose the application port
EXPOSE 3002

# Start the application (adjust this to your main file)
CMD ["node", "index.js"]