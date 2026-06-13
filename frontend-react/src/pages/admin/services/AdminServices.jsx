import React, { useState } from 'react';

const AdminServices = () => {
  // ================= 1. STATE QUẢN LÝ TÌM KIẾM & CẤU HÌNH CHUNG =================
  const [searchTerm, setSearchTerm] = useState('');
  const [defaultSurcharge, setDefaultSurcharge] = useState('20');
  const [nightSurcharge, setNightSurcharge] = useState('50.000');
  const [isStackVoucher, setIsStackVoucher] = useState(true);

  // ================= 2. STATE DỮ LIỆU DỊCH VỤ & KHUYẾN MÃI =================
  const [services, setServices] = useState([
    {
      id: 1, type: 'STANDARD', typeColor: 'text-blue-600 bg-blue-50',
      name: 'Dọn dẹp Cơ bản', desc: 'Phòng khách, bếp, 2 PN',
      price: '350.000', unit: '2 giờ',
      surchargeMode: 'default', 
      customSurcharge: null,
      img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=200&auto=format&fit=crop'
    },
    {
      id: 2, type: 'PREMIUM', typeColor: 'text-purple-600 bg-purple-50',
      name: 'Tổng vệ sinh Chuyên sâu', desc: 'Khử khuẩn, sofa, rèm cửa',
      price: '850.000', unit: '4 giờ',
      surchargeMode: 'default', 
      customSurcharge: null,
      img: 'https://images.unsplash.com/photo-1527515637-640a3e8e2ea5?q=80&w=200&auto=format&fit=crop'
    },
    {
      id: 3, type: 'TECHNICAL', typeColor: 'text-slate-600 bg-slate-100',
      name: 'Vệ sinh Máy lạnh', desc: 'Vệ sinh lưới lọc, gas',
      price: '200.000', unit: 'bộ',
      surchargeMode: 'default', 
      customSurcharge: null,
      img: 'https://images.unsplash.com/photo-1558402529-d2638a7023e9?q=80&w=200&auto=format&fit=crop'
    }
  ]);

  const [promotions, setPromotions] = useState([
    { 
      id: 1, 
      code: 'HAPPY_CLEAN_24', 
      desc: 'Giảm 10% đơn đầu tiên. Còn 45 lượt.', 
      status: 'ĐANG CHẠY', 
      icon: 'percent', 
      bgIcon: 'bg-[#0f2857] text-white', 
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-100' 
    },
    { 
      id: 2, 
      code: 'WEEKEND_SALE', 
      desc: 'Miễn phí phụ phí T7. Hết hạn.', 
      status: 'HẾT HẠN', 
      icon: 'schedule', 
      bgIcon: 'bg-slate-200 text-slate-500', 
      badgeColor: 'text-slate-500 bg-slate-100 border-slate-200' 
    }
  ]);

  // ================= 3. STATE CHO CHẾ ĐỘ CHỈNH SỬA DỊCH VỤ =================
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ price: '', surchargeMode: 'default', customSurcharge: '' });

  const handleEditClick = (svc) => {
    setEditingId(svc.id);
    setEditForm({
      price: svc.price,
      surchargeMode: svc.surchargeMode,
      customSurcharge: svc.customSurcharge || ''
    });
  };

  const handleSaveEdit = (id) => {
    setServices(services.map(s => s.id === id ? {
      ...s,
      price: editForm.price,
      surchargeMode: editForm.surchargeMode,
      customSurcharge: editForm.surchargeMode === 'custom' ? editForm.customSurcharge : null
    } : s));
    setEditingId(null); 
  };

  // ================= 4. CÁC HÀM XỬ LÝ LOGIC DỊCH VỤ & CẤU HÌNH =================
  const filteredServices = services.filter(svc => svc.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAddService = () => {
    const newName = window.prompt("Nhập tên dịch vụ mới:");
    if (newName) {
      const newSvc = {
        id: Date.now(), type: 'NEW', typeColor: 'text-emerald-600 bg-emerald-50',
        name: newName, desc: 'Chưa có mô tả', price: '0', unit: 'lần',
        surchargeMode: 'default', customSurcharge: null,
        img: 'https://images.unsplash.com/photo-1527515637-640a3e8e2ea5?q=80&w=200&auto=format&fit=crop'
      };
      setServices([newSvc, ...services]);
    }
  };

  const handleDeleteService = (id, name) => {
    if(window.confirm(`Xóa dịch vụ "${name}" khỏi hệ thống?`)) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const handleSaveDefault = () => {
    alert(`✅ Đã lưu Cấu hình!\n(Các dịch vụ gán nhãn [MẶC ĐỊNH] sẽ tự động áp dụng phụ phí T7/CN là ${defaultSurcharge}%)`);
  };

  const handleSaveNight = () => {
    alert(`✅ Đã lưu Phụ phí ca tối!\n(Mức phụ phí ca tối mới được áp dụng là ${nightSurcharge}đ)`);
  };

  // ================= 5. CÁC HÀM XỬ LÝ KHUYẾN MÃI =================
  
  const handleAddPromotion = () => {
    const code = window.prompt("Nhập Mã Khuyến Mãi mới (Ví dụ: SUMMER_SALE):");
    if (code) {
      const discount = window.prompt("Nhập mức ưu đãi/mô tả (Ví dụ: Giảm 15% cho đơn đặt phòng khách):");
      const newPromo = {
        id: Date.now(),
        code: code.toUpperCase().replace(/\s/g, '_'), 
        desc: discount || 'Chưa có mô tả chi tiết.',
        status: 'ĐANG CHẠY',
        icon: 'percent',
        bgIcon: 'bg-[#0f2857] text-white',
        badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-100'
      };
      setPromotions([...promotions, newPromo]);
      alert(`✅ Đã thêm mã khuyến mãi ${code.toUpperCase()} thành công!`);
    }
  };

  const handleTogglePromoStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'ĐANG CHẠY' ? 'HẾT HẠN' : 'ĐANG CHẠY';
    
    setPromotions(promotions.map(promo => {
      if (promo.id === id) {
        return {
          ...promo,
          status: nextStatus,
          bgIcon: nextStatus === 'ĐANG CHẠY' ? 'bg-[#0f2857] text-white' : 'bg-slate-200 text-slate-500',
          badgeColor: nextStatus === 'ĐANG CHẠY' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-slate-500 bg-slate-100 border-slate-200'
        };
      }
      return promo;
    }));
  };

  const handleDeletePromotion = (id, code) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa mã khuyến mãi "${code}" không?`)) {
      setPromotions(promotions.filter(p => p.id !== id));
    }
  };

  const activePromosCount = promotions.filter(p => p.status === 'ĐANG CHẠY').length;

  return (
    <div className="flex flex-col min-h-full">
      {/* KHU VỰC TIÊU ĐỀ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dịch vụ & Bảng giá</h1>
          <p className="text-sm text-slate-500 mt-1">Cấu hình chi phí, phụ phí và các chương trình khuyến mãi cho khách hàng.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleAddService}
            className="bg-[#0f2857] hover:bg-[#1a3873] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            Thêm dịch vụ mới
          </button>
        </div>
      </div>

      {/* KHU VỰC CHÍNH (CHIA 2 CỘT) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1">
        
        {/* === CỘT TRÁI (COL-8): DANH SÁCH DỊCH VỤ & KHUYẾN MÃI === */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          
          {/* BOX 1: DANH MỤC DỊCH VỤ */}
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">view_list</span>
                Danh mục dịch vụ
              </h2>
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm dịch vụ..." 
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredServices.length > 0 ? (
                filteredServices.map((svc) => (
                  <div key={svc.id}>
                    {editingId === svc.id ? (
                      /* CHẾ ĐỘ EDIT DỊCH VỤ */
                      <div className="border-2 border-blue-400 bg-blue-50/40 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4 transition-all shadow-sm">
                        <img src={svc.img} alt={svc.name} className="w-24 h-24 rounded-xl object-cover shrink-0 border border-slate-200 opacity-70" />
                        <div className="flex-1 min-w-0">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black tracking-wider mb-1.5 text-blue-600 bg-blue-100">ĐANG CHỈNH SỬA</span>
                          <h3 className="text-base font-bold text-blue-900 truncate">{svc.name}</h3>
                          <p className="text-xs text-slate-500 mt-1 truncate">{svc.desc}</p>
                        </div>
                        <div className="w-32 shrink-0 md:border-l md:border-blue-200 md:pl-4">
                          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1.5">Giá gốc mới</p>
                          <div className="flex items-center gap-1">
                            <input type="text" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} className="w-20 px-2 py-1.5 border-2 border-blue-200 bg-white rounded-lg text-sm font-black text-slate-800 focus:border-blue-600 focus:outline-none" />
                            <span className="text-xs text-slate-500 font-medium">/{svc.unit}</span>
                          </div>
                        </div>
                        <div className="w-40 shrink-0 md:border-l md:border-blue-200 md:pl-4">
                          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1.5">Cơ chế phụ phí</p>
                          <select value={editForm.surchargeMode} onChange={(e) => setEditForm({...editForm, surchargeMode: e.target.value})} className="w-full px-2 py-1.5 mb-1.5 border-2 border-blue-200 bg-white rounded-lg text-[11px] font-bold text-slate-700 focus:border-blue-600 focus:outline-none cursor-pointer" >
                            <option value="default">Dùng Mặc định ({defaultSurcharge}%)</option>
                            <option value="custom">Nhập mức Phụ phí riêng</option>
                            <option value="none">Không áp dụng</option>
                          </select>
                          {editForm.surchargeMode === 'custom' && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-slate-500">+</span>
                              <input type="number" value={editForm.customSurcharge} onChange={(e) => setEditForm({...editForm, customSurcharge: e.target.value})} placeholder="VD: 15" className="w-16 px-2 py-1 border-2 border-purple-300 bg-white rounded text-xs font-black text-slate-800 focus:border-purple-600 focus:outline-none" />
                              <span className="text-xs font-bold text-slate-500">%</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 shrink-0 md:ml-4">
                          <button onClick={() => handleSaveEdit(svc.id)} className="w-20 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors" >Lưu lại</button>
                          <button onClick={() => setEditingId(null)} className="w-20 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors" >Hủy</button>
                        </div>
                      </div>
                    ) : (
                      /* CHẾ ĐỘ XEM DỊCH VỤ */
                      <div className="border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4 hover:border-blue-300 hover:shadow-sm transition-all bg-white">
                        <img src={svc.img} alt={svc.name} className="w-24 h-24 rounded-xl object-cover shrink-0 border border-slate-100" />
                        <div className="flex-1 min-w-0">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black tracking-wider mb-1.5 ${svc.typeColor}`}>{svc.type}</span>
                          <h3 className="text-base font-bold text-slate-800 truncate">{svc.name}</h3>
                          <p className="text-xs text-slate-500 mt-1 truncate">{svc.desc}</p>
                        </div>
                        <div className="h-[1px] w-full bg-slate-100 md:hidden my-2"></div>
                        <div className="w-32 shrink-0 md:border-l md:border-slate-100 md:pl-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Giá gốc</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-black text-slate-800">{svc.price}đ</span>
                            <span className="text-xs text-slate-500 font-medium">/{svc.unit}</span>
                          </div>
                        </div>
                        <div className="w-36 shrink-0 md:border-l md:border-slate-100 md:pl-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phụ phí T7/CN</p>
                          {svc.surchargeMode !== 'none' ? (
                            <div className="flex flex-col items-start gap-1">
                              <span className={`text-sm font-black ${svc.surchargeMode === 'default' ? 'text-blue-600' : 'text-purple-600'}`}>
                                +{svc.surchargeMode === 'default' ? defaultSurcharge : svc.customSurcharge}%
                              </span>
                              {svc.surchargeMode === 'default' ? (
                                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 text-[8px] font-black border border-blue-100">MẶC ĐỊNH</span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 text-[8px] font-black border border-purple-100">TÙY CHỈNH</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-slate-400">Không áp dụng</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 md:ml-4">
                          <button onClick={() => handleEditClick(svc)} className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 transition-colors tooltip" title="Chỉnh sửa dịch vụ này" ><span className="material-symbols-outlined text-[20px]">edit</span></button>
                          <button onClick={() => handleDeleteService(svc.id, svc.name)} className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-colors tooltip" title="Xóa dịch vụ" ><span className="material-symbols-outlined text-[20px]">delete</span></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                  <p>Không tìm thấy dịch vụ nào phù hợp.</p>
                </div>
              )}
            </div>
          </div>

          {/* ================= BOX 2: KHUYẾN MÃI & MÃ GIẢM GIÁ ================= */}
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">redeem</span>
                Khuyến mãi & Mã giảm giá
              </h2>
              <button 
                onClick={handleAddPromotion}
                className="text-sm font-black text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Thêm mã mới
              </button>
            </div>

            {promotions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promotions.map((promo) => (
                  <div key={promo.id} className="border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow bg-white group">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${promo.bgIcon}`}>
                      <span className="material-symbols-outlined text-[24px]">{promo.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-slate-800 truncate">{promo.code}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate font-medium">{promo.desc}</p>
                    </div>
                    
                    {/* CỤM NÚT TRẠNG THÁI VÀ XÓA */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => handleTogglePromoStatus(promo.id, promo.status)}
                        className={`px-2 py-1 rounded text-[10px] font-black tracking-wide border cursor-pointer select-none transition-all duration-300 hover:scale-105 active:scale-95 ${promo.badgeColor}`}
                        title="Bấm để đổi trạng thái"
                      >
                        {promo.status}
                      </button>
                      
                      <button 
                        onClick={() => handleDeletePromotion(promo.id, promo.code)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-60 group-hover:opacity-100"
                        title="Xóa mã khuyến mãi này"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Màn hình trống nếu đã xóa hết Khuyến mãi
              <div className="py-8 text-center text-slate-400 border border-slate-100 border-dashed rounded-xl bg-slate-50/50">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-40">loyalty</span>
                <p className="text-sm font-medium">Chưa có mã khuyến mãi nào trong hệ thống.</p>
              </div>
            )}
          </div>

        </div>

        {/* === CỘT PHẢI (COL-4): CẤU HÌNH & TÓM TẮT === */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* BOX CẤU HÌNH CHUNG */}
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Cấu hình chung</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Phụ phí mặc định (T7 & CN)</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input type="number" value={defaultSurcharge} onChange={(e) => setDefaultSurcharge(e.target.value)} className="w-full pl-4 pr-8 py-2.5 bg-blue-50/50 border border-blue-200 text-blue-700 rounded-xl font-black focus:outline-none focus:border-blue-500 transition-colors" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 font-black">%</span>
                  </div>
                  <button onClick={handleSaveDefault} className="w-12 h-[46px] rounded-xl bg-[#0f2857] hover:bg-[#1a3873] text-white flex items-center justify-center shadow-sm transition-colors" ><span className="material-symbols-outlined text-[20px]">save</span></button>
                </div>
                <p className="text-[11px] text-slate-400 italic mt-2">Tự động áp dụng cho các dịch vụ đang dùng nhãn <strong className="text-blue-500 font-black">MẶC ĐỊNH</strong>.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Phụ phí ca tối (Sau 18:00)</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input type="text" value={nightSurcharge} onChange={(e) => setNightSurcharge(e.target.value)} className="w-full pl-4 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-blue-500 transition-colors" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">đ</span>
                  </div>
                  <button onClick={handleSaveNight} className="w-12 h-[46px] rounded-xl bg-[#0f2857] hover:bg-[#1a3873] text-white flex items-center justify-center shadow-sm transition-colors" ><span className="material-symbols-outlined text-[20px]">save</span></button>
                </div>
              </div>

              <div className="h-[1px] w-full bg-slate-100 my-2"></div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Chế độ Ưu đãi Hệ thống</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Cho phép cộng dồn Voucher</p>
                </div>
                <div onClick={() => setIsStackVoucher(!isStackVoucher)} className={`w-11 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors duration-300 ${isStackVoucher ? 'bg-[#0f2857]' : 'bg-slate-300'}`} >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-transform duration-300 ${isStackVoucher ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </div>
              </div>
            </div>
          </div>

          {/* BOX TÓM TẮT DỊCH VỤ */}
          <div className="bg-[#0f2857] rounded-2xl shadow-md p-6 text-white relative overflow-hidden mt-auto">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -translate-y-10 translate-x-10 pointer-events-none"></div>
            <h3 className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-5">Tóm tắt dịch vụ</h3>
            <div className="flex divide-x divide-blue-800/50 mb-6">
              <div className="flex-1 pr-4">
                <h2 className="text-3xl font-black mb-1">{services.length < 10 ? `0${services.length}` : services.length}</h2>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider leading-snug">Dịch vụ đang<br/>mở</p>
              </div>
              <div className="flex-1 pl-4">
                <h2 className="text-3xl font-black mb-1">{activePromosCount < 10 ? `0${activePromosCount}` : activePromosCount}</h2>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider leading-snug">Khuyến mãi<br/>đang chạy</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-blue-200 italic pt-4 border-t border-blue-800/50">
              <span className="material-symbols-outlined text-[14px]">info</span>Lần cập nhật bảng giá cuối: vừa xong
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminServices;