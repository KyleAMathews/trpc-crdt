FROM node:18-alpine
ENV CI=true

# Set working directory
WORKDIR /app

COPY . .

# Add lockfile and package.json's of isolated subworkspace

RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@7.26.0

RUN pnpm --filter "*-yjs" install --frozen-lockfile
RUN pnpm --filter "*-yjs" run build

WORKDIR /app/examples/yjs

ENV NODE_ENV=production
EXPOSE 3000

CMD ["pnpm", "run", "start"]
