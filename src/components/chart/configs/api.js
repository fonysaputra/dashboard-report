export const fetchChartData = async () => {
    const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/dashboard/report/chart`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json(); // Assuming your API returns JSON data
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error; // Propagate the error so it can be handled where the function is called
    }
  };
  