import React, { useState, useEffect } from 'react';
import adMinApi from '../../../api/adMinApi';

const AdminReviews = () => {
  // ================= 1. LẤY DỮ LIỆU TỪ MYSQL =================
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const response = await adMinApi.getReviews();
      if (response.success) {
        setReviews(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu đánh giá:', error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // ================= 2. STATE UI MANAGEMENT =================
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('Tất cả sao');
  const [filterVisibility, setFilterVisibility] = useState('Tất cả trạng thái');
  const [filterEmployee, setFilterEmployee] = useState('Tất cả nhân viên');

  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');

  // ================= 3. CÁC HÀM XỬ LÝ =================
  const handleToggleVisibility = async (id) => {
    try {
      await adMinApi.updateReviewVisibility(id);
      fetchReviews();
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDeleteReview = async (id, customer) => {
    if (window.confirm(`Bạn có chắc muốn xóa vĩnh viễn đánh giá của "${customer}"?`)) {
      try {
        await adMinApi.deleteReview(id);
        fetchReviews();
      } catch (error) {
        alert(error.response?.data?.message || 'Có lỗi xảy ra');
      }
    }
  };

  const handleOpenReplyModal = (review) => {
    setSelectedReview(review);
    setReplyText(review.adminNote || ''); 
  };

  const handleSaveReply = async (e) => {
    e.preventDefault();
    try {
      await adMinApi.updateReviewReply(selectedReview.id, {
        adminNote: replyText
      });
      setSelectedReview(null);
      fetchReviews();
      alert(`✅ Đã đăng tải phản hồi! (Trang Khiếu nại cũng đã được cập nhật)`);
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi lưu phản hồi');
    }
  };

  // ================= 4. LOGIC LỌC TÌM KIẾM =================
  const filteredReviews = reviews.filter(r => {
    const matchSearch = r.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        r.desc.toLowerCase().includes(searchTerm.toLowerCase());
    
    const itemRating = r.rating || 1; 
    const matchRating = filterRating === 'Tất cả sao' || itemRating === parseInt(filterRating);
    
    const itemVisible = r.isVisible !== false; 
    let matchVisibility = true;
    if (filterVisibility === 'Đang hiển thị') matchVisibility = itemVisible === true;
    if (filterVisibility === 'Đã ẩn') matchVisibility = itemVisible === false;

    const matchEmployee = filterEmployee === 'Tất cả nhân viên' || (r.employee || 'Chưa phân công') === filterEmployee;

    return matchSearch && matchRating && matchVisibility && matchEmployee;
  });

  const employeeMap = new Map();
  reviews.forEach(r => {
    const name = r.employee || 'Chưa phân công';
    if (!employeeMap.has(name)) {
      employeeMap.set(name, r.employeeId || 0);
    }
  });

  const uniqueEmployees = [...employeeMap.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(e => e[0]);

  const totalReviewsCount = reviews.length;
  const averageRating = totalReviewsCount > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 1), 0) / totalReviewsCount).toFixed(1) 
    : 0;
  const toxicHiddenCount = reviews.filter(r => r.isVisible === false).length;

  return (
    <div className="flex flex-col min-h-full bg-slate-50/50 relative p-6 max-w-7xl mx-auto">
      
      {selectedReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-black text-slate-800">Phản hồi khách hàng</h2>
                <p className="text-xs text-slate-500 mt-0.5">Khách hàng: <strong className="text-slate-700">{selectedReview.customer}</strong></p>
              </div>
              <button onClick={() => setSelectedReview(null)} className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-sm">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSaveReply} className="p-6 space-y-4 bg-white">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                <div className="flex gap-1 text-amber-400 mb-1">
                  {[...Array(selectedReview.rating || 1)].map((_, i) => <span key={i} className="material-symbols-outlined text-[18px] fill-current">star</span>)}
                </div>
                <p className="text-slate-600 italic">"{selectedReview.desc}"</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nội dung phản hồi (Đồng bộ với Ghi chú xử lý)</label>
                <textarea 
                  required
                  rows="4"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Nhập lời cảm ơn hoặc giải pháp..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 bg-slate-50"
                ></textarea>
              </div>

              <div className="pt-2 flex gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setSelectedReview(null)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Hủy bỏ</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0f2857] hover:bg-[#1a3873] shadow-sm transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">send</span> Gửi phản hồi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Kiểm duyệt Đánh giá (Reviews)</h1>
        <p className="text-sm text-slate-500 mt-1">Dữ liệu được đồng bộ trực tiếp từ hệ thống Khiếu nại Khách hàng.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><span className="material-symbols-outlined text-2xl">rate_review</span></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase">Tổng lượt đánh giá</p><h3 className="text-2xl font-black text-slate-800">{totalReviewsCount} <span className="text-sm font-semibold text-slate-500">lượt</span></h3></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center"><span className="material-symbols-outlined text-2xl">star_half</span></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase">Điểm trung bình</p><h3 className="text-2xl font-black text-slate-800">{averageRating} <span className="text-amber-400 text-lg">★</span></h3></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center"><span className="material-symbols-outlined text-2xl">visibility_off</span></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase">Đã ẩn công khai</p><h3 className="text-2xl font-black text-rose-600">{toxicHiddenCount} <span className="text-sm font-semibold text-slate-500">lượt</span></h3></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm theo tên khách, nội dung..." className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div className="flex gap-3 flex-wrap">
            <select value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:border-blue-500 cursor-pointer bg-slate-50 max-w-[200px] truncate">
              <option value="Tất cả nhân viên">Tất cả nhân viên</option>
              {uniqueEmployees.map((emp, i) => (
                <option key={i} value={emp}>{emp}</option>
              ))}
            </select>
            <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:border-blue-500 cursor-pointer bg-slate-50">
              <option value="Tất cả sao">Tất cả số sao</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 Sao)</option>
              <option value="4">⭐⭐⭐⭐ (4 Sao)</option>
              <option value="3">⭐⭐⭐ (3 Sao)</option>
              <option value="2">⭐⭐ (2 Sao)</option>
              <option value="1">⭐ (1 Sao)</option>
            </select>
            <select value={filterVisibility} onChange={(e) => setFilterVisibility(e.target.value)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:border-blue-500 cursor-pointer bg-slate-50">
              <option value="Tất cả trạng thái">Tất cả trạng thái</option>
              <option value="Đang hiển thị">Đang hiển thị công khai</option>
              <option value="Đã ẩn">Đã ẩn (Toxic/Spam)</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((rev) => (
              <div key={rev.id} className={`p-6 transition-colors flex flex-col md:flex-row gap-6 items-start ${rev.isVisible === false ? 'bg-rose-50/20' : 'hover:bg-slate-50/40'}`}>
                <div className="w-full md:w-52 shrink-0 space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm">{rev.customer}</h4>
                  <p className="text-xs text-slate-400 font-medium">Dịch vụ: <strong className="text-slate-600">{rev.service}</strong></p>
                  <p className="text-xs text-slate-400 font-medium">Nhân viên: <strong className="text-slate-600">{rev.employee || 'Chưa phân công'}</strong></p>
                  <p className="text-[10px] text-slate-400 font-bold">Vấn đề: {rev.type}</p>
                  <div className="flex text-amber-400 pt-1">
                    {[...Array(rev.rating || 1)].map((_, i) => <span key={i} className="material-symbols-outlined text-[16px] fill-current">star</span>)}
                    {[...Array(5 - (rev.rating || 1))].map((_, i) => <span key={i} className="material-symbols-outlined text-[16px] text-slate-200">star</span>)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold block pt-1">{rev.date}</span>
                </div>

                <div className="flex-1 space-y-3">
                  <div><p className="text-sm font-medium text-slate-700 bg-white border border-slate-100 p-3.5 rounded-xl shadow-sm leading-relaxed">{rev.desc}</p></div>
                  {rev.adminNote && (
                    <div className="bg-blue-50/50 border border-blue-100/60 p-3.5 rounded-xl pl-4 relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-xl"></div>
                      <p className="text-xs font-black text-blue-700 flex items-center gap-1 mb-1"><span className="material-symbols-outlined text-[14px]">reply</span> CleanTrust phản hồi:</p>
                      <p className="text-xs font-medium text-slate-600 leading-relaxed italic">"{rev.adminNote}"</p>
                    </div>
                  )}
                </div>

                <div className="w-full md:w-auto shrink-0 flex md:flex-col gap-2 items-stretch pt-2 md:pt-0">
                  <button onClick={() => handleToggleVisibility(rev.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex justify-center gap-1.5 ${rev.isVisible !== false ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                    <span className="material-symbols-outlined text-[16px]">{rev.isVisible !== false ? 'visibility_off' : 'visibility'}</span>
                    {rev.isVisible !== false ? 'Ẩn bình luận' : 'Hiện lại'}
                  </button>
                  <button onClick={() => handleOpenReplyModal(rev)} className="px-3 py-1.5 rounded-lg bg-[#0f2857] text-white text-xs font-bold flex justify-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">chat</span> {rev.adminNote ? 'Sửa phản hồi' : 'Phản hồi'}
                  </button>
                  <button onClick={() => handleDeleteReview(rev.id, rev.customer)} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 text-xs font-bold flex justify-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">delete</span> Xóa bỏ
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-slate-400"><p className="text-sm font-semibold">Không có dữ liệu.</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;