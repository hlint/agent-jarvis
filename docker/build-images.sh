#!/bin/bash
# https://docs.docker.com/build/building/multi-platform/

# Clean up unused builder instances
# docker buildx prune -f

# Read version from package.json
VERSION=$(node -p "require('../package.json').version")

docker buildx build --platform=linux/amd64,linux/arm64 --push \
  -t hlint/agent-jarvis-lite:latest \
  -t hlint/agent-jarvis-lite:${VERSION} \
	-f Dockerfile-lite ../

docker buildx build --platform=linux/amd64,linux/arm64 --push \
  -t hlint/agent-jarvis:latest \
  -t hlint/agent-jarvis:${VERSION} \
	-f Dockerfile ../