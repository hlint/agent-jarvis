# BUILDER
FROM oven/bun:latest AS builder
WORKDIR /app
COPY . .

WORKDIR /app/output/dist