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

    // ─── Đặt lịch ──────────────────────────────────────────────
    // POST /api/khach-hang/don-hang/dat-lich
    datLich: (data) => {
        return axiosClient.post('/khach-hang/don-hang/dat-lich', data);
    },

};

export default khachHangApi;