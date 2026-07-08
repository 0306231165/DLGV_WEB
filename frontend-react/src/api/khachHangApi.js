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

    // PUT /api/khach-hang/lien-he/{id}
    updateContact: (id, data) => axiosClient.put(`/khach-hang/lien-he/${id}`, data),

    // DELETE /api/khach-hang/lien-he/{id}
    deleteContact: (id) => axiosClient.delete(`/khach-hang/lien-he/${id}`),

    // ─── Đặt lịch ─────────────────────────────────────────────────────────────
    // POST /api/khach-hang/dat-lich
    datLich: (data) =>
        axiosClient.post('/khach-hang/dat-lich', data),

    // GET /api/khach-hang/don-hang
    getMyBookings: () =>
        axiosClient.get('/khach-hang/don-hang'),

    // GET /api/khach-hang/don-hang/{id}
    getBookingDetail: (id) =>
        axiosClient.get(`/khach-hang/don-hang/${id}`),

    // POST /api/khach-hang/don-hang/ca-lam/{id}/doi-lich
    rescheduleSession: (caLamViecId, payload) =>
        axiosClient.post(`/khach-hang/don-hang/ca-lam/${caLamViecId}/doi-lich`, payload),

    // POST /api/khach-hang/don-hang/ca-lam/{id}/huy
    cancelSession: (caLamViecId) =>
        axiosClient.post(`/khach-hang/don-hang/ca-lam/${caLamViecId}/huy`),
    cancelOrder: (donHangId) =>
        axiosClient.post(`/khach-hang/don-hang/${donHangId}/huy`),
    rateSession: (caLamViecId, data) =>
        axiosClient.post(`/khach-hang/don-hang/ca-lam/${caLamViecId}/danh-gia`, data),
    reportSession: (caLamViecId, data) =>
        axiosClient.post(`/khach-hang/don-hang/ca-lam/${caLamViecId}/bao-cao`, data),

    // ─── Tin nhắn & Phòng chat ────────────────────────────────────────────────
    getChatRooms: () =>
        axiosClient.get('/khach-hang/phong-chat/danh-sach'),
    getMessages: (phongChatId) =>
        axiosClient.get(`/khach-hang/phong-chat/${phongChatId}/tin-nhan`),
    sendMessage: (phongChatId, data) =>
        axiosClient.post(`/khach-hang/phong-chat/${phongChatId}/gui-tin`, data),

    // ─── Thông báo ────────────────────────────────────────────────────────────
    getNotifications: () =>
        axiosClient.get('/khach-hang/thong-bao'),
    markNotificationRead: (id) =>
        axiosClient.post(`/khach-hang/thong-bao/${id}/doc`),
    markAllNotificationsRead: () =>
        axiosClient.post('/khach-hang/thong-bao/doc-tat-ca'),
    deleteNotification: (id) =>
        axiosClient.delete(`/khach-hang/thong-bao/${id}`),
};

export default khachHangApi;