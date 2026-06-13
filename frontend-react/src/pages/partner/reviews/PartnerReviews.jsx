import React, { useState } from 'react';

// Dữ liệu đánh giá mẫu dành cho Đối tác (Chị Hoa)
const MOCK_PARTNER_REVIEWS = [
  { id: 'pr1', customer: 'Chị Mai Anh (Quận 7)', rating: 5, text: 'Chị Hoa dọn dẹp rất kỹ, sạch sẽ, đóng gói rác gọn gàng. Lần sau sẽ tiếp tục đặt chị.', date: '09/06/2026' },
  { id: 'pr2', customer: 'Anh Hoàng Nam (Quận 2)', rating: 5, text: 'Nhân viên đến đúng giờ, chuẩn bị đầy đủ dụng cụ. Lau kính rất sạch.', date: '08/06/2026' },
  { id: 'pr3', customer: 'Chị Thu Thảo (Bình Thạnh)', rating: 4, text: 'Dọn dẹp sạch sẽ nhiệt tình, tuy nhiên hôm nay quên lau mạng nhện ở góc trần phòng khách.', date: '05/06/2026' },
  { id: 'pr4', customer: 'Chú Minh Quang (Quận 1)', rating: 5, text: 'Rất hài lòng, tủ bếp nhiều dầu mỡ được chị xử lý sạch bong kin kít. 5 sao!', date: '04/06/2026' },
  { id: 'pr5', customer: 'Cô Linh Chi (Phú Nhuận)', rating: 3, text: 'Giao tiếp lịch sự nhưng dọn dẹp hơi vội, sàn nhà sau khi lau vẫn còn hơi rít.', date: '01/06/2026' },
];

const PartnerReviews = () => {
  // State bộ lọc số sao
  const [starFilter, setStarFilter] = useState('all');

  // Tính toán số liệu thống kê
  const totalReviews = MOCK_PARTNER_REVIEWS.length;
  const averageRating = (MOCK_PARTNER_REVIEWS.reduce((sum, item) => sum + item.rating, 0) / totalReviews).toFixed(1);

  const getStarCount = (star) => MOCK_PARTNER_REVIEWS.filter(r => r.rating === star).length;

  const filteredReviews = MOCK_PARTNER_REVIEWS.filter(review => {
    if (starFilter === 'all') return true;
    return review.rating === Number(starFilter);
  });

  // Render sao vàng hổ phách đặc trưng cho đánh giá
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`material-symbols-outlined text-xl ${i <= rating ? 'text-amber-500' : 'text-slate-200'}`}
          style={{ fontVariationSettings: i <= rating ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/60 shadow-sm max-w-4xl mx-auto">
      
      {/* ── HEADER ĐỒNG BỘ ĐỐI TÁC ── */}
      <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-100/50 shrink-0">
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>grade</span>
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800">Đánh giá và phản hồi</h1>
          <p className="text-xs text-slate-400">Xem khách hàng nói gì về chất lượng dọn dẹp của bạn.</p>
        </div>
      </div>

      {/* ── BẢNG THỐNG KÊ TỔNG QUAN (Tông màu Emerald của Layout) ── */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 mt-6 mb-6">
        <div className="text-center shrink-0 min-w-[120px]">
          <p className="text-4xl font-black text-emerald-600">{averageRating}</p>
          <div className="flex justify-center mt-1 gap-0.5">
            {renderStars(Math.round(averageRating))}
          </div>
          <p className="text-xs text-slate-400 mt-1.5 font-semibold">{totalReviews} đánh giá</p>
        </div>
        
        {/* Các thanh biểu đồ phần trăm */}
        <div className="flex-1 w-full space-y-2.5">
          {[5, 4, 3, 2, 1].map(star => {
            const count = getStarCount(star);
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-3 text-right font-bold">{star}</span>
                <span className="material-symbols-outlined text-sm text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <div className="flex-1 h-2 bg-slate-200/70 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-slate-400 w-8 font-bold text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BỘ LỌC ĐÁNH GIÁ (Active ăn màu xanh Emerald giống Sidebar) ── */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-600">
          <button 
            onClick={() => setStarFilter('all')}
            className={`px-3.5 py-2 rounded-xl border transition-all duration-150 ${
              starFilter === 'all' 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10' 
                : 'bg-white border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Tất cả ({totalReviews})
          </button>
          {[5, 4, 3, 2, 1].map(star => {
            const count = getStarCount(star);
            return (
              <button 
                key={star}
                onClick={() => setStarFilter(star.toString())}
                disabled={count === 0}
                className={`px-3.5 py-2 rounded-xl border transition-all duration-150 flex items-center gap-1
                  ${count === 0 ? 'opacity-35 cursor-not-allowed' : ''}
                  ${starFilter === star.toString() 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10' 
                    : 'bg-white border-slate-200 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                {star} <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── DANH SÁCH CARD NHẬN XÉT: PHÂN TÁCH RÕ RÀNG, ĐỘ CAO GIỚI HẠN CUỘN ── */}
      <div className="max-h-[420px] overflow-y-auto pr-1.5 scrollbar-thin space-y-3.5">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div 
              key={review.id} 
              className="p-5 bg-slate-50/60 rounded-2xl border border-slate-100 hover:border-slate-200/80 shadow-sm hover:shadow transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3 gap-2">
                <div className="flex items-center gap-3">
                  {/* Avatar chữ cái đại diện */}
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm shrink-0">
                    {review.customer.replace('Chị ', '').replace('Anh ', '').replace('Cô ', '').replace('Chú ', '').charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm leading-none">{review.customer}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{review.date}</p>
                  </div>
                </div>
                
                {/* Số sao của bình luận */}
                <div className="flex shrink-0 gap-0.5">
                  {renderStars(review.rating)}
                </div>
              </div>
              
              {/* Nội dung text khách hàng để trong vệt line xanh mượt đầu dòng */}
              <p className="text-sm text-slate-600 italic leading-relaxed pl-4 border-l-2 border-emerald-500/40">
                "{review.text}"
              </p>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 font-bold bg-slate-50 rounded-2xl border border-slate-100">
            Không có phản hồi nào phù hợp với bộ lọc số sao này.
          </div>
        )}
      </div>

    </div>
  );
};

export default PartnerReviews;