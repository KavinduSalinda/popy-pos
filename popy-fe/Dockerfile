FROM node:20-alpine

WORKDIR /app

ENV HUSKY=0

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

# Host binding so the container is reachable from the host machine
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
