import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// ─── 1. BỘ DỮ LIỆU GIỮ NGUYÊN ĐỂ BẠN TEST CHÍNH XÁC ───
const HISTORY_DATA = [
  { id: 'DH001', title: 'Tổng vệ sinh căn hộ (Deep Clean)', icon: 'home', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '15/10/2023', time: '08:00 - 12:00', location: 'Vinhomes Central Park, Q.Bình Thạnh', price: '1.250.000đ', hasDetail: true },
  { id: 'DH002', title: 'Vệ sinh định kỳ (Regular Clean)', icon: 'cleaning_services', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '14/10/2023', time: '09:00 - 11:00', location: 'Chung cư Sunrise City, Quận 7', price: '450.000đ', hasDetail: true },
  { id: 'DH003', title: 'Giặt sofa và thảm phòng khách', icon: 'chair', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '12/10/2023', time: '14:00 - 16:00', location: 'Masteri Thảo Điền, Quận 2', price: '750.000đ', hasDetail: true },
  { id: 'DH004', title: 'Vệ sinh kính mặt ngoài chung cư', icon: 'window', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '10/10/2023', time: '08:00 - 11:30', location: 'Đảo Kim Cương, Quận 2', price: '1.500.000đ', hasDetail: true },
  { id: 'DH005', title: 'Dọn dẹp văn phòng công ty nhỏ', icon: 'corporate_fare', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '08/10/2023', time: '13:00 - 17:00', location: 'Tòa nhà Bitexco, Quận 1', price: '2.200.000đ', hasDetail: true },
  { id: 'DH006', title: 'Khử khuẩn môi trường định kỳ', icon: 'vaccines', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '05/10/2023', time: '15:00 - 16:00', location: 'Khu đô thị Sala, Quận 2', price: '600.000đ', hasDetail: true },
  { id: 'DH007', title: 'Vệ sinh máy lạnh Inverter', icon: 'ac_unit', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '03/10/2023', time: '09:00 - 10:30', location: 'Chung cư Hà Đô, Quận 10', price: '350.000đ', hasDetail: true },
  { id: 'DH008', title: 'Dọn nhà trống đón Tết sớm', icon: 'local_shipping', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '01/10/2023', time: '08:00 - 16:00', location: 'Mỹ Mỹ Villa, Quận 7', price: '4.000.000đ', hasDetail: true },
  { id: 'DH009', title: 'Ủi đồ và dọn dẹp tủ quần áo', icon: 'iron', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '28/09/2023', time: '14:00 - 17:00', location: 'The Manor, Q.Bình Thạnh', price: '500.000đ', hasDetail: true },
  { id: 'DH010', title: 'Hút bụi nội thất xe ô tô 7 chỗ', icon: 'directions_car', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '25/09/2023', time: '10:00 - 12:00', location: 'Vinhomes Golden River, Quận 1', price: '850.000đ', hasDetail: true },
  { id: 'DH011', title: 'Vệ sinh định kỳ (Regular Clean)', icon: 'cleaning_services', status: 'cancelled', statusLabel: 'ĐÃ HỦY', statusClass: 'bg-red-50 text-red-600 border border-red-200/50', date: '02/10/2023', time: '14:00 - 17:00', location: 'Masteri Thảo Điền, Quận 2', price: '450.000đ', hasDetail: false },
  { id: 'DH012', title: 'Vệ sinh nhà mới (Move-in Clean)', icon: 'local_shipping', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '20/09/2023', time: '09:00 - 16:00', location: 'Khu đô thị Sala, Quận 2', price: '2.800.000đ', hasDetail: true },
  { id: 'DH013', title: 'Giặt ghế Sofa & Thảm trải sàn', icon: 'styler', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '05/09/2023', time: '13:30 - 16:30', location: 'Estella Heights, Quận 2', price: '750.000đ', hasDetail: true },
  { id: 'DH014', title: 'Vệ sinh kính mặt ngoài tòa nhà', icon: 'window', status: 'cancelled', statusLabel: 'ĐÃ HỦY', statusClass: 'bg-red-50 text-red-600 border border-red-200/50', date: '28/08/2023', time: '08:00 - 11:30', location: 'Phú Mỹ Hưng, Quận 7', price: '1.900.000đ', hasDetail: false },
  { id: 'DH015', title: 'Khử khuẩn & Diệt côn trùng định kỳ', icon: 'vaccines', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '12/08/2023', time: '15:00 - 17:00', location: 'Landmark 81, Q.Bình Thạnh', price: '600.000đ', hasDetail: true },
  { id: 'DH016', title: 'Vệ sinh máy lạnh & Máy giặt', icon: 'ac_unit', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '01/08/2023', time: '09:00 - 11:00', location: 'Sunrise City, Quận 7', price: '350.000đ', hasDetail: true },
  { id: 'DH017', title: 'Tổng vệ sinh văn phòng công ty', icon: 'corporate_fare', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '25/07/2023', time: '07:30 - 12:00', location: 'Bitexco Financial Tower, Quận 1', price: '4.500.000đ', hasDetail: true },
  { id: 'DH018', title: 'Dọn dẹp nội thất ô tô tại nhà', icon: 'directions_car', status: 'cancelled', statusLabel: 'ĐÃ HỦY', statusClass: 'bg-red-50 text-red-600 border border-red-200/50', date: '18/07/2023', time: '14:00 - 16:30', location: 'Chung cư Miếu Nổi, Q.Bình Thạnh', price: '850.000đ', hasDetail: false },
  { id: 'DH019', title: 'Vệ sinh định kỳ (Regular Clean)', icon: 'cleaning_services', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '10/07/2023', time: '08:00 - 11:00', location: 'Masteri Thảo Điền, Quận 2', price: '450.000đ', hasDetail: true },
  { id: 'DH020', title: 'Ủi quần áo & Sắp xếp tủ đồ', icon: 'iron', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '02/07/2023', time: '13:00 - 16:00', location: 'Vinhomes Golden River, Quận 1', price: '500.000đ', hasDetail: true },
  { id: 'DH021', title: 'Vệ sinh bể bơi gia đình', icon: 'pool', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '25/06/2023', time: '08:00 - 12:00', location: 'Château Villa, Quận 7', price: '3.200.000đ', hasDetail: true },
  { id: 'DH022', title: 'Vệ sinh sofa da cao cấp', icon: 'chair', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '15/06/2023', time: '14:00 - 16:00', location: 'The Manor, Q.Bình Thạnh', price: '900.000đ', hasDetail: true },
  { id: 'DH023', title: 'Dọn nhà theo giờ chuyên sâu', icon: 'schedule', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '08/06/2023', time: '08:00 - 12:00', location: 'Hà Đô Centrosa, Quận 10', price: '650.000đ', hasDetail: true },
  { id: 'DH024', title: 'Vệ sinh rèm cửa & Thảm sàn', icon: 'texture', status: 'cancelled', statusLabel: 'ĐÃ HỦY', statusClass: 'bg-red-50 text-red-600 border border-red-200/50', date: '01/06/2023', time: '10:00 - 12:30', location: 'Chung cư Carina, Quận 8', price: '550.000đ', hasDetail: false },
  { id: 'DH025', title: 'Tổng vệ sinh sau xây dựng', icon: 'construction', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '24/05/2023', time: '08:00 - 17:00', location: 'Khu biệt thự Thảo Điền, Quận 2', price: '5.800.000đ', hasDetail: true },
  { id: 'DH026', title: 'Vệ sinh định kỳ (Regular Clean)', icon: 'cleaning_services', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '17/05/2023', time: '13:00 - 16:00', location: 'Masteri Thảo Điền, Quận 2', price: '450.000đ', hasDetail: true },
  { id: 'DH027', title: 'Thông nghẹt & Vệ sinh bồn cầu', icon: 'plumbing', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '10/05/2023', time: '09:00 - 10:30', location: 'Chung cư Lê Thành, Quận Bình Tân', price: '300.000đ', hasDetail: true },
  { id: 'DH028', title: 'Vệ sinh kho bãi hàng hóa', icon: 'warehouse', status: 'cancelled', statusLabel: 'ĐÃ HỦY', statusClass: 'bg-red-50 text-red-600 border border-red-200/50', date: '02/05/2023', time: '08:00 - 15:00', location: 'KCN Tân Bình, Q.Tân Phú', price: '4.200.000đ', hasDetail: false },
  { id: 'DH029', title: 'Vệ sinh hệ thống hút mùi bếp', icon: 'cooking', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '25/04/2023', time: '14:00 - 16:30', location: 'Saigon Pearl, Q.Bình Thạnh', price: '800.000đ', hasDetail: true },
  { id: 'DH030', title: 'Đánh bóng sàn đá Marble phòng khách', icon: 'layers', status: 'completed', statusLabel: 'ĐÃ HOÀN THÀNH', statusClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50', date: '14/02/2023', time: '08:00 - 15:00', location: 'Biệt thự Mỹ Mỹ, Quận 2', price: '3.500.000đ', hasDetail: true }
];

// Danh sách lựa chọn thời gian (Dựa trên cục data giả năm 2023 để test được luôn)
const TIME_OPTIONS = [
  { id: 'all', label: 'Tất cả thời gian' },
  { id: '10-2023', label: 'Tháng 10 / 2023' },
  { id: '09-2023', label: 'Tháng 09 / 2023' },
  { id: '08-2023', label: 'Tháng 08 / 2023' },
  { id: '07-2023', label: 'Tháng 07 / 2023' },
  { id: '06-2023', label: 'Tháng 06 / 2023' },
  { id: '05-2023', label: 'Tháng 05 / 2023' },
  { id: '04-2023', label: 'Tháng 04 / 2023' },
  { id: '02-2023', label: 'Tháng 02 / 2023' },
];

const BookingHistoryPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState(''); // State tìm kiếm
  const [timeFilter, setTimeFilter] = useState('all'); // State lọc thời gian
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State đóng mở dropdown thời gian
  
  // Trạng thái phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; 

  // ─── BỘ LỌC TỔNG HỢP (KẾT HỢP BIẾN TÌM KIẾM + TAB TRẠNG THÁI + THỜI GIAN) ───
  const filteredData = HISTORY_DATA.filter((item) => {
    // 1. Lọc theo Tab trạng thái
    const matchesTab = activeTab === 'all' || item.status === activeTab;

    // 2. Lọc theo Ô tìm kiếm (Không phân biệt hoa thường, check cả Tên dịch vụ lẫn Mã đơn hàng)
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    // 3. Lọc theo thời gian được chọn
    let matchesTime = true;
    if (timeFilter !== 'all') {
      // Tách chuỗi '15/10/2023' lấy Tháng và Năm
      const [, month, year] = item.date.split('/'); 
      const itemMonthYear = `${month}-${year}`; // Kết quả dạng '10-2023'
      matchesTime = itemMonthYear === timeFilter;
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
        <h1 className="font-h1 text-h1 text-on-surface mb-2">Lịch sử đặt lịch</h1>
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
                  <button className="flex items-center gap-0.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors mt-1 group/btn">
                    <span>Chi tiết</span>
                    <span className="material-symbols-outlined text-[16px] transition-transform group-hover/btn:translate-x-0.5">chevron_right</span>
                  </button>
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