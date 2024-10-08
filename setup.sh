#!/bin/bash

# Crea un archivo .env para guardar variables de entorno
echo "Crea un archivo .env para guardar variables de entorno"
echo "UPM_EMAIL_ADDRESS=tu_correo@upm.es" > .env
echo "UPM_EMAIL_PASSWORD=tu_contraseña" >> .env

# Instala las dependencias de Python
echo "Instalando dependencias de Python..."
pip install -r requirements.txt

# Backend
echo "Realizando migraciones en el backend..."
python3 manage.py migrate
python3 manage.py makemigrations
echo "Iniciando el servidor de Django..."
python3 manage.py runserver &

# Frontend
echo "Navegando al directorio del cliente..."
cd client || exit
echo "Instalando dependencias de npm..."
npm install
echo "Iniciando el servidor de desarrollo de npm..."
npm run dev

echo "Configuración completada."
