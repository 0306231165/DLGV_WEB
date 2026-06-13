import React from 'react';
import { NavLink, Link } from 'react-router-dom';

// ─── Tab System ────────────────────────────────────────────────────────────────
// ─── Tab System ────────────────────────────────────────────────────────────────
export const BookingTabs = () => {
  const tabs = [
    { label: 'Tất cả', to: '/my-bookings', end: true },
    { label: 'Sắp tới', to: '/my-bookings/upcoming' },
    { label: 'Đang thực hiện', to: '/my-bookings/active' },
    { label: 'Đã hoàn thành', to: '/my-bookings/completed' },
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
export const BookingCard = ({ booking }) => {
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
      {/* Icon Block - Đã đồng bộ màu theo ServicesPage và đổi màu khi Hover/Active */}
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
              <button key={i} className={commonClass}>
                {action.icon && <span className="material-symbols-outlined text-[16px]">{action.icon}</span>}
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Sample Data ───────────────────────────────────────────────────────────────
export const BOOKINGS = {
  upcoming: [
    {
      id: 1,
      title: 'Vệ sinh nhà cửa định kỳ',
      price: '300.000đ',
      date: 'Thứ Tư, 24 Tháng 5, 2024',
      time: '08:00 - 11:00 (3 giờ)',
      assignee: 'Nhân viên: Nguyễn Thu Hà',
      assigneeIcon: 'person',
      serviceIcon: 'cleaning_services',
      status: 'confirmed',
      statusLabel: 'ĐÃ XÁC NHẬN',
      statusClass: 'bg-white/90 backdrop-blur-md text-primary border border-primary/20',
      isPackage: false,
      actions: [
        { label: 'Chi tiết', isLink: true, to: '/my-bookings/1', className: 'bg-secondary-container text-on-secondary-fixed-variant hover:bg-secondary-fixed' },
        { label: 'Hủy lịch', className: 'border border-error/20 text-error hover:bg-error/5' },
      ],
    },
    {
      id: 3,
      title: 'Vệ sinh văn phòng',
      price: '550.000đ',
      date: 'Thứ Hai, 29 Tháng 5',
      time: '09:00 - 12:00 (3 giờ)',
      assignee: 'Đang điều phối nhân viên...',
      assigneeIcon: 'person_search',
      serviceIcon: 'domain',
      status: 'pending',
      statusLabel: 'CHỜ XÁC NHẬN',
      statusClass: 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30',
      isPackage: false,
      actions: [
        { label: 'Chi tiết', isLink: true, to: '/my-bookings/3', className: 'bg-secondary-container text-on-secondary-fixed-variant hover:bg-secondary-fixed' },
        { label: 'Hủy lịch', className: 'border border-error/20 text-error hover:bg-error/5' },
      ],
    },
  ],
  active: [
    {
      id: 4,
      title: 'Gói Dọn dẹp Hàng tháng (3 tháng)',
      price: '3.600.000đ',
      date: 'Nhiều ngày',
      time: 'Theo lịch trình',
      assignee: 'Đội: CleanTrust Team 01',
      assigneeIcon: 'engineering',
      serviceIcon: 'event_available',
      status: 'active',
      statusLabel: 'GÓI 3 THÁNG • ĐANG THỰC HIỆN',
      statusClass: 'bg-secondary text-on-secondary shadow-md shadow-secondary/30 border-none',
      isPackage: true,
      packageProgress: {
        completed: 4,
        total: 12,
        endDate: '24/08/2024'
      },
      actions: [
        { label: 'Quản lý Gói', isLink: true, to: '/my-bookings/4', className: 'bg-primary text-on-primary hover:bg-primary-container shadow-md shadow-primary/20' },
      ],
    },
    {
      id: 2,
      title: 'Tổng vệ sinh chuyên sâu',
      price: '1.250.000đ',
      date: 'Hôm nay, 22 Tháng 5',
      time: '13:30 - 17:30 (4 giờ)',
      assignee: 'Đội: CleanTrust Team 04',
      assigneeIcon: 'engineering',
      serviceIcon: 'auto_awesome',
      status: 'active',
      statusLabel: 'ĐANG THỰC HIỆN',
      statusClass: 'bg-surface-tint text-white',
      isPackage: false,
      actions: [
        { label: 'Chi tiết', isLink: true, to: '/my-bookings/2', className: 'bg-primary text-on-primary hover:bg-primary-container shadow-md shadow-primary/20' },
      ],
    },
    {
      id: 5,
      title: 'Gói Tạp vụ 24/7 (1 tháng)',
      price: '12.500.000đ',
      date: 'Nhiều ngày',
      time: 'Toàn thời gian (12h/ngày)',
      assignee: 'Nhân viên: Trần Thị Mai',
      assigneeIcon: 'person',
      serviceIcon: 'support_agent',
      status: 'active',
      statusLabel: 'GÓI 24/7 • ĐANG THỰC HIỆN',
      statusClass: 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border-none',
      isPackage: true,
      packageProgress: {
        completed: 10,
        total: 30,
        endDate: '20/06/2024'
      },
      actions: [
        { label: 'Quản lý Gói', isLink: true, to: '/my-bookings/5', className: 'bg-primary text-on-primary hover:bg-primary-container shadow-md shadow-primary/20' },
      ],
    },
    {
      id: 6,
      title: 'Gói Dọn dẹp Hàng tháng (6 tháng)',
      price: '18.500.000đ',
      date: 'Nhiều ngày',
      time: 'T2, T5, T6, CN',
      assignee: 'Nhân viên: Lê Hữu Bằng',
      assigneeIcon: 'person',
      serviceIcon: 'event_available',
      status: 'active',
      statusLabel: 'GÓI 6 THÁNG • ĐANG THỰC HIỆN',
      statusClass: 'bg-secondary text-on-secondary shadow-md shadow-secondary/30 border-none',
      isPackage: true,
      packageProgress: {
        completed: 45,
        total: 96,
        endDate: '28/12/2024'
      },
      actions: [
        { label: 'Quản lý Gói', isLink: true, to: '/my-bookings/6', className: 'bg-primary text-on-primary hover:bg-primary-container shadow-md shadow-primary/20' },
      ],
    },
  ],
  completed: [],
};

BOOKINGS.all = [...BOOKINGS.upcoming, ...BOOKINGS.active, ...BOOKINGS.completed];