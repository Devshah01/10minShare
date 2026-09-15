# Multi-stage Dockerfile for Node.js Express API on GCP Cloud Run
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY src ./src

EXPOSE 8080
USER node

CMD ["node", "src/server.js"]
