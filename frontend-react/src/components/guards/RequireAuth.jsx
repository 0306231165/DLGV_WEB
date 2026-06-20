import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Trang chủ tương ứng với từng role — dùng khi 1 tài khoản đã login
// nhưng cố vào sai khu vực, sẽ bị đá về đúng "nhà" của mình.
const HOME_BY_ROLE = {
    "khach-hang": "/",
    "nhan-vien": "/partner/dashboard",
    "admin": "/admin/dashboard",
};

const RequireAuth = ({ children, allowedRoles, redirectTo = "/login" }) => {
    const { isLoggedIn, role, loading } = useAuth();
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
        // Chưa đăng nhập → lưu lại trang định vào, đẩy sang trang login của khu vực này
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Đã login nhưng sai role (ví dụ khách hàng cố vào khu vực nhân viên)
    // → không đá về login (họ đâu cần login lại), mà đá thẳng về "nhà" đúng role của họ
    if (allowedRoles && !allowedRoles.includes(role)) {
        const home = HOME_BY_ROLE[role] || "/";
        alert("Bạn không có quyền truy cập trang này.");
        return <Navigate to={home} replace />;
    }

    return children;
};

export default RequireAuth;