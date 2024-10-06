// lineChart.js

import React, { useState, useEffect } from 'react';
import ApexCharts from 'react-apexcharts';
import { fetchChartData } from './api'; // Adjust the path as per your file structure

import { Typography } from "antd";
import { MinusOutlined } from "@ant-design/icons";

const LineChart = () => {
  const [chartData, setChartData] = useState(null);

  const { Title, Paragraph } = Typography;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchChartData(); // Call the API function
        setChartData(data); // Set the fetched data to state
      } catch (error) {
        console.error('Error fetching chart data:', error);
        // Handle errors, e.g., display a message to the user
      }
    };

    fetchData(); // Call fetchData function when component mounts
  }, []); // Empty dependency array ensures this effect runs only once

  const options = {
    chart: {
      width: '100%',
      height: 350,
      type: 'area',
      toolbar: {
        show: true,
      },
    },
    legend: {
      show: true,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '14px',
          fontWeight: 600,
          colors: ['#8c8c8c'],
        },
      },
    },
    xaxis: {
      labels: {
        style: {
          fontSize: '14px',
          fontWeight: 600,
          colors: ['#8c8c8c'],
        },
      },
      categories: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ],
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val;
        },
      },
    },
  };

  return (
    <>
      <div className="linechart">
        <div>
          <Title level={5}>Cases Report</Title>
         
        </div>
    
      </div>

    <div>
      {chartData ? (
        <ApexCharts options={options} series={chartData.series} type="area" height={350} />
      ) : (
        <div>Loading chart...</div>
      )}
    </div>
    </>
  );
};

export default LineChart;
