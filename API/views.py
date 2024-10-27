from django.shortcuts import redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.core.mail import send_mail
import os
import pymongo
from rest_framework import viewsets, mixins
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from bson import ObjectId
from django.utils.crypto import get_random_string
from serializers import InvestigadorSerializer, GrupoSerializer, ProyectoSerializer

from dotenv import load_dotenv  # Importa para cargar variables de entorno desde un archivo .env
from pymongo import MongoClient


# Conexión al cliente de MongoDB

my_client = MongoClient('mongodb://root:root@mongo:27017/')



# Selección de la base de datos "WEB_INVESTIGACION"
my_db = my_client['WEB_INVESTIGACION']

# Selección de las colecciones de la base de datos
investigadores = my_db["investigadores"]  # Colección para almacenar los datos de los investigadores
grupos = my_db["grupos"]                  # Colección para almacenar los datos de los grupos
proyectos = my_db["proyectos"]            # Colección para almacenar los datos de los proyectos



class GrupoPagination(PageNumberPagination):
    page_size = 10  # Tamaño de página por defecto
    page_size_query_param = 'page_size'  # Permite cambiar el tamaño de página
    max_page_size = 100  # Tamaño máximo de página

class ProyectoPagination(PageNumberPagination):
    page_size = 10  # Tamaño de página por defecto
    page_size_query_param = 'page_size'  # Permite cambiar el tamaño de página
    max_page_size = 100  # Tamaño máximo de página

class InvestigadorPagination(PageNumberPagination):
    page_size = 10  # Tamaño de página por defecto
    page_size_query_param = 'page_size'  # Permite cambiar el tamaño de página
    max_page_size = 100  # Tamaño máximo de página


# Importación de mixins y viewsets necesarios para crear un conjunto de vistas de investigadores
class InvestigadorViewSet(mixins.ListModelMixin,
                          mixins.RetrieveModelMixin,
                          mixins.UpdateModelMixin,
                          viewsets.GenericViewSet):
    # Clase del serializador para la representación de datos
    serializer_class = InvestigadorSerializer
    # Clase de paginación para los investigadores
    pagination_class = InvestigadorPagination
    
    def get_permissions(self):
        # Establece permisos basados en el método de la solicitud
        if self.request.method in ['GET']:
            return [AllowAny()]  # Permite el acceso a todos los usuarios para las solicitudes GET
        return [IsAuthenticated()]  # Requiere autenticación para otros métodos (POST, PUT, DELETE)

    def list(self, request):
        # Obtiene parámetros de búsqueda y ordenación de la consulta
        search_query = request.query_params.get('search', None)  # Parámetro de búsqueda
        sort_field = request.query_params.get('sortField', None)  # Campo por el que ordenar
        sort_order = request.query_params.get('sortOrder', 'asc')  # Orden de clasificación (ascendente o descendente)
        email_query = request.query_params.get('email', None)  # Filtro por correo electrónico
        
        # Query inicial
        query = {}

        # Si hay un parámetro de búsqueda, crea un filtro de búsqueda
        if search_query:
            query = {
                "$or": [
                    {"nombre": {"$regex": search_query, "$options": "i"}},  # Busca en el campo "nombre"
                    {"apellido": {"$regex": search_query, "$options": "i"}},  # Busca en el campo "apellido"
                    {"email": {"$regex": search_query, "$options": "i"}},  # Busca en el campo "email"
                    {"link": {"$regex": search_query, "$options": "i"}},  # Busca en el campo "link"
                ]
            }
        
        # Si hay un filtro por correo electrónico, añádelo a la consulta
        if email_query:
            query['email'] = {"$regex": email_query, "$options": "i"}

        # Obtiene todos los investigadores que coinciden con la consulta
        all_researchers = list(investigadores.find(query))
        
        # Ordena los investigadores si se especifica un campo de ordenación
        if sort_field:
            reverse_order = sort_order == 'desc'  # Determina si el orden debe ser descendente
            all_researchers = sorted(all_researchers, key=lambda x: x.get(sort_field, '').lower() if x.get(sort_field) else '', reverse=reverse_order)

        # Añade el campo "id" y elimina el campo "_id" de los resultados
        for researcher in all_researchers:
            researcher["id"] = str(researcher["_id"])  # Convierte ObjectId a string
            del researcher["_id"]  # Elimina el campo "_id"

        # Paginación de los resultados
        page = self.paginate_queryset(all_researchers)
        if page is not None:
            return self.get_paginated_response(page)  # Devuelve la respuesta paginada
        
        return Response(all_researchers)  # Devuelve todos los investigadores si no hay paginación
    
    def queryset(self):
        return investigadores.find()  # Devuelve todos los investigadores

    def retrieve(self, request, pk=None):
        # Obtiene un investigador específico utilizando su ID
        researcher = investigadores.find_one({"_id": ObjectId(pk)})
        if researcher:
            researcher["id"] = str(researcher["_id"])  # Convierte ObjectId a string
            del researcher["_id"]  # Elimina el campo "_id"

            # Obtiene los grupos a los que pertenece el investigador
            groups = grupos.find()
            groups = [group for group in groups if pk in group["investigadores"]]
            for group in groups:
                group["id"] = str(group["_id"])  # Convierte ObjectId a string
                del group["_id"]  # Elimina el campo "_id"

            researcher["grupos"] = groups  # Añade los grupos al investigador

            # Obtiene los proyectos a los que pertenece el investigador
            projects = proyectos.find()
            projects = [project for project in projects if pk in project["investigadores"]]
            for project in projects:
                project["id"] = str(project["_id"])  # Convierte ObjectId a string
                del project["_id"]  # Elimina el campo "_id"

            researcher["proyectos"] = projects  # Añade los proyectos al investigador

            return Response(researcher)  # Devuelve los detalles del investigador
        return Response({"error": "Investigador no encontrado."}, status=404)  # Devuelve un error si no se encuentra el investigador
    
    def update(self, request, pk=None):
        # Verifica si el usuario autenticado es el mismo que el investigador que se intenta modificar
        if request.user.username != investigadores.find_one({"_id": ObjectId(pk)})["email"]:
            return Response({"error": "No puedes modificar un investigador que no eres tú."}, status=403)  # Devuelve un error si el usuario no tiene permiso

        data = request.data  # Obtiene los datos de la solicitud
        investigadores.update_one({"_id": ObjectId(pk)}, {"$set": data})  # Actualiza los datos del investigador en la base de datos

        return Response({"message": "Investigador actualizado."})  # Devuelve un mensaje de éxito
    
    def get_grupos(self, request, pk=None):
        # Obtiene los grupos a los que pertenece un investigador específico
        groups = grupos.find({"investigadores": ObjectId(pk)})
        groups = list(groups)  # Convierte el cursor a lista
        return Response(groups)  # Devuelve la lista de grupos
    
    def get_proyectos(self, request, pk=None):
        # Obtiene los proyectos a los que pertenece un investigador específico
        projects = proyectos.find({"investigadores": ObjectId(pk)})
        projects = list(projects)  # Convierte el cursor a lista
        return Response(projects)  # Devuelve la lista de proyectos


class GrupoViewSet(mixins.ListModelMixin,
                   mixins.RetrieveModelMixin,
                   mixins.UpdateModelMixin,
                   viewsets.GenericViewSet):
    
    # Definición de la clase de serialización y paginación para los grupos
    serializer_class = GrupoSerializer
    pagination_class = GrupoPagination

    def get_permissions(self):
        # Asignar permisos diferentes dependiendo del método HTTP
        if self.request.method in ['GET']:
            return [AllowAny()]  # Permitir acceso a cualquier usuario para las peticiones GET
        return [IsAuthenticated()]  # Requiere autenticación para otros métodos
    
    def list(self, request):
        # Captura los parámetros de búsqueda y ordenamiento desde la consulta de la petición
        search_query = request.query_params.get('search', None)
        sort_field = request.query_params.get('sortField', None)
        sort_order = request.query_params.get('sortOrder', 'asc')  # Orden ascendente por defecto

        investigador_id = request.query_params.get('investigador', None)
        
        query = {}  # Inicializa la consulta vacía

        # Si hay un parámetro de búsqueda, construye la consulta
        if search_query:
            query = {
                "$or": [
                    {"nombre": {"$regex": search_query, "$options": "i"}},  # Busca en el nombre
                    {"descripcion": {"$regex": search_query, "$options": "i"}},  # Busca en la descripción
                ]
            }

        # Obtiene todos los grupos desde la base de datos
        all_groups = list(grupos.find(query))

        # Ordena los grupos si se especifica un campo de ordenamiento
        if sort_field:
            reverse_order = sort_order == 'desc'  # Determina el orden inverso si es 'desc'
            all_groups.sort(key=lambda x: x.get(sort_field, '').lower(), reverse=reverse_order)  # Ordena los grupos

        # Añade el campo "id" y elimina "_id" de cada grupo
        for group in all_groups:
            group["id"] = str(group.pop("_id"))  # Utiliza pop para eliminar y obtener al mismo tiempo

        # Implementa la paginación
        page = self.paginate_queryset(all_groups)
        if page is not None:
            return self.get_paginated_response(page)  # Devuelve la respuesta paginada

        return Response(all_groups)  # Devuelve todos los grupos si no hay paginación
    
    def queryset(self):
        return grupos.find()

    def retrieve(self, request, pk=None):
        # Recupera un grupo específico por su ID
        group = grupos.find_one({"_id": ObjectId(pk)})
        if group:
            group["id"] = str(group["_id"])  # Añade el campo "id"
            del group["_id"]  # Elimina el campo "_id"

            # Busca los proyectos asociados al grupo
            projects = proyectos.find()
            projects = [project for project in projects if pk in project["grupos"]]  # Filtra los proyectos relacionados
            
            # Añade el campo "id" a los proyectos
            for project in projects:
                project["id"] = str(project["_id"])
                del project["_id"]
            
            group["proyectos"] = projects  # Agrega los proyectos al grupo

            return Response(group)  # Devuelve el grupo con sus proyectos
        return Response({"error": "Grupo no encontrado."}, status=404)  # Mensaje de error si no se encuentra el grupo
    
    
    def create(self, request):
        # Permite crear un nuevo grupo
        data = request.data  # Obtiene los datos del nuevo grupo
        grupos.insert_one(data)  # Inserta el nuevo grupo en la base de datos
        return Response({"message": "Grupo creado."})  # Mensaje de éxito
    
    def update(self, request, pk=None):
        # Permite actualizar un grupo existente
        # Verifica si el usuario pertenece al grupo antes de permitir la modificación
        if request.user.username not in [investigador["email"] for investigador in investigadores.find({"grupos": ObjectId(pk)})]:
            return Response({"error": "No puedes modificar un grupo al que no perteneces."}, status=403)  # Mensaje de error si no tiene permisos
        
        data = request.data  # Obtiene los datos a actualizar
        grupos.update_one({"_id": ObjectId(pk)}, {"$set": data})  # Actualiza el grupo en la base de datos
        return Response({"message": "Grupo actualizado."})  # Mensaje de éxito
    
    def destroy(self, request, pk=None):
        # Permite eliminar un grupo
        grupo_a_eliminar = grupos.find_one({"_id": ObjectId(pk)})
        if not grupo_a_eliminar:
            return Response({"error": "Grupo no encontrado."}, status=404)  # Mensaje de error si el grupo no existe

        # Obtiene los correos electrónicos de los investigadores asociados al grupo
        investigadores_correo = []
        for investigadorId in grupo_a_eliminar["investigadores"]:
            investigador = investigadores.find_one({"_id": ObjectId(investigadorId)})
            investigadores_correo.append(investigador["email"])

        # Verifica si el usuario tiene permisos para eliminar el grupo
        if request.user.username not in investigadores_correo and investigadores_correo:
            return Response({"error": "No puedes eliminar un grupo al que no perteneces."}, status=403)  # Mensaje de error si no tiene permisos
        
        grupos.delete_one({"_id": ObjectId(pk)})  # Elimina el grupo de la base de datos
        return Response({"message": "Grupo eliminado."})  # Mensaje de éxito
    
    def get_investigadores(self, request, pk=None):
        # Recupera todos los investigadores asociados a un grupo específico
        researchers = investigadores.find({"grupos": ObjectId(pk)})
        researchers = list(researchers)  # Convierte el cursor en una lista
        return Response(researchers)  # Devuelve la lista de investigadores
    
    def get_proyectos(self, request, pk=None):
        # Recupera todos los proyectos asociados a un grupo específico
        projects = proyectos.find({"grupo": ObjectId(pk)})
        projects = list(projects)  # Convierte el cursor en una lista
        return Response(projects)  # Devuelve la lista de proyectos


class ProyectoViewSet(mixins.ListModelMixin,
                          mixins.RetrieveModelMixin,
                          mixins.UpdateModelMixin,
                          viewsets.GenericViewSet):
    
    serializer_class = ProyectoSerializer  # Define el serializador que se usará para los proyectos
    pagination_class = GrupoPagination  # Define la clase de paginación a usar

    def get_permissions(self):
        # Asignar permisos diferentes dependiendo del método HTTP
        if self.request.method in ['GET']:
            return [AllowAny()]  # Permitir acceso a cualquier usuario para las peticiones GET
        return [IsAuthenticated()]  # Requiere autenticación para otros métodos

    def list(self, request):
        # Captura los parámetros de búsqueda y ordenamiento desde la consulta de la petición
        search_query = request.query_params.get('search', None)  # Captura la consulta de búsqueda
        sort_field = request.query_params.get('sortField', None)  # Captura el campo por el que se quiere ordenar
        sort_order = request.query_params.get('sortOrder', 'asc')  # Orden ascendente por defecto

        investigador_id = request.query_params.get('investigador', None)  # Captura el ID del investigador
        grupo_id = request.query_params.get('grupo', None)  # Captura el ID del grupo

        query = {}  # Inicializa la consulta vacía

        # Si hay un parámetro de búsqueda, construye la consulta
        if search_query:
            query = {
                "$or": [
                    {"nombre": {"$regex": search_query, "$options": "i"}},  # Busca en el nombre
                    {"descripcion": {"$regex": search_query, "$options": "i"}},  # Busca en la descripción
                    {"keyword": {"$regex": search_query, "$options": "i"}},  # Busca en las palabras clave
                    {"fecha": {"$regex": search_query, "$options": "i"}},  # Busca en la fecha
                ]
            }

        # Filtra proyectos por investigador
        if investigador_id:
            query['investigadores'] = ObjectId(investigador_id)

        # Filtra proyectos por grupo
        if grupo_id:
            query['grupo'] = ObjectId(grupo_id)

        # Obtiene todos los proyectos desde la base de datos
        all_projects = list(proyectos.find(query))

        # Ordena los proyectos si se especifica un campo de ordenamiento
        if sort_field:
            reverse_order = sort_order == 'desc'  # Determina si el orden es inverso
            all_projects = sorted(all_projects, key=lambda x: x.get(sort_field, '').lower() if x.get(sort_field) else '', reverse=reverse_order)

        # Añade el campo "id" y elimina "_id" de cada proyecto
        for project in all_projects:
            project["id"] = str(project["_id"])  # Añade el campo "id"
            del project["_id"]  # Elimina el campo "_id"

        # Implementa la paginación
        page = self.paginate_queryset(all_projects)
        if page is not None:
            return self.get_paginated_response(page)  # Devuelve la respuesta paginada
        
        return Response(all_projects)  # Devuelve todos los proyectos si no hay paginación
    

    def queryset(self):
        return proyectos.find()
    
    def retrieve(self, request, pk=None):
        # Recupera un proyecto específico por su ID
        project = proyectos.find_one({"_id": ObjectId(pk)})
        if project:
            project["id"] = str(project["_id"])  # Añade el campo "id"
            del project["_id"]  # Elimina el campo "_id"
            return Response(project)  # Devuelve el proyecto encontrado
        return Response({"error": "Proyecto no encontrado."}, status=404)  # Mensaje de error si no se encuentra el proyecto
    
    def create(self, request):
        # Permite crear un nuevo proyecto, requiere autenticación
        data = request.data  # Obtiene los datos del nuevo proyecto
        proyectos.insert_one(data)  # Inserta el nuevo proyecto en la base de datos
        return Response({"message": "Proyecto creado."})  # Mensaje de éxito
    
    def update(self, request, pk=None):
        # Permite actualizar un proyecto existente
        # Verifica si el usuario pertenece al proyecto antes de permitir la modificación
        if request.user.username not in [investigador["email"] for investigador in investigadores.find({"proyectos": ObjectId(pk)})]:
            return Response({"error": "No puedes modificar un proyecto al que no perteneces."}, status=403)  # Mensaje de error si no tiene permisos
        
        data = request.data  # Obtiene los datos a actualizar
        proyectos.update_one({"_id": ObjectId(pk)}, {"$set": data})  # Actualiza el proyecto en la base de datos
        return Response({"message": "Proyecto actualizado."})  # Mensaje de éxito
    
    def destroy(self, request, pk=None):
        # Permite eliminar un proyecto
        proyecto_a_eliminar = proyectos.find_one({"_id": ObjectId(pk)})
        if not proyecto_a_eliminar:
            return Response({"error": "Proyecto no encontrado."}, status=404)  # Mensaje de error si el proyecto no existe

        # Obtiene los correos electrónicos de los investigadores asociados al proyecto
        investigadores_correo = []
        for investigadorId in proyecto_a_eliminar["investigadores"]:
            investigador = investigadores.find_one({"_id": ObjectId(investigadorId)})
            investigadores_correo.append(investigador["email"])  # Almacena el correo del investigador

        # Verifica si el usuario tiene permisos para eliminar el proyecto
        if request.user.username not in investigadores_correo and investigadores_correo:
            return Response({"error": "No puedes eliminar un proyecto al que no perteneces."}, status=403)  # Mensaje de error si no tiene permisos
        
        proyectos.delete_one({"_id": ObjectId(pk)})  # Elimina el proyecto de la base de datos
        return Response({"message": "Proyecto eliminado."})  # Mensaje de éxito
    
    def get_investigadores(self, request, pk=None):
        # Recupera todos los investigadores asociados a un proyecto específico
        researchers = investigadores.find({"proyectos": ObjectId(pk)})  # Busca investigadores que están asociados al proyecto
        researchers = list(researchers)  # Convierte el cursor en una lista
        return Response(researchers)  # Devuelve la lista de investigadores
    
    def get_grupos(self, request, pk=None):
        # Recupera todos los grupos asociados a un proyecto específico
        groups = grupos.find({"proyectos": ObjectId(pk)})  # Busca grupos que están asociados al proyecto
        groups = list(groups)  # Convierte el cursor en una lista
        return Response(groups)  # Devuelve la lista de grupos



@api_view(['POST'])  # Decorador que permite que la vista solo acepte solicitudes POST
@permission_classes([AllowAny])  # Permite que cualquier usuario, autenticado o no, acceda a esta vista
def signup(request):
    
    username = request.data.get("username")  # Obtiene el nombre de usuario del cuerpo de la solicitud

    # Verifica si el correo del usuario termina en @upm.es o @alumnos.upm.es
    if username.endswith('@upm.es') or username.endswith('@alumnos.upm.es'):

        # SI no existe el usuario, lo crea

        if not User.objects.filter(username=username).exists() and not investigadores.find_one({"email": username}):
            user = User(username=username)  # Crea una instancia del usuario
            user.set_password(request.data.get("password"))  # Establece la contraseña del usuario

            user.save()  # Intenta guardar el nuevo usuario en la base de datos
        
            investigadores.insert_one({"email": username})
            return Response({"message": "User created."}, status=201)  # Mensaje de éxito si el usuario se crea correctamente
        else:
            return Response({"error": "User already exists."}, status=400)         

    else:
        return Response({"error": "Invalid email."}, status=400)  # Mensaje de error si el correo no es válido



@api_view(['POST'])  # Permite que la vista acepte solicitudes POST
@permission_classes([AllowAny])  # Permite que cualquier usuario acceda a esta vista sin autenticación
def signin(request):

    username = request.data.get("email")  # Obtiene el correo electrónico del cuerpo de la solicitud
    password = request.data.get("password")  # Obtiene la contraseña del cuerpo de la solicitud
    
    # Autentica al usuario utilizando el nombre de usuario y la contraseña
    user = authenticate(request, username=username, password=password)

    if user is None:
        return Response({"error": "Username and password did not match."}, status=400)  # Mensaje de error si las credenciales son incorrectas

    # Crea tokens JWT para el usuario autenticado
    refresh = RefreshToken.for_user(user)  # Crea un token de actualización

    return Response({
        'refresh': str(refresh),  # Token de actualización (opcional)
        'access': str(refresh.access_token),  # Token de acceso
        'user': username,  # Devuelve el nombre de usuario
    }, status=200)  # Respuesta exitosa



@permission_classes([IsAuthenticated])  # Requiere autenticación para acceder a esta vista
@api_view(['POST'])  # Permite que la vista acepte solicitudes POST
def signout(request):
    if request.method == 'POST':  # Verifica que el método sea POST
        logout(request)  # Cierra la sesión del usuario
        return redirect('home')  # Redirige a la página principal (home)


@api_view(['PUT'])  # Allow PUT requests
@permission_classes([IsAuthenticated])  # Require the user to be authenticated
def modify_password(request):
    username = request.user.username  # Get the authenticated user's username
    new_password = request.data.get("new_password")  # Get the new password from the request
    password = request.data.get("password")  # Get the current password from the request

    if not password or not new_password:
        return Response({"error": "Both current and new passwords are required."}, status=400)

    # Authenticate the user with the current password
    user = authenticate(request, username=username, password=password)

    if user is None:
        print("Current password did not match.")
        return Response({"error": "Current password did not match."}, status=400)
    else:
        # Set the new password and save the user
        user.set_password(new_password)
        user.save()
        return Response({"message": "Password updated successfully."}, status=200)
