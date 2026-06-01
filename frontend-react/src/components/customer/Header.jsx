import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getLinkClass = (path) => {
    if (location.pathname === path) {
      return "text-primary dark:text-inverse-primary font-bold border-b-2 border-primary pb-1 font-body-md text-body-md";
    }
    return "text-on-surface-variant dark:text-on-primary-container pb-1 font-body-md text-body-md hover:text-primary dark:hover:text-inverse-primary transition-colors duration-200";
  };

  return (
    <header className="bg-surface/80 backdrop-blur-md dark:bg-inverse-surface/80 border-b border-white/20 shadow-sm fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop h-20 mx-auto">
      <div className="font-h3 text-h3 font-bold text-primary dark:text-inverse-primary">
        CleanTrust
      </div>

      <nav className="hidden md:flex space-x-8">
        <Link className={getLinkClass("/")} to="/">Trang chủ</Link>
        <Link className={getLinkClass("/services")} to="/services">Dịch vụ</Link>
        <Link className={getLinkClass("/promotions")} to="/promotions">Khuyến mãi</Link>
        <Link className={getLinkClass("/contact")} to="/contact">Liên hệ</Link>
        <Link className={getLinkClass("/my-bookings")} to="/my-bookings">Lịch của tôi</Link>
      </nav>

      <div className="flex items-center space-x-4">
        {/* NÚT ĐĂNG NHẬP - ĐÃ ĐƯỢC KÍCH HOẠT SỰ KIỆN CLICK CHUYỂN TRANG */}
        <button 
          onClick={() => navigate('/login')}
          className="hidden md:block font-body-md text-body-md text-primary font-semibold hover:opacity-80 transition-all active:scale-95"
        >
          Đăng nhập
        </button>
        
        {/* Nút Đặt lịch ngay */}
        <button 
          onClick={() => navigate('/booking')}
          className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-sm text-label-sm hover:bg-primary-container transition-all shadow-sm active:scale-95"
        >
          Đặt lịch ngay
        </button>
      </div>
    </header>
  );
};

export default Header;