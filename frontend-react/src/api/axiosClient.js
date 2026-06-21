import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8000/api',
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
        const token = localStorage.getItem('token');
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
// src/api/axiosClient.js — RESPONSE INTERCEPTOR
axiosClient.interceptors.response.use(
    (response) => response.data,

    (error) => {
        // Lỗi network hoàn toàn (server offline, timeout) — KHÔNG có response
        if (!error.response) {
            // ✅ Reject với flag rõ ràng, KHÔNG xóa token
            return Promise.reject({ 
                message: 'Lỗi kết nối đến máy chủ.',
                isNetworkError: true,  // 👈 flag này
            });
        }

        const status = error.response.status;
        const currentUrl = error.config?.url || '';

        if (status === 401) {
            const isAuthApi = currentUrl.includes('/dang-nhap') || currentUrl.includes('/dang-ky');
            if (isAuthApi) {
                return Promise.reject(error.response?.data || { message: 'Đăng nhập thất bại' });
            }

            localStorage.removeItem('token');
            localStorage.removeItem('role');

            const currentPath = window.location.pathname;
            if (currentPath.startsWith('/admin')) {
                window.location.href = '/admin/login';
            } else {
                window.location.href = '/login'; 
            }

            return Promise.reject({ message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
        }

        if (status === 403) {
            // window.location.href = '/';
            return Promise.reject({ message: 'Bạn không có quyền truy cập.' });
        }

        return Promise.reject(error.response?.data || { message: 'Lỗi kết nối đến máy chủ.' });
    }
);

export default axiosClient;