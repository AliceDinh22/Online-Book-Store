import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, message, Typography } from "antd";
import { LockOutlined } from "@ant-design/icons";
import axiosClient from "../api/axiosClient";
import { UserDTO, PasswordResetForm } from "../types/types";

const { Text } = Typography;

const ChangePassword: React.FC = () => {
    const [form] = Form.useForm();
    const [user, setUser] = useState<UserDTO | null>(null);
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const handleChangePassword = async (values: PasswordResetForm) => {
        if (!user) return;
        setLoading(true);
        try {
            await axiosClient.put("users/edit/password", {
                email: user.email,
                password: values.password,
                password2: values.password2
            });
            messageApi.success("Đổi mật khẩu thành công!");
            form.resetFields();
        } catch (error: any) {
            messageApi.error(error.response?.data?.data || "Đổi mật khẩu thất bại!");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div style={{ textAlign: "center", padding: 40 }}>Đang tải thông tin...</div>;

    return (
        <div style={{ marginTop: 16 }}>
            {contextHolder}
            <Card
                style={{
                    maxWidth: 500,
                    margin: "0",
                    border: "1px solid #f0f0f0",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
                }}
                bodyStyle={{ padding: 24 }}
            >
                <Form form={form} layout="vertical" onFinish={handleChangePassword} requiredMark={false}>
                    <Form.Item label="Email hiện tại">
                        <Input
                            value={user?.email}
                            disabled
                            style={{
                                backgroundColor: "#f5f5f5",
                                border: "1px solid #d9d9d9"
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu mới"
                        name="password"
                        rules={[
                            { required: true, message: "Vui lòng nhập mật khẩu mới" },
                            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
                        ]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu mới" />
                    </Form.Item>

                    <Form.Item
                        label="Xác nhận mật khẩu mới"
                        name="password2"
                        dependencies={["password"]}
                        rules={[
                            { required: true, message: "Vui lòng xác nhận mật khẩu" },
                            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("password") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Mật khẩu không khớp"));
                                }
                            })
                        ]}
                    >
                        <Input.Password placeholder="Xác nhận mật khẩu mới" />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            style={{
                                height: 48,
                                background: "linear-gradient(135deg, #667eea, #764ba2)",
                                border: "none",
                                borderRadius: 8,
                                fontWeight: 500,
                                fontSize: 16
                            }}
                        >
                            Cập nhật mật khẩu
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ChangePassword;
