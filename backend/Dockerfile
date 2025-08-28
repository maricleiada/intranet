FROM node:20

WORKDIR /usr/src/app

# Copia package.json da pasta backend
COPY package*.json ./

RUN npm install --force

# Copia todo o backend
COPY . .

# Gera Prisma Client
RUN npx prisma generate --schema=prisma/schema.prisma

EXPOSE 3000
CMD ["node", "server.js"]
