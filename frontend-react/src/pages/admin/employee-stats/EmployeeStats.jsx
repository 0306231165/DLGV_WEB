import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmployeeStats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Giả sử dùng baseURL trong axiosClient hoặc fetch thẳng.
      // Do không được sửa axiosClient.js, ta dùng axios trực tiếp hoặc axiosClient.
      // Các page khác có thể đang dùng url localhost:8000.
      const response = await axios.get('http://127.0.0.1:8000/api/admin/employee-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ADMIN_TOKEN') || ''}`
        }
      });
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError('Không thể tải dữ liệu thống kê');
      }
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi khi kết nối tới máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 flex flex-col h-full animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Thống kê Nhân viên</h2>
          <p className="text-sm text-slate-500 mt-1">Tổng quan doanh thu và số ca làm việc của tất cả nhân viên</p>
        </div>
        <button 
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors font-medium text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-rose-500 min-h-[300px]">
          <span className="material-symbols-outlined text-4xl mb-2">error</span>
          <p>{error}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-y border-slate-100">
                <th className="py-4 px-4 font-semibold text-sm text-slate-600 w-16 text-center">ID</th>
                <th className="py-4 px-4 font-semibold text-sm text-slate-600">Nhân viên</th>
                <th className="py-4 px-4 font-semibold text-sm text-slate-600 text-center">Số điện thoại</th>
                <th className="py-4 px-4 font-semibold text-sm text-slate-600 text-center">Trạng thái</th>
                <th className="py-4 px-4 font-semibold text-sm text-slate-600 text-center">Tổng ca làm</th>
                <th className="py-4 px-4 font-semibold text-sm text-slate-600 text-right">Doanh thu tuần</th>
                <th className="py-4 px-4 font-semibold text-sm text-slate-600 text-right">Tổng doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((nv, index) => (
                <tr 
                  key={nv.id} 
                  className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                >
                  <td className="py-3 px-4 text-sm text-slate-500 text-center font-medium">#{nv.id}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={nv.avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm" />
                      <span className="font-semibold text-sm text-slate-800">{nv.ho_ten}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600 text-center font-medium">{nv.so_dien_thoai}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border ${
                      nv.trang_thai === 'HoatDong' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {nv.trang_thai === 'HoatDong' ? 'Hoạt động' : nv.trang_thai}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-sm">
                      {nv.tong_ca_lam_viec}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-bold text-sm text-emerald-600">{formatCurrency(nv.doanh_thu_tuan)}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-bold text-sm text-blue-600">{formatCurrency(nv.tong_doanh_thu_web)}</span>
                  </td>
                </tr>
              ))}
              
              {stats.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <span className="material-symbols-outlined text-4xl mb-3 text-slate-300">inbox</span>
                    <p>Không có dữ liệu nhân viên nào.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeStats;
