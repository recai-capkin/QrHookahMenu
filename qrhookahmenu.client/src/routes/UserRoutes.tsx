import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MenuPage from '../pages/Menu/MenuPage';
import Login from '../pages/Login'

const UserRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<MenuPage />} />           
            <Route path="/Login" element={<Login />} />
        </Routes>
    );
};

export default UserRoutes;
