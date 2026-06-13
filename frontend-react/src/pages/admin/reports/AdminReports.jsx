import React, { useState, useEffect } from 'react';

const AdminReports = () => {
  // ================= 1. DỮ LIỆU GIẢ LẬP THEO TỪNG NĂM (2021 -> 2026) =================
  
  const yearlyData = {
    '2026': {
      chart: [
        { month: 'TH 1', value: 60, amount: '1.8B' }, { month: 'TH 2', value: 75, amount: '2.3B' },
        { month: 'TH 3', value: 100, amount: '3.4B', isPeak: true }, { month: 'TH 4', value: 80, amount: '2.6B' },
        { month: 'TH 5', value: 85, amount: '2.9B' }, { month: 'TH 6', value: 95, amount: '3.2B' },
      ],
      topServices: [
        { name: 'Vệ sinh máy lạnh', percent: 35 }, { name: 'Giặt ủi & Sofa', percent: 25 },
        { name: 'Vệ sinh nhà cửa', percent: 22 }, { name: 'Trông trẻ & Giúp việc', percent: 13 }, { name: 'Dịch vụ khác', percent: 5 },
      ],
      detailedServices: [
        { name: 'Vệ sinh máy lạnh', orders: '1.680', revenue: '756.000.000 đ', rating: '4.9', trend: 'Dẫn đầu thị trường', trendColor: 'text-purple-700 bg-purple-50 border-purple-100' },
        { name: 'Giặt ủi & Sofa', orders: '1.240', revenue: '396.800.000 đ', rating: '4.8', trend: 'Tăng trưởng mạnh', trendColor: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
        { name: 'Vệ sinh nhà cửa', orders: '1.020', revenue: '867.000.000 đ', rating: '4.7', trend: 'Ổn định', trendColor: 'text-slate-600 bg-slate-50 border-slate-100' },
        { name: 'Trông trẻ & Giúp việc', orders: '580', revenue: '696.000.000 đ', rating: '4.6', trend: 'Bão hòa', trendColor: 'text-orange-700 bg-orange-50 border-orange-100' },
        { name: 'Dịch vụ khác', orders: '250', revenue: '235.000.000 đ', rating: '4.5', trend: 'Ổn định', trendColor: 'text-slate-600 bg-slate-50 border-slate-100' },
      ]
    },
    '2025': {
      chart: [
        { month: 'TH 1', value: 50, amount: '1.5B' }, { month: 'TH 2', value: 60, amount: '1.8B' },
        { month: 'TH 3', value: 85, amount: '2.7B' }, { month: 'TH 4', value: 70, amount: '2.1B' },
        { month: 'TH 5', value: 80, amount: '2.4B' }, { month: 'TH 6', value: 100, amount: '3.2B', isPeak: true },
      ],
      topServices: [
        { name: 'Vệ sinh máy lạnh', percent: 34 }, { name: 'Vệ sinh nhà cửa', percent: 26 },
        { name: 'Giặt ủi & Sofa', percent: 22 }, { name: 'Trông trẻ & Giúp việc', percent: 14 }, { name: 'Dịch vụ khác', percent: 4 },
      ],
      detailedServices: [
        { name: 'Vệ sinh máy lạnh', orders: '1.520', revenue: '684.000.000 đ', rating: '4.9', trend: 'Tăng trưởng mạnh', trendColor: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
        { name: 'Vệ sinh nhà cửa', orders: '1.110', revenue: '943.500.000 đ', rating: '4.8', trend: 'Ổn định', trendColor: 'text-slate-600 bg-slate-50 border-slate-100' },
        { name: 'Giặt ủi & Sofa', orders: '980', revenue: '313.600.000 đ', rating: '4.7', trend: 'Tăng trưởng', trendColor: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
        { name: 'Trông trẻ & Giúp việc', orders: '610', revenue: '732.000.000 đ', rating: '4.6', trend: 'Ổn định', trendColor: 'text-slate-600 bg-slate-50 border-slate-100' },
        { name: 'Dịch vụ khác', orders: '190', revenue: '185.000.000 đ', rating: '4.5', trend: 'Ổn định', trendColor: 'text-slate-600 bg-slate-50 border-slate-100' },
      ]
    },
    '2024': {
      chart: [
        { month: 'TH 1', value: 40, amount: '1.2B' }, { month: 'TH 2', value: 55, amount: '1.6B' },
        { month: 'TH 3', value: 90, amount: '2.8B', isPeak: true }, { month: 'TH 4', value: 65, amount: '1.9B' },
        { month: 'TH 5', value: 75, amount: '2.2B' }, { month: 'TH 6', value: 100, amount: '3.1B' },
      ],
      topServices: [
        { name: 'Vệ sinh máy lạnh', percent: 32 }, { name: 'Vệ sinh nhà cửa', percent: 28 },
        { name: 'Giặt ủi & Sofa', percent: 20 }, { name: 'Trông trẻ & Giúp việc', percent: 15 }, { name: 'Dịch vụ khác', percent: 5 },
      ],
      detailedServices: [
        { name: 'Vệ sinh máy lạnh', orders: '1.350', revenue: '607.500.000 đ', rating: '4.9', trend: 'Tăng trưởng mạnh', trendColor: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
        { name: 'Vệ sinh nhà cửa', orders: '1.180', revenue: '1.003.000.000 đ', rating: '4.8', trend: 'Tăng trưởng', trendColor: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
        { name: 'Giặt ủi & Sofa', orders: '843', revenue: '269.760.000 đ', rating: '4.7', trend: 'Ổn định', trendColor: 'text-slate-600 bg-slate-50 border-slate-100' },
        { name: 'Trông trẻ & Giúp việc', orders: '632', revenue: '758.400.000 đ', rating: '4.6', trend: 'Ổn định', trendColor: 'text-slate-600 bg-slate-50 border-slate-100' },
        { name: 'Dịch vụ khác', orders: '213', revenue: '201.340.000 đ', rating: '4.5', trend: 'Giảm nhẹ', trendColor: 'text-rose-700 bg-rose-50 border-rose-100' },
      ]
    },
    '2023': {
      chart: [
        { month: 'TH 1', value: 30, amount: '900M' }, { month: 'TH 2', value: 45, amount: '1.3B' },
        { month: 'TH 3', value: 60, amount: '1.8B' }, { month: 'TH 4', value: 50, amount: '1.5B' },
        { month: 'TH 5', value: 85, amount: '2.5B', isPeak: true }, { month: 'TH 6', value: 70, amount: '2.1B' },
      ],
      topServices: [
        { name: 'Vệ sinh nhà cửa', percent: 35 }, { name: 'Vệ sinh máy lạnh', percent: 25 },
        { name: 'Trông trẻ & Giúp việc', percent: 20 }, { name: 'Giặt ủi & Sofa', percent: 12 }, { name: 'Dịch vụ khác', percent: 8 },
      ],
      detailedServices: [
        { name: 'Vệ sinh nhà cửa', orders: '1.250', revenue: '1.050.000.000 đ', rating: '4.8', trend: 'Tăng trưởng', trendColor: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
        { name: 'Vệ sinh máy lạnh', orders: '980', revenue: '420.000.000 đ', rating: '4.7', trend: 'Ổn định', trendColor: 'text-slate-600 bg-slate-50 border-slate-100' },
        { name: 'Trông trẻ & Giúp việc', orders: '810', revenue: '950.000.000 đ', rating: '4.8', trend: 'Tăng trưởng mạnh', trendColor: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
        { name: 'Giặt ủi & Sofa', orders: '520', revenue: '160.000.000 đ', rating: '4.5', trend: 'Ổn định', trendColor: 'text-slate-600 bg-slate-50 border-slate-100' },
        { name: 'Dịch vụ khác', orders: '310', revenue: '290.000.000 đ', rating: '4.6', trend: 'Ổn định', trendColor: 'text-slate-600 bg-slate-50 border-slate-100' },
      ]
    },
    '2022': {
      chart: [
        { month: 'TH 1', value: 20, amount: '600M' }, { month: 'TH 2', value: 25, amount: '750M' },
        { month: 'TH 3', value: 40, amount: '1.2B' }, { month: 'TH 4', value: 35, amount: '1.0B' },
        { month: 'TH 5', value: 50, amount: '1.5B', isPeak: true }, { month: 'TH 6', value: 45, amount: '1.3B' },
      ],
      topServices: [
        { name: 'Trông trẻ & Giúp việc', percent: 40 }, { name: 'Vệ sinh nhà cửa', percent: 30 },
        { name: 'Giặt ủi & Sofa', percent: 15 }, { name: 'Vệ sinh máy lạnh', percent: 10 }, { name: 'Dịch vụ khác', percent: 5 },
      ],
      detailedServices: [
        { name: 'Trông trẻ & Giúp việc', orders: '1.100', revenue: '1.200.000.000 đ', rating: '4.9', trend: 'Đỉnh điểm', trendColor: 'text-purple-700 bg-purple-50 border-purple-100' },
        { name: 'Vệ sinh nhà cửa', orders: '850', revenue: '750.000.000 đ', rating: '4.7', trend: 'Ổn định', trendColor: 'text-slate-600 bg-slate-50 border-slate-100' },
        { name: 'Giặt ủi & Sofa', orders: '420', revenue: '130.000.000 đ', rating: '4.6', trend: 'Ổn định', trendColor: 'text-slate-600 bg-slate-50 border-slate-100' },
        { name: 'Vệ sinh máy lạnh', orders: '210', revenue: '85.000.000 đ', rating: '4.4', trend: 'Đang phát triển', trendColor: 'text-blue-700 bg-blue-50 border-blue-100' },
        { name: 'Dịch vụ khác', orders: '150', revenue: '120.000.000 đ', rating: '4.5', trend: 'Ổn định', trendColor: 'text-slate-600 bg-slate-50 border-slate-100' },
      ]
    },
    '2021': {
      chart: [
        { month: 'TH 1', value: 15, amount: '450M' }, { month: 'TH 2', value: 20, amount: '600M' },
        { month: 'TH 3', value: 18, amount: '540M' }, { month: 'TH 4', value: 25, amount: '750M' },
        { month: 'TH 5', value: 22, amount: '660M' }, { month: 'TH 6', value: 35, amount: '1.0B', isPeak: true },
      ],
      topServices: [
        { name: 'Vệ sinh nhà cửa', percent: 50 }, { name: 'Trông trẻ & Giúp việc', percent: 30 },
        { name: 'Giặt ủi & Sofa', percent: 10 }, { name: 'Dịch vụ khác', percent: 6 }, { name: 'Vệ sinh máy lạnh', percent: 4 },
      ],
      detailedServices: [
        { name: 'Vệ sinh nhà cửa', orders: '980', revenue: '820.000.000 đ', rating: '4.6', trend: 'Chủ lực', trendColor: 'text-indigo-700 bg-indigo-50 border-indigo-100' },
        { name: 'Trông trẻ & Giúp việc', orders: '650', revenue: '710.000.000 đ', rating: '4.8', trend: 'Tăng trưởng', trendColor: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
        { name: 'Giặt ủi & Sofa', orders: '210', revenue: '65.000.000 đ', rating: '4.5', trend: 'Mới ra mắt', trendColor: 'text-blue-700 bg-blue-50 border-blue-100' },
        { name: 'Dịch vụ khác', orders: '120', revenue: '80.000.000 đ', rating: '4.4', trend: 'Ổn định', trendColor: 'text-slate-600 bg-slate-50 border-slate-100' },
        { name: 'Vệ sinh máy lạnh', orders: '80', revenue: '35.000.000 đ', rating: '4.2', trend: 'Thử nghiệm', trendColor: 'text-orange-700 bg-orange-50 border-orange-100' },
      ]
    }
  };

  // Dữ liệu Giao dịch gần đây
  const [transactions] = useState([
    { id: '#CT-9042', customer: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?img=11', service: 'Vệ sinh máy lạnh', date: '12/03/2024', amount: '450.000 đ', status: 'Hoàn thành' },
    { id: '#CT-9041', customer: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?img=5', service: 'Giặt ủi & Sofa', date: '12/03/2024', amount: '320.000 đ', status: 'Đang xử lý' },
    { id: '#CT-9040', customer: 'Lê Hoàng C', avatar: 'https://i.pravatar.cc/150?img=12', service: 'Dọn dẹp nhà cửa', date: '11/03/2024', amount: '850.000 đ', status: 'Hoàn thành' },
    { id: '#CT-9039', customer: 'Phạm Thị D', avatar: 'https://i.pravatar.cc/150?img=44', service: 'Vệ sinh máy lạnh', date: '11/03/2024', amount: '200.000 đ', status: 'Hoàn thành' },
    { id: '#CT-9038', customer: 'Hoàng Quang E', avatar: 'https://i.pravatar.cc/150?img=15', service: 'Trông trẻ & Giúp việc', date: '10/03/2024', amount: '1.200.000 đ', status: 'Hủy' },
    { id: '#CT-9037', customer: 'Vũ Văn F', avatar: 'https://i.pravatar.cc/150?img=60', service: 'Vệ sinh nhà cửa', date: '10/03/2024', amount: '350.000 đ', status: 'Đang xử lý' },
    { id: '#CT-9036', customer: 'Đỗ Mỹ G', avatar: 'https://i.pravatar.cc/150?img=20', service: 'Giặt ủi & Sofa', date: '09/03/2024', amount: '400.000 đ', status: 'Hoàn thành' },
  ]);

  // ================= 2. STATES & LOGIC =================
  const [chartYear, setChartYear] = useState('2024');
  const activeData = yearlyData[chartYear];

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
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">+12.5%</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng doanh thu</p>
          <h3 className="text-2xl font-black text-slate-800">2.840.000.000 <span className="text-sm">đ</span></h3>
          <p className="text-[10px] text-slate-400 mt-2">So với 2.520.000.000 đ tháng trước</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><span className="material-symbols-outlined text-[20px]">trending_up</span></div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">+8.2%</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tăng trưởng tháng</p>
          <h3 className="text-2xl font-black text-slate-800">18.4%</h3>
          <p className="text-[10px] text-slate-400 mt-2">Mục tiêu quý: 20%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><span className="material-symbols-outlined text-[20px]">group</span></div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">+420</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Người dùng tích cực</p>
          <h3 className="text-2xl font-black text-slate-800">12.540</h3>
          <p className="text-[10px] text-slate-400 mt-2">Hoạt động trong 30 ngày qua</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"><span className="material-symbols-outlined text-[20px]">receipt_long</span></div>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">-2.1%</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng đơn hàng</p>
          <h3 className="text-2xl font-black text-slate-800">4.218</h3>
          <p className="text-[10px] text-slate-400 mt-2">Tỉ lệ hoàn thành: 94.8%</p>
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
              <option value="2026">Năm 2026</option>
              <option value="2025">Năm 2025</option>
              <option value="2024">Năm 2024</option>
              <option value="2023">Năm 2023</option>
              <option value="2022">Năm 2022</option>
              <option value="2021">Năm 2021</option>
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
                      <th className="py-3.5">Đánh giá trung bình</th>
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
                        <td className="py-4">
                          <div className="flex items-center gap-1 text-slate-700">
                            <span className="material-symbols-outlined text-[16px] text-amber-400 font-bold">star</span>
                            {item.rating} / 5.0
                          </div>
                        </td>
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