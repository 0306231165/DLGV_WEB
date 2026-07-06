import React, { useState, useEffect } from 'react';
import axiosClient from '../../../api/axiosClient';

const AdminApprovals = () => {
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({ approvedThisWeek: 0, avgResponseTime: 0 });
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch candidates
  const fetchCandidates = async () => {
    try {
      setIsLoading(true);
      const data = await axiosClient.get('/admin/approvals');
      
      let cands = [];
      if (Array.isArray(data)) {
        cands = data;
      } else {
        cands = data.candidates || [];
        setStats(data.stats || { approvedThisWeek: 0, avgResponseTime: 0 });
      }
      
      setCandidates(cands);
      if (cands.length > 0) {
        setSelectedId(cands[0].id);
      } else {
        setSelectedId(null);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách chờ duyệt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

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
  const handleApprove = async () => {
    if (!selectedCandidate) return;
    const confirmApprove = window.confirm(`Xác nhận phê duyệt đối tác: ${selectedCandidate.name}?`);
    
    if (confirmApprove) {
      try {
        await axiosClient.put(`/admin/approvals/${selectedCandidate.id}/approve`);
        alert(`✅ Đã phê duyệt thành công: ${selectedCandidate.name}`);
        fetchCandidates(); // Tự động load lại toàn bộ dữ liệu & thống kê mới nhất
      } catch (error) {
        alert('Có lỗi xảy ra khi phê duyệt.');
      }
    }
  };

  // 3. Xử lý Từ chối
  const handleReject = async () => {
    if (!selectedCandidate) return;
    
    // Yêu cầu nhập lý do từ chối
    const reason = window.prompt(`Nhập lý do từ chối hồ sơ của ${selectedCandidate.name}:`, "Không đạt yêu cầu");
    
    if (reason !== null) { // Nếu bấm OK (không bấm Hủy)
      try {
        await axiosClient.put(`/admin/approvals/${selectedCandidate.id}/reject`, { reason });
        alert(`❌ Đã từ chối: ${selectedCandidate.name}.\nLý do: ${reason}`);
        fetchCandidates(); // Tự động load lại toàn bộ dữ liệu & thống kê mới nhất
      } catch (error) {
        alert('Có lỗi xảy ra khi từ chối.');
      }
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

      {/* 2 KHỐI THỐNG KÊ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-5 rounded-2xl flex items-center gap-4 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">assignment_ind</span>
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-500">Hồ sơ chờ duyệt</p>
            <h3 className="text-2xl font-black text-slate-800">{candidates.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl flex items-center gap-4 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-500">Đã phê duyệt tuần này</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.approvedThisWeek}</h3>
          </div>
        </div>

      </div>

      {/* KHU VỰC CHÍNH (CHIA 2 CỘT LỚN) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* === CỘT TRÁI: DANH SÁCH CHỜ === */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col h-[700px]">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Danh sách chờ</h2>
            <button onClick={fetchCandidates} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Làm mới</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-slate-500 mt-3">Đang tải...</p>
              </div>
            ) : candidates.length > 0 ? (
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

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 font-medium mt-2">
                    <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-slate-400 text-[18px]">badge</span> CCCD: {selectedCandidate.cccd}</div>
                    <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-slate-400 text-[18px]">call</span> {selectedCandidate.phone}</div>
                    <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-slate-400 text-[18px]">mail</span> {selectedCandidate.email}</div>
                    <div className="flex items-center gap-1.5 w-full mt-1"><span className="material-symbols-outlined text-slate-400 text-[18px]">location_on</span> {selectedCandidate.location}</div>
                    <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-slate-400 text-[18px]">cake</span> {selectedCandidate.age}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Kinh nghiệm và Kỹ năng (Mở rộng toàn bộ chiều ngang) */}
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 p-6 flex flex-col flex-1">
              <h3 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">assignment_turned_in</span>
                Kinh nghiệm & Kỹ năng chuyên môn đăng ký
              </h3>
              
              <div className="flex-1 bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                {(selectedCandidate.kinh_nghiem || selectedCandidate.kinhNghiem) ? (
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 whitespace-pre-line text-sm text-slate-700 leading-relaxed">
                    {selectedCandidate.kinh_nghiem || selectedCandidate.kinhNghiem}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-4">Chưa cập nhật kinh nghiệm làm việc.</div>
                )}
              </div>
            </div>

            {/* ================= 4. KHU VỰC NÚT HÀNH ĐỘNG MỚI ================= */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-2">
              {/* NÚT TỪ CHỐI HỒ SƠ */}
              <button 
                onClick={handleReject}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-300 shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">cancel</span>
                Từ chối hồ sơ
              </button>
              
              {/* NÚT PHÊ DUYỆT ĐỐI TÁC */}
              <button 
                onClick={handleApprove}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white bg-[#0f2857] hover:bg-[#1a3873] border border-[#0f2857] transition-all duration-300 shadow-[0_4px_12px_rgba(15,40,87,0.25)] hover:shadow-[0_6px_16px_rgba(15,40,87,0.35)] hover:-translate-y-0.5"
              >
                <span className="material-symbols-outlined text-[20px]">verified</span>
                Phê duyệt đối tác
              </button>
            </div>

          </div>
        ) : (
          // MÀN HÌNH TRỐNG KHI ĐÃ DUYỆT HẾT HOẶC KHÔNG CÓ AI
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center text-center p-12 h-[700px]">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6 shadow-sm border border-emerald-100">
              <span className="material-symbols-outlined text-[48px]">task_alt</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Tuyệt vời!</h2>
            <p className="text-slate-500">Bạn đã hoàn thành kiểm duyệt tất cả hồ sơ hiện tại.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminApprovals;