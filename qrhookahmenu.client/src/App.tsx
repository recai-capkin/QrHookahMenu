import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/index';
import { AuthProvider } from './contexts/AuthContext';

const App = () => {
    return (
        <AuthProvider>
        <BrowserRouter>
            <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;
