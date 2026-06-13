import React from 'react';

const PartnerProfile = () => {
  // Thông tin giả lập chi tiết của Đối tác
  const partnerData = {
    name: "Nguyễn Thị Hoa",
    code: "PT-8821",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop",
    phone: "0908 123 456",
    email: "nguyenhoa.cleantrust@gmail.com",
    birthday: "15/08/1988",
    hometown: "Bến Tre",
    address: "248/12 Bùi Viện, Phường Phạm Ngũ Lão, Quận 1, TP. Hồ Chí Minh",
    joinDate: "12/02/2024",
    status: "Đã xác minh (Verified)",
    experience: "3 năm",
    completedJobs: 1240,
    rating: 4.9,
    skills: ["Dọn dẹp nhà cửa", "Vệ sinh định kỳ", "Giặt là phân loại", "Nấu ăn gia đình văn phòng", "Khử khuẩn sâu"],
    identity: {
      idCard: "079XXXXXXXXX",
      issuedDate: "20/10/2021",
      issuedPlace: "Cục Cảnh sát QLHC về trật tự xã hội"
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* CARD 1: THÔNG TIN TỔNG QUAN & AVATAR HEAD */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative shrink-0">
          <img 
            src={partnerData.avatar} 
            alt={partnerData.name} 
            className="w-28 h-28 rounded-2xl object-cover border-4 border-slate-100 shadow-sm"
          />
          <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-lg flex items-center justify-center shadow">
            <span className="material-symbols-outlined text-sm font-bold">verified</span>
          </span>
        </div>
        
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
            <h1 className="text-2xl font-black text-slate-800">{partnerData.name}</h1>
            <span className="px-2.5 py-0.5 text-[11px] font-black tracking-wide uppercase bg-emerald-100 text-emerald-700 rounded-md inline-block self-center">
              {partnerData.code}
            </span>
          </div>
          <p className="text-sm text-slate-400 font-medium">Đối tác giúp việc cao cấp • Gia nhập từ {partnerData.joinDate}</p>
          
          <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-4 text-sm font-semibold">
            <div className="flex items-center gap-1.5 text-amber-600">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span>{partnerData.rating} Đánh giá</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600">
              <span className="material-symbols-outlined text-base">task_alt</span>
              <span>{partnerData.completedJobs.toLocaleString('vi-VN')} Đơn hoàn thành</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="material-symbols-outlined text-base">work_history</span>
              <span>{partnerData.experience} kinh nghiệm</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* CARD 2: CHI TIẾT LÝ LỊCH CÁ NHÂN (CHIẾM 7 CỘT) */}
        <div className="md:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="material-symbols-outlined text-emerald-600 text-xl">contact_page</span>
            Thông tin lý lịch cá nhân
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-2 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Số điện thoại</p>
              <p className="font-bold text-slate-700">{partnerData.phone}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Địa chỉ Email</p>
              <p className="font-bold text-slate-700 break-all">{partnerData.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Ngày sinh</p>
              <p className="font-bold text-slate-700">{partnerData.birthday}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Quê quán</p>
              <p className="font-bold text-slate-700">{partnerData.hometown}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-slate-400 font-medium mb-0.5">Địa chỉ thường trú hiện tại</p>
              <p className="font-bold text-slate-700 leading-relaxed">{partnerData.address}</p>
            </div>
          </div>
        </div>

        {/* CARD 3: HỒ SƠ ĐỊNH DANH PHÁP LÝ (CHIẾM 5 CỘT) */}
        <div className="md:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="material-symbols-outlined text-emerald-600 text-xl">gavel</span>
            Xác minh pháp lý & CCCD
          </h3>
          
          <div className="space-y-3.5 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Số CCCD (Đã mã hóa)</p>
              <p className="font-bold text-slate-700 tracking-wider">{partnerData.identity.idCard}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Ngày cấp</p>
              <p className="font-bold text-slate-700">{partnerData.identity.issuedDate}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Nơi cấp</p>
              <p className="font-bold text-slate-700 text-xs leading-relaxed">{partnerData.identity.issuedPlace}</p>
            </div>
            <div className="pt-1.5 flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100/60">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>shield_check</span>
              <span>Lý lịch tư pháp số 2 sạch (Không tiền án tiền sự)</span>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 4: KỸ NĂNG CHUYÊN MÔN ĐÃ ĐƯỢC KIỂM TRA TAY NGHỀ */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
          <span className="material-symbols-outlined text-emerald-600 text-xl">workspace_premium</span>
          Hồ sơ năng lực & Dịch vụ nhận đảm nhiệm
        </h3>
        <p className="text-xs text-slate-400 font-medium">Đây là danh sách các kỹ năng chuyên môn đã qua kỳ kiểm tra tay nghề nghiêm ngặt và đạt chuẩn chứng nhận CleanTrust.</p>
        
        <div className="flex flex-wrap gap-2.5 pt-1">
          {partnerData.skills.map((skill, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200/70 text-slate-700 text-xs font-bold rounded-xl shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {skill}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default PartnerProfile;