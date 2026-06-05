import React, { useState, createContext, useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

// Context
const BookingFilterContext = createContext();

export const useBookingFilter = () => useContext(BookingFilterContext);

const MyBookingsLayout = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();

  const handleFilter = (type) => {
    setActiveFilter(type);
    
    // Khi chọn Ca lẻ, Gói tháng, Gói lặp lại → chuyển về trang "Tất cả"
    if (type !== 'all') {
      navigate('/my-bookings', { replace: true });
    }
  };

  return (
    <BookingFilterContext.Provider value={{ activeFilter, setActiveFilter }}>
      <main className="pt-32 pb-section-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen">
        <div className="mb-10">
          <h1 className="font-h1 text-h1 text-on-surface text-primary mb-2">Quản lý lịch hẹn</h1>
          <p className="text-on-surface-variant font-body-lg">
            Xem và điều chỉnh các yêu cầu dọn dẹp của bạn.
          </p>
        </div>

        <div className="flex gap-8 items-start">
          {/* Left Sidebar */}
          <aside className="w-64 shrink-0 hidden lg:block">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 sticky top-28 flex flex-col gap-2 shadow-sm">
              
              <div className="font-h3 text-h3 mb-4 text-on-surface px-2">Loại dịch vụ</div>

              {/* TẤT CẢ */}
              <NavLink
                to="/my-bookings"
                end
                onClick={() => setActiveFilter('all')}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-label-sm ${
                    (isActive && activeFilter === 'all')
                      ? 'bg-surface-container-low text-primary font-semibold shadow-sm border-l-4 border-primary'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                  }`
                }
              >
                <span className="material-symbols-outlined">list_alt</span>
                Tất cả
              </NavLink>

              {/* Divider */}
              <div className="mt-3 mb-1 px-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant/50">
                  Nhóm dịch vụ
                </span>
              </div>

              {/* Ca lẻ */}
              <button
                onClick={() => handleFilter('single')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-label-sm w-full text-left ${
                  activeFilter === 'single'
                    ? 'bg-surface-container-low text-primary font-semibold shadow-sm border-l-4 border-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined">cleaning_services</span>
                Ca lẻ
              </button>

              {/* Gói tháng */}
              <button
                onClick={() => handleFilter('monthly')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-label-sm w-full text-left ${
                  activeFilter === 'monthly'
                    ? 'bg-surface-container-low text-primary font-semibold shadow-sm border-l-4 border-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined">calendar_month</span>
                Gói tháng
              </button>

              {/* Gói lặp lại */}
              <button
                onClick={() => handleFilter('recurring')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-label-sm w-full text-left ${
                  activeFilter === 'recurring'
                    ? 'bg-surface-container-low text-primary font-semibold shadow-sm border-l-4 border-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined">autorenew</span>
                Gói lặp lại
              </button>

              {/* Support Card */}
              <div className="mt-6 p-5 rounded-2xl bg-primary-container text-white relative overflow-hidden group cursor-pointer">
                <div className="relative z-10">
                  <div className="font-h3 text-base font-semibold mb-1">Cần giúp đỡ?</div>
                  <p className="text-white/80 text-sm mb-4">Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.</p>
                  <button className="bg-white text-primary px-4 py-2 rounded-lg font-label-sm text-xs hover:shadow-md transition-all active:scale-95">
                    Liên hệ ngay
                  </button>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-8xl">support_agent</span>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </main>

      {/* FAB */}
      <NavLink
        to="/booking"
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
        <span className="absolute right-full mr-4 px-4 py-2 bg-white text-primary rounded-xl text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border border-outline-variant/20 pointer-events-none">
          Đặt lịch mới
        </span>
      </NavLink>
    </BookingFilterContext.Provider>
  );
};

export default MyBookingsLayout;