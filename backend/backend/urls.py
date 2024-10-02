from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from logicrud.views import DeviceReadingViewSet, DeviceReadingListCreate
from logicrud.views import SensorDataView
from logicrud.views import ProcessMatlabView
from logicrud.views import test_cors_view

# Using DRF DefaultRouter for the ViewSet
router = DefaultRouter()
router.register(r"device_readings", DeviceReadingViewSet)

urlpatterns = [
    path("api/test_cors/", test_cors_view, name="test_cors"),
    path("admin/", admin.site.urls),
    path(
        "api/", include(router.urls)
    ),  # API routes for DeviceReadingViewSet (all CRUD operations)
    path(
        "api/device_readings_list_create/",
        DeviceReadingListCreate.as_view(),
        name="device_reading_list_create",
    ),  # Custom path for list and create operations only
    path("api/sensor-data/", SensorDataView.as_view(), name="sensor-data"),
    path("api/process_matlab/", ProcessMatlabView.as_view(), name="process_matlab"),
]
