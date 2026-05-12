# syntax=docker/dockerfile:1.7
#
# Build context: monorepo root.
#   docker build -f apps/api/Dockerfile -t huellita-api .
#
# Railway uses the dockerfilePath from apps/api/railway.json with the
# repo root as build context.

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate
WORKDIR /app

# ── deps: install full workspace deps (incl. dev) for the build stage ──
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

# ── build: compile @huellita/shared and @huellita/api ──
FROM deps AS build
COPY tsconfig.json ./
COPY packages/shared packages/shared
COPY apps/api/tsconfig.json apps/api/
COPY apps/api/src apps/api/src
RUN pnpm --filter @huellita/shared build \
 && pnpm --filter @huellita/api build

# ── runtime: production-only deps + compiled output ──
FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3001

COPY --from=build /app/pnpm-workspace.yaml /app/pnpm-lock.yaml /app/package.json ./
COPY --from=build /app/apps/api/package.json apps/api/
COPY --from=build /app/packages/shared/package.json packages/shared/
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/packages/shared/dist packages/shared/dist

RUN pnpm install --frozen-lockfile --prod

WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/index.js"]
