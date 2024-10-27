# Usa una imagen oficial de Python como base
FROM python:3.10

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app/API

# Copia el archivo de requisitos al contenedor
COPY requirements.txt /app/API/
RUN pip install --no-cache-dir -r requirements.txt

# Copia los archivos del proyecto al contenedor
COPY . /app/API

# Exponer el puerto 8000 para el servidor de Django
EXPOSE 8000

# Comando para ejecutar las migraciones y el servidor de Django
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
