FROM node:22-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN python3 -m pip install --break-system-packages -r agent/requirements.txt \
    && npm run build

ENV NODE_ENV=production
ENV PORT=7860
ENV PYTHON=python3
EXPOSE 7860

CMD ["node", "dist/server.cjs"]
