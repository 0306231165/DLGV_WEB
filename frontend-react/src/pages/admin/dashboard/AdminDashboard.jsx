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
    <div className="flex flex-col min-h-full">
      {/* KHU VỰC TIÊU ĐỀ */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Tổng quan hệ thống</h1>
      </div>

      {/* ================= BẢNG ĐƠN HÀNG GẦN ĐÂY ================= */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 p-6 flex-1 flex flex-col">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">list_alt</span>
          Đơn hàng gần đây
        </h2>
        
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/70 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="py-4 pl-4">Mã Đơn</th>
                <th className="py-4">Khách Hàng</th>
                <th className="py-4">Ngày Đặt</th>
                <th className="py-4 text-center">Trạng Thái</th>
                <th className="py-4 pr-4 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600 font-medium">
              {recentOrders.map((order, index) => (
                <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 pl-4 font-bold text-slate-800">{order.id}</td>
                  <td className="py-4">{order.customer}</td>
                  <td className="py-4 text-slate-500">{order.date}</td>
                  <td className="py-4 text-center">
                    <span className={`${order.statusColor} text-white px-3 py-1 rounded-full text-[10px] font-black shadow-sm tracking-wide`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
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