import React, { useState } from "react";
import { Tabs, Typography, Button } from "antd";
import { BookOutlined, TeamOutlined, DashboardOutlined, HomeOutlined, ShopOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AdminBooks from "../components/AdminBooks";
import AdminUsers from "../components/AdminUsers";
import AdminStoreInfo from "../components/AdminStoreInfo";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState("books");
    const navigate = useNavigate();

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                padding: "24px"
            }}
        >
            <AppHeader />
            <div
                style={{
                    maxWidth: 1200,
                    margin: "20px auto 0 auto"
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 16,
                        padding: "32px",
                        marginBottom: 24,
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                        border: "none"
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 32
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 16,
                                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)"
                                }}
                            >
                                <DashboardOutlined style={{ fontSize: 32, color: "white" }} />
                            </div>
                            <div>
                                <Title
                                    level={1}
                                    style={{
                                        margin: 0,
                                        color: "#262626",
                                        fontSize: 36,
                                        fontWeight: 700
                                    }}
                                >
                                    Quản lý cửa hàng
                                </Title>
                                <Text type="secondary" style={{ fontSize: 18 }}>
                                    Bảng điều khiển quản trị hệ thống
                                </Text>
                            </div>
                        </div>

                        {/* Improved Home Button */}
                        <Button
                            type="primary"
                            icon={<HomeOutlined style={{ fontSize: 20 }} />}
                            onClick={() => navigate("/dashboard")}
                            style={{
                                height: 48,
                                padding: "0 24px",
                                borderRadius: 12,
                                background: "linear-gradient(135deg, #667eea, #764ba2)",
                                border: "none",
                                fontSize: 16,
                                fontWeight: 500,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                transition: "all 0.3s ease",
                                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
                            }}
                        >
                            Trang chủ
                        </Button>
                    </div>

                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        size="large"
                        tabBarStyle={{
                            marginBottom: 0,
                            borderBottom: "2px solid #f0f0f0"
                        }}
                    >
                        <TabPane
                            tab={
                                <span
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        fontSize: 16,
                                        fontWeight: 500
                                    }}
                                >
                                    <BookOutlined />
                                    Quản lý sách
                                </span>
                            }
                            key="books"
                        />
                        <TabPane
                            tab={
                                <span
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        fontSize: 16,
                                        fontWeight: 500
                                    }}
                                >
                                    <TeamOutlined />
                                    Quản lý người dùng
                                </span>
                            }
                            key="users"
                        />
                        <TabPane
                            tab={
                                <span
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        fontSize: 16,
                                        fontWeight: 500
                                    }}
                                >
                                    <ShopOutlined />
                                    Thông tin cửa hàng
                                </span>
                            }
                            key="store"
                        />
                    </Tabs>
                </div>

                <div>
                    {activeTab === "books" && <AdminBooks />}
                    {activeTab === "users" && <AdminUsers />}
                    {activeTab === "store" && <AdminStoreInfo />}
                </div>
            </div>

            <AppFooter />
        </div>
    );
};

export default AdminPage;
