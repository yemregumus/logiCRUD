function matlab(sensor_data_json)
   % Parse JSON data
   sensor_data = jsondecode(sensor_data_json);
   sensor_names = {sensor_data.device_name};
   sensor_values = [sensor_data.reading_value];
   sensor_timestamps = {sensor_data.reading_time};

   data_table = table(sensor_names', sensor_values', sensor_timestamps', ...
                      'VariableNames', {'Sensor', 'Value', 'Timestamp'});

   stats_mean = varfun(@mean, data_table, 'InputVariables', 'Value', 'GroupingVariables', 'Sensor');
   stats_median = varfun(@median, data_table, 'InputVariables', 'Value', 'GroupingVariables', 'Sensor');

   % Use absolute paths
   writetable(stats_mean, 'D:\school stuff\projects\logiCRUD\backend\mean_values.csv');
   writetable(stats_median, 'D:\school stuff\projects\logiCRUD\backend\median_values.csv');
end
