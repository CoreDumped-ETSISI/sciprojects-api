from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from .models import Investigador, Grupo, Proyecto
from .forms import InvestigadorForm, GrupoForm, ProyectoForm, UserCreationForm
import random
from django.core.mail import send_mail
import os
import pymongo

my_client = pymongo.MongoClient("mongodb://localhost:27017/")
my_db = my_client["WEB_INVESTIGACION"]
investigadores = my_db["investigadores"]
grupos = my_db["grupos"]
proyectos = my_db["proyectos"]

from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.core.mail import send_mail
from .models import Investigador
from .forms import UserCreationForm
import os

def send_email(email, password_generated):
    try:
        # send email
        send_mail(
            'Subject here',
            f'Here is your password: {password_generated}',
            os.environ.get('email_server'),
            [email],
            fail_silently=False,
        )
    except Exception as e:
        print(e)
        print('Email not sent')
        return False
    return True

def signup(request):
    if request.method == 'GET':
        return render(request, 'signup.html', {"form": UserCreationForm()})
    
    elif request.method == 'POST':
        username = request.POST["username"]
        
        # Check if username is a valid UPM email
        if username.endswith('@upm.es') or username.endswith('@alumnos.upm.es'):
            password_generated = User.objects.make_random_password()  # Generate random password
            
            try:
                # Create user
                user = User(username=username)
                user.set_password(password_generated)
                user.save()

                # Create associated Investigador
                # crear investigador sino existe con el email
                if not investigadores.find_one({"email": username}):
                    investigadores.insert_one({"email": username})

                # Send email with the password
                if send_email(username, password_generated):
                    return redirect('signin')
                else:
                    return render(request, 'signup.html', {"form": UserCreationForm(), "error": "Email not sent."})

            except IntegrityError:
                return render(request, 'signup.html', {"form": UserCreationForm(), "error": "Username already exists."})
        
        else:
            return render(request, 'signup.html', {"form": UserCreationForm(), "error": "Username must be a UPM email."})

    return render(request, 'signup.html', {"form": UserCreationForm(), "error": "Bad data passed in. Try again."})


def get_investigadores(request, investigador_id=None):
    if investigador_id:
        select_investigador = investigadores.find_one({"_id": ObjectId(investigador_id)})
        return render(request, 'investigador.html', {"investigador": select_investigador})
    else:
        select_investigador = investigadores.find()
        # DEVOLVER LOS OBJETOS DE MONGO
        select_investigador = list(select_investigador)
        # hacer accesible el id
        for investigador in select_investigador:
            investigador["id"] = str(investigador["_id"])

        return render(request, 'investigadores.html', {"investigadores": select_investigador})


from bson import ObjectId

def get_grupos(request, grupo_id=None):
    if grupo_id:

        select_group = grupos.find_one({"_id": ObjectId(grupo_id)})
        select_project = proyectos.find({"grupo": ObjectId(grupo_id)})
        return render(request, 'grupo.html', {"grupo": select_group, "proyectos": select_project})
    else:
        select_group = grupos.find()
        # DEVOLVER LOS OBJETOS DE MONGO
        select_group = list(select_group)
        # hacer accesible el id
        for group in select_group:
            group["id"] = str(group["_id"])
        return render(request, 'grupos.html', {"grupos": select_group})
    
def get_proyectos(request, proyecto_id=None):
    if proyecto_id:
        select_project = proyectos.find_one({"_id": ObjectId(proyecto_id)})
        return render(request, 'proyecto.html', {"proyecto": select_project})
    else:
        select_project = proyectos.find()
        # DEVOLVER LOS OBJETOS DE MONGO
        select_project = list(select_project)
        # hacer accesible el id
        for project in select_project:
            project["id"] = str(project["_id"])

            
        return render(request, 'proyectos.html', {"proyectos": select_project})
    
@login_required
def create_project(request):
    if request.method == 'GET':
        return render(request, 'create_project.html', {"form": ProyectoForm})
    else:
        try:
            form = ProyectoForm(request.POST)
            new_proyect = form.save(commit=False)
            # check if already exists
            if Proyecto.objects.filter(nombre=new_proyect.nombre).exists():
                return render(request, 'create_project.html', {"form": ProyectoForm, "error": "Project already exists."})
            
            # SAVE IN THE DATABASE with pymongo
            data = {}
            for field in form.fields:
                if form.cleaned_data[field] is not None:
                    if field == 'investigadores':
                        data[field] = [ObjectId(investigador) for investigador in form.cleaned_data[field]]
                    elif field == 'grupos':
                        data[field] = [ObjectId(grupo) for grupo in form.cleaned_data[field]]
                    else: 
                        data[field] = form.cleaned_data[field]

            proyectos.insert_one(data)
            nuevo_proyecto = proyectos.find_one({"nombre": new_proyect.nombre})
            return redirect('proyectos', proyecto_id=nuevo_proyecto["_id"])
        except ValueError:
            return render(request, 'create_project.html', {"form": ProyectoForm, "error": "Bad data passed in. Try again."})
        
@login_required
def create_group(request):
    if request.method == 'GET':
        return render(request, 'create_group.html', {"form": GrupoForm})
    else:
        try:
            form = GrupoForm(request.POST)
            new_group = form.save(commit=False)
            # check if already exists with pymongo
            if grupos.find_one({"nombre": new_group.nombre}):
                return render(request, 'create_group.html', {"form": GrupoForm, "error": "Group already exists."})
            
            # SAVE IN THE DATABASE with 

            # para cada campo del form, si es None, no lo añade
            data = {}
            for field in form.fields:
                if form.cleaned_data[field] is not None:
                    if field == 'investigadores':
                        data[field] = [ObjectId(investigador) for investigador in form.cleaned_data[field]]
                    else: 
                        data[field] = form.cleaned_data[field]

            grupos.insert_one(data)
            # guardar en la base de datos
            selected_group = grupos.find_one({"nombre": new_group.nombre})
            return redirect('grupos', grupo_id=selected_group["_id"])
        
        except ValueError:
            return render(request, 'create_group.html', {"form": GrupoForm, "error": "Bad data passed in. Try again."})
        
def home(request):

    proyects = list(proyectos.find())
    groups = list(grupos.find())
    investigators = list(investigadores.find())
    

    if proyects:

        proyects = random.sample(list(proyects), min(len(proyects), 5))
        # hacer accesible el id
        for proyect in proyects:
            proyect["id"] = str(proyect["_id"])
    if groups:
        groups = random.sample(list(groups), min(len(groups), 5))
        # hacer accesible el id 
        for group in groups:
            group["id"] = str(group["_id"])
    if investigators:
        investigators = random.sample(list(investigators), min(len(investigators), 5))
        # hacer accesible el id
        for investigator in investigators:
            investigator["id"] = str(investigator["_id"])
    
    return render(request, 'home.html', {"proyectos": proyects, "grupos": groups, "investigadores": investigators})

def signout(request):
    if request.method == 'GET':
        logout(request)
        return redirect('home')
    return render(request, 'home.html')
    

def signin(request):
    if request.method == 'GET':
        return render(request, 'signin.html', {"form": AuthenticationForm})
    else:
        user = authenticate(request, username=request.POST["username"], password=request.POST["password"])
        if user is None:
            return render(request, 'signin.html', {"form": AuthenticationForm, "error": "Username and password did not match."})
        else:
            login(request, user)
            return redirect('home')
        
@login_required
def modify_profile(request):
    user = request.user
    investigador = investigadores.find_one({"email": user.username})
    if request.method == 'GET':
        # SI existe devolver los campos sino devolver el form vacio tomando de models.py
        data = {}
        for field in InvestigadorForm.Meta.fields:
            data[field] = investigador.get(field)
        form = InvestigadorForm(data)

        return render(request, 'modify_profile.html', {"user": user, "form": form})
    else:
        try:
            form = InvestigadorForm(request.POST, request.FILES)
            if form.is_valid():  # Verificar que el formulario es válido
                # Preparar los datos para MongoDB
                data = {}
                for field in form.fields:
                    if form.cleaned_data[field] is not None:
                        data[field] = form.cleaned_data[field]

                # Actualizar los datos en MongoDB
                investigadores.update_one({"email": user.username}, {"$set": data})

                return redirect('home')
            else:
                print(form.errors)  # Imprimir errores para depuración
                return render(request, 'modify_profile.html', {"user": user, "form": form})

        except ValueError:
            return render(request, 'modify_profile.html', {"user": user, "form": InvestigadorForm, "error": "Bad data passed in. Try again."})
        
@login_required
def modify_group(request, group_id):
    group = get_object_or_404(Grupo, pk=group_id)
    if request.method == 'GET':
        form = GrupoForm(instance=group)
        return render(request, 'modify_group.html', {"group": group, "form": form})
    else:
        try:
            form = GrupoForm(request.POST, instance=group)
            form.save()
            return redirect('grupos')
        except ValueError:
            return render(request, 'modify_group.html', {"group": group, "form": GrupoForm, "error": "Bad data passed in. Try again."})
        
@login_required
def modify_project(request, project_id):
    project = get_object_or_404(Proyecto, pk=project_id)
    if request.method == 'GET':
        form = ProyectoForm(instance=project)
        return render(request, 'modify_project.html', {"project": project, "form": form})
    else:
        try:
            form = ProyectoForm(request.POST, instance=project)
            form.save()
            return redirect('proyectos')
        except ValueError:
            return render(request, 'modify_project.html', {"project": project, "form": ProyectoForm, "error": "Bad data passed in. Try again."})
        
@login_required
def modify_password(request):
    user = request.user
    if request.method == 'GET':
        return render(request, 'modify_password.html')
    else:
        if request.POST["password1"] == request.POST["password2"]:
            user.set_password(request.POST["password1"])
            user.save()
            return redirect('home')
        else:
            return render(request, 'modify_password.html', {"error": "Passwords did not match."})