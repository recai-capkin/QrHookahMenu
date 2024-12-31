import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import config from '../../../config/config';

const { Option } = Select;

interface BaseCategory {
    id: number;
    name: string;
}

const EditCategory: React.FC<{ categoryId: number }> = ({ categoryId }) => {
    const [form] = Form.useForm();
    const [file, setFile] = useState<File | null>(null); // Yeni resim dosyası
    const [baseCategories, setBaseCategories] = useState<BaseCategory[]>([]); // Ana kategoriler
    const [loading, setLoading] = useState<boolean>(true);

    // Kategori bilgilerini ve üst kategorileri çekme
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Mevcut kategori bilgilerini al
                const token = localStorage.getItem('authToken'); 
                const categoryResponse = await fetch(`${config.apiBaseUrl}/Category/get-category-by-id/${categoryId}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const categoryData = await categoryResponse.json();

                

                // Ana kategorileri al
                const baseCategoriesResponse = await fetch(`${config.apiBaseUrl}/Category/base-categories`);
                const baseCategoriesData = await baseCategoriesResponse.json();
                setBaseCategories(baseCategoriesData);
                // Formu doldur
                form.setFieldsValue({
                    name: categoryData.name,
                    description: categoryData.description,
                    sortOrder: categoryData.sortOrder,
                    parentId: categoryData.parentId,
                });
            } catch (error) {
                message.error('Kategori bilgileri yüklenirken hata oluştu.');
                console.error('Hata:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [categoryId, form]);

    // Form gönderimi
    const handleSubmit = async (values: any) => {
        const formData = new FormData();
        formData.append('Name', values.name);
        formData.append('Description', values.description || '');
        formData.append('SortOrder', values.sortOrder || '0');
        formData.append('ParentId', values.parentId || ''); // Seçilen üst kategori
        if (file) {
            formData.append('file', file); // Yeni resmi ekle
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${config.apiBaseUrl}/Category/UpdateCategory/${categoryId}`, {
                method: 'PUT',
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                message.success('Kategori başarıyla güncellendi.');
            } else {
                const error = await response.json();
                message.error(`Hata: ${error.message || 'Kategori güncellenemedi.'}`);
            }
        } catch (error) {
            console.error('Hata:', error);
            message.error('Bir hata oluştu.');
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h1>Kategori Düzenle</h1>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ sortOrder: 0 }}
            >
                <Form.Item
                    label="Kategori Adı"
                    name="name"
                    rules={[{ required: true, message: 'Lütfen kategori adını giriniz.' }]}
                >
                    <Input placeholder="Kategori Adı" />
                </Form.Item>

                <Form.Item label="Açıklama" name="description">
                    <Input.TextArea rows={4} placeholder="Açıklama" />
                </Form.Item>

                <Form.Item label="Sıralama" name="sortOrder">
                    <Input type="number" placeholder="Sıralama" />
                </Form.Item>

                <Form.Item label="Üst Kategori" name="parentId">
                    <Select
                        placeholder="Üst Kategori Seçiniz (Opsiyonel)"
                        allowClear
                        showSearch
                        optionFilterProp="children"
                    >
                        {baseCategories.map((category) => (
                            <Option key={category.id} value={category.id}>
                                {category.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label="Kategori Resmi">
                    <Upload
                        beforeUpload={() => false} // Dosya yüklemeyi kontrol etmek için
                        onChange={(info) => {
                            // Eğer dosya silindiyse:
                            if (info.file.status === 'removed' || info.fileList.length === 0) {
                                setFile(null);
                                return;
                            }

                            // Dosya seçilmişse (ilk, tek dosya):
                            const uploadedFile = info.fileList[0].originFileObj;
                            setFile(uploadedFile);
                        }}
                        maxCount={1}
                        accept="image/*"
                    >
                        <Button icon={<UploadOutlined />}>Resim Yükle</Button>
                    </Upload>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Kategoriyi Güncelle
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default EditCategory;
