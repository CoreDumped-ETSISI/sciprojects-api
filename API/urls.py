from django.contrib import admin
from django.urls import path, include
from APP import views


# agregar la ruta de la API
urlpatterns = [
    # Panel de administración, que no hemos modificado y tampoco es funcional
    path('admin/', admin.site.urls),
    # incluir las rutas de la API
    path('api/v1/', include('APP.urls')),
]
