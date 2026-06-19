import React, { useState, useEffect } from 'react';
import axiosClient from '../../../api/axiosClient';

const AdminServices = () => {
  // ================= 1. STATE QUẢN LÝ TÌM KIẾM & CẤU HÌNH CHUNG =================
  const [searchTerm, setSearchTerm] = useState('');
  const [phuPhiList, setPhuPhiList] = useState([]);       // danh sách quy định phụ phí từ DB
  const [editingPhuPhi, setEditingPhuPhi] = useState({}); // { [id]: gia_tri_phu_phi }
  const [savingId, setSavingId] = useState(null);         // id đang được lưu

  // ================= 2. STATE DỮ LIỆU DỊCH VỤ & KHUYẾN MÃI =================
  const [services, setServices] = useState([]);
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resServices, resPromos, resPhuPhi] = await Promise.all([
        axiosClient.get('/admin/dich-vu'),
        axiosClient.get('/admin/khuyen-mai'),
        axiosClient.get('/admin/quy-dinh-phu-phi'),
      ]);
      if (resServices.success) setServices(resServices.data);
      if (resPromos.success) setPromotions(resPromos.data);
      if (resPhuPhi.success) {
        setPhuPhiList(resPhuPhi.data);
        // Khởi tạo state chỉnh sửa
        const initEdit = {};
        resPhuPhi.data.forEach(pp => { initEdit[pp.id] = String(pp.gia_tri_phu_phi); });
        setEditingPhuPhi(initEdit);
      }
    } catch (error) {
      console.error('Lỗi khi fetch dữ liệu:', error);
    }
  };

  const handleSavePhuPhi = async (id) => {
    setSavingId(id);
    try {
      await axiosClient.put(`/admin/quy-dinh-phu-phi/${id}`, {
        gia_tri_phu_phi: editingPhuPhi[id]
      });
      await fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi khi lưu phụ phí');
    } finally {
      setSavingId(null);
    }
  };

  // ================= 3. STATE CHO CHẾ ĐỘ CHỈNH SỬA DỊCH VỤ =================
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ price: '' });

  const handleEditClick = (svc) => {
    setEditingId(svc.id);
    setEditForm({ price: svc.don_gia_co_ban || '' });
  };

  const handleSaveEdit = async (id) => {
    try {
      await axiosClient.put(`/admin/dich-vu/${id}`, {
        don_gia_co_ban: editForm.price
      });
      setEditingId(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi sửa dịch vụ');
    }
  };

  const filteredServices = services.filter(svc => 
    svc.ten_dich_vu && svc.ten_dich_vu.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteService = async (id, name) => {
    if(window.confirm(`Xóa dịch vụ "${name}" khỏi hệ thống?`)) {
      try {
        await axiosClient.delete(`/admin/dich-vu/${id}`);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || 'Có lỗi khi xóa dịch vụ');
      }
    }
  };

  // ================= 4. CÁC HÀM XỬ LÝ KHUYẾN MÃI (MODAL) =================
  const PROMO_TAGS = ['Khuyến mãi', 'Gia đình', 'Nội thất', 'Doanh nghiệp', 'Tổng vệ sinh', 'Khách mới', 'Đặc biệt', 'Theo mùa'];

  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoForm, setPromoForm] = useState({
    code: '', tag: 'Khuyến mãi', title: '', desc: '', discountType: 'PhanTram', discountValue: '',
    limit: '', totalLimit: '', startDate: '', expiryDate: ''
  });

  const resetPromoForm = () => setPromoForm({
    code: '', tag: 'Khuyến mãi', title: '', desc: '', discountType: 'PhanTram', discountValue: '',
    limit: '', totalLimit: '', startDate: '', expiryDate: ''
  });

  const handleSubmitPromo = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/admin/khuyen-mai/them', {
        ma_code: promoForm.code,
        tag_hien_thi: promoForm.tag,
        tieu_de: promoForm.title,
        mo_ta: promoForm.desc,
        loai_giam_gia: promoForm.discountType,
        gia_tri_giam: promoForm.discountValue,
        tong_luot_luu_toi_da: promoForm.limit || 100,
        tong_luot_dung_toi_da_toan_san: promoForm.totalLimit || 100,
        ngay_bat_dau: promoForm.startDate,
        ngay_ket_thuc: promoForm.expiryDate
      });
      setShowPromoModal(false);
      resetPromoForm();
      fetchData();
      alert(`✅ Đã thêm mã khuyến mãi thành công!`);
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi thêm khuyến mãi');
    }
  };

  const handleTogglePromoStatus = async (id) => {
    try {
      await axiosClient.put(`/admin/khuyen-mai/${id}/trang-thai`);
      fetchData();
    } catch (error) {
      alert('Lỗi cập nhật trạng thái');
    }
  };

  const handleDeletePromotion = async (id, code) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa mã khuyến mãi "${code}" không?`)) {
      try {
        await axiosClient.delete(`/admin/khuyen-mai/${id}`);
        fetchData();
      } catch (error) {
        alert('Lỗi xóa khuyến mãi');
      }
    }
  };

  const activePromosCount = promotions.filter(p => p.trang_thai).length;

  // ================= 5. HÀM XỬ LÝ THÊM DỊCH VỤ MỚI (MODAL) =================
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: '', type: 'TieuChuan', desc: '', price: '', time: '120', groupId: 1, noiDungChiTiet: ''
  });

  const handleSubmitService = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/admin/dich-vu/them', {
        nhom_dich_vu_id: serviceForm.groupId,
        ten_dich_vu: serviceForm.name,
        cap_do_dich_vu: serviceForm.type,
        don_gia_co_ban: serviceForm.price,
        thoi_gian_chuan_co_ban: serviceForm.time,
        mo_ta: serviceForm.desc,
        noi_dung_chi_tiet: serviceForm.noiDungChiTiet ? serviceForm.noiDungChiTiet.split('\n').map(item => item.trim()).filter(item => item !== '') : [],
        co_bien_the: false
      });
      setShowServiceModal(false);
      setServiceForm({ name: '', type: 'TieuChuan', desc: '', price: '', time: '120', groupId: 1, noiDungChiTiet: '' });
      fetchData();
      alert(`✅ Đã thêm dịch vụ thành công!`);
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi thêm dịch vụ');
    }
  };

  return (
    <div className="flex flex-col min-h-full p-6 bg-gradient-to-br from-slate-50 to-blue-50/30">
      
      {/* ================= MODAL THÊM DỊCH VỤ MỚI ================= */}
      {showServiceModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all">
          <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in scale-100">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
                  <span className="material-symbols-outlined text-xl">cleaning_services</span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800 tracking-tight">Thêm Dịch vụ Mới</h2>
                  <p className="text-xs text-slate-500 font-medium">Khởi tạo gói dịch vụ cho khách hàng</p>
                </div>
              </div>
              <button onClick={() => setShowServiceModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/80 border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmitService} className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên dịch vụ <span className="text-rose-500">*</span></label>
                  <input type="text" required placeholder="VD: Dọn dẹp nhà sau xây dựng" value={serviceForm.name} onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Phân loại</label>
                  <select value={serviceForm.type} onChange={(e) => setServiceForm({...serviceForm, type: e.target.value})} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all">
                    <option value="TieuChuan">Tiêu chuẩn</option>
                    <option value="CaoCap">Cao cấp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mô tả chi tiết <span className="text-rose-500">*</span></label>
                <textarea required placeholder="Mô tả công việc thực hiện..." rows="2" value={serviceForm.desc} onChange={(e) => setServiceForm({...serviceForm, desc: e.target.value})} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nội dung chi tiết <span className="text-rose-500">*</span> <span className="text-[10px] text-slate-400 font-normal">(Mỗi dòng một mục)</span></label>
                <textarea required placeholder="- Quét mạng nhện trần nhà&#10;- Hút bụi sàn nhà&#10;- Lau kính cửa sổ..." rows="3" value={serviceForm.noiDungChiTiet} onChange={(e) => setServiceForm({...serviceForm, noiDungChiTiet: e.target.value})} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"></textarea>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Mức giá <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <input type="number" required placeholder="500000" value={serviceForm.price} onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})} className="w-full pl-3 pr-8 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-black text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">VNĐ</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Thời gian <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <input type="number" required placeholder="120" value={serviceForm.time} onChange={(e) => setServiceForm({...serviceForm, time: e.target.value})} className="w-full pl-3 pr-10 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-black text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">phút</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Nhóm DV <span className="text-rose-500">*</span></label>
                  <input type="number" required placeholder="1" value={serviceForm.groupId} onChange={(e) => setServiceForm({...serviceForm, groupId: e.target.value})} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>

              <div className="pt-2 flex gap-3 mt-2">
                <button type="button" onClick={() => setShowServiceModal(false)} className="flex-1 py-2.5 rounded-xl text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 text-sm transition-colors">Hủy bỏ</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md shadow-blue-500/20 hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">add_task</span>
                  Tạo Dịch Vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL THÊM KHUYẾN MÃI ================= */}
      {showPromoModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all">
          <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in scale-100">

            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-rose-50/50 to-orange-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-sm shadow-rose-500/30">
                  <span className="material-symbols-outlined text-xl">local_offer</span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800 tracking-tight">Tạo Voucher</h2>
                  <p className="text-xs text-slate-500 font-medium">Khởi tạo mã giảm giá mới cho hệ thống</p>
                </div>
              </div>
              <button onClick={() => { setShowPromoModal(false); resetPromoForm(); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/80 border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitPromo} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">

              {/* Row 1: Mã code + Tag hiển thị */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mã Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text" required
                    placeholder="VD: SUMMER25"
                    value={promoForm.code}
                    onChange={(e) => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})}
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all tracking-widest"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tag hiển thị <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={promoForm.tag}
                    onChange={(e) => setPromoForm({...promoForm, tag: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer transition-all"
                  >
                    {PROMO_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 2: Tiêu đề */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tiêu đề <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text" required
                  placeholder="VD: Giảm 25% cho đơn từ 500.000đ"
                  value={promoForm.title}
                  onChange={(e) => setPromoForm({...promoForm, title: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>

              {/* Row 2.5: Mô tả */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mô tả
                </label>
                <textarea
                  placeholder="Mô tả chi tiết về điều kiện áp dụng..." rows="2"
                  value={promoForm.desc}
                  onChange={(e) => setPromoForm({...promoForm, desc: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none transition-all"
                ></textarea>
              </div>

              {/* Row 3: Loại ưu đãi + Giá trị giảm */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Loại ưu đãi</label>
                  <select
                    value={promoForm.discountType}
                    onChange={(e) => setPromoForm({...promoForm, discountType: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer transition-all"
                  >
                    <option value="PhanTram">Phần trăm (%)</option>
                    <option value="TienMat">Tiền mặt (đ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Giá trị giảm <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <input
                      type="number" required min="0"
                      placeholder={promoForm.discountType === 'PhanTram' ? '10' : '50000'}
                      value={promoForm.discountValue}
                      onChange={(e) => setPromoForm({...promoForm, discountValue: e.target.value})}
                      className="w-full pl-3 pr-8 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-black text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      {promoForm.discountType === 'PhanTram' ? '%' : 'đ'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 4: Giới hạn / KH + Tổng số lượt */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Giới hạn / KH</label>
                  <input
                    type="number" min="1" placeholder="Lượt lưu tối đa (mặc định 100)"
                    value={promoForm.limit}
                    onChange={(e) => setPromoForm({...promoForm, limit: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Tổng số lượt dùng</label>
                  <input
                    type="number" min="1" placeholder="Tổng mã (mặc định 100)"
                    value={promoForm.totalLimit}
                    onChange={(e) => setPromoForm({...promoForm, totalLimit: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  />
                </div>
              </div>

              {/* Row 5: Ngày bắt đầu + Ngày kết thúc */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Bắt đầu <span className="text-rose-500">*</span></label>
                  <input
                    type="date" required
                    value={promoForm.startDate}
                    onChange={(e) => setPromoForm({...promoForm, startDate: e.target.value})}
                    className="w-full px-2 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Kết thúc <span className="text-rose-500">*</span></label>
                  <input
                    type="date" required
                    value={promoForm.expiryDate}
                    onChange={(e) => setPromoForm({...promoForm, expiryDate: e.target.value})}
                    className="w-full px-2 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer transition-all"
                  />
                </div>
              </div>

              {/* Preview badge */}
              {(promoForm.tag || promoForm.title) && (
                <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 rounded-xl p-3">
                  <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1.5">Xem trước</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-100 text-rose-600 border border-rose-200 uppercase tracking-wider">
                      {promoForm.tag || 'Tag'}
                    </span>
                    <span className="text-xs font-bold text-slate-700 truncate">{promoForm.title || 'Tiêu đề voucher'}</span>
                  </div>
                  <p className="text-[10px] font-black text-rose-600 mt-1">
                    {promoForm.code || 'MA_CODE'} · Giảm {promoForm.discountValue || '0'}{promoForm.discountType === 'PhanTram' ? '%' : 'đ'}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="pt-1 flex gap-3">
                <button type="button" onClick={() => { setShowPromoModal(false); resetPromoForm(); }}
                  className="flex-1 py-2.5 rounded-xl text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 text-sm transition-colors">
                  Hủy bỏ
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold shadow-md shadow-rose-500/20 hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  Tạo Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= GIAO DIỆN CHÍNH ================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100/50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Quản trị dịch vụ
          </div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight mb-1">Dịch vụ & Bảng giá</h1>
          <p className="text-sm text-slate-500 font-medium max-w-md">Cấu hình gói dịch vụ làm sạch, chi phí phụ thu và các mã khuyến mãi.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowServiceModal(true)} className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 text-sm">
            <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span className="material-symbols-outlined text-[18px]">add_box</span>
            Thêm dịch vụ mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 relative z-10">
        
        {/* === CỘT TRÁI (COL-8): DANH SÁCH DỊCH VỤ & KHUYẾN MÃI === */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          
          {/* BOX 1: DANH MỤC DỊCH VỤ */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.03)] border border-white p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                  <span className="material-symbols-outlined text-base">view_list</span>
                </div>
                Danh mục dịch vụ
              </h2>
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input 
                  type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm kiếm dịch vụ..." 
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredServices.length > 0 ? (
                filteredServices.map((svc) => (
                  <div key={svc.id} className="group relative">
                    {editingId === svc.id ? (
                      /* CHẾ ĐỘ EDIT DỊCH VỤ */
                      <div className="bg-blue-50/50 border border-blue-300 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 transition-all shadow-sm transform scale-[1.01] z-10 relative">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shrink-0 flex items-center justify-center text-white text-2xl font-black shadow-inner">
                          {svc.ten_dich_vu.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black tracking-wider text-blue-700 bg-blue-100 animate-pulse">ĐANG SỬA</span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-800 truncate">{svc.ten_dich_vu}</h3>
                        </div>
                        <div className="w-36 shrink-0 md:border-l md:border-blue-200 md:pl-4">
                          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Giá gốc mới</p>
                          <input type="text" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} className="w-full px-2.5 py-1.5 border border-blue-300 bg-white rounded-lg text-sm font-black text-blue-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" autoFocus />
                        </div>
                        
                        <div className="flex flex-col gap-1.5 shrink-0 md:ml-3">
                          <button onClick={() => handleSaveEdit(svc.id)} className="w-20 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all" >Lưu</button>
                          <button onClick={() => setEditingId(null)} className="w-20 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all" >Hủy</button>
                        </div>
                      </div>
                    ) : (
                      /* CHẾ ĐỘ XEM DỊCH VỤ */
                      <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 hover:border-blue-200 hover:shadow-[0_4px_15px_rgb(59,130,246,0.05)] transition-all duration-300 cursor-default">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 shrink-0 border border-slate-200/50 flex items-center justify-center text-slate-400 text-2xl font-black group-hover:from-blue-100 group-hover:to-indigo-100 group-hover:text-blue-500 group-hover:border-blue-200 transition-all duration-300">
                          {svc.ten_dich_vu.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase ${svc.cap_do_dich_vu === 'CaoCap' ? 'text-amber-700 bg-amber-100 border border-amber-200' : 'text-blue-700 bg-blue-100 border border-blue-200'}`}>{svc.cap_do_dich_vu}</span>
                            {svc.is_noi_bat && <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase text-rose-600 bg-rose-100 border border-rose-200"><span className="material-symbols-outlined text-[10px] mr-0.5">star</span>Nổi bật</span>}
                          </div>
                          <h3 className="text-sm font-bold text-slate-800 truncate mb-0.5 group-hover:text-blue-700 transition-colors">{svc.ten_dich_vu}</h3>
                          <p className="text-xs text-slate-500 line-clamp-1 group-hover:text-slate-600 transition-colors">{svc.mo_ta}</p>
                        </div>
                        <div className="h-[1px] w-full bg-slate-100 md:hidden my-1"></div>
                        <div className="w-28 shrink-0 md:border-l md:border-slate-100 md:pl-4 flex flex-col justify-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mức giá</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-black text-slate-800 group-hover:text-blue-600 transition-colors">{Number(svc.don_gia_co_ban).toLocaleString('vi-VN')}</span>
                            <span className="text-xs font-bold text-slate-400">đ</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0 md:ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button onClick={() => handleEditClick(svc)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm" title="Chỉnh sửa"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                          <button onClick={() => handleDeleteService(svc.id, svc.ten_dich_vu)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm" title="Xóa"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-10 text-center bg-white rounded-xl border border-slate-100 border-dashed">
                  <div className="w-12 h-12 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-2xl text-slate-300">search_off</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-0.5">Không tìm thấy kết quả</h3>
                  <p className="text-xs text-slate-500">Thử thay đổi từ khóa tìm kiếm của bạn.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* BOX 2: KHUYẾN MÃI & MÃ GIẢM GIÁ */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.03)] border border-white p-5 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 shadow-inner">
                  <span className="material-symbols-outlined text-base">redeem</span>
                </div>
                Voucher & Khuyến mãi
              </h2>
              <button onClick={() => setShowPromoModal(true)} className="group bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-1.5 border border-rose-100 hover:border-rose-500 shadow-sm">
                <span className="material-symbols-outlined text-[16px]">add</span>
                Tạo mã
              </button>
            </div>

            {promotions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promotions.map((promo) => (
                  <div key={promo.id} className="relative bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-rose-300 hover:shadow-[0_4px_15px_rgb(225,29,72,0.05)] transition-all duration-300 group overflow-hidden">
                    <div className="flex items-start gap-3 mb-3 relative z-10">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm ${promo.trang_thai ? 'bg-gradient-to-br from-rose-500 to-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <span className="material-symbols-outlined text-[20px]">{promo.loai_giam_gia === 'PhanTram' ? 'percent' : 'payments'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${promo.trang_thai ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                          <span className={`text-[9px] font-black uppercase tracking-wider ${promo.trang_thai ? 'text-emerald-600' : 'text-slate-500'}`}>{promo.trang_thai ? 'ĐANG CHẠY' : 'ĐÃ TẮT'}</span>
                        </div>
                        <h4 className="text-sm font-black text-slate-800 truncate">{promo.ma_code}</h4>
                        <p className="text-xs text-slate-500 font-medium truncate">{promo.tieu_de}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 relative z-10">
                      <div className="text-[10px] text-slate-400 font-medium">
                        <span className="material-symbols-outlined text-[12px] inline-block align-text-bottom mr-1">event</span>
                        {promo.ngay_bat_dau} - {promo.ngay_ket_thuc}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleTogglePromoStatus(promo.id)} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${promo.trang_thai ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100'}`} title={promo.trang_thai ? 'Tạm ngưng mã' : 'Kích hoạt lại'}>
                          <span className="material-symbols-outlined text-[16px]">{promo.trang_thai ? 'pause' : 'play_arrow'}</span>
                        </button>
                        <button onClick={() => handleDeletePromotion(promo.id, promo.ma_code)} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-rose-50/30 rounded-xl border border-rose-100 border-dashed">
                <div className="w-10 h-10 mx-auto bg-rose-100 rounded-full flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-xl text-rose-400">loyalty</span>
                </div>
                <h3 className="text-sm font-bold text-slate-700 mb-0.5">Chưa có mã khuyến mãi</h3>
                <p className="text-xs text-slate-500">Tạo mã giảm giá ngay hôm nay.</p>
              </div>
            )}
          </div>

        </div>

        {/* === CỘT PHẢI (COL-4): CẤU HÌNH & TÓM TẮT === */}
        <div className="xl:col-span-4">
          <div className="sticky top-6 flex flex-col gap-6">
          
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.03)] border border-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">settings</span>
              </div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Cấu hình phụ phí</h3>
            </div>

            <div className="space-y-3">
              {phuPhiList.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Đang tải dữ liệu...</p>
              ) : (
                phuPhiList.map((pp) => (
                  <div key={pp.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[9px] font-black shrink-0
                          ${pp.loai_phu_phi === 'PhanTram' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-700'}`}>
                          {pp.loai_phu_phi === 'PhanTram' ? '%' : '₫'}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-800 leading-tight truncate">{pp.ten_phu_phi}</p>
                          <p className="text-[9px] text-slate-400 font-medium truncate">{pp.ma_phu_phi}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold
                        ${pp.trang_thai ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {pp.trang_thai ? 'Bật' : 'Tắt'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          value={editingPhuPhi[pp.id] ?? ''}
                          onChange={(e) => setEditingPhuPhi(prev => ({ ...prev, [pp.id]: e.target.value }))}
                          className={`w-full pl-3 pr-8 py-1.5 border rounded-lg text-sm font-black focus:outline-none focus:ring-2 transition-all
                            ${pp.loai_phu_phi === 'PhanTram'
                              ? 'bg-indigo-50/50 border-indigo-100 text-indigo-700 focus:ring-indigo-500/20 focus:border-indigo-400'
                              : 'bg-amber-50/50 border-amber-100 text-amber-700 focus:ring-amber-500/20 focus:border-amber-400'}`}
                        />
                        <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-black
                          ${pp.loai_phu_phi === 'PhanTram' ? 'text-indigo-400' : 'text-amber-400'}`}>
                          {pp.loai_phu_phi === 'PhanTram' ? '%' : 'đ'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleSavePhuPhi(pp.id)}
                        disabled={savingId === pp.id}
                        className={`w-9 h-[34px] rounded-lg flex items-center justify-center text-white shadow-sm transition-all
                          ${pp.loai_phu_phi === 'PhanTram'
                            ? 'bg-indigo-600 hover:bg-indigo-700'
                            : 'bg-amber-500 hover:bg-amber-600'}
                          ${savingId === pp.id ? 'opacity-60 cursor-wait' : ''}`}
                        title="Lưu"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {savingId === pp.id ? 'sync' : 'save'}
                        </span>
                      </button>
                    </div>

                    {pp.mo_ta && (
                      <p className="mt-1.5 text-[9px] text-slate-400 font-medium leading-snug line-clamp-2">{pp.mo_ta}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 via-[#0f2857] to-[#1a3873] rounded-2xl shadow-[0_10px_20px_-10px_rgba(15,40,87,0.5)] p-5 text-white relative overflow-hidden group">
            <h3 className="text-[10px] font-black text-blue-300/80 uppercase tracking-widest mb-4 flex items-center gap-1.5 relative z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              Tổng quan
            </h3>
            
            <div className="flex divide-x divide-white/10 mb-4 relative z-10">
              <div className="flex-1 pr-4">
                <div className="text-3xl font-black mb-1">{services.length < 10 ? `0${services.length}` : services.length}</div>
                <p className="text-[10px] font-bold text-blue-200/80 uppercase tracking-wider">Dịch vụ</p>
              </div>
              <div className="flex-1 pl-4">
                <div className="text-3xl font-black mb-1 text-emerald-400">{activePromosCount < 10 ? `0${activePromosCount}` : activePromosCount}</div>
                <p className="text-[10px] font-bold text-blue-200/80 uppercase tracking-wider">Khuyến mãi</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-medium text-blue-200/60 pt-3 border-t border-white/10 relative z-10">
              <span className="material-symbols-outlined text-[12px]">update</span>
              Cập nhật: Vừa xong
            </div>
          </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminServices;