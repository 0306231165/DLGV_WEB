import React, { useState } from 'react';

const PaymentPage = () => {
  const [linkedMomo, setLinkedMomo] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);

  return (
    <div className="flex flex-col">

      {/* Header */}
      <div className="p-8 border-b border-outline-variant/20">
        <h1 className="font-h3 text-h3 text-on-surface mb-1">Thanh toán & Ưu đãi</h1>
        <p className="text-sm text-on-surface-variant">Quản lý thẻ, ví điện tử và theo dõi chi tiêu của bạn.</p>
      </div>

      <div className="p-8 space-y-10">

        {/* ── Thẻ thanh toán ── */}
        <section>
          <h2 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">credit_card</span>
            Thẻ thanh toán
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Visa card */}
            <div className="relative bg-gradient-to-br from-[#1A1F36] to-[#2E3650] rounded-xl p-6 shadow-lg border border-white/10 overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined" style={{ fontSize: '120px' }}>account_balance</span>
              </div>
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="text-white">
                  <p className="text-xs opacity-70 mb-1">Số dư khả dụng</p>
                  <p className="font-semibold text-lg">*** *** ***</p>
                </div>
                <div className="text-white font-bold text-xl italic tracking-widest opacity-90">VISA</div>
              </div>
              <div className="relative z-10 text-white">
                <p className="tracking-[0.2em] text-sm mb-4">**** **** **** 4242</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] opacity-70 uppercase">Chủ thẻ</p>
                    <p className="text-sm font-semibold">NGUYEN HOANG NAM</p>
                  </div>
                  <div>
                    <p className="text-[10px] opacity-70 uppercase">Hết hạn</p>
                    <p className="text-sm font-semibold">12/26</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Thêm thẻ mới */}
            <button
              onClick={() => setShowAddCard(true)}
              className="bg-surface-container-low border-2 border-dashed border-outline-variant/50 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-surface-container hover:border-primary/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary">add</span>
              </div>
              <p className="text-sm font-semibold text-primary">Thêm thẻ mới</p>
            </button>
          </div>
        </section>

        {/* ── Ví điện tử ── */}
        <section>
          <h2 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
            Ví điện tử đã liên kết
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* MoMo */}
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#AE2070]/10 rounded-lg flex items-center justify-center text-[#AE2070] font-bold text-lg">M</div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">MoMo</p>
                  <p className="text-xs text-on-surface-variant">{linkedMomo ? '090****123 · Đã liên kết' : 'Chưa liên kết'}</p>
                </div>
              </div>
              {linkedMomo ? (
                <button
                  onClick={() => setLinkedMomo(false)}
                  className="text-sm font-semibold text-error hover:underline"
                >
                  Hủy liên kết
                </button>
              ) : (
                <button
                  onClick={() => setLinkedMomo(true)}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Liên kết
                </button>
              )}
            </div>

            {/* ZaloPay */}
            <button className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:bg-surface-container-low transition-colors">
              <div className="w-12 h-12 bg-[#0068FF]/10 rounded-lg flex items-center justify-center text-[#0068FF] font-bold text-lg">Z</div>
              <div className="text-left">
                <p className="text-sm font-semibold text-on-surface">Liên kết ZaloPay</p>
                <p className="text-xs text-on-surface-variant">Nhận ưu đãi 50.000đ khi liên kết lần đầu</p>
              </div>
              <span className="material-symbols-outlined text-primary ml-auto">chevron_right</span>
            </button>
          </div>
        </section>

        {/* ── Thống kê & Ưu đãi ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Thống kê */}
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 shadow-sm relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            <h3 className="font-semibold text-on-surface mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">bar_chart</span>
              Thống kê chi tiêu
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Tháng này', amount: '1.250.000đ', pct: 60, color: 'bg-primary' },
                { label: 'Tháng trước', amount: '850.000đ', pct: 40, color: 'bg-secondary' },
                { label: '2 tháng trước', amount: '620.000đ', pct: 30, color: 'bg-outline-variant' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm text-on-surface-variant">{item.label}</span>
                    <span className="text-sm font-semibold text-on-surface">{item.amount}</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
              <p className="text-xs text-primary mt-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">trending_up</span>
                Tăng 47% so với tháng trước
              </p>
            </div>
          </div>

          {/* Ưu đãi hạng Vàng */}
          <div className="bg-gradient-to-br from-[#FFF8E1] to-[#FFF3CD] rounded-xl p-6 border border-[#FFE082] shadow-sm relative overflow-hidden">
            <div className="absolute right-0 bottom-0 p-4 opacity-10">
              <span className="material-symbols-outlined" style={{ fontSize: '100px' }}>military_tech</span>
            </div>
            <h3 className="font-semibold text-[#F57F17] mb-5 flex items-center gap-2 relative z-10">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              Ưu đãi hạng Vàng
            </h3>
            <ul className="space-y-4 relative z-10">
              {[
                { title: 'Giảm 10% mọi dịch vụ', desc: 'Áp dụng cho tất cả dịch vụ vệ sinh' },
                { title: 'Ưu tiên đặt lịch', desc: 'Được xếp lịch nhanh trong giờ cao điểm' },
                { title: 'Hỗ trợ ưu tiên 24/7', desc: 'Đường dây hotline riêng cho thành viên Vàng' },
              ].map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#F57F17] text-[18px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <div>
                    <p className="text-sm font-semibold text-[#5D4037]">{item.title}</p>
                    <p className="text-xs text-[#795548]">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <button className="mt-5 text-sm font-semibold text-[#F57F17] hover:underline relative z-10">
              Xem chi tiết hạng thẻ →
            </button>
          </div>
        </section>
      </div>

      {/* ── Add card modal (placeholder) ── */}
      {showAddCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/30 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md border border-outline-variant/20 overflow-hidden">
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
              <h2 className="font-h3 text-h3 text-on-surface">Thêm thẻ mới</h2>
              <button onClick={() => setShowAddCard(false)} className="w-9 h-9 rounded-lg hover:bg-surface-container flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Số thẻ', placeholder: '1234 5678 9012 3456', icon: 'credit_card' },
                { label: 'Chủ thẻ', placeholder: 'NGUYEN VAN A', icon: 'person' },
              ].map((f) => (
                <div key={f.label} className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-on-surface">{f.label}</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[20px]">{f.icon}</span>
                    <input type="text" placeholder={f.placeholder} className="w-full h-11 pl-10 pr-4 rounded-xl border border-outline-variant/60 bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all" />
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Ngày hết hạn', placeholder: 'MM/YY', icon: 'calendar_month' },
                  { label: 'CVV', placeholder: '***', icon: 'lock' },
                ].map((f) => (
                  <div key={f.label} className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-on-surface">{f.label}</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[18px]">{f.icon}</span>
                      <input type="text" placeholder={f.placeholder} className="w-full h-11 pl-10 pr-3 rounded-xl border border-outline-variant/60 bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-outline-variant/20 flex justify-end gap-3">
              <button onClick={() => setShowAddCard(false)} className="px-5 py-2.5 rounded-xl border border-outline-variant/40 text-sm font-semibold hover:bg-surface-container transition-colors">Hủy</button>
              <button onClick={() => setShowAddCard(false)} className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold shadow-[0_4px_12px_rgba(0,40,142,0.15)] hover:bg-primary-container transition-all active:scale-[0.98]">Lưu thẻ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;