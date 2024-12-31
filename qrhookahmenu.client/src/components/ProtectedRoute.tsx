// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    // 1) Eğer loading hala true ise, henüz localStorage kontrolünü tamamlamadık.
    //   Boş bir div, Spinner vs. gösterebiliriz.
    if (loading) {
        return <div>Yükleniyor...</div>;
        // veya <Spin /> ya da null dönebilirsiniz
    }

    // 2) Loading bitti, şimdi isAuthenticated'e bakıyoruz
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 3) Artık kullanıcı giriş yapmış
    return <>{children}</>;
};

export default ProtectedRoute;
