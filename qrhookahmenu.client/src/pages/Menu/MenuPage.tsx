import React, { useState, useEffect } from 'react';
import { Card, List, Image, Row, Col, Button, Spin, message } from 'antd';
import config from '../../config/config';

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
                // Stack'e ekliyoruz
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

                // Stack'e ekliyoruz
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
                                style={{ width: 300 }}
                                onClick={() => fetchCategoryById(category.id)}
                                cover={
                                    <Image
                                        height={200}
                                        style={{ objectFit: 'cover' }}
                                        src={`${config.imageBaseUrl}/${category.imageUrl}`}
                                    />
                                }
                            >
                                <Card.Meta
                                    title={category.name}
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
                <Button type="link" onClick={handleBack} style={{ marginBottom: '20px' }}>
                    Geri
                </Button>
                {subLoading ? (
                    <Spin size="large" />
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
                                    style={{ width: 300 }}
                                    onClick={() => fetchCategoryById(subCategory.id)}
                                    cover={
                                        <Image
                                            height={200}
                                            style={{ objectFit: 'cover' }}
                                            src={`${config.imageBaseUrl}/${subCategory.imageUrl}`}
                                        />
                                    }
                                >
                                    <Card.Meta
                                        title={subCategory.name}
                                        description={subCategory.description}
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <List
                        itemLayout="horizontal"
                        dataSource={products}
                        renderItem={(product) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={
                                        <Image
                                            width={64}
                                            height={64}
                                            style={{ objectFit: 'cover' }}
                                            src={`${config.imageBaseUrl}/${product.imageUrl}`}
                                        />
                                    }
                                    title={product.name}
                                    description={`Fiyat: ${product.price} TL`}
                                />
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
            <h1 style={{ textAlign: 'center' }}>Menü</h1>
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
