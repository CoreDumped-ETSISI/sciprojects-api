from django.urls import path, include
from rest_framework.documentation import include_docs_urls
from rest_framework import routers
from django.contrib import admin
from APP import views


from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
router = routers.DefaultRouter()
router.register(r'investigadores', views.InvestigadorViewSet, basename='investigador')
router.register(r'grupos', views.GrupoViewSet, basename='grupo')
router.register(r'proyectos', views.ProyectoViewSet, basename='proyecto')

urlpatterns = [
    
    #path('docs/', include_docs_urls(title='API de Investigacion')),
#    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),

    path('', include(router.urls)),
    path('signup/', views.signup, name='signup'),
    path('signin/', views.signin, name='signin'),
    path('logout/', views.signout, name='logout'),

    path('change_password/', views.modify_password, name='modify_password'),

    # Rutas de autenticación JWT
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),


]
