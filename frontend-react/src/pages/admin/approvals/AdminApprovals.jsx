import React, { useState } from 'react';

const AdminApprovals = () => {
  // Thêm setCandidates để có thể cập nhật danh sách (xóa bớt khi đã duyệt/từ chối)
  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: 'Nguyễn Thị Mai',
      applyTime: 'Ứng tuyển: 10:30 Hôm nay',
      isNew: true,
      avatar: 'https://i.pravatar.cc/150?img=47',
      quote: 'Tôi có 5 năm kinh nghiệm dọn dẹp căn hộ cao cấp và luôn đảm bảo sự hài lòng tuyệt đối của khách hàng.',
      location: 'Quận 7, TP. HCM',
      phone: '090 123 4567',
      age: '32 tuổi',
      skills: [
        { title: 'Dọn dẹp nhà ở (5 năm)', desc: 'Kinh nghiệm làm việc tại Vinhomes Central Park.' },
        { title: 'Nấu ăn gia đình', desc: 'Có khả năng nấu đa dạng các món miền Nam.' },
        { title: 'Sử dụng máy hút bụi công nghiệp', desc: 'Thành thạo các thiết bị vệ sinh hiện đại.' }
      ]
    },
    {
      id: 2,
      name: 'Phạm Văn Nam',
      applyTime: 'Ứng tuyển: 08:15 Hôm nay',
      isNew: false,
      initials: 'PV',
      avatar: null,
      quote: 'Mong muốn tìm công việc ổn định, gắn bó lâu dài. Cẩn thận, trung thực.',
      location: 'Gò Vấp, TP. HCM',
      phone: '093 456 7890',
      age: '28 tuổi',
      skills: [
        { title: 'Vệ sinh công nghiệp (3 năm)', desc: 'Đã từng làm cho công ty vệ sinh Hoàn Mỹ.' },
        { title: 'Làm sạch sofa, rèm', desc: 'Biết sử dụng hóa chất chuyên dụng an toàn.' }
      ]
    },
    {
      id: 3,
      name: 'Trần Hoàng Long',
      applyTime: 'Ứng tuyển: 15:20 Hôm qua',
      isNew: false,
      avatar: 'https://i.pravatar.cc/150?img=11',
      quote: 'Sinh viên năm 3 chăm chỉ, cần tìm việc làm thêm vào buổi tối.',
      location: 'Bình Thạnh, TP. HCM',
      phone: '098 765 4321',
      age: '21 tuổi',
      skills: [
        { title: 'Dọn dẹp cơ bản', desc: 'Nhanh nhẹn, biết lắng nghe ý kiến khách hàng.' }
      ]
    },
    {
      id: 4,
      name: 'Hoàng Linh',
      applyTime: 'Ứng tuyển: 14:00 Hôm qua',
      isNew: false,
      initials: 'HL',
      avatar: null,
      quote: 'Kinh nghiệm giúp việc nhà theo giờ hơn 2 năm tại khu vực Phú Mỹ Hưng.',
      location: 'Quận 4, TP. HCM',
      phone: '091 234 5678',
      age: '35 tuổi',
      skills: [
        { title: 'Dọn dẹp nhà ở (2 năm)', desc: 'Quen thuộc với các căn hộ chung cư.' },
        { title: 'Chăm sóc trẻ em', desc: 'Yêu trẻ, có kỹ năng chơi đùa và cho bé ăn.' }
      ]
    }
  ]);

  const [selectedId, setSelectedId] = useState(1);
  const selectedCandidate = candidates.find(c => c.id === selectedId);

  // ================= CÁC HÀM XỬ LÝ CHỨC NĂNG =================

  // 1. Hàm dùng chung để xóa ứng viên khỏi danh sách chờ sau khi thao tác
  const removeCandidateFromList = (idToRemove) => {
    const updatedCandidates = candidates.filter(c => c.id !== idToRemove);
    setCandidates(updatedCandidates);
    
    // Tự động chọn người đầu tiên trong danh sách mới, hoặc null nếu hết người
    if (updatedCandidates.length > 0) {
      setSelectedId(updatedCandidates[0].id);
    } else {
      setSelectedId(null);
    }
  };

  // 2. Xử lý Phê duyệt
  const handleApprove = () => {
    if (!selectedCandidate) return;
    const confirmApprove = window.confirm(`Xác nhận phê duyệt đối tác: ${selectedCandidate.name}?`);
    
    if (confirmApprove) {
      alert(`✅ Đã phê duyệt thành công: ${selectedCandidate.name}`);
      removeCandidateFromList(selectedCandidate.id);
    }
  };

  // 3. Xử lý Từ chối
  const handleReject = () => {
    if (!selectedCandidate) return;
    
    // Yêu cầu nhập lý do từ chối
    const reason = window.prompt(`Nhập lý do từ chối hồ sơ của ${selectedCandidate.name}:`, "Chưa đạt yêu cầu kinh nghiệm");
    
    if (reason !== null) { // Nếu bấm OK (không bấm Hủy)
      alert(`❌ Đã từ chối: ${selectedCandidate.name}.\nLý do: ${reason}`);
      removeCandidateFromList(selectedCandidate.id);
    }
  };

  // ===========================================================

  return (
    <div className="flex flex-col min-h-full">
      {/* KHU VỰC TIÊU ĐỀ */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Kiểm duyệt hồ sơ</h1>
        <p className="text-sm text-slate-500 mt-1">Xem xét, xác minh danh tính và phê duyệt đối tác mới tham gia hệ thống.</p>
      </div>

      {/* 3 KHỐI THỐNG KÊ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-2xl flex items-center gap-4 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">assignment_ind</span>
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-500">Hồ sơ chờ duyệt</p>
            {/* Lấy số lượng thực tế từ mảng */}
            <h3 className="text-2xl font-black text-slate-800">{candidates.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl flex items-center gap-4 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-500">Đã phê duyệt tuần này</p>
            <h3 className="text-2xl font-black text-slate-800">48</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl flex items-center gap-4 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">history</span>
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-500">Thời gian TB phản hồi</p>
            <h3 className="text-2xl font-black text-slate-800">4.2 <span className="text-base font-bold text-slate-500">giờ</span></h3>
          </div>
        </div>
      </div>

      {/* KHU VỰC CHÍNH (CHIA 2 CỘT LỚN) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* === CỘT TRÁI: DANH SÁCH CHỜ === */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col h-[700px]">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Danh sách chờ</h2>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Làm mới</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {candidates.length > 0 ? (
              candidates.map((cand) => (
                <div 
                  key={cand.id} 
                  onClick={() => setSelectedId(cand.id)}
                  className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all border ${
                    selectedId === cand.id 
                      ? 'border-blue-500 bg-blue-50/40 shadow-sm' 
                      : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    {cand.avatar ? (
                      <img src={cand.avatar} alt={cand.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center border border-slate-200">
                        {cand.initials}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{cand.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{cand.applyTime}</p>
                  </div>

                  {cand.isNew && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-black shrink-0">Mới</span>
                  )}
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                <p className="text-sm font-medium">Hết danh sách chờ</p>
              </div>
            )}
          </div>
        </div>

        {/* === CỘT PHẢI: CHI TIẾT HỒ SƠ === */}
        {selectedCandidate ? (
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Box 1: Thông tin cá nhân */}
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-slate-50 to-transparent pointer-events-none"></div>

              <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
                <div className="relative">
                  {selectedCandidate.avatar ? (
                    <img src={selectedCandidate.avatar} alt="avatar" className="w-28 h-28 rounded-2xl object-cover shadow-sm border border-slate-100" />
                  ) : (
                    <div className="w-28 h-28 rounded-2xl bg-slate-100 text-slate-400 font-bold text-3xl flex items-center justify-center border border-slate-200">
                      {selectedCandidate.initials}
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>
                  </div>
                </div>

                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <h2 className="text-3xl font-black text-slate-800">{selectedCandidate.name}</h2>
                    <span className="inline-flex items-center bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                      Đối tác tiềm năng
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-600 italic mb-4 leading-relaxed bg-slate-50 p-3 rounded-lg border-l-4 border-slate-300">
                    "{selectedCandidate.quote}"
                  </p>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-slate-400 text-[18px]">location_on</span> {selectedCandidate.location}</div>
                    <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-slate-400 text-[18px]">call</span> {selectedCandidate.phone}</div>
                    <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-slate-400 text-[18px]">cake</span> {selectedCandidate.age}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2 & 3: Kỹ năng và Xác minh */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 p-6 flex flex-col">
                <h3 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">assignment_turned_in</span>
                  Kinh nghiệm & Kỹ năng
                </h3>
                <div className="space-y-4 flex-1">
                  {selectedCandidate.skills.map((skill, index) => (
                    <div key={index} className="flex gap-3">
                      <span className="material-symbols-outlined text-blue-500 text-[20px] shrink-0 mt-0.5">check_circle</span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{skill.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{skill.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 p-6 flex flex-col">
                <h3 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600">admin_panel_settings</span>
                  Xác minh danh tính
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mặt trước CCCD</p>
                    <div className="bg-slate-100 rounded-lg aspect-[3/2] flex flex-col items-center justify-center text-slate-400 border border-slate-200 border-dashed">
                       <span className="material-symbols-outlined text-2xl opacity-50 mb-1">badge</span>
                       <span className="text-[10px] font-medium">Đã tải lên</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mặt sau CCCD</p>
                    <div className="bg-slate-100 rounded-lg aspect-[3/2] flex flex-col items-center justify-center text-slate-400 border border-slate-200 border-dashed">
                       <span className="material-symbols-outlined text-2xl opacity-50 mb-1">qr_code_scanner</span>
                       <span className="text-[10px] font-medium">Đã tải lên</span>
                    </div>
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3 mt-auto">
                  <span className="material-symbols-outlined text-emerald-500 shrink-0">check_circle</span>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-700">CCCD Hợp lệ</h4>
                    <p className="text-xs text-emerald-600/80 mt-0.5">Đã đối soát với cơ sở dữ liệu quốc gia.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= 4. KHU VỰC NÚT HÀNH ĐỘNG ================= */}
            <div className="flex flex-wrap items-center justify-end gap-3 mt-2">
              {/* NÚT TỪ CHỐI HỒ SƠ */}
              <button 
                onClick={handleReject}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-rose-600 border border-rose-200 bg-white hover:bg-rose-50 transition-colors"
              >
                Từ chối hồ sơ
              </button>
              
              {/* NÚT PHÊ DUYỆT ĐỐI TÁC */}
              <button 
                onClick={handleApprove}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-[#0f2857] hover:bg-[#1a3873] shadow-sm transition-colors"
              >
                Phê duyệt đối tác
              </button>
            </div>

          </div>
        ) : (
          // MÀN HÌNH TRỐNG KHI ĐÃ DUYỆT HẾT
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center text-center p-12">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6">
              <span className="material-symbols-outlined text-[48px]">task_alt</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Tuyệt vời!</h2>
            <p className="text-slate-500">Bạn đã hoàn thành kiểm duyệt tất cả hồ sơ ngày hôm nay.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminApprovals;