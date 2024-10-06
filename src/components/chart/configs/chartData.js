import React, { useState, useEffect } from "react";
import axios from "axios";
import Chart from "react-apexcharts"; // Assuming you're using a library like ApexCharts

const LineChart = () => {
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        width: "100%",
        height: 350,
        type: "area",
        toolbar: {
          show: false,
        },
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
      yaxis: {
        labels: {
          style: {
            fontSize: "14px",
            fontWeight: 600,
            colors: ["#8c8c8c"],
          },
        },
      },
      xaxis: {
        labels: {
          style: {
            fontSize: "14px",
            fontWeight: 600,
            colors: Array(9).fill("#8c8c8c"), // Fills an array with the color
          },
        },
        categories: [
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
        ],
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val;
          },
        },
      },
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace with your API endpoint
        const response = await axios.get("https://api.example.com/chart-data");
        const { mobileApps, websites } = response.data; // Adjust based on your API response structure

        setChartData((prevData) => ({
          ...prevData,
          series: [
            {
              name: "Mobile apps",
              data: mobileApps, // Assuming your API returns this
              offsetY: 0,
            },
            {
              name: "Websites",
              data: websites, // Assuming your API returns this
              offsetY: 0,
            },
          ],
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div>
      <Chart options={chartData.options} series={chartData.series} type="area" height={350} />
    </div>
  );
};

export default LineChart;
