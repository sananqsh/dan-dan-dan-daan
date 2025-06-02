FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies
RUN npm install
# For production use:
# RUN npm ci --only=production

COPY . .

EXPOSE ${PORT}

CMD ["node", "server.js"]
# For development with nodemon:
# CMD ["npm", "run", "dev"]
