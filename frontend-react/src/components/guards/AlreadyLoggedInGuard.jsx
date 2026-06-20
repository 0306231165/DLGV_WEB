import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Trang chủ tương ứng với từng role — dùng khi 1 tài khoản đã login
// nhưng cố vào trang login/register, sẽ bị đá về đúng "nhà" của mình.
const HOME_BY_ROLE = {
    "khach-hang": "/",
    "nhan-vien": "/partner/dashboard",
    "admin": "/admin/dashboard",
};

// Component NGƯỢC với RequireAuth: dùng để bọc các trang login/register.
// Nếu đã đăng nhập rồi mà cố vào lại trang login/register → đá về đúng nhà của role đó.
// Nếu chưa đăng nhập → cho qua bình thường (hiển thị form login/register).
const AlreadyLoggedInGuard = ({ children }) => {
    const { isLoggedIn, role, loading } = useAuth();

    // Đang verify token → chờ, không redirect oan
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <span className="text-on-surface-variant text-sm">Đang tải...</span>
            </div>
        );
    }

    if (isLoggedIn) {
        const home = HOME_BY_ROLE[role] || "/";
        return <Navigate to={home} replace />;
    }

    return children;
};

export default AlreadyLoggedInGuard;