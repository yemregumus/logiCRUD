import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { Line } from "react-chartjs-2";

Chart.register(...registerables);

const LineChartComponent = ({ readings }) => {
  const chartRef = useRef(null); // Create a reference for the chart instance

  const chartData = {
    labels: readings.map((reading) => reading.reading_time),
    datasets: [
      {
        label: "Reading Value",
        data: readings.map((reading) => reading.reading_value),
        fill: false,
        borderColor: "rgba(75,192,192,1)",
      },
    ],
  };

  useEffect(() => {
    const chartInstance = chartRef.current;

    // Clean up the chart on unmount
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, []);

  return <Line ref={chartRef} data={chartData} />;
};

export default LineChartComponent;
