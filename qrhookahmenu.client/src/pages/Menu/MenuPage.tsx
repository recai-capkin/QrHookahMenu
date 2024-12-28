import React, { useState, useEffect } from 'react';
import { Card, List, Image, Row, Col, Button, Spin, message, Space } from 'antd';
import config from '../../config/config';
import { LeftOutlined, InstagramOutlined, EnvironmentOutlined, CopyOutlined, WifiOutlined } from '@ant-design/icons';
interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    isAvailable: boolean;
    categoryId: number;
}

interface Category {
    id: number;
    parentId: number | null;
    name: string;
    description: string;
    sortOrder: number;
    imageUrl: string;
    subCategories: Category[];
    products: Product[];
}

/** Stack'te tutmak istediğimiz veri yapısı */
interface CategoryStackItem {
    categoryId: number;
    subCategories: Category[];
    products: Product[];
}

const MenuPage: React.FC = () => {
    // İlk açılışta ana kategoriler için ayrı state
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Kategoriler arası gezinmeyi yönetmek için stack
    const [categoryStack, setCategoryStack] = useState<CategoryStackItem[]>([]);

    // Şu an ekranda gösterilecek alt kategoriler ve ürünler
    const [subCategories, setSubCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [subLoading, setSubLoading] = useState<boolean>(false);

    // Tüm kategorileri (ana kategoriler) yükleme
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${config.apiBaseUrl}/Category/all-categories`);
                const data: Category[] = await response.json();
                setCategories(data);
            } catch (error) {
                console.error('Kategoriler yüklenirken hata oluştu:', error);
                message.error('Kategoriler yüklenirken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Belirli bir kategori ID'sine göre alt kategorileri veya ürünleri getir
    const fetchCategoryById = async (categoryId: number) => {
        setSubLoading(true);
        try {
            // 1) Alt kategorileri getir
            const response = await fetch(
                `${config.apiBaseUrl}/Category/get-by-id-categories?categoryId=${categoryId}`
            );
            const data: Category[] = await response.json();

            // 2) Eğer alt kategori geliyorsa data.length > 0 => alt kategoriler
            if (data.length > 0) {
                setCategoryStack((prevStack) => [
                    ...prevStack,
                    {
                        categoryId,
                        subCategories: data,
                        products: [],
                    },
                ]);
                // Ekranda gösterilecek veriler
                setSubCategories(data);
                setProducts([]);
            } else {
                // 3) Alt kategori yoksa => ürünleri getir
                const productsResponse = await fetch(
                    `${config.apiBaseUrl}/Category/get-by-category-id-products?categoryId=${categoryId}`
                );
                const productsData: Product[] = await productsResponse.json();

                setCategoryStack((prevStack) => [
                    ...prevStack,
                    {
                        categoryId,
                        subCategories: [],
                        products: productsData,
                    },
                ]);
                // Ekranda gösterilecek veriler
                setSubCategories([]);
                setProducts(productsData);
            }
        } catch (error) {
            console.error('Alt kategoriler veya ürünler yüklenirken hata oluştu:', error);
            message.error('Alt kategoriler veya ürünler yüklenirken bir hata oluştu.');
        } finally {
            setSubLoading(false);
        }
    };

    // Geri düğmesine basıldığında bir önceki kategoriye dön (stack'ten pop)
    const handleBack = () => {
        if (categoryStack.length > 1) {
            // Stack'in son elemanını çıkar
            const newStack = [...categoryStack];
            newStack.pop();
            // Yeni son eleman bir önceki kategori durumu
            const { subCategories, products } = newStack[newStack.length - 1];
            setCategoryStack(newStack);

            // Ekrana o alt kategori / ürün listesini koy
            setSubCategories(subCategories);
            setProducts(products);
        } else {
            // Stack'te 1 veya hiç eleman yoksa => Ana kategoriye dön
            setCategoryStack([]);
            setSubCategories([]);
            setProducts([]);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Spin size="large" />
            </div>
        );
    }

    // Kategori veya alt kategori içeriğini render eden fonksiyon
    const renderContent = () => {
        // Stack boşsa => Ana kategorileri göster
        if (categoryStack.length === 0) {
            return (
                <Row gutter={[16, 16]} justify="center">
                    {categories.map((category) => (
                        <Col
                            xs={24}
                            sm={12}
                            md={8}
                            lg={6}
                            style={{ display: 'flex', justifyContent: 'center' }}
                            key={category.id}
                        >
                            <Card
                                hoverable
                                style={{
                                    width: 300,
                                    borderRadius: 8,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                }}
                                onClick={() => fetchCategoryById(category.id)}
                                cover={
                                    <Image
                                        height={200}
                                        style={{ objectFit: 'cover', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
                                        src={`${config.imageBaseUrl}/${category.imageUrl}`}
                                        preview={false} // Preview'u kapattık
                                    />
                                }
                            >
                                <Card.Meta
                                    title={<span style={{ fontWeight: 600 }}>{category.name}</span>}
                                    description={category.description}
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            );
        }

        // Stack boş değilse => Geri butonu + alt kategori veya ürün listesi
        return (
            <>
                
               
                <div
                    style={{
                        marginBottom: '20px',
                        display: 'flex', // Flexbox kullanıyoruz
                        justifyContent: 'flex-end', // Sağ tarafa hizalama
                    }}
                >
                    <Button
                        icon={<LeftOutlined />}
                        onClick={handleBack}
                        variant="solid"
                        style={{
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Hafif gölge
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            background: 'linear-gradient(135deg, #d3d3d3, #a9a9a9)', // Gradient gri arka plan
                            color: '#000', // Yazı rengi
                        }}
                        className="custom-button"
                    >
                        Geri
                    </Button>
                </div>


                {subLoading ? (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <Spin size="large" />
                    </div>
                ) : subCategories.length > 0 ? (
                    <Row gutter={[16, 16]} justify="center">
                        {subCategories.map((subCategory) => (
                            <Col
                                xs={24}
                                sm={12}
                                md={8}
                                lg={6}
                                style={{ display: 'flex', justifyContent: 'center' }}
                                key={subCategory.id}
                            >
                                <Card
                                    hoverable
                                    style={{
                                        width: 300,
                                        borderRadius: 8,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    }}
                                    onClick={() => fetchCategoryById(subCategory.id)}
                                    cover={
                                        <Image
                                            height={200}
                                            style={{
                                                objectFit: 'cover',
                                                borderTopLeftRadius: 8,
                                                borderTopRightRadius: 8,
                                            }}
                                            src={`${config.imageBaseUrl}/${subCategory.imageUrl}`}
                                            preview={false} // Preview'u kapattık
                                        />
                                    }
                                >
                                    <Card.Meta
                                        title={<span style={{ fontWeight: 600 }}>{subCategory.name}</span>}
                                        description={subCategory.description}
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    // Ürünleri "grid" formatında listeliyoruz
                    <List
                        grid={{
                            gutter: 16,
                            xs: 1,
                            sm: 2,
                            md: 3,
                            lg: 4,
                            xl: 4,
                        }}
                        dataSource={products}
                        renderItem={(product) => (
                            <List.Item key={product.id}>
                                <Card
                                    hoverable
                                    style={{
                                        borderRadius: 8,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    }}
                                    cover={
                                        <Image
                                            height={200}
                                            style={{
                                                objectFit: 'cover',
                                                borderTopLeftRadius: 8,
                                                borderTopRightRadius: 8,
                                            }}
                                            src={`${config.imageBaseUrl}/${product.imageUrl}`}
                                            preview={false} // Preview'u kapattık
                                        />
                                    }
                                >
                                    <Card.Meta
                                        title={<span style={{ fontWeight: 600 }}>{product.name}</span>}
                                        description={
                                            <div style={{ marginTop: 5 }}>
                                                <span style={{ color: '#444' }}>{product.description}</span>
                                                <br />
                                                <span style={{ fontWeight: 500, color: '#000' }}>
                                                    {product.price} TL
                                                </span>
                                            </div>
                                        }
                                    />
                                </Card>
                            </List.Item>
                        )}
                    />
                )}
            </>
        );
    };

    return (
        <div
            style={{
                padding: '20px',
                maxWidth: '1200px',
                margin: '0 auto',
            }}
        >
            {/* Üst Bilgi */}
            <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
                <Col>
                    <Space>
                        <EnvironmentOutlined style={{ fontSize: '16px', color: '#fff' }} />
                        <a
                            href="https://www.google.com/maps?q=your+business+address"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                fontSize: '14px',
                                color: '#fff',
                                textDecoration: 'none',
                            }}
                        >
                            İstanbul/Sefaköy
                        </a>
                    </Space>
                </Col>
                <Col>
                    <Space>
                        <InstagramOutlined style={{ fontSize: '16px', color: '#fff' }} />
                        <a
                            href="https://www.instagram.com/your_instagram_page"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                fontSize: '14px',
                                color: '#fff',
                                textDecoration: 'none',
                            }}
                        >
                            Hookah Specials
                        </a>
                    </Space>
                </Col>
            </Row>


            <h1 style={{ textAlign: 'center' }}>Hookah Specials Menü</h1>

            {/* Menü Altında Wi-Fi Şifre Alanı */}
            <Row justify="start" align="middle" style={{ marginTop: '20px', padding: '10px 10px 10px 0px' }}>
                <Col>
                    <Space>
                        <span
                            style={{
                                fontSize: '14px',
                                color: '#fff',
                                backgroundColor: '#333',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <WifiOutlined style={{ marginRight: '8px', fontSize: '18px', color: '#fff' }} />
                            <strong>wifiparola</strong>
                        </span>
                        <Button
                            icon={<CopyOutlined style={{ color: '#fff' }} />}
                            style={{
                                backgroundColor: '#333',
                                border: 'none',
                                color: '#fff',
                                borderRadius: '5px',
                                padding: '5px',
                            }}
                            onClick={() => {
                                navigator.clipboard.writeText('wifiparola');
                                message.success('Wi-Fi şifresi kopyalandı!');
                            }}
                        />
                    </Space>
                </Col>
            </Row>



            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Spin size="large" />
                </div>
            ) : (
                renderContent()
            )}
        </div>
    );
};

export default MenuPage;
