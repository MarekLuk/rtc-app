FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY tsconfig*.json ./
COPY src ./src

RUN npm run build

ENV PORT=3001

EXPOSE 3001

CMD ["npm", "start"]