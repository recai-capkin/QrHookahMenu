import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute'; // ProtectedRoute'ı içe aktar
import Dashboard from '../pages/Admin/Dashboard';
import AddCategory from '../pages/Admin/Categories/AddCategory';
import EditCategory from '../pages/Admin/Categories/EditCategory';
import CategoriesList from '../pages/Admin/Categories/CategoriesList';
import AddProduct from '../pages/Admin/Products/AddProduct';
import EditProduct from '../pages/Admin/Products/EditProduct';
import ProductsList from '../pages/Admin/Products/ProductsList';
import NotFound from '../pages/NotFound';

const AdminRoutes = () => {
    // Oturum kontrolü için localStorage'dan token alınıyor
    const isAuthenticated = !!localStorage.getItem('authToken');

    return (
        <Routes>
            {/* ProtectedRoute ile sarılarak erişim kontrolü sağlanır */}
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/categories"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <CategoriesList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/categories/add"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <AddCategory />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/categories/edit/:id"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <EditCategory />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/products"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <ProductsList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/products/add"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <AddProduct />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/products/edit/:id"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <EditProduct />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AdminRoutes;
