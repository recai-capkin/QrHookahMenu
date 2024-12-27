import React, { useState } from 'react';

const Login = () => {
    const [username, setUsername] = useState(''); // Kullanıcı adı
    const [password, setPassword] = useState(''); // Şifre

    const handleLogin = async () => {
        // Örnek API çağrısı
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }), // Kullanıcı adı ve şifre gönderiliyor
        });

        if (response.ok) {
            const data = await response.json();
            // Token'ı localStorage'a kaydet
            localStorage.setItem('authToken', data.token);
            // Admin paneline yönlendir
            window.location.href = '/admin';
        } else {
            alert('Giriş başarısız! Kullanıcı adı veya şifre hatalı!');
        }
    };

    return (
        <div>
            <h1>Giriş Yap</h1>
            <input
                type="text"
                placeholder="Kullanıcı Adı" // Kullanıcı adı inputu
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Giriş Yap</button>
        </div>
    );
};

export default Login;
