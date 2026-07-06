import React, { useState, useEffect } from 'react';
import nhanVienApi from '../../../api/nhanVienApi';

const PartnerWallet = () => {
  const [balance, setBalance] = useState(0); 
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const MIN_RETAINED_BALANCE = 500000; 
  const MIN_WITHDRAW_AMOUNT = 500000;  

  const maxWithdrawal = Math.max(0, balance - MIN_RETAINED_BALANCE);

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawInput, setWithdrawInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // State quản lý bộ lọc ngày của Lịch sử giao dịch (Mặc định chọn 'all' - Tất cả)
  const [dateFilter, setDateFilter] = useState('all');

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositStep, setDepositStep] = useState(1); // 1: Nhập tiền, 2: Quét QR
  const [depositInput, setDepositInput] = useState('');
  const [depositErrorMsg, setDepositErrorMsg] = useState('');

  const fetchWallet = async () => {
    try {
      const response = await nhanVienApi.getWallet();
      if (response.success) {
        setBalance(response.data.balance || 0);
        setTransactionHistory(response.data.transactions || []);
      }
    } catch (error) {
      console.error('Lỗi lấy dữ liệu ví:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  // Logic lọc dữ liệu theo ngày
  const getFilteredTransactions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return transactionHistory.filter(txn => {
      const txnDate = new Date(txn.date);
      txnDate.setHours(0, 0, 0, 0); // Đưa về 0h để so sánh chính xác theo ngày
      const timeDiff = today.getTime() - txnDate.getTime();
      const daysDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24)); // Dùng Math.round để tránh sai số thập phân

      if (dateFilter === 'today') return daysDiff === 0;
      if (dateFilter === '7days') return daysDiff <= 7;
      if (dateFilter === '30days') return daysDiff <= 30;
      return true; // 'all'
    });
  };

  const filteredTxns = getFilteredTransactions();

  const formatNumberWithCommas = (value) => {
    if (!value) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parseRawNumber = (str) => {
    return Number(str.replace(/,/g, ''));
  };

  const handleInputChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (/^\d*$/.test(rawValue)) {
      setWithdrawInput(formatNumberWithCommas(rawValue));
    }
  };

  const handleDepositInputChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (/^\d*$/.test(rawValue)) {
      setDepositInput(formatNumberWithCommas(rawValue));
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amount = parseRawNumber(withdrawInput);

    if (!amount || amount < MIN_WITHDRAW_AMOUNT) {
      setErrorMsg(`Số tiền rút tối thiểu là ${MIN_WITHDRAW_AMOUNT.toLocaleString()}đ`);
      return;
    }
    if (amount > maxWithdrawal) {
      setErrorMsg(`Bạn chỉ có thể rút tối đa ${maxWithdrawal.toLocaleString()}đ (Cần giữ lại 500.000đ để nhận việc)`);
      return;
    }

    try {
      const response = await nhanVienApi.withdrawWallet({ amount });
      if (response.success) {
        alert(response.message || `Yêu cầu rút ${amount.toLocaleString()}đ thành công!`);
        setIsWithdrawModalOpen(false);
        setWithdrawInput('');
        setErrorMsg('');
        fetchWallet(); // Tải lại dữ liệu ví
      } else {
        setErrorMsg(response.message || 'Có lỗi xảy ra khi rút tiền');
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Có lỗi xảy ra khi gọi API rút tiền');
    }
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    const amount = parseRawNumber(depositInput);

    if (!amount || amount < 10000) {
      setDepositErrorMsg('Số tiền nạp tối thiểu là 10,000đ');
      return;
    }

    if (depositStep === 1) {
      // Chuyển sang bước 2: Hiện QR
      setDepositStep(2);
      setDepositErrorMsg('');
      return;
    }

    if (depositStep === 2) {
      // Chuyển sang bước 3: Đang kiểm tra giao dịch (Mô phỏng Webhook)
      setDepositStep(3);
      setDepositErrorMsg('');
      
      // Giả lập thời gian chờ hệ thống ngân hàng (Casso/PayOS) xử lý webhook mất khoảng 3 giây
      setTimeout(async () => {
        try {
          const response = await nhanVienApi.depositWallet({ amount });
          if (response.success) {
            alert(response.message || `Nạp ${amount.toLocaleString()}đ thành công!`);
            closeDepositModal();
            fetchWallet(); // Tải lại dữ liệu ví
          } else {
            setDepositStep(2);
            setDepositErrorMsg(response.message || 'Có lỗi xảy ra khi nạp tiền');
          }
        } catch (error) {
          setDepositStep(2);
          setDepositErrorMsg(error.response?.data?.message || 'Có lỗi xảy ra khi gọi API nạp tiền');
        }
      }, 3000);
    }
  };

  const closeDepositModal = () => {
    setIsDepositModalOpen(false);
    setDepositErrorMsg('');
    setDepositInput('');
    setDepositStep(1);
  };

  // Hàm format ngày hiển thị từ YYYY-MM-DD sang DD/MM/YYYY
  const displayDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split(' ')[0].split('-');
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return <div className="p-6 text-slate-500 animate-pulse text-center w-full">Đang tải dữ liệu ví...</div>;
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen flex justify-center items-start">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-100 flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ví & Thu nhập</h1>
              <p className="text-sm text-slate-500">Quản lý số dư công việc, nạp/rút tiền và dòng tiền của bạn.</p>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 max-w-xs">
            <div className="flex gap-2 items-start">
              <span className="material-symbols-outlined text-amber-600 text-sm mt-0.5">info</span>
              <p className="text-xs text-amber-800 leading-normal">
                <strong className="font-bold">Lưu ý:</strong> Luôn giữ lại tối thiểu <span className="font-bold text-amber-900">500.000đ</span> trong tài khoản để hệ thống phân phối lịch làm việc mới.
              </p>
            </div>
          </div>
        </div>

        {/* KHU VỰC THẺ SỐ DƯ & HÀNH ĐỘNG */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1 bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 rounded-2xl text-white shadow-lg shadow-emerald-600/10 border border-emerald-500 flex flex-col justify-between">
            <div>
              <span className="text-xs text-emerald-100 font-bold uppercase tracking-wider opacity-80">Tổng số dư ví</span>
              <h2 className="text-3xl font-black mt-1 tracking-tight">{balance.toLocaleString()}đ</h2>
            </div>
            <div className="mt-6 pt-4 border-t border-emerald-500/30">
              <div className="flex justify-between text-xs text-emerald-100">
                <span>Số dư khả dụng rút:</span>
                <span className="font-bold text-white">{maxWithdrawal.toLocaleString()}đ</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500 transition-colors bg-white">
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">Rút tiền về ngân hàng</h3>
                <p className="text-xs text-slate-400">Hỗ trợ rút về tài khoản ngân hàng liên kết từ 500k.</p>
              </div>
              <button 
                onClick={() => setIsWithdrawModalOpen(true)}
                disabled={maxWithdrawal < MIN_WITHDRAW_AMOUNT}
                className={`w-full mt-4 font-bold py-3 text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2
                  ${maxWithdrawal >= MIN_WITHDRAW_AMOUNT 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/10' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}`}
              >
                <span className="material-symbols-outlined text-sm">output</span>
                Yêu cầu rút tiền
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500 transition-colors bg-white">
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">Nạp tiền vào tài khoản</h3>
                <p className="text-xs text-slate-400">Nạp tiền nhanh qua chuyển khoản QR hoặc ví điện tử để nhận việc.</p>
              </div>
              <button 
                onClick={() => setIsDepositModalOpen(true)}
                className="w-full mt-4 bg-slate-900 text-white hover:bg-slate-800 font-bold py-3 text-sm rounded-xl transition-all shadow-sm shadow-slate-900/10 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">input</span>
                Nạp tiền vào ví
              </button>
            </div>
          </div>
        </div>

        {/* LỊCH SỬ GIAO DỊCH */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-500">history</span>
              Lịch sử giao dịch
            </h3>
            
            {/* THÀNH PHẦN MỚI: Bộ lọc thời gian tiện lợi */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 self-start sm:self-auto">
              <button 
                onClick={() => setDateFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${dateFilter === 'all' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-900'}`}
              >
                Tất cả
              </button>
              <button 
                onClick={() => setDateFilter('today')}
                className={`px-3 py-1.5 rounded-lg transition-all ${dateFilter === 'today' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-900'}`}
              >
                Hôm nay
              </button>
              <button 
                onClick={() => setDateFilter('7days')}
                className={`px-3 py-1.5 rounded-lg transition-all ${dateFilter === '7days' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-900'}`}
              >
                7 ngày qua
              </button>
              <button 
                onClick={() => setDateFilter('30days')}
                className={`px-3 py-1.5 rounded-lg transition-all ${dateFilter === '30days' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-900'}`}
              >
                30 ngày qua
              </button>
            </div>
          </div>

          {/* THÀNH PHẦN MỚI: Khóa chiều cao cố định (max-h-[260px]) cho 4 dòng và kích hoạt thanh cuộn dọc (overflow-y-auto) */}
          <div className="border border-slate-100 rounded-2xl bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <div className="max-h-[268px] overflow-y-auto scrollbar-thin">
                <table className="w-full text-left border-collapse relative">
                  <thead className="sticky top-0 bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100 z-10">
                    <tr>
                      <th className="p-4">Mã GD / Ngày</th>
                      <th className="p-4">Loại giao dịch</th>
                      <th className="p-4">Nội dung</th>
                      <th className="p-4 text-right">Số tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredTxns.length > 0 ? (
                      filteredTxns.map((txn) => (
                        <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <div className="font-medium text-slate-700">{txn.id}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{displayDate(txn.date)}</div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                              ${txn.type === 'deposit' || txn.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                              {txn.type === 'deposit' && 'Nạp tiền'}
                              {txn.type === 'income' && 'Thu nhập'}
                              {txn.type === 'withdraw' && 'Rút tiền'}
                              {txn.type === 'penalty' && 'Khấu trừ'}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 max-w-xs truncate">{txn.description}</td>
                          <td className={`p-4 text-right font-bold ${txn.type === 'deposit' || txn.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                            {txn.type === 'deposit' || txn.type === 'income' ? '+' : '-'}{txn.amount.toLocaleString()}đ
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-xs text-slate-400 font-medium">
                          Không có dữ liệu giao dịch trong khoảng thời gian này.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL XỬ LÝ RÚT TIỀN (POPUP) */}
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden transform transition-all">
              
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-lg">Yêu cầu rút tiền</h3>
                <button 
                  onClick={() => { setIsWithdrawModalOpen(false); setErrorMsg(''); setWithdrawInput(''); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="p-5">
                <div className="bg-slate-50 rounded-xl p-4 mb-4 text-xs space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Tổng số dư hiện tại:</span>
                    <span className="font-semibold text-slate-900">{balance.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between text-amber-700">
                    <span>Số dư ký quỹ giữ lại:</span>
                    <span>- {MIN_RETAINED_BALANCE.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/60 pt-1.5 font-bold text-slate-900">
                    <span>Hạn mức được rút tối đa:</span>
                    <span className="text-emerald-600">{maxWithdrawal.toLocaleString()}đ</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Nhập số tiền muốn rút
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      inputMode="numeric"
                      placeholder="Từ 500,000"
                      value={withdrawInput}
                      onChange={handleInputChange}
                      className={`w-full pl-4 pr-16 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 font-medium tracking-wide
                        ${errorMsg ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-emerald-100 focus:border-emerald-500'}`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                      ĐỒNG
                    </span>
                  </div>
                  
                  <div className="mt-2 text-right">
                    <button 
                      type="button"
                      onClick={() => setWithdrawInput(formatNumberWithCommas(maxWithdrawal))}
                      className="text-xs font-bold text-emerald-600 hover:underline"
                    >
                      Rút tối đa ({maxWithdrawal.toLocaleString()}đ)
                    </button>
                  </div>

                  {errorMsg && (
                    <div className="mt-2 text-xs text-rose-600 flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errorMsg}
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 mb-5 leading-normal">
                  * Quy định: Số tiền rút phải từ {MIN_WITHDRAW_AMOUNT.toLocaleString()}đ trở lên và đảm bảo tài khoản còn đủ {MIN_RETAINED_BALANCE.toLocaleString()}đ sau khi rút.
                </p>

                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => { setIsWithdrawModalOpen(false); setErrorMsg(''); setWithdrawInput(''); }}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition-all"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/10"
                  >
                    Xác nhận rút
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL XỬ LÝ NẠP TIỀN (POPUP) */}
        {isDepositModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden transform transition-all">
              
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-lg">
                  {depositStep === 1 && 'Nạp tiền vào ví'}
                  {depositStep === 2 && 'Quét mã QR thanh toán'}
                  {depositStep === 3 && 'Đang kiểm tra giao dịch...'}
                </h3>
                <button 
                  onClick={closeDepositModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleDepositSubmit} className="p-5">
                {depositStep === 1 ? (
                  <>
                    <div className="bg-slate-50 rounded-xl p-4 mb-4 text-xs space-y-1.5 text-slate-600">
                      <div className="flex justify-between">
                        <span>Tổng số dư hiện tại:</span>
                        <span className="font-semibold text-slate-900">{balance.toLocaleString()}đ</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Nhập số tiền muốn nạp
                      </label>
                      <div className="relative">
                        <input 
                          type="text"
                          inputMode="numeric"
                          placeholder="Tối thiểu 10,000"
                          value={depositInput}
                          onChange={handleDepositInputChange}
                          className={`w-full pl-4 pr-16 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 font-medium tracking-wide
                            ${depositErrorMsg ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-emerald-100 focus:border-emerald-500'}`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                          ĐỒNG
                        </span>
                      </div>

                      {depositErrorMsg && (
                        <div className="mt-2 text-xs text-rose-600 flex items-center gap-1 font-medium">
                          <span className="material-symbols-outlined text-sm">error</span>
                          {depositErrorMsg}
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 mb-5 leading-normal">
                      * Quy định: Số tiền nạp tối thiểu là 10,000đ. Vui lòng làm theo hướng dẫn ở bước sau để chuyển khoản.
                    </p>

                    <div className="flex gap-3">
                      <button 
                        type="button"
                        onClick={closeDepositModal}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition-all"
                      >
                        Hủy
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/10"
                      >
                        Tiếp tục
                      </button>
                    </div>
                  </>
                ) : depositStep === 2 ? (
                  <>
                    <div className="flex flex-col items-center mb-6">
                      <p className="text-sm text-slate-600 mb-4 text-center">
                        Mở App ngân hàng hoặc Ví điện tử để quét mã QR bên dưới.
                      </p>
                      
                      <div className="p-2 border-2 border-emerald-500 rounded-2xl mb-4 bg-white shadow-sm inline-block relative">
                        {/* URL tạo QR động của VietQR, có truyền số tiền vào */}
                        <img 
                          src={`https://img.vietqr.io/image/vcb-1025537651-compact2.png?amount=${parseRawNumber(depositInput)}&addInfo=NAP%20TIEN%20VI%20DON%20DEP&accountName=CLEAN%20TRUST`}
                          alt="Mã QR Nạp Tiền"
                          className="w-56 h-56 object-contain"
                        />
                      </div>

                      <div className="text-center w-full max-w-[260px]">
                        <div className="flex justify-between border-b border-slate-100 py-2 text-sm">
                          <span className="text-slate-500">Số tiền:</span>
                          <span className="font-bold text-emerald-600">{depositInput} đ</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 py-2 text-sm">
                          <span className="text-slate-500">Nội dung CK:</span>
                          <span className="font-bold text-slate-800">NAP TIEN VI</span>
                        </div>
                      </div>
                      
                      {depositErrorMsg && (
                        <div className="mt-4 text-xs text-rose-600 flex items-center gap-1 font-medium bg-rose-50 p-2 rounded-lg">
                          <span className="material-symbols-outlined text-sm">error</span>
                          {depositErrorMsg}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <button 
                        type="submit"
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/10"
                      >
                        Tôi đã chuyển khoản thành công
                      </button>
                      <button 
                        type="button"
                        onClick={() => setDepositStep(1)}
                        className="w-full py-3 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm rounded-xl transition-all"
                      >
                        Quay lại
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 px-4">
                    <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
                    <h4 className="font-bold text-slate-800 text-base mb-2">Đang chờ nhận tiền...</h4>
                    <p className="text-sm text-slate-500 text-center max-w-[280px]">
                      Hệ thống đang kiểm tra giao dịch tự động từ ngân hàng. Quá trình này có thể mất vài giây đến vài phút. 
                      Vui lòng không đóng cửa sổ này!
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PartnerWallet;