# Stage 1: install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: final image
FROM node:20-alpine AS runner
WORKDIR /app

# node:20-alpine already has a built-in 'node' user — no need to create one
# Giving ownership of /app to that user so it can read the files
RUN chown -R node:node /app

# Copy production deps from stage 1
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY . .

# Switch to non-root user
USER node

EXPOSE 5000

CMD ["node", "server.js"]