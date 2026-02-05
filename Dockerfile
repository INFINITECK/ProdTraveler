FROM node:20-alpine

WORKDIR /app

# Copy app package and install deps
COPY app/package.json ./package.json
RUN npm ci --omit=dev

# Copy source
COPY app/src ./src

# Copy mock kit specs into the image (editable via redeploy/commit)
COPY data/kits.json /app/data/kits.json

ENV PORT=8080
EXPOSE 8080

CMD ["node", "src/index.js"]
