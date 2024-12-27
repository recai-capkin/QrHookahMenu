import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Option } = Select;

interface BaseCategory {
    id: number;
    name: string;
}

const AddCategory: React.FC = () => {
    const [form] = Form.useForm();
    const [file, setFile] = useState<File | null>(null); // Yüklenecek dosya
    const [baseCategories, setBaseCategories] = useState<BaseCategory[]>([]); // Ana kategoriler

    // Ana kategorileri çekme
    useEffect(() => {
        const fetchBaseCategories = async () => {
            try {
                const response = await fetch('/api/categories/base');
                const data = await response.json();
                setBaseCategories(data);
            } catch (error) {
                message.error('Ana kategoriler yüklenirken hata oluştu.');
                console.error('Hata:', error);
            }
        };

        fetchBaseCategories();
    }, []);

    // Resim değişikliği
    const handleFileChange = ({ file }: any) => {
        setFile(file.originFileObj); // Dosyayı state'e kaydet
    };

    // Form gönderimi
    const handleSubmit = async (values: any) => {
        const formData = new FormData();
        formData.append('Name', values.name);
        formData.append('Description', values.description || '');
        formData.append('SortOrder', values.sortOrder || '0');
        formData.append('ParentId', values.parentId || ''); // Seçilen üst kategori
        if (file) {
            formData.append('file', file); // Resmi ekle
        }

        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                message.success('Kategori başarıyla eklendi.');
                form.resetFields();
                setFile(null);
            } else {
                const error = await response.json();
                message.error(`Hata: ${error.message || 'Kategori eklenemedi.'}`);
            }
        } catch (error) {
            console.error('Hata:', error);
            message.error('Bir hata oluştu.');
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h1>Kategori Ekle</h1>
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
                        onChange={handleFileChange}
                        maxCount={1}
                        accept="image/*"
                    >
                        <Button icon={<UploadOutlined />}>Resim Yükle</Button>
                    </Upload>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Kategori Ekle
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default AddCategory;
