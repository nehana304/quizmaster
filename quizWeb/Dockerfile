# Multi-stage build for Angular application
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build -- --configuration=production

# Production stage with nginx
FROM nginx:alpine

# Copy built application from build stage
# Based on angular.json, the output goes to dist/quizWeb/browser
COPY --from=build /app/dist/quizWeb/browser /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]