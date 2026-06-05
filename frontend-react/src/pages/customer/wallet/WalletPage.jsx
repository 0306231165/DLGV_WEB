import React, { useState, useRef, useEffect } from 'react';

// ─── Mock Data Lịch sử giao dịch ──────────────────────────────────────────
const MOCK_TRANSACTIONS = [
  { id: 'TXN-001', type: 'deposit', amount: 500000, date: '05/06/2026 14:20', status: 'success', method: 'Ví MoMo', desc: 'Nạp tiền vào ví' },
  { id: 'TXN-002', type: 'payment', amount: -425000, date: '04/06/2026 08:30', status: 'success', method: 'Ví CleanTrust', desc: 'Thanh toán lịch hẹn CLN-20240001' },
  { id: 'TXN-003', type: 'refund', amount: 200000, date: '02/06/2026 17:00', status: 'success', method: 'Ví CleanTrust', desc: 'Hoàn tiền hủy lịch hẹn CLN-20240009' },
  { id: 'TXN-004', type: 'withdraw', amount: -200000, fee: 40000, net: 160000, date: '30/05/2026 11:15', status: 'pending', method: 'Techcombank', desc: 'Rút tiền về tài khoản ngân hàng' },
  { id: 'TXN-005', type: 'withdraw', amount: -100000, fee: 20000, net: 80000, date: '25/05/2026 09:00', status: 'success', method: 'Vietcombank', desc: 'Rút tiền về tài khoản ngân hàng' },
];

const WalletPage = () => {
  const [balance, setBalance] = useState(850000); 
  const [activeTab, setActiveTab] = useState('all'); 

  // Trạng thái đóng mở các popup Modal
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Custom Dropdown States (Học tập từ VoucherPage)
  const [isDepositDropdownOpen, setIsDepositDropdownOpen] = useState(false);
  const [depositMethod, setDepositMethod] = useState('Ví điện tử MoMo');
  const depositDropdownRef = useRef(null);

  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [bankName, setBankName] = useState('Vietcombank');
  const bankDropdownRef = useRef(null);

  // Form states (Lưu dưới dạng chuỗi có dấu phẩy để hiển thị UI)
  const [depositAmountStr, setDepositAmountStr] = useState('');
  const [withdrawAmountStr, setWithdrawAmountStr] = useState('');
  const [bankInfo, setBankInfo] = useState({ number: '', holder: '' });

  // Đóng dropdown khi click ra ngoài vùng chọn
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (depositDropdownRef.current && !depositDropdownRef.current.contains(event.target)) {
        setIsDepositDropdownOpen(false);
      }
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target)) {
        setIsBankDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hàm định dạng số sang dạng chuỗi có dấu phẩy (Ví dụ: 1000000 -> "1,000,000")
  const formatNumberWithCommas = (value) => {
    if (!value) return '';
    const cleanValue = value.replace(/\D/g, ''); // Xóa hết ký tự không phải số
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Hàm chuyển chuỗi chứa dấu phẩy ngược lại thành số nguyên để tính toán toán học
  const parseRawNumber = (str) => {
    if (!str) return 0;
    return Number(str.replace(/,/g, ''));
  };

  const fmt = (num) => num.toLocaleString('vi-VN') + 'đ';

  // Lấy giá trị số nguyên nguyên bản để xử lý logic tính phí
  const rawDepositAmount = parseRawNumber(depositAmountStr);
  const rawWithdrawAmount = parseRawNumber(withdrawAmountStr);

  const withdrawFee = rawWithdrawAmount * 0.20; // Phí sàn cố định 20%
  const actualReceive = rawWithdrawAmount - withdrawFee;

  // Xử lý sự kiện nạp tiền
  const handleDepositSubmit = (e) => {
    e.preventDefault();
    if (rawDepositAmount <= 0) return;
    setBalance(prev => prev + rawDepositAmount);
    alert(`Nạp thành công ${fmt(rawDepositAmount)} vào tài khoản từ phương thức [${depositMethod}]!`);
    setShowDepositModal(false);
    setDepositAmountStr('');
  };

  // Xử lý sự kiện rút tiền
  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    if (rawWithdrawAmount <= 0) return;
    if (rawWithdrawAmount > balance) {
      alert('Số dư tài khoản ví hiện tại không đủ để thực hiện lệnh rút!');
      return;
    }
    setBalance(prev => prev - rawWithdrawAmount);
    alert(`Gửi yêu cầu rút tiền thành công!\nSố tiền rút: ${fmt(rawWithdrawAmount)}\nPhí rút (20%): ${fmt(withdrawFee)}\nSố tiền chuyển về ngân hàng ${bankName}: ${fmt(actualReceive)}`);
    setShowWithdrawModal(false);
    setWithdrawAmountStr('');
    setBankInfo({ number: '', holder: '' });
  };

  const filteredTransactions = MOCK_TRANSACTIONS.filter(txn => {
    if (activeTab === 'all') return true;
    return txn.type === activeTab;
  });

  return (
    <div className="min-h-screen bg-background-2 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <h1 className="font-h1 text-h1 text-on-surface text-primary mb-2">Ví CleanTrust của tôi</h1>
        <p className="text-on-surface-variant text-sm mb-8">Quản lý nguồn tiền, nạp tiền tiện lợi và theo dõi lịch sử chi tiêu dịch vụ của bạn.</p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* ─── CỘT TRÁI: THÈ VÍ & ĐIỀU KHOẢN RÕ RÀNG (5 Cột) ─── */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-primary via-primary/90 to-blue-700 text-on-primary p-6 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                <span className="material-symbols-outlined text-[150px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
              </div>
              
              <div className="flex items-center gap-2 text-on-primary/70 text-xs font-black uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-sm">shield</span>
                Số dư khả dụng
              </div>
              <div className="text-3xl font-black mb-8 tracking-tight">{fmt(balance)}</div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDepositModal(true)}
                  className="flex-1 py-3 bg-white text-primary hover:bg-surface-container-lowest font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm shadow-md"
                >
                  <span className="material-symbols-outlined text-base font-bold">add_circle</span>
                  Nạp tiền
                </button>
                <button 
                  onClick={() => setShowWithdrawModal(true)}
                  className="flex-1 py-3 bg-primary-container text-white border border-white/20 hover:bg-white/10 font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                >
                  <span className="material-symbols-outlined text-base">account_balance</span>
                  Rút về bbank
                </button>
              </div>
            </div>

            {/* 🎯 THIẾT KẾ LẠI BOX QUY ĐỊNH: UI/UX Siêu rõ ràng, Đậm nét, Dễ nhìn */}
            <div className="bg-white p-5 rounded-3xl border border-outline-variant/40 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-primary font-black text-base border-b border-outline-variant/20 pb-2.5">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
                Quy định sử dụng ví:
              </div>
              
              <div className="flex gap-3 items-start text-sm text-on-surface font-medium leading-relaxed">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                <p>Thanh toán trực tiếp bằng số dư ví được <span className="text-primary font-bold">giảm thêm 2%</span> trên tổng giá trị hóa đơn đặt lịch dọn dẹp.</p>
              </div>

              <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 flex gap-3 items-start">
                <span className="material-symbols-outlined text-red-700 shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                <div className="text-xs text-red-900 leading-relaxed font-bold">
                  CHÍNH SÁCH KHẤU TRỪ SÀN:
                  <span className="block font-medium text-red-800 mt-1">
                    Khi khách hàng thực hiện lệnh rút tiền từ Ví nội bộ về tài khoản Ngân hàng cá nhân, hệ thống bắt buộc áp dụng mức <span className="text-red-700 font-black underline decoration-2">phí xử lý là 20%</span> trên tổng số tiền yêu cầu rút.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── CỘT PHẢI: LỊCH SỬ GIAO DỊCH (7 Cột) ─── */}
          <div className="md:col-span-7 bg-white p-6 rounded-3xl shadow-md border border-outline-variant/30">
            <h3 className="font-h3 text-h3 text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">history</span>
              Lịch sử giao dịch
            </h3>

            <div className="flex gap-1 overflow-x-auto pb-2 mb-4 border-b border-outline-variant/20 scrollbar-none">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'deposit', label: 'Nạp tiền' },
                { id: 'payment', label: 'Thanh toán' },
                { id: 'withdraw', label: 'Rút tiền' },
                { id: 'refund', label: 'Hoàn tiền' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-primary text-on-primary' : 'bg-surface hover:bg-surface-container-high text-on-surface-variant'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((txn) => {
                  const isNegative = txn.amount < 0;
                  return (
                    <div key={txn.id} className="flex items-center justify-between p-3 bg-surface hover:bg-surface-container-low rounded-xl border border-outline-variant/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          txn.type === 'deposit' ? 'bg-secondary/10 text-secondary' :
                          txn.type === 'payment' ? 'bg-primary/10 text-primary' :
                          txn.type === 'refund' ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'
                        }`}>
                          <span className="material-symbols-outlined text-xl">
                            {txn.type === 'deposit' ? 'arrow_downward' :
                             txn.type === 'payment' ? 'shopping_bag' :
                             txn.type === 'refund' ? 'keyboard_return' : 'arrow_upward'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface">{txn.desc}</p>
                          <p className="text-[11px] text-on-surface-variant mt-0.5">{txn.date} · <span className="italic">{txn.method}</span></p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-sm font-black ${isNegative ? 'text-on-surface' : 'text-secondary'}`}>
                          {isNegative ? '' : '+'}{fmt(txn.amount)}
                        </p>
                        {txn.fee && (
                          <p className="text-[10px] text-error font-semibold">Phí rút 20%: -{fmt(txn.fee)}</p>
                        )}
                        <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-1 ${txn.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-600'}`}>
                          {txn.status === 'success' ? 'Thành công' : 'Chờ duyệt'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-on-surface-variant text-sm">Không tìm thấy giao dịch nào tương ứng.</div>
              )}
            </div>
          </div>
        </div>

        {/* ─── MODAL 1: POPUP NẠP TIỀN ĐÃ SỬA CUSTOM DROPDOWN + PHẨY SỐ TIỀN ─── */}
        {showDepositModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/30 animate-scale-up">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-h3 text-h3 text-on-surface">Nạp tiền vào ví điện tử</h3>
                <button onClick={() => setShowDepositModal(false)} className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant hover:bg-error/10 hover:text-error flex items-center justify-center transition-all">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <form onSubmit={handleDepositSubmit} className="space-y-5">
                {/* Input nhập tiền tích hợp gõ dấu phẩy thông minh */}
                <div>
                  <label className="block text-xs font-black uppercase text-on-surface-variant mb-1.5 tracking-wider">Nhập số tiền muốn nạp (VND)</label>
                  <div className="relative flex items-center">
                    <input 
                      type="text" 
                      inputMode="numeric"
                      placeholder="Ví dụ: 2,000,000" 
                      required
                      value={depositAmountStr}
                      onChange={(e) => setDepositAmountStr(formatNumberWithCommas(e.target.value))}
                      className="w-full pl-4 pr-12 py-3 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-base font-black tracking-wide text-on-surface"
                    />
                    <span className="absolute right-4 text-sm font-bold text-on-surface-variant">đ</span>
                  </div>
                </div>

                {/* 🌟 CUSTOM DROPDOWN: Tuyệt đẹp bê từ VoucherPage sang */}
                <div className="relative" ref={depositDropdownRef}>
                  <label className="block text-xs font-black uppercase text-on-surface-variant mb-1.5 tracking-wider">Chọn phương thức nạp</label>
                  <button 
                    type="button"
                    onClick={() => setIsDepositDropdownOpen(!isDepositDropdownOpen)}
                    className="w-full bg-surface border border-outline-variant text-on-surface text-[14px] font-semibold py-3 px-4 rounded-xl shadow-sm cursor-pointer flex items-center justify-between hover:border-primary/50 transition-all"
                  >
                    <span className="font-bold">{depositMethod}</span>
                    <span className={`material-symbols-outlined text-on-surface-variant text-[22px] transition-transform duration-200 ${isDepositDropdownOpen ? 'rotate-180 text-primary' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  
                  {isDepositDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-outline-variant/30 overflow-hidden z-30 py-1 animate-scale-up">
                      {[
                        'Ví điện tử MoMo',
                        'Cổng thanh toán VNPAY',
                        'Thẻ quốc tế Visa/Mastercard'
                      ].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => {
                            setDepositMethod(method);
                            setIsDepositDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-[14px] transition-colors hover:bg-primary/5 ${depositMethod === method ? 'font-black text-primary bg-primary/10' : 'font-medium text-on-surface'}`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full py-3.5 bg-primary text-on-primary font-bold rounded-xl mt-4 shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all">
                  Xác nhận Thanh toán & Nạp ví
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ─── MODAL 2: POPUP RÚT TIỀN ĐÃ SỬA CUSTOM DROPDOWN + PHẨY SỐ TIỀN ─── */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/30 animate-scale-up">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-h3 text-h3 text-on-surface">Rút tiền về Ngân hàng</h3>
                <button onClick={() => setShowWithdrawModal(false)} className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant hover:bg-error/10 hover:text-error flex items-center justify-center transition-all">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 mb-4 flex items-start gap-2">
                <span className="material-symbols-outlined text-red-700 text-sm shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                <span className="font-medium">Lưu ý: Phí rút tiền về ngân hàng là <span className="font-black text-red-700 underline">20%</span> giá trị giao dịch theo điều khoản quy định của sàn ứng dụng.</span>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                {/* Custom Ngân hàng Dropdown */}
                <div className="relative" ref={bankDropdownRef}>
                  <label className="block text-xs font-black uppercase text-on-surface-variant mb-1.5 tracking-wider">Chọn ngân hàng nhận</label>
                  <button 
                    type="button"
                    onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                    className="w-full bg-surface border border-outline-variant text-on-surface text-[14px] font-semibold py-3 px-4 rounded-xl shadow-sm cursor-pointer flex items-center justify-between hover:border-primary/50 transition-all"
                  >
                    <span className="font-bold">{bankName}</span>
                    <span className={`material-symbols-outlined text-on-surface-variant text-[22px] transition-transform duration-200 ${isBankDropdownOpen ? 'rotate-180 text-primary' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  
                  {isBankDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-outline-variant/30 overflow-hidden z-30 py-1">
                      {['Vietcombank', 'Techcombank', 'MB Bank (Quân Đội)', 'ACB'].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => {
                            setBankName(bank);
                            setIsBankDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-[14px] transition-colors hover:bg-primary/5 ${bankName === bank ? 'font-black text-primary bg-primary/10' : 'font-medium text-on-surface'}`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase text-on-surface-variant mb-1.5 tracking-wider">Số tài khoản</label>
                    <input 
                      type="text" placeholder="1903..." required
                      value={bankInfo.number}
                      onChange={(e) => setBankInfo({...bankInfo, number: e.target.value.replace(/\D/g, '')})}
                      className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-on-surface-variant mb-1.5 tracking-wider">Tên chủ thẻ</label>
                    <input 
                      type="text" placeholder="NGUYEN VAN A" required
                      value={bankInfo.holder}
                      onChange={(e) => setBankInfo({...bankInfo, holder: e.target.value.toUpperCase()})}
                      className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm uppercase font-black tracking-wide"
                    />
                  </div>
                </div>

                {/* Ô nhập tiền rút có dấu phẩy phân tách */}
                <div>
                  <label className="block text-xs font-black uppercase text-on-surface-variant mb-1.5 tracking-wider">Số tiền muốn rút từ ví</label>
                  <div className="relative flex items-center">
                    <input 
                      type="text" 
                      inputMode="numeric"
                      placeholder="Tối thiểu 50,000" 
                      required
                      value={withdrawAmountStr}
                      onChange={(e) => setWithdrawAmountStr(formatNumberWithCommas(e.target.value))}
                      className="w-full pl-4 pr-12 py-3 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-base font-black text-error"
                    />
                    <span className="absolute right-4 text-sm font-bold text-on-surface-variant">đ</span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant mt-1.5 block font-medium">Số dư hiện tại: <span className="font-bold text-on-surface">{fmt(balance)}</span></span>
                </div>

                {/* Tính tiền tự động chuẩn xác thời gian thực hiển thị minh bạch */}
                {rawWithdrawAmount > 0 && (
                  <div className="p-4 bg-surface rounded-xl border border-outline-variant/30 space-y-2 text-xs font-semibold">
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Số tiền yêu cầu rút:</span>
                      <span className="font-bold text-on-surface">{fmt(rawWithdrawAmount)}</span>
                    </div>
                    <div className="flex justify-between text-error">
                      <span>Phí sàn khấu trừ (20%):</span>
                      <span className="font-bold">-{fmt(withdrawFee)}</span>
                    </div>
                    <div className="h-px bg-outline-variant/20 my-1" />
                    <div className="flex justify-between text-sm text-secondary font-black">
                      <span>Thực nhận về ngân hàng:</span>
                      <span>{fmt(actualReceive <= 0 ? 0 : actualReceive)}</span>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={rawWithdrawAmount > balance || rawWithdrawAmount < 50000}
                  className="w-full py-3.5 bg-error text-white font-bold rounded-xl mt-4 shadow-lg shadow-error/20 hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none text-sm"
                >
                  {rawWithdrawAmount > balance ? 'Số dư không đủ' : 'Tạo lệnh rút tiền'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default WalletPage;