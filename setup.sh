#!/bin/bash

# Nombre del entorno virtual
VENV_NAME="venv"

# Crear un entorno virtual
python3 -m venv $VENV_NAME

# Activar el entorno virtual
source $VENV_NAME/bin/activate

# Instalar las dependencias desde requirements.txt
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    echo "requirements.txt no encontrado."
fi

npm install vite

cd client

# Instalar Vite y el plugin de React
npm install vite @vitejs/plugin-react --save-dev

cd ..


echo "El entorno virtual '$VENV_NAME' ha sido creado y las dependencias han sido instaladas."
