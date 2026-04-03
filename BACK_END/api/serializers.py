from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        return token

class CalculationInputSerializer(serializers.Serializer):
    # This can be used to validate inputs for GEC calculations
    # Since the input is very dynamic, we might just use a JSONField or keep it loose
    data = serializers.JSONField()

class WaterBalanceSerializer(serializers.Serializer):
    # Serializer for the output of GEC calculations
    areaHa = serializers.FloatField(required=False)
    totalGwAvailable = serializers.FloatField(required=False)
    stageOfExtraction = serializers.FloatField(required=False)
    category = serializers.CharField(required=False)
    # Add other fields as needed
