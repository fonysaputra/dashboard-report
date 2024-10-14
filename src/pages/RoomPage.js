import React, { useEffect, useState, useRef } from "react";
import { Table, Input, Pagination, message, Button } from "antd";
import { debounce } from "lodash";

import RoomForm from "../components/layout/RoomForm"; // Import the RoomForm component
const RoomList = () => {
    const resizeObserverRef = useRef(null);

    const [rooms, setrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingroom, seteditingroom] = useState(null);

    const fetchrooms = async (page, limit, search) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/v1/case/room/all?page=${page}&limit=${limit}&search=${search}`,
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
                setrooms(data.data.data); // Set room data
                setTotal(data.data.total); // Set total count for pagination
            } else {
                message.error(data.responseDesc || "Failed to fetch rooms.");
            }
        } catch (error) {
            message.error("An error occurred while fetching rooms.");
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchrooms(page, limit, search);

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

    const handleAddroom = () => {
        seteditingroom(null);
        setIsModalVisible(true);
    };

    const handleEditroom = (room) => {
        seteditingroom(room);
        setIsModalVisible(true);
    };

    const handleDeleteRoom = async (id) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/case/room/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                message.success("room deleted successfully!");
                fetchrooms(page, limit, search); // Re-fetch rooms after delete
            } else {
                message.error("Failed to delete room.");
            }
        } catch (error) {
            message.error("An error occurred while deleting room.");
            console.error("Delete error:", error);
        }
    };

    const handleCreateOrUpdateroom = async (roomData) => {
        const token = localStorage.getItem("token");
        try {
            const method = editingroom ? "PUT" : "POST"; // Determine method based on editingroom state
            const url = editingroom
                ? `${process.env.REACT_APP_API_URL}/api/v1/case/room/${editingroom.id}`
                : `${process.env.REACT_APP_API_URL}/api/v1/case/room`;


           
            // Only include the password if creating a new room
            const body = editingroom ?
                {
                    name: roomData.name,
                  
                } : roomData;

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                message.success(editingroom ? "room updated successfully!" : "room created successfully!");
                setIsModalVisible(false); // Close the modal
                fetchrooms(page, limit, search); // Re-fetch rooms after create/update
            } else {
                message.error("Failed to save room.");
            }
        } catch (error) {
            message.error("An error occurred while saving room.");
            console.error("Save error:", error);
        }
    };

    const columns = [
        {
            room: "id",
            dataIndex: "id",
            key: "id",
        },
        {
            room: "Room Name",
            dataIndex: "name",
            key: "name",
        },
       
        {
            room: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (_, record) => {
                const { createdAt } = record;
                return formatDate(createdAt) ;
            },
        },
        {
            room: "Action",
            key: "action",
            render: (_, room) => (
                <>
                    <Button onClick={() => handleEditroom(room)} style={{ marginRight: 8 }}>Edit</Button>
                    <Button onClick={() => handleDeleteRoom(room.id)} type="danger">Delete</Button>
                </>
            ),
        },
    ];

    return (
        <div>
            <Button type="primary" onClick={handleAddroom} style={{ marginBottom: 20 }}>
                Add Room
            </Button>
            <Input.Search
                placeholder="Search"
                value={search}
                onChange={handleSearch}
                style={{ marginBottom: 20, width: 300 }}
                
            />
            <Table
                columns={columns}
                dataSource={rooms}
                loading={loading}
                rowKey="id" // Assuming each room has a unique ID
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
                pageSizeOptions={['5','10', '20', '50', '100']} // Customize page size options
                
            />

            <RoomForm
                visible={isModalVisible}
                onCreate={handleCreateOrUpdateroom}
                onCancel={() => {
                    setIsModalVisible(false);
                    seteditingroom(null);
                }}
                room={editingroom} // Pass the current room data to the form
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

export default RoomList;
