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
axiosClient.interceptors.response.use(
    (response) => response.data,

    (error) => {
        const status = error.response?.status;
        const currentUrl = error.config?.url || '';

        // XỬ LÝ LỖI 401: UNAUTHORIZED (Token hết hạn, sai hoặc bị xóa)
        if (status === 401) {
            // 1. Nếu đang gọi API đăng nhập/đăng ký thì BỎ QUA không đá văng
            // (Để component tự nhận lỗi và hiện chữ "Sai mật khẩu")
            const isAuthApi = currentUrl.includes('/dang-nhap') || currentUrl.includes('/dang-ky');
            if (isAuthApi) {
                return Promise.reject(error.response?.data || { message: 'Đăng nhập thất bại' });
            }

            // 2. CÁC TRƯỜNG HỢP CÒN LẠI: Token đã chết -> Dọn rác
            localStorage.removeItem('token');
            localStorage.removeItem('role');

            // 3. Đá văng về trang Login dựa theo khu vực đang đứng
            const currentPath = window.location.pathname;
            if (currentPath.startsWith('/admin')) {
                window.location.href = '/admin/login';
            } else {
                window.location.href = '/login'; 
            }

            // Ngăn chặn các luồng xử lý tiếp theo
            return Promise.reject({ message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
        }

        // XỬ LÝ LỖI 403: FORBIDDEN (Đăng nhập rồi nhưng không đủ quyền)
        if (status === 403) {
            window.location.href = '/'; // Đá về trang chủ
            return Promise.reject({ message: 'Bạn không có quyền truy cập.' });
        }

        // CÁC LỖI KHÁC (500, 422, 404...)
        return Promise.reject(error.response?.data || { message: 'Lỗi kết nối đến máy chủ.' });
    }
);

export default axiosClient;