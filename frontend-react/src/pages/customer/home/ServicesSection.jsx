import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import publicApi from '../../../api/publicApi';

const SERVICE_ICONS = {
  1: 'cleaning_services',       // Dọn dẹp hằng ngày
  3: 'cleaning',                // Tổng vệ sinh chuyên sâu
  13: 'corporate_fare',         // Dọn văn phòng
  5: 'baby_changing_station',   // Trông trẻ
};

const SERVICE_UNITS = {
  1: '/ ca',
  3: '/ gói',
  13: '/ ca',
  5: '/ buổi',
};

// Dữ liệu thật từ DB (DichVuSeeder) dùng làm state ban đầu để hiển thị ngay không cần chờ load
const DEFAULT_REAL_SERVICES = [
  {
    id: 1,
    ten_dich_vu: 'Dọn dẹp hằng ngày',
    mo_ta: 'Quét lau sàn, lau bụi nội thất, dọn rác và vệ sinh bếp, toilet cơ bản.',
    don_gia_co_ban: 200000,
    is_noi_bat: true,
    colSpan: 'col-span-1 md:col-span-2'
  },
  {
    id: 3,
    ten_dich_vu: 'Tổng vệ sinh chuyên sâu',
    mo_ta: 'Làm sạch toàn diện mọi ngóc ngách, chà sàn, tẩy ố nhà vệ sinh, lau kính.',
    don_gia_co_ban: 450000,
    is_noi_bat: false,
    colSpan: 'col-span-1'
  },
  {
    id: 13,
    ten_dich_vu: 'Dọn văn phòng',
    mo_ta: 'Lau dọn bàn làm việc, phòng họp, khu vực sinh hoạt chung của công ty.',
    don_gia_co_ban: 160000,
    is_noi_bat: false,
    colSpan: 'col-span-1'
  },
  {
    id: 5,
    ten_dich_vu: 'Trông trẻ',
    mo_ta: 'Trông giữ trẻ tại nhà an toàn, tận tâm, phù hợp cho các bé từ 6 tháng trở lên.',
    don_gia_co_ban: 250000,
    is_noi_bat: false,
    colSpan: 'col-span-1 md:col-span-2'
  }
];

const ServicesSection = () => {
  const [services, setServices] = useState(DEFAULT_REAL_SERVICES);

  useEffect(() => {
    const fetchRealServices = async () => {
      try {
        const res = await publicApi.getServices();
        if (res.success && res.services && res.services.length > 0) {
          const updated = DEFAULT_REAL_SERVICES.map(defItem => {
            const found = res.services.find(s => s.id === defItem.id);
            return found ? {
              ...defItem,
              ten_dich_vu: found.ten_dich_vu,
              mo_ta: found.mo_ta || defItem.mo_ta,
              don_gia_co_ban: found.don_gia_co_ban || defItem.don_gia_co_ban,
              is_noi_bat: found.is_noi_bat
            } : defItem;
          });
          setServices(updated);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu dịch vụ thật cho trang chủ:", err);
      }
    };

    fetchRealServices();
  }, []);

  const fmt = n => Number(n).toLocaleString('vi-VN') + 'đ';

  return (
    <section className="py-section-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-h2 text-h2 text-on-background mb-4">Dịch Vụ Của Chúng Tôi</h2>
        <p className="font-body-md text-body-md text-secondary">Giải pháp làm sạch toàn diện cho mọi nhu cầu.</p>
      </div>
      
      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {services.map((pkg) => {
          const iconName = SERVICE_ICONS[pkg.id] || 'cleaning_services';
          const unit = SERVICE_UNITS[pkg.id] || '/ ca';

          return (
            <div 
              key={pkg.id}
              className={`${pkg.colSpan} bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-8 flex flex-col justify-between hover:shadow-lg hover:border-primary/30 transition-all duration-300 group`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="material-symbols-outlined text-primary text-4xl transition-transform duration-300 group-hover:scale-110" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {iconName}
                  </span>
                  {(pkg.id === 1 || pkg.is_noi_bat) && (
                    <span className="inline-block bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full font-label-sm text-label-sm font-semibold shadow-sm">
                      Phổ biến nhất
                    </span>
                  )}
                </div>
                <h3 className="font-h3 text-h3 text-on-background mb-2 group-hover:text-primary transition-colors">
                  {pkg.ten_dich_vu}
                </h3>
                <p className="font-body-md text-body-md text-secondary mb-4 line-clamp-2">
                  {pkg.mo_ta}
                </p>
                <div className="inline-flex items-center gap-1 bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-lg text-sm mb-2">
                  <span className="material-symbols-outlined text-base">sell</span>
                  Giá từ {fmt(pkg.don_gia_co_ban)} {unit}
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between border-t border-outline-variant/20 pt-4 gap-2 sm:gap-4">
                <Link to={`/services/${pkg.id}`} className="text-primary hover:bg-primary/10 px-3 sm:px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-1">
                  Tìm hiểu thêm
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
                <Link to="/booking" state={{ selectedPackage: pkg.id }} className="bg-primary text-on-primary px-4 sm:px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-container transition-all flex items-center gap-1.5 shadow-md shadow-primary/20">
                  <span className="material-symbols-outlined text-base">calendar_month</span>
                  Đặt ngay
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ServicesSection;