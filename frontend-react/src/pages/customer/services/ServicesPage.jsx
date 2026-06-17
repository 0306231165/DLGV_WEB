import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import publicApi from '../../../api/publicApi';

// Bản đồ map icon tương ứng với ID của dịch vụ để giao diện luôn đẹp mắt
const SERVICE_ICONS = {
  1: 'cleaning_services',  // Dọn dẹp hằng ngày
  2: 'calendar_month',     // Dọn dẹp định kỳ
  3: 'cleaning',           // Tổng vệ sinh chuyên sâu
  4: 'elderly',            // Chăm sóc người lớn tuổi
  5: 'baby_changing_station', // Trông trẻ
  6: 'medical_services',   // Chăm sóc người bệnh
  7: 'construction',       // Dọn sau xây dựng
  8: 'ac_unit',            // Vệ sinh máy lạnh
  9: 'chair',              // Giặt ghế sofa
  10: 'bed',               // Giặt nệm
  11: 'soup_kitchen',      // Vệ sinh bếp chuyên sâu
  12: 'layers',            // Giặt thảm
  13: 'corporate_fare',    // Dọn văn phòng
};

const ServicesPage = () => {
  const navigate = useNavigate();
  const [activeGroup, setActiveGroup] = useState('all'); 
  const [groups, setGroups] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy dữ liệu thực tế thông qua publicApi
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await publicApi.getServices();
        
        if (res.success) {
          setGroups(res.groups || []);
          setPackages(res.services || []);
        }
      } catch (err) {
        console.error("Lỗi khi kết nối API dịch vụ:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Xử lý bộ lọc thông minh dựa vào trường trong DB
  const filteredPackages = packages.filter(pkg => {
    if (activeGroup === 'all') return true;
    if (activeGroup === 'popular') return pkg.is_noi_bat; 
    return pkg.nhom_dich_vu_id === Number(activeGroup);   
  });

  const fmt = n => Number(n).toLocaleString('vi-VN') + 'đ';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
              activeGroup === 'all' ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
            }`}
          >
            Tất cả dịch vụ
          </button>

          <button
            onClick={() => setActiveGroup('popular')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              activeGroup === 'popular' ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
            }`}
          >
            Phổ biến
          </button>

          {groups.map(group => (
            <button
              key={group.id}
              onClick={() => setActiveGroup(group.id.toString())}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                activeGroup === group.id.toString() ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
              }`}
            >
              {group.ten_nhom}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map(pkg => {
            const packageNames = pkg.loai_goi?.map(lg => lg.loai_goi?.ten_loai_goi).filter(Boolean) || [];
            const packageCount = packageNames.length;
            const hasMonthly = pkg.loai_goi?.some(lg => lg.loai_goi_id === 2);

            // Logic màu sắc chuẩn: >=3 gói màu đỏ, 1 và 2 gói màu xanh nước biển
            let badgeStyle = "bg-surface-container text-on-surface-variant border border-outline-variant/30";
            let badgeText = "Cố định";

            if (packageCount >= 3) {
              badgeStyle = "bg-red-500/10 text-red-600 border border-red-500/20";
              badgeText = "Tùy chọn linh hoạt";
            } else if (packageCount === 2) {
              badgeStyle = "bg-blue-500/10 text-blue-600 border border-blue-500/20";
              badgeText = packageNames.join(' / ');
            } else if (packageCount === 1) {
              badgeStyle = "bg-blue-500/10 text-blue-600 border border-blue-500/20";
              badgeText = packageNames[0];
            }

            return (
              <div 
                key={pkg.id} 
                className="bg-surface-container-lowest border-2 border-outline-variant/30 rounded-3xl p-6 hover:shadow-xl hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300 flex flex-col h-full relative overflow-hidden group"
              >
                {/* Decorative background shape */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>

                {/* Icon & Badge */}
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all bg-surface-container text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary">
                    <span className="material-symbols-outlined text-3xl">
                      {SERVICE_ICONS[pkg.id] || 'cleaning_services'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-2 items-end">
                    {pkg.is_noi_bat ? (
                      <span className="bg-error/10 text-error px-3 py-1 rounded-full text-xs font-bold">Phổ biến</span>
                    ) : null}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-h3 text-xl font-bold text-on-surface">{pkg.ten_dich_vu}</h3>
                    {hasMonthly && (
                      <span className="bg-primary text-on-primary px-2 py-0.5 rounded-full text-[10px] font-bold">Tiết kiệm</span>
                    )}
                  </div>

                  {/* Hiển thị Badge */}
                  <div className="mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeStyle}`}>
                      {badgeText}
                    </span>
                  </div>

                  <p className="text-on-surface-variant text-sm mb-4 line-clamp-3 leading-relaxed">
                    {pkg.mo_ta}
                  </p>

                  <div className="mb-6 flex items-end gap-1.5">
                    <span className="text-xs text-on-surface-variant font-medium mb-1">Từ </span>
                    <span className="text-2xl font-bold text-primary">
                      {fmt(pkg.don_gia_co_ban)}
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
            );
          })}
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