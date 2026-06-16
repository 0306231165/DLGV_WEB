import React, { useState, useEffect } from 'react';
import axiosClient from '../../../api/axiosClient'; // Đảm bảo đường dẫn đúng

const AdminDashboard = () => {
  // 1. STATE LƯU DỮ LIỆU ĐƠN HÀNG VÀ LOADING
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. GỌI API LẤY ĐƠN HÀNG TỪ LARAVEL
  const fetchRecentOrders = async () => {
    try {
      setIsLoading(true);
      const response = await axiosClient.get('/admin/recent-orders');
      setRecentOrders(response);
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng gần đây:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  // 3. HELPER: MÀU SẮC CHO TRẠNG THÁI ĐƠN HÀNG
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Hoàn thành':
        return 'bg-emerald-500 text-white';
      case 'Đang chờ':
        return 'bg-amber-400 text-white';
      case 'Đã hủy':
        return 'bg-rose-500 text-white';
      default:
        return 'bg-slate-300 text-slate-800';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-6">Tổng quan hệ thống</h1>

      {/* KHỐI BẢNG ĐƠN HÀNG GẦN ĐÂY */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-blue-600">list_alt</span>
          <h2 className="text-lg font-bold text-slate-800">Đơn hàng gần đây</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 font-semibold">Mã đơn</th>
                <th className="py-4 font-semibold">Khách hàng</th>
                <th className="py-4 font-semibold">Ngày đặt</th>
                <th className="py-4 font-semibold text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-blue-500 font-bold animate-pulse">
                    Đang tải dữ liệu đơn hàng...
                  </td>
                </tr>
              ) : recentOrders.length > 0 ? (
                recentOrders.map((order, index) => (
                  <tr key={index} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-bold text-slate-800">{order.ma_don}</td>
                    <td className="py-4">{order.khach_hang}</td>
                    <td className="py-4 text-slate-500">{order.ngay_dat}</td>
                    <td className="py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(order.trang_thai)}`}>
                        {order.trang_thai}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400">
                    Chưa có đơn hàng nào.
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

export default AdminDashboard;