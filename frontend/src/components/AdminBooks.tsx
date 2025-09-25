import React, { useEffect, useState } from "react";
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    Tabs,
    message,
    Upload,
    Switch,
    Popconfirm,
    Card,
    Typography,
    Space,
    Tag,
    Avatar,
    Row,
    Col,
    Statistic
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    BookOutlined,
    InboxOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined
} from "@ant-design/icons";
import axiosClient from "../api/axiosClient";
import { BookDTO } from "../types/types";
import styles from "../css/AdminBooks.module.css";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AdminBooks: React.FC = () => {
    const [books, setBooks] = useState<BookDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<BookDTO | null>(null);
    const [form] = Form.useForm();
    const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [messageApi, contextHolder] = message.useMessage();

    const fetchBooks = async () => {
        setLoading(true);
        try {
            let url = "/admin/books";
            if (filter === "active") url = "/books/active";
            else if (filter === "inactive") url = "/admin/books/inactive";

            const res = await axiosClient.get(url);
            setBooks(res.data.data || []);
        } catch {
            messageApi.error("Lấy danh sách sách thất bại!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, [filter]);

    const openModal = (book?: BookDTO) => {
        if (book) {
            setEditingBook(book);
            form.setFieldsValue(book);
            // Chuyển coverImages sang fileList để hiển thị Upload
            const files: UploadFile[] = (book.coverImages || []).map((url, index) => ({
                uid: String(index),
                name: url,
                status: "done",
                url
            }));
            setFileList(files);
        } else {
            setEditingBook(null);
            form.resetFields();
            setFileList([]);
        }
        setModalOpen(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            const formData = new FormData();
            Object.keys(values).forEach((key) => {
                const value = values[key];
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });

            fileList.forEach((file) => {
                if (file.originFileObj) {
                    formData.append("files", file.originFileObj);
                }
            });

            if (editingBook?.id) {
                await axiosClient.put(`/admin/books/${editingBook.id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                messageApi.success("Cập nhật sách thành công!");
            } else {
                await axiosClient.post("/admin/books", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                messageApi.success("Thêm sách thành công!");
            }

            fetchBooks();
            setModalOpen(false);
            form.resetFields();
            setFileList([]);
            setEditingBook(null);
        } catch (err) {
            messageApi.error("Thao tác thất bại!");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axiosClient.delete(`/admin/books/${id}`);
            messageApi.success("Xóa sách thành công!");
            fetchBooks();
        } catch {
            messageApi.error("Xóa sách thất bại!");
        }
    };

    // Tính toán thống kê
    const totalBooks = books.length;
    const activeBooks = books.filter((book) => !book.isDeleted).length;
    const inactiveBooks = books.filter((book) => book.isDeleted).length;
    const outOfStock = books.filter((book) => (book.stock ?? 0) - (book.sold ?? 0) <= 0).length;

    const columns = [
        {
            title: "Sách",
            dataIndex: "title",
            key: "title",
            width: 300,
            render: (title: string, record: BookDTO) => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar
                        size={48}
                        src={record.coverImages?.[0]}
                        icon={<BookOutlined />}
                        style={{
                            backgroundColor: "#f0f0f0",
                            borderRadius: 8
                        }}
                    />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{title}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.author}
                        </Text>
                    </div>
                </div>
            )
        },
        {
            title: "Giá",
            key: "price",
            width: 180,
            render: (_: any, record: BookDTO) => {
                const hasDiscount =
                    record.discountPrice !== undefined &&
                    record.discountPrice !== null &&
                    record.discountPrice > 0 &&
                    record.discountPrice < record.originalPrice;

                return (
                    <div>
                        {hasDiscount ? (
                            <>
                                <div>
                                    <Text strong style={{ color: "#52c41a" }}>
                                        {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND"
                                        }).format(record.discountPrice!)}
                                    </Text>
                                </div>
                                <div style={{ fontSize: 12 }}>
                                    <Text type="secondary" delete>
                                        {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND"
                                        }).format(record.originalPrice)}
                                    </Text>
                                </div>
                            </>
                        ) : (
                            <Text strong style={{ color: "#52c41a" }}>
                                {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND"
                                }).format(record.originalPrice)}
                            </Text>
                        )}
                    </div>
                );
            }
        },
        {
            title: "Kho",
            key: "inventory",
            width: 120,
            render: (_: any, record: BookDTO) => {
                const stock = record.stock ?? 0;
                const sold = record.sold ?? 0;
                const remaining = stock - sold;

                return (
                    <div>
                        <Text strong>{remaining}</Text>
                        <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                            / {stock} cuốn
                        </Text>
                    </div>
                );
            }
        },
        {
            title: "Đã bán",
            dataIndex: "sold",
            key: "sold",
            width: 80,
            render: (sold: number) => <Text>{sold ?? 0}</Text>
        },
        {
            title: "Trạng thái",
            key: "status",
            width: 120,
            render: (_: any, record: BookDTO) => {
                const stock = record.stock ?? 0;
                const sold = record.sold ?? 0;
                const remaining = stock - sold;

                if (record.isDeleted) {
                    return (
                        <Tag color="red" icon={<ExclamationCircleOutlined />}>
                            Ngừng bán
                        </Tag>
                    );
                }

                if (remaining <= 0) {
                    return (
                        <Tag color="orange" icon={<InboxOutlined />}>
                            Hết hàng
                        </Tag>
                    );
                }

                return (
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                        Còn hàng
                    </Tag>
                );
            }
        },
        {
            title: "Hành động",
            key: "actions",
            width: 120,
            render: (_: any, record: BookDTO) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => openModal(record)}
                        style={{ color: "#1890ff" }}
                    />
                    <Popconfirm
                        title="Xóa sách"
                        description="Bạn có chắc muốn xóa sách này?"
                        onConfirm={() => handleDelete(record.id!)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="text" icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const components = {
        header: {
            cell: (props: any) => <th {...props} style={{ backgroundColor: "#fafafa", fontWeight: 600 }} />
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                padding: "24px"
            }}
        >
            {contextHolder}
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                    <Title
                        level={2}
                        style={{
                            margin: 0,
                            color: "#262626",
                            fontSize: 28,
                            fontWeight: 700
                        }}
                    >
                        Quản lý sách
                    </Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                        Quản lý kho sách và thông tin chi tiết
                    </Text>
                </div>

                {/* Statistics Cards */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            style={{
                                borderRadius: 12,
                                border: "none",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                            }}
                        >
                            <Statistic
                                title="Tổng số sách"
                                value={totalBooks}
                                prefix={<BookOutlined style={{ color: "#1890ff" }} />}
                                valueStyle={{ color: "#1890ff" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            style={{
                                borderRadius: 12,
                                border: "none",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                            }}
                        >
                            <Statistic
                                title="Đang bán"
                                value={activeBooks}
                                prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                                valueStyle={{ color: "#52c41a" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            style={{
                                borderRadius: 12,
                                border: "none",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                            }}
                        >
                            <Statistic
                                title="Ngừng bán"
                                value={inactiveBooks}
                                prefix={<ExclamationCircleOutlined style={{ color: "#faad14" }} />}
                                valueStyle={{ color: "#faad14" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            style={{
                                borderRadius: 12,
                                border: "none",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                            }}
                        >
                            <Statistic
                                title="Hết hàng"
                                value={outOfStock}
                                prefix={<InboxOutlined style={{ color: "#f5222d" }} />}
                                valueStyle={{ color: "#f5222d" }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Main Content Card */}
                <Card
                    style={{
                        borderRadius: 16,
                        border: "none",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)"
                    }}
                >
                    {/* Filter Tabs and Add Button */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 24,
                            flexWrap: "wrap",
                            gap: 16
                        }}
                    >
                        <Tabs
                            activeKey={filter}
                            onChange={(key) => setFilter(key as any)}
                            size="large"
                            style={{ flex: 1 }}
                        >
                            <TabPane
                                tab={
                                    <span>
                                        <BookOutlined />
                                        Tất cả ({totalBooks})
                                    </span>
                                }
                                key="all"
                            />
                            <TabPane
                                tab={
                                    <span>
                                        <CheckCircleOutlined />
                                        Đang bán ({activeBooks})
                                    </span>
                                }
                                key="active"
                            />
                            <TabPane
                                tab={
                                    <span>
                                        <ExclamationCircleOutlined />
                                        Ngừng bán ({inactiveBooks})
                                    </span>
                                }
                                key="inactive"
                            />
                        </Tabs>

                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => openModal()}
                            style={{
                                height: 40,
                                borderRadius: 8,
                                fontSize: 14,
                                fontWeight: 500,
                                background: "linear-gradient(135deg, #667eea, #764ba2)",
                                border: "none",
                                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
                            }}
                        >
                            Thêm sách mới
                        </Button>
                    </div>

                    {/* Table */}
                    <Table
                        dataSource={books}
                        rowKey="id"
                        loading={loading}
                        columns={columns}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sách`
                        }}
                        components={components}
                    />
                </Card>

                {/* Modal */}
                <Modal
                    title={
                        <div
                            style={{
                                fontSize: 18,
                                fontWeight: 600,
                                color: "#262626"
                            }}
                        >
                            {editingBook ? "Cập nhật sách" : "Thêm sách mới"}
                        </div>
                    }
                    open={modalOpen}
                    onOk={handleOk}
                    onCancel={() => {
                        setModalOpen(false);
                        form.resetFields();
                        setFileList([]);
                        setEditingBook(null);
                    }}
                    okText="Lưu"
                    cancelText="Hủy"
                    width={600}
                    style={{ top: 20 }}
                    okButtonProps={{
                        style: {
                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                            border: "none",
                            borderRadius: 6
                        }
                    }}
                >
                    <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Tên sách"
                                    name="title"
                                    rules={[{ required: true, message: "Vui lòng nhập tên sách" }]}
                                >
                                    <Input placeholder="Nhập tên sách" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Tác giả"
                                    name="author"
                                    rules={[{ required: true, message: "Vui lòng nhập tác giả" }]}
                                >
                                    <Input placeholder="Nhập tên tác giả" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Nhà xuất bản" name="publisher">
                                    <Input placeholder="Nhập nhà xuất bản" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Thể loại" name="category">
                                    <Input placeholder="Nhập thể loại" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            label="Mô tả"
                            name="description"
                            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                        >
                            <Input.TextArea rows={3} placeholder="Nhập mô tả sách" showCount maxLength={500} />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    label="Giá gốc (VND)"
                                    name="originalPrice"
                                    rules={[
                                        { required: true, message: "Vui lòng nhập giá gốc" },
                                        { type: "number", min: 0.01, message: "Giá phải lớn hơn 0" }
                                    ]}
                                >
                                    <InputNumber<number>
                                        style={{ width: "100%" }}
                                        placeholder="0"
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                        parser={(value) => (value ? Number(value.replace(/,/g, "")) : 0)}
                                        min={0}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    label="Giá giảm (VND)"
                                    name="discountPrice"
                                    rules={[{ type: "number", min: 0, message: "Giá giảm không hợp lệ" }]}
                                >
                                    <InputNumber<number>
                                        style={{ width: "100%" }}
                                        placeholder="0"
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                        parser={(value) => (value ? Number(value.replace(/,/g, "")) : 0)}
                                        min={0}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    label="Số lượng"
                                    name="stock"
                                    rules={[
                                        { required: true, message: "Vui lòng nhập số lượng" },
                                        { type: "number", min: 0, message: "Số lượng không hợp lệ" }
                                    ]}
                                >
                                    <InputNumber style={{ width: "100%" }} placeholder="0" min={0} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item label="Ảnh bìa">
                            <Upload
                                listType="picture-card"
                                fileList={fileList}
                                onChange={({ fileList }) => setFileList(fileList)}
                                beforeUpload={() => false} // ngăn upload tự động
                                multiple
                                accept="image/*"
                            >
                                {fileList.length < 5 && (
                                    <div style={{ textAlign: "center" }}>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8, fontSize: 12 }}>Tải ảnh lên</div>
                                    </div>
                                )}
                            </Upload>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Tối đa 5 ảnh, định dạng JPG, PNG
                            </Text>
                        </Form.Item>

                        <Form.Item label="Trạng thái" name="isDeleted" valuePropName="checked" initialValue={false}>
                            <Switch
                                checkedChildren="Ngừng bán"
                                unCheckedChildren="Đang bán"
                                style={{
                                    background: "#52c41a"
                                }}
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default AdminBooks;
