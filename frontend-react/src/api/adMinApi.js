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

  // ================= KHIẾU NẠI =================
  getComplaints: () => axiosClient.get('/admin/khieu-nai'),
  updateComplaintReply: (id, data) => axiosClient.put(`/admin/khieu-nai/${id}/phan-hoi`, data),
  deleteComplaint: (id) => axiosClient.delete(`/admin/khieu-nai/${id}`),

  // ================= ĐÁNH GIÁ =================
  getReviews: () => axiosClient.get('/admin/danh-gia'),
  updateReviewVisibility: (id) => axiosClient.put(`/admin/danh-gia/${id}/trang-thai-hien-thi`),
  deleteReview: (id) => axiosClient.delete(`/admin/danh-gia/${id}`),
  updateReviewReply: (id, data) => axiosClient.put(`/admin/danh-gia/${id}/phan-hoi`, data),
};

export default adMinApi;
