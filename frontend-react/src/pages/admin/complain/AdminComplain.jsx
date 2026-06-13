import React, { useState } from 'react';

const AdminComplain = () => {
  // ================= 1. STATE DỮ LIỆU =================
  const [complaints, setComplaints] = useState([
    { id: '#FB-1029', date: '12/05/2024', type: 'Thái độ nhân viên', status: 'Đang xử lý' },
    { id: '#FB-1015', date: '08/05/2024', type: 'Chất lượng dịch vụ', status: 'Đã giải quyết' },
    { id: '#FB-0992', date: '25/04/2024', type: 'Lỗi hệ thống', status: 'Pending' },
  ]);

  const [formData, setFormData] = useState({ service: '', orderId: '', problem: '', desc: '' });

  // ================= 2. CÁC HÀM XỬ LÝ LOGIC =================
  const handleSubmit = (e) => {
    e.preventDefault();
    const newComplaint = {
      id: `#FB-${Math.floor(Math.random() * 9000) + 1000}`,
      date: new Date().toLocaleDateString('vi-VN'),
      type: formData.problem,
      status: 'Đang xử lý'
    };
    setComplaints([newComplaint, ...complaints]);
    setFormData({ service: '', orderId: '', problem: '', desc: '' });
    alert("✅ Đã gửi khiếu nại thành công!");
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Đã giải quyết': return 'bg-emerald-100 text-emerald-700';
      case 'Đang xử lý': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ================= CỘT TRÁI (FORM GỬI) ================= */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Gửi Khiếu nại/Góp ý mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600">Loại dịch vụ</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full mt-1 p-2.5 border rounded-lg" 
                    placeholder="Nhập tên dịch vụ..." 
                    value={formData.service}
                    onChange={(e) => setFormData({...formData, service: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">Mã đơn hàng (tùy chọn)</label>
                  <input type="text" className="w-full mt-1 p-2.5 border rounded-lg" placeholder="CT-2024-XXXX" onChange={(e) => setFormData({...formData, orderId: e.target.value})} />
                </div>
              </div>
              
              {/* TRƯỜNG LOẠI VẤN ĐỀ ĐÃ ĐỔI THÀNH INPUT */}
              <div>
                <label className="text-sm font-semibold text-slate-600">Loại vấn đề</label>
                <input 
                  required 
                  type="text" 
                  className="w-full mt-1 p-2.5 border rounded-lg" 
                  placeholder="Nhập vấn đề bạn gặp phải..." 
                  value={formData.problem}
                  onChange={(e) => setFormData({...formData, problem: e.target.value})} 
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600">Mô tả chi tiết</label>
                <textarea required className="w-full mt-1 p-2.5 border rounded-lg h-24" placeholder="Vui lòng mô tả chi tiết vấn đề..." onChange={(e) => setFormData({...formData, desc: e.target.value})}></textarea>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50">
                <span className="material-symbols-outlined text-4xl text-blue-500">cloud_upload</span>
                <p className="text-sm text-slate-500 mt-2">Tải tệp hoặc kéo thả vào đây (PNG, JPG, GIF tối đa 10MB)</p>
              </div>

              <button type="submit" className="bg-[#0f2857] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#1a3873] transition-colors">
                Gửi phản hồi ngay
              </button>
            </form>
          </div>

          {/* ================= BẢNG LỊCH SỬ ================= */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">Lịch sử phản hồi</h2>
              <button className="text-sm font-bold text-slate-500 flex items-center">
                <span className="material-symbols-outlined text-sm mr-1">filter_list</span> Lọc
              </button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs uppercase border-b">
                  <th className="pb-3">ID</th>
                  <th className="pb-3">Ngày gửi</th>
                  <th className="pb-3">Loại vấn đề</th>
                  <th className="pb-3">Trạng thái</th>
                  <th className="pb-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {complaints.map((c, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 font-bold text-blue-700">{c.id}</td>
                    <td className="py-3">{c.date}</td>
                    <td className="py-3">{c.type}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusBadge(c.status)}`}>{c.status}</span>
                    </td>
                    <td className="py-3 font-bold text-blue-600 cursor-pointer underline">Xem chi tiết</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= CỘT PHẢI (QUY TRÌNH & HOTLINE) ================= */}
        <div className="space-y-6">
          <div className="bg-[#0f2857] text-white p-6 rounded-2xl">
            <h2 className="text-lg font-bold mb-4">Quy trình xử lý</h2>
            <div className="space-y-6">
              {[
                { n: '1', title: 'Gửi yêu cầu', desc: 'Điền thông tin khiếu nại vào biểu mẫu.' },
                { n: '2', title: 'Xác minh thông tin', desc: 'Đội ngũ CleanTrust liên hệ trong 24h.' },
                { n: '3', title: 'Đề xuất giải pháp', desc: 'Hoàn tiền, làm lại hoặc bồi thường.' },
                { n: '4', title: 'Hoàn tất & Đóng hồ sơ', desc: 'Giải quyết triệt để vấn đề.' }
              ].map(step => (
                <div key={step.n} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white text-[#0f2857] font-black flex items-center justify-center shrink-0">{step.n}</div>
                  <div>
                    <h4 className="font-bold">{step.title}</h4>
                    <p className="text-xs text-blue-100">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
            <h3 className="font-bold text-slate-800">Cần hỗ trợ gấp?</h3>
            <p className="text-sm text-slate-500 my-4">Đối với các vấn đề khẩn cấp liên quan đến an ninh hoặc thiệt hại tài sản.</p>
            <button className="w-full border-2 border-[#0f2857] text-[#0f2857] font-black py-2 rounded-lg">Hotline: 1900 1234</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminComplain;