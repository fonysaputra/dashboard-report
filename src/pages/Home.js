
import { useState, useEffect } from "react";

import {
  Card,
  Col,
  Row,
  Typography,
} from "antd";

import LineChart from "../components/chart/configs/lineChart";


function Home() {
  const { Title } = Typography;
  const [counts, setCounts] = useState({
    total: "0",
    inProgress: "0",
    open: "0",
    done: "0",
  });



  useEffect(() => {
    const fetchCounts = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/dashboard/report/count`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // Check if the response status is 401 (Unauthorized)
        if (response.status === 401) {
          localStorage.removeItem("token"); // Remove the token from local storage
          window.location.href = "/sign-in"; // Redirect to the login page
          return; // Stop further execution
        }

        const result = await response.json();
        var total = "0";
        var open = "0";
        var inprogress = "0";
        var done = "0";
        result.data.map((item) => {
          // Use conditions to assign the correct value based on the title
          switch (item.title) {
            case "Total Case":
              total = item.data;
              break;
            case "Open":
              open = item.data;
              break;
            case "In Progress":
              inprogress = item.data;
              break;
            case "Done":
              done = item.data;
              break;
            default:
              break;
          }
        });
        setCounts({
          total: total,
          inProgress: inprogress,  // Use the correct variable here
          open: open,
          done: done,
        });
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();
  }, []);



  const total = [
    <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#fff" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" stroke="black" fill="#fff" />
      <text x="12" y="16" font-size="7" text-anchor="middle" fill="black">T</text>
    </svg>
    ,
  ];
  const inprogress = [
    <svg width="22" height="22" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 2.0845
      a 15.9155 15.9155 0 0 1 0 31.831
      a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="#fff"
        stroke="#ddd"
        stroke-width="2.5"
      />
      <path
        d="M18 2.0845
      a 15.9155 15.9155 0 0 1 0 31.831"
        fill="#fff"
        stroke="#4caf50"
        stroke-width="2.5"
        stroke-dasharray="65, 100"
      />
      <text x="18" y="20.35" font-size="5" text-anchor="middle" fill="#333">65%</text>
    </svg>
    ,
  ];
  const open = [
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22">
      <path fillRule="evenodd"
        clipRule="evenodd" fill="#fff" d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-8V7a3 3 0 0 1 6 0v2h2V7c0-2.757-2.243-5-5-5zm-6 10h12v9H6v-9zm6 2a2 2 0 0 0-2 2c0 1.103.897 2 2 2s2-.897 2-2a2 2 0 0 0-2-2z" />
    </svg>,
  ];
  const cart = [
    <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#fff" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" stroke="green" fill="#fff" />
      <path d="M9 12l2 2l4-4" stroke="green" fill="#fff" />
    </svg>
    ,
  ];

  const countData = [
    {
      title: "Total Case",
      data: counts.total,
      icon: total,
      bnb: "bnb2",
    },
    {
      title: "In Progress",
      data: counts.inProgress,
      icon: inprogress,
      bnb: "bnb2",
    },
    {
      title: "Open",
      data: counts.open,
      icon: open,
      bnb: "redtext",
    },
    {
      title: "Done",
      data: counts.done,
      icon: cart,
      bnb: "bnb2",
    },
  ];


  return (
    <>
      <div className="layout-content">
        <Row className="rowgap-vbox" gutter={[24, 0]}>
          {countData.map((c, index) => (
            <Col
              key={index}
              xs={24}
              sm={24}
              md={12}
              lg={6}
              xl={6}
              className="mb-24"
            >
              <Card bordered={false} className="criclebox ">
                <div className="number">
                  <Row align="middle" gutter={[24, 0]}>
                    <Col xs={18}>
                      <span>{c.title}</span>
                      <Title level={3}>
                        {c.data} <small className={c.bnb}>{c.persent}</small>
                      </Title>
                    </Col>
                    <Col xs={6}>
                      <div className="icon-box">{c.icon}</div>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[24, 0]}>
          {/* <Col xs={24} sm={24} md={12} lg={12} xl={10} className="mb-24">
            <Card bordered={false} className="criclebox h-full">
              <Echart />
            </Card>
          </Col> */}
          <Col xs={24} sm={24} md={12} lg={12} xl={14} className="mb-24">
            <Card bordered={false} className="criclebox h-full">
              <LineChart style={{ width: "100%", height: "100%" }} />
            </Card>
          </Col>
        </Row>

      </div>
    </>
  );
}

export default Home;
