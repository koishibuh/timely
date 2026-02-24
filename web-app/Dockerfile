# =========================================
# Stage 1: Build the Vue.js Application
# =========================================
ARG NODE_VERSION=24.12.0
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

ENV NODE_ENV=development

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

RUN npm run build

# =========================================
# Stage 2: Serve with Nginx
# =========================================

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]