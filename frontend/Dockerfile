# ==========================
# Build Stage (Node 20 LTS)
# ==========================
FROM node:20 AS build
WORKDIR /app

# Copy package files first (better caching)
COPY ./package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the project
COPY . .

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

# Copy Nginx config (routing support)
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
