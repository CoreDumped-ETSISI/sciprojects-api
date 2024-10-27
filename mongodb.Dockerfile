# Usa la imagen oficial de MongoDB
FROM mongo:latest

# Configura las variables de entorno
ENV MONGO_INITDB_ROOT_USERNAME=root
ENV MONGO_INITDB_ROOT_PASSWORD=root
ENV MONGO_INITDB_DATABASE=WEB_INVESTIGACION

# Copia archivos de configuración o inicialización de la base de datos (opcional)
# COPY ./mongo-init.js /docker-entrypoint-initdb.d/

# Expone el puerto de MongoDB
EXPOSE 27017

# Comando por defecto al iniciar el contenedor
CMD ["mongod"]