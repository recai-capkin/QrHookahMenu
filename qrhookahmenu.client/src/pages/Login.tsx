import React, { useState } from 'react';
import { Input, Button, Form, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import config from '../config/config';
import { useAuth } from '../contexts/AuthContext'; // <-- import AuthContext hook

const { Title } = Typography;

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // AuthContext'i kullan (login, isAuthenticated vs. elinde)
    const { login } = useAuth();

    const handleLogin = async () => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                // Eskiden: localStorage.setItem('authToken', data.token);
                // Şimdi: Context içindeki login fonksiyonunu çağırıyoruz:
                login(data.token);

                message.success('Başarıyla giriş yaptınız!');
                navigate('/admin/dashboard');
            } else {
                message.error('Giriş başarısız! Kullanıcı adı veya şifre hatalı!');
            }
        } catch (error) {
            message.error('Bir hata oluştu, lütfen tekrar deneyin! ' + error);
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#f5f5f5',
            }}
        >
            <div
                style={{
                    width: 300,
                    padding: '24px',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
            >
                <Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>
                    Giriş Yap
                </Title>
                <Form layout="vertical" onFinish={handleLogin}>
                    <Form.Item
                        label="Kullanıcı Adı"
                        name="username"
                        rules={[{ required: true, message: 'Lütfen kullanıcı adınızı giriniz!' }]}
                    >
                        <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Kullanıcı Adı"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Şifre"
                        name="password"
                        rules={[{ required: true, message: 'Lütfen şifrenizi giriniz!' }]}
                    >
                        <Input.Password
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Şifre"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Giriş Yap
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default Login;
