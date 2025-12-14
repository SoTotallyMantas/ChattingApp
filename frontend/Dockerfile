# ==========================
# Build Stage (Node 20 LTS)
# ==========================
FROM node:20.19.0 AS build
WORKDIR /app

# Copy package files first (better caching)
COPY ./package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the project
COPY . .

RUN echo "import 'webrtc-adapter';" >> ./src/main.js

# Build the frontend (dist folder)
RUN npm run build


# ==========================
# Serve Stage (Nginx 1.27)
# ==========================
FROM nginx:1.27-alpine

# Set working directory to serve from
WORKDIR /usr/share/nginx/html

# Copy built frontend
COPY --from=build /app/dist ./


# Generate SSL certs inside container // Testing only 
RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/certs && \
    openssl req -x509 -nodes -days 365 \
        -newkey rsa:2048 \
        -keyout /etc/nginx/certs/local.key \
        -out /etc/nginx/certs/local.crt \
        -subj "/CN=localhost"

# Install HTTPS-enabled nginx.conf
COPY ./nginx-app.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80
EXPOSE 443
# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
