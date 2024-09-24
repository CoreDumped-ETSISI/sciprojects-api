"""API URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from APP import views

urlpatterns = [
    path('', views.home, name='home'),
    path("admin/", admin.site.urls),
    path("signup/", views.signup, name="signup"),
    path("signin/", views.signin, name="signin"),
    path("logout/", views.signout, name="logout"),
    path("investigadores/", views.get_investigadores, name="investigadores"),
    path("investigadores/<str:investigador_id>/", views.get_investigadores, name="investigadores"),

    path("grupos/", views.get_grupos, name="grupos"),
    path("grupos/create/", views.create_group, name="create_group"),
    path("grupos/<str:grupo_id>/", views.get_grupos, name="grupos"),

    path("proyectos/", views.get_proyectos, name="proyectos"),
    path("proyectos/create/", views.create_project, name="create_project"),
    path("proyectos/<str:proyecto_id>/", views.get_proyectos, name="proyectos"),

    path("profile/", views.modify_profile, name="modify_profile"),
    path("profile/password/", views.modify_password, name="modify_password"),



]
