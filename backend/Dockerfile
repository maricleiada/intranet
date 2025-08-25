
FROM node:20

WORKDIR /usr/src/app

COPY backend/package*.json ./
RUN npm install --force

COPY backend ./
COPY frontend ../frontend 
# Gera Prisma Client
#RUN npx prisma generate --schema=./prisma/schema.prisma

EXPOSE 3000
CMD ["node", "server.js"]
