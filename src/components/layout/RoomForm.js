// RoomForm.js
import React, { useEffect } from "react";
import { Form, Input, Modal, Button } from "antd";


const RoomForm = ({ visible, onCreate, onCancel, room }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue(room);
    }, [room, form]);

    const onFinish = async (values) => {
        onCreate(values);
        form.resetFields();
    };

    return (
        <Modal
            visible={visible}
            room={room ? "Edit Room" : "Create Room"}
            okText={room ? "Update" : "Create"}
            onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={() => form.submit()}>
                    {room ? "Update" : "Create"}
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
              
                <Form.Item
                    name="name"
                    label="Name Room"
                    rules={[{ required: true, message: "Please input the room!" }]}
                >
                    <Input />
                </Form.Item>
          
             
             
            </Form>
        </Modal>
    );
};

export default RoomForm;
