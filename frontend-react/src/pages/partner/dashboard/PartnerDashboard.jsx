import React, { useState, useEffect } from 'react';
import nhanVienApi from '../../../api/nhanVienApi';

const PartnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await nhanVienApi.getDashboard();
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Lỗi lấy dữ liệu dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6 text-slate-500 animate-pulse">Đang tải dữ liệu tổng quan...</div>;
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const thuNhap = data?.thu_nhap_thang_nay || 0;
  const caHoanThanh = data?.ca_hoan_thanh || 0;
  const danhGiaSao = data?.danh_gia_sao || 0;
  const caTiepTheo = data?.ca_tiep_theo;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">📊 Tổng quan công việc</h1>
        <p className="text-sm text-slate-500">Thống kê hiệu suất làm việc và dòng tiền thu nhập của bạn.</p>
      </div>

      {/* Grid thống kê nâng cấp viền & bóng đổ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <span className="material-symbols-outlined text-3xl">payments</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Thu nhập tháng này</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{formatCurrency(thuNhap)}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <span className="material-symbols-outlined text-3xl">done_all</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ca hoàn thành</p>
            <h3 className="text-2xl font-black text-blue-600 mt-0.5">{caHoanThanh} ca làm</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-amber-100 text-amber-500 flex items-center justify-center border border-amber-100 shrink-0">
            <span className="material-symbols-outlined text-3xl">star</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Đánh giá sao</p>
            <h3 className="text-2xl font-black text-amber-500 mt-0.5">{danhGiaSao.toFixed(1)} / 5.0</h3>
          </div>
        </div>
      </div>

      {/* Box thông báo lịch thông minh */}
      {caTiepTheo ? (
        <div className="bg-white p-6 rounded-2xl border-2 border-emerald-600/20 shadow-sm bg-gradient-to-r from-white to-emerald-50/10">
          <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 animate-pulse">notification_important</span>
            Lịch làm việc tiếp theo của bạn
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Bạn có lịch dọn dẹp vào lúc <strong className="text-emerald-600 font-black">{caTiepTheo.thoi_gian_hien_thi}</strong> tại {caTiepTheo.dia_chi}. Hãy vào mục <strong>"Quản lý lịch làm"</strong> để xem chi tiết thông tin khách hàng và chuẩn bị dụng cụ đồ nghề nhé!
          </p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">calendar_today</span>
            Lịch làm việc
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Hiện tại bạn chưa có ca làm việc nào sắp tới. Hãy nghỉ ngơi hoặc kiểm tra mục nhận ca nhé!
          </p>
        </div>
      )}
    </div>
  );
};

export default PartnerDashboard;