import React, { useEffect, useState, useRef } from "react";
import { Table, Input, Pagination, message, Button,Modal } from "antd";
import { debounce } from "lodash";

import UserForm from "../components/layout/UserForm"; // Import the UserForm component
const UserList = () => {
    const resizeObserverRef = useRef(null);

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
const [password, setPassword] = useState("");
const [userForPasswordUpdate, setUserForPasswordUpdate] = useState(null);

    const fetchUsers = async (page, limit, search) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/v1/users?page=${page}&limit=${limit}&username=${search}`,
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
                setUsers(data.data.data); // Set user data
                setTotal(data.data.total); // Set total count for pagination
            } else {
                message.error(data.responseDesc || "Failed to fetch users.");
            }
        } catch (error) {
            message.error("An error occurred while fetching users.");
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(page, limit, search);

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

    const handleAddUser = () => {
        setEditingUser(null);
        setIsModalVisible(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setIsModalVisible(true);
    };

    const handleDeleteUser = async (userId) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/users/${userId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                message.success("User deleted successfully!");
                fetchUsers(page, limit, search); // Re-fetch users after delete
            } else {
                message.error("Failed to delete user.");
            }
        } catch (error) {
            message.error("An error occurred while deleting user.");
            console.error("Delete error:", error);
        }
    };

    const handleCreateOrUpdateUser = async (userData) => {
        const token = localStorage.getItem("token");
        try {
            const method = editingUser ? "PUT" : "POST"; // Determine method based on editingUser state
            const url = editingUser
                ? `${process.env.REACT_APP_API_URL}/api/v1/users/${editingUser.ID}`
                : `${process.env.REACT_APP_API_URL}/api/v1/user/register`;


            console.log(`cek roles ${userData.roles}`)
            switch (userData.roles) {
                case "House Keeping":
                    userData.roles = "HK"
                    break;
                case "Admin":
                    userData.roles = "ADMIN"
                    break;
                case "Viewer":
                        userData.roles = "VIEWER"
                        break;
                case "Engineer":
                    userData.roles = "ENG"
                    break;
                case "Front Office":
                    userData.roles = "FO"
                    break;
                    case "Reviewer":
                        userData.roles = "EFO"
                        break;
                default:
                    break;
            }
            // Only include the password if creating a new user
            const body = editingUser ?
                {
                    username: userData.username,
                    name: userData.name,
                    tittle: userData.tittle,
                    roles: userData.roles,
                    password: userData.password
                } : userData;

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                message.success(editingUser ? "User updated successfully!" : "User created successfully!");
                setIsModalVisible(false); // Close the modal
                fetchUsers(page, limit, search); // Re-fetch users after create/update
            } else {
                message.error("Failed to save user.");
            }
        } catch (error) {
            message.error("An error occurred while saving user.");
            console.error("Save error:", error);
        }
    };


    const handleUpdatePassword = (user) => {
        setUserForPasswordUpdate(user);
        setIsPasswordModalVisible(true);
    };
    
    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };
    
    const handlePasswordSubmit = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/users/${userForPasswordUpdate.ID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ password }), // Send new password
            });
    
            if (response.ok) {
                message.success("Password updated successfully!");
                setIsPasswordModalVisible(false);
                setPassword(""); // Clear the password input
            } else {
                message.error("Failed to update password.");
            }
        } catch (error) {
            message.error("An error occurred while updating the password.");
            console.error("Password update error:", error);
        }
    };

    
    const columns = [
        {
            title: "Username",
            dataIndex: "username",
            key: "username",
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Title",
            dataIndex: "tittle",
            key: "tittle",
        },
        {
            title: "Roles",
            dataIndex: "roles",
            key: "roles",
        },
        {
            title: "Created At",
            dataIndex: "CreatedAt",
            key: "CreatedAt",
            render: (_, record) => {
                const { CreatedAt } = record;
                return formatDate(CreatedAt) ;
            },
        },
        {
            title: "Action",
            key: "action",
            render: (_, user) => (
                <>
                 <Button onClick={() => handleUpdatePassword(user)} style={{ marginRight: 8 }} type="primary">Update Password</Button>
                    <Button onClick={() => handleEditUser(user)} style={{ marginRight: 8 }}>Edit</Button>
                    <Button onClick={() => handleDeleteUser(user.ID)} type="danger">Delete</Button>
                </>
            ),
        },
    ];

    return (
        <div>
            <Button type="primary" onClick={handleAddUser} style={{ marginBottom: 20 }}>
                Add User
            </Button>
            <Input.Search
                placeholder="Search"
                value={search}
                onChange={handleSearch}
                style={{ marginBottom: 20, width: 300 }}
                
            />
            <Table
                columns={columns}
                dataSource={users}
                loading={loading}
                rowKey="ID" // Assuming each user has a unique ID
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

            <UserForm
                visible={isModalVisible}
                onCreate={handleCreateOrUpdateUser}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingUser(null);
                }}
                user={editingUser} // Pass the current user data to the form
            />

<Modal
            title="Update Password"
            visible={isPasswordModalVisible}
            onCancel={() => setIsPasswordModalVisible(false)}
            onOk={handlePasswordSubmit}
        >
            <Input.Password
                placeholder="Enter new password"
                value={password}
                onChange={handlePasswordChange}
            />
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

export default UserList;
