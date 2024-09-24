from django.forms import ModelForm
from .models import Investigador, Grupo, Proyecto
from django.contrib.auth.models import User


# SAVE WITH AUTH PASSWORD 

class InvestigadorForm(ModelForm):
    class Meta:
        model = Investigador
        fields = ["nombre", "apellidos", "link", "foto"]



class GrupoForm(ModelForm):
    class Meta:
        model = Grupo
        fields = ["nombre", "descripcion", "link", "investigadores"]

class ProyectoForm(ModelForm):
    class Meta:
        model = Proyecto
        fields = ["nombre", "descripcion", "link", "fecha_inicio", "fecha_fin", "keywords", "investigadores", "grupos"]

class UserCreationForm(ModelForm):
    class Meta:
        model = User
        fields = ["username"]
        labels = {
            "username": "Correo"
        }
