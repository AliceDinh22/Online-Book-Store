import React, { useEffect, useState } from "react";
import { Layout, Typography, Button, Space } from "antd";
import {
    BookOutlined,
    ProfileOutlined,
    FileTextOutlined,
    ControlOutlined,
    ShoppingOutlined,
    LogoutOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { logout } from "../auth/authSlice";
import axiosClient from "../api/axiosClient";

const { Header } = Layout;
const { Title, Text } = Typography;

const AppHeader: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const [storeInfo, setStoreInfo] = useState<any>(null);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/dashboard");
    };

    const getLatestStoreInfo = async () => {
        try {
            const response = await axiosClient.get("/auth/store/latest");
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy thông tin cửa hàng mới nhất:", error);
            return null;
        }
    };

    useEffect(() => {
        getLatestStoreInfo().then((data) => setStoreInfo(data));
    }, []);

    return (
        <Header
            style={{
                background: "white",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                position: "sticky",
                top: 0,
                zIndex: 1000,
                padding: "0 24px"
            }}
        >
            <div
                style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}
            >
                <div
                    style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
                    onClick={() => navigate("/dashboard")}
                >
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <BookOutlined style={{ fontSize: 20, color: "white" }} />
                    </div>
                    <Title level={3} style={{ margin: 0, color: "#262626" }}>
                        {storeInfo?.name}
                    </Title>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    {user ? (
                        <Space>
                            <Text>
                                Xin chào, <strong>{user.firstName}</strong>
                            </Text>
                            <Space.Compact>
                                <Button icon={<ProfileOutlined />} onClick={() => navigate("/profile")}>
                                    Hồ sơ
                                </Button>
                                <Button icon={<FileTextOutlined />} onClick={() => navigate("/my-orders")}>
                                    Đơn hàng
                                </Button>
                                {(user.role === "ADMIN" || user.role === "STAFF") && (
                                    <Button icon={<ShoppingOutlined />} onClick={() => navigate("/orders")}>
                                        Tất cả đơn hàng
                                    </Button>
                                )}
                                {user.role === "ADMIN" && (
                                    <Button icon={<ControlOutlined />} onClick={() => navigate("/admin")}>
                                        Quản lý
                                    </Button>
                                )}
                                <Button icon={<LogoutOutlined />} onClick={handleLogout}>
                                    Đăng xuất
                                </Button>
                            </Space.Compact>
                        </Space>
                    ) : (
                        <Button type="primary" onClick={() => navigate("/login")}>
                            Đăng nhập
                        </Button>
                    )}
                </div>
            </div>
        </Header>
    );
};

export default AppHeader;
