#!/bin/bash
# https://docs.docker.com/build/building/multi-platform/

# Read version from package.json
VERSION=$(node -p "require('./package.json').version")

# Push latest and version tag
docker buildx build --platform=linux/amd64,linux/arm64 --push \
  -t hlint/agent-jarvis:latest \
  -t hlint/agent-jarvis:${VERSION} \
	-f Dockerfile ../