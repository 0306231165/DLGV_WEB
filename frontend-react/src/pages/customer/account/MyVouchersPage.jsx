import React, { useState } from 'react';
import VoucherCard from '../../../components/customer/VoucherCard';
import { Link } from 'react-router-dom';

const MyVouchersPage = () => {
  // Simulate saved vouchers that the user has already collected
  const [savedVouchers] = useState([
    {
      id: 1,
      type: 'Vệ sinh định kỳ',
      colorClass: 'bg-[#1a368d]',
      discountValue: '20%',
      discountType: 'GIẢM',
      badge: 'Người dùng mới',
      title: 'Tối đa 50k cho đơn từ 200k',
      description: 'Áp dụng cho dịch vụ Vệ sinh không gian sống định kỳ.',
      expiry: '30/11/2024',
      status: 'saved' // Already saved
    },
    {
      id: 3,
      type: 'Khác',
      colorClass: 'bg-[#5c6c75]', 
      discountValue: '15%',
      discountType: 'GIẢM',
      badge: 'Vệ sinh Sofa',
      title: 'Tối đa 80k cho đơn từ 400k',
      description: 'Làm sạch sâu sofa, nệm bằng công nghệ hơi nước nóng.',
      expiry: '20/11/2024',
      status: 'saved'
    },
    {
      id: 4,
      type: 'Khác',
      colorClass: 'bg-[#a3a3a3]',
      discountValue: 'Free',
      discountType: 'PHỤ PHÍ',
      badge: 'Hết hạn',
      title: 'Miễn phí mang dụng cụ',
      description: 'Ưu đãi miễn phí 30k phí dụng cụ vệ sinh.',
      expiry: '01/01/2024',
      status: 'expired'
    }
  ]);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="font-h3 text-h3 font-bold text-on-surface">Mã giảm giá của tôi</h1>
        <p className="text-body-md text-on-surface-variant mt-2">Quản lý các mã giảm giá bạn đã lưu từ trang Khuyến mãi. Các mã này sẽ được tự động gợi ý khi bạn đặt lịch.</p>
      </div>

      {savedVouchers.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {savedVouchers.map(voucher => (
            <VoucherCard key={voucher.id} voucher={voucher} onSave={() => {}} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-container-low rounded-2xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-[72px] text-outline-variant mb-4 opacity-50">local_offer</span>
          <h3 className="font-bold text-lg text-on-surface mb-2">Chưa có mã giảm giá nào</h3>
          <p className="text-on-surface-variant text-sm mb-6 max-w-md leading-relaxed">
            Bạn chưa lưu mã giảm giá nào. Hãy đến trang Khuyến mãi để săn những ưu đãi hấp dẫn giúp tiết kiệm chi phí dọn dẹp nhé!
          </p>
          <Link to="/promotions" className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition-all shadow-sm">
            Đến trang Khuyến mãi
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyVouchersPage;
