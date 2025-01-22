-- Retrieve all records from the logicrud_devicereading table.
SELECT * 
FROM logicrud_devicereading;

-- Retrieve the latest reading for each device (based on reading_time), ensuring uniqueness by device_name.
SELECT DISTINCT ON (device_name) device_name, reading_value, reading_time
FROM logicrud_devicereading
ORDER BY device_name, reading_time DESC;

-- Retrieve all records from the logicrud_devicereading table where the device_name is 'Light Sensor'.
SELECT * 
FROM logicrud_devicereading 
WHERE device_name = 'Light Sensor';

-- Retrieve records from the logicrud_devicereading table where the reading_time is within a specific date range.
SELECT * 
FROM logicrud_devicereading 
WHERE reading_time BETWEEN '2024-10-01 00:00:00' AND '2024-10-15 23:59:59';

-- Retrieve all records from the logicrud_devicereading table, sorted by reading_value in descending order.
SELECT * 
FROM logicrud_devicereading 
ORDER BY reading_value DESC;

-- Calculate the average reading_value for each device and display the device_name along with the average value.
SELECT device_name, AVG(reading_value) AS avg_reading
FROM logicrud_devicereading
GROUP BY device_name;

-- Create or replace a function named get_max_reading that returns the maximum reading_value for a specified device.
CREATE OR REPLACE FUNCTION get_max_reading(p_device_name TEXT)
RETURNS DOUBLE PRECISION
LANGUAGE plpgsql
AS $$
DECLARE
    max_reading DOUBLE PRECISION; -- Variable to store the maximum reading value
BEGIN
    -- Select the maximum reading_value for the given device_name and store it in max_reading.
    SELECT MAX(reading_value)
    INTO max_reading
    FROM logicrud_devicereading
    WHERE device_name = p_device_name;
    
    -- Return the maximum reading value.
    RETURN max_reading;
END;
$$;

-- Call the get_max_reading function for the 'Light Sensor' device and return its maximum reading value.
SELECT get_max_reading('Light Sensor');
