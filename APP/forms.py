from django import forms
from bson import ObjectId
import pymongo
from django.contrib.auth.models import User

# Conexión global a la base de datos MongoDB
my_client = pymongo.MongoClient("mongodb://localhost:27017/")
my_db = my_client["WEB_INVESTIGACION"]
investigadores = my_db["investigadores"]
grupos = my_db["grupos"]
proyectos = my_db["proyectos"]


class InvestigadorForm(forms.Form):
    nombre = forms.CharField(label='Nombre', max_length=100)
    apellidos = forms.CharField(label='Apellidos', max_length=100)
    link = forms.URLField(label='Link', max_length=200, required=False)

    def save(self):
        # Crear un nuevo documento en la colección de investigadores
        investigador = {
            "nombre": self.cleaned_data['nombre'],
            "apellidos": self.cleaned_data['apellidos'],
            "link": self.cleaned_data['link'],
        }
        return investigadores.insert_one(investigador).inserted_id
    
    
class GrupoForm(forms.Form):
    nombre = forms.CharField(label='Nombre', max_length=100)
    descripcion = forms.CharField(label='Descripción', widget=forms.Textarea, required=False)
    link = forms.URLField(label='Link', max_length=200, required=False)
    
    investigadores = forms.MultipleChoiceField(label='Investigadores', widget=forms.CheckboxSelectMultiple, required=False)
    proyectos = forms.MultipleChoiceField(label='Proyectos', widget=forms.CheckboxSelectMultiple, required=False)

    def __init__(self, *args, **kwargs):
        super(GrupoForm, self).__init__(*args, **kwargs)
        self.fields['investigadores'].choices = [(str(i["_id"]), i["nombre"] + " " + i["apellidos"]) for i in investigadores.find()]
        self.fields['proyectos'].choices = [(str(p["_id"]), p["nombre"]) for p in proyectos.find()]

    def clean_investigadores(self):
        investigadores_ids = self.cleaned_data['investigadores']
        return [ObjectId(i) for i in investigadores_ids]
    
    def clean_proyectos(self):
        proyectos_ids = self.cleaned_data['proyectos']
        return [ObjectId(p) for p in proyectos_ids]
    
    def save(self):
        grupo = {
            "nombre": self.cleaned_data['nombre'],
            "descripcion": self.cleaned_data['descripcion'],
            "link": self.cleaned_data['link'],
            "investigadores": self.cleaned_data['investigadores'],
            "proyectos": self.cleaned_data['proyectos'],
        }
        return grupos.insert_one(grupo).inserted_id
    


class ProyectoForm(forms.Form):
    nombre = forms.CharField(label='Nombre', max_length=100)
    descripcion = forms.CharField(label='Descripción', widget=forms.Textarea, required=False)
    link = forms.URLField(label='Link', max_length=200, required=False)
    keywords = forms.CharField(label='Keywords', max_length=200, required=False)

    # Campos para las relaciones ManyToMany con investigadores y grupos
    investigadores = forms.MultipleChoiceField(label="Investigadores", required=False)
    grupos = forms.MultipleChoiceField(label="Grupos", required=False)

    def __init__(self, *args, **kwargs):
        super(ProyectoForm, self).__init__(*args, **kwargs)
        
        # Rellenar las opciones de investigadores y grupos dinámicamente desde MongoDB
        self.fields['investigadores'].choices = [
            (str(i["_id"]), i["nombre"] + " " + i["apellidos"]) 
            for i in investigadores.find()
        ]
        self.fields['grupos'].choices = [
            (str(g["_id"]), g["nombre"]) 
            for g in grupos.find()
        ]

    def clean_investigadores(self):
        # Validar y convertir a ObjectId para MongoDB
        investigadores_ids = self.cleaned_data['investigadores']
        return [ObjectId(i) for i in investigadores_ids]

    def clean_grupos(self):
        # Validar y convertir a ObjectId para MongoDB
        grupos_ids = self.cleaned_data['grupos']
        return [ObjectId(g) for g in grupos_ids]
    
    def save(self): 
        # Crear un nuevo documento en la colección de proyectos
        proyecto = {
            "nombre": self.cleaned_data['nombre'],
            "descripcion": self.cleaned_data['descripcion'],
            "link": self.cleaned_data['link'],
            "keywords": self.cleaned_data['keywords'],
            "investigadores": self.cleaned_data['investigadores'],
            "grupos": self.cleaned_data['grupos'],
        }
        return proyectos.insert_one(proyecto).inserted_id

def UserCreationForm(ModelForm):
    class Meta:
        model = User
        fields = ["username"]
        labels = {
            "username": "Correo"
        }
        widgets = {
            "username": forms.EmailInput(attrs={"class": "form-control"},)
        }
        help_texts = {
            "username": None
        }
        error_messages = {
            "username": {
                "unique": "Ya existe un usuario con este correo."
            }
        }
        def clean_username(self):
            username = self.cleaned_data['username']
            if User.objects.filter(username=username).exists():
                raise forms.ValidationError("Ya existe un usuario con este correo.")
            return username
        
        def save(self, commit=True):
            user = super().save(commit=False)
            # Crear un usuario con contraseña aleatoria
            password = User.objects.make_random_password()
            user.set_password(password)
            # ENviar un email con la contraseña
            user.email_user(
                "Bienvenido a la plataforma de investigación",
                f"Su contraseña es: {password}"
            )
            print('Password:', password)
            if commit:
                user.save()
            return user
        
