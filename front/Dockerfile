# FROM node:23

# WORKDIR /app

# COPY package.json ./
# RUN npm install
# COPY . .
# RUN npx tailwindcss init -p

# EXPOSE 3000
# CMD ["npm", "run", "dev"]

FROM node:23-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build
