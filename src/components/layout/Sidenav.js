

// import { useState } from "react";
import { Menu } from "antd";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../../assets/images/logo.png";

function Sidenav({ color }) {
  const { pathname } = useLocation();
  const page = pathname.replace("/", "");

  const role = localStorage.getItem("rl");

  const dashboard = [
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      key={0}
    >
      <path
        d="M3 4C3 3.44772 3.44772 3 4 3H16C16.5523 3 17 3.44772 17 4V6C17 6.55228 16.5523 7 16 7H4C3.44772 7 3 6.55228 3 6V4Z"
        fill={color}
      ></path>
      <path
        d="M3 10C3 9.44771 3.44772 9 4 9H10C10.5523 9 11 9.44771 11 10V16C11 16.5523 10.5523 17 10 17H4C3.44772 17 3 16.5523 3 16V10Z"
        fill={color}
      ></path>
      <path
        d="M14 9C13.4477 9 13 9.44771 13 10V16C13 16.5523 13.4477 17 14 17H16C16.5523 17 17 16.5523 17 16V10C17 9.44771 16.5523 9 16 9H14Z"
        fill={color}
      ></path>
    </svg>,
  ];

  const users = [
    <svg
      width="22"
      height="22"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      key={0}
    >
      <path
        d="M9 6C9 7.65685 7.65685 9 6 9C4.34315 9 3 7.65685 3 6C3 4.34315 4.34315 3 6 3C7.65685 3 9 4.34315 9 6Z"
        fill="#fff"
      ></path>
      <path
        d="M17 6C17 7.65685 15.6569 9 14 9C12.3431 9 11 7.65685 11 6C11 4.34315 12.3431 3 14 3C15.6569 3 17 4.34315 17 6Z"
        fill="#fff"
      ></path>
      <path
        d="M12.9291 17C12.9758 16.6734 13 16.3395 13 16C13 14.3648 12.4393 12.8606 11.4998 11.6691C12.2352 11.2435 13.0892 11 14 11C16.7614 11 19 13.2386 19 16V17H12.9291Z"
        fill="#fff"
      ></path>
      <path
        d="M6 11C8.76142 11 11 13.2386 11 16V17H1V16C1 13.2386 3.23858 11 6 11Z"
        fill="#fff"
      ></path>
    </svg>
    ,
  ];



  const signin = [
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      key={0}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 2C5.44772 2 5 2.44772 5 3V4H4C2.89543 4 2 4.89543 2 6V16C2 17.1046 2.89543 18 4 18H16C17.1046 18 18 17.1046 18 16V6C18 4.89543 17.1046 4 16 4H15V3C15 2.44772 14.5523 2 14 2C13.4477 2 13 2.44772 13 3V4H7V3C7 2.44772 6.55228 2 6 2ZM6 7C5.44772 7 5 7.44772 5 8C5 8.55228 5.44772 9 6 9H14C14.5523 9 15 8.55228 15 8C15 7.44772 14.5523 7 14 7H6Z"
        fill={color}
      ></path>
    </svg>,
  ];


  return (
    <>
      <div className="brand">
        <img src={logo} alt="" />
        <span>Dashboard</span>
      </div>
      <hr />
      <Menu theme="light" mode="inline">
        <Menu.Item key="1">
          <NavLink to="/dashboard">
            <span
              className="icon"
              style={{
                background: page === "dashboard" ? color : "",
              }}
            >
              {dashboard}
            </span>
            <span className="label">Dashboard</span>
          </NavLink>
        </Menu.Item>
        {role === "ADMIN" ? <Menu.Item key="2">
          <NavLink to="/users">
            <span
              className="icon"
              style={{
                background: page === "users" ? color : "",
              }}
            >
              {users}
            </span>
            <span className="label">Users</span>
          </NavLink>
        </Menu.Item> : <></>}

        <Menu.Item className="menu-item-header" key="5">
          Reported
        </Menu.Item>

        <Menu.Item key="3">
          <NavLink to="/summary-report">
            <span
              className="icon"
              style={{
                background: page === "report" ? color : "",
              }}
            >
              {signin}
            </span>
            <span className="label">Summary Report</span>
          </NavLink>
        </Menu.Item>

        <Menu.Item key="3">
          <NavLink to="/report-case">
            <span
              className="icon"
              style={{
                background: page === "report" ? color : "",
              }}
            >
              {signin}
            </span>
            <span className="label">Report Cases</span>
          </NavLink>
        </Menu.Item>
        {role === "ADMIN" ? <Menu.Item className="menu-item-header" key="5">
          Master Data
        </Menu.Item> : <></>}

        {role === "ADMIN" ? <Menu.Item key="4">
          <NavLink to="/master-data-title">
            <span
              className="icon"
              style={{
                background: page === "master-data-title" ? color : "",
              }}
            >
              {signin}
            </span>
            <span className="label">Title</span>
          </NavLink>
        </Menu.Item>
          : <></>}
        {role === "ADMIN" ? <Menu.Item key="5">
          <NavLink to="/master-data-room">
            <span
              className="icon"
              style={{
                background: page === "master-data-room" ? color : "",
              }}
            >
              {signin}
            </span>
            <span className="label">Room List</span>
          </NavLink>
        </Menu.Item> : <></>}



      </Menu>

    </>
  );
}

export default Sidenav;
