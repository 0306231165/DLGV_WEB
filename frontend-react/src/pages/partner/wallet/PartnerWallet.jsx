import React from 'react';

const PartnerWallet = () => {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
          <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900">Ví & Thu nhập đối tác</h1>
          <p className="text-xs text-slate-400">Quản lý số dư công việc và dòng tiền rút về ví ngân hàng.</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 rounded-2xl text-white shadow-lg shadow-emerald-600/10 border border-emerald-500 max-w-sm mt-4">
        <span className="text-xs text-emerald-100 font-bold uppercase tracking-wider opacity-80">Số dư khả dụng</span>
        <h2 className="text-3xl font-black mt-1 tracking-tight">1.280.000đ</h2>
        <button className="w-full mt-5 bg-white text-emerald-700 hover:bg-emerald-50 font-black py-3 text-sm rounded-xl transition-all shadow-md shadow-emerald-900/20">
          Rút tiền về Ngân hàng
        </button>
      </div>
    </div>
  );
};

export default PartnerWallet;