// TitleForm.js
import React, { useEffect } from "react";
import { Form, Input, Modal, Button } from "antd";


const TitleForm = ({ visible, onCreate, onCancel, title }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue(title);
    }, [title, form]);

    const onFinish = async (values) => {
        onCreate(values);
        form.resetFields();
    };

    return (
        <Modal
            visible={visible}
            title={title ? "Edit Title" : "Create Title"}
            okText={title ? "Update" : "Create"}
            onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={() => form.submit()}>
                    {title ? "Update" : "Create"}
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
              
                <Form.Item
                    name="nameTitle"
                    label="Name Title"
                    rules={[{ required: true, message: "Please input the title!" }]}
                >
                    <Input />
                </Form.Item>
          
             
             
            </Form>
        </Modal>
    );
};

export default TitleForm;
