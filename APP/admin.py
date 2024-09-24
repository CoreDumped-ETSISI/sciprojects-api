from django.contrib import admin
from .models import Investigador, Grupo, Proyecto

admin.site.register(Investigador)
admin.site.register(Grupo)
admin.site.register(Proyecto)