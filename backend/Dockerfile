FROM node:18-alpine

WORKDIR /usr/src/app

# Copia package.json e package-lock.json
COPY backend/package*.json ./backend/

# Instala dependências do backend
RUN npm install --prefix backend

# Copia backend inteiro
COPY backend ./backend

# Gera Prisma Client **depois de copiar tudo**
WORKDIR /usr/src/app/backend
RUN npx prisma generate

# Expõe porta
EXPOSE 3000

# Comando
CMD ["node", "server.js"]
