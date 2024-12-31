import React from 'react';
import { Route, Routes } from 'react-router-dom';
import MenuPage from '../pages/Menu/MenuPage';
import Login from '../pages/Login';
import ProtectedRoute from '../components/ProtectedRoute';
import Dashboard from '../pages/Admin/Dashboard';
import AddCategory from '../pages/Admin/Categories/AddCategory';
import EditCategory from '../pages/Admin/Categories/EditCategory';
import CategoriesList from '../pages/Admin/Categories/CategoriesList';
import AddProduct from '../pages/Admin/Products/AddProduct';
import EditProduct from '../pages/Admin/Products/EditProduct';
import ProductsList from '../pages/Admin/Products/ProductsList';



const AppRoutes = () => {
    
    return (
        <>
            <Routes>
                <Route path="/" element={<MenuPage />} />
                <Route path="/login" element={<Login />} />
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/categories"
                    element={
                        <ProtectedRoute>
                            <CategoriesList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/categories/add"
                    element={
                        <ProtectedRoute>
                            <AddCategory />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/categories/edit/:id"
                    element={
                        <ProtectedRoute>
                            <EditCategory />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/products"
                    element={
                        <ProtectedRoute>
                            <ProductsList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/products/add"
                    element={
                        <ProtectedRoute>
                            <AddProduct />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/products/edit/:id"
                    element={
                        <ProtectedRoute>
                            <EditProduct />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    );
};

export default AppRoutes;
