from django.db import models


class DeviceReading(models.Model):
    id = models.AutoField(primary_key=True)  # Auto-generated ID, primary key
    device_name = models.TextField()  # Using TextField for more flexibility
    reading_value = models.FloatField()  # Float or Numeric can be FloatField in Django
    reading_time = models.DateTimeField(
        auto_now_add=True
    )  # Automatically sets the timestamp
    objects = models.Manager()

    def __str__(self):
        return f"{self.device_name} - {self.reading_value} at {self.reading_time}"
