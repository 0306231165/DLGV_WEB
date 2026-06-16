// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// =============================================
// REQUEST INTERCEPTOR
// Tự động gắn token vào Header trước mỗi request
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
// RESPONSE INTERCEPTOR
// Xử lý lỗi tập trung — không cần try/catch ở từng chỗ
// =============================================
axiosClient.interceptors.response.use(
    // Thành công → trả thẳng data, bỏ qua lớp bọc axios
    (response) => response.data,

    (error) => {
        const status = error.response?.status;
        const currentUrl = error.config?.url || '';

        if (status === 401) {
        // 1. Kiểm tra xem request API có phải thuộc nhóm Authentication không
        // (Thêm các từ khóa API của bạn vào đây nếu cần, ví dụ: 'auth', 'signin')
        const isLoginApi = currentUrl.includes('login') || currentUrl.includes('auth');
        
        // 2. Kiểm tra xem user có đang đứng ở bất kỳ trang đăng nhập nào không
        // Dùng .includes thay vì === để bắt được cả '/admin/login', '/staff/login'...
        const isLoginPage = window.location.pathname.includes('/login');

        // CHỐT CHẶN TỔNG HỢP: Dành cho Khách, Nhân viên, Admin
        if (isLoginApi || isLoginPage) {
            return Promise.reject(error.response?.data || { message: 'Đăng nhập thất bại' });
        }

        // Các trường hợp 401 khác (hết hạn token khi đang xài app)
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        
        // Nếu muốn xịn hơn: Đang ở /admin/... mà văng thì đá về /admin/login
        if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin/login';
        } else {
            window.location.href = '/login';
        }
    }

        if (status === 403) {
            // Đăng nhập rồi nhưng không có quyền
            window.location.href = '/';
        }

        // Ném lỗi ra để component xử lý message cụ thể
        return Promise.reject(error.response?.data || { message: 'Lỗi không xác định' });
    }
);

export default axiosClient;