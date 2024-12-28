import React from 'react';
import AdminRoutes from './AdminRoutes';
import UserRoutes from './UserRoutes';

const AppRoutes = () => {
    return (
        <>
            <UserRoutes />
            <AdminRoutes />
        </>
    );
};

export default AppRoutes;
