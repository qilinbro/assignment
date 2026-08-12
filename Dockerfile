# 多阶段构建：依赖 → 构建 → 运行
FROM node:22-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:22-slim AS builder
WORKDIR /app
# Prisma 需要 OpenSSL
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# 构建期占位 DATABASE_URL（仅用于 generate 校验）
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public"
RUN ./node_modules/.bin/prisma generate
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
# 运行时依赖
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/tsconfig.json ./
# 在运行环境重新生成 Prisma client，确保 engine binary 匹配当前镜像的 OpenSSL
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public"
RUN ./node_modules/.bin/prisma generate
EXPOSE 3000
# 启动时：同步表结构 → 写入种子账号 → 启动 Next.js
CMD ["sh", "-c", "./node_modules/.bin/prisma db push --skip-generate && ./node_modules/.bin/tsx prisma/seed.ts && exec npm start"]
