from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from views import InvestigadorViewSet, GrupoViewSet, ProyectoViewSet, signup, signin, signout, modify_password
# Importación de vistas para la autenticación con JWT
from rest_framework_simplejwt.views import (
    TokenObtainPairView,   # Vista para obtener un par de tokens (acceso y refresco)
    TokenRefreshView,      # Vista para refrescar el token de acceso
    TokenVerifyView,       # Vista para verificar la validez del token
)

# Configuración del enrutador para la API.
router = routers.DefaultRouter()
# Registro de los viewsets en el enrutador.
router.register(r'investigadores', InvestigadorViewSet, basename='investigador')  # Ruta para 'investigadores'
router.register(r'grupos', GrupoViewSet, basename='grupo')                      # Ruta para 'grupos'
router.register(r'proyectos', ProyectoViewSet, basename='proyecto')              # Ruta para 'proyectos'

# Definición de las rutas de la aplicación.
urlpatterns = [
    # Panel de administración
    path('admin/', admin.site.urls),

    # Incluir todas las rutas definidas por el enrutador.
    path('api/v1/', include(router.urls)),

    # Rutas para la funcionalidad de registro y autenticación de usuarios.
    path('api/v1/signup/', signup, name='signup'),             # Ruta para el registro de usuarios
    path('api/v1/signin/', signin, name='signin'),             # Ruta para el inicio de sesión
    path('api/v1/logout/', signout, name='logout'),            # Ruta para cerrar sesión
    path('api/v1/change_password/', modify_password, name='modify_password'),  # Ruta para cambiar contraseña

    # Rutas de autenticación JWT
    path('api/v1/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),     # Ruta para obtener el token JWT
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),    # Ruta para refrescar el token JWT
    path('api/v1/token/verify/', TokenVerifyView.as_view(), name='token_verify'),       # Ruta para verificar el token JWT
]
