FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS dev
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

FROM base AS production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
