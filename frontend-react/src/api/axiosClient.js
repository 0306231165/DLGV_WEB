import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// =============================================
// REQUEST INTERCEPTOR: Gắn token vào Header
// =============================================
axiosClient.interceptors.request.use(
    (config) => {
        const isAdminApi = config.url && config.url.startsWith('/admin');
        const token = isAdminApi ? localStorage.getItem('ADMIN_TOKEN') : localStorage.getItem('token');
        
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// =============================================
// RESPONSE INTERCEPTOR: Lưới bắt lỗi tập trung
// =============================================
axiosClient.interceptors.response.use(
    (response) => response.data,

    (error) => {
        const status = error.response?.status;
        const currentUrl = error.config?.url || '';

        // XỬ LÝ LỖI 401: UNAUTHORIZED (Token hết hạn, sai hoặc bị xóa)
        if (status === 401) {
            const isLoginApi =
                currentUrl.includes('login') ||
                currentUrl.includes('auth') ||
                currentUrl.includes('dang-nhap') || 
                currentUrl.includes('dang-ky');

            const isLoginPage =
                window.location.pathname.includes('/login');

            if (isLoginApi || isLoginPage) {
                return Promise.reject(
                    error.response?.data || {
                        message: 'Đăng nhập thất bại',
                    }
                );
            }

            // Đá văng về trang Login dựa theo khu vực đang đứng
            if (window.location.pathname.startsWith('/admin')) {
                localStorage.removeItem('ADMIN_TOKEN');
                localStorage.removeItem('ADMIN_USER');
                window.location.href = '/admin/login';
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                window.location.href = '/login';
            }
            
            return Promise.reject({ message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
        }

        // XỬ LÝ LỖI 403: FORBIDDEN (Đăng nhập rồi nhưng không đủ quyền)
        if (status === 403) {
            window.location.href = '/'; // Đá về trang chủ
            return Promise.reject({ message: 'Bạn không có quyền truy cập.' });
        }

        // CÁC LỖI KHÁC (500, 422, 404...)
        return Promise.reject(
            error.response?.data || {
                message: 'Lỗi kết nối đến máy chủ.',
            }
        );
    }
);

export default axiosClient;