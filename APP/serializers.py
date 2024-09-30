from rest_framework import serializers

class InvestigadorSerializer(serializers.Serializer):
    """
        Los campos básicos de un investigador son:
        - Nombre
        - Apellidos
        - Correo
        - Link

        El campo correo, nombre y apellidos son obligatorios

        El resto de campos son opcionales le pueden meter un json para ampliar los datos que quieran mostrar
    """
    nombre = serializers.CharField(max_length=100)
    apellidos = serializers.CharField(max_length=100)
    correo = serializers.EmailField()
    link = serializers.URLField(required=False)
    more_info = serializers.JSONField(required=False)

    # agregamos los campos de more_info a fields

    class Meta:
        fields = ['nombre', 'apellidos', 'correo', 'link', 'more_info']



class GrupoSerializer(serializers.Serializer):
    """
        Los campos básicos de un grupo son:
        - Nombre
        - Descripción
        - Link
        - Investigadores

        El campo nombre es obligatorio

        El resto de campos son opcionales le pueden meter un json para ampliar los datos que quieran mostrar
    """
    nombre = serializers.CharField(max_length=100)
    descripcion = serializers.CharField(max_length=100)
    link = serializers.URLField(required=False)
    more_info = serializers.JSONField(required=False)
    investigadores = InvestigadorSerializer(many=True)

    fields = ['nombre', 'descripcion', 'link', 'more_info', 'investigadores']

class ProyectoSerializer(serializers.Serializer):
    """
        Los campos básicos de un proyecto son:
        - Nombre
        - Descripción
        - Link
        - Fecha de inicio
        - Fecha de fin
        - Keywords
        - Investigadores
        - Grupos

        El campo nombre es obligatorio

        El resto de campos son opcionales le pueden meter un json para ampliar los datos que quieran mostrar
    """
    nombre = serializers.CharField(max_length=100)
    descripcion = serializers.CharField(max_length=100)
    link = serializers.URLField(required=False)
    fecha_inicio = serializers.DateField(required=False)
    fecha_fin = serializers.DateField(required=False)
    keywords = serializers.CharField(max_length=200, required=False)
    more_info = serializers.JSONField(required=False)
    investigadores = InvestigadorSerializer(many=True)
    grupos = GrupoSerializer(many=True)


    fields = ['nombre', 'descripcion', 'link', 'fecha_inicio', 'fecha_fin', 'keywords', 'more_info', 'investigadores', 'grupos']
# Compare this snippet from APP/models.py:

