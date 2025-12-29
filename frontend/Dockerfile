# stage 1: install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

#copy package files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# stage 2: build the application
FROM node:20-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY


#install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# stage 3: production runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

#copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

