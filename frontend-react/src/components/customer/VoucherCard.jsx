import React from 'react';

const VoucherCard = ({ voucher, onSave }) => {
  const isExpired = voucher.status === 'expired';
  const isSaved = voucher.status === 'saved';

  return (
    <div className={`flex flex-row rounded-xl overflow-hidden border ${isExpired ? 'border-outline-variant/50 opacity-70' : 'border-outline-variant/30'} shadow-sm bg-surface`}>
      {/* Left side */}
      <div className={`w-[130px] flex-shrink-0 flex flex-col justify-center items-center text-white p-4 relative ${voucher.colorClass}`}>
        <span className="text-3xl font-black">{voucher.discountValue}</span>
        <span className="text-xs font-semibold mt-1 tracking-wider">{voucher.discountType}</span>
        {/* Decorative dots to create a perforated line effect */}
        <div className="absolute right-[-4px] top-0 bottom-0 w-[8px] flex flex-col justify-between py-1 z-10">
           {[...Array(8)].map((_, i) => (
             <div key={i} className="w-2 h-2 rounded-full bg-surface-container-lowest"></div>
           ))}
        </div>
      </div>
      
      {/* Right side */}
      <div className="flex-1 p-5 flex flex-col relative bg-white dark:bg-surface-container">
        <div className="mb-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${isExpired ? 'bg-surface-variant text-on-surface-variant' : 'bg-[#eaf0fb] text-[#1a368d] dark:bg-primary-container dark:text-on-primary-container'}`}>
            {voucher.badge}
          </span>
        </div>
        <h3 className="font-bold text-on-surface text-[15px] mb-1 leading-tight">{voucher.title}</h3>
        <p className="text-[13px] text-on-surface-variant flex-1 mb-4 leading-snug">{voucher.description}</p>
        
        <div className="flex justify-between items-end mt-auto pt-2 border-t border-outline-variant/20 border-dashed">
          <div className="flex flex-col">
            <span className={`text-[11px] ${isExpired ? 'text-error font-semibold' : 'text-on-surface-variant'}`}>
              {isExpired ? 'Đã hết hạn' : `HSD: ${voucher.expiry}`}
            </span>
          </div>
          <button 
            onClick={() => !isExpired && !isSaved && onSave(voucher.id)}
            disabled={isExpired || isSaved}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              isExpired
                ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed'
                : isSaved 
                  ? 'bg-[#eaf0fb] text-[#1a368d] cursor-not-allowed'
                  : 'bg-[#1a368d] text-white hover:bg-[#1a368d]/90 shadow-sm'
            }`}
          >
            {isSaved ? 'Sẵn sàng' : (isExpired ? 'Đã hết hạn' : 'Lưu mã')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherCard;
