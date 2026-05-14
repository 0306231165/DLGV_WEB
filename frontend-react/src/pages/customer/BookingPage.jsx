import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// ─── Constants ──────────────────────────────────────────────────────────────

const PACKAGES = [
  {
    id: 'standard',
    title: 'Vệ sinh Tiêu chuẩn',
    description: 'Quét dọn, lau chùi cơ bản các phòng, dọn rác.',
    price: 150000,
    icon: 'home',
    iconBg: 'bg-secondary-container',
    tasks: [
      'Quét và lau sàn toàn bộ căn nhà',
      'Lau bụi đồ đạc: TV, kệ, tủ',
      'Dọn và thay túi rác',
      'Vệ sinh bề mặt bếp',
      'Vệ sinh nhà vệ sinh',
      'Xếp dọn gọn gàng đồ đạc',
    ],
  },
  {
    id: 'deep',
    title: 'Tổng vệ sinh chuyên sâu',
    description: 'Vệ sinh toàn bộ ngóc ngách, tẩy ố, làm sạch kính.',
    price: 450000,
    icon: 'flare',
    iconBg: 'bg-tertiary-fixed',
    tasks: [
      'Tất cả dịch vụ Tiêu chuẩn',
      'Chà bóng, tẩy ố sàn gạch',
      'Làm sạch kính cửa sổ trong nhà',
      'Vệ sinh sâu tủ bếp bên ngoài',
      'Lau quạt trần và đèn',
      'Đánh bóng thiết bị vệ sinh',
      'Dọn sau xây dựng hoặc chuyển nhà',
    ],
  },
];

// Mô hình A: diện tích quyết định giờ (theo Gemini discussion)
const AREA_OPTIONS = [
  { id: 'under-55',  label: 'Dưới 55m²',      sub: 'Khoảng 1-2 phòng ngủ, 1 WC',   hours: 2, maxArea: 55 },
  { id: '55-85',     label: '55m² – 85m²',     sub: 'Khoảng 2-3 phòng ngủ, 2 WC',   hours: 3, maxArea: 85 },
  { id: '85-120',    label: '85m² – 120m²',    sub: 'Khoảng 3-4 phòng ngủ, 2-3 WC', hours: 4, maxArea: 120 },
];

const EXTRA_SERVICES = [
  { id: 'fridge', title: 'Làm sạch tủ lạnh', price: 100000, icon: 'kitchen',  addMinutes: 30 },
  { id: 'glass',  title: 'Lau kính',          price: 150000, icon: 'window',   addMinutes: 45 },
  { id: 'iron',   title: 'Ủi quần áo',        price: 80000,  icon: 'iron',     addMinutes: 60 },
];

const TIME_SLOTS = {
  morning:   ['08:00', '09:00', '10:00', '11:00'],
  afternoon: ['13:00', '14:00', '15:00', '16:00'],
};

const MONTH_NAMES = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                     'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

const WEEK_DAY_OPTIONS = [
  { id: 'mon', label: 'T2' },
  { id: 'tue', label: 'T3' },
  { id: 'wed', label: 'T4' },
  { id: 'thu', label: 'T5' },
  { id: 'fri', label: 'T6' },
  { id: 'sat', label: 'T7' },
  { id: 'sun', label: 'CN' },
];

const SAVED_ADDRESSES = [
  { id: 0, label: 'Nhà riêng',   address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',         icon: 'home' },
  { id: 1, label: 'Văn phòng',   address: '456 Lê Lợi, Phường Phạm Ngũ Lão, Quận 1, TP.HCM',          icon: 'business' },
];

const PAYMENT_METHODS = [
  { id: 'cash',       icon: 'payments',                label: 'Tiền mặt',         onlyFor: ['single','recurring'] },
  { id: 'cleantrust', icon: 'account_balance_wallet',  label: 'Ví CleanTrust',    badge: 'Hoàn tiền TĐ' },
  { id: 'card',       icon: 'credit_card',             label: 'Visa / Mastercard' },
  { id: 'ewallet',    icon: 'smartphone',              label: 'MoMo / ZaloPay' },
];

// ─── Helper ──────────────────────────────────────────────────────────────────

const fmt = (n) => n.toLocaleString('vi-VN') + 'đ';

const getCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ErrorMsg = ({ message }) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-1.5 mt-2 text-error text-sm font-medium">
      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
      {message}
    </div>
  );
};

const SectionTitle = ({ icon, children }) => (
  <h3 className="font-h3 text-h3 mb-6 text-on-surface flex items-center gap-2">
    <span className="material-symbols-outlined text-primary">{icon}</span>
    {children}
  </h3>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const BookingPage = () => {
  const [step, setStep] = useState(1);
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]);

  // ── Step 1 state ──────────────────────────────────────────────────────────
  const [selectedPackage, setSelectedPackage] = useState('standard');
  const [showTasks, setShowTasks]             = useState(null); // package id for modal
  const [selectedArea, setSelectedArea]       = useState(null); // AREA_OPTIONS id
  const [extras, setExtras]                   = useState([]);
  const [hasPet, setHasPet]                   = useState(null); // true/false/null
  const [staffMode, setStaffMode]             = useState('auto');

  // ── Step 2 state ──────────────────────────────────────────────────────────
  const [repeatMode, setRepeatMode]             = useState('once');   // once | weekly | biweekly
  const [selectedDate, setSelectedDate]         = useState(null);     // { year, month, day }
  const [selectedTime, setSelectedTime]         = useState('08:00');
  const [recurringDay, setRecurringDay]         = useState('');
  const [calendarMonth, setCalendarMonth]       = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // ── Step 3 state ──────────────────────────────────────────────────────────
  const [contactMode, setContactMode]           = useState('saved');  // saved | new
  const [selectedSavedAddress, setSelectedSavedAddress] = useState(0);
  const [newContact, setNewContact]             = useState({ name: '', phone: '', email: '', street: '', district: '', note: '' });
  const [staffNote, setStaffNote]               = useState('');

  // ── Step 4 state ──────────────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod]       = useState('cash');
  const [promoCode, setPromoCode]               = useState('');
  const [promoApplied, setPromoApplied]         = useState(false);
  const [promoDiscount, setPromoDiscount]       = useState(0);

  // ── Validation ────────────────────────────────────────────────────────────
  const [errors, setErrors] = useState({});

  // ── Derived values ────────────────────────────────────────────────────────
  const pkgData     = PACKAGES.find(p => p.id === selectedPackage);
  const areaData    = AREA_OPTIONS.find(a => a.id === selectedArea);
  const baseHours   = areaData ? areaData.hours : 2;
  const extraMinutes = extras.reduce((sum, id) => {
    const e = EXTRA_SERVICES.find(s => s.id === id);
    return sum + (e ? e.addMinutes : 0);
  }, 0);
  const totalMinutes = baseHours * 60 + extraMinutes;
  const needTwoStaff = totalMinutes > 240;
  const staffExtraPrice  = staffMode === 'manual' ? 30000 : 0;
  const extrasTotal      = EXTRA_SERVICES.filter(s => extras.includes(s.id)).reduce((sum, s) => sum + s.price, 0);
  const travelFee        = 15000;
  const subtotal         = pkgData.price + extrasTotal + staffExtraPrice + travelFee;
  const total            = Math.max(0, subtotal - promoDiscount);
  const walletBalance    = 320000;

  // ── Calendar helpers ──────────────────────────────────────────────────────
  const isDateDisabled = (day) => {
    if (!day) return true;
    const d = new Date(calendarMonth.year, calendarMonth.month, day);
    d.setHours(0,0,0,0);
    const t = new Date(); t.setHours(0,0,0,0);
    return d < t;
  };
  const isDateSelected = (day) => {
    if (!day || !selectedDate) return false;
    return selectedDate.year === calendarMonth.year &&
           selectedDate.month === calendarMonth.month &&
           selectedDate.day === day;
  };
  const handleDateSelect = (day) => {
    if (!day || isDateDisabled(day)) return;
    setSelectedDate({ year: calendarMonth.year, month: calendarMonth.month, day });
  };
  const selectedDateLabel = selectedDate
    ? `${['CN','T2','T3','T4','T5','T6','T7'][new Date(selectedDate.year, selectedDate.month, selectedDate.day).getDay()]}, ${selectedDate.day}/${selectedDate.month+1}/${selectedDate.year}`
    : 'Chưa chọn';

  // ── Toggle helpers ────────────────────────────────────────────────────────
  const toggleExtra = (id) => {
    setExtras(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // ── Promo apply ───────────────────────────────────────────────────────────
  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'CLEANTRUST10') {
      setPromoDiscount(Math.round(subtotal * 0.1));
      setPromoApplied(true);
    } else {
      setPromoApplied(false);
      setPromoDiscount(0);
      setErrors(prev => ({ ...prev, promo: 'Mã không hợp lệ hoặc đã hết hạn.' }));
    }
  };

  // ── Validate step transitions ─────────────────────────────────────────────
  const validateStep1 = () => {
    const e = {};
    if (!selectedArea) e.area = 'Vui lòng chọn diện tích nhà.';
    if (hasPet === null) e.pet = 'Vui lòng cho biết nhà bạn có nuôi thú cưng không.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (repeatMode === 'once' && !selectedDate) e.date = 'Vui lòng chọn ngày làm việc.';
    if ((repeatMode === 'weekly' || repeatMode === 'biweekly') && !recurringDay) e.recurringDay = 'Vui lòng chọn ngày làm việc trong tuần.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e = {};
    if (contactMode === 'new') {
      if (!newContact.name.trim())     e.name     = 'Vui lòng nhập họ tên.';
      if (!newContact.phone.trim())    e.phone    = 'Vui lòng nhập số điện thoại.';
      if (!newContact.street.trim())   e.street   = 'Vui lòng nhập địa chỉ.';
      if (!newContact.district.trim()) e.district = 'Vui lòng nhập phường/quận.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Step Indicator ────────────────────────────────────────────────────────
  const StepIndicator = () => {
    const steps = [
      { num: 1, label: 'Dịch vụ' },
      { num: 2, label: 'Lịch hẹn' },
      { num: 3, label: 'Thông tin' },
      { num: 4, label: 'Thanh toán' },
    ];
    return (
      <div className="flex items-center gap-3 flex-wrap text-on-surface-variant mt-4">
        {steps.map((s, i) => {
          const isActive = step === s.num;
          const isDone   = step > s.num;
          return (
            <React.Fragment key={s.num}>
              <span className={`flex items-center gap-2 ${isActive ? 'text-primary font-bold' : ''}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isActive ? 'bg-primary text-on-primary' :
                  isDone   ? 'bg-primary-fixed text-primary' :
                             'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {isDone
                    ? <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    : s.num}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </span>
              {i < steps.length - 1 && (
                <div className={`h-px flex-1 min-w-4 max-w-12 transition-all ${step > s.num ? 'bg-primary' : 'bg-outline-variant'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // ── Calendar Component ────────────────────────────────────────────────────
  const CalendarPicker = () => {
    const cells     = getCalendarDays(calendarMonth.year, calendarMonth.month);
    const dayLabels = ['T2','T3','T4','T5','T6','T7','CN'];
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 p-4 w-full">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setCalendarMonth(prev => {
            const m = prev.month === 0 ? 11 : prev.month - 1;
            const y = prev.month === 0 ? prev.year - 1 : prev.year;
            return { year: y, month: m };
          })} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <span className="font-semibold text-on-surface">{MONTH_NAMES[calendarMonth.month]}, {calendarMonth.year}</span>
          <button onClick={() => setCalendarMonth(prev => {
            const m = prev.month === 11 ? 0 : prev.month + 1;
            const y = prev.month === 11 ? prev.year + 1 : prev.year;
            return { year: y, month: m };
          })} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {dayLabels.map(d => (
            <div key={d} className="text-xs text-on-surface-variant font-semibold py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {cells.map((day, idx) => {
            const disabled = isDateDisabled(day);
            const selected = isDateSelected(day);
            return (
              <div key={idx} onClick={() => handleDateSelect(day)}
                className={`p-2 text-sm rounded-full transition-all select-none
                  ${!day ? '' : disabled
                    ? 'text-outline cursor-not-allowed'
                    : selected
                    ? 'bg-primary text-on-primary font-bold shadow-sm cursor-pointer'
                    : 'text-on-background cursor-pointer hover:bg-surface-container'}`}>
                {day || ''}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Time Slots ────────────────────────────────────────────────────────────
  const TimeSlotPicker = () => (
    <div className="mt-6 space-y-4">
      <p className="font-semibold flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-base">schedule</span>
        Chọn khung giờ
      </p>
      <div>
        <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-1">
          <span className="material-symbols-outlined text-base">light_mode</span>
          Buổi sáng
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {TIME_SLOTS.morning.map(t => (
            <button key={t} onClick={() => setSelectedTime(t)}
              className={`py-2 px-3 border-2 rounded-xl text-sm font-semibold transition-all ${
                selectedTime === t ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/50 text-on-surface hover:border-primary'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-1">
          <span className="material-symbols-outlined text-base">dark_mode</span>
          Buổi chiều
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {TIME_SLOTS.afternoon.map(t => (
            <button key={t} onClick={() => setSelectedTime(t)}
              className={`py-2 px-3 border-2 rounded-xl text-sm font-semibold transition-all ${
                selectedTime === t ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/50 text-on-surface hover:border-primary'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Order Summary Sidebar ─────────────────────────────────────────────────
  const OrderSummary = ({ showActions = true, onPrimary, primaryLabel, onBack }) => (
    <aside className="lg:col-span-4 sticky top-24">
      <div className="bg-background-2 glass-card rounded-2xl shadow-xl border border-white/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant/20">
          <h3 className="font-h3 text-h3 text-primary">Tóm tắt đơn hàng</h3>
        </div>
        <div className="px-6 py-4 space-y-3 text-sm">
          <div className="flex justify-between text-on-surface-variant">
            <span>Dịch vụ</span>
            <span className="font-semibold text-on-surface text-right">{pkgData.title}</span>
          </div>
          {areaData && (
            <div className="flex justify-between text-on-surface-variant">
              <span>Diện tích</span>
              <span className="font-semibold text-on-surface">{areaData.label} ({baseHours}h)</span>
            </div>
          )}
          {needTwoStaff && (
            <div className="flex items-center gap-1 p-2 rounded-lg bg-tertiary-fixed/30 text-xs text-on-tertiary-fixed-variant">
              <span className="material-symbols-outlined text-sm">group</span>
              Cần 2 nhân viên (tổng {Math.ceil(totalMinutes/60*10)/10}h công)
            </div>
          )}
          {extras.length > 0 && extras.map(id => {
            const e = EXTRA_SERVICES.find(s => s.id === id);
            return (
              <div key={id} className="flex justify-between text-on-surface-variant">
                <span>{e.title}</span>
                <span>+{fmt(e.price)}</span>
              </div>
            );
          })}
          {staffMode === 'manual' && (
            <div className="flex justify-between text-on-surface-variant">
              <span>Phí chọn NV</span>
              <span>+{fmt(staffExtraPrice)}</span>
            </div>
          )}
          <div className="flex justify-between text-on-surface-variant">
            <span>Phí di chuyển</span>
            <span>{fmt(travelFee)}</span>
          </div>
          {promoDiscount > 0 && (
            <div className="flex justify-between text-primary font-medium">
              <span>Khuyến mãi</span>
              <span>-{fmt(promoDiscount)}</span>
            </div>
          )}
        </div>
        <div className="px-6 pb-5 pt-4 border-t-2 border-dashed border-outline-variant/30">
          <div className="flex justify-between items-end mb-4">
            <span className="text-on-surface-variant font-medium text-sm">Tổng thanh toán</span>
            <span className="text-2xl font-extrabold text-primary">{fmt(total)}</span>
          </div>
          {showActions && (
            <>
              <button onClick={onPrimary}
                className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-body-lg shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                {primaryLabel}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              {onBack && (
                <button onClick={onBack}
                  className="w-full mt-3 border-2 border-outline-variant py-3.5 rounded-xl font-semibold hover:bg-surface-container active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">arrow_back</span>
                  Quay lại
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </aside>
  );

  // ── Package Task Modal ────────────────────────────────────────────────────
  const TaskModal = () => {
    if (!showTasks) return null;
    const pkg = PACKAGES.find(p => p.id === showTasks);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={() => setShowTasks(null)}>
        <div className="bg-surface rounded-2xl p-8 max-w-md w-full shadow-2xl border border-outline-variant/30"
          onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-h3 text-h3 text-on-surface">{pkg.title}</h3>
              <p className="text-sm text-on-surface-variant mt-1">Nhân viên sẽ thực hiện các công việc sau</p>
            </div>
            <button onClick={() => setShowTasks(null)} className="text-on-surface-variant hover:text-on-surface p-1">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <ul className="space-y-3">
            {pkg.tasks.map((task, i) => (
              <li key={i} className="flex items-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-base flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                {task}
              </li>
            ))}
          </ul>
          <button onClick={() => setShowTasks(null)}
            className="w-full mt-6 py-3 bg-primary text-on-primary rounded-xl font-semibold transition-all hover:bg-primary-container">
            Đã hiểu
          </button>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="pt-32 pb-section-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen">
      <TaskModal />

      {/* ══════════ STEP 1: Dịch vụ ══════════ */}
      {step === 1 && (
        <>
          <div ref={headingRef} className="mb-12 scroll-mt-24">
            <h1 className="font-h2 text-h2 text-primary mb-1">Bước 1: Chọn dịch vụ</h1>
            <StepIndicator />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            <div className="lg:col-span-8 space-y-14">

              {/* 1A. Chọn gói dịch vụ */}
              <section>
                <SectionTitle icon="cleaning_services">Chọn gói dịch vụ</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PACKAGES.map(pkg => {
                    const isSelected = selectedPackage === pkg.id;
                    return (
                      <div key={pkg.id} className="relative">
                        <label className="cursor-pointer block h-full">
                          <input type="radio" name="package" checked={isSelected} onChange={() => setSelectedPackage(pkg.id)} className="peer sr-only" />
                          <div className={`glass-card p-6 rounded-xl border-2 transition-all flex gap-4 h-full ${isSelected ? 'border-primary bg-primary/5' : 'border-outline-variant/30 bg-surface-container-item'}`}>
                            <div className={`w-16 h-16 rounded-lg flex items-center justify-center shrink-0 ${pkg.iconBg}`}>
                              <span className="material-symbols-outlined text-primary text-3xl">{pkg.icon}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-on-surface text-body-lg">{pkg.title}</h4>
                              <p className="text-on-surface-variant text-sm mb-3">{pkg.description}</p>
                              <span className="text-primary font-bold">{fmt(pkg.price)}/buổi</span>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-5 right-5 text-primary">
                              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            </div>
                          )}
                        </label>
                        {/* Nút xem chi tiết công việc */}
                        <button
                          onClick={() => setShowTasks(pkg.id)}
                          className="absolute bottom-5 right-5 flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                        >
                          <span className="material-symbols-outlined text-sm">info</span>
                          Xem chi tiết
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 1B. Diện tích + giờ gộp (Mô hình A từ thảo luận) */}
              <section>
                <SectionTitle icon="straighten">Diện tích nhà & Thời lượng làm việc</SectionTitle>
                <p className="text-sm text-on-surface-variant mb-4 -mt-4">
                  Thời lượng được hệ thống tính tự động dựa trên diện tích để đảm bảo chất lượng.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {AREA_OPTIONS.map(opt => {
                    const isSelected = selectedArea === opt.id;
                    return (
                      <label key={opt.id} className="relative cursor-pointer">
                        <input type="radio" checked={isSelected} onChange={() => { setSelectedArea(opt.id); setErrors(p => ({...p, area: null})); }} className="peer sr-only" />
                        <div className={`glass-card p-5 rounded-xl border-2 transition-all text-center h-full flex flex-col items-center gap-2 ${
                          isSelected ? 'border-primary bg-primary/5' : errors.area ? 'border-error/40' : 'border-outline-variant/30 bg-surface-container-item'}`}>
                          <span className="material-symbols-outlined text-3xl text-primary">home</span>
                          <p className="font-bold text-on-surface text-body-lg">{opt.label}</p>
                          <p className="text-xs text-on-surface-variant">{opt.sub}</p>
                          <div className="mt-2 px-3 py-1 bg-primary/10 rounded-full">
                            <span className="text-primary font-bold text-sm">{opt.hours} giờ làm việc</span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-3 right-3 text-primary">
                            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
                <ErrorMsg message={errors.area} />

                {/* Cảnh báo cần 2 nhân viên */}
                {needTwoStaff && (
                  <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-tertiary-fixed/40 border border-tertiary-fixed">
                    <span className="material-symbols-outlined text-on-tertiary-fixed-variant mt-0.5">group</span>
                    <div>
                      <p className="font-semibold text-on-tertiary-fixed-variant text-sm">Cần 2 nhân viên</p>
                      <p className="text-xs text-on-tertiary-fixed-variant/80 mt-0.5">
                        Tổng thời gian ước tính {Math.ceil(totalMinutes / 60 * 10) / 10}h — hệ thống sẽ cử 2 nhân viên để đảm bảo chất lượng và không quá sức.
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* 1C. Dịch vụ thêm */}
              <section>
                <SectionTitle icon="add_circle">Dịch vụ thêm (tùy chọn)</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {EXTRA_SERVICES.map(service => {
                    const isSelected = extras.includes(service.id);
                    return (
                      <label key={service.id} className="relative cursor-pointer">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleExtra(service.id)} className="sr-only" />
                        <div className={`glass-card p-6 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-3 ${
                          isSelected ? 'border-primary bg-surface-container-low' : 'border-outline-variant/50 bg-surface-container-lowest hover:border-primary/50'
                        }`}>
                          {isSelected && (
                            <span className="material-symbols-outlined absolute top-3 right-3 text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          )}
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? 'bg-primary/10' : 'bg-surface-container'}`}>
                            <span className={`material-symbols-outlined text-[28px] ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>{service.icon}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-on-surface text-body-lg">{service.title}</h4>
                            <p className="text-primary font-semibold text-sm mt-1">+{fmt(service.price)}</p>
                            <p className="text-on-surface-variant text-xs mt-0.5">+{service.addMinutes} phút</p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>

              {/* 1D. Thú cưng */}
              <section>
                <SectionTitle icon="pets">Nhà bạn có nuôi thú cưng không?</SectionTitle>
                <div className="grid grid-cols-2 gap-4 max-w-sm">
                  {[
                    { val: false, icon: 'check_circle', label: 'Không có' },
                    { val: true,  icon: 'pets',         label: 'Có (chó/mèo...)' },
                  ].map(opt => {
                    const isSelected = hasPet === opt.val;
                    return (
                      <button key={String(opt.val)}
                        onClick={() => { setHasPet(opt.val); setErrors(p => ({...p, pet: null})); }}
                        className={`glass-card p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center ${
                          isSelected ? 'border-primary bg-primary/5' : errors.pet ? 'border-error/40' : 'border-outline-variant/30 bg-surface-container-item hover:border-primary/50'
                        }`}>
                        <span className={`material-symbols-outlined text-2xl ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>{opt.icon}</span>
                        <span className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-on-surface'}`}>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
                {hasPet && (
                  <p className="mt-3 text-xs text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-primary">info</span>
                    Nhân viên sẽ được thông báo trước. Bạn có thể ghi thêm ghi chú ở bước sau.
                  </p>
                )}
                <ErrorMsg message={errors.pet} />
              </section>

              {/* 1E. Chọn nhân viên */}
              <section>
                <SectionTitle icon="badge">Nhân viên phụ trách</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'auto',   icon: 'smart_toy',    title: 'Hệ thống tự chọn',   desc: 'Tối ưu hoá thời gian và đảm bảo chất lượng.', badge: 'Miễn phí',       badgeColor: 'bg-secondary-container text-on-secondary-container' },
                    { id: 'manual', icon: 'person_search', title: 'Tự chọn nhân viên',  desc: 'Chọn nhân viên từ danh sách những người nhận lịch.', badge: '+30.000đ/buổi', badgeColor: 'bg-tertiary-fixed text-on-tertiary-fixed-variant' },
                  ].map(item => {
                    const isSelected = staffMode === item.id;
                    return (
                      <label key={item.id} className="relative cursor-pointer">
                        <input type="radio" name="staffMode" checked={isSelected} onChange={() => setStaffMode(item.id)} className="peer sr-only" />
                        <div className="glass-card bg-surface-container-item p-6 rounded-xl border-2 border-outline-variant/30 peer-checked:border-primary peer-checked:bg-primary/5 transition-all h-full">
                          <div className="mb-4 w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">{item.icon}</span>
                          </div>
                          <h4 className="font-bold text-on-surface text-body-lg mb-2">{item.title}</h4>
                          <p className="text-on-surface-variant text-sm mb-3">{item.desc}</p>
                          <span className={`inline-block px-3 py-1 rounded text-[12px] font-bold ${item.badgeColor}`}>{item.badge}</span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-4 right-4 text-primary">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              </section>
            </div>

            <OrderSummary
              primaryLabel="Tiếp theo: Chọn lịch"
              onPrimary={() => { if (validateStep1()) setStep(2); }}
            />
          </div>
        </>
      )}

      {/* ══════════ STEP 2: Lịch hẹn ══════════ */}
      {step === 2 && (
        <>
          <div ref={headingRef} className="mb-12 scroll-mt-24">
            <h1 className="font-h2 text-h2 text-primary mb-1">Bước 2: Chọn lịch hẹn</h1>
            <StepIndicator />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            <div className="lg:col-span-8 space-y-8">

              {/* 2A. Lặp lại hay không? */}
              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                <SectionTitle icon="event_repeat">Tần suất dọn</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'once',      icon: 'event',    title: 'Một lần',       desc: 'Đặt lịch một lần duy nhất.',                         badge: null },
                    { id: 'weekly',    icon: 'update',   title: 'Hàng tuần',     desc: 'Tự động lặp lại mỗi tuần. Hủy bất kỳ lúc nào.',     badge: 'Tiết kiệm 10%' },
                    { id: 'biweekly',  icon: 'calendar_month', title: '2 tuần/lần', desc: 'Tự động lặp lại cách tuần.',                    badge: null },
                  ].map(item => {
                    const isSelected = repeatMode === item.id;
                    return (
                      <label key={item.id} className="relative cursor-pointer">
                        <input type="radio" name="repeatMode" checked={isSelected} onChange={() => { setRepeatMode(item.id); setSelectedDate(null); setRecurringDay(''); setErrors({}); }} className="peer sr-only" />
                        <div className="glass-card bg-surface-container-lowest p-5 rounded-xl border-2 border-outline-variant/30 peer-checked:border-primary peer-checked:bg-primary/5 transition-all h-full">
                          <div className="mb-3 w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">{item.icon}</span>
                          </div>
                          <h4 className="font-bold text-on-surface mb-1">{item.title}</h4>
                          <p className="text-on-surface-variant text-xs">{item.desc}</p>
                          {item.badge && (
                            <span className="inline-block mt-3 px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded text-[11px] font-bold">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <div className="absolute top-3 right-3 text-primary">
                            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              </section>

              {/* 2B. Chọn ngày (one-time) */}
              {repeatMode === 'once' && (
                <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                  <SectionTitle icon="calendar_today">Chọn ngày làm việc</SectionTitle>
                  <CalendarPicker />
                  {selectedDate && (
                    <p className="text-xs text-primary mt-3 font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Đã chọn: {selectedDateLabel}
                    </p>
                  )}
                  <ErrorMsg message={errors.date} />
                  <TimeSlotPicker />
                </section>
              )}

              {/* 2B. Chọn ngày trong tuần (recurring) */}
              {(repeatMode === 'weekly' || repeatMode === 'biweekly') && (
                <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                  <SectionTitle icon="calendar_month">Chọn ngày trong tuần</SectionTitle>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-tertiary-fixed/40 border border-tertiary-fixed mb-6">
                    <span className="material-symbols-outlined text-on-tertiary-fixed-variant mt-0.5 text-base">info</span>
                    <p className="text-sm text-on-tertiary-fixed-variant">
                      {repeatMode === 'weekly' ? 'Mỗi tuần' : 'Cách tuần'} vào đúng ngày bạn chọn. Hủy hoặc tạm dừng bất kỳ lúc nào trước 24 giờ.
                    </p>
                  </div>
                  <div className={`flex gap-3 flex-wrap p-3 rounded-xl ${errors.recurringDay ? 'bg-error/5 border-2 border-error/40' : ''}`}>
                    {WEEK_DAY_OPTIONS.map(d => {
                      const isSelected = recurringDay === d.id;
                      return (
                        <button key={d.id}
                          onClick={() => { setRecurringDay(d.id); setErrors(p => ({...p, recurringDay: null})); }}
                          className={`w-12 h-12 rounded-xl border-2 font-bold text-sm transition-all ${
                            isSelected ? 'border-primary bg-primary text-on-primary' :
                            errors.recurringDay ? 'border-error/40 hover:border-error hover:text-error' :
                            'border-outline-variant hover:border-primary hover:text-primary'
                          }`}>
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                  {recurringDay && (
                    <p className="text-xs text-primary mt-2 font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {repeatMode === 'weekly' ? 'Mỗi tuần' : 'Cách tuần'} vào {WEEK_DAY_OPTIONS.find(d => d.id === recurringDay)?.label}
                    </p>
                  )}
                  <ErrorMsg message={errors.recurringDay} />
                  <TimeSlotPicker />
                </section>
              )}
            </div>

            <OrderSummary
              primaryLabel="Tiếp theo: Thông tin"
              onPrimary={() => { if (validateStep2()) setStep(3); }}
              onBack={() => setStep(1)}
            />
          </div>
        </>
      )}

      {/* ══════════ STEP 3: Thông tin liên hệ ══════════ */}
      {step === 3 && (
        <>
          <div ref={headingRef} className="mb-12 scroll-mt-24">
            <h1 className="font-h2 text-h2 text-primary mb-1">Bước 3: Thông tin liên hệ</h1>
            <StepIndicator />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            <div className="lg:col-span-8 space-y-8">

              {/* 3A. Chọn thông tin */}
              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                <SectionTitle icon="person">Thông tin liên hệ & Địa chỉ</SectionTitle>

                {/* Tab chọn */}
                <div className="flex gap-2 p-1 bg-surface-container rounded-xl mb-6 w-fit">
                  {[
                    { id: 'saved', icon: 'bookmark',        label: 'Dùng thông tin tài khoản' },
                    { id: 'new',   icon: 'person_add',      label: 'Nhập thông tin mới' },
                  ].map(tab => (
                    <button key={tab.id}
                      onClick={() => { setContactMode(tab.id); setErrors({}); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        contactMode === tab.id ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                      }`}>
                      <span className="material-symbols-outlined text-base">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Saved addresses */}
                {contactMode === 'saved' && (
                  <div className="space-y-3">
                    {SAVED_ADDRESSES.map(addr => (
                      <label key={addr.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedSavedAddress === addr.id ? 'border-primary bg-primary/5' : 'border-outline-variant/40 hover:border-outline-variant'
                        }`}>
                        <input type="radio" checked={selectedSavedAddress === addr.id} onChange={() => setSelectedSavedAddress(addr.id)} className="accent-primary w-4 h-4 shrink-0" />
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${selectedSavedAddress === addr.id ? 'bg-primary/10' : 'bg-surface-container'}`}>
                          <span className={`material-symbols-outlined text-xl ${selectedSavedAddress === addr.id ? 'text-primary' : 'text-on-surface-variant'}`}>{addr.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-on-surface">{addr.label}</p>
                          <p className="text-sm text-on-surface-variant mt-0.5">{addr.address}</p>
                        </div>
                        {selectedSavedAddress === addr.id && (
                          <span className="material-symbols-outlined text-primary shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        )}
                      </label>
                    ))}
                  </div>
                )}

                {/* New contact form */}
                {contactMode === 'new' && (
                  <div className="space-y-4">
                    {[
                      { key: 'name',     label: 'Họ và tên',             icon: 'person',          placeholder: 'Nguyễn Văn A',                   type: 'text' },
                      { key: 'phone',    label: 'Số điện thoại',         icon: 'phone',           placeholder: '0901 234 567',                   type: 'tel' },
                      { key: 'email',    label: 'Email (tùy chọn)',       icon: 'email',           placeholder: 'example@email.com',              type: 'email',   optional: true },
                      { key: 'street',   label: 'Số nhà, tên đường',      icon: 'signpost',        placeholder: '123 Nguyễn Huệ',                 type: 'text' },
                      { key: 'district', label: 'Phường / Quận',          icon: 'location_city',   placeholder: 'Phường Bến Nghé, Quận 1',        type: 'text' },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="block text-sm font-semibold text-on-surface mb-2">
                          {field.label}
                          {!field.optional && <span className="text-error"> *</span>}
                          {field.optional && <span className="text-on-surface-variant font-normal"> (tùy chọn)</span>}
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl pointer-events-none">{field.icon}</span>
                          <input
                            type={field.type}
                            placeholder={field.placeholder}
                            value={newContact[field.key]}
                            onChange={e => {
                              setNewContact(p => ({ ...p, [field.key]: e.target.value }));
                              if (errors[field.key]) setErrors(p => ({ ...p, [field.key]: null }));
                            }}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-surface focus:outline-none transition-colors text-on-surface placeholder:text-on-surface-variant/50 ${
                              errors[field.key] ? 'border-error focus:border-error' : 'border-outline-variant focus:border-primary'
                            }`}
                          />
                        </div>
                        <ErrorMsg message={errors[field.key]} />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* 3B. Ghi chú */}
              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                <SectionTitle icon="edit_note">Ghi chú cho nhân viên</SectionTitle>
                <div className="relative">
                  <textarea
                    rows={4}
                    placeholder={`VD: Nhà có chó, cần gọi trước khi đến.\nTập trung vệ sinh phòng bếp và phòng tắm...${hasPet ? '\n⚠️ Nhà có nuôi thú cưng.' : ''}`}
                    value={staffNote}
                    onChange={e => setStaffNote(e.target.value)}
                    maxLength={300}
                    className="w-full px-4 py-4 rounded-xl border-2 border-outline-variant/30 bg-surface focus:border-primary focus:outline-none transition-colors text-on-surface placeholder:text-on-surface-variant/40 resize-none"
                  />
                  <div className="absolute bottom-3 right-4 text-xs text-on-surface-variant/50">{staffNote.length}/300</div>
                </div>
                {hasPet && !staffNote.toLowerCase().includes('thú') && (
                  <button
                    onClick={() => setStaffNote(prev => prev ? prev + '\nNhà có nuôi thú cưng.' : 'Nhà có nuôi thú cưng.')}
                    className="mt-2 text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Thêm ghi chú về thú cưng
                  </button>
                )}
              </section>
            </div>

            <OrderSummary
              primaryLabel="Tiếp theo: Thanh toán"
              onPrimary={() => { if (validateStep3()) setStep(4); }}
              onBack={() => setStep(2)}
            />
          </div>
        </>
      )}

      {/* ══════════ STEP 4: Thanh toán & Xác nhận ══════════ */}
      {step === 4 && (
        <>
          <div ref={headingRef} className="mb-12 scroll-mt-24">
            <h1 className="font-h2 text-h2 text-primary mb-1">Bước 4: Thanh toán & Xác nhận</h1>
            <StepIndicator />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            <div className="lg:col-span-8 space-y-8">

              {/* 4A. Phương thức thanh toán */}
              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                <SectionTitle icon="payments">Phương thức thanh toán</SectionTitle>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {PAYMENT_METHODS.filter(m => !m.onlyFor || m.onlyFor.includes(repeatMode === 'once' ? 'single' : 'recurring')).map(method => {
                    const isSelected = paymentMethod === method.id;
                    return (
                      <label key={method.id} className="relative cursor-pointer">
                        <input type="radio" checked={isSelected} onChange={() => setPaymentMethod(method.id)} className="peer sr-only" />
                        <div className={`h-full bg-surface-container-lowest border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all ${
                          isSelected ? 'border-primary bg-surface-container-low' : 'border-outline-variant/50 hover:border-primary/50'
                        }`}>
                          {isSelected && (
                            <span className="material-symbols-outlined absolute top-3 right-3 text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          )}
                          <span className="material-symbols-outlined text-[32px] text-primary">{method.icon}</span>
                          <span className="text-center text-sm font-semibold text-on-surface leading-tight">{method.label}</span>
                          {method.badge && (
                            <span className="px-2 py-0.5 bg-secondary-container text-primary rounded text-[11px] font-bold">{method.badge}</span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
                {paymentMethod === 'cleantrust' && (
                  <div className="mt-4 p-3 rounded-xl bg-secondary-container/40 border border-secondary-container flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-sm mt-0.5">info</span>
                    <p className="text-xs text-on-surface-variant">
                      Số dư ví: <span className="font-semibold text-primary">{fmt(walletBalance)}</span>. Chỉ dùng thanh toán dịch vụ CleanTrust.
                    </p>
                  </div>
                )}
              </section>

              {/* 4B. Mã khuyến mãi */}
              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                <SectionTitle icon="redeem">Mã khuyến mãi</SectionTitle>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl pointer-events-none">confirmation_number</span>
                    <input
                      type="text"
                      placeholder="Nhập mã ưu đãi (VD: CLEANTRUST10)"
                      value={promoCode}
                      onChange={e => { setPromoCode(e.target.value); setErrors(p => ({...p, promo: null})); setPromoApplied(false); setPromoDiscount(0); }}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-surface focus:outline-none transition-colors text-on-surface placeholder:text-on-surface-variant/50 ${
                        errors.promo ? 'border-error focus:border-error' : promoApplied ? 'border-primary' : 'border-outline-variant focus:border-primary'
                      }`}
                    />
                  </div>
                  <button onClick={applyPromo}
                    className="px-6 py-3 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary-container transition-colors whitespace-nowrap">
                    Áp dụng
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-xs text-primary mt-2 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Áp dụng thành công! Giảm {fmt(promoDiscount)}
                  </p>
                )}
                <ErrorMsg message={errors.promo} />
              </section>

              {/* 4C. Xác nhận - tất cả thông tin */}
              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                <SectionTitle icon="receipt_long">Xác nhận thông tin đặt lịch</SectionTitle>
                <div className="space-y-4">

                  {/* Dịch vụ */}
                  <div className="flex gap-4 items-start p-4 bg-surface rounded-xl border border-outline-variant/20">
                    <span className="material-symbols-outlined text-primary text-2xl mt-0.5">cleaning_services</span>
                    <div className="flex-1">
                      <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wide">Dịch vụ</p>
                      <p className="font-bold text-on-surface mt-0.5">{pkgData.title}</p>
                      {areaData && <p className="text-sm text-on-surface-variant mt-0.5">{areaData.label} — {baseHours} giờ</p>}
                      {extras.length > 0 && (
                        <p className="text-sm text-on-surface-variant mt-0.5">
                          Thêm: {extras.map(id => EXTRA_SERVICES.find(s => s.id === id)?.title).join(', ')}
                        </p>
                      )}
                      {hasPet && <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-sm">pets</span>Nhà có thú cưng</p>}
                    </div>
                  </div>

                  {/* Lịch hẹn */}
                  <div className="flex gap-4 items-start p-4 bg-surface rounded-xl border border-outline-variant/20">
                    <span className="material-symbols-outlined text-primary text-2xl mt-0.5">calendar_month</span>
                    <div className="flex-1">
                      <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wide">Lịch hẹn</p>
                      {repeatMode === 'once' && (
                        <p className="font-bold text-on-surface mt-0.5">{selectedDateLabel} lúc {selectedTime}</p>
                      )}
                      {repeatMode !== 'once' && (
                        <p className="font-bold text-on-surface mt-0.5">
                          {repeatMode === 'weekly' ? 'Mỗi tuần' : 'Cách tuần'} vào {WEEK_DAY_OPTIONS.find(d => d.id === recurringDay)?.label}, lúc {selectedTime}
                        </p>
                      )}
                      <p className="text-sm text-on-surface-variant mt-0.5">Nhân viên: {staffMode === 'auto' ? 'Hệ thống tự chọn' : 'Tự chọn'}</p>
                    </div>
                  </div>

                  {/* Địa chỉ */}
                  <div className="flex gap-4 items-start p-4 bg-surface rounded-xl border border-outline-variant/20">
                    <span className="material-symbols-outlined text-primary text-2xl mt-0.5">location_on</span>
                    <div className="flex-1">
                      <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wide">Địa chỉ</p>
                      {contactMode === 'saved' ? (
                        <>
                          <p className="font-bold text-on-surface mt-0.5">{SAVED_ADDRESSES[selectedSavedAddress].label}</p>
                          <p className="text-sm text-on-surface-variant">{SAVED_ADDRESSES[selectedSavedAddress].address}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-on-surface mt-0.5">{newContact.name}</p>
                          <p className="text-sm text-on-surface-variant">{newContact.street}, {newContact.district}</p>
                          <p className="text-sm text-on-surface-variant">{newContact.phone}</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Ghi chú */}
                  {staffNote && (
                    <div className="flex gap-4 items-start p-4 bg-surface rounded-xl border border-outline-variant/20">
                      <span className="material-symbols-outlined text-primary text-2xl mt-0.5">edit_note</span>
                      <div className="flex-1">
                        <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wide">Ghi chú cho nhân viên</p>
                        <p className="text-sm text-on-surface mt-0.5 whitespace-pre-line">{staffNote}</p>
                      </div>
                    </div>
                  )}

                  {/* Chi phí tổng */}
                  <div className="p-4 bg-surface rounded-xl border border-outline-variant/20">
                    <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wide mb-3">Chi phí</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-on-surface-variant">
                        <span>{pkgData.title}</span>
                        <span>{fmt(pkgData.price)}</span>
                      </div>
                      {extras.map(id => {
                        const e = EXTRA_SERVICES.find(s => s.id === id);
                        return (
                          <div key={id} className="flex justify-between text-on-surface-variant">
                            <span>{e.title}</span>
                            <span>+{fmt(e.price)}</span>
                          </div>
                        );
                      })}
                      {staffMode === 'manual' && (
                        <div className="flex justify-between text-on-surface-variant">
                          <span>Phí chọn nhân viên</span>
                          <span>+{fmt(staffExtraPrice)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-on-surface-variant">
                        <span>Phí di chuyển</span>
                        <span>{fmt(travelFee)}</span>
                      </div>
                      {promoDiscount > 0 && (
                        <div className="flex justify-between text-primary font-medium">
                          <span>Khuyến mãi</span>
                          <span>-{fmt(promoDiscount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-on-surface font-bold text-base border-t border-outline-variant/20 pt-2 mt-2">
                        <span>Tổng thanh toán</span>
                        <span className="text-primary text-xl">{fmt(total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Chính sách */}
                  <div className="flex gap-3 p-4 bg-surface-container/30 rounded-xl text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-base flex-shrink-0 mt-0.5">verified_user</span>
                    <span>Miễn phí hủy trước 24 giờ. Bảo hiểm thiệt hại 100% do lỗi nhân viên.</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar bước 4: Xác nhận nhanh + tổng */}
            <aside className="lg:col-span-4 sticky top-24">
              <div className="bg-background-2 glass-card p-8 rounded-2xl shadow-xl border border-white/50">
                <h3 className="font-h3 text-h3 text-primary mb-4">Thanh toán</h3>
                <div className="space-y-2 text-sm mb-6">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Dịch vụ</span>
                    <span className="font-semibold text-on-surface">{pkgData.title}</span>
                  </div>
                  {areaData && (
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Diện tích / Giờ</span>
                      <span className="font-semibold text-on-surface">{areaData.label} ({baseHours}h)</span>
                    </div>
                  )}
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Thanh toán qua</span>
                    <span className="font-semibold text-on-surface">{PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>Khuyến mãi</span>
                      <span>-{fmt(promoDiscount)}</span>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t-2 border-dashed border-outline-variant/30 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Tổng</span>
                    <span className="text-3xl font-extrabold text-primary">{fmt(total)}</span>
                  </div>
                </div>
                <p className="text-xs text-center text-on-surface-variant mb-4">
                  Bằng việc bấm Xác nhận, bạn đồng ý với{' '}
                  <Link to="/terms" className="text-primary underline">Điều khoản sử dụng</Link> của CleanTrust.
                </p>
                <button onClick={() => setStep(5)}
                  className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-body-lg shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  Xác nhận đặt lịch — {fmt(total)}
                  <span className="material-symbols-outlined">check</span>
                </button>
                <button onClick={() => setStep(3)}
                  className="w-full mt-3 border-2 border-outline-variant py-3.5 rounded-xl font-semibold hover:bg-surface-container active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">arrow_back</span>
                  Quay lại
                </button>
              </div>
            </aside>
          </div>
        </>
      )}

      {/* ══════════ STEP 5: Hoàn tất ══════════ */}
      {step === 5 && (
        <div ref={headingRef} className="flex flex-col items-center justify-center py-20 text-center scroll-mt-24">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8">
            <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h1 className="font-h2 text-h2 text-primary mb-4">Đặt lịch thành công!</h1>
          <p className="text-on-surface-variant text-body-lg max-w-md mb-8">
            Chúng tôi đã nhận được yêu cầu của bạn. Thông tin xác nhận đã được gửi qua SMS và Email.
          </p>
          <div className="glass-card bg-surface-container-item rounded-2xl p-8 max-w-md w-full text-left mb-8">
            <div className="space-y-3">
              <div className="flex justify-between text-on-surface-variant text-sm">
                <span>Mã đặt lịch</span>
                <span className="font-bold text-primary">#CT{Math.floor(Math.random() * 90000) + 10000}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant text-sm">
                <span>Dịch vụ</span>
                <span className="font-semibold text-on-surface">{pkgData.title}</span>
              </div>
              {areaData && (
                <div className="flex justify-between text-on-surface-variant text-sm">
                  <span>Diện tích</span>
                  <span className="font-semibold text-on-surface">{areaData.label} ({baseHours}h)</span>
                </div>
              )}
              <div className="flex justify-between text-on-surface-variant text-sm">
                <span>Tổng tiền</span>
                <span className="font-bold text-primary">{fmt(total)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Link to="/"
              className="px-8 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary-container transition-all">
              Về trang chủ
            </Link>
            <button onClick={() => {
              setStep(1);
              setSelectedPackage('standard');
              setSelectedArea(null);
              setExtras([]);
              setHasPet(null);
              setStaffMode('auto');
              setRepeatMode('once');
              setSelectedDate(null);
              setRecurringDay('');
              setContactMode('saved');
              setSelectedSavedAddress(0);
              setNewContact({ name: '', phone: '', email: '', street: '', district: '', note: '' });
              setStaffNote('');
              setPaymentMethod('cash');
              setPromoCode('');
              setPromoApplied(false);
              setPromoDiscount(0);
              setErrors({});
            }} className="px-8 py-3 border-2 border-outline-variant rounded-xl font-semibold hover:bg-surface-container transition-all">
              Đặt lịch mới
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default BookingPage;