
docker buildx build --platform=linux/amd64,linux/arm64 --push \
  -t hlint/agent-jarvis-computer:1.1.0 \
	-f ./computer/Dockerfile ./computer/assets