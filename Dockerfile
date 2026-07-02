# SproutDrive production image (Belmo, Render, Railway, etc.)
# Avoids BuildKit cache-mount EBUSY on node_modules/.cache

FROM node:20-alpine AS builder

WORKDIR /app

ENV npm_config_cache=/tmp/npm-cache
ENV XDG_CACHE_HOME=/tmp/xdg-cache
ENV VITE_CACHE_DIR=/tmp/vite-cache

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV npm_config_cache=/tmp/npm-cache

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["npm", "start"]
