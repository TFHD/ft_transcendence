FROM node:23

WORKDIR /app

COPY package.json ./
RUN npm install
COPY . .
RUN npx tailwindcss init -p

EXPOSE 3000
CMD ["npm", "run", "dev"]

# FROM node:23-alpine AS build

# WORKDIR /app

# COPY package.json ./
# RUN npm install
# RUN npx tailwindcss init -p

# COPY . .

# RUN npm run build

# FROM nginx:alpine

# COPY --from=build /app/dist /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]
