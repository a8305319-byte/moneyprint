FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
EXPOSE 3000
CMD ["/bin/sh", "-c", "set -x; npx prisma db push --accept-data-loss; echo PRISMA_EXIT:$?; ls dist/main.js 2>&1; node dist/main 2>&1; echo NODE_EXIT:$?"]
