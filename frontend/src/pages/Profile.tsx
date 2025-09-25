import React from "react";
import { Tabs, Card, Button, Layout, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { HomeOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
import UserInfo from "../components/UserInfo";
import ChangePassword from "../components/ChangePassword";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";

const { TabPane } = Tabs;
const { Title } = Typography;
const { Content } = Layout;

const Profile: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Layout
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                padding: "24px"
            }}
        >
            <AppHeader />
            <Content style={{ maxWidth: 800, margin: "20px auto 0 auto", width: "100%" }}>
                <div
                    style={{
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 16,
                        padding: "32px",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                        border: "none"
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 32
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 12,
                                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
                                }}
                            >
                                <UserOutlined style={{ fontSize: 24, color: "white" }} />
                            </div>
                            <div>
                                <Title
                                    level={2}
                                    style={{
                                        margin: 0,
                                        color: "#262626",
                                        fontSize: 28,
                                        fontWeight: 700
                                    }}
                                >
                                    Hồ sơ cá nhân
                                </Title>
                                <p style={{ margin: 0, color: "#8c8c8c", fontSize: 16 }}>
                                    Quản lý thông tin tài khoản của bạn
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => navigate("/dashboard")}
                            style={{
                                height: 40,
                                padding: "0 16px",
                                borderRadius: 8,
                                border: "2px solid #667eea",
                                backgroundColor: "white",
                                color: "#667eea",
                                fontSize: 14,
                                fontWeight: 500,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                transition: "all 0.3s ease",
                                boxShadow: "0 2px 8px rgba(102, 126, 234, 0.15)"
                            }}
                            onMouseEnter={(e) => {
                                const target = e.currentTarget as HTMLElement;
                                target.style.backgroundColor = "#667eea";
                                target.style.color = "white";
                                target.style.transform = "translateY(-1px)";
                                target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.25)";
                            }}
                            onMouseLeave={(e) => {
                                const target = e.currentTarget as HTMLElement;
                                target.style.backgroundColor = "white";
                                target.style.color = "#667eea";
                                target.style.transform = "translateY(0)";
                                target.style.boxShadow = "0 2px 8px rgba(102, 126, 234, 0.15)";
                            }}
                        >
                            <HomeOutlined style={{ fontSize: 14 }} />
                            Trang chủ
                        </Button>
                    </div>

                    <Tabs defaultActiveKey="1" size="large">
                        <TabPane
                            tab={
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <UserOutlined />
                                    Thông tin cá nhân
                                </span>
                            }
                            key="1"
                        >
                            <UserInfo />
                        </TabPane>
                        <TabPane
                            tab={
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <LockOutlined />
                                    Đổi mật khẩu
                                </span>
                            }
                            key="2"
                        >
                            <ChangePassword />
                        </TabPane>
                    </Tabs>
                </div>
            </Content>
            <AppFooter />
        </Layout>
    );
};

export default Profile;
