# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json tsconfig.json ./
RUN npm install --legacy-peer-deps

FROM deps AS build
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps
COPY --from=build /app/dist ./dist
EXPOSE 5001
CMD ["node", "dist/index.js"]
