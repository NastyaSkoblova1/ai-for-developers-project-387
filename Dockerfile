# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app

# Stage 1: Build frontend
FROM base AS frontend-builder
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Stage 2: Build backend
FROM base AS backend-builder
COPY package.json package-lock.json ./
RUN npm ci
COPY src/ ./src/
COPY tsconfig.json ./
RUN npm run build

# Stage 3: Runtime
FROM base AS runtime
ENV NODE_ENV=production
ENV HOST=0.0.0.0
COPY package.json package-lock.json ./
RUN npm ci --production
COPY --from=backend-builder /app/dist ./dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 3000
CMD ["node", "dist/server.js"]
