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

    // GET /api/nhan-vien/{id}/lich-ban
    getStaffBusySchedule: (id) => {
        return axiosClient.get(`/nhan-vien/${id}/lich-ban`);
    },

    // GET /api/nhan-vien/dashboard
    getDashboard: (params) => {
        return axiosClient.get('/nhan-vien/dashboard', { params });
    },

    // GET /api/nhan-vien/wallet
    getWallet: () => {
        return axiosClient.get('/nhan-vien/wallet');
    },
    depositWallet: (data) => {
        return axiosClient.post('/nhan-vien/wallet/deposit', data);
    },
    nhanLuongWallet: (data) => {
        return axiosClient.post('/nhan-vien/wallet/nhan-luong', data);
    },
    withdrawWallet: (data) => {
        return axiosClient.post('/nhan-vien/wallet/withdraw', data);
    },
    // Lịch nghỉ (Cam kết)
    getCamKetLichNghi: () => {
        return axiosClient.get('/nhan-vien/lich-nghi/cam-ket');
    },

    saveCamKetLichNghi: (lichNghi) => {
        return axiosClient.post('/nhan-vien/lich-nghi/cam-ket', { lichNghi });
    },

    cancelCamKetLichNghi: () => {
        return axiosClient.delete('/nhan-vien/lich-nghi/cam-ket');
    },

    getBlockedDates: () => {
        return axiosClient.get('/nhan-vien/lich-nghi/dot-xuat');
    },
    saveBlockedDates: (dates) => {
        return axiosClient.post('/nhan-vien/lich-nghi/dot-xuat', { dates });
    },

    // Quản lý ca làm việc
    getAvailableJobs: () => {
        return axiosClient.get('/nhan-vien/ca-lam/cho-nhan');
    },
    getAcceptedJobs: () => {
        return axiosClient.get('/nhan-vien/ca-lam/da-nhan');
    },
    getWorkingSchedule: () => {
        return axiosClient.get('/nhan-vien/ca-lam/lich-lam-viec');
    },
    getJobHistory: () => {
        return axiosClient.get('/nhan-vien/ca-lam/lich-su');
    },
    getCancelStatistics: (params = {}) => {
        return axiosClient.get('/nhan-vien/ca-lam/thong-ke-huy', { params });
    },
    acceptJob: (caLamViecId) => {
        return axiosClient.post(`/nhan-vien/ca-lam/${caLamViecId}/bam-nhan`);
    },
    rejectJob: (caLamViecId) => {
        return axiosClient.post(`/nhan-vien/ca-lam/${caLamViecId}/tu-choi`);
    },
    cancelAcceptedJob: (caLamViecId, data = {}) => {
        return axiosClient.post(`/nhan-vien/ca-lam/${caLamViecId}/huy-ca`, data);
    },
    cancelContract: (caLamViecId, data = {}) => {
        return axiosClient.post(`/nhan-vien/ca-lam/${caLamViecId}/huy-hop-dong`, data);
    },
    updateProgress: (caLamViecId) => {
        return axiosClient.put(`/nhan-vien/ca-lam/${caLamViecId}/cap-nhat`);
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

    // ─── CHAT VỚI KHÁCH HÀNG ───
    getChatRooms: () => {
        return axiosClient.get('/nhan-vien/phong-chat/danh-sach');
    },
    getMessages: (roomId) => {
        return axiosClient.get(`/nhan-vien/phong-chat/${roomId}/tin-nhan`);
    },
    sendMessage: (roomId, text) => {
        return axiosClient.post(`/nhan-vien/phong-chat/${roomId}/gui-tin`, { text });
    },
    getRoomOrderDetails: (roomId) => {
        return axiosClient.get(`/nhan-vien/phong-chat/${roomId}/chi-tiet-don`);
    },

    // ─── THÔNG BÁO CHO NHÂN VIÊN ───
    getNotifications: () => {
        return axiosClient.get('/nhan-vien/thong-bao');
    },
    markNotificationRead: (id) => {
        return axiosClient.post(`/nhan-vien/thong-bao/${id}/doc`);
    },
    markAllNotificationsRead: () => {
        return axiosClient.post('/nhan-vien/thong-bao/doc-tat-ca');
    },
};

export default nhanVienApi;