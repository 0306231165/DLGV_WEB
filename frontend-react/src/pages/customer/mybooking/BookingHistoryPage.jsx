import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import khachHangApi from '../../../api/khachHangApi';

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

const mapToHistoryFormat = (dh) => {
  let title = dh.dich_vu_loai_goi?.dich_vu?.ten_dich_vu || 'Dịch vụ vệ sinh';
  const priceFormatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dh.tong_tien_cuoi_cung || 0).replace('₫', 'đ');

  let statusLabel = 'ĐÃ HOÀN THÀNH';
  let statusClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200/50';
  let status = 'completed';

  if (dh.trang_thai_don === 'DaHuy') {
    status = 'cancelled';
    statusLabel = 'ĐÃ HỦY';
    statusClass = 'bg-red-50 text-red-600 border border-red-200/50';
  }

  // Lấy ra ngày của ca đầu tiên hoặc ngày bắt đầu
  let date = '';
  let time = '';
  let location = dh.dia_chi_lam_viec || '';
  if (dh.ca_lam_viec && dh.ca_lam_viec.length > 0) {
    const firstCa = dh.ca_lam_viec[0];
    date = firstCa.ngay_lam ? firstCa.ngay_lam.split('-').reverse().join('/') : '';
    time = firstCa.gio_bat_dau ? firstCa.gio_bat_dau.slice(0, 5) : '';
  }

  return {
    id: `DH${dh.id.toString().padStart(4, '0')}`,
    originalId: dh.id,
    title,
    icon: SERVICE_ICONS[dh.dich_vu_loai_goi?.dich_vu_id] || 'cleaning_services',
    status,
    statusLabel,
    statusClass,
    date,
    time,
    location,
    price: priceFormatted,
    hasDetail: true,
  };
};

// Danh sách lựa chọn thời gian
const TIME_OPTIONS = [
  { id: 'all', label: 'Tất cả thời gian' },
  { id: '2026', label: 'Năm 2026' },
  { id: '2025', label: 'Năm 2025' },
];

const BookingHistoryPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [historyData, setHistoryData] = useState([]);

  // Trạng thái phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await khachHangApi.getMyBookings();
        if (res.success && res.data) {
          const history = res.data
            .filter(dh => dh.trang_thai_don === 'DaHuy' || dh.trang_thai_don === 'DaHoanThanh')
            .map(mapToHistoryFormat);
          setHistoryData(history);
        }
      } catch (err) {
        console.error("Lỗi lấy lịch sử:", err);
      }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 15000);
    const handleFocus = () => fetchHistory();
    window.addEventListener("focus", handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // ─── BỘ LỌC TỔNG HỢP ───
  const filteredData = historyData.filter((item) => {
    // 1. Lọc theo Tab trạng thái
    const matchesTab = activeTab === 'all' || item.status === activeTab;

    // 2. Lọc theo Ô tìm kiếm (Không phân biệt hoa thường, check cả Tên dịch vụ lẫn Mã đơn hàng)
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    // 3. Lọc theo thời gian được chọn
    let matchesTime = true;
    if (timeFilter !== 'all' && item.date) {
      // timeFilter format '2026'
      const year = item.date.split('/')[2]; 
      matchesTime = year === timeFilter;
    }

    return matchesTab && matchesSearch && matchesTime;
  });

  // ─── TÍNH TOÁN CHỈ SỐ PHÂN TRANG ───
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // ─── THUẬT TOÁN FLAT ARRAY SLIDER CHUẨN ĐÉT (ANT DESIGN LOGIC) ───
  const renderPaginationButtons = () => {
    const pages = [];
    const siblingCount = 1; 
    const totalPageNumbers = siblingCount * 2 + 5; 

    if (totalPages <= totalPageNumbers) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
      const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

      if (!shouldShowLeftDots && shouldShowRightDots) {
        let leftItemCount = 3 + 2 * siblingCount;
        for (let i = 1; i <= leftItemCount; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
      else if (shouldShowLeftDots && !shouldShowRightDots) {
        let rightItemCount = 3 + 2 * siblingCount;
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - rightItemCount + 1; i <= totalPages; i++) pages.push(i);
      }
      else if (shouldShowLeftDots && shouldShowRightDots) {
        pages.push(1);
        pages.push('...');
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages.map((page, index) => {
      if (page === '...') {
        return (
          <span 
            key={`ellipsis-${index}`} 
            className="w-9 h-9 flex items-center justify-center text-gray-400 font-bold pb-1 select-none"
          >
            ...
          </span>
        );
      }

      return (
        <button
          key={`page-${page}`}
          onClick={() => handlePageChange(page)}
          className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold text-sm transition-all shadow-2xs ${
            currentPage === page
              ? 'bg-primary text-white shadow-md shadow-primary/25'
              : 'bg-white border border-outline-variant/30 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <main className="pt-32 pb-section-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen">
      
      {/* Nút quay lại Quản lý lịch hẹn */}
      <Link 
        to="/my-bookings" 
        className="inline-flex items-center gap-3 py-1.5 pl-2 pr-5 mb-6 bg-white hover:bg-surface-container-low text-on-surface hover:text-primary border border-outline-variant/60 hover:border-primary/30 rounded-full text-sm font-bold transition-all duration-300 active:scale-[0.97] group/back w-fit shadow-md shadow-gray-200/80 hover:shadow-lg hover:shadow-primary/10"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary group-hover/back:bg-primary group-hover/back:text-on-primary flex items-center justify-center transition-all duration-300">
          <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover/back:-translate-x-0.5">
            arrow_back
          </span>
        </div>
        <span className='text-primary'>Quay lại Quản lý lịch hẹn</span>
      </Link>

      {/* Tiêu đề trang độc lập */}
      <div className="mb-10">
        <h1 className="font-h1 text-h1 text-on-surface text-primary mb-2">Lịch sử đặt lịch</h1>
        <p className="text-on-surface-variant font-body-lg">
          Theo dõi, tra cứu và quản lý lại toàn bộ hồ sơ các ca vệ sinh của bạn.
        </p>
      </div>

      {/* Thanh bộ lọc */}
      <div className="bg-white rounded-2xl border border-outline-variant/30 p-4 shadow-md shadow-gray-200/40 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        
        {/* ─── Ô TÌM KIẾM ĐÃ LIÊN KẾT STATE ─── */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[22px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset về trang 1 khi gõ tìm kiếm
            }}
            placeholder="Tìm kiếm dịch vụ, mã đơn..."
            className="w-full pl-12 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl font-label-sm text-sm focus:outline-none focus:border-primary/40 transition-colors"
          />
          {searchTerm && (
            <button 
              onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 material-symbols-outlined text-[18px]"
            >
              close
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          {/* ─── NÚT CHỌN THỜI GIAN ĐÃ BIẾN THÀNH DROPDOWN CHỨC NĂNG ─── */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 bg-surface-container-low text-on-surface-variant rounded-xl font-label-sm text-sm border transition-all ${
                timeFilter !== 'all' 
                  ? 'border-primary/50 text-primary bg-primary/5 font-semibold' 
                  : 'border-outline-variant/20 hover:bg-gray-100'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              <span>{TIME_OPTIONS.find(opt => opt.id === timeFilter)?.label}</span>
              <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                keyboard_arrow_down
              </span>
            </button>

            {/* Menu Dropdown ẩn hiện */}
            {isDropdownOpen && (
              <>
                {/* Lớp nền trong suốt click ra ngoài để đóng menu */}
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                
                <div className="absolute right-0 mt-2 w-56 bg-white border border-outline-variant/30 rounded-xl shadow-xl z-20 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  {TIME_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setTimeFilter(option.id);
                        setCurrentPage(1); // Reset về trang 1 khi đổi mốc thời gian
                        setIsDropdownOpen(false); // Đóng menu
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                        timeFilter === option.id 
                          ? 'bg-primary/10 text-primary font-bold' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{option.label}</span>
                      {timeFilter === option.id && (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl border border-outline-variant/10">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'completed', label: 'Hoàn thành' },
              { id: 'cancelled', label: 'Đã hủy' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1); 
                }}
                className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Danh sách đơn hàng dạng dòng ngang */}
      <div className="flex flex-col gap-4 mb-10">
        {currentItems.length > 0 ? (
          currentItems.map((item, index) => (
            <div
              key={`${item.id}-${indexOfFirstItem + index}`}
              className="group bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-md shadow-gray-100/60 hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5"
            >
              <div className="flex gap-5 items-start">
                <div className="w-14 h-14 bg-surface-container text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm">
                  <span className="material-symbols-outlined text-2xl transition-transform duration-300 group-hover:scale-105">
                    {item.icon}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-h3 text-base text-on-surface font-bold group-hover:text-primary transition-colors">
                      {item.title} <span className="text-xs text-gray-400 font-normal pl-1">({item.id})</span>
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide ${item.statusClass}`}>
                      {item.statusLabel}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-on-surface-variant">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
                      <span>{item.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                      <span>{item.time}</span>
                    </div>
                    <div className="flex items-center gap-1 max-w-xs sm:max-w-md">
                      <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                      <span className="truncate">{item.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <span className={`text-xl font-black transition-colors ${item.status === 'cancelled' ? 'text-gray-400 line-through font-normal' : 'text-primary'}`}>
                  {item.price}
                </span>
                
                {item.hasDetail ? (
                  <Link to={`/my-bookings/${item.originalId}`} className="flex items-center gap-0.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors mt-1 group/btn">
                    <span>Chi tiết</span>
                    <span className="material-symbols-outlined text-[16px] transition-transform group-hover/btn:translate-x-0.5">chevron_right</span>
                  </Link>
                ) : (
                  <button className="px-4 py-1.5 bg-secondary-container text-on-secondary-fixed-variant hover:bg-secondary-fixed text-xs font-bold rounded-lg transition-all border border-outline-variant/10 shadow-2xs active:scale-[0.97]">
                    Đặt lại
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-gray-400 bg-white border border-dashed border-outline-variant/60 rounded-2xl flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-4xl text-gray-300">search_off</span>
            <span>Không tìm thấy lịch sử đặt lịch nào khớp với bộ lọc hiện tại.</span>
          </div>
        )}
      </div>

      {/* Hệ thống phân trang */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 select-none">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-outline-variant/30 text-gray-500 hover:text-primary hover:border-primary/30 transition-all shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>

          {renderPaginationButtons()}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-outline-variant/30 text-gray-500 hover:text-primary hover:border-primary/30 transition-all shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      )}

    </main>
  );
};

export default BookingHistoryPage;