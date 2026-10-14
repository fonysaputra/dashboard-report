import React, { useState, useEffect } from "react";
import { Modal, Button, Table, Tag, Form, Input, DatePicker, Select, InputNumber, message } from "antd";
import { WarningOutlined, ToolOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import moment from "moment";
import "../assets/styles/maintenance.css";

const { Option } = Select;
const { TextArea } = Input;

export default function MaintenanceAlertModal({ forceOpen = false, onClose = () => {} }) {
  const [visible, setVisible] = useState(false);
  const [alerts, setAlerts] = useState({ overdueCount: 0, dueSoonCount: 0, items: [] });
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchAlerts = async (isManual = false) => {
    try {
      const token = localStorage.getItem("token");
      const url = `${process.env.REACT_APP_API_URL || ""}/api/v1/maintenance/alerts`;
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        const res = await response.json();
        const data = res.data || { overdueCount: 0, dueSoonCount: 0, items: [] };
        setAlerts(data);

        // If there are overdue or due items, auto pop up!
        if (data.overdueCount > 0 || data.dueSoonCount > 0) {
          // Check if dismissed recently (within 10 minutes) unless forced or manual
          const lastDismissed = sessionStorage.getItem("maint_popup_dismissed_at");
          const now = Date.now();
          if (isManual || forceOpen || !lastDismissed || now - parseInt(lastDismissed, 10) > 10 * 60 * 1000) {
            setVisible(true);
          }
        } else if (isManual || forceOpen) {
          message.success("Semua peralatan hotel (AC, Genset, Pompa, dll) dalam kondisi prima & jadwal aman!");
          setVisible(false);
        }
      }
    } catch (err) {
      console.error("Error fetching maintenance alerts:", err);
    }
  };

  useEffect(() => {
    fetchAlerts(forceOpen);
    // Poll every 60 seconds to detect newly overdue schedules
    const interval = setInterval(() => {
      fetchAlerts(false);
    }, 60000);
    return () => clearInterval(interval);
  }, [forceOpen]);

  const handleDismiss = () => {
    sessionStorage.setItem("maint_popup_dismissed_at", Date.now().toString());
    setVisible(false);
    onClose();
  };

  const openServiceForm = (record) => {
    setSelectedEquipment(record);
    form.resetFields();
    form.setFieldsValue({
      maintenanceDate: moment(),
      maintenanceType: "Preventive Maintenance",
      technician: record.picTechnician || "Teknisi Engineering",
      nextIntervalDays: record.intervalDays || 30,
      conditionAfter: "Normal / Baik",
      cost: 0,
      actionTaken:
        record.category === "AC"
          ? "Cuci filter indoor, semprot kondensor outdoor, cek arus listrik & tekanan refrigerant R410A"
          : record.category === "Genset"
          ? "Pemanasan genset 20 menit, periksa level oli pelumas, radiator coolant, cek baterai aki starter"
          : record.category === "Pompa"
          ? "Pemeriksaan pressure switch, membran tank booster, pelumasan bearing pompa, cek ampere"
          : "Preventive maintenance rutin berkala & inspeksi fungsi menyeluruh",
    });
    setServiceModalVisible(true);
  };

  const handleServiceSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
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

      const response = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/v1/maintenance/record`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        message.success(`Preventive maintenance untuk ${selectedEquipment.name} berhasil dicatat! Status diperbarui.`);
        setServiceModalVisible(false);
        // Refresh alert list immediately
        await fetchAlerts(true);
      } else {
        const errorData = await response.json();
        message.error(errorData.responseDesc || "Gagal mencatat maintenance.");
      }
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
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

  const columns = [
    {
      title: "Unit / Peralatan",
      dataIndex: "name",
      key: "name",
      render: (text, r) => (
        <div>
          <div style={{ fontWeight: 600, color: "#1e293b" }}>{text}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Kode: <Tag color="blue">{r.code}</Tag> • {r.brand || "-"} ({r.capacity || "-"})</div>
        </div>
      ),
    },
    {
      title: "Kategori & Lokasi",
      key: "category",
      render: (_, r) => (
        <div>
          <span className={`ant-tag ${getCategoryClass(r.category)}`}>{r.category}</span>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>📍 {r.location}</div>
        </div>
      ),
    },
    {
      title: "Jatuh Tempo Service",
      dataIndex: "nextMaintenanceDate",
      key: "nextMaintenanceDate",
      render: (date, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{date ? moment(date).format("DD MMM YYYY") : "-"}</div>
          {r.isOverdue ? (
            <span className="pulse-badge">
              <WarningOutlined /> Terlambat {r.daysOverdue} Hari
            </span>
          ) : r.isDueSoon ? (
            <span className="due-badge">
              <ClockCircleOutlined /> Jatuh Tempo Hari Ini / Segera
            </span>
          ) : (
            <span className="normal-badge">Normal</span>
          )}
        </div>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      align: "center",
      render: (_, r) => (
        <Button
          type="primary"
          danger={r.isOverdue}
          icon={<ToolOutlined />}
          style={{
            fontWeight: 600,
            borderRadius: 6,
            background: r.isOverdue ? "#dc2626" : "#2563eb",
            borderColor: r.isOverdue ? "#dc2626" : "#2563eb",
          }}
          onClick={() => openServiceForm(r)}
        >
          Catat Maintenance Sekarang
        </Button>
      ),
    },
  ];

  return (
    <>
      {/* Pop-up Alert Modal (Triggered automatically when service is due / overdue until preventive action is done) */}
      <Modal
        visible={visible}
        onCancel={handleDismiss}
        width={850}
        footer={[
          <Button key="close" onClick={handleDismiss}>
            Tutup Sementara
          </Button>,
          <Button
            key="go"
            type="primary"
            style={{ background: "#1e3a8a", borderColor: "#1e3a8a" }}
            onClick={() => {
              setVisible(false);
              onClose();
              window.location.href = "/maintenance-monthly";
            }}
          >
            Buka Halaman Data Maintenance Monthly
          </Button>,
        ]}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22, color: "#dc2626" }}>🚨</span>
            <div>
              <span style={{ fontSize: 17, fontWeight: 700, color: "#b91c1c" }}>
                Peringatan Jadwal Preventive Maintenance Hotel!
              </span>
              <div style={{ fontSize: 13, color: "#64748b", fontWeight: 400 }}>
                Peralatan berikut telah mencapai atau melewati batas jadwal service dan BELUM dilakukan preventive maintenance.
              </div>
            </div>
          </div>
        }
      >
        <div className="alert-banner-urgent">
          <WarningOutlined className="alert-icon" />
          <div>
            <div className="alert-title">
              {alerts.overdueCount > 0
                ? `${alerts.overdueCount} Peralatan Hotel MELEWATI Batas Service (Overdue)!`
                : `${alerts.dueSoonCount} Peralatan Menunggu Jadwal Service!`}
            </div>
            <div className="alert-desc">
              Pemberitahuan pop-up ini akan terus muncul secara berkala sampai tindakan preventive maintenance dilakukan pada unit terkait untuk menjaga standar kelayakan operasional hotel.
            </div>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={alerts.items}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          className="maint-table"
          size="middle"
          rowClassName={(r) => (r.isOverdue ? "row-overdue" : "")}
        />
      </Modal>

      {/* Input Preventive Maintenance Record Modal */}
      <Modal
        visible={serviceModalVisible}
        onCancel={() => setServiceModalVisible(false)}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ToolOutlined style={{ fontSize: 20, color: "#2563eb" }} />
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
            loading={submitting}
            onClick={handleServiceSubmit}
            icon={<CheckCircleOutlined />}
            style={{ background: "#059669", borderColor: "#059669", fontWeight: 600 }}
          >
            Simpan & Perbarui Jadwal Service
          </Button>,
        ]}
        width={680}
      >
        <Form form={form} layout="vertical">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Form.Item
              name="maintenanceDate"
              label="Tanggal Pelaksanaan Service"
              rules={[{ required: true, message: "Pilih tanggal pelaksanaan service" }]}
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
              <Input placeholder="Contoh: Budi Santoso / Vendor PT Daikin" />
            </Form.Item>

            <Form.Item
              name="nextIntervalDays"
              label="Interval Servis Berikutnya (Hari)"
              rules={[{ required: true, message: "Masukkan frekuensi hari servis berikutnya" }]}
              extra="Otomatis menghitung tanggal jatuh tempo periode selanjutnya"
            >
              <InputNumber min={1} max={365} style={{ width: "100%" }} />
            </Form.Item>
          </div>

          <Form.Item
            name="actionTaken"
            label="Rincian Pekerjaan / Preventive Action"
            rules={[{ required: true, message: "Tuliskan tindakan yang telah dilakukan" }]}
          >
            <TextArea
              rows={3}
              placeholder="Jelaskan tindakan teknis (cuci filter, cek tekanan freon, ganti oli genset, cek bearing pompa, dsb.)"
            />
          </Form.Item>

          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "#64748b", marginRight: 8 }}>Template Cepat:</span>
            {selectedEquipment?.category === "AC" && (
              <>
                <span
                  className="quick-action-pill"
                  onClick={() =>
                    form.setFieldsValue({
                      actionTaken: "Cuci filter indoor, semprot coil evaporator, bersihkan kondensor outdoor, tes ampere 3.8A, freon 140 psi normal.",
                    })
                  }
                >
                  Cuci AC Lengkap
                </span>
                <span
                  className="quick-action-pill"
                  onClick={() =>
                    form.setFieldsValue({
                      actionTaken: "Pembersihan filter udara indoor dan pengecekan pembuangan air drainase.",
                    })
                  }
                >
                  Cuci Ringan Filter
                </span>
              </>
            )}
            {selectedEquipment?.category === "Genset" && (
              <>
                <span
                  className="quick-action-pill"
                  onClick={() =>
                    form.setFieldsValue({
                      actionTaken: "Pemanasan genset tanpa beban 20 menit, periksa level solar 80%, level oli SAE 15W-40, tegangan aki 26.4V.",
                    })
                  }
                >
                  Pemanasan & Cek Aki
                </span>
                <span
                  className="quick-action-pill"
                  onClick={() =>
                    form.setFieldsValue({
                      actionTaken: "Penggantian oli mesin, filter oli, filter solar, dan pembersihan air cleaner.",
                    })
                  }
                >
                  Ganti Oli & Filter
                </span>
              </>
            )}
            {selectedEquipment?.category === "Pompa" && (
              <>
                <span
                  className="quick-action-pill"
                  onClick={() =>
                    form.setFieldsValue({
                      actionTaken: "Pemeriksaan pressure switch auto-stop pada 4 bar, pelumasan bearing pompa, cek kebocoran mechanical seal.",
                    })
                  }
                >
                  Inspeksi Pompa & Seal
                </span>
              </>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Form.Item name="partsReplaced" label="Sparepart Diganti (Jika Ada)">
              <Input placeholder="Contoh: Kapasitor 2.5uF / Filter Udara" />
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
    </>
  );
}
