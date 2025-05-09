import { Navigate, useLocation, Outlet } from 'react-router-dom'; 

const ProtectedRoute = () => { 
    const location = useLocation();
    const isAuthenticated = localStorage.getItem('user_data') !== null;

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <Outlet />; 
};

export default ProtectedRoute;