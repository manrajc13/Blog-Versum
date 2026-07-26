FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

# Drop root privileges — the node:20-alpine image ships a non-root `node` user.
USER node

EXPOSE 5001

CMD ["node", "src/index.js"]
