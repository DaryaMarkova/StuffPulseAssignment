FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

ENV PORT=3001
ENV MUTATION_INTERVAL_MS=4000

EXPOSE 3001

CMD ["npm", "start"]
