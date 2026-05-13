import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const GuestGuard = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (user) {
        const rolePath = user.role.toLowerCase();
        return <Navigate to={`/${rolePath}`} replace />;
    }

    return <Outlet />;

    };