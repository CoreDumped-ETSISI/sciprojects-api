# Usa una imagen oficial de Node.js como base
FROM node:18

# Crea el directorio de trabajo dentro del contenedor
WORKDIR /app/client

COPY client/.env ./

# Copia el archivo package.json y package-lock.json al contenedor
COPY client/package*.json ./

# Instala las dependencias de Node
RUN npm install

# Copia el resto de los archivos del proyecto
COPY client/ .

# Construye la aplicación de React
RUN npm run build

EXPOSE 5173

# Comando para iniciar la aplicación de React
CMD ["npm", "run", "dev"]
