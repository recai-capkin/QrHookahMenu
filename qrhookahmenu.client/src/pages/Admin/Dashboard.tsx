import React, { useState } from 'react';
import {
    Layout,
    Menu,
    Button,
    Tabs
} from 'antd';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    AppstoreOutlined,
    FolderOpenOutlined
} from '@ant-design/icons';

// Mevcut sayfalarınızı import edin
import CategoriesList from '../Admin/Categories/CategoriesList';
import ProductsList from '../Admin/Products/ProductsList';

const { Header, Sider, Content } = Layout;

const Dashboard: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* SOLDAKİ SİDER */}
            <Sider collapsible collapsed={collapsed} onCollapse={toggleCollapsed}>
                {/* Logo veya benzeri alan (isterseniz kaldırabilirsiniz) */}
                <div
                    style={{
                        height: 32,
                        margin: 16,
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: 4,
                    }}
                />
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    style={{ height: '100%' }}
                >
                    <Menu.Item key="1" icon={<AppstoreOutlined />}>
                        Dashboard
                    </Menu.Item>
                    <Menu.Item key="2" icon={<FolderOpenOutlined />}>
                        Kategoriler
                    </Menu.Item>
                    <Menu.Item key="3" icon={<FolderOpenOutlined />}>
                        Ürünler
                    </Menu.Item>
                    {/* Gerekirse ek menü item'ları */}
                </Menu>
            </Sider>

            {/* SAĞDAKİ LAYOUT (HEADER + CONTENT) */}
            <Layout>
                <Header
                    style={{
                        background: '#fff',
                        padding: '0 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    {/* Menü aç/kapa butonu */}
                    <Button
                        type="text"
                        onClick={toggleCollapsed}
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        style={{ fontSize: '16px', width: 64, height: 64 }}
                    />
                    <h2 style={{ margin: 0 }}>Admin Panel</h2>
                </Header>

                <Content style={{ margin: '16px', background: '#fff' }}>
                    <Tabs defaultActiveKey="1" style={{ padding: 16 }}>
                        <Tabs.TabPane tab="Kategoriler" key="1">
                            <CategoriesList />
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Ürünler" key="2">
                            <ProductsList />
                        </Tabs.TabPane>
                        {/* İsterseniz başka TabPane ekleyebilirsiniz */}
                    </Tabs>
                </Content>
            </Layout>
        </Layout>
    );
};

export default Dashboard;
