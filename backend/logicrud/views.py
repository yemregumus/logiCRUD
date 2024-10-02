from rest_framework import viewsets, generics
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging
import json

from logicrud.matlab_integration import process_sensor_data
from .models import DeviceReading
from .serializers import DeviceReadingSerializer

logger = logging.getLogger(__name__)


# Test view for CORS
@api_view(["GET"])
def test_cors_view(request):
    return Response({"message": "CORS is working!"})


# ViewSet for DeviceReadings
class DeviceReadingViewSet(viewsets.ModelViewSet):
    queryset = DeviceReading.objects.all()
    serializer_class = DeviceReadingSerializer


# List and create DeviceReadings
class DeviceReadingListCreate(generics.ListCreateAPIView):
    queryset = DeviceReading.objects.all()
    serializer_class = DeviceReadingSerializer


# Sensor Data View
class SensorDataView(APIView):
    def get(self, request):
        try:
            device_readings = DeviceReading.objects.all()
            serializer = DeviceReadingSerializer(device_readings, many=True)
            return Response({"sensor_data": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        sensor_data = request.data.get("sensor_data")
        if not sensor_data:
            return Response(
                {"error": "No sensor data provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            matlab_result = process_sensor_data(sensor_data_json=sensor_data)
            return Response({"result": matlab_result}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error processing sensor data: {str(e)}")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProcessMatlabView(APIView):
    def post(self, request):
        try:
            # Log the incoming data for debugging
            logger.info(f"Incoming request data: {request.data}")

            data = request.data  # Should be a list of sensor readings

            if isinstance(data, list):
                # Convert the list of sensor data to a JSON string
                sensor_data_json = json.dumps(data)

                # Log the converted JSON data
                logger.info(f"JSON data to be processed: {sensor_data_json}")

                # Call the process_sensor_data function with the JSON string
                matlab_result = process_sensor_data(sensor_data_json=sensor_data_json)

                return Response(
                    {
                        "result": matlab_result,
                        "message": "Data processed successfully!",
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"detail": "Expected a list of sensor data"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except Exception as e:
            logger.error(f"Error processing sensor data: {str(e)}")
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
