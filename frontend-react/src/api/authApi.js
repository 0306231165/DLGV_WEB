// src/api/authApi.js
import axiosClient from './axiosClient';

const authApi = {

    // POST /api/khach-hang/dang-ky
    registerKhachHang: (data) => {
        return axiosClient.post('/khach-hang/dang-ky', data);
        // data: { so_dien_thoai, mat_khau, mat_khau_confirmation, ho_ten, email? }
    },

    // POST /api/khach-hang/dang-nhap
    loginKhachHang: (data) => {
        return axiosClient.post('/khach-hang/dang-nhap', data);
        // data: { so_dien_thoai, mat_khau }
    },

    // POST /api/nhan-vien/dang-nhap
    loginNhanVien: (data) => {
        return axiosClient.post('/nhan-vien/dang-nhap', data);
    },

    // POST /api/admin/dang-nhap
    loginAdmin: (data) => {
        return axiosClient.post('/admin/dang-nhap', data);
        // data: { ten_dang_nhap, mat_khau }
    },

    // GET /api/me — verify token còn sống không
    getMe: () => {
        return axiosClient.get('/me');
    },

    // POST /api/dang-xuat
    logout: () => {
        return axiosClient.post('/dang-xuat');
    },
};

export default authApi;