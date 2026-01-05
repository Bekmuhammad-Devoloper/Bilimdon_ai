# Bilimdon Backend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy prisma and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy all source files
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src/

# Build
RUN npm run build

# Verify build output
RUN ls -la dist/ && cat dist/main.js | head -5

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy prisma and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create uploads directory
RUN mkdir -p uploads/avatars uploads/attachments uploads/temp

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3001

# Start command
CMD ["node", "dist/main.js"]
