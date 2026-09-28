FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 5173
EXPOSE 3001

CMD ["npm", "run", "dev:frontend", "--", "--host", "0.0.0.0"]
