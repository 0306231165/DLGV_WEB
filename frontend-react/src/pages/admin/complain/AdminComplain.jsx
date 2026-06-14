import React, { useState } from 'react';

const AdminComplain = () => {
  // ================= 1. STATE DỮ LIỆU KHIẾU NẠI (MÔ PHỎNG KHÁCH GỬI VỀ) =================
  const [complaints, setComplaints] = useState([
    { 
      id: '#FB-1029', customer: 'Nguyễn Văn A', phone: '0901234567', service: 'Vệ sinh nhà ở', 
      date: '14/06/2026', type: 'Thái độ nhân viên', desc: 'Nhân viên đến trễ 45 phút mà không gọi báo trước, thái độ lúc làm việc rất khó chịu.', 
      status: 'Chờ xử lý', adminNote: '' 
    },
    { 
      id: '#FB-1028', customer: 'Trần Thị B', phone: '0987654321', service: 'Vệ sinh máy lạnh', 
      date: '13/06/2026', type: 'Chất lượng dịch vụ', desc: 'Máy lạnh rửa xong vẫn bị chảy nước ròng ròng, yêu cầu cho người qua kiểm tra lại gấp!', 
      status: 'Đang xử lý', adminNote: 'Đã gọi xin lỗi khách. Chiều nay cử thợ kỹ thuật qua fix lại.' 
    },
    { 
      id: '#FB-1015', customer: 'Lê Hoàng C', phone: '0911222333', service: 'Giặt Sofa', 
      date: '10/06/2026', type: 'Hư hỏng tài sản', desc: 'Hóa chất tẩy rửa làm phai màu bộ sofa da thật của nhà tôi.', 
      status: 'Đã giải quyết', adminNote: 'Đã đền bù 30% giá trị dịch vụ và tặng voucher miễn phí lần sau. Khách đã đồng ý.' 
    },
    { 
      id: '#FB-0992', customer: 'Phạm Mai Anh', phone: '0933444555', service: 'App/Hệ thống', 
      date: '08/06/2026', type: 'Lỗi hệ thống', desc: 'App bị lỗi không thanh toán được qua VNPay, trừ tiền rồi nhưng app báo lỗi.', 
      status: 'Chờ xử lý', adminNote: '' 
    },
  ]);

  // ================= 2. STATE UI (LỌC, TÌM KIẾM, MODAL) =================
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  
  // Quản lý Modal Xử lý
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNote, setEditNote] = useState('');

  // ================= 3. LOGIC XỬ LÝ & LỌC DỮ LIỆU =================
  const filteredComplaints = complaints.filter(c => {
    const matchSearch = c.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        c.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'Tất cả' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Mở modal và nạp dữ liệu hiện tại
  const handleOpenProcessModal = (complaint) => {
    setSelectedComplaint(complaint);
    setEditStatus(complaint.status);
    setEditNote(complaint.adminNote);
  };

  // Cập nhật dữ liệu khiếu nại (Lưu)
  const handleSaveChanges = (e) => {
    e.preventDefault();
    setComplaints(complaints.map(c => 
      c.id === selectedComplaint.id 
        ? { ...c, status: editStatus, adminNote: editNote } 
        : c
    ));
    setSelectedComplaint(null); // Đóng modal
    alert(`✅ Đã cập nhật xử lý cho khiếu nại ${selectedComplaint.id}`);
  };

  // Màu sắc trạng thái
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Đã giải quyết': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Đang xử lý': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Chờ xử lý': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  // Thống kê nhanh
  const stats = {
    pending: complaints.filter(c => c.status === 'Chờ xử lý').length,
    processing: complaints.filter(c => c.status === 'Đang xử lý').length,
    resolved: complaints.filter(c => c.status === 'Đã giải quyết').length,
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50/50 relative">
      
      {/* ================= MODAL XỬ LÝ KHIẾU NẠI ================= */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-black text-slate-800">Xử lý khiếu nại {selectedComplaint.id}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Khách hàng: <strong>{selectedComplaint.customer}</strong> ({selectedComplaint.phone})</p>
              </div>
              <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-rose-500 transition-colors bg-white w-8 h-8 rounded-lg shadow-sm border border-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Content Modal (Cuộn được) */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Thông tin từ khách */}
              <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center border-b border-rose-100/50 pb-2">
                  <span className="text-xs font-bold text-rose-600 uppercase">Nội dung phản ánh</span>
                  <span className="text-xs font-semibold text-rose-400">{selectedComplaint.date}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-500">Dịch vụ:</span> <strong className="text-slate-700">{selectedComplaint.service}</strong></div>
                  <div><span className="text-slate-500">Loại vấn đề:</span> <strong className="text-slate-700">{selectedComplaint.type}</strong></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Chi tiết vấn đề:</p>
                  <p className="text-sm text-slate-600 bg-white p-3 rounded-lg border border-rose-100 leading-relaxed italic">
                    "{selectedComplaint.desc}"
                  </p>
                </div>
              </div>

              {/* Khu vực Admin Xử lý */}
              <form id="process-form" onSubmit={handleSaveChanges} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Cập nhật trạng thái</label>
                  <select 
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 bg-slate-50"
                  >
                    <option value="Chờ xử lý">🔴 Chờ xử lý</option>
                    <option value="Đang xử lý">🔵 Đang xử lý</option>
                    <option value="Đã giải quyết">🟢 Đã giải quyết</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Ghi chú giải quyết (Admin Note)</label>
                  <textarea 
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="Nhập phương án đã giải quyết hoặc ghi chú cho nhân sự..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 min-h-[120px] bg-slate-50"
                  ></textarea>
                </div>
              </form>
            </div>

            {/* Footer Modal */}
            <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
              <button onClick={() => setSelectedComplaint(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                Hủy bỏ
              </button>
              <button form="process-form" type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0f2857] hover:bg-[#1a3873] shadow-sm transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">save</span>
                Lưu kết quả
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= GIAO DIỆN CHÍNH ================= */}
      
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Quản lý Khiếu nại</h1>
        <p className="text-sm text-slate-500 mt-1">Tiếp nhận và xử lý các phản ánh, góp ý từ khách hàng.</p>
      </div>

      {/* 3 Khối Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center"><span className="material-symbols-outlined text-2xl">warning</span></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Cần xử lý gấp</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.pending} <span className="text-sm font-semibold text-slate-500">đơn</span></h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center"><span className="material-symbols-outlined text-2xl">autorenew</span></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Đang tiến hành</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.processing} <span className="text-sm font-semibold text-slate-500">đơn</span></h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><span className="material-symbols-outlined text-2xl">task_alt</span></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Đã giải quyết</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.resolved} <span className="text-sm font-semibold text-slate-500">đơn</span></h3>
          </div>
        </div>
      </div>

      {/* Bảng Danh sách Khiếu nại */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col flex-1 overflow-hidden">
        
        {/* Bộ lọc */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã đơn hoặc tên khách hàng..." 
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:border-blue-500 cursor-pointer bg-slate-50"
          >
            <option value="Tất cả">Tất cả trạng thái</option>
            <option value="Chờ xử lý">Chờ xử lý</option>
            <option value="Đang xử lý">Đang xử lý</option>
            <option value="Đã giải quyết">Đã giải quyết</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1 min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="py-4 pl-6">Mã Đơn</th>
                <th className="py-4">Khách hàng</th>
                <th className="py-4">Vấn đề</th>
                <th className="py-4">Ngày nhận</th>
                <th className="py-4 text-center">Trạng thái</th>
                <th className="py-4 pr-6 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((c, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 pl-6 font-black text-[#0f2857]">{c.id}</td>
                    <td className="py-4">
                      <p className="font-bold text-slate-800">{c.customer}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{c.phone}</p>
                    </td>
                    <td className="py-4 text-slate-600">
                      <p className="font-bold text-slate-700">{c.type}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px] truncate" title={c.desc}>{c.desc}</p>
                    </td>
                    <td className="py-4 text-slate-500">{c.date}</td>
                    <td className="py-4 text-center">
                      <span className={`inline-block border px-2.5 py-1 rounded-md text-[10px] font-black ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 pr-6 text-center">
                      <button 
                        onClick={() => handleOpenProcessModal(c)} 
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors border ${
                          c.status === 'Đã giải quyết' 
                            ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50' 
                            : 'bg-[#0f2857] border-[#0f2857] text-white hover:bg-[#1a3873]'
                        }`}
                      >
                        {c.status === 'Đã giải quyết' ? 'Xem lại' : 'Xử lý ngay'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                    <p>Không tìm thấy khiếu nại nào.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminComplain;