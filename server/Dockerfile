FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS dev
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

FROM base AS production
ENV NODE_ENV=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
