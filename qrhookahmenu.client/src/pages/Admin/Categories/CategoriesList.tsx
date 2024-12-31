import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, message, Image, Drawer } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import config from '../../../config/config';
import AddCategory from './AddCategory'; // AddCategory bileşenini import edin
import EditCategory from './EditCategory'; // EditCategory bileşenini import edin

interface CategoryDto {
    id?: number;
    parentId?: number | null;
    parentName?: string | null; // Üst kategori adı
    name: string;
    description?: string;
    sortOrder?: number;
    imageUrl?: string; // URL alanı
}

const CategoriesList: React.FC = () => {
    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
    const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);

    // API'den kategorileri çekme
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('authToken'); 
                const response = await fetch(`${config.apiBaseUrl}/category/get-all-categories`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
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

    // Drawer işlemleri
    const showDrawer = (category?: CategoryDto) => {
        setEditingCategory(category || null);
        setIsEditMode(!!category);
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
        setEditingCategory(null);
        setIsEditMode(false);
    };

    // Silme işlemi
    const handleDelete = (id: number) => {
        setCategories((prev) => prev.filter((category) => category.id !== id));
        message.success('Kategori başarıyla silindi.');
    };

    // Tablo kolonları
    const columns: ColumnsType<CategoryDto> = [
        {
            title: 'Resim',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            render: (imageUrl: string | undefined) =>
                imageUrl ? <Image width={50} src={`${config.imageBaseUrl}/${imageUrl}`} /> : <span>Resim Yok</span>,
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
            title: 'Üst Kategori',
            dataIndex: 'parentName',
            key: 'parentName',
        },
        {
            title: 'İşlemler',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => showDrawer(record)}>
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
                onClick={() => showDrawer()}
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
            <Drawer
                title={isEditMode ? 'Kategori Güncelle' : 'Yeni Kategori Ekle'}
                width={500}
                onClose={closeDrawer}
                visible={drawerVisible}
                bodyStyle={{ padding: 20 }}
            >
                {isEditMode ? (
                    <EditCategory
                        categoryId={editingCategory?.id!}
                        category={editingCategory} // Güncelleme modu için kategoriyi iletin
                        onClose={closeDrawer} // Drawer'ı kapatma fonksiyonu
                        refreshCategories={() => {
                            // Kategorileri tekrar yüklemek için
                            setLoading(true);
                            fetch(`${config.apiBaseUrl}/category`)
                                .then((res) => res.json())
                                .then((data) => setCategories(data))
                                .catch((error) => console.error('Hata:', error))
                                .finally(() => setLoading(false));
                        }}
                    />
                ) : (
                    <AddCategory
                        onClose={closeDrawer} // Drawer'ı kapatma fonksiyonu
                        refreshCategories={() => {
                            // Kategorileri tekrar yüklemek için
                            setLoading(true);
                            fetch(`${config.apiBaseUrl}/category`)
                                .then((res) => res.json())
                                .then((data) => setCategories(data))
                                .catch((error) => console.error('Hata:', error))
                                .finally(() => setLoading(false));
                        }}
                    />
                )}
            </Drawer>
        </div>
    );
};

export default CategoriesList;
