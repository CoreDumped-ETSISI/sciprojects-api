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

# Verifica si Docker está corriendo
if ! sudo systemctl is-active --quiet docker; then
    echo "Docker no está corriendo. Iniciando Docker..."
    sudo systemctl start docker
fi

# Verifica si el contenedor de MongoDB ya está corriendo
if [ ! "$(docker ps -q -f name=mongo-db)" ]; then
    if [ "$(docker ps -aq -f status=exited -f name=mongo-db)" ]; then
        # Si el contenedor existe pero está detenido, lo iniciamos
        echo "Iniciando contenedor de MongoDB existente..."
        docker start mongo-db
    else
        # Si no existe, lo creamos
        echo "Iniciando nuevo contenedor de Docker para MongoDB..."
        docker run -d --name mongo-db -p 27017:27017 mongo
    fi
else
    echo "El contenedor de MongoDB ya está corriendo."
fi

echo "MONGO_URI='mongodb://localhost:27017/'" >> .env
echo "MONGO_DB='WEB_INVESTIGACION'" >> .env

# Instala las dependencias de Python
echo "Instalando dependencias de Python..."
pip install -r requirements.txt

# Backend
echo "Realizando migraciones en el backend..."
python3 manage.py migrate
python3 manage.py makemigrations
echo "Iniciando el servidor de Django..."
python3 manage.py runserver &


# Instalar NVM si no está instalado
echo "Instalando nvm y Node.js versión 18..."
if ! command -v nvm &> /dev/null; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

    # Sourcing NVM
    export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Asegurando que NVM está disponible
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    \. "$NVM_DIR/nvm.sh"  # Cargar NVM
    echo "NVM cargado correctamente."
else
    echo "Error: No se pudo cargar NVM."
    exit 1
fi

# Instalar Node.js versión 18
nvm install 18
nvm use 18

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
