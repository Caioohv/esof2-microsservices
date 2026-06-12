# --- build: gera o cliente Prisma ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma.config.js ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate

# --- runtime ---
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY --from=builder /app/src/generated ./src/generated
COPY prisma ./prisma
COPY prisma.config.js ./
ENV NODE_ENV=production
EXPOSE 3002
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
