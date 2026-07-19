import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ServiceStats = () => {
  const getStartOfMonth = () => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  };

  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(getStartOfMonth());
  const [endDate, setEndDate] = useState(getToday());

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/api/admin/service-stats', {
        params: {
          start_date: startDate,
          end_date: endDate
        },
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Thống kê Dịch vụ</h2>
          <p className="text-sm text-slate-500 mt-1">Tổng quan số lượng gói đã đặt và doanh thu theo dịch vụ</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Từ:</span>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Đến:</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button 
            onClick={fetchStats}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors font-medium text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">filter_alt</span>
            Lọc
          </button>
        </div>
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
                <th className="py-4 px-4 font-semibold text-sm text-slate-600">Dịch vụ</th>
                <th className="py-4 px-4 font-semibold text-sm text-slate-600 text-center">Số gói đã đặt</th>
                <th className="py-4 px-4 font-semibold text-sm text-slate-600 text-right">Tổng doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((dv, index) => (
                <tr 
                  key={dv.id} 
                  className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                >
                  <td className="py-3 px-4 text-sm text-slate-500 text-center font-medium">#{dv.id}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm">
                        <span className="material-symbols-outlined text-2xl">{dv.icon || 'cleaning_services'}</span>
                      </div>
                      <span className="font-semibold text-sm text-slate-800">{dv.ten_dich_vu}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-sm">
                      {dv.so_goi_da_dat}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-bold text-sm text-blue-600">{formatCurrency(dv.tong_doanh_thu)}</span>
                  </td>
                </tr>
              ))}
              
              {stats.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-500">
                    <span className="material-symbols-outlined text-4xl mb-3 text-slate-300">inbox</span>
                    <p>Không có dữ liệu dịch vụ nào.</p>
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

export default ServiceStats;
