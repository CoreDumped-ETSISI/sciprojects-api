from rest_framework import serializers

class InvestigadorSerializer(serializers.Serializer):
    """
        Los campos básicos de un investigador son:
        - Nombre
        - Apellidos
        - Correo
        - Link

        El campo correo, nombre y apellidos son obligatorios
    """
    nombre = serializers.CharField(max_length=100)
    apellidos = serializers.CharField(max_length=100)
    correo = serializers.EmailField()
    link = serializers.URLField(required=False)

    class Meta:
        fields = ['nombre', 'apellidos', 'correo', 'link']



class GrupoSerializer(serializers.Serializer):
    """
        Los campos básicos de un grupo son:
        - Nombre
        - Descripción
        - Link
        - Investigadores

        El campo nombre es obligatorio
    """
    nombre = serializers.CharField(max_length=100)
    descripcion = serializers.CharField(max_length=100)
    link = serializers.URLField(required=False)
    investigadores = InvestigadorSerializer(many=True)

    fields = ['nombre', 'descripcion', 'link', 'investigadores']

class ProyectoSerializer(serializers.Serializer):
    """
        Los campos básicos de un proyecto son:
        - Nombre
        - Descripción
        - Link
        - Fecha
        - Keywords
        - Investigadores
        - Grupos

        El campo nombre es obligatorio

    """
    nombre = serializers.CharField(max_length=100)
    descripcion = serializers.CharField(max_length=100)
    link = serializers.URLField(required=False)
    fecha_inicio = serializers.DateField(required=False)
    keywords = serializers.CharField(max_length=200, required=False)
    investigadores = InvestigadorSerializer(many=True)
    grupos = GrupoSerializer(many=True)


    fields = ['nombre', 'descripcion', 'link', 'fecha', 'keywords', 'investigadores', 'grupos']