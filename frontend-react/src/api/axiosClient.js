import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

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

axiosClient.interceptors.response.use(
    (response) => response.data,

    (error) => {
        const status = error.response?.status;
        const currentUrl = error.config?.url || '';

        if (status === 401) {
            const isLoginApi =
                currentUrl.includes('login') ||
                currentUrl.includes('auth');

            const isLoginPage =
                window.location.pathname.includes('/login');

            if (isLoginApi || isLoginPage) {
                return Promise.reject(
                    error.response?.data || {
                        message: 'Đăng nhập thất bại',
                    }
                );
            }

            localStorage.removeItem('token');
            localStorage.removeItem('role');

            if (window.location.pathname.startsWith('/admin')) {
                window.location.href = '/admin/login';
            } else {
                window.location.href = '/login';
            }
        }

        if (status === 403) {
            window.location.href = '/';
        }

        return Promise.reject(
            error.response?.data || {
                message: 'Lỗi không xác định',
            }
        );
    }
);

export default axiosClient;