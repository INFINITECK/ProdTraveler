FROM node:20-alpine

WORKDIR /app

COPY app/package.json ./package.json
RUN npm install --omit=dev

COPY app/src ./src

# mock kit specs baked into image
COPY data/kits.json /app/data/kits.json

ENV PORT=8080
EXPOSE 8080

CMD ["node", "src/index.js"]
