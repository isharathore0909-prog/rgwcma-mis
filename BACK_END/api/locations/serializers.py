from rest_framework import serializers
from api.models import District, Block, GramPanchayat

class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = ['id', 'name']

class BlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Block
        fields = ['id', 'name', 'district']

class GramPanchayatSerializer(serializers.ModelSerializer):
    class Meta:
        model = GramPanchayat
        fields = ['id', 'name', 'block']
