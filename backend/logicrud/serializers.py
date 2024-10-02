from rest_framework import serializers
from .models import DeviceReading


class DeviceReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceReading
        fields = "__all__"
