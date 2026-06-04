FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
ENV NODE_ENV=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
