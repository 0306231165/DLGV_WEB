// src/api/nhanVienApi.js
import axiosClient from './axiosClient';

const nhanVienApi = {
    // GET /api/nhan-vien/noi-bat
    getFeaturedStaff: () => {
        return axiosClient.get('/nhan-vien/noi-bat');
    },

    // GET /api/nhan-vien/{id}
    getStaffDetail: (id) => {
        return axiosClient.get(`/nhan-vien/${id}`);
    },

    // GET /api/nhan-vien/dashboard
    getDashboard: () => {
        return axiosClient.get('/nhan-vien/dashboard');
    },

    // GET /api/nhan-vien/wallet
    getWallet: () => {
        return axiosClient.get('/nhan-vien/wallet');
    },

    // ─── Yêu thích (cần auth: khách hàng) ────────────────────────────────────
 
    // GET /api/khach-hang/nhan-vien-yeu-thich
    // Trả về: { success, data: NhanVien[] }
    getYeuThich: () => {
        return axiosClient.get('/khach-hang/nhan-vien-yeu-thich');
    },
 
    // POST /api/khach-hang/nhan-vien-yeu-thich/{nhanVienId}
    // Thêm NV vào yêu thích, idempotent (gọi nhiều lần cũng không lỗi)
    themYeuThich: (nhanVienId) => {
        return axiosClient.post(`/khach-hang/nhan-vien-yeu-thich/${nhanVienId}`);
    },
 
    // DELETE /api/khach-hang/nhan-vien-yeu-thich/{nhanVienId}
    xoaYeuThich: (nhanVienId) => {
        return axiosClient.delete(`/khach-hang/nhan-vien-yeu-thich/${nhanVienId}`);
    },
 
    // GET /api/khach-hang/nhan-vien-da-lam
    // Trả về: { success, data: NhanVien[] } — distinct, có field is_saved
    getNhanVienDaLam: () => {
        return axiosClient.get('/khach-hang/nhan-vien-da-lam');
    },
};

export default nhanVienApi;