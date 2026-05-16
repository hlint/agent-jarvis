
docker buildx build --platform=linux/amd64,linux/arm64 --push \
  -t hlint/agent-jarvis-computer:latest \
  -t hlint/agent-jarvis-computer:1.0.0 \
	-f Dockerfile-computer ./assets