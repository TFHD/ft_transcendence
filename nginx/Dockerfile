# Étape 1 : Build du front
FROM node:23-alpine AS front-build

WORKDIR /app
COPY ../front/package.json ../front/package-lock.json ./
RUN npm ci
COPY ../front .
RUN npm run build

# Étape 2 : Nginx avec les fichiers du build front
FROM nginx:alpine

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY certs /certs
COPY --from=front-build /app/dist /usr/share/nginx/html

EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]