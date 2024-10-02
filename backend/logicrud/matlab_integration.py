import subprocess
import json
import os
import pandas as pd


def process_sensor_data(sensor_data_json):
    # Parse JSON data
    sensor_data = json.loads(sensor_data_json)

    # Convert the data into a pandas DataFrame for easier processing
    df = pd.DataFrame(sensor_data)

    # Ensure necessary fields are present
    if not all(
        col in df.columns for col in ["device_name", "reading_value", "reading_time"]
    ):
        raise ValueError(
            "Invalid sensor data format. Required fields: 'device_name', 'reading_value', 'reading_time'."
        )

    # Group by 'device_name' and calculate mean and median for each sensor's readings
    mean_values = df.groupby("device_name")["reading_value"].mean().reset_index()
    median_values = df.groupby("device_name")["reading_value"].median().reset_index()

    # Save the mean and median values to CSV (assuming this is required for MATLAB processing)
    mean_file_path = "mean_values.csv"
    median_file_path = "median_values.csv"
    mean_values.columns = ["Sensor", "mean_Value"]
    median_values.columns = ["Sensor", "median_Value"]

    mean_values.to_csv(mean_file_path, index=False)
    median_values.to_csv(median_file_path, index=False)

    # (Optional) Call the MATLAB script using the command line (if needed)
    # If MATLAB doesn't need to be called, you can skip this part or adjust it based on your real requirements
    matlab_command = (
        f"matlab -batch \"matlab('{mean_file_path}', '{median_file_path}')\""
    )
    subprocess.run(matlab_command, shell=True)

    # Read results back into Python
    mean_dict = mean_values.set_index("Sensor").to_dict()["mean_Value"]
    median_dict = median_values.set_index("Sensor").to_dict()["median_Value"]

    return {
        "mean_values": mean_dict,
        "median_values": median_dict,
        "message": "Data processed successfully!",
    }


# Example usage
sensor_data_json = """
[
    {
        "id": 1,
        "device_name": "Nuclear Reactor",
        "reading_value": 112.58,
        "reading_time": "2024-09-29T16:23:26.146783Z"
    },
    {
        "id": 12,
        "device_name": "Temperature Sensor",
        "reading_value": 25.4,
        "reading_time": "2024-09-29T16:00:00Z"
    },
    {
        "id": 13,
        "device_name": "Pressure Sensor",
        "reading_value": 101.3,
        "reading_time": "2024-09-29T16:05:00Z"
    },
    {
        "id": 14,
        "device_name": "Humidity Sensor",
        "reading_value": 60.2,
        "reading_time": "2024-09-29T16:10:00Z"
    },
     {
        "id": 14,
        "device_name": "Humidity Sensor",
        "reading_value": 100.2,
        "reading_time": "2024-09-29T16:10:00Z"
    },
     {
        "id": 14,
        "device_name": "Humidity Sensor",
        "reading_value": 160.2,
        "reading_time": "2024-09-29T16:10:00Z"
    }
]
"""

results = process_sensor_data(sensor_data_json)
print(json.dumps(results, indent=4))
