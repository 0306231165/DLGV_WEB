import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RequireAuth = ({ children }) => {
    const { isLoggedIn, loading } = useAuth();
    const location = useLocation();

    // Đang verify token → chờ, không redirect oan
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <span className="text-on-surface-variant text-sm">Đang tải...</span>
            </div>
        );
    }

    if (!isLoggedIn) {
        // Lưu lại trang định vào, sau login sẽ redirect về đúng chỗ
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default RequireAuth;