import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// MOCK dữ liệu thực tế (Ví dụ danh sách trả về rất nhiều phần tử)
const MOCK_QUICK_NOTIFICATIONS = [
  { id: 1, tieu_de: '🎉 Đặt lịch thành công', noi_dung: 'Đơn lịch dọn dẹp #102 của bạn đã được hệ thống tiếp nhận.', ngay_tao: '5 phút trước', is_da_doc: false, loai_doi_tuong: 'Booking' },
  { id: 2, tieu_de: '💼 Nhân viên đã nhận lịch', noi_dung: 'Chị Trần Thị Mai đã xác nhận tham gia ca làm việc ngày mai của bạn.', ngay_tao: '1 giờ trước', is_da_doc: false, loai_doi_tuong: 'Booking' },
  { id: 3, tieu_de: '🔥 Khuyến mãi độc quyền', noi_dung: 'Nhập mã CLEAN50 giảm ngay 50% cho dịch vụ dọn định kỳ tuần này.', ngay_tao: '2 ngày trước', is_da_doc: true, loai_doi_tuong: 'Promotion' },
  { id: 4, tieu_de: '💰 Biến động số dư ví', noi_dung: 'Tài khoản ví CleanTrust của bạn đã thanh toán tự động 200.000đ cho đơn lịch #102.', ngay_tao: '4 ngày trước', is_da_doc: true, loai_doi_tuong: 'Transaction' },
  { id: 5, tieu_de: '⭐ Hãy đánh giá dịch vụ', noi_dung: 'Ca làm việc đơn #098 đã hoàn thành. Hãy gửi phản hồi về nhân viên nhé.', ngay_tao: '5 ngày trước', is_da_doc: true, loai_doi_tuong: 'Review' },
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [notifications, setNotifications] = useState(MOCK_QUICK_NOTIFICATIONS);

  // Đếm tổng số thông báo chưa đọc thực tế trong toàn hệ thống
  const unreadCount = notifications.filter(n => !n.is_da_doc).length;

  // Lấy ra tối đa 3 thông báo mới nhất để render hiển thị nhanh trên Header dropdown
  const quickNotifications = notifications.slice(0, 3);

  const getLinkClass = (path) => {
    if (location.pathname === path) {
      return "text-primary dark:text-inverse-primary font-bold border-b-2 border-primary pb-1 font-body-md text-body-md";
    }
    return "text-on-surface-variant dark:text-on-primary-container pb-1 font-body-md text-body-md hover:text-primary dark:hover:text-inverse-primary transition-colors duration-200";
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleMarkAsRead = (id, loai_doi_tuong) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_da_doc: true } : n));
    if (loai_doi_tuong === 'Booking') {
      navigate('/my-bookings');
    }
  };

  return (
    <header className="bg-surface/80 backdrop-blur-md dark:bg-inverse-surface/80 border-b border-white/20 shadow-sm fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop h-20 mx-auto">
      <div 
        className="font-h3 text-h3 font-bold text-primary dark:text-inverse-primary cursor-pointer"
        onClick={() => navigate('/')}
      >
        CleanTrust
      </div>

      <nav className="hidden md:flex space-x-8">
        <Link className={getLinkClass("/")} to="/">Trang chủ</Link>
        <Link className={getLinkClass("/services")} to="/services">Dịch vụ</Link>
        <Link className={getLinkClass("/promotions")} to="/promotions">Khuyến mãi</Link>
        <Link className={getLinkClass("/contact")} to="/contact">Liên hệ</Link>
        <Link className={getLinkClass("/my-bookings")} to="/my-bookings">Lịch của tôi</Link>
      </nav>

      <div className="flex items-center space-x-4 md:space-x-6">
        {isLoggedIn ? (
          <div className="flex items-center space-x-1 md:space-x-2">
            
            {/* Cụm Dropdown Chuông thông báo */}
            <div className="relative group">
              <button className="text-on-surface-variant hover:text-primary hover:bg-primary-container/15 p-2 rounded-full transition-colors relative flex items-center justify-center focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-error ring-2 ring-surface animate-pulse"></span>
                )}
              </button>

              {/* Thân Dropdown Thông Báo */}
              <div className="absolute right-0 top-full pt-2 w-80 md:w-96 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right group-hover:translate-y-0 translate-y-2 z-50">
                <div className="bg-surface rounded-2xl shadow-xl border border-outline-variant/30 overflow-hidden flex flex-col max-h-[450px]">
                  {/* Header Dropdown */}
                  <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
                    <span className="font-bold text-on-surface text-sm">Thông báo mới nhận</span>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} chưa đọc
                      </span>
                    )}
                  </div>

                  {/* Danh sách thông báo rút gọn (ĐÃ GIỚI HẠN CHỈ LẤY TOI ĐA 3 CÁI) */}
                  <div className="overflow-y-auto divide-y divide-outline-variant/20 flex-1">
                    {quickNotifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-on-surface-variant bg-white">Bạn không có thông báo nào.</div>
                    ) : (
                      quickNotifications.map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => handleMarkAsRead(item.id, item.loai_doi_tuong)}
                          className={`p-4 hover:bg-surface-variant/30 cursor-pointer transition-colors flex gap-3 relative items-center ${
                            !item.is_da_doc ? 'bg-primary/[0.02]' : 'bg-white'
                          }`}
                        >
                          {/* Chấm tròn xanh căn giữa tuyệt đối theo trục Y của dòng */}
                          {!item.is_da_doc && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
                          )}
                          
                          {/* Khối bọc text dịch chuyển sang để tránh đè chữ */}
                          <div className={`flex-1 ${item.is_da_doc ? 'pl-5' : 'pl-1'}`}>
                            <h4 className={`text-xs font-bold text-on-surface mb-0.5 line-clamp-1 ${!item.is_da_doc ? 'text-primary' : ''}`}>
                              {item.tieu_de}
                            </h4>
                            <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-1">
                              {item.noi_dung}
                            </p>
                            <span className="text-[10px] text-outline-variant font-medium block">
                              {item.ngay_tao}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Nút Xem tất cả dưới đáy Dropdown */}
                  <button 
                    onClick={() => navigate('/notifications')}
                    className="w-full text-center py-3 bg-surface-container-low hover:bg-primary/10 text-xs font-bold text-primary border-t border-outline-variant/30 transition-all focus:outline-none"
                  >
                    Xem tất cả thông báo
                  </button>
                </div>
              </div>
            </div>

            {/* Icon Tin nhắn */}
            <button 
              onClick={() => navigate('/messages')}
              className="text-on-surface-variant hover:text-primary hover:bg-primary-container/15 p-2 rounded-full transition-colors relative flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-error ring-2 ring-surface"></span>
            </button>

            {/* Avatar & Dropdown */}
            <div className="relative group">
              <button className="flex items-center focus:outline-none">
                <img 
                  src="https://i.pravatar.cc/150?img=68" 
                  alt="User Avatar" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary transition-colors"
                />
              </button>

              <div className="absolute right-0 top-full pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right group-hover:translate-y-0 translate-y-2 z-50">
                <div className="bg-surface dark:bg-inverse-surface rounded-xl shadow-lg border border-outline-variant/30 py-2">
                  <div className="px-4 py-3 border-b border-outline-variant/30 mb-2">
                    <p className="font-semibold text-on-surface text-label-md">Nguyễn Văn A</p>
                    <p className="text-on-surface-variant text-label-sm">khachhang@example.com</p>
                  </div>

                  <Link to="/account" className="block px-4 py-2.5 text-body-md text-on-surface hover:bg-surface-variant hover:text-primary transition-colors flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                    <span>Tài khoản</span>
                  </Link>

                  <Link to="/wallet" className="block px-4 py-2.5 text-body-md text-on-surface hover:bg-surface-variant hover:text-primary transition-colors flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" /></svg>
                    <span>Ví của tôi</span>
                  </Link>

                  <Link to="/saved-staffs" className="block px-4 py-2.5 text-body-md text-on-surface hover:bg-surface-variant hover:text-primary transition-colors flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    <span>Nhân viên yêu thích</span>
                  </Link>

                  <Link to="/my-bookings/history" className="block px-4 py-2.5 text-body-md text-on-surface hover:bg-surface-variant hover:text-primary transition-colors flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>
                    <span>Lịch sử đặt lịch</span>
                  </Link>

                  <div className="border-t border-outline-variant/30 mt-2 pt-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-body-md text-error hover:bg-red-500/10 transition-colors flex items-center space-x-3 focus:outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                      <span className="font-semibold">Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsLoggedIn(true)}
            className="hidden md:block font-body-md text-body-md text-primary font-semibold hover:opacity-80 transition-all active:scale-95"
          >
            Đăng nhập
          </button>
        )}
        
        {/* Nút Đặt lịch ngay */}
        <button 
          onClick={() => navigate('/booking')}
          className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-sm text-label-sm hover:bg-primary-container transition-all shadow-sm active:scale-95 whitespace-nowrap"
        >
          Đặt lịch ngay
        </button>
      </div>
    </header>
  );
};

export default Header;