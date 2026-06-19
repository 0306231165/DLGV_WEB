import React, { useState, useEffect } from 'react';
import axiosClient from '../../../api/axiosClient';

const AdminReports = () => {
  // ================= 1. STATE & LẤY DỮ LIỆU MYSQL =================
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartYear, setChartYear] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axiosClient.get('/admin/reports');
        if (response.success) {
          setReportData(response);
          // Auto select the latest year
          if (response.years_available && response.years_available.length > 0) {
            setChartYear(response.years_available[0].toString());
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu báo cáo:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const activeData = reportData?.yearly_data[chartYear] || {
    chart: [],
    topServices: [],
    detailedServices: []
  };

  const overview = reportData?.overview || {};
  const transactions = reportData?.transactions || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const [showServiceModal, setShowServiceModal] = useState(false);

  // Lọc dữ liệu bảng
  const filteredTransactions = transactions.filter(tr => {
    const matchSearch = tr.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        tr.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'Tất cả' || tr.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Phân trang
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const indexOfLastItem = safeCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Hoàn thành': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Đang xử lý': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Hủy': return 'text-rose-700 bg-rose-50 border-rose-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  useEffect(() => {
    if (showServiceModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showServiceModal]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-[500px] items-center justify-center bg-slate-50/30">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-bold text-slate-500">Đang tải dữ liệu báo cáo...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-50/30 relative">
      {/* ================= KHU VỰC TIÊU ĐỀ ================= */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Doanh thu & Thống kê</h1>
      </div>

      {/* ================= 4 KHỐI THỐNG KÊ TỔNG QUAN ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><span className="material-symbols-outlined text-[20px]">account_balance_wallet</span></div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${overview.monthly_growth >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
              {overview.monthly_growth >= 0 ? '+' : ''}{overview.monthly_growth}%
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng doanh thu</p>
          <h3 className="text-2xl font-black text-slate-800">{new Intl.NumberFormat('vi-VN').format(overview.total_revenue)} <span className="text-sm">đ</span></h3>
          <p className="text-[10px] text-slate-400 mt-2">Đã được thanh toán và hoàn thành</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><span className="material-symbols-outlined text-[20px]">trending_up</span></div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${overview.monthly_growth >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
              {overview.monthly_growth >= 0 ? '+' : ''}{overview.monthly_growth}%
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tăng trưởng tháng</p>
          <h3 className="text-2xl font-black text-slate-800">{overview.monthly_growth}%</h3>
          <p className="text-[10px] text-slate-400 mt-2">So với doanh thu tháng trước</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><span className="material-symbols-outlined text-[20px]">group</span></div>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Khách hàng tích cực</p>
          <h3 className="text-2xl font-black text-slate-800">{new Intl.NumberFormat('vi-VN').format(overview.active_users)}</h3>
          <p className="text-[10px] text-slate-400 mt-2">Hoạt động trong 30 ngày qua</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"><span className="material-symbols-outlined text-[20px]">receipt_long</span></div>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng đơn hàng</p>
          <h3 className="text-2xl font-black text-slate-800">{new Intl.NumberFormat('vi-VN').format(overview.total_orders)}</h3>
          <p className="text-[10px] text-slate-400 mt-2">Tỉ lệ hoàn thành: {overview.completion_rate}%</p>
        </div>
      </div>

      {/* ================= KHU VỰC GIỮA (BIỂU ĐỒ & TOP DỊCH VỤ) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Biểu đồ */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 p-6 flex flex-col">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Biểu đồ tăng trưởng doanh thu</h2>
              <p className="text-xs text-slate-500 mt-1">Số liệu thống kê 6 tháng gần nhất</p>
            </div>
            {/* Bộ lọc đã cập nhật thêm 2 năm 2026 và 2025 */}
            <select 
              value={chartYear} 
              onChange={(e) => setChartYear(e.target.value)} 
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {reportData?.years_available?.map((year) => (
                <option key={year} value={year.toString()}>Năm {year}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 relative flex items-end justify-between gap-2 sm:gap-6 pt-10 pb-6 px-4 border-b border-slate-100">
            <div className="absolute inset-0 flex flex-col justify-between pb-6 pointer-events-none">
              <div className="border-t border-slate-100 border-dashed w-full h-0"></div>
              <div className="border-t border-slate-100 border-dashed w-full h-0"></div>
              <div className="border-t border-slate-100 border-dashed w-full h-0"></div>
              <div className="border-t border-slate-100 border-dashed w-full h-0"></div>
            </div>

            {activeData.chart.map((data, index) => (
              <div key={index} className="relative flex flex-col items-center flex-1 h-full justify-end group z-10">
                <div className="absolute -top-8 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{data.amount}</div>
                <div className={`w-full max-w-[40px] rounded-t-md transition-all duration-500 ${data.isPeak ? 'bg-[#0f2857]' : 'bg-[#e0eafb] group-hover:bg-[#c1d6f8]'}`} style={{ height: `${data.value}%` }}></div>
                <span className="absolute -bottom-6 text-[10px] font-bold text-slate-400">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dịch vụ hàng đầu */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 p-6 flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Dịch vụ hàng đầu ({chartYear})</h2>
            <p className="text-xs text-slate-500 mt-1">Theo số lượng đơn đặt hàng</p>
          </div>

          <div className="space-y-5 flex-1">
            {activeData.topServices.map((service, index) => (
              <div key={index}>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>{service.name}</span>
                  <span>{service.percent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#0f2857] h-full rounded-full transition-all duration-1000" style={{ width: `${service.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setShowServiceModal(true)}
            className="w-full mt-6 py-2.5 bg-white border border-blue-200 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-50 hover:border-blue-300 shadow-sm transition-all flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">analytics</span>
            Xem chi tiết dịch vụ
          </button>
        </div>
      </div>

      {/* ================= BẢNG GIAO DỊCH GẦN ĐÂY ================= */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col flex-1 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800">Giao dịch gần đây</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
              <input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Tìm mã đơn hàng..." className="w-full sm:w-56 pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 focus:outline-none focus:border-blue-500 cursor-pointer">
              <option value="Tất cả">Lọc trạng thái</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Đang xử lý">Đang xử lý</option>
              <option value="Hủy">Đã Hủy</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto flex-1 min-h-[250px]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="py-4 pl-6">Mã Đơn</th>
                <th className="py-4">Khách hàng</th>
                <th className="py-4">Dịch vụ</th>
                <th className="py-4">Ngày thực hiện</th>
                <th className="py-4">Số tiền</th>
                <th className="py-4">Trạng thái</th>
                <th className="py-4 pr-6 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredTransactions.length > 0 ? (
                currentTransactions.map((tr, index) => (
                  <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 pl-6 font-bold text-[#0f2857]">{tr.id}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img src={tr.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        <span className="font-bold text-slate-700">{tr.customer}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-600 font-medium">{tr.service}</td>
                    <td className="py-4 text-slate-500">{tr.date}</td>
                    <td className="py-4 font-black text-slate-800">{tr.amount}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black border ${getStatusStyle(tr.status)}`}>{tr.status}</span>
                    </td>
                    <td className="py-4 pr-6 text-center">
                      <button onClick={() => alert(`Xem chi tiết đơn ${tr.id}`)} className="text-slate-400 hover:text-blue-600 transition-colors"><span className="material-symbols-outlined text-[20px]">more_horiz</span></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-400">
                    <span className="material-symbols-outlined text-3xl mb-2 opacity-50">search_off</span>
                    <p>Không có giao dịch nào phù hợp.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-slate-500 bg-white">
          <span className="font-medium">Hiển thị <strong className="text-slate-800">{filteredTransactions.length === 0 ? 0 : indexOfFirstItem + 1}</strong> trong tổng số <strong className="text-slate-800">{filteredTransactions.length}</strong> giao dịch</span>
          <div className="flex items-center gap-1">
            <button onClick={prevPage} disabled={safeCurrentPage === 1} className={`px-3 py-1.5 rounded-lg font-semibold transition-colors border border-transparent ${safeCurrentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100 hover:border-slate-200 text-slate-600'}`}>Trước</button>
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button key={pageNumber} onClick={() => paginate(pageNumber)} className={`w-8 h-8 flex items-center justify-center rounded-lg font-semibold transition-colors ${safeCurrentPage === pageNumber ? 'bg-[#0f2857] text-white shadow-sm' : 'hover:bg-slate-100 text-slate-600'}`}>{pageNumber}</button>
              );
            })}
            <button onClick={nextPage} disabled={safeCurrentPage === totalPages} className={`px-3 py-1.5 rounded-lg font-semibold transition-colors border border-transparent ${safeCurrentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100 hover:border-slate-200 text-slate-600'}`}>Sau</button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ================= MODAL XEM CHI TIẾT HIỆU SUẤT DỊCH VỤ =================== */}
      {/* ========================================================================= */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header Modal */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">analytics</span>
                  Báo cáo chi tiết dịch vụ ({chartYear})
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Số liệu hiệu suất hoạt động, doanh thu và phản hồi từ khách hàng liên kết theo năm.</p>
              </div>
              <button 
                onClick={() => setShowServiceModal(false)} 
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 border-transparent flex items-center justify-center transition-all shadow-sm"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Content Table */}
            <div className="p-6 overflow-y-auto bg-white flex-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50/70 text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="py-3.5 pl-4">Tên dịch vụ</th>
                      <th className="py-3.5">Tổng đơn đặt</th>
                      <th className="py-3.5">Doanh thu mang lại</th>
                      <th className="py-3.5 pr-4 text-center">Xu hướng trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-semibold">
                    {/* Dữ liệu Modal tự động lấy chuẩn xác theo năm đang lọc */}
                    {activeData.detailedServices.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                        <td className="py-4 pl-4 font-bold text-slate-800">{item.name}</td>
                        <td className="py-4 text-slate-600">{item.orders} đơn</td>
                        <td className="py-4 font-black text-slate-800">{item.revenue}</td>
                        <td className="py-4 pr-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black border ${item.trendColor}`}>
                            {item.trend}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button 
                onClick={() => setShowServiceModal(false)}
                className="px-5 py-2 rounded-xl bg-[#0f2857] hover:bg-[#1a3873] text-white text-sm font-bold shadow-sm transition-colors"
              >
                Đóng cửa sổ
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminReports;