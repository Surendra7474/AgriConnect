# Stage 1: Build the React + Vite app
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# SPA fallback: all routes -> index.html
RUN printf 'server {\n\
  listen 80;\n\
  server_name localhost;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
  location /api {\n\
    return 404;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
