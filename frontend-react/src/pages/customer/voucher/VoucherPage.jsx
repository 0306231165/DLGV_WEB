import React, { useState, useRef, useEffect } from 'react';
import VoucherCard from '../../../components/customer/VoucherCard';

const VoucherPage = () => {
  const [filter, setFilter] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Vệ sinh định kỳ', label: 'Vệ sinh định kỳ' },
    { value: 'Tổng vệ sinh', label: 'Tổng vệ sinh' },
    { value: 'Chăm sóc gia đình', label: 'Chăm sóc gia đình' },
    { value: 'Chuyên sâu', label: 'Chuyên sâu' },
    { value: 'Chăm sóc & Làm sạch nội thất', label: 'Chăm sóc & Làm sạch nội thất' },
    { value: 'Doanh nghiệp', label: 'Doanh nghiệp' },
  ];
  const [vouchers, setVouchers] = useState([
    {
      id: 1,
      type: 'Vệ sinh định kỳ',
      colorClass: 'bg-[#1a368d]', // Dark blue
      discountValue: '20%',
      discountType: 'GIẢM',
      badge: 'Người dùng mới',
      title: 'Tối đa 50k cho đơn từ 200k',
      description: 'Áp dụng cho dịch vụ Vệ sinh không gian sống định kỳ.',
      expiry: '30/11/2024',
      status: 'active'
    },
    {
      id: 2,
      type: 'Tổng vệ sinh',
      colorClass: 'bg-[#6b2c15]', // Brown
      discountValue: '100k',
      discountType: 'GIẢM',
      badge: 'Tổng vệ sinh',
      title: 'Giảm trực tiếp 100k',
      description: 'Áp dụng cho gói Tổng vệ sinh nhà cửa đón Tết.',
      expiry: '15/12/2024',
      status: 'active'
    },
    {
      id: 3,
      type: 'Chăm sóc & Làm sạch nội thất',
      colorClass: 'bg-[#5c6c75]', // Blue-gray
      discountValue: '15%',
      discountType: 'GIẢM',
      badge: 'Vệ sinh Sofa',
      title: 'Tối đa 80k cho đơn từ 400k',
      description: 'Làm sạch sâu sofa, nệm bằng công nghệ hơi nước nóng.',
      expiry: '20/11/2024',
      status: 'active'
    },
    {
      id: 4,
      type: 'Khác',
      colorClass: 'bg-[#a3a3a3]', // Gray
      discountValue: 'Free',
      discountType: 'PHỤ PHÍ',
      badge: 'Hết hạn',
      title: 'Miễn phí mang dụng cụ',
      description: 'Ưu đãi miễn phí 30k phí dụng cụ vệ sinh.',
      expiry: '01/01/2024',
      status: 'expired'
    }
  ]);

  const handleSave = (id) => {
    setVouchers(vouchers.map(v => v.id === id ? { ...v, status: 'saved' } : v));
    // Here we could also dispatch to a global state/API to save the voucher for the user
  };

  const filteredVouchers = vouchers.filter(v => {
    if (filter === 'all') return true;
    return v.type === filter;
  });

  return (
    <div className="w-full bg-[#f4f7fb] dark:bg-surface-container-lowest min-h-screen pt-24 pb-20 font-sans">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-8 space-y-16">
        
        {/* Hero Section */}
        <div className="relative w-full h-[360px] md:h-[420px] rounded-3xl overflow-hidden bg-[#e6eeff] shadow-sm">
           {/* Background mockup styling to mimic the image */}
           <div className="absolute inset-0 right-0 w-full h-full flex justify-end">
             {/* Replace this with a real image if available */}
             <div className="w-1/2 h-full relative">
                <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2000&auto=format&fit=crop" 
                     alt="Dọn dẹp vệ sinh" 
                     className="w-full h-full object-cover" />
                {/* Gradient mask */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#e6eeff] to-transparent"></div>
             </div>
           </div>
           
           <div className="absolute inset-0 bg-gradient-to-r from-[#e6eeff] via-[#e6eeff] to-transparent w-full md:w-2/3"></div>
           
           <div className="relative h-full flex flex-col justify-center px-10 md:px-14 w-full md:w-[60%] z-10">
             <span className="inline-block bg-[#8c3a21] text-white text-[10px] font-bold px-3 py-1 rounded-full w-max mb-5 tracking-wide">
               ƯU ĐÃI NỔI BẬT
             </span>
             <h1 className="text-4xl md:text-5xl font-black text-[#1c2b4d] mb-5 leading-[1.1]">
               Không Gian Sạch Bóng<br/>Ngập Tràn Ưu Đãi
             </h1>
             <p className="text-[15px] md:text-base text-[#4a5568] mb-8 max-w-sm leading-relaxed font-medium">
               Tận hưởng không gian sống tinh khiết và trong lành với các gói dọn dẹp chuyên nghiệp. Áp dụng mã ngay hôm nay.
             </p>
             <button className="bg-[#1a368d] text-white px-7 py-3 rounded-full font-bold text-[13px] w-max hover:bg-[#1a368d]/90 transition-all flex items-center gap-2 shadow-md">
               Khám phá ngay
               <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
             </button>
           </div>
        </div>

        {/* Voucher Section */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <h2 className="text-3xl font-black text-primary">Khám Phá Ưu Đãi Hấp Dẫn</h2>
              <p className="text-[14px] text-[#6b7280] mt-2 font-medium">Lưu mã để áp dụng tự động khi đặt lịch dịch vụ.</p>
            </div>
            
            <div className="relative pt-2 min-w-[240px]" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-white border border-outline-variant/30 text-[#4b5563] text-[14px] font-semibold py-2.5 px-5 rounded-full shadow-sm cursor-pointer flex items-center justify-between hover:border-[#1a368d]/50 transition-colors"
              >
                {filterOptions.find(opt => opt.value === filter)?.label || 'Tất cả'}
                <span className={`material-symbols-outlined text-on-surface-variant text-[20px] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-outline-variant/20 overflow-hidden z-20 py-1">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setFilter(opt.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-5 py-2.5 text-[14px] transition-colors hover:bg-surface-variant/30 ${filter === opt.value ? 'font-bold text-[#1a368d] bg-[#eaf0fb]' : 'font-medium text-[#4b5563]'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {filteredVouchers.map(voucher => (
              <VoucherCard key={voucher.id} voucher={voucher} onSave={handleSave} />
            ))}
          </div>

          <div className="flex justify-center mt-10 pt-4">
            <button className="flex items-center gap-2 px-6 py-2.5 border border-[#d1d5db] bg-white rounded-full text-[14px] font-semibold text-[#4b5563] hover:bg-surface-variant/50 transition-colors shadow-sm">
              Xem thêm mã
              <span className="material-symbols-outlined text-[20px]">expand_more</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VoucherPage;
