#!/usr/bin/env bash
# Запускать НА СЕРВЕРЕ, из каталога с git-клоном проекта:
#   cd /opt/yescoding3d && ./deploy/deploy.sh
set -euo pipefail

IMAGE=yescoding3d:latest
CONTAINER=yescoding3d
PORT=3000

echo "==> git pull"
git pull --ff-only origin main

echo "==> docker build"
docker build -t "$IMAGE" .

echo "==> restart container"
docker stop "$CONTAINER" >/dev/null 2>&1 || true
docker rm "$CONTAINER" >/dev/null 2>&1 || true
docker run -d --name "$CONTAINER" --restart unless-stopped -p "$PORT:3000" "$IMAGE" >/dev/null

echo "==> health check"
sleep 1
if curl -sf -o /dev/null "http://127.0.0.1:$PORT/"; then
  echo "OK: $CONTAINER отвечает на порту $PORT"
else
  echo "ВНИМАНИЕ: контейнер поднялся, но / не отвечает — смотри 'docker logs $CONTAINER'" >&2
  exit 1
fi
