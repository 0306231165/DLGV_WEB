import React from 'react';

const PartnerReviews = () => {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-4">
        <span className="material-symbols-outlined text-3xl text-amber-500">grade</span>
        <div>
          <h1 className="text-xl font-black text-slate-800">Đánh giá và phản hồi</h1>
          <p className="text-xs text-slate-400">Xem khách hàng nói gì về chất lượng dọn dẹp của bạn.</p>
        </div>
      </div>
      
      <div className="space-y-3 mt-6">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-slate-700">Chị Mai Anh (Quận 7)</span>
            <span className="text-amber-500 font-bold">⭐⭐⭐⭐⭐ 5.0</span>
          </div>
          <p className="text-slate-600 italic">"Chị Hoa dọn dẹp rất kỹ, sạch sẽ, đóng gói rác gọn gàng. Lần sau sẽ tiếp tục đặt chị."</p>
        </div>
      </div>
    </div>
  );
};

export default PartnerReviews;