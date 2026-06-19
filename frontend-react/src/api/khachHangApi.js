// src/api/khachHangApi.js
import axiosClient from './axiosClient';

const khachHangApi = {

    // ─── Profile ───────────────────────────────────────────────
    // GET /api/khach-hang/profile
    getProfile: () => {
        return axiosClient.get('/khach-hang/profile');
    },

    // PUT /api/khach-hang/profile
    updateProfile: (data) => {
        return axiosClient.put('/khach-hang/profile', data);
    },

    // ─── Địa chỉ ───────────────────────────────────────────────
    // GET /api/khach-hang/dia-chi
    getAddresses: () => {
        return axiosClient.get('/khach-hang/dia-chi');
    },

    // POST /api/khach-hang/dia-chi/them
    addAddress: (data) => {
        return axiosClient.post('/khach-hang/dia-chi/them', data);
    },

    // PUT /api/khach-hang/dia-chi/{id}
    updateAddress: (id, data) => {
        return axiosClient.put(`/khach-hang/dia-chi/${id}`, data);
    },

    // DELETE /api/khach-hang/dia-chi/{id}
    deleteAddress: (id) => {
        return axiosClient.delete(`/khach-hang/dia-chi/${id}`);
    },

    // POST /api/khach-hang/dia-chi/{id}/mac-dinh
    setDefaultAddress: (id) => {
        return axiosClient.post(`/khach-hang/dia-chi/${id}/mac-dinh`);
    },

    // ─── Khuyến mãi ────────────────────────────────────────────
    // GET /api/khach-hang/khuyen-mai/cua-toi
    getMyVouchers: () => {
        return axiosClient.get('/khach-hang/khuyen-mai/cua-toi');
    },

    // POST /api/khach-hang/khuyen-mai/luu
    saveVoucher: (data) => {
        return axiosClient.post('/khach-hang/khuyen-mai/luu', data);
    },

    // ─── Thanh toán ────────────────────────────────────────────
    // GET /api/khach-hang/thanh-toan
    getPaymentMethods: () =>
        axiosClient.get('/khach-hang/thanh-toan'),

    // POST /api/khach-hang/thanh-toan/them-the
    addCard: (data) =>
        axiosClient.post('/khach-hang/thanh-toan/them-the', data),

    // DELETE /api/khach-hang/thanh-toan/{id}
    deletePaymentMethod: (id) =>
        axiosClient.delete(`/khach-hang/thanh-toan/${id}`),

    // POST /api/khach-hang/thanh-toan/momo/lien-ket
    linkMomo: (data) =>
        axiosClient.post('/khach-hang/thanh-toan/momo/lien-ket', data),

    // DELETE /api/khach-hang/thanh-toan/momo/huy
    unlinkMomo: () =>
        axiosClient.delete('/khach-hang/thanh-toan/momo/huy-lien-ket'),

    // ─── Ví tiền ──────────────────────────────────────────────
    // GET /api/khach-hang/vi-tien
    // Trả về: { so_du, giao_dich[] }
    getViTien: () => {
        return axiosClient.get('/khach-hang/vi-tien');
    },

    // POST /api/khach-hang/vi-tien/nap
    // Body: { so_tien, phuong_thuc_nap }
    napTien: (data) => {
        return axiosClient.post('/khach-hang/vi-tien/nap', data);
    },

    // POST /api/khach-hang/vi-tien/rut
    // Body (dùng ngân hàng đã lưu): { so_tien, ngan_hang_id }
    // Body (tự nhập):               { so_tien, ten_ngan_hang, so_tai_khoan, chu_tai_khoan }
    rutTien: (data) => {
        return axiosClient.post('/khach-hang/vi-tien/rut', data);
    },

    // GET /api/khach-hang/vi-tien/ngan-hang
    // Trả về danh sách ngân hàng đã lưu của user
    getNganHangDaLuu: () => {
        return axiosClient.get('/khach-hang/vi-tien/ngan-hang');
    },

    // ─── Liên hệ đã lưu ────────────────────────────────────────
    // GET /api/khach-hang/lien-he
    getContacts: () => axiosClient.get('/khach-hang/lien-he'),

    // POST /api/khach-hang/lien-he/them
    addContact: (data) => axiosClient.post('/khach-hang/lien-he/them', data),

    // DELETE /api/khach-hang/lien-he/{id}
    deleteContact: (id) => axiosClient.delete(`/khach-hang/lien-he/${id}`),

    // ─── Đặt lịch ──────────────────────────────────────────────
    // POST /api/khach-hang/don-hang/dat-lich
    datLich: (data) => {
        return axiosClient.post('/khach-hang/don-hang/dat-lich', data);
    },

};

export default khachHangApi;