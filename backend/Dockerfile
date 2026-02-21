# Stage 1: Build TypeScript
FROM node:22-alpine AS builder

# Native build tools for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Stage 2: Runtime (lean image)
FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
# Reuse pre-compiled native modules from builder (avoids recompiling better-sqlite3)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/data

EXPOSE 3001
CMD ["node", "dist/index.js"]
