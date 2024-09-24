from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

# Usar mongoengine para la base de datos
class Investigador(models.Model):

    """El usuario está enlazado a un usuario de Django del cual hereda el username que es el email"""
    email = models.EmailField()
    nombre = models.CharField(max_length=50)
    apellidos = models.CharField(max_length=50)
    link = models.URLField(max_length=200, blank=True, null=True)
    foto = models.ImageField(upload_to="fotos", blank=True, null=True)

    def __str__(self):
        return self.nombre + " " + self.apellidos

class Grupo(models.Model):

    nombre = models.CharField(max_length=50)
    descripcion = models.TextField(blank=True, null=True)
    link = models.URLField(max_length=200, blank=True, null=True)

    investigadores = models.ManyToManyField(Investigador, blank=True)

    def __str__(self):
        return self.nombre
    
    def get_id(self):
        return self._id
    
class Proyecto(models.Model):

    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    link = models.URLField(max_length=200, blank=True, null=True)
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_fin = models.DateField(null=True, blank=True)
    keywords = models.CharField(max_length=200, blank=True, null=True)

    investigadores = models.ManyToManyField(Investigador, blank=True)
    grupos = models.ManyToManyField(Grupo, blank=True)

    def __str__(self):
        return self.nombre
    


    
