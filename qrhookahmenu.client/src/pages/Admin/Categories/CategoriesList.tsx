import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, Upload, message, Image } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps, ColumnsType } from 'antd/es/table';

interface CategoryDto {
    id?: number;
    parentId?: number | null;
    name: string;
    description?: string;
    sortOrder?: number;
    imageUrl?: string; // URL alanı
    subCategories?: CategoryDto[];
    products?: ProductDto[];
}

interface ProductDto {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
}

const CategoriesList: React.FC = () => {
    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // API'den kategorileri çekme
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/categories');
                const data: CategoryDto[] = await response.json();
                setCategories(data);
            } catch (error) {
                message.error('Kategoriler yüklenirken hata oluştu.');
                console.error('Hata:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Silme işlemi
    const handleDelete = (id: number) => {
        setCategories((prev) => prev.filter((category) => category.id !== id));
        message.success('Kategori başarıyla silindi.');
    };

    // Düzenleme işlemi
    const handleEdit = (id: number) => {
        console.log('Edit:', id);
        window.location.href = `/admin/categories/edit/${id}`;
    };

    // Kategori ekleme işlemi
    const handleAdd = () => {
        console.log('Add new category');
        window.location.href = '/admin/categories/add';
    };

    // Resim yükleme işlemi
    const handleUpload = async (info: any, record: CategoryDto) => {
        if (info.file.status === 'uploading') {
            message.loading('Resim yükleniyor...');
            return;
        }

        if (info.file.status === 'done') {
            // Backend'den dönen URL'yi al
            const uploadedUrl = info.file.response?.url; // Backend yükleme yanıtı
            if (uploadedUrl) {
                // Kategoriye yeni URL'yi ekle
                setCategories((prev) =>
                    prev.map((category) =>
                        category.id === record.id
                            ? { ...category, imageUrl: uploadedUrl }
                            : category
                    )
                );
                message.success('Resim başarıyla yüklendi.');
            } else {
                message.error('Resim yüklenirken bir hata oluştu.');
            }
        }
    };

    // Tablo kolonları
    const columns: ColumnsType<CategoryDto> = [
        {
            title: 'Resim',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            render: (imageUrl: string | undefined, record) => (
                <Space>
                    {imageUrl ? (
                        <Image width={50} src={imageUrl} />
                    ) : (
                        <span>Resim Yok</span>
                    )}
                    <Upload
                        name="image"
                        action="/api/upload" // Backend yükleme endpoint
                        onChange={(info) => handleUpload(info, record)}
                        showUploadList={false}
                    >
                        <Button icon={<UploadOutlined />}>Yükle</Button>
                    </Upload>
                </Space>
            ),
        },
        {
            title: 'Adı',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Açıklama',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Sıralama',
            dataIndex: 'sortOrder',
            key: 'sortOrder',
        },
        {
            title: 'İşlemler',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record.id!)}
                    >
                        Düzenle
                    </Button>
                    <Popconfirm
                        title="Bu kategoriyi silmek istediğinize emin misiniz?"
                        onConfirm={() => handleDelete(record.id!)}
                        okText="Evet"
                        cancelText="Hayır"
                    >
                        <Button danger icon={<DeleteOutlined />}>
                            Sil
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <h1>Kategoriler</h1>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ marginBottom: '20px' }}
                onClick={handleAdd}
            >
                Kategori Ekle
            </Button>
            <Table
                columns={columns}
                dataSource={categories}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default CategoriesList;
