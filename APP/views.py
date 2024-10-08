from django.shortcuts import redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.core.mail import send_mail
import os
import pymongo
from rest_framework import viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import viewsets, mixins
from rest_framework.pagination import PageNumberPagination

from bson import ObjectId
from django.utils.crypto import get_random_string
from .serializers import InvestigadorSerializer, GrupoSerializer, ProyectoSerializer

my_client = pymongo.MongoClient("mongodb://localhost:27017/")
my_db = my_client["WEB_INVESTIGACION"]
investigadores = my_db["investigadores"]
grupos = my_db["grupos"]
proyectos = my_db["proyectos"]


class GrupoPagination(PageNumberPagination):
    page_size = 1  # Tamaño de página por defecto
    page_size_query_param = 'page_size'  # Permite cambiar el tamaño de página
    max_page_size = 100  # Tamaño máximo de página

class ProyectoPagination(PageNumberPagination):
    page_size = 1  # Tamaño de página por defecto
    page_size_query_param = 'page_size'  # Permite cambiar el tamaño de página
    max_page_size = 100  # Tamaño máximo de página

class InvestigadorPagination(PageNumberPagination):
    page_size = 1  # Tamaño de página por defecto
    page_size_query_param = 'page_size'  # Permite cambiar el tamaño de página
    max_page_size = 100  # Tamaño máximo de página

class InvestigadorViewSet(mixins.ListModelMixin,
                          mixins.RetrieveModelMixin,
                          mixins.UpdateModelMixin,
                          viewsets.GenericViewSet):
    serializer_class = InvestigadorSerializer
    pagination_class = InvestigadorPagination
    
    def get_permissions(self):
        if self.request.method in ['GET']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request):
        # Parámetro de búsqueda
        search_query = request.query_params.get('search', None)
        sort_field = request.query_params.get('sortField', None)
        sort_order = request.query_params.get('sortOrder', 'asc')
        email_query = request.query_params.get('email', None)
        
        # Query inicial
        query = {}

        # Si hay un parámetro de búsqueda
        if search_query:
            query = {
                "$or": [
                    {"nombre": {"$regex": search_query, "$options": "i"}},
                    {"apellido": {"$regex": search_query, "$options": "i"}},
                    {"email": {"$regex": search_query, "$options": "i"}},
                    {"link": {"$regex": search_query, "$options": "i"}},
                ]
            }
        

        if email_query:
            query['email'] = {"$regex": email_query, "$options": "i"}


        # Obtener investigadores desde la base de datos
        all_researchers = list(investigadores.find(query))
        
        # Ordenar los investigadores
        if sort_field:
            reverse_order = sort_order == 'desc'
            all_researchers = sorted(all_researchers, key=lambda x: x.get(sort_field, '').lower() if x.get(sort_field) else '', reverse=reverse_order)

        # Añadir el campo "id" y eliminar "_id"
        for researcher in all_researchers:
            researcher["id"] = str(researcher["_id"])
            del researcher["_id"]


        # Paginación
        page = self.paginate_queryset(all_researchers)
        if page is not None:
            return self.get_paginated_response(page)
        
        return Response(all_researchers)
    
    def retrieve(self, request, pk=None):
        researcher = investigadores.find_one({"_id": ObjectId(pk)})
        if researcher:
            researcher["id"] = str(researcher["_id"])
            del researcher["_id"]

            # Ver en que grupos esta el investigador
            groups = grupos.find()
            groups = [group for group in groups if pk in group["investigadores"]]

            for group in groups:
                group["id"] = str(group["_id"])
                del group["_id"]

            researcher["grupos"] = groups

            # Ver en que proyectos esta el investigador
            projects = proyectos.find()
            projects = [project for project in projects if pk in project["investigadores"]]

            for project in projects:
                project["id"] = str(project["_id"])
                del project["_id"]

            researcher["proyectos"] = projects

            return Response(researcher)
        return Response({"error": "Investigador no encontrado."}, status=404)
    
    def update(self, request, pk=None):

        if request.user.username != investigadores.find_one({"_id": ObjectId(pk)})["email"]:

            return Response({"error": "No puedes modificar un investigador que no eres tú."}, status=403)
        

        data = request.data
        investigadores.update_one({"_id": ObjectId(pk)}, {"$set": data})

        return Response({"message": "Investigador actualizado."})
    
    def get_grupos(self, request, pk=None):
        groups = grupos.find({"investigadores": ObjectId(pk)})
        groups = list(groups)
        return Response(groups)
    
    def get_proyectos(self, request, pk=None):
        projects = proyectos.find({"investigadores": ObjectId(pk)})
        projects = list(projects)
        return Response(projects)

class GrupoViewSet(mixins.ListModelMixin,
                          mixins.RetrieveModelMixin,
                          mixins.UpdateModelMixin,
                          viewsets.GenericViewSet):
    
    serializer_class = GrupoSerializer
    pagination_class = GrupoPagination

    def get_permissions(self):
        # Permisos diferentes para métodos GET y otros
        if self.request.method in ['GET']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def list(self, request):
        # Capturar los parámetros de búsqueda y ordenamiento
        search_query = request.query_params.get('search', None)
        sort_field = request.query_params.get('sortField', None)
        sort_order = request.query_params.get('sortOrder', 'asc')  # 'asc' por defecto

        investigador_id = request.query_params.get('investigador', None)
        
        query = {}

        # Si hay un parámetro de búsqueda
        if search_query:
            query = {
                "$or": [
                    {"nombre": {"$regex": search_query, "$options": "i"}},
                    {"descripcion": {"$regex": search_query, "$options": "i"}},
                ]
            }

        # Obtener grupos desde la base de datos
        all_groups = list(grupos.find(query))

        # Ordenar los grupos
        if sort_field:
            reverse_order = sort_order == 'desc'  # True si es 'desc', False si es 'asc'
            all_groups.sort(key=lambda x: x.get(sort_field, '').lower(), reverse=reverse_order)

        # Añadir el campo "id" y eliminar "_id"
        for group in all_groups:
            group["id"] = str(group.pop("_id"))  # Usar pop para eliminar y obtener al mismo tiempo

        # Paginación
        page = self.paginate_queryset(all_groups)
        if page is not None:
            return self.get_paginated_response(page)

        return Response(all_groups)
    
    def retrieve(self, request, pk=None):
        group = grupos.find_one({"_id": ObjectId(pk)})
        if group:
            group["id"] = str(group["_id"])
            del group["_id"]

            # Ver en que proyectos.grupos esta el grupo
            projects = proyectos.find()
            projects = [project for project in projects if pk in project["grupos"]]
            
            for project in projects:
                project["id"] = str(project["_id"])
                del project["_id"]
            
            group["proyectos"] = projects

            return Response(group)
        return Response({"error": "Grupo no encontrado."}, status=404)
    
    
    def create(self, request):
        # Puede realizar esta acción si está autenticado
        data = request.data
        grupos.insert_one(data)
        return Response({"message": "Grupo creado."})
    
    @authentication_classes([TokenAuthentication])

    def update(self, request, pk=None):

        if request.user.username not in [investigador["email"] for investigador in investigadores.find({"grupos": ObjectId(pk)})]:
            return Response({"error": "No puedes modificar un grupo al que no perteneces."}, status=403)
        
        data = request.data
        grupos.update_one({"_id": ObjectId(pk)}, {"$set": data})
        return Response({"message": "Grupo actualizado."})
    
    def destroy(self, request, pk=None):

        if request.user.username not in [investigador["email"] for investigador in investigadores.find({"grupos": ObjectId(pk)})]:
            return Response({"error": "No puedes eliminar un grupo al que no perteneces."}, status=403)
        
        grupos.delete_one({"_id": ObjectId(pk)})
        return Response({"message": "Grupo eliminado."})
    
    def get_investigadores(self, request, pk=None):
        researchers = investigadores.find({"grupos": ObjectId(pk)})
        researchers = list(researchers)
        return Response(researchers)
    
    def get_proyectos(self, request, pk=None):
        projects = proyectos.find({"grupo": ObjectId(pk)})
        projects = list(projects)
        return Response(projects)
    

    serializer_class = GrupoSerializer
    queryset = grupos.find()

class ProyectoViewSet(mixins.ListModelMixin,
                          mixins.RetrieveModelMixin,
                          mixins.UpdateModelMixin,
                          viewsets.GenericViewSet,):
    
    serializer_class = ProyectoSerializer
    pagination_class = GrupoPagination



    def get_permissions(self):
        # Permisos diferentes para métodos GET y otros
        if self.request.method in ['GET']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request):
        # Capturar los parámetros de búsqueda y ordenamiento
        search_query = request.query_params.get('search', None)
        sort_field = request.query_params.get('sortField', None)
        sort_order = request.query_params.get('sortOrder', 'asc')  # 'asc' por defecto
        
        investigador_id = request.query_params.get('investigador', None)
        grupo_id = request.query_params.get('grupo', None)

        query = {}

        # Si hay un parámetro de búsqueda
        if search_query:
            query = {
                "$or": [
                    {"nombre": {"$regex": search_query, "$options": "i"}},
                    {"descripcion": {"$regex": search_query, "$options": "i"}},
                    {"keyword": {"$regex": search_query, "$options": "i"}},
                    {"fecha": {"$regex": search_query, "$options": "i"}},   
                ]
            }

        if investigador_id:
            query['investigadores'] = ObjectId(investigador_id)

        if grupo_id:
            query['grupo'] = ObjectId(grupo_id)

        # Obtener proyectos desde la base de datos
        all_projects = list(proyectos.find(query))

        # Ordenar los proyectos
        if sort_field:
            reverse_order = sort_order == 'desc'
            # si es por fecha, ordenar por fecha
            all_projects = sorted(all_projects, key=lambda x: x.get(sort_field, '').lower() if x.get(sort_field) else '', reverse=reverse_order)

        # Añadir el campo "id" y eliminar "_id"
        for project in all_projects:
            project["id"] = str(project["_id"])
            del project["_id"]

        # Paginación
        page = self.paginate_queryset(all_projects)
        if page is not None:
            return self.get_paginated_response(page)
        
        return Response(all_projects)
    

    def retrieve(self, request, pk=None):
        project = proyectos.find_one({"_id": ObjectId(pk)})
        if project:
            project["id"] = str(project["_id"])
            del project["_id"]
            return Response(project)
        return Response({"error": "Proyecto no encontrado."}, status=404)
    
    def create(self, request):
        # Puede realizar esta acción si está autenticado
        data = request.data
        proyectos.insert_one(data)
        return Response({"message": "Proyecto creado."})
    
    def update(self, request, pk=None):

        if request.user.username not in [investigador["email"] for investigador in investigadores.find({"proyectos": ObjectId(pk)})]:
            return Response({"error": "No puedes modificar un proyecto al que no perteneces."}, status=403)
        
        data = request.data
        proyectos.update_one({"_id": ObjectId(pk)}, {"$set": data})
        return Response({"message": "Proyecto actualizado."})
    
    def destroy(self, request, pk=None):
        if request.user.username not in [investigador["email"] for investigador in investigadores.find({"proyectos": ObjectId(pk)})]:
            return Response({"error": "No puedes eliminar un proyecto al que no perteneces."}, status=403)
        
        proyectos.delete_one({"_id": ObjectId(pk)})
        return Response({"message": "Proyecto eliminado."})
    
    def get_investigadores(self, request, pk=None):
        researchers = investigadores.find({"proyectos": ObjectId(pk)})
        researchers = list(researchers)
        return Response(researchers)
    
    def get_grupos(self, request, pk=None):
        groups = grupos.find({"proyectos": ObjectId(pk)})
        groups = list(groups)
        return Response(groups)
    
    serializer_class = ProyectoSerializer
    queryset = proyectos.find()


@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):

    username = request.data.get("username")

    if username.endswith('@upm.es') or username.endswith('@alumnos.upm.es'):

        password_generated = get_random_string(length=8)
        user = User(username=username)
        user.set_password(password_generated)

        try:
            user.save()
            if not investigadores.find_one({"email": username}):
                investigadores.insert_one({"email": username})
            
            if enviar_correo(username, password_generated):
                token = Token.objects.create(user=user)
                return Response({'token': str(token), "user": username}, status=200)
            else:
                return Response({"error": "Email not sent."}, status=500)

        except IntegrityError:
            
            # Cambiamos contraseña y se lo mandamos al usuario
            user = User.objects.get(username=username)
            user.set_password(password_generated)
            user.save()

            if not investigadores.find_one({"email": username}):
                investigadores.insert_one({"email": username})
            
            if enviar_correo(username, password_generated):
                token, created = Token.objects.get_or_create(user=user)
                return Response({'token': str(token), "user": username}, status=200)

    
    else:
        return Response({"error": "Invalid email."}, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def signin(request):
    username = request.data.get("email")
    password = request.data.get("password")
    
    # Authenticate the user
    user = authenticate(request, username=username, password=password)

    if user is None:
        return Response({"error": "Username and password did not match."}, status=400)

    # Create JWT tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'refresh': str(refresh),  # Optional: You can use refresh token for getting new access tokens
        'access': str(refresh.access_token),  # Access token
        'user': username,
    }, status=200)

@permission_classes([IsAuthenticated])
@api_view(['POST'])
def signout(request):
    if request.method == 'POST':
        logout(request)
        return redirect('home')
    


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def modify_password(request):
    username = request.user.username
    new_password = request.data.get("new_password")
    user = User.objects.get(username=username)
    user.set_password(new_password)
    user.save()
    return Response({"message": "Password updated."}, status=200)


from dotenv import load_dotenv
import os

load_dotenv()


def enviar_correo(recipient_email, password):

    try :

        EMAIL_HOST_USER = os.getenv('UPM_EMAIL_ADDRESS')

        mensaje = f"""
        Estimado usuario,

        Bienvenido a la plataforma de investigación. 
        Su usuario es: {recipient_email}
        Su contraseña es: {password}

        """
        send_mail(
            'Credenciales de acceso',
            mensaje,
            EMAIL_HOST_USER,
            [recipient_email],
            fail_silently=False,
        )

        return True

    except Exception as e:
        print(e)
        return False
    return False
