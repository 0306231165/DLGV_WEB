import React, { useState } from 'react';
// 1. CHÈN THÊM useLocation VÀO ĐÂY
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';

const PartnerLayout = () => {
  const navigate = useNavigate();
  
  // 2. CHÈN ĐOẠN LẤY PATHNAME VÀ ĐỊNH NGHĨA BIẾN TẠI ĐÂY
  const location = useLocation();
  const isMinimalLayoutPage = ['/login', '/register', '/partner/messages'].includes(location.pathname);

  // Quản lý trạng thái số lượng của các mục khác
  const [newJobsCount] = useState(3);
  const [unreadMessages] = useState(4);

  // ================= STATE QUẢN LÝ THÔNG BÁO CHUYÊN SÂU =================
  const [notiTab, setNotiTab] = useState('all'); // 'all' hoặc 'unread'
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Lịch thi Test: Đi chợ & Nấu ăn',
      desc: 'Hệ thống đã xếp lịch thi cho bạn vào lúc 13:00 - 15:00 ngày 15/06/2026.',
      time: '10 phút trước',
      isRead: false,
      type: 'exam',
      icon: 'model_training',
      bgIcon: 'bg-amber-100 text-amber-600'
    },
    {
      id: 2,
      title: 'Yêu cầu đổi lịch làm việc thất bại',
      desc: 'Đơn hàng #CT-9912 tại Quận 1 không chấp nhận dời lịch. Vui lòng làm đúng giờ.',
      time: '2 giờ trước',
      isRead: false,
      type: 'warning',
      icon: 'warning',
      bgIcon: 'bg-rose-100 text-rose-600'
    },
    {
      id: 3,
      title: 'Ví tài khoản tăng +350.000đ',
      desc: 'Tiền công đơn hàng Tổng vệ sinh sâu #CT-9877 đã được cộng vào ví của bạn.',
      time: 'Hôm qua',
      isRead: true,
      type: 'wallet',
      icon: 'account_balance_wallet',
      bgIcon: 'bg-emerald-100 text-emerald-600'
    },
    {
      id: 4,
      title: 'Đánh giá 5 sao từ Khách hàng',
      desc: 'Chị Mai Anh vừa đánh giá bạn 5 sao kèm lời khen: "Dọn dẹp rất kỹ và sạch sẽ".',
      time: '2 ngày trước',
      isRead: true,
      type: 'review',
      icon: 'star',
      bgIcon: 'bg-yellow-100 text-yellow-600'
    }
  ]);

  // Tính toán số lượng thông báo chưa đọc thực tế
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  // Lấy danh sách hiển thị dựa theo Tab và Giới hạn tối đa 3 item
  const filteredNotifications = notifications
    .filter(n => notiTab === 'all' || !n.isRead)
    .slice(0, 3);

  // Xử lý đánh dấu đọc tất cả
  const handleMarkAllAsRead = (e) => {
    e.stopPropagation(); // Tránh kích hoạt sự kiện ngoài ý muốn
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Danh mục thanh Menu bên trái
  const menuItems = [
    { path: '/partner/dashboard', icon: 'monitoring', label: 'Tổng quan (Dashboard)' },
    { path: '/partner/schedule', icon: 'calendar_month', label: 'Quản lý lịch làm', badge: newJobsCount },
    { path: '/partner/wallet', icon: 'account_balance_wallet', label: 'Ví & Thu nhập' },
    { path: '/partner/reviews', icon: 'star', label: 'Đánh giá của tôi' },
    { path: '/partner/skills-registration', icon: 'model_training', label: 'Đăng ký chuyên môn' },
  ];

  // 3. CHÈN KHỐI ĐIỀU KIỆN NÀY NGAY TRƯỚC LỆNH RETURN CHÍNH
  // Nếu rơi vào trang không cần layout, trả về Outlet trống hoàn toàn (Full màn hình)
  if (isMinimalLayoutPage) {
    return (
      <main className="min-h-screen w-full bg-white">
        <Outlet />
      </main>
    );
  }

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
            
            {/* ================= KHỐI CHUÔNG THÔNG BÁO HOVER XỔ XUỐNG ================= */}
            <div className="relative group/noti py-2">
              <button 
                className="relative w-10 h-10 flex items-center justify-center rounded-full border transition-all focus:outline-none shadow-sm bg-slate-50 text-slate-600 group-hover/noti:bg-emerald-50 group-hover/noti:text-emerald-600 group-hover/noti:border-emerald-300 group-hover/noti:shadow-inner border-slate-200/60 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[23px] group-hover/noti:rotate-12 transition-transform">notifications</span>
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] font-black text-white items-center justify-center">
                      {unreadNotificationsCount}
                    </span>
                  </span>
                )}
              </button>

              <div className="absolute right-0 top-full invisible opacity-0 group-hover/noti:visible group-hover/noti:opacity-100 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 transform origin-top-right scale-95 group-hover/noti:scale-100 transition-all duration-200 select-none">
                <div className="p-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm tracking-wide">Thông báo công việc</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Bạn có {unreadNotificationsCount} tin chưa đọc</p>
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Đọc tất cả
                    </button>
                  )}
                </div>

                <div className="flex border-b border-slate-100 px-2 pt-1.5 bg-slate-50/40">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setNotiTab('all'); }}
                    className={`flex-1 text-center pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                      notiTab === 'all' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setNotiTab('unread'); }}
                    className={`flex-1 text-center pb-2 text-xs font-bold transition-all border-b-2 relative cursor-pointer ${
                      notiTab === 'unread' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Chưa đọc
                    {unreadNotificationsCount > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500 text-white">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </button>
                </div>

                <div className="max-h-[310px] overflow-y-auto divide-y divide-slate-100">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((noti) => (
                      <div 
                        key={noti.id}
                        onClick={() => {
                          setNotifications(prev => prev.map(n => n.id === noti.id ? { ...n, isRead: true } : n));
                          navigate('/partner/notifications');
                        }}
                        className={`p-4 pl-6 flex items-center gap-3 transition-all cursor-pointer relative ${
                          !noti.isRead 
                            ? 'bg-emerald-50/80 hover:bg-emerald-50/70 border-l-2 border-emerald-500' 
                            : 'bg-white hover:bg-slate-50/80' 
                        }`}
                      >
                        {!noti.isRead && (
                          <span className="absolute left-2 w-1.5 h-1.5 rounded-full bg-emerald-500 top-1/2 -translate-y-1/2"></span>
                        )}

                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-black/5 ${noti.bgIcon}`}>
                          <span className="material-symbols-outlined text-lg font-bold">{noti.icon}</span>
                        </div>

                        <div className="flex-1 space-y-0.5 text-left">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className={`text-xs text-slate-800 line-clamp-1 ${!noti.isRead ? 'font-black text-emerald-950' : 'font-bold'}`}>
                              {noti.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 shrink-0 font-medium">{noti.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-normal line-clamp-2 font-medium">
                            {noti.desc}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                      <span className="material-symbols-outlined text-3xl opacity-40">notifications_off</span>
                      <p className="text-xs font-semibold">Không có thông báo nào phù hợp</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => navigate('/partner/notifications')}
                  className="w-full py-3 bg-slate-50 hover:bg-slate-100 border-t border-slate-100 text-center text-xs font-black text-emerald-600 tracking-wide transition-all block cursor-pointer"
                >
                  Xem tất cả thông báo ({notifications.length})
                </button>
              </div>
            </div>

            {/* 2. TIN NHẮN CHAT */}
            <button 
              onClick={() => navigate('/partner/messages')}
              className="relative w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60 transition-all focus:outline-none group"
            >
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