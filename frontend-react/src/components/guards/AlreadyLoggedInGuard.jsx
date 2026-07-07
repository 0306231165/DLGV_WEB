import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Trang chủ tương ứng với từng role — dùng khi 1 tài khoản đã login
// nhưng cố vào trang login/register, sẽ bị đá về đúng "nhà" của mình.
const HOME_BY_ROLE = {
    "khach-hang": "/",
    "nhan-vien": "/partner/dashboard",
    "admin": "/admin/dashboard",
};

// Component NGƯỢC với RequireAuth: dùng để bọc các trang login/register.
// Nếu đã đăng nhập rồi mà cố vào lại trang login/register → đá về đúng trang họ định vào (hoặc nhà của role đó).
// Nếu chưa đăng nhập → cho qua bình thường (hiển thị form login/register).
const AlreadyLoggedInGuard = ({ children }) => {
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

    if (isLoggedIn) {
        const fromLocation = location.state?.from;
        if (fromLocation) {
            const targetPath = typeof fromLocation === "object" ? `${fromLocation.pathname || ""}${fromLocation.search || ""}${fromLocation.hash || ""}` : fromLocation;
            const targetState = typeof fromLocation === "object" ? fromLocation.state : null;
            return <Navigate to={targetPath || (HOME_BY_ROLE[role] || "/")} state={targetState} replace />;
        }
        const home = HOME_BY_ROLE[role] || "/";
        return <Navigate to={home} replace />;
    }

    return children;
};

export default AlreadyLoggedInGuard;