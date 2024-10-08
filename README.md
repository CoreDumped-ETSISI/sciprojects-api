# sciprojects-api

Crea un archivo .env para guardar variables de entorno
UPM_EMAIL_ADDRESS=tu_correo@upm.es
UPM_EMAIL_PASSWORD=tu_contraseña

pip install -r requirements.txt


### Backend
python3 manage.py migrate
python3 manage.py make_migrations
python3 manage.py runserver

### Frontend
cd client
npm install
npm run dev
