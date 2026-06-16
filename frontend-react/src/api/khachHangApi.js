// src/api/khachHangApi.js
import axiosClient from './axiosClient';

const khachHangApi = {

    // GET /api/khach-hang/profile
    getProfile: () => {
        return axiosClient.get('/khach-hang/profile');
    },

    // GET /api/khach-hang/dia-chi
    getAddresses: () => {
        return axiosClient.get('/khach-hang/dia-chi');
    },

    // POST /api/khach-hang/dia-chi/them
    addAddress: (data) => {
        return axiosClient.post('/khach-hang/dia-chi/them', data);
    },

    // POST /api/khach-hang/don-hang/dat-lich
    datLich: (data) => {
        return axiosClient.post('/khach-hang/don-hang/dat-lich', data);
    },

};

export default khachHangApi;