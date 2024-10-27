#!/bin/bash

# Definir variables
MONGO_CONTAINER_NAME="mongoDb"
CLIENT_CONTAINER_NAME="client"
BACKEND_CONTAINER_NAME="backend"

# Colores para el output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

echo -e "${GREEN}Comenzando el setup del proyecto...${NC}"

# Construir y levantar los contenedores
echo -e "${GREEN}Creando y levantando contenedores de Docker...${NC}"
docker-compose up -d --build

# Esperar a que MongoDB esté listo
echo -e "${GREEN}Esperando a que MongoDB esté listo...${NC}"
COUNTER=0
while ! docker exec -it $MONGO_CONTAINER_NAME mongo --username root --password root --eval "db.stats()" > /dev/null 2>&1
do
  echo -e "${RED}Esperando a MongoDB...${NC}"
  sleep 3
  COUNTER=$((COUNTER+1))
  if [ $COUNTER -ge 40 ]; then  # Espera 2 minutos en total (40 * 3 segundos)
    echo -e "${RED}MongoDB no respondió a tiempo. Por favor, revisa el contenedor de MongoDB.${NC}"
    exit 1
  fi
done

echo -e "${GREEN}MongoDB está listo y conectado.${NC}"

# Ejecutar migraciones de Django
echo -e "${GREEN}Aplicando migraciones de Django...${NC}"
docker exec -it $BACKEND_CONTAINER_NAME python manage.py migrate

# Instalación de dependencias de frontend si es necesario
echo -e "${GREEN}Instalando dependencias de frontend...${NC}"
docker exec -it $CLIENT_CONTAINER_NAME npm install

echo -e "${GREEN}Setup completo. Los servicios están corriendo.${NC}"
