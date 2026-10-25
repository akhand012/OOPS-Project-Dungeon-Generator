# Multi-stage lightweight production Dockerfile
# Base image: Official lightweight Node.js LTS Alpine image
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Security: run as non-root user
USER node

# Copy dependencies and application assets
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node version.json ./
COPY --chown=node:node server.js ./
COPY --chown=node:node public ./public
COPY --chown=node:node Dungeon_generator.cpp ./
COPY --chown=node:node FINAL_DUNGEON_GENERATOR_PROJECT.cpp ./
COPY --chown=node:node delivery.cpp ./
COPY --chown=node:node README.md ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
