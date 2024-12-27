import React from 'react';
import AdminRoutes from './AdminRoutes';
import UserRoutes from './UserRoutes';

const Routes = () => {
    return (
        <>
            <UserRoutes />
            <AdminRoutes />
        </>
    );
};

export default Routes;
