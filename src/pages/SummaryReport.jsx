import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import '../components/SummaryReport.css';

const SummaryReport = () => {
  const today = new Date();
  const [startDate, setStartDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [endDate, setEndDate] = useState(today);
  const [locationType, setLocationType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');
  const [titleFilter, setTitleFilter] = useState('all');
  const [reportData, setReportData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [caseStatusData, setCaseStatusData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [roomOptions, setRoomOptions] = useState([]);
  const [titleOptions, setTitleOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          locationType,
          statusFilter,
          room: roomFilter,
          title: titleFilter
        };
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/dashboard/summary-report`, {
          params,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const {
          reportData,
          statusData,
          caseStatusData,
          trendData,
          currentDate,
          currentTime
        } = response.data;

        setReportData(reportData || []);
        setStatusData(statusData || []);
        setCaseStatusData(caseStatusData || []);
        setTrendData(trendData || []);
        setCurrentDate(currentDate);
        setCurrentTime(currentTime);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        setReportData([]);
        setStatusData([]);
        setCaseStatusData([]);
        setTrendData([]);
      }
    };

    fetchData();

    const fetchFilterOptions = async () => {
      try {
        const token = localStorage.getItem("token");
        const [roomRes, titleRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/v1/case/room`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/api/v1/case/title`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setRoomOptions(roomRes.data?.data || []);
        setTitleOptions(titleRes.data?.data || []);
      } catch (err) {
        console.error("Error fetching room/title options:", err);
      }
    };

    fetchFilterOptions();

  }, [locationType, statusFilter, roomFilter, titleFilter, startDate, endDate]);

  const renderStatusBreakdown = (breakdown) => (
    <div className="status-breakdown">
      <div className="breakdown-item open">
        <span>Open: {breakdown?.open || 0}</span>
      </div>
      <div className="breakdown-item in-progress">
        <span>In Progress: {breakdown?.inProgress || 0}</span>
      </div>
      <div className="breakdown-item review">
        <span>Review: {breakdown?.review || 0}</span>
      </div>
      <div className="breakdown-item done">
        <span>Done: {breakdown?.done || 0}</span>
      </div>
    </div>
  );

  const renderStatusCard = (item) => (
    <div className="status-card" key={item.name}>
      <h3>{item.name}</h3>
      <div className="card-value">{item.value}</div>
      {renderStatusBreakdown(item.breakdown)}
      <div className="card-footer">
        <span>Last Updated: {currentDate} {currentTime}</span>
      </div>
    </div>
  );

  const renderReportCard = (item) => (
    <div className="report-card" key={item.id}>
      <h4>{item.title}</h4>
      <p className="report-meta">
        <span className="report-location">{item.locationName} ({item.locationType})</span>
        <span className={`report-status ${item.status?.toLowerCase()?.replace(' ', '-') || ''}`}>
          {item.status}
        </span>
      </p>
      <div className="report-details">
        <p><strong>Reported:</strong> {item.reportDate ? new Date(item.reportDate).toLocaleDateString('id-ID') : '-'}</p>
        <p><strong>Updated:</strong> {item.updatedAt ? new Date(item.updatedAt).toLocaleString('id-ID') : '-'}</p>
        {item.nameAssign && <p><strong>Assigned to:</strong> {item.nameAssign}</p>}
      </div>
      {item.reason && <div className="report-reason"><strong>Reason:</strong> {item.reason}</div>}
    </div>
  );

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const locationDistribution = reportData.reduce((acc, report) => {
    if (!report.locationType) return acc;

    const existing = acc.find(item => item.locationType === report.locationType);
    if (existing) {
      existing.cases++;
    } else {
      acc.push({
        locationType: report.locationType,
        cases: 1
      });
    }
    return acc;
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Maintenance Case Dashboard</h1>
        <div className="dashboard-subtitle">
          <span>{currentDate}</span>
          <span>{currentTime}</span>
        </div>
      </header>

      <div className="dashboard-controls">
        <div className="date-range-container">
          <div className="date-range">
            <div className="date-picker-wrapper">
              <label htmlFor="start-date">From:</label>
              <DatePicker
                id="start-date"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd MMM yyyy"
                locale="id"
                className="date-picker-input"
                popperPlacement="bottom-start"
              />
            </div>

            <span className="date-separator">to</span>

            <div className="date-picker-wrapper">
              <label htmlFor="end-date">To:</label>
              <DatePicker
                id="end-date"
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="dd MMM yyyy"
                locale="id"
                className="date-picker-input"
                popperPlacement="bottom-start"
              />
            </div>
          </div>
        </div>

        <div className="filter-group">
          <div className="filter-wrapper">
            <label htmlFor="room-filter" className="filter-label">Room:</label>
            <select
              id="room-filter"
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              {roomOptions.map((room) => (
                <option key={room.name} value={room.name}>
                 Room {room.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-wrapper">
            <label htmlFor="title-filter" className="filter-label">Title:</label>
            <select
              id="title-filter"
              value={titleFilter}
              onChange={(e) => setTitleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              {titleOptions.map((title) => (
                <option key={title.nameTitle} value={title.nameTitle}>
                 {title.nameTitle}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-wrapper">
            <label htmlFor="location-filter" className="filter-label">Location:</label>
            <select
              id="location-filter"
              value={locationType}
              onChange={(e) => setLocationType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Locations</option>
              <option value="Room">Room</option>
              <option value="Public Area">Public Area</option>
            </select>
          </div>

          <div className="filter-wrapper">
            <label htmlFor="status-filter" className="filter-label">Status:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="DONE">Done</option>
            </select>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="status-cards">
          {statusData.map(renderStatusCard)}
        </div>

        <div className="charts-row">
          <div className="chart-container">
            <h3>Case Distribution by Location</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={locationDistribution}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="locationType" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="cases"
                  fill="#8884d8"
                  name="Case Count"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3>Case Status</h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={caseStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {caseStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} cases`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="charts-row">
          <div className="chart-container full-width">
            <h3>Case Trend Over Time</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={trendData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="open"
                  stroke="#FF6384"
                  name="Open Cases"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="inProgress"
                  stroke="#36A2EB"
                  name="In Progress"
                />
                <Line
                  type="monotone"
                  dataKey="review"
                  stroke="#FFCE56"
                  name="Review"
                />
                <Line
                  type="monotone"
                  dataKey="done"
                  stroke="#4BC0C0"
                  name="Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="report-details">
          <h3>Report Details</h3>
          <div className="report-grid">
            {reportData.map(renderReportCard)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryReport;
