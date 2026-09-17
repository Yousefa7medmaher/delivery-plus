# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configs
COPY package*.json ./
COPY tsconfig.base.json ./

# Copy shared library
COPY shared ./shared

# Copy all services
COPY services ./services

# Install dependencies (workspaces)
RUN --mount=type=cache,target=/root/.npm \
		npm ci --prefer-offline --no-audit --no-fund \
			--fetch-retries=5 \
			--fetch-retry-factor=2 \
			--fetch-retry-mintimeout=1000 \
			--fetch-retry-maxtimeout=120000

# Build shared library
RUN npm run build --workspace=@food-delivery/shared

# Accept service to build as argument
ARG SERVICE_NAME

# Build target service
RUN npm run build --workspace=@food-delivery/${SERVICE_NAME}

FROM node:20-alpine AS production

WORKDIR /app
ARG SERVICE_NAME
ENV NODE_ENV=production
ENV SERVICE_NAME=${SERVICE_NAME}

COPY package*.json ./
COPY shared/package.json ./shared/
COPY services/${SERVICE_NAME}/package.json ./services/${SERVICE_NAME}/

# Install only production dependencies
RUN --mount=type=cache,target=/root/.npm \
		npm ci --omit=dev --prefer-offline --no-audit --no-fund \
			--fetch-retries=5 \
			--fetch-retry-factor=2 \
			--fetch-retry-mintimeout=1000 \
			--fetch-retry-maxtimeout=120000

# Copy built code
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/services/${SERVICE_NAME}/dist ./services/${SERVICE_NAME}/dist

CMD ["sh", "-c", "node services/${SERVICE_NAME}/dist/main.js"]
