#!/bin/bash

# Configuration
DOCKER_USERNAME="trev125"
IMAGE_TAG="latest"

# Build and push backend
echo "Building backend image..."
docker buildx build --platform linux/amd64,linux/arm64 -t ${DOCKER_USERNAME}/chores-backend:${IMAGE_TAG} ./backend --push

# Build and push frontend
echo "Building frontend image..."
docker buildx build --platform linux/amd64,linux/arm64 -t ${DOCKER_USERNAME}/chores-frontend:${IMAGE_TAG} ./frontend --push

echo "All images built and pushed successfully!"
