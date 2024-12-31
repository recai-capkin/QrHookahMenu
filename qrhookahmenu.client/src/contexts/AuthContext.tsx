// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    loading: boolean;               // <-- Ekledik
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    token: null,
    loading: true,                 // <-- default true
    login: () => { },
    logout: () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); // <-- loading en başta true

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedExpiry = localStorage.getItem('authTokenExpiry');

        if (storedToken && storedExpiry) {
            const expiryTime = parseInt(storedExpiry, 10);
            const now = Date.now();

            if (now > expiryTime) {
                // 1) Token süresi dolmuş
                console.log('Token expired, removing from localStorage...');
                localStorage.removeItem('authToken');
                localStorage.removeItem('authTokenExpiry');
                setIsAuthenticated(false);
                setToken(null);
            } else {
                // 2) Token hâlâ geçerli
                setToken(storedToken);
                setIsAuthenticated(true);
            }
        }
        setLoading(false);
    }, []);
    // Otomatik süre takibi için 60 saniyede bir token süresi kontrol eden kod:
    useEffect(() => {
        const intervalId = setInterval(() => {
            const storedExpiry = localStorage.getItem('authTokenExpiry');
            if (storedExpiry) {
                const expiryTime = parseInt(storedExpiry, 10);
                const now = Date.now();

                if (now > expiryTime) {
                    console.log('Token süresi doldu, otomatik logout...');
                    logout();
                }
            }
        }, 60 * 1000); // 60 saniyede bir kontrol

        return () => clearInterval(intervalId);
    }, []);

    const login = (receivedToken: string) => {
        // Şu andan itibaren 1 saat sonrasının milisaniye cinsinden değeri
        const expiryTime = Date.now() + 60 * 60 * 1000; // 1 saat = 3600 saniye = 3600000 ms

        // localStorage’a token + expiryTime kaydediyoruz
        localStorage.setItem('authToken', receivedToken);
        localStorage.setItem('authTokenExpiry', expiryTime.toString());

        setToken(receivedToken);
        setIsAuthenticated(true);
    };

    const logout = () => {
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authTokenExpiry');
    };

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, token, login, logout, loading }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
