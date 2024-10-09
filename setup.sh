#!/bin/bash

# Solicita al usuario su correo UPM
read -p "Introduce tu correo UPM: " UPM_EMAIL_ADDRESS

# Solicita al usuario su contraseña UPM (oculta la entrada)
read -s -p "Introduce tu contraseña UPM: " UPM_EMAIL_PASSWORD
echo # Esta línea es para un salto de línea después de la contraseña

# Crea un archivo .env para guardar variables de entorno
echo "Crea un archivo .env para guardar variables de entorno"
echo "UPM_EMAIL_ADDRESS='$UPM_EMAIL_ADDRESS'" > .env
echo "UPM_EMAIL_PASSWORD='$UPM_EMAIL_PASSWORD'" >> .env

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
npm install @fortawesome/fontawesome-free
npm install jwt-decode
npm install vite

echo "Iniciando el servidor de desarrollo de npm..."
npm run dev

echo "Configuración completada."
