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
    }
};

export default nhanVienApi;