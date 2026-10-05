# syntax=docker/dockerfile:1

# ---------- Etapa 1: build del sitio con Astro ----------
FROM node:22-alpine AS build
WORKDIR /app

# Primero solo los manifiestos: mientras package.json y package-lock.json no cambien,
# Docker reutiliza esta capa y no vuelve a instalar dependencias.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

COPY astro.config.mjs tsconfig.json ./
COPY public ./public
COPY src ./src
RUN npm run build

# ---------- Etapa 2: nginx sirve el sitio estático ----------
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
