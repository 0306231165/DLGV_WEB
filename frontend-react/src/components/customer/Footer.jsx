import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-surface-container dark:bg-inverse-surface w-full border-t border-outline-variant">
      
      {/* Đã gỡ max-w-container-max để Footer giãn ra bằng với lề của Header */}
      <div className="py-section-padding px-margin-mobile md:px-margin-desktop">
        
        {/* Dùng flex justify-between để 3 cột chủ động đẩy xa nhau ra 2 mép */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          
          {/* Cột 1: Bám sát lề trái (Thẳng hàng với Logo Header) */}
          <div className="flex flex-col md:w-1/3">
            <div className="font-h3 text-h3 font-bold text-primary dark:text-inverse-primary mb-4">
              CleanTrust
            </div>
            <p className="font-body-md text-body-md text-secondary md:pr-12">
              Giải pháp vệ sinh nhà cửa thông minh, nhanh chóng và tận tâm.
            </p>
          </div>

          {/* Cột 2: Căn vào chính giữa */}
          <div className="flex flex-col md:items-center md:w-1/3">
            <div className="flex flex-col">
              <h4 className="font-h3 text-[20px] font-bold text-on-background mb-4">
                Liên kết hữu ích
              </h4>
              <div className="flex flex-col gap-3">
                <Link className="font-body-md text-body-md text-secondary hover:text-primary transition-all" to="/">
                  Về chúng tôi
                </Link>
                <Link className="font-body-md text-body-md text-secondary hover:text-primary transition-all" to="/">
                  Chính sách bảo mật
                </Link>
              </div>
            </div>
          </div>

          {/* Cột 3: Bám sát lề phải (Thẳng hàng với nút Đặt lịch ngay) */}
          <div className="flex flex-col md:items-end md:w-1/3">
            <div className="flex flex-col">
              <h4 className="font-h3 text-[20px] font-bold text-on-background mb-4">
                Liên hệ
              </h4>
              <div className="flex flex-col gap-3">
                <p className="font-body-md text-body-md text-secondary flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">home</span>
                  123 Đường ABC, Quận 1, TP.HCM
                </p>
                <p className="font-body-md text-body-md text-secondary flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">phone</span>
                  Hotline: 1900 xxxx
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Phần Copyright ở dưới cùng */}
        <div className="border-t border-outline-variant/30 pt-6 text-center">
          <p className="font-body-md text-body-md text-secondary">
            Đồ án Tốt nghiệp ©2026 CleanTrust
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;