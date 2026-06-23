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
    getDashboard: () => {
        return axiosClient.get('/nhan-vien/dashboard');
    },

    // GET /api/nhan-vien/wallet
    getWallet: () => {
        return axiosClient.get('/nhan-vien/wallet');
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
    acceptJob: (caLamViecId) => {
        return axiosClient.post(`/nhan-vien/ca-lam/${caLamViecId}/bam-nhan`);
    },
    rejectJob: (caLamViecId) => {
        return axiosClient.post(`/nhan-vien/ca-lam/${caLamViecId}/tu-choi`);
    },
    cancelAcceptedJob: (caLamViecId) => {
        return axiosClient.post(`/nhan-vien/ca-lam/${caLamViecId}/huy-ca`);
    },
    cancelContract: (caLamViecId) => {
        return axiosClient.post(`/nhan-vien/ca-lam/${caLamViecId}/huy-hop-dong`);
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
};

export default nhanVienApi;