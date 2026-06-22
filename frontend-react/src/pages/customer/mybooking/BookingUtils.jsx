import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import khachHangApi from '../../../api/khachHangApi';

const SERVICE_ICONS = {
  1: 'cleaning_services',  // Dọn dẹp hằng ngày
  2: 'calendar_month',     // Dọn dẹp định kỳ
  3: 'cleaning',           // Tổng vệ sinh chuyên sâu
  4: 'elderly',            // Chăm sóc người lớn tuổi
  5: 'baby_changing_station', // Trông trẻ
  6: 'medical_services',   // Chăm sóc người bệnh
  7: 'construction',       // Dọn sau xây dựng
  8: 'ac_unit',            // Vệ sinh máy lạnh
  9: 'chair',              // Giặt ghế sofa
  10: 'bed',               // Giặt nệm
  11: 'soup_kitchen',      // Vệ sinh bếp chuyên sâu
  12: 'layers',            // Giặt thảm
  13: 'corporate_fare',    // Dọn văn phòng
};

// ─── Tab System ────────────────────────────────────────────────────────────────
export const BookingTabs = () => {
  const tabs = [
    { label: 'Tất cả', to: '/my-bookings', end: true },
    { label: 'Sắp tới', to: '/my-bookings/upcoming' },
    { label: 'Đang thực hiện', to: '/my-bookings/active' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      {/* Thanh Menu Tab cũ */}
      <div className="flex items-center gap-2 p-1.5 bg-surface-container-low w-fit rounded-2xl border border-outline-variant/20 shadow-sm flex-wrap">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              isActive
                ? 'px-8 py-2.5 rounded-xl bg-primary text-on-primary font-label-sm shadow-md shadow-primary/20 transition-all active:scale-95'
                : 'px-8 py-2.5 rounded-xl text-on-surface-variant hover:text-primary hover:bg-white/50 font-label-sm transition-all duration-300'
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      {/* Nút "Lịch sử" chính thức trỏ sang Sub-route mới */}
      <Link 
        to="/my-bookings/history" 
        className="group flex items-center gap-2 px-5 py-2.5 bg-white text-primary border border-outline-variant/30 hover:border-primary/30 rounded-xl font-label-sm shadow-md shadow-gray-200/80 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 active:scale-[0.98] w-fit"
      >
        <span className="material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:scale-105">
          history
        </span>
        <span className="font-bold">Lịch sử</span>
      </Link>
    </div>
  );
};

// ─── Booking Card ──────────────────────────────────────────────────────────────
export const mapDonHangToBookingCard = (dh) => {
  const isPackage = Boolean(dh.is_lap_lai_hang_tuan || dh.so_thang_goi_thang || dh.ca_lam_247);
  
  // Progress
  let completedCa = 0;
  let totalCa = dh.ca_lam_viec?.length || dh.tong_so_buoi || 1;
  let endDate = dh.ngay_ket_thuc;
  let firstCa = dh.ca_lam_viec?.[0];

  if (dh.ca_lam_viec) {
    completedCa = dh.ca_lam_viec.filter(c => c.trang_thai_ca === 'DaHoanThanh').length;
  }

  // Determine status
  let status = 'pending';
  let statusLabel = 'CHỜ XỬ LÝ';
  let statusClass = 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30';

  // Lấy thông tin nhân viên
  const nhanVienCaLam = firstCa?.nhan_vien?.tai_khoan?.ho_ten;
  const nhanVienYeuCau = dh.nhan_vien_yeu_cau?.tai_khoan?.ho_ten;

  if (dh.trang_thai_don === 'DangThucHien') {
    status = 'active';
    statusLabel = 'ĐANG THỰC HIỆN';
    statusClass = 'bg-secondary text-on-secondary shadow-md shadow-secondary/30 border-none';
    if (isPackage) {
        if (dh.so_thang_goi_thang) statusLabel = `GÓI ${dh.so_thang_goi_thang} THÁNG • ĐANG THỰC HIỆN`;
        else if (dh.ca_lam_247) statusLabel = `GÓI 24/7 • ĐANG THỰC HIỆN`;
        else statusLabel = `GÓI DỊCH VỤ • ĐANG THỰC HIỆN`;
    } else {
        statusClass = 'bg-surface-tint text-white';
    }
  } else if (dh.trang_thai_don === 'DaHoanThanh') {
    status = 'completed';
    statusLabel = 'ĐÃ HOÀN THÀNH';
    statusClass = 'bg-outline-variant/20 text-on-surface-variant';
  } else if (dh.trang_thai_don === 'DaHuy') {
    status = 'cancelled';
    statusLabel = 'ĐÃ HỦY';
    statusClass = 'bg-error/10 text-error border border-error/20';
  } else if (dh.trang_thai_don === 'ChoXuLy') {
    // Chỉ "Đã xác nhận" khi có NHÂN VIÊN CA LÀM và trạng thái không phải là chờ xác nhận
    if (nhanVienCaLam && firstCa?.trang_thai_ca !== 'ChoNhanVienChiDinhXacNhan') {
      status = 'confirmed';
      statusLabel = 'ĐÃ XÁC NHẬN';
      statusClass = 'bg-primary/10 text-primary border border-primary/20 font-bold';
    } else {
      status = 'pending';
      statusLabel = 'CHỜ XÁC NHẬN';
      statusClass = 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30';
    }
  }

  // Phân luồng text hiển thị cho phần Nhân viên
  let assigneeText = '';
  let assigneeIcon = '';
  if (nhanVienCaLam) {
    assigneeText = `Nhân viên: ${nhanVienCaLam}`;
    assigneeIcon = 'person';
  } else if (nhanVienYeuCau) {
    assigneeText = `Yêu cầu: ${nhanVienYeuCau} (Chờ phản hồi)`;
    assigneeIcon = 'pending_actions';
  } else {
    assigneeText = 'Đang điều phối nhân viên...';
    assigneeIcon = 'person_search';
  }

  let actions = [];
  if (dh.trang_thai_don === 'ChoXuLy') {
    actions = [
      { label: 'Chi tiết', isLink: true, to: `/my-bookings/${dh.id}`, className: 'bg-primary text-on-primary hover:bg-primary-container shadow-md shadow-primary/20' },
      { label: 'Hủy lịch', className: 'border border-error/20 text-error hover:bg-error/5' },
    ];
  } else if (dh.trang_thai_don === 'DangThucHien') {
    actions = [
      { label: isPackage ? 'Quản lý Gói' : 'Chi tiết', isLink: true, to: `/my-bookings/${dh.id}`, className: 'bg-primary text-on-primary hover:bg-primary-container shadow-md shadow-primary/20' },
    ];
  } else {
    actions = [
      { label: 'Xem chi tiết', isLink: true, to: `/my-bookings/${dh.id}`, className: 'bg-secondary-container text-on-secondary-fixed-variant hover:bg-secondary-fixed' },
      { label: 'Đặt lại', className: 'border border-primary/20 text-primary hover:bg-primary/5' },
    ];
  }

  let formattedTimeInfo = 'Chưa xếp giờ';
  if (firstCa && firstCa.thoi_gian_lam_phut) {
    const hours = Math.floor(firstCa.thoi_gian_lam_phut / 60);
    const minutes = firstCa.thoi_gian_lam_phut % 60;
    const durationStr = minutes > 0 ? `${hours} giờ ${minutes} phút` : `${hours} giờ`;
    formattedTimeInfo = `${firstCa.gio_bat_dau} (${durationStr})`;
  } else if (firstCa && firstCa.gio_bat_dau) {
    formattedTimeInfo = firstCa.gio_bat_dau;
  }

  return {
    id: dh.id,
    rawStatus: dh.trang_thai_don,
    loaiGoiId: dh.dich_vu_loai_goi?.loai_goi_id,
    isLapLaiHangTuan: dh.is_lap_lai_hang_tuan === 1 || dh.is_lap_lai_hang_tuan === true,
    title: dh.dich_vu_loai_goi?.dich_vu?.ten_dich_vu || 'Dịch vụ dọn dẹp',
    price: Number(dh.tong_tien_cuoi_cung).toLocaleString('vi-VN') + 'đ',
    date: isPackage ? 'Nhiều ngày' : (firstCa ? firstCa.ngay_lam : dh.ngay_bat_dau),
    time: isPackage ? 'Theo lịch trình' : formattedTimeInfo,
    assignee: assigneeText,
    assigneeIcon: assigneeIcon,
    serviceIcon: SERVICE_ICONS[dh.dich_vu_loai_goi?.dich_vu_id] || 'cleaning_services',
    status: status,
    statusLabel: statusLabel,
    statusClass: statusClass,
    isPackage: isPackage,
    packageProgress: isPackage ? {
      completed: completedCa,
      total: totalCa,
      endDate: endDate
    } : null,
    actions: actions
  };
};

export const BookingCard = ({ booking }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleConfirmCancelOrder = async () => {
    try {
      await khachHangApi.cancelOrder(booking.id);
      setShowCancelModal(false);
      window.location.reload();
    } catch (err) {
      console.error("Lỗi khi hủy đơn hàng:", err);
      alert("Có lỗi xảy ra khi yêu cầu hủy đơn hàng.");
    }
  };
  const {
    title,
    price,
    date,
    time,
    assignee,
    assigneeIcon,
    serviceIcon,
    status,
    statusLabel,
    statusClass,
    actions,
  } = booking;

  // Giữ lại borderAccent để nhận diện trạng thái ở viền trái card (nếu bạn vẫn muốn giữ)
  const borderAccent = {
    confirmed: 'border-l-primary',
    active: 'border-l-surface-tint',
    pending: 'border-l-outline-variant',
    completed: 'border-l-outline',
  }[status] ?? 'border-l-outline-variant';

  return (
    <div
      className={`glass-card bg-surface-container-item p-5 rounded-3xl flex gap-5 hover:shadow-2xl hover:shadow-primary/10 transition-all group border-l-4 ${borderAccent} shadow-sm shadow-gray-300`}
    >
      {/* Icon Block */}
      <div className="flex flex-col items-center gap-2 shrink-0 select-none">
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 
                     bg-surface-container text-on-surface-variant 
                     group-hover:bg-primary group-hover:text-on-primary 
                     group-active:scale-95"
        >
          <span className="material-symbols-outlined text-3xl transition-transform duration-300 group-hover:scale-105">
            {serviceIcon}
          </span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm whitespace-nowrap ${statusClass}`}>
          {statusLabel}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
        <div>
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="font-h3 text-base text-on-surface leading-tight line-clamp-2">{title}</h3>
            <span className="text-primary font-bold text-base shrink-0">{price}</span>
          </div>
          <div className="flex flex-col gap-1.5 text-on-surface-variant text-sm">
            {booking.isPackage ? (
              <>
                <div className="flex items-center gap-1.5 font-bold text-primary">
                  <span className="material-symbols-outlined text-[16px]">library_add_check</span>
                  <span className="truncate">Gói dịch vụ: Tiến độ {booking.packageProgress.completed}/{booking.packageProgress.total} ca</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary">calendar_clock</span>
                  <span className="truncate">Kéo dài đến: {booking.packageProgress.endDate}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
                  <span className="truncate">{date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                  <span className="truncate">{time}</span>
                </div>
              </>
            )}
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">{assigneeIcon}</span>
              <span className="truncate">{assignee}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {actions.map((action, i) => {
            const commonClass = `flex-1 py-2 rounded-xl font-label-sm text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 ${action.className}`;
            if (action.isLink) {
              return (
                <Link key={i} to={action.to} className={commonClass}>
                  {action.icon && <span className="material-symbols-outlined text-[16px]">{action.icon}</span>}
                  {action.label}
                </Link>
              );
            }
            return (
              <button 
                key={i} 
                className={commonClass}
                onClick={() => {
                  if (action.label === 'Hủy lịch') setShowCancelModal(true);
                  else if (action.onClick) action.onClick();
                }}
              >
                {action.icon && <span className="material-symbols-outlined text-[16px]">{action.icon}</span>}
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal hủy lịch */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-error/10 flex items-center gap-3 border-b border-error/20">
              <div className="w-10 h-10 bg-white text-error rounded-full flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div>
                <h3 className="font-h3 text-lg text-error font-bold leading-tight">Xác nhận hủy lịch</h3>
                <p className="text-xs text-error/80 font-medium">Bạn sắp hủy toàn bộ lịch hẹn / gói dịch vụ này.</p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-error/5 p-4 rounded-xl border border-error/20 text-sm text-on-surface-variant font-medium leading-relaxed">
                Sau khi hủy, hệ thống sẽ ngừng cung cấp dịch vụ và không thể khôi phục lại đơn hàng này.
                Bạn có chắc chắn muốn tiếp tục không?
              </div>
            </div>
            <div className="p-4 border-t border-outline-variant/30 flex gap-3 bg-surface-container-lowest">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 bg-surface text-on-surface font-bold rounded-xl border border-outline-variant/30 hover:bg-surface-container active:scale-95 transition-all"
              >
                Đóng
              </button>
              <button
                onClick={handleConfirmCancelOrder}
                className="flex-1 py-3 bg-error text-white font-bold rounded-xl hover:bg-error/90 active:scale-95 transition-all shadow-md shadow-error/30"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Mapping API Response to Mock Format ──────────────────────────────────
export const mapApiToBookingDetailFormat = (dh) => {
  if (!dh) return null;

  const isPackage = Boolean(dh.is_lap_lai_hang_tuan || dh.so_thang_goi_thang || dh.ca_lam_247);
  const is247 = Boolean(dh.ca_lam_247);
  
  const parseDMYHelper = (str) => {
    if (!str) return '';
    const [y, m, d] = str.split(' ')[0].split('-');
    return `${d}/${m}/${y}`;
  };

  let statusStr = '';
  let statusLabel = '';
  let statusColor = '';

  if (dh.trang_thai_don === 'ChoXuLy') {
    statusStr = 'pending';
    statusLabel = 'CHỜ XÁC NHẬN';
    statusColor = 'text-on-surface-variant bg-surface-container-high border-outline-variant/30';
  } else if (dh.trang_thai_don === 'DangThucHien') {
    statusStr = 'active';
    if (isPackage) {
      if (is247) {
        statusLabel = 'GÓI 24/7 • ĐANG THỰC HIỆN';
        statusColor = 'text-white bg-blue-600 border-blue-600/30';
      } else {
        const title = dh.dich_vu_loai_goi?.loai_goi?.ten_loai_goi || 'GÓI DỊCH VỤ';
        statusLabel = `${title.toUpperCase()} • ĐANG THỰC HIỆN`;
        statusColor = 'text-white bg-secondary border-secondary/30 shadow-md shadow-secondary/30';
      }
    } else {
      statusLabel = 'ĐANG THỰC HIỆN';
      statusColor = 'text-white bg-surface-tint border-surface-tint/30';
    }
  } else if (dh.trang_thai_don === 'DaHoanThanh') {
    statusStr = 'completed';
    statusLabel = 'ĐÃ HOÀN THÀNH';
    statusColor = 'text-white bg-emerald-600 border-emerald-600/30';
  } else {
    statusStr = 'cancelled';
    statusLabel = 'ĐÃ HỦY';
    statusColor = 'text-error bg-error/10 border-error/20';
  }

  const firstCa = dh.ca_lam_viec && dh.ca_lam_viec.length > 0 ? dh.ca_lam_viec[0] : null;

  // Tính toán Duration
  let durationStr = 'Tùy chọn';
  if (is247) {
    durationStr = dh.ca_lam_247 === 'CaNgay' ? 'Cả ngày' : (dh.ca_lam_247 === 'Dem' ? 'Ca đêm' : 'Ca ngày');
  } else if (firstCa && firstCa.thoi_gian_lam_phut) {
    const hours = Math.floor(firstCa.thoi_gian_lam_phut / 60);
    const mins = firstCa.thoi_gian_lam_phut % 60;
    durationStr = `${hours > 0 ? hours + ' giờ ' : ''}${mins > 0 ? mins + ' phút' : ''}`.trim();
  }

  // Phương thức thanh toán
  const methodMap = {
    'ViTien': 'Ví CleanTrust',
    'ChuyenKhoan': 'Chuyển khoản',
    'Online': 'Ví MoMo / VNPAY',
    'TienMat': 'Tiền mặt',
  };
  const paymentMethod = methodMap[dh.phuong_thuc_tt] || 'Tiền mặt';

  // Tính toán phí
  const extrasPrice = (dh.dich_vu_them_da_chon || []).reduce((sum, ext) => sum + Number(ext.pivot?.gia_luc_dat || 0) * Number(ext.pivot?.so_luong || 1), 0);
  const travelFee = Number(dh.phu_phi_dat_gap || 0) + Number(dh.phu_phi_cao_cap || 0) + Number(dh.phu_phi_chon_nhan_vien || 0);

  let areaSizeStr = dh.tuy_chon_bien_the?.ten_tuy_chon || 'Tiêu chuẩn';
  if (is247) {
    areaSizeStr = dh.ca_lam_247 === 'CaNgay' ? '24/24' : '12 tiếng';
  }

  let recurringInfoStr = null;
  if (isPackage) {
    if (is247) {
      recurringInfoStr = `Hợp đồng ${dh.so_ngay_goi_247} ngày`;
    } else if (dh.is_lap_lai_hang_tuan) {
      recurringInfoStr = `Lịch lặp lại hằng tuần`;
    } else {
      recurringInfoStr = `Gói ${dh.so_thang_goi_thang || 1} tháng (${dh.tong_so_buoi} buổi)`;
    }
  }

  const base = {
    id: dh.id.toString(),
    code: `DH-${dh.id.toString().padStart(6, '0')}`,
    createdAt: dh.ngay_tao ? parseDMYHelper(dh.ngay_tao) + ' ' + dh.ngay_tao.split(' ')[1].substring(0, 5) : '',
    status: statusStr,
    statusLabel: statusLabel,
    statusColor: statusColor,
    isPackage,
    patternDays: dh.is_lap_lai_hang_tuan ? (dh.cac_ngay_trong_tuan ? dh.cac_ngay_trong_tuan.split(',').map(Number) : [1,2,3,4,5,6,0]) : [], 
    service: {
      title: dh.dich_vu_loai_goi?.dich_vu?.ten_dich_vu || 'Dịch vụ dọn dẹp',
      icon: is247 ? 'home_work' : isPackage ? 'calendar_month' : 'cleaning_services',
      packageType: dh.dich_vu_loai_goi?.loai_goi?.ten_loai_goi || 'Ca lẻ',
      duration: durationStr,
      staffCount: dh.so_luong_tuy_chon || 1,
      details: dh.ghi_chu_cho_nhan_vien || 'Không có ghi chú thêm.',
      extras: (dh.dich_vu_them_da_chon || []).map(ext => {
        const name = ext.dich_vu_them?.ten_dv_them || ext.ten_dv_them || 'Dịch vụ thêm';
        const qty = ext.pivot?.so_luong || 1;
        return qty > 1 ? `${name} (x${qty})` : name;
      }),
      areaSize: areaSizeStr,
    },
    schedule: {
      date: dh.ngay_bat_dau ? parseDMYHelper(dh.ngay_bat_dau) : '',
      time: dh.gio_lam_mac_dinh ? dh.gio_lam_mac_dinh.substring(0, 5) : (firstCa ? firstCa.gio_bat_dau.substring(0, 5) : 'Tùy chọn'),
      recurringInfo: recurringInfoStr,
      note: dh.ghi_chu_cho_nhan_vien || '',
    },
    location: {
      name: dh.ho_ten_thuc_te || dh.khach_hang?.tai_khoan?.ho_ten || 'Khách hàng',
      phone: dh.sdt_thuc_te || dh.khach_hang?.tai_khoan?.so_dien_thoai || '',
      address: dh.dia_chi_thuc_te || '',
    },
    hasPet: dh.co_thu_cung === 1 || dh.co_thu_cung === true,
    payment: {
      method: paymentMethod,
      methodIcon: dh.phuong_thuc_tt === 'TienMat' ? 'payments' : dh.phuong_thuc_tt === 'ViTien' ? 'account_balance_wallet' : 'smartphone',
      status: dh.trang_thai_thanh_toan === 'DaThanhToan' ? 'Đã thanh toán' : 'Chưa thanh toán',
      basePrice: Number(dh.tong_tien_ban_dau || dh.tong_tien_cuoi_cung),
      extrasPrice: extrasPrice,
      travelFee: travelFee,
      discount: Number(dh.tien_giam_giu || 0),
      total: Number(dh.tong_tien_cuoi_cung),
      sessionPrice: isPackage && dh.tong_so_buoi > 0 ? Math.round(Number(dh.tong_tien_cuoi_cung) / dh.tong_so_buoi) : Number(dh.tong_tien_cuoi_cung),
    },
  };
  const staffObj = firstCa?.nhan_vien?.tai_khoan || dh.nhan_vien_yeu_cau?.tai_khoan;
  
  if (staffObj) {
    base.staff = {
      name: staffObj.ho_ten,
      rating: 5.0,
      jobs: 0,
      avatar: staffObj.anh_dai_dien || 'https://i.pravatar.cc/150',
    };
  } else {
    base.staff = null;
  }

  // Helper: tính giờ kết thúc từ giờ bắt đầu + số phút
  const computeTimeRange = (gioBatDau, thoiGianPhut) => {
    const start = gioBatDau?.substring(0, 5) || '00:00';
    const [h, m] = start.split(':').map(Number);
    const endMinutes = h * 60 + m + (thoiGianPhut || 0);
    const endH = Math.floor(endMinutes / 60) % 24;
    const endM = endMinutes % 60;
    return `${start} – ${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  };

  if (isPackage) {
    const sessions = (dh.ca_lam_viec || []).map((ca) => {
      let rDate = undefined;
      if (ca.yeu_cau_doi_lich) {
        const lyDo = ca.yeu_cau_doi_lich.ly_do || '';
        const match = lyDo.match(/(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})/);
        if (match) {
          const dateStr = match[1];
          if (dateStr.includes('-')) {
             const [y, m, d] = dateStr.split('-');
             rDate = `${d}/${m}/${y}`;
          } else {
             rDate = dateStr;
          }
        }
      }

      return {
        id: ca.id.toString(),
        date: parseDMYHelper(ca.ngay_lam),
        status: ca.trang_thai_ca === 'DaHoanThanh' ? 'completed' :
                ca.trang_thai_ca === 'DangThucHien' ? 'active' :
                ca.trang_thai_ca === 'ChoXacNhan' ? 'awaiting_confirm' :
                ca.trang_thai_ca === 'DaHuy' || ca.trang_thai_ca === 'KhachHuy' || ca.trang_thai_ca === 'NhanVienHuy' ? 'cancelled' :
                ca.trang_thai_ca === 'DaNhan' || ca.trang_thai_ca === 'ChoNhanVienChiDinhXacNhan' ? 'upcoming' :
                ca.trang_thai_ca === 'ChoNhanVienTuDoNhan' ? 'upcoming' : 'upcoming',
        time: computeTimeRange(ca.gio_bat_dau, ca.thoi_gian_lam_phut),
        staff: ca.nhan_vien?.tai_khoan?.ho_ten || null,
        rescheduleDate: rDate,
        sao_danh_gia: ca.sao_danh_gia,
        noi_dung_danh_gia: ca.noi_dung_danh_gia,
        khieu_nai: ca.khieu_nai || null,
      };
    });

    let minDate = null;
    let maxDate = null;

    const parseToDate = (dmyStr) => {
      if (!dmyStr) return null;
      const [d, m, y] = dmyStr.split('/').map(Number);
      return new Date(y, m - 1, d);
    };

    const updateMinMax = (dmyStr) => {
      const dObj = parseToDate(dmyStr);
      if (!dObj) return;
      if (!minDate || dObj < minDate) minDate = dObj;
      if (!maxDate || dObj > maxDate) maxDate = dObj;
    };

    sessions.forEach(s => {
      updateMinMax(s.date);
      if (s.rescheduleDate) updateMinMax(s.rescheduleDate);
    });

    const formatDMYFromDate = (dObj) => {
      if (!dObj) return '';
      return `${String(dObj.getDate()).padStart(2, '0')}/${String(dObj.getMonth() + 1).padStart(2, '0')}/${dObj.getFullYear()}`;
    };

    base.packageInfo = {
      type: dh.dich_vu_loai_goi?.loai_goi?.ten_loai_goi || 'Gói dịch vụ',
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.status === 'completed').length,
      cancelledSessions: sessions.filter(s => s.status === 'cancelled').length,
      startDate: formatDMYFromDate(minDate),
      endDate: formatDMYFromDate(maxDate),
      allowExtraSession: false,
      sessions,
    };
  } else if (firstCa) {
    base.schedule.date = parseDMYHelper(firstCa.ngay_lam);
    base.schedule.time = computeTimeRange(firstCa.gio_bat_dau, firstCa.thoi_gian_lam_phut);
    base.sessions = [firstCa];
  } else {
    base.sessions = [];
  }

  return base;
};
