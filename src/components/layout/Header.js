import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Breadcrumb,
  Button,
} from "antd";
import { NavLink, Link } from "react-router-dom";
import { WarningOutlined, ToolOutlined } from "@ant-design/icons";
import MaintenanceAlertModal from "../MaintenanceAlertModal";
import "../../assets/styles/maintenance.css";

const toggler = [
  <svg
    width="20"
    height="20"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
    key={0}
  >
    <path d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"></path>
  </svg>,
];

function Header({
  name,
  subName,
  onPress,
}) {
  const [overdueCount, setOverdueCount] = useState(0);
  const [dueSoonCount, setDueSoonCount] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const checkAlerts = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = `${process.env.REACT_APP_API_URL || ""}/api/v1/maintenance/alerts`;
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        setOverdueCount(json.data?.overdueCount || 0);
        setDueSoonCount(json.data?.dueSoonCount || 0);
      }
    } catch (err) {
      // Ignore background error
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    checkAlerts();
    const interval = setInterval(checkAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/sign-in";
  };

  return (
    <>
      <Row gutter={[24, 0]} align="middle">
        <Col span={24} md={6}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <NavLink to="/">Pages</NavLink>
            </Breadcrumb.Item>
            <Breadcrumb.Item style={{ textTransform: "capitalize" }}>
              {name.replace("/", "")}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="ant-page-header-heading">
            <span
              className="ant-page-header-heading-title"
              style={{ textTransform: "capitalize" }}
            >
              {subName.replace("/", "")}
            </span>
          </div>
        </Col>
        <Col span={24} md={18} className="header-control">
          {/* Maintenance Alert Button */}
          {overdueCount > 0 ? (
            <button
              className="header-maint-alert-btn"
              onClick={() => setShowModal(true)}
              title="Klik untuk melihat unit peralatan yang melewati jadwal maintenance"
            >
              <WarningOutlined />
              <span>🚨 {overdueCount} Unit Overdue</span>
            </button>
          ) : dueSoonCount > 0 ? (
            <button
              className="header-maint-alert-btn"
              style={{ background: "#fef3c7", borderColor: "#fde68a", color: "#92400e" }}
              onClick={() => setShowModal(true)}
              title="Peralatan jatuh tempo service segera"
            >
              <ToolOutlined />
              <span>⚠️ {dueSoonCount} Menunggu Service</span>
            </button>
          ) : (
            <button
              className="header-maint-normal-btn"
              onClick={() => setShowModal(true)}
              title="Lihat status jadwal maintenance"
            >
              <ToolOutlined />
              <span>Maintenance Status</span>
            </button>
          )}

          <Button
            type="link"
            className="sidebar-toggler"
            onClick={() => onPress()}
          >
            {toggler}
          </Button>
          <Link to="/sign-in" className="btn-sign-in" onClick={handleLogout}>
            <span>Logout</span>
          </Link>
        </Col>
      </Row>

      {/* Alert popup triggered by header or automatically */}
      <MaintenanceAlertModal
        forceOpen={showModal}
        onClose={() => {
          setShowModal(false);
          checkAlerts();
        }}
      />
    </>
  );
}

export default Header;
