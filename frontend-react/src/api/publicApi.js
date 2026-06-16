// src/api/publicApi.js
import axiosClient from './axiosClient';

const publicApi = {
    getServices: () => {
        return axiosClient.get('/dich-vu');
    },
    getServiceDetail: (id) => {
        return axiosClient.get(`/dich-vu/${id}`);
    },

    
    sendContact: (data) => {
        return axiosClient.post('/gui-lien-he', data);
    }
};

export default publicApi;