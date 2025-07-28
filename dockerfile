# React (Next.js) Dockerfile - Docker Layer 캐싱 최적화
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 의존성 파일만 먼저 복사 (캐시 레이어)
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# 의존성 설치 (이 레이어는 의존성 변경 시만 재빌드됨)
RUN \
  if [ -f yarn.lock ]; then \
    yarn install --frozen-lockfile --network-timeout 300000; \
  elif [ -f package-lock.json ]; then \
    npm ci --ignore-scripts --no-audit --cache /tmp/.npm-cache; \
  elif [ -f pnpm-lock.yaml ]; then \
    yarn global add pnpm && pnpm i --frozen-lockfile; \
  else \
    echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# 설치된 의존성 복사 (캐시 재사용)
COPY --from=deps /app/node_modules ./node_modules

# 소스 코드는 마지막에 복사
COPY . .

# Next.js telemetry 비활성화
ENV NEXT_TELEMETRY_DISABLED=1

# 빌드 (코드 변경 시만 재실행)
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 필요한 파일만 선별적으로 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]