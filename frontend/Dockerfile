FROM node:22-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Accept build argument for API URL
ARG VITE_API_URL=http://192.168.68.60:3001/api
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Create a script to replace API URL at runtime
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'API_URL=${API_URL:-http://192.168.68.60:3001/api}' >> /docker-entrypoint.sh && \
    echo 'sed -i "s|REPLACE_WITH_API_URL|$API_URL|g" /usr/share/nginx/html/config.js' >> /docker-entrypoint.sh && \
    echo 'exec "$@"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 3000

# Start nginx with entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
