import React from 'react';

const AdminDashboard = () => {
  // Dữ liệu giả lập cho Bảng Đơn hàng gần đây
  const recentOrders = [
    { id: 'ADM 0000001', customer: 'Quán Dìun Việc', date: '05/16/2023 15:57:32', status: 'Hoàn thành', statusColor: 'bg-emerald-500' },
    { id: 'ADM 0000002', customer: 'Nguyễn Van', date: '28/07/2023 13:39:38', status: 'Đang chờ', statusColor: 'bg-amber-400' },
    { id: 'ADM 0000003', customer: 'Nguyễn Thành Trần', date: '06/17/2023 10:12:51', status: 'Đã hủy', statusColor: 'bg-rose-500' },
    { id: 'ADM 0000004', customer: 'Quán Dìun Việc', date: '16/08/2023 12:13:45', status: 'Hoàn thành', statusColor: 'bg-emerald-500' },
    { id: 'ADM 0000005', customer: 'Nguyễn Van A', date: '28/07/2025 13:39:38', status: 'Đang chờ', statusColor: 'bg-amber-400' },
  ];

  return (
    <div className="space-y-6">
      
      {/* ================= 1. HÀNG THỐNG KÊ (4 Ô) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Thẻ 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Tổng đơn hàng</p>
            <h3 className="text-2xl font-black text-slate-800">3,450</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
          </div>
        </div>

        {/* Thẻ 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Doanh thu tháng</p>
            <h3 className="text-2xl font-black text-slate-800">450,000,000 VNĐ</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">monetization_on</span>
          </div>
        </div>

        {/* Thẻ 3 */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Nhân viên đang làm việc</p>
            <h3 className="text-2xl font-black text-slate-800">1,200</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">person</span>
          </div>
        </div>

        {/* Thẻ 4 */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Khách hàng mới</p>
            <h3 className="text-2xl font-black text-slate-800">500</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">person_add</span>
          </div>
        </div>
      </div>

      {/* ================= 2. BIỂU ĐỒ DOANH THU ================= */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h2 className="text-lg font-bold text-slate-800">Xu hướng Doanh thu</h2>
          <div className="flex items-center gap-5 text-sm font-medium text-slate-500 mt-2 md:mt-0">
            <div className="flex items-center gap-2">
              <span className="w-6 h-1.5 bg-[#4285F4] rounded-full"></span> Thực tế
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-1.5 bg-[#A1C9F4] rounded-full"></span> Dự kiến
            </div>
          </div>
        </div>

        {/* Khung chứa vẽ biểu đồ mô phỏng SVG */}
        <div className="relative w-full h-[320px]">
          {/* Lưới ngang (Grid) */}
          <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-400 font-medium">
            <div className="flex items-center border-b border-slate-100 pb-1 w-full"><span className="w-24">500,000,000</span></div>
            <div className="flex items-center border-b border-slate-100 pb-1 w-full"><span className="w-24">400,000,000</span></div>
            <div className="flex items-center border-b border-slate-100 pb-1 w-full"><span className="w-24">300,000,000</span></div>
            <div className="flex items-center border-b border-slate-100 pb-1 w-full"><span className="w-24">200,000,000</span></div>
            <div className="flex items-center border-b border-slate-100 pb-1 w-full"><span className="w-24">100,000,000</span></div>
            <div className="flex items-center border-b-2 border-slate-200 pb-1 w-full"><span className="w-24">0</span></div>
          </div>

          <svg className="absolute inset-0 w-full h-full pl-24" preserveAspectRatio="none" viewBox="0 0 1000 300">
            {/* Vùng đổ màu Gradient dưới đường Thực tế */}
            <path d="M 0 280 Q 200 150, 400 220 T 800 180 T 1000 40 L 1000 300 L 0 300 Z" fill="url(#blueGradient)" opacity="0.3" />
            
            {/* Đường line Thực tế (Đậm) */}
            <path d="M 0 280 Q 200 150, 400 220 T 800 180 T 1000 40" fill="none" stroke="#4285F4" strokeWidth="3" />
            <circle cx="0" cy="280" r="4.5" fill="#4285F4" stroke="white" strokeWidth="2" />
            <circle cx="200" cy="180" r="4.5" fill="#4285F4" stroke="white" strokeWidth="2" />
            <circle cx="400" cy="220" r="4.5" fill="#4285F4" stroke="white" strokeWidth="2" />
            <circle cx="600" cy="120" r="4.5" fill="#4285F4" stroke="white" strokeWidth="2" />
            <circle cx="800" cy="180" r="4.5" fill="#4285F4" stroke="white" strokeWidth="2" />
            <circle cx="1000" cy="40" r="4.5" fill="#4285F4" stroke="white" strokeWidth="2" />

            {/* Đường line Dự kiến (Nhạt) */}
            <path d="M 0 250 Q 200 280, 400 150 T 800 100 T 1000 80" fill="none" stroke="#A1C9F4" strokeWidth="3" />
            <circle cx="0" cy="250" r="4.5" fill="#A1C9F4" stroke="white" strokeWidth="2" />
            <circle cx="200" cy="210" r="4.5" fill="#A1C9F4" stroke="white" strokeWidth="2" />
            <circle cx="400" cy="150" r="4.5" fill="#A1C9F4" stroke="white" strokeWidth="2" />
            <circle cx="600" cy="200" r="4.5" fill="#A1C9F4" stroke="white" strokeWidth="2" />
            <circle cx="800" cy="100" r="4.5" fill="#A1C9F4" stroke="white" strokeWidth="2" />
            <circle cx="1000" cy="80" r="4.5" fill="#A1C9F4" stroke="white" strokeWidth="2" />

            {/* Khai báo Gradient */}
            <defs>
              <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4285F4" />
                <stop offset="100%" stopColor="rgba(66, 133, 244, 0)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Trục hoành (Hiển thị text "Tháng") */}
          <div className="absolute bottom-[-30px] left-[96px] right-0 flex justify-between text-xs font-medium text-slate-400">
            <span>Tháng</span>
            <span>Tháng</span>
            <span>Tháng</span>
            <span>Tháng</span>
            <span>Tháng</span>
            <span>Tháng</span>
          </div>
        </div>
      </div>

      {/* ================= 3. BẢNG ĐƠN HÀNG ================= */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Đơn hàng gần đây</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 text-sm font-bold text-slate-800">
                <th className="pb-4 pl-2">Mã Đơn</th>
                <th className="pb-4">Khách Hàng</th>
                <th className="pb-4">Ngày Đặt</th>
                <th className="pb-4">Trạng Thái</th>
                <th className="pb-4 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600 font-medium">
              {recentOrders.map((order, index) => (
                <tr key={index} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-4 pl-2 text-slate-800">{order.id}</td>
                  <td className="py-4">{order.customer}</td>
                  <td className="py-4 text-slate-500">{order.date}</td>
                  <td className="py-4">
                    <span className={`${order.statusColor} text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm tracking-wide`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-center gap-4 text-slate-400">
                      <button className="hover:text-blue-500 transition-colors tooltip" title="Chỉnh sửa">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button className="hover:text-blue-500 transition-colors tooltip" title="Chia sẻ">
                        <span className="material-symbols-outlined text-[18px]">share</span>
                      </button>
                      <button className="hover:text-rose-500 transition-colors tooltip" title="Xóa">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;