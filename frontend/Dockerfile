# Stage 1: build the React app
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite reads VITE_* env vars at build time, not runtime.
# Pass your backend URL as a build arg when building for production.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: serve with nginx
# nginx is a production-grade static file server — Vite's dev server
# is not suitable for production use
FROM nginx:alpine AS runner

# Copy built files from stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom nginx config (handles React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]