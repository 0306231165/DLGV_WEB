import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const PartnerLayout = () => {
  const navigate = useNavigate();
  const [newJobsCount] = useState(3);
  const [unreadNotifications] = useState(2);
  const [unreadMessages] = useState(4);

  const menuItems = [
    { path: '/partner/dashboard', icon: 'monitoring', label: 'Tổng quan (Dashboard)' },
    { path: '/partner/schedule', icon: 'calendar_month', label: 'Quản lý lịch làm', badge: newJobsCount },
    { path: '/partner/wallet', icon: 'account_balance_wallet', label: 'Ví & Thu nhập' },
    { path: '/partner/reviews', icon: 'star', label: 'Đánh giá của tôi' },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex text-slate-800 antialiased font-sans">
      
      {/* SIDEBAR BÊN TRÁI */}
      <aside className="w-72 bg-white text-slate-800 flex flex-col fixed h-full border-r border-slate-200/60 shadow-sm z-30">
        <div className="h-20 flex items-center px-6 border-b border-slate-100 gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
            <span className="material-symbols-outlined text-emerald-600 text-2xl">local_laundry_service</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-wide text-slate-900">CleanTrust</span>
            <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase">Đối tác giúp việc</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-150 group ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[22px]">
                  {item.icon}
                </span>
                <span className="text-sm tracking-wide">{item.label}</span>
              </div>
              
              {item.badge > 0 && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500 text-white ring-2 ring-white">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-xs text-slate-500 font-semibold">Đang trực tuyến đón đơn</span>
        </div>
      </aside>

      {/* KHỐI NỘI DUNG BÊN PHẢI */}
      <div className="flex-1 pl-72 flex flex-col min-h-screen">
        <header className="h-20 bg-white border-b border-slate-200/60 fixed top-0 right-0 left-72 z-20 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            Xin chào, <span className="text-emerald-600">Chị Nguyễn Thị Hoa</span> 👋
          </h2>

          <div className="flex items-center gap-5">
            {/* 1. CHUÔNG THÔNG BÁO */}
            <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60 transition-all focus:outline-none group">
              <span className="material-symbols-outlined text-[23px] group-hover:rotate-12 transition-transform">notifications</span>
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] font-black text-white items-center justify-center">
                    {unreadNotifications}
                  </span>
                </span>
              )}
            </button>

            {/* 2. TIN NHẮN CHAT */}
            <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60 transition-all focus:outline-none group">
              <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">chat_bubble</span>
              {unreadMessages > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] font-black text-white items-center justify-center">
                    {unreadMessages}
                  </span>
                </span>
              )}
            </button>

            <div className="h-6 w-[1px] bg-slate-200"></div>

            {/* 3. KHỐI AVATAR HOVER DROPDOWN MENU */}
            <div className="relative group/avatar py-2">
              <button 
                className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-slate-50 border border-slate-100 transition-colors focus:outline-none shadow-sm cursor-pointer"
              >
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop" alt="Partner Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500" />
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-700 leading-none">Nguyễn Thị Hoa</span>
                  <span className="text-[10px] text-slate-400 mt-1">Mã: PT-8821</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-sm group-hover/avatar:rotate-180 transition-transform duration-200">keyboard_arrow_down</span>
              </button>

              {/* MENU DROPDOWN TỰ ĐỘNG HIỆN KHI HOVER */}
              <div className="absolute right-0 top-full invisible opacity-0 group-hover/avatar:visible group-hover/avatar:opacity-100 pt-2 w-56 transition-all duration-200 z-50 transform origin-top-right group-hover/avatar:scale-100 scale-95">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 py-2">
                  <button 
                    onClick={() => navigate('/partner/profile')}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <span className="material-symbols-outlined text-slate-400 text-base">account_circle</span> Hồ sơ công việc
                  </button>
                  
                  <button 
                    onClick={() => navigate('/partner/change-password')}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <span className="material-symbols-outlined text-slate-400 text-base">lock_reset</span> Đổi mật khẩu
                  </button>

                  <div className="border-t border-slate-100 my-1.5"></div>
                  
                  <button 
                    onClick={() => navigate('/partner/logout')} 
                    className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-3 transition-colors"
                  >
                    <span className="material-symbols-outlined text-rose-500 text-base">logout</span> Đăng xuất
                  </button>
                </div>
              </div>
            </div>

          </div>
        </header>

        <main className="flex-1 pt-28 p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default PartnerLayout;