import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PACKAGE_GROUPS, PACKAGES } from '../BookingPage';

const ServicesPage = () => {
  const navigate = useNavigate();
  const [activeGroup, setActiveGroup] = useState('all');

  // Lấy danh sách dịch vụ theo nhóm được chọn
  const filteredPackages = activeGroup === 'all' 
    ? PACKAGES 
    : PACKAGES.filter(p => p.groupId === activeGroup);

  const fmt = n => n.toLocaleString('vi-VN') + 'đ';

  return (
    <div className="bg-surface min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="font-h1 text-h1 font-bold text-primary mb-4">Các Dịch Vụ Của Chúng Tôi</h1>
          <p className="text-on-surface-variant text-lg">
            Khám phá các giải pháp làm sạch chuyên nghiệp được thiết kế để mang lại sự tinh khiết và an tâm cho không gian của bạn.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setActiveGroup('all')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              activeGroup === 'all'
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
            }`}
          >
            Tất cả dịch vụ
          </button>
          {PACKAGE_GROUPS.map(group => (
            <button
              key={group.groupId}
              onClick={() => setActiveGroup(group.groupId)}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                activeGroup === group.groupId
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
              }`}
            >
              {group.groupLabel}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map(pkg => (
            <div 
              key={pkg.id} 
              className="bg-surface-container-lowest border-2 border-outline-variant/30 rounded-3xl p-6 hover:shadow-xl hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300 flex flex-col h-full relative overflow-hidden group"
            >
              {/* Decorative background shape */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>

              {/* Icon & Badge */}
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all bg-surface-container text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary`}>
                  <span className="material-symbols-outlined text-3xl">{pkg.icon}</span>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {pkg.groupId === 'popular' && (
                    <span className="bg-error/10 text-error px-3 py-1 rounded-full text-xs font-bold">Phổ biến</span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-h3 text-xl font-bold text-on-surface">{pkg.title}</h3>
                  {pkg.type === 'monthly' && (
                    <span className="bg-primary text-on-primary px-2 py-0.5 rounded-full text-[10px] font-bold">Tiết kiệm</span>
                  )}
                </div>
                <div className="mb-3">
                  {(() => {
                    const getCardBadge = () => {
                      if (pkg.frequencyMode === 'full') return 'Đa tần suất';
                      if (pkg.frequencyMode === 'flexible') return 'Ca lẻ / Gói tháng';
                      return pkg.subtitle;
                    };
                    return (
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        pkg.frequencyMode === 'full'
                          ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                          : pkg.frequencyMode === 'flexible'
                          ? 'bg-secondary-container text-primary'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}>
                        {getCardBadge()}
                      </span>
                    );
                  })()}
                </div>
                <p className="text-on-surface-variant text-sm mb-4 line-clamp-3 leading-relaxed">
                  {pkg.desc}
                </p>
                <div className="mb-6 flex items-end gap-1.5">
                  <span className="text-xs text-on-surface-variant font-medium mb-1">Từ</span>
                  <span className="text-2xl font-bold text-primary">
                    {fmt(pkg.base_price)}
                    {pkg.type === 'monthly' && <span className="text-sm font-medium text-on-surface-variant ml-1">/ buổi</span>}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-auto">
                <button
                  onClick={() => navigate(`/services/${pkg.id}`)}
                  className="flex-1 bg-primary/10 text-primary font-semibold py-2.5 rounded-xl hover:bg-primary/20 transition-colors"
                >
                  Xem chi tiết
                </button>
                <button
                  onClick={() => navigate('/booking', { state: { selectedPackage: pkg.id } })}
                  className="flex-1 bg-primary text-on-primary font-semibold py-2.5 rounded-xl hover:bg-primary-container hover:text-on-primary-container shadow-sm hover:shadow transition-all"
                >
                  Đặt lịch
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredPackages.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">search_off</span>
            <p className="text-on-surface-variant font-medium">Không tìm thấy dịch vụ nào trong nhóm này.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
