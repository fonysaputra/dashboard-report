import React, { useEffect, useState } from "react";
import { Table, Input, Pagination, message, Card, DatePicker, Col, Row, Select, Modal, Image, Spin, Button } from "antd";
import { debounce } from "lodash"; 
import * as XLSX from "xlsx"; // Import xlsx library

const { Option } = Select;

const ReportCase = () => {

    const [report, setReport] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const [sortColumn, setSortColumn] = useState("created_at");
    const [sortDirection, setSortDirection] = useState("desc");
    const [selectedReport, setSelectedReport] = useState(null); // State for selected report
    const [isModalVisible, setIsModalVisible] = useState(false); // State to control modal visibility
    const [loadingImages, setLoadingImages] = useState(false); // State to manage loading images
    const [reportImages, setReportImages] = useState([]); // State to store Base64 images
    const [reportAfterImages, setReportAfterImages] = useState([]); // State to store Base64 images
    
    const [status, setStatus] = useState("");
    
    const role = localStorage.getItem("rl");

    const fetchReport = async (page, limit, search, date, sortColumn, sortDirection,status) => {
        setLoading(true);
        
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/v1/dashboard/report?page=${page}&limit=${limit}&search=${search}&createdAt=${date ? date.format("YYYY-MM-DD") : ""}&sortColumn=${sortColumn}&sortDirection=${sortDirection}&status=${status}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
                setReport(data.data.data);
                setTotal(data.data.total);
            } else {
                message.error(data.responseDesc || "Failed to fetch report.");
            }
        } catch (error) {
            message.error("An error occurred while fetching report.");
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        
        fetchReport(page, limit, search, selectedDate, sortColumn, sortDirection,status);
        const observer = new ResizeObserver(
            debounce(() => {
                requestAnimationFrame(() => {
                    console.log("Resize observer callback invoked");

                    // Your resize handling logic
                });
            }, 200) // Delay of 200ms to avoid too many triggers
        );

        observer.observe(document.body); // Observe relevant DOM elements

        return () => {
            observer.disconnect(); // Clean up on component unmount
        };

    }, [page, limit, search, selectedDate, sortColumn, sortDirection,status]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handlePaginationChange = (page, pageSize) => {
        setPage(page);
        setLimit(pageSize);
    };

    const handleSortChange = (value) => {
        const [column, direction] = value.split("|");
        setSortColumn(column);
        setSortDirection(direction);
        setPage(1);
    };

    const handleSortStatus = (value) => {
      
        setStatus(value);
        setPage(1);
    };

    const handleRowClick = async (record) => {
        setSelectedReport(record); // Set the selected report data
        setIsModalVisible(true); // Show the modal
        await fetchReportImages(record.imagePath, "before"); // Fetch images when report is selected
        if (record.afterCaseImagePath !== "") {

            await fetchReportImages(record.afterCaseImagePath, "after"); // Fetch images when report is selected
        }
    };

    const fetchReportImages = async (reportId, path) => {
        setLoadingImages(true); // Start loading images
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/images/${reportId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
                if (path === "before") {

                    setReportImages(data.image_base64); // Assuming the response contains an array of Base64 image strings
                } else {

                    setReportAfterImages(data.image_base64); // Assuming the response contains an array of Base64 image strings
                }
            } else {
                message.error(data.responseDesc || "Failed to fetch images.");
            }
        } catch (error) {
            message.error("An error occurred while fetching images.");
            console.error("Fetch error:", error);
        } finally {
            setLoadingImages(false); // End loading images
        }
    };

    const handleModalClose = () => {
        setIsModalVisible(false); // Hide the modal
        setSelectedReport(null); // Clear the selected report
        setReportImages([]); // Clear the images
        setReportAfterImages([]); // Clear the images
    };

    const handleDeleteCases = async (id) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/dashboard/report/cases/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                message.success("Cases deleted successfully!");

                fetchReport(page, limit, search, selectedDate, sortColumn, sortDirection,status);
            } else {
                message.error("Failed to delete cases.");
            }
        } catch (error) {
            message.error("An error occurred while deleting Cases.");
            console.error("Delete error:", error);
        }
    };

    // Function to export report data to Excel
    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(report);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
        XLSX.writeFile(workbook, "Reports-Cases.xlsx");
    };

    const columns = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            onCell: (record) => ({
                onClick: () => handleRowClick(record), // Add onClick to each cell
            }),
        },
        {
            title: "Created By",
            dataIndex: "createdBy",
            key: "createdBy",
            onCell: (record) => ({
                onClick: () => handleRowClick(record), // Add onClick to each cell
            }),
        },
        {
            title: "Roles",
            dataIndex: "roles",
            key: "roles",
            onCell: (record) => ({
                onClick: () => handleRowClick(record), // Add onClick to each cell
            }),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            onCell: (record) => ({
                onClick: () => handleRowClick(record), // Add onClick to each cell
            }),
        },
        {
            title: "Progress By",
            dataIndex: "nameAssign",
            key: "nameAssign",
            onCell: (record) => ({
                onClick: () => handleRowClick(record), // Add onClick to each cell
            }),
        },
        {
            title: "Location Type",
            dataIndex: "locationType",
            key: "locationType",
            onCell: (record) => ({
                onClick: () => handleRowClick(record), // Add onClick to each cell
            }),
        },
        {
            title: "Location Name",
            dataIndex: "locationName",
            key: "locationName",
            onCell: (record) => ({
                onClick: () => handleRowClick(record), // Add onClick to each cell
            }),
        },
        {
            title: "Reported Date",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (_, record) => {
                const { createdAt } = record;
                return formatDate(createdAt);
            },

            onCell: (record) => ({
                onClick: () => handleRowClick(record), // Add onClick to each cell
            }),
        },

        {
            title: "Reported End",
            dataIndex: "updatedAt",
            key: "updatedAt",
            render: (_, record) => {
                const { status, updatedAt } = record;
                return status === "DONE" ? formatDate(updatedAt) : "-";
            },
            onCell: (record) => ({
                onClick: () => handleRowClick(record), // Add onClick to each cell
            }),
        },

        {
            title: "Action",
            key: "action",
            render: (_, report) => (
                <>
                {role === "ADMIN" ? 
                    <Button onClick={() => handleDeleteCases(report.id)} type="danger">Delete</Button> : <></> }
                </>
            ),
        },

    ];

    return (
        <div>
            <Card title="Filter Reported" bordered={false} style={{ width: '100%', marginBottom: 10, background: "#ecebeb" }}>
                <Row gutter={[16, 16]}>
                    <Col span={8}>
                        <Input.Search
                            placeholder="Search"
                            value={search}
                            onChange={handleSearch}
                            style={{ marginBottom: 20, width: '100%' }}
                        />
                    </Col>
                    <Col span={8}>
                        <DatePicker
                            size="large"
                            onChange={(date) => {
                                setSelectedDate(date);
                                setPage(1);
                            }}
                            style={{ marginBottom: 20, width: '100%' }}
                        />
                    </Col>
                    <Col span={8}>
                        <Select
                            defaultValue={`${sortColumn}|${sortDirection}`}
                            onChange={handleSortChange}
                            size="large"
                            style={{ width: '100%', marginBottom: 20 }}
                      
                         
                        >
                            <Option value="created_at|asc">Reported Date (Asc)</Option>
                            <Option value="created_at|desc">Reported Date (Desc)</Option>
                            <Option value="status|asc">Status (Asc)</Option>
                            <Option value="status|desc">Status (Desc)</Option>
                            <Option value="title|asc">Title (Asc)</Option>
                            <Option value="title|desc">Title (Desc)</Option>
                            <Option value="created_by|asc">Created By (Asc)</Option>
                            <Option value="created_by|desc">Created By (Desc)</Option>
                            <Option value="updated_at|asc">Reported End (Asc)</Option>
                            <Option value="updated_at|desc">Reported End (Desc)</Option>
                        </Select>
                    </Col>
                    <Col span={8}>
                        <Select
                           // defaultValue={`${sortColumn}|${sortDirection}`}
                            onChange={handleSortStatus}
                            size="large"
                            style={{ width: '100%', marginBottom: 20 }}
                               placeholder="Change Status"
                        >
                             <Option value="">All</Option>
                            <Option value="OPEN">Open</Option>
                            <Option value="IN_PROGRESS">In Progress</Option>
                            <Option value="REVIEW">Review</Option>
                            <Option value="DONE">Done</Option>

                        </Select>
                    </Col>
                </Row>
                <Button onClick={exportToExcel} type="primary" style={{ marginBottom: 16 }}>
                    Export to Excel
                </Button>
            </Card>

            <Table
                columns={columns}
                dataSource={report}
                loading={loading}
                rowKey="id"
                pagination={false}
                size="middle"
                scroll={{ x: 'max-content' }}
            />
            <Pagination
                current={page}
                pageSize={limit}
                total={total}
                onChange={handlePaginationChange}
                style={{ marginTop: 20, float: "right" }}
                showSizeChanger // Show page size changer
                onShowSizeChange={(current, pageSize) => setLimit(pageSize)} // Update limit when page size changes
                pageSizeOptions={['5', '10', '20', '50', '100']} // Customize page size options
            />

            {/* Modal for detailed report */}
            <Modal
                title="Report Details"
                visible={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={600}
            >
                {selectedReport && (
                    <div>
                        <h3>{selectedReport.title}</h3>
                        <p><strong>Created By:</strong> {selectedReport.createdBy}</p>
                        <p><strong>Status:</strong> {selectedReport.status}</p>
                        <p><strong>Progress By:</strong> {selectedReport.nameAssign}</p>
                        <p><strong>Location Type:</strong> {selectedReport.locationType}</p>
                        <p><strong>Location Name:</strong> {selectedReport.locationName}</p>
                        <p><strong>Reported Date:</strong> {formatDate(selectedReport.createdAt)}</p>
                        <p><strong>Reported End:</strong> {selectedReport.status === "DONE" ? formatDate(selectedReport.updatedAt) : "-"}</p>
                        {/* Display loading state for images */}
                        {loadingImages ? (
                            <Spin size="large" />
                        ) : (
                            <Row gutter={[16, 16]}>
                                <Col span={8}>
                                    <div>
                                        <h4>Images Before:</h4>
                                        <Image

                                            src={`data:image/jpeg;base64,${reportImages}`} // Assuming the images are JPEG
                                            alt={`Report Image`}
                                            style={{ width: '100%', height: 300, marginBottom: 10 }}
                                        />

                                    </div>
                                </Col>
                                {selectedReport.afterCaseImagePath !== "" ? <Col span={8}>
                                    <div>
                                        <h4>Images After:</h4>
                                        <Image

                                            src={`data:image/jpeg;base64,${reportAfterImages}`} // Assuming the images are JPEG
                                            alt={`Report Image Before`}
                                            style={{ width: '100%', height: 300, marginBottom: 10 }}
                                        />

                                    </div>
                                </Col> : ""}


                            </Row>

                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

const formatDate = (isoString) => {
    const date = new Date(isoString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, '0');

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export default ReportCase;
