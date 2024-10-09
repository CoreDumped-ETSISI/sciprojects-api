# sciprojects-api


### Ejecución
chmod +x setup.sh
./setup.sh



## Configuración

### 1. Crear el archivo `.env`

Crea un archivo llamado `.env` en la raíz del proyecto para guardar las variables de entorno necesarias. A continuación, añade las siguientes líneas:
  UPM_EMAIL_ADDRESS="tu_correo@upm.es"
  UPM_EMAIL_PASSWORD="tu_contraseña"

Comando para instalar las dependencias (hace falta una limpieza)
pip install -r requirements.txt


### Backend
python3 manage.py migrate
python3 manage.py make_migrations
python3 manage.py runserver

### Frontend
cd client

npm install

npm install @fortawesome/fontawesome-free

npm install jwt-decode

npm install vite

npm run dev


default frontend: http://localhost:5173/
default backend: http://localhost:8000/api/v1/

mongodb database name: WEB_INVESTIGACION on the port 27017
