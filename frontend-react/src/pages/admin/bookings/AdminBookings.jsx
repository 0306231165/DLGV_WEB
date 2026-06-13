import React, { useState, useEffect } from 'react';

const AdminBookings = () => {
  // ================= 1. STATE DỮ LIỆU ĐƠN HÀNG =================
  const [orders, setOrders] = useState([
    {
      id: '#CT-8802',
      serviceType: 'Tổng vệ sinh',
      serviceColor: 'bg-blue-600',
      customer: 'Lê Văn Hùng',
      location: 'Quận 7, TP. HCM',
      timeText: 'Hôm nay',
      timeRange: '14:00 - 18:00',
      timeStatus: 'normal',
      status: 'pending',
      worker: null
    },
    {
      id: '#CT-8795',
      serviceType: 'Vệ sinh Máy lạnh',
      serviceColor: 'bg-cyan-500',
      customer: 'Trần Thị Lan',
      location: 'Thảo Điền, Quận 2',
      timeText: 'Ngày mai',
      timeRange: '09:00 - 11:00',
      timeStatus: 'normal',
      status: 'assigned',
      worker: { name: 'Nguyễn Văn An', id: 'W-102', avatar: 'https://i.pravatar.cc/150?img=11' }
    },
    {
      id: '#CT-8780',
      serviceType: 'Chăm sóc sân vườn',
      serviceColor: 'bg-emerald-500',
      customer: 'Phạm Minh Đức',
      location: 'Ciputra, Hà Nội',
      timeText: 'Đang làm việc',
      timeRange: 'Kết thúc trong 45p',
      timeStatus: 'active',
      status: 'in_progress',
      worker: { name: 'Kiều Minh', id: 'W-088', initials: 'KM' }
    },
    {
      id: '#CT-8772',
      serviceType: 'Dọn dẹp sau xây dựng',
      serviceColor: 'bg-rose-500',
      customer: 'Đặng Mai Anh',
      location: 'Quận 1, TP. HCM',
      timeText: 'Bị trễ',
      timeRange: 'Nhân viên chưa đến',
      timeStatus: 'delayed',
      status: 'pending',
      worker: null
    },
    {
      id: '#CT-8765',
      serviceType: 'Dọn dẹp Cơ bản',
      serviceColor: 'bg-blue-400',
      customer: 'Hoàng Nhật Minh',
      location: 'Bình Thạnh, TP. HCM',
      timeText: 'Hôm nay',
      timeRange: '10:00 - 12:00',
      timeStatus: 'normal',
      status: 'completed',
      worker: { name: 'Lê Thị Hoa', id: 'W-045', avatar: 'https://i.pravatar.cc/150?img=32' }
    },
    {
      id: '#CT-8760',
      serviceType: 'Giặt Sofa, Rèm',
      serviceColor: 'bg-purple-500',
      customer: 'Vũ Thanh Hằng',
      location: 'Gò Vấp, TP. HCM',
      timeText: 'Hôm nay',
      timeRange: '15:30 - 17:30',
      timeStatus: 'normal',
      status: 'pending',
      worker: null
    }
  ]);

  // ================= 2. STATE DỮ LIỆU NHÂN VIÊN SẴN SÀNG (ĐÃ CẬP NHẬT ĐỦ 12 NGƯỜI) =================
  const [availableWorkers] = useState([
    { id: 'W-105', name: 'Lê Thị Hoa', role: 'Chuyên viên Vệ sinh', rating: 4.9, distance: '1.2 km', avatar: 'https://i.pravatar.cc/150?img=32' },
    { id: 'W-201', name: 'Trần Tuấn Kiệt', role: 'Vệ sinh Máy lạnh', rating: 4.8, distance: '2.5 km', avatar: 'https://i.pravatar.cc/150?img=53' },
    { id: 'W-088', name: 'Bùi Gia Khiêm', role: 'Dọn dẹp Cơ bản', rating: 4.6, distance: '3.0 km', avatar: 'https://i.pravatar.cc/150?img=51' },
    { id: 'W-302', name: 'Nguyễn Văn An', role: 'Tổng vệ sinh', rating: 5.0, distance: '4.1 km', avatar: 'https://i.pravatar.cc/150?img=11' },
    { id: 'W-405', name: 'Phạm Thị Mai', role: 'Dọn dẹp Khẩn cấp', rating: 4.7, distance: '4.8 km', avatar: 'https://i.pravatar.cc/150?img=44' },
    { id: 'W-512', name: 'Hoàng Quang Huy', role: 'Chăm sóc sân vườn', rating: 4.9, distance: '5.5 km', avatar: 'https://i.pravatar.cc/150?img=15' },
    { id: 'W-618', name: 'Đỗ Mỹ Linh', role: 'Chuyên viên Vệ sinh', rating: 4.5, distance: '6.2 km', avatar: 'https://i.pravatar.cc/150?img=20' },
    { id: 'W-722', name: 'Vũ Văn Đức', role: 'Tổng vệ sinh', rating: 4.8, distance: '7.0 km', avatar: 'https://i.pravatar.cc/150?img=60' },
    { id: 'W-830', name: 'Bùi Thanh Trúc', role: 'Vệ sinh Máy lạnh', rating: 4.7, distance: '8.1 km', avatar: 'https://i.pravatar.cc/150?img=47' },
    { id: 'W-941', name: 'Phan Văn Tài', role: 'Dọn dẹp Cơ bản', rating: 4.9, distance: '9.5 km', avatar: 'https://i.pravatar.cc/150?img=33' },
    { id: 'W-155', name: 'Ngô Thu Thảo', role: 'Chăm sóc sân vườn', rating: 4.6, distance: '10.2 km', avatar: 'https://i.pravatar.cc/150?img=24' },
    { id: 'W-266', name: 'Đinh Phương Nam', role: 'Dọn dẹp Khẩn cấp', rating: 5.0, distance: '11.8 km', avatar: 'https://i.pravatar.cc/150?img=13' },
  ]);

  // ================= 3. STATE UI (TÌM KIẾM, MODAL) =================
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  
  const [showFullMap, setShowFullMap] = useState(false);
  const [assigningOrderId, setAssigningOrderId] = useState(null); 
  
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState({
    customer: '', location: '', date: '', time: '', service: 'Dọn dẹp Khẩn cấp'
  });

  // ================= 4. LOGIC XỬ LÝ BẢNG =================
  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const indexOfLastOrder = safeCurrentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  // ================= 5. CÁC HÀM CHỨC NĂNG =================
  const openAssignModal = (orderId) => {
    setAssigningOrderId(orderId);
  };

  const confirmAssignWorker = (worker) => {
    setOrders(orders.map(order => {
      if (order.id === assigningOrderId) {
        return {
          ...order,
          status: 'assigned',
          timeStatus: 'normal',
          timeText: 'Sắp tới',
          timeRange: 'Đã phân công',
          worker: { name: worker.name, id: worker.id, avatar: worker.avatar }
        };
      }
      return order;
    }));
    setAssigningOrderId(null);
    alert(`✅ Đã phân công đơn ${assigningOrderId} cho nhân sự: ${worker.name}`);
  };

  const getServiceColor = (service) => {
    switch(service) {
      case 'Dọn dẹp Khẩn cấp': return 'bg-orange-500';
      case 'Dọn dẹp Cơ bản': return 'bg-blue-400';
      case 'Tổng vệ sinh': return 'bg-blue-600';
      case 'Vệ sinh Máy lạnh': return 'bg-cyan-500';
      case 'Chăm sóc sân vườn': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  const handleSubmitNewOrder = (e) => {
    e.preventDefault();
    const newOrder = {
      id: `#CT-${Math.floor(Math.random() * 1000) + 9000}`,
      serviceType: newOrderForm.service,
      serviceColor: getServiceColor(newOrderForm.service),
      customer: newOrderForm.customer,
      location: newOrderForm.location,
      timeText: newOrderForm.date,
      timeRange: newOrderForm.time,
      timeStatus: newOrderForm.service === 'Dọn dẹp Khẩn cấp' ? 'delayed' : 'normal',
      status: 'pending',
      worker: null
    };
    
    setOrders([newOrder, ...orders]);
    setIsAddingOrder(false);
    setNewOrderForm({ customer: '', location: '', date: '', time: '', service: 'Dọn dẹp Khẩn cấp' });
  };

  const handleReDispatch = (orderId) => {
    if(window.confirm(`Đơn ${orderId} đang bị trễ do nhân viên không đến. Bạn muốn điều phối lại ngay?`)) {
       openAssignModal(orderId);
    }
  };

  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    assigned: orders.filter(o => o.status === 'assigned').length,
    inProgress: orders.filter(o => o.status === 'in_progress').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  useEffect(() => {
    if (showFullMap || assigningOrderId || isAddingOrder) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showFullMap, assigningOrderId, isAddingOrder]);

  // Render động khối "Nhân sự sẵn sàng"
  const renderAvailableWorkersBlock = () => (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-600">Nhân sự sẵn sàng</h3>
        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
          {availableWorkers.length} Trực tuyến
        </span>
      </div>
      <div className="flex items-center">
        <div className="flex -space-x-3">
          {/* Render 3 người đầu tiên */}
          {availableWorkers.slice(0, 3).map((worker, index) => (
            <img 
              key={index} 
              src={worker.avatar} 
              alt={worker.name} 
              className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" 
            />
          ))}
          {/* Nếu có nhiều hơn 3 người, tính số lượng còn lại để hiển thị dấu + */}
          {availableWorkers.length > 3 && (
            <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 text-slate-500 text-[10px] font-black flex items-center justify-center z-10 shadow-sm">
              +{availableWorkers.length - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-full bg-slate-50/50 relative">
      {/* ================= KHU VỰC TIÊU ĐỀ ================= */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Điều phối đơn hàng</h1>
        <p className="text-sm text-slate-500 mt-1">Giám sát và phân bổ nhân sự cho các yêu cầu dịch vụ theo thời gian thực.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1">
        
        {/* ================= CỘT TRÁI (COL-9): THỐNG KÊ & BẢNG ================= */}
        <div className="xl:col-span-9 flex flex-col gap-6">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex flex-col justify-center relative overflow-hidden group hover:border-orange-200 transition-colors cursor-pointer">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <span className="material-symbols-outlined text-orange-500">pending_actions</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Chờ xử lý</span>
              </div>
              <div className="relative z-10 flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-slate-800">{stats.pending}</h3>
                <span className="text-sm font-bold text-slate-500">Đơn</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex flex-col justify-center relative overflow-hidden group hover:border-blue-200 transition-colors cursor-pointer">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <span className="material-symbols-outlined text-blue-500">person_add</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Đã phân công</span>
              </div>
              <div className="relative z-10 flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-slate-800">{stats.assigned}</h3>
                <span className="text-sm font-bold text-slate-500">Đơn</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex flex-col justify-center relative overflow-hidden group hover:border-purple-200 transition-colors cursor-pointer">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <span className="material-symbols-outlined text-purple-500">autorenew</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Đang thực hiện</span>
              </div>
              <div className="relative z-10 flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-purple-600">{stats.inProgress}</h3>
                <span className="text-sm font-bold text-slate-500">Đang chạy</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex flex-col justify-center relative overflow-hidden group hover:border-emerald-200 transition-colors cursor-pointer">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Đã hoàn thành</span>
              </div>
              <div className="relative z-10 flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-slate-800">{stats.completed}</h3>
                <span className="text-sm font-bold text-slate-500">Hôm nay</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col flex-1 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-800">Hàng đợi điều phối</h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Danh sách</button>
                  <button onClick={() => setViewMode('calendar')} className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Lịch</button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                  <input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Tìm đơn hàng, nhân viên..." className="w-full sm:w-64 pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <button 
                  onClick={() => setIsAddingOrder(true)} 
                  className="w-9 h-9 rounded-lg bg-[#0f2857] hover:bg-[#1a3873] text-white flex items-center justify-center shadow-sm transition-colors" 
                  title="Thêm đơn hàng khẩn cấp"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto flex-1 min-h-[420px]">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50/50 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-4 pl-6">Mã Đơn</th>
                    <th className="py-4">Loại Dịch Vụ</th>
                    <th className="py-4">Khách Hàng & Vị Trí</th>
                    <th className="py-4">Thời Gian Hẹn</th>
                    <th className="py-4 pr-6">Nhân Viên Tiếp Nhận</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {currentOrders.length > 0 ? (
                    currentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors group">
                        <td className="py-4 pl-6 font-bold text-slate-800">{order.id}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${order.serviceColor}`}></span>
                            <span className="font-semibold text-slate-700">{order.serviceType}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <p className="font-bold text-slate-800">{order.customer}</p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{order.location}</p>
                        </td>
                        <td className="py-4">
                          {order.timeStatus === 'active' && (
                            <div>
                              <div className="flex items-center gap-1 text-emerald-600 font-bold mb-0.5">
                                <span className="material-symbols-outlined text-[14px]">play_circle</span>{order.timeText}
                              </div>
                              <p className="text-[11px] text-emerald-600/70 font-medium">{order.timeRange}</p>
                            </div>
                          )}
                          {order.timeStatus === 'delayed' && (
                            <div>
                              <div className="flex items-center gap-1 text-rose-600 font-bold mb-0.5">
                                <span className="material-symbols-outlined text-[14px]">warning</span>{order.timeText}
                              </div>
                              <p className="text-[11px] text-rose-600/70 font-medium">{order.timeRange}</p>
                            </div>
                          )}
                          {order.timeStatus === 'normal' && (
                            <div>
                              <p className="font-bold text-slate-800 mb-0.5">{order.timeText}</p>
                              <p className="text-[11px] text-slate-500 font-medium">{order.timeRange}</p>
                            </div>
                          )}
                        </td>
                        <td className="py-4 pr-6">
                          {order.worker ? (
                            <div className="flex items-center gap-3">
                              {order.worker.avatar ? (
                                <img src={order.worker.avatar} alt="worker" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 text-[10px] font-black flex items-center justify-center border border-slate-200">{order.worker.initials}</div>
                              )}
                              <div>
                                <p className="font-bold text-slate-800 text-xs">{order.worker.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">ID: {order.worker.id}</p>
                              </div>
                            </div>
                          ) : (
                            order.timeStatus === 'delayed' ? (
                              <button 
                                onClick={() => handleReDispatch(order.id)} 
                                className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-[11px] font-bold flex items-center gap-1.5 hover:bg-rose-100 transition-colors w-max"
                              >
                                <span className="material-symbols-outlined text-[14px]">sync_problem</span>Điều phối lại
                              </button>
                            ) : (
                              <button 
                                onClick={() => openAssignModal(order.id)} 
                                className="px-3 py-1.5 border border-dashed border-blue-300 text-blue-600 rounded-lg text-[11px] font-bold flex items-center gap-1.5 hover:bg-blue-50 transition-colors w-max"
                              >
                                <span className="material-symbols-outlined text-[14px]">person_add</span>Phân công ngay
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                        <p>Không tìm thấy đơn hàng nào.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-white">
              <span className="font-medium">
                Hiển thị <strong className="text-slate-800">{filteredOrders.length === 0 ? 0 : indexOfFirstOrder + 1}</strong> - <strong className="text-slate-800">{Math.min(indexOfLastOrder, filteredOrders.length)}</strong> trên <strong className="text-slate-800">{filteredOrders.length}</strong> đơn hàng
              </span>
              <div className="flex items-center gap-1">
                <button onClick={prevPage} disabled={safeCurrentPage === 1} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors border border-transparent ${safeCurrentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100 hover:border-slate-200'}`}><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button key={pageNumber} onClick={() => paginate(pageNumber)} className={`w-8 h-8 flex items-center justify-center rounded-lg font-semibold transition-colors ${safeCurrentPage === pageNumber ? 'bg-[#0f2857] text-white shadow-sm' : 'hover:bg-slate-100 text-slate-600'}`}>{pageNumber}</button>
                  );
                })}
                <button onClick={nextPage} disabled={safeCurrentPage === totalPages} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors border border-transparent ${safeCurrentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100 hover:border-slate-200'}`}><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CỘT PHẢI (COL-3): BẢN ĐỒ & CẢNH BÁO ================= */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          
          {/* Gọi component động đã tách ra */}
          {renderAvailableWorkersBlock()}

          <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 p-5 flex flex-col">
            <h3 className="text-sm font-bold text-slate-600 mb-4">Bản đồ trực tuyến</h3>
            <div className="bg-slate-100 rounded-xl aspect-[4/3] w-full relative mb-4 overflow-hidden border border-slate-200 flex flex-col items-end justify-end p-2">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              <div className="absolute top-[30%] left-[20%] w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>
              <div className="absolute top-[60%] left-[50%] w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-md"></div>
              <div className="absolute top-[60%] left-[65%] w-3 h-3 bg-rose-500 rounded-full border-2 border-white shadow-md animate-bounce"></div>
              <div className="bg-white/90 backdrop-blur text-[10px] font-bold text-slate-600 px-2 py-1 rounded shadow-sm relative z-10">Hiển thị Quận 7</div>
            </div>

            <button 
              onClick={() => setShowFullMap(true)}
              className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center gap-2 mt-auto shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">fullscreen</span>
              Mở bản đồ toàn màn hình
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-slate-600">Cảnh báo hệ thống</h3>
            <div className="bg-rose-50/80 border-l-4 border-rose-500 p-3 rounded-r-xl rounded-l-sm">
              <h4 className="text-xs font-bold text-rose-700 mb-1">Cảnh báo kẹt xe (Quận 1)</h4>
              <p className="text-[10px] text-rose-600/80 font-medium leading-relaxed">Tắc đường nghiêm trọng tại trung tâm Quận 1 có thể làm trễ giờ tới của 4 đơn hàng đang chạy.</p>
            </div>
            <div className="bg-blue-50/80 border-l-4 border-blue-500 p-3 rounded-r-xl rounded-l-sm">
              <h4 className="text-xs font-bold text-blue-700 mb-1">Tăng đột biến yêu cầu</h4>
              <p className="text-[10px] text-blue-600/80 font-medium leading-relaxed">Nhu cầu dọn dẹp tổng vệ sinh tăng 40% trong 2 giờ qua. Đề xuất bật chế độ "Phụ phí giờ cao điểm".</p>
            </div>
          </div>

        </div>
      </div>

      {/* ================= MODAL BẢN ĐỒ TOÀN MÀN HÌNH ================= */}
      {showFullMap && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 md:p-8 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full h-full max-w-7xl flex flex-col overflow-hidden relative">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0f2857] text-white flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[24px]">explore</span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Bản đồ Điều phối Trực tuyến</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p className="text-xs text-slate-500 font-medium">Kết nối thời gian thực (Live Tracking) - Khu vực TP. Hồ Chí Minh</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer">
                  <option>Tất cả Quận/Huyện</option>
                  <option>Quận 1</option>
                  <option>Quận 2 (Thảo Điền)</option>
                  <option>Quận 7 (Phú Mỹ Hưng)</option>
                </select>
                <button onClick={() => setShowFullMap(false)} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 border flex items-center justify-center transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="flex-1 relative bg-slate-100 overflow-hidden flex">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>
              
              <div className="w-64 bg-white/90 backdrop-blur-md border-r border-slate-200/50 p-5 relative z-10 flex flex-col gap-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)] overflow-y-auto">
                 {/* Khối gọi lại Nhân sự sẵn sàng động trong sidebar Map */}
                 {renderAvailableWorkersBlock()}
                 <div className="h-[1px] bg-slate-200/60 w-full"></div>
                 
                 <div>
                   <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                     <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                     Chú giải bản đồ
                   </h3>
                   <div className="space-y-4 text-xs font-bold text-slate-600">
                     <div className="flex items-center gap-3"><span className="w-4 h-4 rounded-full bg-emerald-500 shadow-sm border-[3px] border-white ring-1 ring-slate-200"></span> Nhân sự đang rảnh</div>
                     <div className="flex items-center gap-3"><span className="w-4 h-4 rounded-full bg-blue-500 shadow-sm border-[3px] border-white ring-1 ring-slate-200 animate-pulse"></span> Đang làm việc / Di chuyển</div>
                     <div className="flex items-center gap-3"><span className="w-4 h-4 rounded-full bg-rose-500 shadow-sm border-[3px] border-white ring-1 ring-slate-200"></span> Sự cố / Trễ giờ</div>
                   </div>
                 </div>
                 <div className="h-[1px] bg-slate-200/60 w-full"></div>
                 <div>
                   <h3 className="font-bold text-slate-800 text-sm mb-3">Tìm nhân viên nhanh</h3>
                   <div className="relative">
                     <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">search</span>
                     <input type="text" placeholder="Nhập tên..." className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-500" />
                   </div>
                 </div>
              </div>

              <div className="flex-1 relative cursor-crosshair">
                 <div className="absolute top-[25%] left-[20%] group">
                   <div className="w-5 h-5 bg-emerald-500 rounded-full border-[3px] border-white shadow-lg cursor-pointer transform transition-transform group-hover:scale-125"></div>
                   <div className="absolute top-8 -left-12 bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity w-max pointer-events-none z-20">
                     <p className="text-xs font-bold text-slate-800">Lê Thị Hoa</p>
                     <p className="text-[10px] text-emerald-600 font-medium">Sẵn sàng nhận việc</p>
                   </div>
                 </div>
                 <div className="absolute top-[45%] left-[55%] group">
                   <div className="w-5 h-5 bg-blue-500 rounded-full border-[3px] border-white shadow-lg cursor-pointer animate-bounce"></div>
                   <div className="absolute top-8 -left-16 bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity w-max pointer-events-none z-20">
                     <p className="text-xs font-bold text-slate-800">Kiều Minh (W-088)</p>
                     <p className="text-[10px] text-blue-600 font-medium">Đang trên đường đến Ciputra</p>
                   </div>
                 </div>
                 <div className="absolute top-[65%] left-[35%] group">
                   <div className="w-5 h-5 bg-rose-500 rounded-full border-[3px] border-white shadow-lg cursor-pointer transform transition-transform group-hover:scale-125"></div>
                   <div className="w-12 h-12 bg-rose-500/20 rounded-full absolute -top-3.5 -left-3.5 animate-ping pointer-events-none"></div>
                   <div className="absolute top-8 -left-16 bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity w-max pointer-events-none z-20">
                     <p className="text-xs font-bold text-slate-800">Trần Tuấn Kiệt</p>
                     <p className="text-[10px] text-rose-600 font-medium">Kẹt xe tại Quận 1 - Chậm 15p</p>
                   </div>
                 </div>

                 <div className="absolute bottom-6 right-6 flex flex-col gap-2 bg-white p-1 rounded-xl shadow-lg border border-slate-100 z-10">
                    <button className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"><span className="material-symbols-outlined text-[20px]">add</span></button>
                    <div className="h-[1px] w-6 mx-auto bg-slate-200"></div>
                    <button className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"><span className="material-symbols-outlined text-[20px]">remove</span></button>
                    <div className="h-[1px] w-6 mx-auto bg-slate-200"></div>
                    <button className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors" title="Định vị trung tâm"><span className="material-symbols-outlined text-[20px]">my_location</span></button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL PHÂN CÔNG NHÂN SỰ ================= */}
      {assigningOrderId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Phân công nhân sự</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Đang chọn người cho đơn hàng: <strong className="text-blue-600">{assigningOrderId}</strong></p>
              </div>
              <button onClick={() => setAssigningOrderId(null)} className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-white flex-1">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Nhân sự đang trực tuyến ({availableWorkers.length})</h3>
              <div className="flex flex-col gap-3">
                {availableWorkers.map((worker) => (
                  <div key={worker.id} className="border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={worker.avatar} alt={worker.name} className="w-14 h-14 rounded-full object-cover border border-slate-200 shadow-sm" />
                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{worker.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">badge</span>{worker.role}</p>
                          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                          <p className="text-xs font-bold text-slate-600 flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-amber-400">star</span>{worker.rating}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">directions_run</span>Cách {worker.distance}
                      </p>
                      <button onClick={() => confirmAssignWorker(worker)} className="px-5 py-2 rounded-xl bg-[#0f2857] hover:bg-[#1a3873] text-white text-sm font-bold shadow-sm transition-colors">Chọn người này</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL THÊM ĐƠN HÀNG MỚI ================= */}
      {isAddingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Thêm Đơn hàng mới</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Khởi tạo nhanh một đơn dịch vụ vào hệ thống.</p>
              </div>
              <button onClick={() => setIsAddingOrder(false)} className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitNewOrder} className="p-6 flex flex-col gap-5 bg-white">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tên khách hàng <span className="text-rose-500">*</span></label>
                <input required type="text" value={newOrderForm.customer} onChange={e => setNewOrderForm({...newOrderForm, customer: e.target.value})} placeholder="VD: Nguyễn Văn A" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Địa chỉ làm việc <span className="text-rose-500">*</span></label>
                <input required type="text" value={newOrderForm.location} onChange={e => setNewOrderForm({...newOrderForm, location: e.target.value})} placeholder="VD: Quận 7, TP. HCM" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Loại dịch vụ <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <select value={newOrderForm.service} onChange={e => setNewOrderForm({...newOrderForm, service: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none">
                    <option value="Dọn dẹp Khẩn cấp">🚨 Dọn dẹp Khẩn cấp (Ưu tiên)</option>
                    <option value="Dọn dẹp Cơ bản">🧹 Dọn dẹp Cơ bản</option>
                    <option value="Tổng vệ sinh">✨ Tổng vệ sinh</option>
                    <option value="Vệ sinh Máy lạnh">❄️ Vệ sinh Máy lạnh</option>
                    <option value="Chăm sóc sân vườn">🌿 Chăm sóc sân vườn</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ngày hẹn <span className="text-rose-500">*</span></label>
                  <input required type="text" value={newOrderForm.date} onChange={e => setNewOrderForm({...newOrderForm, date: e.target.value})} placeholder="VD: Hôm nay, 15/10..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Khung giờ <span className="text-rose-500">*</span></label>
                  <input required type="text" value={newOrderForm.time} onChange={e => setNewOrderForm({...newOrderForm, time: e.target.value})} placeholder="VD: 14:00 - 16:00" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400" />
                </div>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 mt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddingOrder(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors">Hủy bỏ</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-[#0f2857] hover:bg-[#1a3873] shadow-sm transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">add_task</span>
                  Tạo đơn hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminBookings;