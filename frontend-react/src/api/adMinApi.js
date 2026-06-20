import axiosClient from './axiosClient';

const adMinApi = {
  // ================= DỊCH VỤ =================
  getServices: () => axiosClient.get('/admin/dich-vu'),
  addService: (data) => axiosClient.post('/admin/dich-vu/them', data),
  updateService: (id, data) => axiosClient.put(`/admin/dich-vu/${id}`, data),
  deleteService: (id) => axiosClient.delete(`/admin/dich-vu/${id}`),

  // ================= KHUYẾN MÃI =================
  getPromotions: () => axiosClient.get('/admin/khuyen-mai'),
  addPromotion: (data) => axiosClient.post('/admin/khuyen-mai/them', data),
  updatePromotionStatus: (id) => axiosClient.put(`/admin/khuyen-mai/${id}/trang-thai`),
  deletePromotion: (id) => axiosClient.delete(`/admin/khuyen-mai/${id}`),

  // ================= QUY ĐỊNH PHỤ PHÍ =================
  getPhuPhi: () => axiosClient.get('/admin/quy-dinh-phu-phi'),
  updatePhuPhi: (id, data) => axiosClient.put(`/admin/quy-dinh-phu-phi/${id}`, data),

  // ================= TÙY CHỌN BIẾN THỂ =================
  getVariantOptions: () => axiosClient.get('/admin/tuy-chon-bien-the'),
};

export default adMinApi;
