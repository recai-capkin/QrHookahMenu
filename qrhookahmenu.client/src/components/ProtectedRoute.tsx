import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    isAuthenticated: boolean; // Kullanıcı giriş yapmış mı
    children: React.ReactNode; // Korunan içeriği sarmalayacak
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated, children }) => {
    if (!isAuthenticated) {
        // Kullanıcı yetkili değilse giriş sayfasına yönlendir
        return <Navigate to="/login" replace />;
    }

    // Kullanıcı yetkiliyse içeriği göster
    return <>{children}</>;
};

export default ProtectedRoute;
