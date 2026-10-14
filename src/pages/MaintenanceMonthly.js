import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Tag,
  Input,
  Select,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  message,
  Tabs,
  Progress,
  Space,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  ToolOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  HistoryOutlined,
  EditOutlined,
  DeleteOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import moment from "moment";
import MaintenanceAlertModal from "../components/MaintenanceAlertModal";
import "../assets/styles/maintenance.css";

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

export default function MaintenanceMonthly() {
  const [activeTab, setActiveTab] = useState("1");
  const [loading, setLoading] = useState(false);
  const [equipmentList, setEquipmentList] = useState([]);
  const [totalEquipment, setTotalEquipment] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Selected Month & Year
  const [selectedMonth, setSelectedMonth] = useState(moment().month() + 1);
  const [selectedYear, setSelectedYear] = useState(moment().year());
  const [summaryData, setSummaryData] = useState({
    totalEquipment: 0,
    overdueCount: 0,
    dueThisMonthCount: 0,
    completedThisMonth: 0,
    categoryBreakdown: {},
    recentRecords: [],
    upcomingMaintenance: [],
  });

  // Maintenance Records list
  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [recordPage, setRecordPage] = useState(1);

  // Modals
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [submittingService, setSubmittingService] = useState(false);
  const [serviceForm] = Form.useForm();

  const [equipModalVisible, setEquipModalVisible] = useState(false);
  const [editingEquip, setEditingEquip] = useState(null);
  const [submittingEquip, setSubmittingEquip] = useState(false);
  const [equipForm] = Form.useForm();

  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyEquip, setHistoryEquip] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);

  // Force open alert popup
  const [showAlertModal, setShowAlertModal] = useState(false);

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = `${process.env.REACT_APP_API_URL || ""}/api/v1/maintenance/monthly-summary?month=${selectedMonth}&year=${selectedYear}`;
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        setSummaryData(json.data || {});
      }
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  // Fetch Equipment List
  const fetchEquipment = async (p = page, l = limit, s = search, cat = categoryFilter, stat = statusFilter) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = `${process.env.REACT_APP_API_URL || ""}/api/v1/maintenance/equipment?page=${p}&limit=${l}&search=${encodeURIComponent(
        s
      )}&category=${cat}&status=${stat}`;
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        setEquipmentList(json.data?.data || []);
        setTotalEquipment(json.data?.total || 0);
      }
    } catch (err) {
      console.error("Error fetching equipment:", err);
      message.error("Gagal mengambil data peralatan.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Records
  const fetchRecords = async (p = recordPage) => {
    try {
      const token = localStorage.getItem("token");
      const url = `${process.env.REACT_APP_API_URL || ""}/api/v1/maintenance/records?page=${p}&limit=10&month=${selectedMonth}&year=${selectedYear}`;
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        setRecords(json.data?.data || []);
        setTotalRecords(json.data?.total || 0);
      }
    } catch (err) {
      console.error("Error fetching records:", err);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchEquipment();
    fetchRecords();
  }, [selectedMonth, selectedYear]);

  // Seed sample data helper
  const handleSeedData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/v1/maintenance/seed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        message.success(json.data || "Sample data berhasil di-generate!");
        fetchSummary();
        fetchEquipment();
        fetchRecords();
      }
    } catch (err) {
      console.error(err);
      message.error("Gagal melakukan seeding data.");
    }
  };

  // Open Service Modal
  const handleOpenServiceModal = (record) => {
    setSelectedEquipment(record);
    serviceForm.resetFields();
    serviceForm.setFieldsValue({
      maintenanceDate: moment(),
      maintenanceType: "Preventive Maintenance",
      technician: record.picTechnician || "Teknisi Engineering",
      nextIntervalDays: record.intervalDays || 30,
      conditionAfter: "Normal / Baik",
      cost: 0,
      actionTaken:
        record.category === "AC"
          ? "Cuci filter indoor, semprot coil evaporator, bersihkan outdoor condensor, periksa ampere & tekanan refrigerant R410A"
          : record.category === "Genset"
          ? "Pemanasan genset tanpa beban 20 menit, periksa level solar, oli mesin, dan tegangan aki starter"
          : record.category === "Pompa"
          ? "Inspeksi fungsi pressure switch, pelumasan bearing pompa, cek kekencangan pipa & mechanical seal"
          : "Pemeriksaan dan preventive maintenance berkala sesuai SOP hotel",
    });
    setServiceModalVisible(true);
  };

  // Submit Service Record
  const handleServiceSubmit = async () => {
    try {
      const values = await serviceForm.validateFields();
      setSubmittingService(true);
      const token = localStorage.getItem("token");

      const payload = {
        equipmentId: selectedEquipment.id,
        maintenanceDate: values.maintenanceDate.format("YYYY-MM-DDTHH:mm:ssZ"),
        maintenanceType: values.maintenanceType,
        technician: values.technician,
        actionTaken: values.actionTaken,
        partsReplaced: values.partsReplaced || "",
        cost: values.cost || 0,
        conditionAfter: values.conditionAfter,
        nextIntervalDays: values.nextIntervalDays || selectedEquipment.intervalDays || 30,
        notes: values.notes || "",
      };

      const res = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/v1/maintenance/record`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        message.success(`Preventive maintenance untuk ${selectedEquipment.name} berhasil dicatat! Status jadwal diperbarui.`);
        setServiceModalVisible(false);
        fetchSummary();
        fetchEquipment();
        fetchRecords();
      } else {
        const errorJson = await res.json();
        message.error(errorJson.responseDesc || "Gagal mencatat service.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingService(false);
    }
  };

  // Open Create/Edit Equipment Modal
  const handleOpenEquipModal = (item = null) => {
    setEditingEquip(item);
    equipForm.resetFields();
    if (item) {
      equipForm.setFieldsValue({
        code: item.code,
        name: item.name,
        category: item.category,
        location: item.location,
        brand: item.brand,
        modelSeries: item.modelSeries,
        capacity: item.capacity,
        intervalDays: item.intervalDays,
        lastMaintenanceDate: item.lastMaintenanceDate ? moment(item.lastMaintenanceDate) : null,
        picTechnician: item.picTechnician,
        notes: item.notes,
      });
    } else {
      equipForm.setFieldsValue({
        category: "AC",
        intervalDays: 30,
        lastMaintenanceDate: moment(),
        picTechnician: "Tim Engineering AC",
      });
    }
    setEquipModalVisible(true);
  };

  // Submit Equipment (Create or Update)
  const handleEquipSubmit = async () => {
    try {
      const values = await equipForm.validateFields();
      setSubmittingEquip(true);
      const token = localStorage.getItem("token");

      const payload = {
        code: values.code,
        name: values.name,
        category: values.category,
        location: values.location,
        brand: values.brand || "",
        modelSeries: values.modelSeries || "",
        capacity: values.capacity || "",
        intervalDays: values.intervalDays || 30,
        lastMaintenanceDate: values.lastMaintenanceDate ? values.lastMaintenanceDate.format("YYYY-MM-DDTHH:mm:ssZ") : null,
        picTechnician: values.picTechnician || "",
        notes: values.notes || "",
      };

      const url = editingEquip
        ? `${process.env.REACT_APP_API_URL || ""}/api/v1/maintenance/equipment/${editingEquip.id}`
        : `${process.env.REACT_APP_API_URL || ""}/api/v1/maintenance/equipment`;

      const method = editingEquip ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        message.success(editingEquip ? "Peralatan berhasil diperbarui!" : "Peralatan baru berhasil ditambahkan!");
        setEquipModalVisible(false);
        fetchSummary();
        fetchEquipment();
      } else {
        const errorJson = await res.json();
        message.error(errorJson.responseDesc || "Gagal menyimpan data peralatan.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingEquip(false);
    }
  };

  // Delete Equipment
  const handleDeleteEquipment = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/v1/maintenance/equipment/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        message.success("Peralatan berhasil dihapus.");
        fetchSummary();
        fetchEquipment();
      } else {
        message.error("Gagal menghapus peralatan.");
      }
    } catch (err) {
      console.error(err);
      message.error("Terjadi kesalahan.");
    }
  };

  // View History of Single Equipment
  const handleViewHistory = async (item) => {
    setHistoryEquip(item);
    setHistoryRecords([]);
    setHistoryModalVisible(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/v1/maintenance/equipment/${item.id}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        setHistoryRecords(json.data?.records || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getCategoryClass = (cat) => {
    switch (cat) {
      case "AC":
        return "category-badge-ac";
      case "Genset":
        return "category-badge-genset";
      case "Pompa":
        return "category-badge-pompa";
      case "Lift":
        return "category-badge-lift";
      case "Boiler":
        return "category-badge-boiler";
      default:
        return "category-badge-default";
    }
  };

  // Table Columns for Equipment
  const columns = [
    {
      title: "Kode & Nama Aset",
      dataIndex: "name",
      key: "name",
      render: (text, r) => (
        <div>
          <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{text}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            <Tag color="geekblue">{r.code}</Tag> • {r.brand || "Umum"} ({r.capacity || "Standar"})
          </div>
        </div>
      ),
    },
    {
      title: "Kategori & Lokasi",
      key: "category",
      render: (_, r) => (
        <div>
          <span className={`ant-tag ${getCategoryClass(r.category)}`}>{r.category}</span>
          <div style={{ fontSize: 12, color: "#334155", marginTop: 4 }}>📍 {r.location}</div>
        </div>
      ),
    },
    {
      title: "Siklus Rutin",
      dataIndex: "intervalDays",
      key: "intervalDays",
      render: (days) => <Tag color="cyan">Tiap {days} Hari</Tag>,
    },
    {
      title: "Terakhir di-Service",
      dataIndex: "lastMaintenanceDate",
      key: "lastMaintenanceDate",
      render: (d) => (
        <span style={{ fontSize: 13, color: "#475569" }}>
          {d ? moment(d).format("DD MMM YYYY") : <span style={{ color: "#94a3b8" }}>Belum Tercatat</span>}
        </span>
      ),
    },
    {
      title: "Jatuh Tempo Berikutnya",
      dataIndex: "nextMaintenanceDate",
      key: "nextMaintenanceDate",
      render: (d, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{d ? moment(d).format("DD MMM YYYY") : "-"}</div>
          {r.isOverdue ? (
            <span className="pulse-badge">
              <WarningOutlined /> Overdue {r.daysOverdue} Hari
            </span>
          ) : r.isDueSoon ? (
            <span className="due-badge">
              <ClockCircleOutlined /> Jatuh Tempo Segera
            </span>
          ) : (
            <span className="normal-badge">
              <CheckCircleOutlined /> Terjadwal Aman
            </span>
          )}
        </div>
      ),
    },
    {
      title: "PIC Teknisi",
      dataIndex: "picTechnician",
      key: "picTechnician",
      render: (t) => <span style={{ fontSize: 12, color: "#475569" }}>{t || "Tim Engineering"}</span>,
    },
    {
      title: "Aksi",
      key: "action",
      align: "center",
      render: (_, r) => (
        <Space size="small">
          <Tooltip title="Catat tindakan service preventive (reset jatuh tempo)">
            <Button
              type="primary"
              size="small"
              danger={r.isOverdue}
              icon={<ToolOutlined />}
              style={{
                borderRadius: 6,
                fontWeight: 600,
                background: r.isOverdue ? "#dc2626" : "#2563eb",
                borderColor: r.isOverdue ? "#dc2626" : "#2563eb",
              }}
              onClick={() => handleOpenServiceModal(r)}
            >
              Catat Service
            </Button>
          </Tooltip>
          <Tooltip title="Lihat riwayat service unit ini">
            <Button size="small" icon={<HistoryOutlined />} onClick={() => handleViewHistory(r)} />
          </Tooltip>
          <Tooltip title="Edit data unit">
            <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEquipModal(r)} />
          </Tooltip>
          <Popconfirm
            title="Yakin ingin menghapus unit ini beserta riwayatnya?"
            onConfirm={() => handleDeleteEquipment(r.id)}
            okText="Ya, Hapus"
            cancelText="Batal"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Records Table Columns
  const recordColumns = [
    {
      title: "Tanggal Service",
      dataIndex: "maintenanceDate",
      key: "maintenanceDate",
      render: (d) => <span style={{ fontWeight: 600 }}>{moment(d).format("DD MMM YYYY")}</span>,
    },
    {
      title: "Peralatan",
      key: "equipment",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.equipmentName}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            <Tag color="blue">{r.equipmentCode}</Tag> <span className={`ant-tag ${getCategoryClass(r.category)}`}>{r.category}</span> • {r.location}
          </div>
        </div>
      ),
    },
    {
      title: "Tipe & Teknisi",
      key: "tech",
      render: (_, r) => (
        <div>
          <Tag color="purple">{r.maintenanceType}</Tag>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>🔧 {r.technician}</div>
        </div>
      ),
    },
    {
      title: "Tindakan Pekerjaan",
      dataIndex: "actionTaken",
      key: "actionTaken",
      render: (t, r) => (
        <div>
          <div style={{ fontSize: 13, color: "#1e293b" }}>{t}</div>
          {r.partsReplaced && (
            <div style={{ fontSize: 12, color: "#b91c1c", marginTop: 2 }}>
              Part Diganti: <strong>{r.partsReplaced}</strong>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Biaya",
      dataIndex: "cost",
      key: "cost",
      render: (c) => (c > 0 ? `Rp ${c.toLocaleString("id-ID")}` : "-"),
    },
    {
      title: "Kondisi Pasca Service",
      dataIndex: "conditionAfter",
      key: "conditionAfter",
      render: (cond) => <Tag color={cond?.includes("Normal") ? "green" : "orange"}>{cond || "Normal / Baik"}</Tag>,
    },
    {
      title: "Jadwal Berikutnya",
      dataIndex: "nextMaintenanceDate",
      key: "nextMaintenanceDate",
      render: (d) => moment(d).format("DD MMM YYYY"),
    },
  ];

  // Calculate compliance percentage
  const complianceRate =
    summaryData.totalEquipment > 0
      ? Math.round(((summaryData.totalEquipment - summaryData.overdueCount) / summaryData.totalEquipment) * 100)
      : 100;

  return (
    <div className="maintenance-container">
      {/* Banner */}
      <div className="maintenance-banner">
        <Row justify="space-between" align="middle">
          <Col xs={24} md={16}>
            <h2>🛠️ Data Maintenance Monthly & Preventive Hotel</h2>
            <p>
              Sistem pencatatan jadwal service berkala peralatan teknik hotel (AC Kamar & Publik, Genset, Pompa Air/Booster/Hydrant, Lift, Boiler, Panel Listrik).
              Notifikasi pop-up otomatis memperingatkan jadwal yang jatuh tempo hingga tindakan maintenance dilakukan.
            </p>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: "right", marginTop: 12 }}>
            <Space wrap>
              <Button
                type="primary"
                danger={summaryData.overdueCount > 0}
                icon={<WarningOutlined />}
                style={{
                  fontWeight: 600,
                  borderRadius: 8,
                  height: 40,
                  background: summaryData.overdueCount > 0 ? "#dc2626" : "#ffffff",
                  color: summaryData.overdueCount > 0 ? "#ffffff" : "#1e3a8a",
                  borderColor: summaryData.overdueCount > 0 ? "#dc2626" : "#ffffff",
                }}
                onClick={() => setShowAlertModal(true)}
              >
                {summaryData.overdueCount > 0
                  ? `🚨 Cek ${summaryData.overdueCount} Unit Overdue`
                  : "🔔 Cek Peringatan Service"}
              </Button>
              <Button
                icon={<PlusOutlined />}
                style={{ borderRadius: 8, height: 40, fontWeight: 600 }}
                onClick={() => handleOpenEquipModal(null)}
              >
                + Tambah Aset Unit
              </Button>
              {totalEquipment === 0 && (
                <Button
                  style={{ borderRadius: 8, height: 40, background: "#10b981", color: "#fff", borderColor: "#10b981" }}
                  onClick={handleSeedData}
                >
                  🌱 Isi Contoh Data Aset
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="maint-stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="stat-label">Total Unit Peralatan</div>
                <div className="stat-value">{summaryData.totalEquipment || 0}</div>
                <div className="stat-subtitle">AC, Genset, Pompa, Lift, Boiler</div>
              </div>
              <div className="stat-icon-wrapper stat-icon-blue">
                <DashboardOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="maint-stat-card" style={{ borderColor: summaryData.overdueCount > 0 ? "#fca5a5" : "#eef2f6" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="stat-label" style={{ color: "#dc2626" }}>Overdue (Terlambat)</div>
                <div className="stat-value" style={{ color: "#dc2626" }}>
                  {summaryData.overdueCount || 0}
                </div>
                <div className="stat-subtitle" style={{ color: "#b91c1c" }}>
                  {summaryData.overdueCount > 0 ? "⚠️ Wajib Segera Dikerjakan!" : "Nihil terlambat"}
                </div>
              </div>
              <div className="stat-icon-wrapper stat-icon-red">
                <WarningOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="maint-stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="stat-label">Jatuh Tempo Bulan Ini</div>
                <div className="stat-value">{summaryData.dueThisMonthCount || 0}</div>
                <div className="stat-subtitle">Periode {moment(`${selectedYear}-${selectedMonth}`, "YYYY-M").format("MMMM YYYY")}</div>
              </div>
              <div className="stat-icon-wrapper stat-icon-amber">
                <ClockCircleOutlined />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="maint-stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="stat-label">Selesai Service Bulan Ini</div>
                <div className="stat-value" style={{ color: "#059669" }}>
                  {summaryData.completedThisMonth || 0}
                </div>
                <div className="stat-subtitle">Kepatuhan Jadwal: {complianceRate}%</div>
              </div>
              <div className="stat-icon-wrapper stat-icon-green">
                <CheckCircleOutlined />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Tabs */}
      <Card style={{ borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
        <Tabs activeKey={activeTab} onChange={(k) => setActiveTab(k)} type="line" size="large">
          {/* TAB 1: Jadwal Bulanan & Ringkasan */}
          <TabPane
            tab={
              <span>
                <ClockCircleOutlined /> Jadwal Maintenance Bulanan
              </span>
            }
            key="1"
          >
            {/* Month & Year Selection Bar */}
            <div className="filter-card">
              <Row gutter={[16, 16]} align="middle" justify="space-between">
                <Col xs={24} md={12}>
                  <Space size="middle" wrap>
                    <span style={{ fontWeight: 600, color: "#334155" }}>Pilih Periode Bulan:</span>
                    <Select
                      value={selectedMonth}
                      style={{ width: 140 }}
                      onChange={(m) => setSelectedMonth(m)}
                    >
                      {moment.months().map((m, idx) => (
                        <Option key={idx + 1} value={idx + 1}>
                          {m}
                        </Option>
                      ))}
                    </Select>
                    <Select
                      value={selectedYear}
                      style={{ width: 100 }}
                      onChange={(y) => setSelectedYear(y)}
                    >
                      {[2024, 2025, 2026, 2027].map((yr) => (
                        <Option key={yr} value={yr}>
                          {yr}
                        </Option>
                      ))}
                    </Select>
                    <Button icon={<ReloadOutlined />} onClick={() => fetchSummary()}>
                      Refresh
                    </Button>
                  </Space>
                </Col>

                <Col xs={24} md={12} style={{ textAlign: "right" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 13, color: "#64748b" }}>Kepatuhan Maintenance:</span>
                    <Progress
                      percent={complianceRate}
                      size="small"
                      style={{ width: 160 }}
                      status={complianceRate < 80 ? "exception" : "normal"}
                    />
                  </div>
                </Col>
              </Row>
            </div>

            {/* Category Breakdown Chips */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
              <Tag color="blue" style={{ padding: "6px 14px", fontSize: 13, borderRadius: 20 }}>
                ❄️ AC: {summaryData.categoryBreakdown?.AC || 0} Unit
              </Tag>
              <Tag color="orange" style={{ padding: "6px 14px", fontSize: 13, borderRadius: 20 }}>
                ⚡ Genset: {summaryData.categoryBreakdown?.Genset || 0} Unit
              </Tag>
              <Tag color="purple" style={{ padding: "6px 14px", fontSize: 13, borderRadius: 20 }}>
                💧 Pompa: {summaryData.categoryBreakdown?.Pompa || 0} Unit
              </Tag>
              <Tag color="magenta" style={{ padding: "6px 14px", fontSize: 13, borderRadius: 20 }}>
                🛗 Lift: {summaryData.categoryBreakdown?.Lift || 0} Unit
              </Tag>
              <Tag color="red" style={{ padding: "6px 14px", fontSize: 13, borderRadius: 20 }}>
                🔥 Boiler: {summaryData.categoryBreakdown?.Boiler || 0} Unit
              </Tag>
            </div>

            {/* List of Equipments due this month */}
            <h4 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 14 }}>
              📋 Daftar Peralatan yang Menunggu Service Bulan Ini ({summaryData.upcomingMaintenance?.length || 0} Unit):
            </h4>
            <Table
              columns={columns}
              dataSource={summaryData.upcomingMaintenance || []}
              rowKey="id"
              pagination={false}
              className="maint-table"
              locale={{ emptyText: "Tidak ada unit yang jatuh tempo pada bulan ini." }}
            />
          </TabPane>

          {/* TAB 2: Master Data Aset (AC, Genset, Pompa, etc.) */}
          <TabPane
            tab={
              <span>
                <ToolOutlined /> Master Data Aset & Jadwal
              </span>
            }
            key="2"
          >
            {/* Filter Bar */}
            <div className="filter-card">
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={8}>
                  <Input
                    placeholder="Cari kode (AC-101), nama, lokasi, brand..."
                    prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onPressEnter={() => {
                      setPage(1);
                      fetchEquipment(1, limit, search, categoryFilter, statusFilter);
                    }}
                    allowClear
                  />
                </Col>
                <Col xs={12} sm={5}>
                  <Select
                    value={categoryFilter}
                    style={{ width: "100%" }}
                    onChange={(val) => {
                      setCategoryFilter(val);
                      setPage(1);
                      fetchEquipment(1, limit, search, val, statusFilter);
                    }}
                  >
                    <Option value="All">Semua Kategori</Option>
                    <Option value="AC">AC (Air Conditioner)</Option>
                    <Option value="Genset">Genset (Generator Set)</Option>
                    <Option value="Pompa">Pompa (Booster/Hydrant)</Option>
                    <Option value="Lift">Lift / Elevator</Option>
                    <Option value="Boiler">Boiler Water Heater</Option>
                    <Option value="Panel Listrik">Panel Listrik / Trafo</Option>
                    <Option value="Plumbing">Plumbing</Option>
                  </Select>
                </Col>
                <Col xs={12} sm={5}>
                  <Select
                    value={statusFilter}
                    style={{ width: "100%" }}
                    onChange={(val) => {
                      setStatusFilter(val);
                      setPage(1);
                      fetchEquipment(1, limit, search, categoryFilter, val);
                    }}
                  >
                    <Option value="All">Semua Status</Option>
                    <Option value="Overdue">Overdue (Terlambat)</Option>
                    <Option value="Due">Due (Jatuh Tempo)</Option>
                    <Option value="Normal">Normal (Aman)</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={6} style={{ textAlign: "right" }}>
                  <Space>
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      onClick={() => {
                        setPage(1);
                        fetchEquipment(1, limit, search, categoryFilter, statusFilter);
                      }}
                    >
                      Cari
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        setSearch("");
                        setCategoryFilter("All");
                        setStatusFilter("All");
                        fetchEquipment(1, limit, "", "All", "All");
                      }}
                    >
                      Reset
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>

            <Table
              columns={columns}
              dataSource={equipmentList}
              rowKey="id"
              loading={loading}
              className="maint-table"
              pagination={{
                current: page,
                pageSize: limit,
                total: totalEquipment,
                onChange: (p, l) => {
                  setPage(p);
                  setLimit(l);
                  fetchEquipment(p, l, search, categoryFilter, statusFilter);
                },
                showTotal: (total) => `Total ${total} Unit Peralatan`,
              }}
              rowClassName={(r) => (r.isOverdue ? "row-overdue" : "")}
            />
          </TabPane>

          {/* TAB 3: Riwayat & Log Preventive Maintenance */}
          <TabPane
            tab={
              <span>
                <HistoryOutlined /> Riwayat & Log Preventive Maintenance
              </span>
            }
            key="3"
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h4 style={{ fontWeight: 700, margin: 0, color: "#1e293b" }}>
                Riwayat Tindakan Preventive Maintenance yang Telah Dilakukan:
              </h4>
              <Button icon={<ReloadOutlined />} onClick={() => fetchRecords(1)}>
                Refresh Log
              </Button>
            </div>
            <Table
              columns={recordColumns}
              dataSource={records}
              rowKey="id"
              className="maint-table"
              pagination={{
                current: recordPage,
                pageSize: 10,
                total: totalRecords,
                onChange: (p) => {
                  setRecordPage(p);
                  fetchRecords(p);
                },
                showTotal: (total) => `Total ${total} Tindakan Maintenance`,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal: Input Service Preventive Action */}
      <Modal
        visible={serviceModalVisible}
        onCancel={() => setServiceModalVisible(false)}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ToolOutlined style={{ fontSize: 22, color: "#2563eb" }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                Catat Preventive Maintenance: {selectedEquipment?.name}
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Kode: {selectedEquipment?.code} • Kategori: {selectedEquipment?.category} • Lokasi: {selectedEquipment?.location}
              </div>
            </div>
          </div>
        }
        footer={[
          <Button key="back" onClick={() => setServiceModalVisible(false)}>
            Batal
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submittingService}
            onClick={handleServiceSubmit}
            icon={<CheckCircleOutlined />}
            style={{ background: "#059669", borderColor: "#059669", fontWeight: 600 }}
          >
            Simpan & Perbarui Jadwal Service
          </Button>,
        ]}
        width={700}
      >
        <Form form={serviceForm} layout="vertical">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Form.Item
              name="maintenanceDate"
              label="Tanggal Pelaksanaan Service"
              rules={[{ required: true, message: "Pilih tanggal service" }]}
            >
              <DatePicker style={{ width: "100%" }} format="DD MMM YYYY" />
            </Form.Item>

            <Form.Item
              name="maintenanceType"
              label="Jenis Tindakan"
              rules={[{ required: true, message: "Pilih jenis tindakan" }]}
            >
              <Select>
                <Option value="Preventive Maintenance">Preventive Maintenance (Pencegahan Rutin)</Option>
                <Option value="Corrective / Perbaikan">Corrective / Perbaikan Kerusakan</Option>
                <Option value="Inspeksi Rutin">Inspeksi Rutin / Check Fisik</Option>
                <Option value="Penggantian Sparepart">Penggantian Sparepart</Option>
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Form.Item
              name="technician"
              label="Teknisi Pelaksana / PIC"
              rules={[{ required: true, message: "Masukkan nama teknisi atau vendor" }]}
            >
              <Input placeholder="Contoh: Budi Santoso / Vendor Daikin" />
            </Form.Item>

            <Form.Item
              name="nextIntervalDays"
              label="Interval Servis Berikutnya (Hari)"
              rules={[{ required: true, message: "Masukkan interval hari" }]}
              extra="Otomatis memperbarui jadwal jatuh tempo siklus berikutnya"
            >
              <InputNumber min={1} max={365} style={{ width: "100%" }} />
            </Form.Item>
          </div>

          <Form.Item
            name="actionTaken"
            label="Rincian Pekerjaan / Preventive Action"
            rules={[{ required: true, message: "Tuliskan tindakan yang dilakukan" }]}
          >
            <TextArea rows={3} placeholder="Jelaskan tindakan teknis yang telah dikerjakan" />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Form.Item name="partsReplaced" label="Sparepart Diganti (Jika Ada)">
              <Input placeholder="Contoh: Kapasitor 2.5uF, Filter Udara, Oli 15W-40" />
            </Form.Item>

            <Form.Item name="cost" label="Biaya Maintenance (Rp)">
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                formatter={(val) => `Rp ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                parser={(val) => val.replace(/Rp\s?|(\.*)/g, "")}
              />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Form.Item name="conditionAfter" label="Kondisi Pasca Service">
              <Select>
                <Option value="Normal / Baik">Normal / Baik (Siap Beroperasi)</Option>
                <Option value="Perlu Tindak Lanjut">Perlu Tindak Lanjut / Observasi</Option>
                <Option value="Rusak / Butuh Part">Rusak / Menunggu Penggantian Unit</Option>
              </Select>
            </Form.Item>

            <Form.Item name="notes" label="Catatan Tambahan">
              <Input placeholder="Catatan teknisi untuk periode berikutnya" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Modal: Tambah / Edit Peralatan Unit */}
      <Modal
        visible={equipModalVisible}
        onCancel={() => setEquipModalVisible(false)}
        title={editingEquip ? `Edit Peralatan: ${editingEquip.name}` : "Tambah Peralatan Hotel Baru"}
        footer={[
          <Button key="cancel" onClick={() => setEquipModalVisible(false)}>
            Batal
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={submittingEquip}
            onClick={handleEquipSubmit}
            style={{ background: "#1e3a8a", borderColor: "#1e3a8a" }}
          >
            {editingEquip ? "Simpan Perubahan" : "Simpan Aset"}
          </Button>,
        ]}
        width={720}
      >
        <Form form={equipForm} layout="vertical">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
            <Form.Item
              name="code"
              label="Kode Aset"
              rules={[{ required: true, message: "Kode aset wajib diisi" }]}
              extra="Contoh: AC-101, GENSET-01, PMP-BOOST-01"
            >
              <Input placeholder="AC-101" disabled={!!editingEquip} />
            </Form.Item>

            <Form.Item
              name="name"
              label="Nama Peralatan"
              rules={[{ required: true, message: "Nama peralatan wajib diisi" }]}
            >
              <Input placeholder="Contoh: AC Split Kamar 101" />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Form.Item
              name="category"
              label="Kategori"
              rules={[{ required: true, message: "Pilih kategori aset" }]}
            >
              <Select>
                <Option value="AC">AC (Air Conditioner)</Option>
                <Option value="Genset">Genset (Generator Set)</Option>
                <Option value="Pompa">Pompa (Booster / Hydrant / Sumpit)</Option>
                <Option value="Lift">Lift / Elevator</Option>
                <Option value="Boiler">Boiler Water Heater</Option>
                <Option value="Panel Listrik">Panel Listrik / Trafo</Option>
                <Option value="Plumbing">Plumbing</Option>
                <Option value="Lainnya">Lainnya</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="location"
              label="Lokasi Penempatan"
              rules={[{ required: true, message: "Lokasi wajib diisi" }]}
            >
              <Input placeholder="Contoh: Kamar 101, Lobby Barat, Basement Power House" />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <Form.Item name="brand" label="Merk / Brand">
              <Input placeholder="Daikin, Cummins, Grundfos" />
            </Form.Item>

            <Form.Item name="modelSeries" label="Tipe / Model">
              <Input placeholder="FTKQ25SVM4" />
            </Form.Item>

            <Form.Item name="capacity" label="Kapasitas">
              <Input placeholder="1 PK, 500 kVA, 7.5 kW" />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Form.Item
              name="intervalDays"
              label="Siklus Service Rutin (Hari)"
              rules={[{ required: true, message: "Interval hari wajib diisi" }]}
              extra="Default 30 hari (1 bulan) untuk AC / pompa, 15 hari untuk genset"
            >
              <InputNumber min={1} max={365} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="lastMaintenanceDate"
              label="Tanggal Terakhir di-Service"
              extra="Jadwal berikutnya otomatis dihitung dari tanggal ini + siklus hari"
            >
              <DatePicker style={{ width: "100%" }} format="DD MMM YYYY" />
            </Form.Item>
          </div>

          <Form.Item name="picTechnician" label="PIC Teknisi / Vendor Penanggung Jawab">
            <Input placeholder="Contoh: Teknisi AC Tim A / Vendor Daikin" />
          </Form.Item>

          <Form.Item name="notes" label="Catatan Tambahan / SOP">
            <TextArea rows={2} placeholder="Spesifikasi refrigerant, catatan khusus instalasi, dll" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Detail & Riwayat Maintenance Peralatan */}
      <Modal
        visible={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        title={
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              📜 Riwayat Service: {historyEquip?.name}
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Kode: {historyEquip?.code} • Lokasi: {historyEquip?.location} • Kategori: {historyEquip?.category}
            </div>
          </div>
        }
        footer={[
          <Button key="close" onClick={() => setHistoryModalVisible(false)}>
            Tutup
          </Button>,
          <Button
            key="serv"
            type="primary"
            icon={<ToolOutlined />}
            onClick={() => {
              setHistoryModalVisible(false);
              handleOpenServiceModal(historyEquip);
            }}
          >
            + Catat Service Baru
          </Button>,
        ]}
        width={750}
      >
        <Table
          columns={[
            {
              title: "Tanggal",
              dataIndex: "maintenanceDate",
              key: "maintenanceDate",
              render: (d) => moment(d).format("DD MMM YYYY"),
            },
            {
              title: "Tipe",
              dataIndex: "maintenanceType",
              key: "maintenanceType",
              render: (t) => <Tag color="blue">{t}</Tag>,
            },
            {
              title: "Teknisi",
              dataIndex: "technician",
              key: "technician",
            },
            {
              title: "Pekerjaan",
              dataIndex: "actionTaken",
              key: "actionTaken",
            },
            {
              title: "Kondisi",
              dataIndex: "conditionAfter",
              key: "conditionAfter",
              render: (c) => <Tag color="green">{c || "Normal"}</Tag>,
            },
          ]}
          dataSource={historyRecords}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          locale={{ emptyText: "Belum ada riwayat service untuk unit ini." }}
        />
      </Modal>

      {/* Persistent / Pop-up Alert Modal (overdue reminder) */}
      <MaintenanceAlertModal
        forceOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
      />
    </div>
  );
}
