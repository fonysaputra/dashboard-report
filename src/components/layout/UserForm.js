// UserForm.js
import React, { useEffect } from "react";
import { Form, Input, Modal, Button, Select } from "antd";

const { Option } = Select; // Destructure Option from Select

const UserForm = ({ visible, onCreate, onCancel, user }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue(user);
    }, [user, form]);

    const onFinish = async (values) => {
        onCreate(values);
        form.resetFields();
    };

    return (
        <Modal
            visible={visible}
            title={user ? "Edit User" : "Create User"}
            okText={user ? "Update" : "Create"}
            onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={() => form.submit()}>
                    {user ? "Update" : "Create"}
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="username"
                    label="Username"
                    rules={[{ required: true, message: "Please input the username!" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: "Please input the name!" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="tittle"
                    label="Tittle"
                    rules={[{ required: true, message: "Please input the title!" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="roles"
                    label="Roles"
                    rules={[{ required: true, message: "Please select a role!" }]}
                >
                    <Select placeholder="Select a role">
                        <Option value="ADMIN">Admin</Option>
                        <Option value="FO">Front Office</Option>
                        <Option value="HK">House Keeping</Option>
                        <Option value="ENG">Engineering</Option>
                        {/* Add more roles as needed */}
                    </Select>
                </Form.Item>
                {!user && (
                    <>
                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[{ required: true, message: "Please input the password!" }]}
                        >
                            <Input.Password />
                        </Form.Item>
                        <Form.Item
                            name="confirmPassword"
                            label="Confirm Password"
                            dependencies={['password']}
                            rules={[
                                { required: true, message: "Please confirm your password!" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('The two passwords do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                    </>
                )}
            </Form>
        </Modal>
    );
};

export default UserForm;
