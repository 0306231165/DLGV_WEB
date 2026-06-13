import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Khai báo các trang không cần layout (ví dụ: đăng nhập admin)
  const isMinimalLayoutPage = ['/admin/login'].includes(location.pathname);

  // Quản lý trạng thái số lượng cần xử lý hiển thị ở Menu bên trái
  const [pendingApprovalsCount] = useState(12); // Hồ sơ chờ duyệt

  // ================= DANH MỤC MENU DÀNH CHO ADMIN =================
  const menuItems = [
    { path: '/admin/dashboard', icon: 'dashboard', label: 'Tổng quan hệ thống' },
    { path: '/admin/users', icon: 'manage_accounts', label: 'Tài khoản & Người dùng' },
    { path: '/admin/approvals', icon: 'verified_user', label: 'Kiểm duyệt hồ sơ', badge: pendingApprovalsCount },
    { path: '/admin/services', icon: 'category', label: 'Dịch vụ & Bảng giá' },
    { path: '/admin/bookings', icon: 'calendar_month', label: 'Điều phối Đơn hàng' },
    { path: '/admin/reports', icon: 'bar_chart', label: 'Doanh thu & Thống kê' },
    { path: '/admin/complain', icon: 'feedback', label: 'Khiếu nại & Phản hồi' },
  ];

  if (isMinimalLayoutPage) {
    return (
      <main className="min-h-screen w-full bg-white">
        <Outlet />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 flex text-slate-800 antialiased font-sans">
      
      {/* SIDEBAR BÊN TRÁI - ADMIN TONE (BLUE) */}
      <aside className="w-72 bg-white text-slate-800 flex flex-col fixed h-full border-r border-slate-200/60 shadow-sm z-30">
        <div className="h-20 flex items-center px-6 border-b border-slate-100 gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
            <span className="material-symbols-outlined text-blue-600 text-2xl">admin_panel_settings</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-wide text-slate-900">CleanTrust</span>
            <span className="text-[10px] text-blue-600 font-bold tracking-wider uppercase">Quản trị hệ thống</span>
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
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
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
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          <span className="text-xs text-slate-500 font-semibold">Hệ thống đang hoạt động</span>
        </div>
      </aside>

      {/* KHỐI NỘI DUNG BÊN PHẢI */}
      <div className="flex-1 pl-72 flex flex-col min-h-screen">
        <header className="h-20 bg-white border-b border-slate-200/60 fixed top-0 right-0 left-72 z-20 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            Xin chào, <span className="text-blue-600">Quản trị viên</span> 🛡️
          </h2>

          <div className="flex items-center gap-5">
            
            {/* AVATAR ADMIN & DROPDOWN MENU */}
            <div className="relative group/avatar py-2">
              <button 
                className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-slate-50 border border-slate-100 transition-colors focus:outline-none shadow-sm cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center border-2 border-blue-500 font-black">
                  AD
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-700 leading-none">Super Admin</span>
                  <span className="text-[10px] text-slate-400 mt-1">Mã: ADM-001</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-sm group-hover/avatar:rotate-180 transition-transform duration-200">keyboard_arrow_down</span>
              </button>

              <div className="absolute right-0 top-full invisible opacity-0 group-hover/avatar:visible group-hover/avatar:opacity-100 pt-2 w-56 transition-all duration-200 z-50 transform origin-top-right group-hover/avatar:scale-100 scale-95">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 py-2">
                  <button 
                    onClick={() => navigate('/admin/settings')}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <span className="material-symbols-outlined text-slate-400 text-base">settings</span> Cài đặt hệ thống
                  </button>
                  
                  <button 
                    onClick={() => navigate('/admin/activity-log')}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <span className="material-symbols-outlined text-slate-400 text-base">history</span> Nhật ký hoạt động
                  </button>

                  <div className="border-t border-slate-100 my-1.5"></div>
                  
                  <button 
                    onClick={() => navigate('/admin/logout')} 
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

export default AdminLayout;