import React, { useState, useEffect } from 'react';
import nhanVienApi from '../../../api/nhanVienApi';
import { useSimulatedTime } from '../../../contexts/SimulatedTimeContext';

const PartnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy thời gian giả lập từ context nếu có
  let simulatedTime = null;
  try {
    const simCtx = useSimulatedTime();
    simulatedTime = simCtx?.simulatedTime;
  } catch (e) {
    simulatedTime = new Date();
  }

  const formatDateISO = (d) => {
    if (!d) return undefined;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const dateParam = formatDateISO(simulatedTime);
        const response = await nhanVienApi.getDashboard({ date: dateParam });
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
  }, [simulatedTime]);

  if (loading) {
    return <div className="p-6 text-slate-500 animate-pulse">Đang tải dữ liệu tổng quan...</div>;
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
  };

  const thangHienThi = data?.thang_hien_thi || 'Tháng này';
  const thuNhap = data?.thu_nhap_thang_nay || 0;
  const caHoanThanh = data?.ca_hoan_thanh || 0; // Tổng số ca hoàn thành
  const caHoanThanhThang = data?.ca_hoan_thanh_thang !== undefined ? data.ca_hoan_thanh_thang : caHoanThanh; // Số ca trong tháng
  const danhGiaSao = data?.danh_gia_sao || 0;
  const danhGiaSaoThang = data?.danh_gia_sao_thang !== undefined ? data.danh_gia_sao_thang : 5.0;
  const xepHangThang = data?.xep_hang_thang || '#1 / 152 nhân viên';
  const thuongDuKien = data?.thuong_du_kien || 0;
  const caTiepTheo = data?.ca_tiep_theo;

  return (
    <div className="space-y-8">
      {/* KHỐI 1: TỔNG QUAN CHUNG (Gốc ban đầu) */}
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">📊 Tổng quan công việc</h1>
          <p className="text-sm text-slate-500">Thống kê hiệu suất làm việc và dòng tiền thu nhập của bạn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      {/* KHỐI 2: THỐNG KÊ CÁ NHÂN THEO THÁNG GIẢ LẬP (Được thêm mới theo yêu cầu) */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md">
          <div>
            <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              Thống kê cá nhân • {thangHienThi}
            </span>
            <h2 className="text-xl font-black tracking-tight">📊 Tổng quan hiệu suất tháng</h2>
            <p className="text-xs text-slate-300 mt-1">
              Truy vấn theo ngày giả lập và trạng thái ca làm việc hoàn thành.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">💰 Thu nhập</p>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-xl">payments</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-black text-emerald-600">{formatCurrency(thuNhap)}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Trong {thangHienThi}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">✅ Ca hoàn thành</p>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-xl">done_all</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-black text-blue-600">{caHoanThanhThang} ca</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Trong {thangHienThi}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">⭐ Đánh giá</p>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-500 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-xl">star</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-black text-amber-500">{danhGiaSaoThang.toFixed(2)} / 5.0</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Điểm trung bình khách hàng</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">🏆 Xếp hạng</p>
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-xl">emoji_events</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-black text-purple-600 leading-snug">{xepHangThang}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Theo hiệu suất toàn hệ thống</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-5 rounded-2xl shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs text-amber-100 font-bold uppercase tracking-wider">🎁 Thưởng dự kiến</p>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-xl">redeem</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-black text-white">+{formatCurrency(thuongDuKien)}</h3>
              <p className="text-[11px] text-amber-100 mt-0.5">Dựa trên KPIs tháng hiện tại</p>
            </div>
          </div>
        </div>
      </div>

      {/* KHỐI 3: LỊCH TIẾP THEO */}

      {/* Box thông báo lịch tiếp theo */}
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