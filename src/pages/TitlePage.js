import React, { useEffect, useState, useRef } from "react";
import { Table, Input, Pagination, message, Button } from "antd";
import { debounce } from "lodash";

import TitleForm from "../components/layout/TitleForm"; // Import the titleForm component
const TitleList = () => {
    const resizeObserverRef = useRef(null);

    const [titles, settitles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTitle, seteditingTitle] = useState(null);

    const fetchtitles = async (page, limit, search) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/v1/case/title/all?page=${page}&limit=${limit}&titlename=${search}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Check if the response status is 401 (Unauthorized)
            if (response.status === 401) {
                message.error(data.responseDesc || "Session Expired.");
                localStorage.removeItem("token"); // Remove the token from local storage
                window.location.href = "/sign-in"; // Redirect to the login page
                return; // Stop further execution
            }

            const data = await response.json();

            if (response.ok) {
                settitles(data.data.data); // Set title data
                setTotal(data.data.total); // Set total count for pagination
            } else {
                message.error(data.responseDesc || "Failed to fetch titles.");
            }
        } catch (error) {
            message.error("An error occurred while fetching titles.");
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchtitles(page, limit, search);

        const resizeObserver = new ResizeObserver(debounce(() => {
            // Your resize handling logic
        }, 200));

        resizeObserver.observe(document.body); // or your specific component
        resizeObserverRef.current = resizeObserver;

        return () => {
            resizeObserver.disconnect();
        };
    }, [page, limit, search]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handlePaginationChange = (page, pageSize) => {
        setPage(page);
        setLimit(pageSize);
    };

    const handleAddtitle = () => {
        seteditingTitle(null);
        setIsModalVisible(true);
    };

    const handleEdittitle = (title) => {
        seteditingTitle(title);
        setIsModalVisible(true);
    };

    const handleDeletetitle = async (titleId) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/case/title/${titleId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                message.success("title deleted successfully!");
                fetchtitles(page, limit, search); // Re-fetch titles after delete
            } else {
                message.error("Failed to delete title.");
            }
        } catch (error) {
            message.error("An error occurred while deleting title.");
            console.error("Delete error:", error);
        }
    };

    const handleCreateOrUpdatetitle = async (titleData) => {
        const token = localStorage.getItem("token");
        try {
            const method = editingTitle ? "PUT" : "POST"; // Determine method based on editingTitle state
            const url = editingTitle
                ? `${process.env.REACT_APP_API_URL}/api/v1/case/title/${editingTitle.id}`
                : `${process.env.REACT_APP_API_URL}/api/v1/case/title`;



            // Only include the password if creating a new title
            const body = editingTitle ?
                {
                    nameTitle: titleData.nameTitle,

                } : titleData;

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                message.success(editingTitle ? "title updated successfully!" : "title created successfully!");
                setIsModalVisible(false); // Close the modal
                fetchtitles(page, limit, search); // Re-fetch titles after create/update
            } else {
                message.error("Failed to save title.");
            }
        } catch (error) {
            message.error("An error occurred while saving title.");
            console.error("Save error:", error);
        }
    };

    const columns = [
        {
            title: "id",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "Title Name",
            dataIndex: "nameTitle",
            key: "nameTitle",
        },

        {
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (_, record) => {
                const { createdAt } = record;
                return formatDate(createdAt);
            },
        },
        {
            title: "Action",
            key: "action",
            render: (_, title) => (
                <>
                    <Button onClick={() => handleEdittitle(title)} style={{ marginRight: 8 }}>Edit</Button>
                    <Button onClick={() => handleDeletetitle(title.id)} type="danger">Delete</Button>
                </>
            ),
        },
    ];

    return (
        <div>
            <Button type="primary" onClick={handleAddtitle} style={{ marginBottom: 20 }}>
                Add title
            </Button>
            <Input.Search
                placeholder="Search"
                value={search}
                onChange={handleSearch}
                style={{ marginBottom: 20, width: 300 }}

            />
            <Table
                columns={columns}
                dataSource={titles}
                loading={loading}
                rowKey="id" // Assuming each title has a unique ID
                pagination={false} // Disable default pagination to use custom one
                size="middle" // Optional: set table size to middle
                scroll={{ x: 'max-content' }} // Prevent layout shifts
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

            <TitleForm
                visible={isModalVisible}
                onCreate={handleCreateOrUpdatetitle}
                onCancel={() => {
                    setIsModalVisible(false);
                    seteditingTitle(null);
                }}
                title={editingTitle} // Pass the current title data to the form
            />
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

export default TitleList;
