from django.urls import path, include
from rest_framework.documentation import include_docs_urls
from rest_framework import routers
from django.contrib import admin
from APP import views

# Importación de vistas para la autenticación con JWT
from rest_framework_simplejwt.views import (
    TokenObtainPairView,   # Vista para obtener un par de tokens (acceso y refresco)
    TokenRefreshView,      # Vista para refrescar el token de acceso
    TokenVerifyView,       # Vista para verificar la validez del token
)

# Configuración del enrutador para la API.
# Utiliza el DefaultRouter de Django REST Framework para gestionar automáticamente las rutas.
router = routers.DefaultRouter()
# Registro de los viewsets en el enrutador.
# Esto vincula las rutas a las vistas de la aplicación.
router.register(r'investigadores', views.InvestigadorViewSet, basename='investigador')  # Ruta para 'investigadores'
router.register(r'grupos', views.GrupoViewSet, basename='grupo')                      # Ruta para 'grupos'
router.register(r'proyectos', views.ProyectoViewSet, basename='proyecto')              # Ruta para 'proyectos'

# Definición de las rutas de la aplicación.
urlpatterns = [

    # Incluir todas las rutas definidas por el enrutador.
    # Esto se traduce en 'investigadores/', 'grupos/', 'proyectos/' y más.
    path('', include(router.urls)),

    # Rutas para la funcionalidad de registro y autenticación de usuarios.
    path('signup/', views.signup, name='signup'),             # Ruta para el registro de usuarios
    path('signin/', views.signin, name='signin'),             # Ruta para el inicio de sesión
    path('logout/', views.signout, name='logout'),            # Ruta para cerrar sesión
    path('change_password/', views.modify_password, name='modify_password'),  # Ruta para cambiar contraseña

    # Rutas de autenticación JWT
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),     # Ruta para obtener el token JWT
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),    # Ruta para refrescar el token JWT
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),       # Ruta para verificar el token JWT
]
