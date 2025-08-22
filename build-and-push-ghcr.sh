#!/bin/bash

# Configuration for GitHub Container Registry
GITHUB_USERNAME="your-github-username"
IMAGE_TAG="latest"

# Build and push backend
echo "Building backend image..."
docker build -t ghcr.io/${GITHUB_USERNAME}/chores-backend:${IMAGE_TAG} ./backend
echo "Pushing backend image..."
docker push ghcr.io/${GITHUB_USERNAME}/chores-backend:${IMAGE_TAG}

# Build and push frontend
echo "Building frontend image..."
docker build -t ghcr.io/${GITHUB_USERNAME}/chores-frontend:${IMAGE_TAG} ./frontend
echo "Pushing frontend image..."
docker push ghcr.io/${GITHUB_USERNAME}/chores-frontend:${IMAGE_TAG}

echo "All images built and pushed to GitHub Container Registry!"
