import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// ─── Constants ───────────────────────────────────────────────────────────────

const PACKAGE_GROUPS = [
  {
    groupId: 'popular',
    groupLabel: 'Phổ biến',
    groupIcon: 'star',
    packages: [
      { id: 'basic-single',  type: 'single',  title: 'Dọn dẹp hằng ngày',      subtitle: 'Ca lẻ',     price: 200000, icon: 'home',            iconBg: 'bg-secondary-container', isDeep: false },
      { id: 'basic-monthly', type: 'monthly', title: 'Dọn dẹp định kỳ',          subtitle: 'Gói tháng', price: 180000, icon: 'home',            iconBg: 'bg-secondary-container', isDeep: false },
      { id: 'office',        type: 'monthly', title: 'Dọn văn phòng',            subtitle: 'Gói tháng', price: 160000, icon: 'business_center', iconBg: 'bg-secondary-container', isDeep: false },
    ],
  },
  {
    groupId: 'deep',
    groupLabel: 'Chuyên sâu',
    groupIcon: 'flare',
    packages: [
      { id: 'deep',    type: 'deep', title: 'Tổng vệ sinh chuyên sâu', subtitle: 'Nâng cao', price: 450000, icon: 'flare',        iconBg: 'bg-tertiary-fixed', isDeep: true },
      { id: 'postcon', type: 'deep', title: 'Dọn sau xây dựng',        subtitle: 'Ca lẻ',    price: 500000, icon: 'construction', iconBg: 'bg-tertiary-fixed', isDeep: true },
    ],
  },
  {
    groupId: 'care',
    groupLabel: 'Chăm sóc',
    groupIcon: 'favorite',
    packages: [
      { id: 'aircon',   type: 'single', title: 'Vệ sinh máy lạnh',       subtitle: 'Ca lẻ', price: 180000, icon: 'ac_unit',      iconBg: 'bg-secondary-container', isDeep: false },
      { id: 'sofa',     type: 'single', title: 'Giặt ghế sofa',          subtitle: 'Ca lẻ', price: 250000, icon: 'weekend',      iconBg: 'bg-secondary-container', isDeep: false },
      { id: 'mattress', type: 'single', title: 'Giặt nệm',               subtitle: 'Ca lẻ', price: 300000, icon: 'bed',          iconBg: 'bg-secondary-container', isDeep: false },
      { id: 'kitchen',  type: 'single', title: 'Vệ sinh bếp chuyên sâu', subtitle: 'Ca lẻ', price: 220000, icon: 'soup_kitchen', iconBg: 'bg-secondary-container', isDeep: false },
      { id: 'carpet',   type: 'single', title: 'Giặt thảm',              subtitle: 'Ca lẻ', price: 200000, icon: 'texture',      iconBg: 'bg-secondary-container', isDeep: false },
    ],
  },
];

const PACKAGES = PACKAGE_GROUPS.flatMap(g => g.packages);

const AREA_OPTIONS_NORMAL = [
  { id: 'under-55', label: 'Dưới 55m²',   sub: 'Khoảng 1–2 phòng', baseHours: 2, price: 200000 },
  { id: '55-85',    label: '55 – 85m²',   sub: 'Khoảng 2–3 phòng', baseHours: 3, price: 260000 },
  { id: '85-120',   label: '85 – 120m²',  sub: 'Khoảng 3–4 phòng', baseHours: 4, price: 350000 },
];

const AREA_OPTIONS_DEEP = [
  { id: 'deep-60',  label: 'Dưới 60m²',   sub: 'Khoảng 1–2 phòng',   baseHours: 3, staffCount: 2, price: 450000  },
  { id: 'deep-80',  label: '60 – 80m²',   sub: 'Khoảng 2–3 phòng',   baseHours: 4, staffCount: 2, price: 550000  },
  { id: 'deep-150', label: '80 – 150m²',  sub: 'Khoảng 3–5 phòng',   baseHours: 4, staffCount: 3, price: 750000  },
  { id: 'deep-200', label: '150 – 200m²', sub: 'Khoảng 5–7 phòng',   baseHours: 4, staffCount: 4, price: 1000000 },
  { id: 'deep-400', label: 'Trên 200m²',  sub: 'Biệt thự / sàn lớn', baseHours: 8, staffCount: 4, price: 1800000 },
];

const EXTRA_SERVICES = [
  { id: 'fridge', title: 'Làm sạch tủ lạnh',    price: 100000, icon: 'kitchen',  addHours: 1 },
  { id: 'glass',  title: 'Lau kính',             price: 150000, icon: 'window',   addHours: 1 },
  { id: 'iron',   title: 'Ủi quần áo',           price: 80000,  icon: 'iron',     addHours: 1 },
];

const TIME_SLOTS = {
  morning:   ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
  afternoon: ['13:00', '14:00', '15:00', '16:00', '17:00'],
  evening:   ['18:00', '19:00', '20:00', '21:00'],
};

const URGENT_THRESHOLD_HOURS = 1.5;
const URGENT_FEE = 50000;
const SELF_PICK_FEE = 20000;

const WEEK_DAY_OPTIONS = [
  { id: 'mon', label: 'T2', full: 'Thứ Hai' },
  { id: 'tue', label: 'T3', full: 'Thứ Ba' },
  { id: 'wed', label: 'T4', full: 'Thứ Tư' },
  { id: 'thu', label: 'T5', full: 'Thứ Năm' },
  { id: 'fri', label: 'T6', full: 'Thứ Sáu' },
  { id: 'sat', label: 'T7', full: 'Thứ Bảy' },
  { id: 'sun', label: 'CN', full: 'Chủ Nhật' },
];

const MONTHLY_DURATION_OPTIONS = [
  { id: '1', label: '1 tháng', months: 1,  discount: 0  },
  { id: '2', label: '2 tháng', months: 2,  discount: 5  },
  { id: '3', label: '3 tháng', months: 3,  discount: 10 },
  { id: '6', label: '6 tháng', months: 6,  discount: 20 },
];

const SAVED_ADDRESSES = [
  { id: 0, label: 'Nhà riêng', address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM', icon: 'home' },
  { id: 1, label: 'Văn phòng', address: '456 Lê Lợi, Phường Phạm Ngũ Lão, Quận 1, TP.HCM',  icon: 'business' },
];

const SAVED_CONTACTS = [
  { id: 0, name: 'Nguyễn Văn A', phone: '0901 234 567', email: 'a@example.com' },
  { id: 1, name: 'Trần Thị B',   phone: '0912 345 678', email: 'b@example.com' },
];

const PAYMENT_METHODS = [
  { id: 'cash',       icon: 'payments',               label: 'Tiền mặt' },
  { id: 'cleantrust', icon: 'account_balance_wallet',  label: 'Ví CleanTrust', badge: 'Hoàn tiền TĐ' },
  { id: 'card',       icon: 'credit_card',             label: 'Visa / Mastercard' },
  { id: 'ewallet',    icon: 'smartphone',              label: 'MoMo / ZaloPay' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => n.toLocaleString('vi-VN') + 'đ';

const getNext7Days = () => {
  const days = [];
  const today = new Date();
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      label: i === 0 ? 'Hôm nay' : dayNames[d.getDay()],
      dateNum: d.getDate(),
      month: d.getMonth(),
      year: d.getFullYear(),
      isToday: i === 0,
      dateObj: d,
    });
  }
  return days;
};

const isUrgentSlot = (dayObj, timeStr) => {
  if (!dayObj || !dayObj.isToday || !timeStr) return false;
  const now = new Date();
  const [h, m] = timeStr.split(':').map(Number);
  const slotTime = new Date();
  slotTime.setHours(h, m, 0, 0);
  const diffHours = (slotTime - now) / 3600000;
  return diffHours >= 0 && diffHours < URGENT_THRESHOLD_HOURS;
};

const isSlotDisabled = (dayObj, timeStr) => {
  if (!dayObj || !dayObj.isToday) return false;
  const now = new Date();
  const [h, m] = timeStr.split(':').map(Number);
  const slotTime = new Date();
  slotTime.setHours(h, m, 0, 0);
  const diffHours = (slotTime - now) / 3600000;
  return diffHours < URGENT_THRESHOLD_HOURS;
};

const getEarliestBookableTime = () => {
  const now = new Date();
  return new Date(now.getTime() + URGENT_THRESHOLD_HOURS * 3600000);
};

const formatTimeHM = (date) => {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

const calcTotalHours = (baseHours, extraIds) => {
  const extraHours = EXTRA_SERVICES.filter(s => extraIds.includes(s.id))
    .reduce((sum, s) => sum + s.addHours, 0);
  return baseHours + extraHours;
};

// FIX #4: tổng số buổi = days/week * ~4.33 weeks/month * months
const calcMonthlySessions = (weekDayCount, months) => {
  return Math.round(weekDayCount * 4.33 * months);
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

// FIX #5: SectionTitle nhận thêm refProp để focus vào heading khi có lỗi
const SectionTitle = ({ icon, children, refProp }) => (
  <h3 ref={refProp} className="font-h3 text-h3 mb-6 text-on-surface flex items-center gap-2 scroll-mt-28">
    <span className="material-symbols-outlined text-primary">{icon}</span>
    {children}
  </h3>
);

const SelectedCheck = () => (
  <div className="absolute top-3 right-3 text-primary">
    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
  </div>
);

// ─── Toggle Switch Component ──────────────────────────────────────────────────

const ToggleRow = ({ icon, title, description, checked, onChange, extraBadge }) => (
  <div className="flex items-center justify-between gap-4 p-5 rounded-xl border-2 border-outline-variant/30 bg-surface-container-lowest">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${checked ? 'bg-primary/10' : 'bg-surface-container'}`}>
        <span className={`material-symbols-outlined transition-all ${checked ? 'text-primary' : 'text-on-surface-variant'}`}>{icon}</span>
      </div>
      <div>
        <p className="font-bold text-on-surface text-base flex items-center gap-2">
          {title}
          {extraBadge && (
            <span className="text-xs font-bold px-2 py-0.5 bg-error/10 text-error rounded-full">{extraBadge}</span>
          )}
        </p>
        <p className="text-sm text-on-surface-variant mt-0.5">{description}</p>
      </div>
    </div>
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        checked ? 'bg-primary' : 'bg-outline-variant'
      }`}
    >
      <span className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ${checked ? 'translate-x-7' : 'translate-x-0'}`} />
    </button>
  </div>
);

// ─── FIX #3: Custom Time Picker — cho nhập tự do, báo lỗi sau khi nhập ──────

const CustomTimePicker = ({ value, onChange, dayObj }) => {
  const [hour, setHour]         = useState(value ? value.split(':')[0] : '08');
  const [minute, setMinute]     = useState(value ? value.split(':')[1] : '00');
  const [customError, setCustomError] = useState(null);

  const hours   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  // FIX #3: validate AFTER user picks, but ALWAYS emit a value — never block
  const validateAndEmit = (h, m) => {
    const timeStr = `${h}:${m}`;
    if (dayObj && dayObj.isToday) {
      const now = new Date();
      const slotTime = new Date();
      slotTime.setHours(parseInt(h), parseInt(m), 0, 0);
      const diffHours = (slotTime - now) / 3600000;
      if (diffHours < URGENT_THRESHOLD_HOURS) {
        const earliest = getEarliestBookableTime();
        setCustomError(`Giờ không hợp lệ cho hôm nay. Cần đặt trước ít nhất 1 tiếng 30 phút. Giờ sớm nhất: ${formatTimeHM(earliest)}`);
        // FIX #3: vẫn emit null để bước không pass validation, nhưng không reset dropdown
        onChange(null);
        return;
      }
    }
    setCustomError(null);
    onChange(timeStr);
  };

  const handleHourChange   = (h) => { setHour(h);   validateAndEmit(h, minute); };
  const handleMinuteChange = (m) => { setMinute(m); validateAndEmit(hour, m); };

  const earliest = dayObj?.isToday ? getEarliestBookableTime() : null;

  return (
    <div className="mt-3 p-4 rounded-xl border-2 border-primary bg-primary/5 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="material-symbols-outlined text-primary text-base">schedule</span>
        <span className="text-sm font-semibold text-on-surface-variant">Chọn giờ:</span>
        <div className="flex items-center gap-2 ml-2">
          <div className="flex flex-col items-center">
            <span className="text-xs text-on-surface-variant mb-1 font-medium">Giờ</span>
            <select value={hour} onChange={e => handleHourChange(e.target.value)}
              className="w-16 py-2 px-1 rounded-lg border-2 border-primary/40 bg-surface text-on-surface font-bold text-center focus:outline-none focus:border-primary appearance-none cursor-pointer">
              {hours.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <span className="text-xl font-bold text-primary mt-4">:</span>
          <div className="flex flex-col items-center">
            <span className="text-xs text-on-surface-variant mb-1 font-medium">Phút</span>
            <select value={minute} onChange={e => handleMinuteChange(e.target.value)}
              className="w-16 py-2 px-1 rounded-lg border-2 border-primary/40 bg-surface text-on-surface font-bold text-center focus:outline-none focus:border-primary appearance-none cursor-pointer">
              {minutes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <span className="text-sm font-bold text-primary mt-4 ml-1">{hour}:{minute}</span>
        </div>
      </div>
      {earliest && (
        <p className="text-xs text-on-surface-variant flex items-center gap-1">
          <span className="material-symbols-outlined text-xs text-primary">info</span>
          Hôm nay cần đặt trước 1 tiếng 30 phút — giờ sớm nhất: <span className="font-bold text-primary ml-1">{formatTimeHM(earliest)}</span>
        </p>
      )}
      {customError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-error/10 border border-error/30">
          <span className="material-symbols-outlined text-error text-base mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
          <p className="text-sm text-error font-medium">{customError}</p>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const BookingPage = () => {
  const [step, setStep] = useState(1);
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]);

  // ── Step 1 state ──
  const [selectedPackage, setSelectedPackage] = useState('basic-single');
  const [showTasksId, setShowTasksId]         = useState(null);
  const [selectedArea, setSelectedArea]       = useState(null);
  const [extras, setExtras]                   = useState([]);
  const [hasPet, setHasPet]                   = useState(null);
  const [staffFavorite, setStaffFavorite]     = useState(false);
  const [staffSelfPick, setStaffSelfPick]     = useState(false);

  // ── Step 2 state ──
  const [repeatMode, setRepeatMode]             = useState('once');
  const [selectedDayIdx, setSelectedDayIdx]     = useState(null);
  const [monthlyDuration, setMonthlyDuration]   = useState('1');
  const [selectedWeekDays, setSelectedWeekDays] = useState([]);
  const [selectedTime, setSelectedTime]         = useState(null);
  const [customTimeValue, setCustomTimeValue]   = useState(null);
  const [showCustomTime, setShowCustomTime]     = useState(false);
  const [recurringDay, setRecurringDay]         = useState('');

  // ── Step 3 state ──
  const [contactMode, setContactMode]                   = useState('saved');
  const [selectedSavedContact, setSelectedSavedContact] = useState(0);
  const [newContact, setNewContact]                     = useState({ name: '', phone: '', email: '' });
  const [addressMode, setAddressMode]                   = useState('saved');
  const [selectedSavedAddress, setSelectedSavedAddress] = useState(0);
  const [newAddress, setNewAddress]                     = useState({ street: '', district: '', note: '' });
  const [staffNote, setStaffNote]                       = useState('');

  // ── Step 4 state ──
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [promoCode, setPromoCode]         = useState('');
  const [promoApplied, setPromoApplied]   = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  // ── Step 5 task modal ──
  const [showStep5Tasks, setShowStep5Tasks] = useState(false);

  // ── Errors & refs ──
  const [errors, setErrors] = useState({});

  // FIX #5: refs point to section headings (h3), not just error fields
  const sectionRefs = {
    area:         useRef(null), // heading "Diện tích nhà & Thời lượng"
    pet:          useRef(null), // heading "Nhà bạn có nuôi thú cưng"
    date:         useRef(null), // heading "Chọn ngày làm việc" / "Chọn ngày làm việc hằng tuần"
    time:         useRef(null), // heading "Khung giờ mỗi buổi" / "Chọn khung giờ"
    recurringDay: useRef(null), // heading "Chọn ngày trong tuần"
    name:         useRef(null), // heading "Thông tin liên hệ"
    street:       useRef(null), // heading "Địa chỉ vệ sinh"
  };

  // ── Derived ──
  const pkgData        = PACKAGES.find(p => p.id === selectedPackage) || PACKAGES[0];
  const isDeep         = pkgData.isDeep;
  const isMonthly      = pkgData.type === 'monthly';
  const isSingle       = pkgData.type === 'single';
  const areaList       = isDeep ? AREA_OPTIONS_DEEP : AREA_OPTIONS_NORMAL;
  const areaData       = areaList.find(a => a.id === selectedArea);
  const next7Days      = getNext7Days();
  const selectedDayObj = selectedDayIdx !== null ? next7Days[selectedDayIdx] : null;

  const baseHours         = areaData ? areaData.baseHours : 2;
  const totalHours        = isDeep ? baseHours : calcTotalHours(baseHours, extras);
  const MAX_HOURS         = 4;
  const isOverMax         = !isDeep && totalHours > MAX_HOURS;
  const allowedExtraHours = !isDeep ? MAX_HOURS - baseHours : 99;
  const extraHoursUsed    = EXTRA_SERVICES.filter(s => extras.includes(s.id)).reduce((sum, s) => sum + s.addHours, 0);

  const effectiveTime = showCustomTime ? customTimeValue : selectedTime;
  const isUrgent      = effectiveTime ? isUrgentSlot(selectedDayObj, effectiveTime) : false;
  const urgentFee     = isUrgent ? URGENT_FEE : 0;
  const selfPickFee   = staffSelfPick ? SELF_PICK_FEE : 0;
  const travelFee     = 15000;
  const extrasTotal   = EXTRA_SERVICES.filter(s => extras.includes(s.id)).reduce((sum, s) => sum + s.price, 0);
  const basePrice     = areaData ? areaData.price : pkgData.price;

  const monthlyDurationData = MONTHLY_DURATION_OPTIONS.find(d => d.id === monthlyDuration);

  // FIX #4: Tính tiền gói tháng đúng cách
  // Giá mỗi tháng = basePrice (giá/buổi) × số ngày/tuần × 4.33 tuần
  // Tổng = giá/tháng × số tháng
  // Discount = % off trên tổng trước discount
  const weeklySessionCount   = isMonthly && selectedWeekDays.length > 0 ? selectedWeekDays.length : 1;
  const monthlySessionsPerMonth = Math.round(weeklySessionCount * 4.33);
  const monthlyRawTotal      = isMonthly
    ? basePrice * monthlySessionsPerMonth * (monthlyDurationData?.months || 1)
    : 0;
  const monthlyDiscount      = isMonthly && monthlyDurationData
    ? Math.round(monthlyRawTotal * (monthlyDurationData.discount / 100))
    : 0;

  const totalSessions = isMonthly && selectedWeekDays.length > 0 && monthlyDurationData
    ? calcMonthlySessions(selectedWeekDays.length, monthlyDurationData.months)
    : null;

  const subtotal = isMonthly
    ? monthlyRawTotal + extrasTotal + travelFee + urgentFee + selfPickFee
    : basePrice + extrasTotal + travelFee + urgentFee + selfPickFee;
  const total = Math.max(0, subtotal - promoDiscount - monthlyDiscount);
  const walletBalance = 320000;

  const handleSelectPackage = (id) => {
    setSelectedPackage(id);
    setSelectedArea(null);
    setExtras([]);
    setRepeatMode('once');
    setSelectedDayIdx(null);
    setSelectedWeekDays([]);
    setSelectedTime(null);
    setCustomTimeValue(null);
    setShowCustomTime(false);
    setRecurringDay('');
  };

  const toggleExtra = (id) => {
    const svc = EXTRA_SERVICES.find(s => s.id === id);
    if (!svc) return;
    if (extras.includes(id)) {
      setExtras(prev => prev.filter(i => i !== id));
    } else {
      if (!isDeep && extraHoursUsed + svc.addHours > allowedExtraHours) return;
      setExtras(prev => [...prev, id]);
    }
  };

  const toggleWeekDay = (id) => {
    setErrors(p => ({ ...p, date: null }));
    if (selectedWeekDays.includes(id)) {
      setSelectedWeekDays(prev => prev.filter(d => d !== id));
    } else {
      if (selectedWeekDays.length >= 7) return;
      setSelectedWeekDays(prev => [...prev, id]);
    }
  };

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'CLEANTRUST10') {
      setPromoDiscount(Math.round(subtotal * 0.1));
      setPromoApplied(true);
      setErrors(p => ({ ...p, promo: null }));
    } else {
      setPromoApplied(false);
      setPromoDiscount(0);
      setErrors(p => ({ ...p, promo: 'Mã không hợp lệ hoặc đã hết hạn.' }));
    }
  };

  // FIX: nhận trực tiếp object lỗi e (không đọc từ state vì setErrors là async)
  const focusFirstErrorSection = (errorObj, keys) => {
    for (const key of keys) {
      if (errorObj[key] && sectionRefs[key]?.current) {
        sectionRefs[key].current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
  };

  const validateStep1 = () => {
    const e = {};
    if (!selectedArea)   e.area = 'Vui lòng chọn diện tích nhà.';
    if (isOverMax)       e.area = 'Tổng thời gian vượt 4 giờ! Vui lòng bỏ bớt dịch vụ thêm.';
    if (hasPet === null) e.pet  = 'Vui lòng cho biết nhà bạn có nuôi thú cưng không.';
    setErrors(e);
    if (Object.keys(e).length > 0) {
      focusFirstErrorSection(e, ['area', 'pet']);
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const e = {};
    if (isSingle && repeatMode === 'once') {
      if (selectedDayIdx === null) e.date = 'Vui lòng chọn ngày làm việc.';
      if (!effectiveTime)          e.time = 'Vui lòng chọn hoặc nhập giờ làm việc.';
    }
    if (isSingle && repeatMode !== 'once') {
      if (!recurringDay)  e.recurringDay = 'Vui lòng chọn ngày làm việc trong tuần.';
      if (!effectiveTime) e.time         = 'Vui lòng chọn giờ làm việc.';
    }
    if (isMonthly) {
      if (selectedWeekDays.length === 0) e.date = 'Vui lòng chọn ít nhất 1 ngày làm việc.';
      if (!effectiveTime)                e.time = 'Vui lòng chọn giờ làm việc.';
    }
    if (isDeep) {
      if (selectedDayIdx === null) e.date = 'Vui lòng chọn ngày làm việc.';
      if (!effectiveTime)          e.time = 'Vui lòng chọn hoặc nhập giờ làm việc.';
    }

    setErrors(e);

    if (Object.keys(e).length > 0) {
      focusFirstErrorSection(e, ['recurringDay', 'date', 'time']);
      return false;
    }
    
    return true;
  };

  const validateStep3 = () => {
    const e = {};
    if (contactMode === 'new') {
      if (!newContact.name.trim())  e.name  = 'Vui lòng nhập họ tên.';
      if (!newContact.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại.';
    }
    if (addressMode === 'new') {
      if (!newAddress.street.trim())   e.street   = 'Vui lòng nhập số nhà, tên đường.';
      if (!newAddress.district.trim()) e.district = 'Vui lòng nhập phường / quận.';
    }
    setErrors(e);
    if (Object.keys(e).length > 0) {
      focusFirstErrorSection(e, ['name', 'street']);
      return false;
    }
    return true;
  };

  // ── Step indicator ──
  const StepIndicator = () => {
    const steps = [
      { num: 1, label: 'Dịch vụ' },
      { num: 2, label: 'Lịch hẹn' },
      { num: 3, label: 'Thông tin' },
      { num: 4, label: 'Thanh toán' },
      { num: 5, label: 'Xác nhận' },
    ];
    return (
      <div className="flex items-center gap-2 flex-wrap text-on-surface-variant mt-4">
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
                <span className="hidden sm:inline text-sm">{s.label}</span>
              </span>
              {i < steps.length - 1 && (
                <div className={`h-px flex-1 min-w-3 max-w-10 transition-all ${step > s.num ? 'bg-primary' : 'bg-outline-variant'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // ── Order Summary Sidebar ──
  const OrderSummary = ({ onPrimary, primaryLabel, onBack, showActions = true, confirmMode = false }) => (
    <aside className="lg:col-span-4 sticky top-24">
      <div className="bg-background-2 glass-card rounded-2xl shadow-xl border border-white/50 overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant/20">
          <h3 className="font-h3 text-h3 text-primary">Tóm tắt dịch vụ</h3>
        </div>
        <div className="px-6 py-4 space-y-3 text-sm">
          <div className="flex justify-between items-center gap-3 text-on-surface-variant">
            <span className="shrink-0">Dịch vụ</span>
            <span className="font-semibold px-3 py-1 bg-secondary-container text-primary rounded-full text-sm text-right leading-snug">
              {pkgData.title}
            </span>
          </div>
          {areaData && (
            <div className="flex justify-between text-on-surface-variant">
              <span>Diện tích</span>
              <span className="font-semibold text-on-surface">{areaData.label}</span>
            </div>
          )}
          {areaData && (
            <div className="flex justify-between text-on-surface-variant">
              <span>Thời lượng</span>
              <span className="font-semibold text-on-surface">
                {baseHours}h{isDeep && areaData.staffCount > 1 ? ` × ${areaData.staffCount} NV` : ''}
              </span>
            </div>
          )}
          {/* FIX #4: monthly — hiển thị số buổi/tháng và tổng buổi */}
          {isMonthly && selectedWeekDays.length > 0 && (
            <>
              <div className="flex justify-between text-on-surface-variant">
                <span>Ngày/tuần</span>
                <span className="font-semibold text-on-surface">{selectedWeekDays.length} ngày</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Buổi/tháng</span>
                <span className="font-semibold text-on-surface">~{monthlySessionsPerMonth} buổi</span>
              </div>
            </>
          )}
          {isMonthly && monthlyDurationData && (
            <div className="flex justify-between text-on-surface-variant">
              <span>Gói đăng ký</span>
              <span className="font-semibold text-on-surface">{monthlyDurationData.label}</span>
            </div>
          )}
          {isMonthly && totalSessions && (
            <div className="flex justify-between text-on-surface-variant">
              <span>Tổng số buổi</span>
              <span className="font-semibold text-on-surface">~{totalSessions} buổi</span>
            </div>
          )}
          {isMonthly && monthlyDurationData && monthlyDurationData.discount > 0 && (
            <div className="flex justify-between text-primary font-medium">
              <span>Ưu đãi gói {monthlyDurationData.label}</span>
              <span>-{monthlyDurationData.discount}%</span>
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
          <div className="flex justify-between text-on-surface-variant">
            <span>Phí di chuyển</span>
            <span>{fmt(travelFee)}</span>
          </div>
          {staffSelfPick && (
            <div className="flex justify-between text-on-surface-variant">
              <span>Phí tự chọn NV</span>
              <span>+{fmt(selfPickFee)}</span>
            </div>
          )}
          {isUrgent && (
            <div className="flex justify-between text-error font-medium">
              <span>Phí đặt gấp</span>
              <span>+{fmt(urgentFee)}</span>
            </div>
          )}
          {promoDiscount > 0 && (
            <div className="flex justify-between text-primary font-medium">
              <span>Khuyến mãi</span>
              <span>-{fmt(promoDiscount)}</span>
            </div>
          )}
          {step >= 4 && (
            <div className="flex justify-between text-on-surface-variant">
              <span>Thanh toán</span>
              <span className="font-semibold text-on-surface">
                {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}
              </span>
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
              {confirmMode && (
                <p className="text-xs text-center text-on-surface-variant mb-4">
                  Bằng việc bấm Xác nhận, bạn đồng ý với{' '}
                  <Link to="/terms" className="text-primary underline">Điều khoản sử dụng</Link> của CleanTrust.
                </p>
              )}
              <button
                onClick={onPrimary}
                className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-body-lg shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {primaryLabel}
                <span className="material-symbols-outlined">{confirmMode ? 'check' : 'arrow_forward'}</span>
              </button>
              {onBack && (
                <button
                  onClick={onBack}
                  className="w-full mt-3 border-2 border-outline-variant py-3.5 rounded-xl font-semibold hover:bg-surface-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
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

  // ── Task Modal ──
  const TaskModal = ({ pkgIdProp, onClose }) => {
    if (!pkgIdProp) return null;
    const pkg = PACKAGES.find(p => p.id === pkgIdProp);
    const tasks = pkg?.isDeep
      ? ['Tất cả dịch vụ Tiêu chuẩn', 'Chà bóng, tẩy ố sàn gạch', 'Làm sạch kính cửa sổ', 'Vệ sinh sâu tủ bếp', 'Lau quạt trần và đèn', 'Đánh bóng thiết bị vệ sinh', 'Dọn sau xây dựng / chuyển nhà']
      : ['Quét và lau sàn toàn bộ', 'Lau bụi đồ đạc TV, kệ, tủ', 'Dọn và thay túi rác', 'Vệ sinh bề mặt bếp', 'Vệ sinh nhà vệ sinh', 'Xếp dọn gọn gàng đồ đạc'];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-surface rounded-2xl p-8 max-w-md w-full shadow-2xl border border-outline-variant/30" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-h3 text-h3 text-on-surface">{pkg?.title}</h3>
              <p className="text-sm text-on-surface-variant mt-1">Nhân viên sẽ thực hiện các công việc sau</p>
            </div>
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <ul className="space-y-3">
            {tasks.map((task, i) => (
              <li key={i} className="flex items-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-base flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                {task}
              </li>
            ))}
          </ul>
          <button onClick={onClose} className="w-full mt-6 py-3 bg-primary text-on-primary rounded-xl font-semibold transition-all hover:bg-primary-container">Đã hiểu</button>
        </div>
      </div>
    );
  };

  // ── Shared time slot picker ──
  // FIX #2: khi show custom time, auto set 08:00 là giá trị hợp lệ ngay
  const TimeSlotPicker = ({ periods = ['morning', 'afternoon', 'evening'], showCustom = true }) => {
    const labels = { morning: 'Buổi sáng', afternoon: 'Buổi chiều', evening: 'Buổi tối' };
    const icons  = { morning: 'light_mode', afternoon: 'wb_twilight', evening: 'dark_mode' };
    const earliest = selectedDayObj?.isToday ? getEarliestBookableTime() : null;

    return (
      <div className="space-y-5">
        {selectedDayObj?.isToday && earliest && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20 text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-primary text-base mt-0.5">schedule</span>
            <span>
              Hôm nay cần đặt trước tối thiểu <strong className="text-on-surface">1 tiếng 30 phút</strong>.
              Giờ sớm nhất có thể đặt: <strong className="text-primary">{formatTimeHM(earliest)}</strong>
            </span>
          </div>
        )}

        {periods.map(period => (
          <div key={period}>
            <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-1">
              <span className="material-symbols-outlined text-base">{icons[period]}</span>
              {labels[period]}
            </h4>
            <div className="flex gap-2 flex-wrap">
              {TIME_SLOTS[period].map(t => {
                const urgent   = isUrgentSlot(selectedDayObj, t);
                const disabled = isSlotDisabled(selectedDayObj, t);
                const isSelected = !showCustomTime && selectedTime === t;
                return (
                  <button key={t}
                    disabled={disabled}
                    onClick={() => {
                      if (disabled) return;
                      setSelectedTime(t);
                      setShowCustomTime(false);
                      setErrors(p => ({ ...p, time: null }));
                    }}
                    className={`relative py-2 px-3 border-2 rounded-xl text-sm font-semibold transition-all ${
                      disabled
                        ? 'border-outline-variant/20 text-on-surface-variant/30 bg-surface-container-lowest cursor-not-allowed line-through'
                        : isSelected
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-outline-variant/50 text-on-surface hover:border-primary'
                    }`}>
                    {t}
                    {urgent && !disabled && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-error rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-[10px]">bolt</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {showCustom && (
          <div>
            <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-1">
              <span className="material-symbols-outlined text-base">tune</span>
              Giờ khác
            </h4>
            <button
              onClick={() => {
                const next = !showCustomTime;
                setShowCustomTime(next);
                if (next) {
                  setSelectedTime(null);
                  // FIX #2: auto-set 08:00 làm giờ mặc định ngay khi bật custom time
                  // Nếu không phải hôm nay, 08:00 luôn hợp lệ
                  // Nếu hôm nay, kiểm tra 08:00 có đủ 1.5h không; nếu không, để null (user tự chọn)
                  const defaultTime = '08:00';
                  const wouldBeValid = !selectedDayObj?.isToday || !isSlotDisabled(selectedDayObj, defaultTime);
                  if (wouldBeValid) {
                    setCustomTimeValue(defaultTime);
                    setErrors(p => ({ ...p, time: null }));
                  } else {
                    // Hôm nay 08:00 đã qua — set earliest possible
                    const earliest2 = getEarliestBookableTime();
                    const eh = String(earliest2.getHours()).padStart(2, '0');
                    const em = String(earliest2.getMinutes()).padStart(2, '0');
                    const fallback = `${eh}:${em}`;
                    setCustomTimeValue(fallback);
                    setErrors(p => ({ ...p, time: null }));
                  }
                }
              }}
              className={`py-2 px-4 border-2 rounded-xl text-sm font-semibold transition-all ${
                showCustomTime
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-outline-variant/50 text-on-surface hover:border-primary'
              }`}
            >
              {showCustomTime && customTimeValue ? `Giờ tùy chọn: ${customTimeValue}` : 'Tự nhập giờ'}
            </button>
            {showCustomTime && (
              <CustomTimePicker
                value={customTimeValue || '08:00'}
                dayObj={selectedDayObj}
                onChange={(val) => {
                  setCustomTimeValue(val);
                  if (val) setErrors(p => ({ ...p, time: null }));
                }}
              />
            )}
          </div>
        )}

        {isUrgent && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-error/10 border border-error/30 text-sm text-error font-medium">
            <span className="material-symbols-outlined text-base">bolt</span>
            Khung giờ này áp dụng phí đặt gấp <span className="font-bold ml-1">+{fmt(urgentFee)}</span>
          </div>
        )}
        <ErrorMsg message={errors.time} />
      </div>
    );
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <main className="pt-32 pb-section-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen">
      <TaskModal pkgIdProp={showTasksId} onClose={() => setShowTasksId(null)} />
      <TaskModal pkgIdProp={showStep5Tasks ? selectedPackage : null} onClose={() => setShowStep5Tasks(false)} />

      {/* ══════════ STEP 1 ══════════ */}
      {step === 1 && (
        <>
          <div ref={headingRef} className="mb-12 scroll-mt-24">
            <h1 className="font-h2 text-h2 text-primary mb-1">Bước 1: Chọn dịch vụ</h1>
            <StepIndicator />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            <div className="lg:col-span-8 space-y-6">

              {/* 1A. Chọn gói dịch vụ — FIX #1: card to hơn, badge ra rìa phải, cách đều */}
              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                <SectionTitle icon="cleaning_services">Chọn gói dịch vụ</SectionTitle>

                <div className="space-y-8">
                  {PACKAGE_GROUPS.map(group => (
                    <div key={group.groupId}>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary text-base">{group.groupIcon}</span>
                        <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">{group.groupLabel}</h4>
                        <div className="flex-1 h-px bg-outline-variant/30 ml-1" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {group.packages.map(pkg => {
                          const isSelected = selectedPackage === pkg.id;
                          return (
                            <div key={pkg.id} className="relative">
                              <label className="cursor-pointer block h-full">
                                <input type="radio" name="package" checked={isSelected} onChange={() => handleSelectPackage(pkg.id)} className="peer sr-only" />
                                {/* FIX #1: layout dọc, tên to hơn, badge nằm riêng dòng, giá cách đều */}
                                <div className={`glass-card px-5 py-4 rounded-xl border-2 transition-all flex items-start gap-4 h-full ${
                                  isSelected ? 'border-primary bg-primary/5' : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40'
                                }`}>
                                  {/* Icon */}
                                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isSelected ? 'bg-primary/10' : 'bg-surface-container'}`}>
                                    <span className={`material-symbols-outlined text-2xl ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>{pkg.icon}</span>
                                  </div>
                                  {/* Text block */}
                                  <div className="flex-1 min-w-0">
                                    {/* Row: name + badge pushed to right */}
                                    <div className="flex items-start justify-between gap-2">
                                      <h4 className="font-bold text-on-surface text-base leading-snug">{pkg.title}</h4>
                                      {/* FIX #1: badge sát rìa phải */}
                                      <span className="text-xs font-bold px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-full shrink-0 whitespace-nowrap mt-0.5">
                                        {pkg.subtitle}
                                      </span>
                                    </div>
                                    {/* Price — cách đều với tên */}
                                    <span className="text-primary font-extrabold text-base mt-2 block">{fmt(pkg.price)}<span className="text-sm font-semibold text-on-surface-variant">/buổi</span></span>
                                  </div>
                                  {isSelected && (
                                    <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                  )}
                                </div>
                              </label>
                              {/* Chi tiết button — positioned bottom-right */}
                              <button
                                onClick={() => setShowTasksId(pkg.id)}
                                className="absolute bottom-3 right-4 flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                              >
                                <span className="material-symbols-outlined text-sm">info</span>
                                Chi tiết
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 1B. Diện tích & Thời lượng */}
              {/* FIX #5: refProp points to h3 heading so scroll lands on the card title */}
              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                <SectionTitle icon="straighten" refProp={sectionRefs.area}>Diện tích nhà & Thời lượng làm việc</SectionTitle>

                {isDeep && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-tertiary-fixed/40 border border-tertiary-fixed mb-5 text-sm text-on-tertiary-fixed-variant">
                    <span className="material-symbols-outlined text-base mt-0.5">group</span>
                    <span>Tổng vệ sinh cần nhiều nhân viên theo diện tích. Giá đã bao gồm nhân sự.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {areaList.map(opt => {
                    const isSelected = selectedArea === opt.id;
                    return (
                      <label key={opt.id} className="relative cursor-pointer">
                        <input type="radio" checked={isSelected} onChange={() => { setSelectedArea(opt.id); setErrors(p => ({...p, area: null})); }} className="peer sr-only" />
                        <div className={`glass-card p-5 rounded-xl border-2 transition-all text-center h-full flex flex-col items-center gap-2 ${
                          isSelected ? 'border-primary bg-primary/5' : errors.area ? 'border-error/40' : 'border-outline-variant/30 bg-surface-container-lowest'}`}>
                          <span className="material-symbols-outlined text-3xl text-primary">home</span>
                          <p className="font-bold text-on-surface text-base">{opt.label}</p>
                          <p className="text-sm text-on-surface-variant">{opt.sub}</p>
                          <div className="mt-1 px-3 py-1 bg-primary/10 rounded-full">
                            <span className="text-primary font-bold text-sm">
                              {opt.baseHours}h{isDeep ? ` · ${opt.staffCount} nhân viên` : ''}
                            </span>
                          </div>
                          <span className="font-bold text-primary text-base">{fmt(opt.price)}</span>
                        </div>
                        {isSelected && <SelectedCheck />}
                      </label>
                    );
                  })}
                </div>
                <ErrorMsg message={errors.area} />

                {!isDeep && isOverMax && (
                  <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-error/5 border border-error/40">
                    <span className="material-symbols-outlined text-error mt-0.5">warning</span>
                    <div>
                      <p className="font-semibold text-error text-sm">Tổng thời gian vượt 4 giờ!</p>
                      <p className="text-sm text-error/80 mt-0.5">Ca dịch vụ đơn lẻ tối đa 4 giờ. Vui lòng bỏ bớt dịch vụ thêm hoặc chọn diện tích nhỏ hơn.</p>
                    </div>
                  </div>
                )}
              </section>

              {/* 1C. Dịch vụ thêm */}
              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                <SectionTitle icon="add_circle">Dịch vụ thêm (tùy chọn)</SectionTitle>

                {!isDeep && areaData && (
                  <p className="text-sm text-on-surface-variant mb-4 -mt-3 flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">info</span>
                    Thời lượng còn lại: <span className="font-bold text-primary ml-1">{MAX_HOURS - baseHours - extraHoursUsed}h</span> / tối đa {MAX_HOURS}h
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {EXTRA_SERVICES.map(service => {
                    const isSelected = extras.includes(service.id);
                    const wouldExceed = !isDeep && !isSelected && (extraHoursUsed + service.addHours > allowedExtraHours);
                    return (
                      <label key={service.id} className={`relative cursor-pointer ${wouldExceed ? 'opacity-40 cursor-not-allowed' : ''}`}>
                        <input type="checkbox" checked={isSelected} onChange={() => !wouldExceed && toggleExtra(service.id)} className="sr-only" />
                        <div className={`glass-card p-6 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-3 ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-outline-variant/50 bg-surface-container-lowest hover:border-primary/50'
                        }`}>
                          {isSelected && <SelectedCheck />}
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? 'bg-primary/10' : 'bg-surface-container'}`}>
                            <span className={`material-symbols-outlined text-[28px] ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>{service.icon}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-on-surface text-base">{service.title}</h4>
                            <p className="text-primary font-semibold text-base mt-1">+{fmt(service.price)}</p>
                            <p className="text-on-surface-variant text-sm mt-0.5">+{service.addHours} giờ</p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>

              {/* 1D. Thú cưng */}
              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                {/* FIX #5: heading ref */}
                <SectionTitle icon="pets" refProp={sectionRefs.pet}>Nhà bạn có nuôi thú cưng không?</SectionTitle>
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
                          isSelected ? 'border-primary bg-primary/5' : errors.pet ? 'border-error/40' : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/50'
                        }`}>
                        <span className={`material-symbols-outlined text-2xl ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>{opt.icon}</span>
                        <span className={`font-semibold text-base ${isSelected ? 'text-primary' : 'text-on-surface'}`}>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
                {hasPet && (
                  <p className="mt-3 text-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-base text-primary">info</span>
                    Nhân viên sẽ được thông báo trước. Bạn có thể ghi thêm ghi chú ở bước sau.
                  </p>
                )}
                <ErrorMsg message={errors.pet} />
              </section>

              {/* 1E. Nhân viên phụ trách */}
              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                <SectionTitle icon="badge">Nhân viên phụ trách</SectionTitle>

                <p className="text-sm text-on-surface-variant -mt-4 mb-5 flex items-start gap-2 p-3 bg-surface-container/50 rounded-xl border border-outline-variant/20">
                  <span className="material-symbols-outlined text-base text-primary shrink-0 mt-0.5">info</span>
                  <span>
                    Mặc định: đơn hàng sẽ được gửi đến tất cả nhân viên phù hợp —
                    <strong className="text-on-surface"> ai nhận trước, làm trước</strong>.
                    Bạn có thể bật các tùy chọn bên dưới để kiểm soát việc chọn nhân viên theo ý muốn.
                  </span>
                </p>

                <div className="space-y-3">
                  <ToggleRow
                    icon="favorite"
                    title="Ưu tiên nhân viên yêu thích"
                    description="Ưu tiên gửi lịch đến những nhân viên bạn đã đánh dấu yêu thích."
                    checked={staffFavorite}
                    onChange={() => setStaffFavorite(prev => !prev)}
                  />
                  {staffFavorite && (
                    <p className="flex items-center gap-1.5 text-sm text-on-surface-variant px-1">
                      <span className="material-symbols-outlined text-base text-primary">info</span>
                      Nếu không có nhân viên yêu thích nào rảnh, hệ thống sẽ tự động chọn người phù hợp nhất.
                    </p>
                  )}
                  <ToggleRow
                    icon="manage_accounts"
                    title="Bạn tự chọn nhân viên làm việc"
                    description="Xem danh sách và chọn nhân viên cụ thể bạn muốn đặt lịch."
                    checked={staffSelfPick}
                    onChange={() => setStaffSelfPick(prev => !prev)}
                    extraBadge={`+${fmt(SELF_PICK_FEE)}`}
                  />
                  {staffSelfPick && (
                    <p className="flex items-center gap-1.5 text-sm text-on-surface-variant px-1">
                      <span className="material-symbols-outlined text-base text-primary">info</span>
                      Phụ phí <strong className="text-on-surface">+{fmt(SELF_PICK_FEE)}</strong> sẽ được thêm vào đơn. Bạn sẽ chọn nhân viên ở bước xác nhận.
                    </p>
                  )}
                </div>
              </section>
            </div>

            <OrderSummary
              primaryLabel="Tiếp theo"
              onPrimary={() => { if (validateStep1()) setStep(2); }}
            />
          </div>
        </>
      )}

      {/* ══════════ STEP 2 ══════════ */}
      {step === 2 && (
        <>
          <div ref={headingRef} className="mb-12 scroll-mt-24">
            <h1 className="font-h2 text-h2 text-primary mb-1">Bước 2: Chọn lịch hẹn</h1>
            <StepIndicator />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            <div className="lg:col-span-8 space-y-6">

              {isSingle && (
                <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                  <SectionTitle icon="event_repeat">Tần suất dọn</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'once',     icon: 'event',          title: 'Một lần',    desc: 'Đặt lịch một lần duy nhất.',                    badge: null },
                      { id: 'weekly',   icon: 'update',         title: 'Hàng tuần',  desc: 'Tự động lặp lại mỗi tuần. Hủy bất kỳ lúc nào.', badge: 'Tiết kiệm 10%' },
                      { id: 'biweekly', icon: 'calendar_month', title: '2 tuần/lần', desc: 'Tự động lặp lại cách tuần.',                     badge: null },
                    ].map(item => {
                      const isSelected = repeatMode === item.id;
                      return (
                        <label key={item.id} className="relative cursor-pointer">
                          <input type="radio" name="repeatMode" checked={isSelected}
                            onChange={() => { setRepeatMode(item.id); setSelectedDayIdx(null); setSelectedTime(null); setCustomTimeValue(null); setShowCustomTime(false); setRecurringDay(''); setErrors({}); }}
                            className="peer sr-only" />
                          <div className={`glass-card p-5 rounded-xl border-2 transition-all h-full ${isSelected ? 'border-primary bg-primary/5' : 'border-outline-variant/30'}`}>
                            <div className="mb-3 w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                              <span className="material-symbols-outlined">{item.icon}</span>
                            </div>
                            <h4 className="font-bold text-on-surface text-base mb-1">{item.title}</h4>
                            <p className="text-on-surface-variant text-sm">{item.desc}</p>
                            {item.badge && (
                              <span className="inline-block mt-3 px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded text-sm font-bold">{item.badge}</span>
                            )}
                          </div>
                          {isSelected && <SelectedCheck />}
                        </label>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* FIX #4: Gói tháng — loại gói */}
              {isMonthly && (
                <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                  <SectionTitle icon="calendar_month">Loại gói</SectionTitle>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {MONTHLY_DURATION_OPTIONS.map(opt => {
                      const isSelected = monthlyDuration === opt.id;
                      return (
                        <label key={opt.id} className="relative cursor-pointer">
                          <input type="radio" checked={isSelected} onChange={() => setMonthlyDuration(opt.id)} className="sr-only" />
                          <div className={`p-4 rounded-xl border-2 transition-all text-center ${isSelected ? 'border-primary bg-primary/5' : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/50'}`}>
                            <p className="font-bold text-on-surface text-base">{opt.label}</p>
                            {opt.discount > 0
                              ? <p className="text-primary font-semibold text-sm mt-1">Giảm {opt.discount}%</p>
                              : <p className="text-on-surface-variant text-sm mt-1">Giá gốc</p>
                            }
                          </div>
                          {isSelected && <SelectedCheck />}
                        </label>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-base text-primary">info</span>
                    Gói càng dài, tiết kiệm càng nhiều. Hủy bất kỳ lúc nào trước khi gia hạn.
                  </p>
                </section>
              )}

              {/* FIX #4 & #5: monthly — ngày làm việc + heading ref */}
              {isMonthly && (
                <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                  {/* FIX #5: ref trỏ đến heading này */}
                  <SectionTitle icon="calendar_today" refProp={sectionRefs.date}>
                    Chọn ngày làm việc hằng tuần
                    <span className="ml-auto text-sm font-normal text-on-surface-variant">
                      {selectedWeekDays.length}/7 ngày
                    </span>
                  </SectionTitle>
                  <p className="text-sm text-on-surface-variant -mt-4 mb-5">
                    Chọn tối thiểu 1 ngày, tối đa 7 ngày mỗi tuần. Giá sẽ được tính theo số ngày chọn.
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {WEEK_DAY_OPTIONS.map(d => {
                      const isSelected = selectedWeekDays.includes(d.id);
                      const isDisabled = !isSelected && selectedWeekDays.length >= 7;
                      return (
                        <button key={d.id} disabled={isDisabled} onClick={() => toggleWeekDay(d.id)}
                          className={`relative w-14 h-14 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center justify-center gap-0.5 ${
                            isSelected
                              ? 'border-primary bg-primary text-on-primary'
                              : isDisabled
                              ? 'border-outline-variant/20 text-on-surface-variant/30 cursor-not-allowed bg-surface-container-lowest'
                              : errors.date
                              ? 'border-error/40 hover:border-error hover:text-error'
                              : 'border-outline-variant hover:border-primary hover:text-primary bg-surface-container-lowest'
                          }`}>
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                  <ErrorMsg message={errors.date} />

                  {/* FIX #5: time heading ref */}
                  <div className="mt-6 space-y-5" ref={sectionRefs.time}>
                    <p className="font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">schedule</span>
                      Khung giờ mỗi buổi
                    </p>
                    <TimeSlotPicker periods={['morning', 'afternoon', 'evening']} showCustom={true} />
                  </div>
                </section>
              )}

              {/* Ca lẻ — một lần */}
              {isSingle && repeatMode === 'once' && (
                <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                  {/* FIX #5: heading ref */}
                  <SectionTitle icon="calendar_today" refProp={sectionRefs.date}>Chọn ngày làm việc</SectionTitle>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {next7Days.map((d, idx) => {
                      const isSelected = selectedDayIdx === idx;
                      return (
                        <button key={idx} onClick={() => { setSelectedDayIdx(idx); setSelectedTime(null); setCustomTimeValue(null); setShowCustomTime(false); setErrors(p => ({...p, date: null})); }}
                          className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant/50 bg-surface-container-lowest hover:border-primary/60'
                          }`}>
                          <span className={`text-sm font-semibold ${isSelected ? 'text-on-primary' : 'text-on-surface-variant'}`}>{d.label}</span>
                          <span className={`text-2xl font-bold mt-0.5 ${isSelected ? 'text-on-primary' : 'text-on-surface'}`}>{d.dateNum}</span>
                        </button>
                      );
                    })}
                  </div>
                  <ErrorMsg message={errors.date} />

                  {selectedDayIdx === 0 && (
                    <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-error/5 border border-error/30">
                      <span className="material-symbols-outlined text-error mt-0.5 text-base">bolt</span>
                      <div>
                        <p className="font-semibold text-error text-sm">Đặt hôm nay — có thể tính phí gấp</p>
                        <p className="text-sm text-error/80 mt-0.5">
                          Khung giờ trong vòng 1 tiếng 30 phút tới sẽ tính thêm <span className="font-bold">+{fmt(URGENT_FEE)}</span> phí đặt gấp.
                          Các giờ đã qua hoặc chưa đủ 1 tiếng 30 phút sẽ bị khóa.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* FIX #5: time section heading ref */}
                  <div className="mt-6 space-y-5" ref={sectionRefs.time}>
                    <p className="font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">schedule</span>
                      Chọn khung giờ
                    </p>
                    <TimeSlotPicker periods={['morning', 'afternoon', 'evening']} showCustom={true} />
                  </div>
                </section>
              )}

              {/* Ca lẻ — lặp lại */}
              {isSingle && (repeatMode === 'weekly' || repeatMode === 'biweekly') && (
                <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                  {/* FIX #5: heading ref */}
                  <SectionTitle icon="calendar_month" refProp={sectionRefs.recurringDay}>Chọn ngày trong tuần</SectionTitle>
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
                  <ErrorMsg message={errors.recurringDay} />

                  {/* FIX #5: time heading ref */}
                  <div className="mt-6 space-y-4" ref={sectionRefs.time}>
                    <p className="font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">schedule</span>
                      Chọn khung giờ mỗi buổi
                    </p>
                    <TimeSlotPicker periods={['morning', 'afternoon', 'evening']} showCustom={true} />
                  </div>
                </section>
              )}

              {/* Deep — ngày làm việc */}
              {isDeep && (
                <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                  {/* FIX #5: heading ref */}
                  <SectionTitle icon="calendar_today" refProp={sectionRefs.date}>Chọn ngày làm việc</SectionTitle>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-tertiary-fixed/40 border border-tertiary-fixed mb-5 text-sm text-on-tertiary-fixed-variant">
                    <span className="material-symbols-outlined text-base mt-0.5">group</span>
                    <span>Dịch vụ chuyên sâu thường mất nửa ngày đến cả ngày. Chúng tôi sẽ xác nhận lại thời gian cụ thể sau khi đặt lịch.</span>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {next7Days.map((d, idx) => {
                      const isSelected = selectedDayIdx === idx;
                      return (
                        <button key={idx} onClick={() => { setSelectedDayIdx(idx); setSelectedTime(null); setCustomTimeValue(null); setShowCustomTime(false); setErrors(p => ({...p, date: null})); }}
                          className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant/50 bg-surface-container-lowest hover:border-primary/60'
                          }`}>
                          <span className={`text-sm font-semibold ${isSelected ? 'text-on-primary' : 'text-on-surface-variant'}`}>{d.label}</span>
                          <span className={`text-2xl font-bold mt-0.5 ${isSelected ? 'text-on-primary' : 'text-on-surface'}`}>{d.dateNum}</span>
                        </button>
                      );
                    })}
                  </div>
                  <ErrorMsg message={errors.date} />

                  {/* FIX #5: time heading ref */}
                  <div className="mt-6 space-y-5" ref={sectionRefs.time}>
                    <p className="font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">schedule</span>
                      Giờ bắt đầu mong muốn
                    </p>
                    <TimeSlotPicker periods={['morning', 'afternoon']} showCustom={true} />
                  </div>
                </section>
              )}
            </div>

            <OrderSummary
              primaryLabel="Tiếp theo"
              onPrimary={() => { if (validateStep2()) setStep(3); }}
              onBack={() => setStep(1)}
            />
          </div>
        </>
      )}

      {/* ══════════ STEP 3 ══════════ */}
      {step === 3 && (
        <>
          <div ref={headingRef} className="mb-12 scroll-mt-24">
            <h1 className="font-h2 text-h2 text-primary mb-1">Bước 3: Thông tin liên hệ</h1>
            <StepIndicator />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            <div className="lg:col-span-8 space-y-6">

              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                {/* FIX #5: heading ref cho "Thông tin liên hệ" */}
                <SectionTitle icon="person" refProp={sectionRefs.name}>Thông tin liên hệ</SectionTitle>
                <div className="flex gap-2 p-1 bg-surface-container rounded-xl mb-6 w-fit">
                  {[
                    { id: 'saved', icon: 'bookmark',   label: 'Thông tin đã lưu' },
                    { id: 'new',   icon: 'person_add', label: 'Nhập mới' },
                  ].map(tab => (
                    <button key={tab.id} onClick={() => { setContactMode(tab.id); setErrors({}); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        contactMode === tab.id ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                      }`}>
                      <span className="material-symbols-outlined text-base">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {contactMode === 'saved' && (
                  <div className="space-y-3">
                    {SAVED_CONTACTS.map(c => (
                      <label key={c.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedSavedContact === c.id ? 'border-primary bg-primary/5' : 'border-outline-variant/40 hover:border-outline-variant'
                        }`}>
                        <input type="radio" checked={selectedSavedContact === c.id} onChange={() => setSelectedSavedContact(c.id)} className="accent-primary w-4 h-4 shrink-0" />
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${selectedSavedContact === c.id ? 'bg-primary/10' : 'bg-surface-container'}`}>
                          <span className={`material-symbols-outlined text-xl ${selectedSavedContact === c.id ? 'text-primary' : 'text-on-surface-variant'}`}>person</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-on-surface">{c.name}</p>
                          <p className="text-sm text-on-surface-variant">{c.phone} · {c.email}</p>
                        </div>
                        {selectedSavedContact === c.id && (
                          <span className="material-symbols-outlined text-primary text-xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        )}
                      </label>
                    ))}
                  </div>
                )}

                {contactMode === 'new' && (
                  <div className="space-y-4">
                    {[
                      { key: 'name',  label: 'Họ và tên',     icon: 'person', placeholder: 'Nguyễn Văn A',      type: 'text',  required: true },
                      { key: 'phone', label: 'Số điện thoại', icon: 'phone',  placeholder: '0901 234 567',       type: 'tel',   required: true },
                      { key: 'email', label: 'Email',          icon: 'email',  placeholder: 'example@email.com', type: 'email', required: false },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-sm font-semibold text-on-surface mb-2">
                          {f.label}{f.required && <span className="text-error"> *</span>}
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl pointer-events-none">{f.icon}</span>
                          <input type={f.type} placeholder={f.placeholder} value={newContact[f.key]}
                            onChange={e => { setNewContact(p => ({...p, [f.key]: e.target.value})); if (errors[f.key]) setErrors(p => ({...p, [f.key]: null})); }}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-surface focus:outline-none transition-colors text-on-surface placeholder:text-on-surface-variant/50 ${
                              errors[f.key] ? 'border-error' : 'border-outline-variant focus:border-primary'
                            }`} />
                        </div>
                        <ErrorMsg message={errors[f.key]} />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                {/* FIX #5: heading ref cho "Địa chỉ vệ sinh" */}
                <SectionTitle icon="location_on" refProp={sectionRefs.street}>Địa chỉ vệ sinh</SectionTitle>
                <div className="flex gap-2 p-1 bg-surface-container rounded-xl mb-6 w-fit">
                  {[
                    { id: 'saved', icon: 'bookmark',         label: 'Địa chỉ đã lưu' },
                    { id: 'new',   icon: 'add_location_alt', label: 'Nhập địa chỉ mới' },
                  ].map(tab => (
                    <button key={tab.id} onClick={() => { setAddressMode(tab.id); setErrors(p => ({...p, street: null, district: null})); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        addressMode === tab.id ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                      }`}>
                      <span className="material-symbols-outlined text-base">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {addressMode === 'saved' && (
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
                          <span className="material-symbols-outlined text-primary text-xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        )}
                      </label>
                    ))}
                  </div>
                )}

                {addressMode === 'new' && (
                  <div className="space-y-4">
                    {[
                      { key: 'street',   label: 'Số nhà, tên đường', icon: 'signpost',      placeholder: '123 Nguyễn Huệ'          },
                      { key: 'district', label: 'Phường / Quận',      icon: 'location_city', placeholder: 'Phường Bến Nghé, Quận 1' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-sm font-semibold text-on-surface mb-2">{f.label} <span className="text-error">*</span></label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl pointer-events-none">{f.icon}</span>
                          <input type="text" placeholder={f.placeholder} value={newAddress[f.key]}
                            onChange={e => { setNewAddress(p => ({...p, [f.key]: e.target.value})); if (errors[f.key]) setErrors(p => ({...p, [f.key]: null})); }}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-surface focus:outline-none transition-colors text-on-surface placeholder:text-on-surface-variant/50 ${
                              errors[f.key] ? 'border-error' : 'border-outline-variant focus:border-primary'
                            }`} />
                        </div>
                        <ErrorMsg message={errors[f.key]} />
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-2">Ghi chú thêm <span className="text-on-surface-variant font-normal">(tùy chọn)</span></label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-3.5 text-on-surface-variant text-xl">notes</span>
                        <textarea rows={3} placeholder="Tầng 5, toà nhà ABC, gọi trước 10 phút..."
                          value={newAddress.note} onChange={e => setNewAddress(p => ({...p, note: e.target.value}))}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-outline-variant bg-surface focus:border-primary focus:outline-none transition-colors text-on-surface placeholder:text-on-surface-variant/50 resize-none" />
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                <SectionTitle icon="edit_note">Ghi chú cho nhân viên</SectionTitle>
                <div className="relative">
                  <textarea rows={4}
                    placeholder={`VD: Nhà có chó, cần gọi trước khi đến.\nTập trung vệ sinh phòng bếp và phòng tắm...${hasPet ? '\n⚠️ Nhà có nuôi thú cưng.' : ''}`}
                    value={staffNote} onChange={e => setStaffNote(e.target.value)} maxLength={300}
                    className="w-full px-4 py-4 rounded-xl border-2 border-outline-variant/30 bg-surface focus:border-primary focus:outline-none transition-colors text-on-surface placeholder:text-on-surface-variant/40 resize-none" />
                  <div className="absolute bottom-3 right-4 text-xs text-on-surface-variant/50">{staffNote.length}/300</div>
                </div>
              </section>
            </div>

            <OrderSummary
              primaryLabel="Tiếp theo"
              onPrimary={() => { if (validateStep3()) setStep(4); }}
              onBack={() => setStep(2)}
            />
          </div>
        </>
      )}

      {/* ══════════ STEP 4 ══════════ */}
      {step === 4 && (
        <>
          <div ref={headingRef} className="mb-12 scroll-mt-24">
            <h1 className="font-h2 text-h2 text-primary mb-1">Bước 4: Thanh toán</h1>
            <StepIndicator />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            <div className="lg:col-span-8 space-y-6">

              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                <SectionTitle icon="payments">Phương thức thanh toán</SectionTitle>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {PAYMENT_METHODS.map(method => {
                    const isSelected = paymentMethod === method.id;
                    return (
                      <label key={method.id} className="relative cursor-pointer">
                        <input type="radio" checked={isSelected} onChange={() => setPaymentMethod(method.id)} className="peer sr-only" />
                        <div className={`h-full bg-surface-container-lowest border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-outline-variant/50 hover:border-primary/50'
                        }`}>
                          {isSelected && <SelectedCheck />}
                          <span className="material-symbols-outlined text-[32px] text-primary">{method.icon}</span>
                          <span className="text-center font-semibold text-on-surface">{method.label}</span>
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
                    <p className="text-sm text-on-surface-variant">
                      Số dư ví: <span className="font-semibold text-primary">{fmt(walletBalance)}</span>. Chỉ dùng thanh toán dịch vụ CleanTrust.
                    </p>
                  </div>
                )}
              </section>

              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                <SectionTitle icon="redeem">Mã khuyến mãi</SectionTitle>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl pointer-events-none">confirmation_number</span>
                    <input type="text" placeholder="Nhập mã ưu đãi (VD: CLEANTRUST10)"
                      value={promoCode}
                      onChange={e => { setPromoCode(e.target.value); setErrors(p => ({...p, promo: null})); setPromoApplied(false); setPromoDiscount(0); }}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-surface focus:outline-none transition-colors text-on-surface placeholder:text-on-surface-variant/50 ${
                        errors.promo ? 'border-error' : promoApplied ? 'border-primary' : 'border-outline-variant focus:border-primary'
                      }`} />
                  </div>
                  <button onClick={applyPromo}
                    className="px-6 py-3 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary-container transition-colors whitespace-nowrap">
                    Áp dụng
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-sm text-primary mt-2 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    Áp dụng thành công! Giảm {fmt(promoDiscount)}
                  </p>
                )}
                <ErrorMsg message={errors.promo} />
              </section>
            </div>

            <OrderSummary
              primaryLabel="Tiếp theo"
              onPrimary={() => setStep(5)}
              onBack={() => setStep(3)}
            />
          </div>
        </>
      )}

      {/* ══════════ STEP 5 ══════════ */}
      {step === 5 && (
        <>
          <div ref={headingRef} className="mb-12 scroll-mt-24">
            <h1 className="font-h2 text-h2 text-primary mb-1">Bước 5: Xác nhận đặt lịch</h1>
            <StepIndicator />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            <div className="lg:col-span-8 space-y-6">

              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                <SectionTitle icon="receipt_long">Xác nhận thông tin đặt lịch</SectionTitle>
                <div className="space-y-4">

                  {/* Dịch vụ */}
                  <div className="flex gap-4 items-start p-4 bg-surface rounded-xl border border-outline-variant/20">
                    <span className="material-symbols-outlined text-primary text-2xl mt-0.5">cleaning_services</span>
                    <div className="flex-1 space-y-2">
                      <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wide">Dịch vụ</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-on-surface-variant">Loại dịch vụ</span>
                        <span className="font-bold text-on-surface">{pkgData.title}</span>
                      </div>
                      {areaData && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-on-surface-variant">Diện tích</span>
                          <span className="font-semibold text-on-surface">{areaData.label}</span>
                        </div>
                      )}
                      {areaData && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-on-surface-variant">Thời lượng</span>
                          <span className="font-semibold text-on-surface">
                            {baseHours} giờ{isDeep && areaData.staffCount > 1 ? ` × ${areaData.staffCount} nhân viên` : ''}
                          </span>
                        </div>
                      )}
                      {extras.length > 0 && (
                        <div className="flex justify-between items-start pt-1 border-t border-outline-variant/10">
                          <span className="text-sm text-on-surface-variant">Dịch vụ thêm</span>
                          <span className="font-semibold text-on-surface text-right ml-4">
                            {extras.map(id => EXTRA_SERVICES.find(s => s.id === id)?.title).join(', ')}
                          </span>
                        </div>
                      )}
                      {hasPet && (
                        <div className="flex items-center gap-1.5 pt-1 border-t border-outline-variant/10">
                          <span className="material-symbols-outlined text-base text-on-surface-variant">pets</span>
                          <span className="text-sm text-on-surface-variant">Nhà có nuôi thú cưng</span>
                        </div>
                      )}
                      {isMonthly && totalSessions && (
                        <div className="flex justify-between items-center pt-1 border-t border-outline-variant/10">
                          <span className="text-sm text-on-surface-variant">Tổng số buổi</span>
                          <span className="font-semibold text-primary">~{totalSessions} buổi / {monthlyDurationData?.label}</span>
                        </div>
                      )}
                      <button
                        onClick={() => setShowStep5Tasks(true)}
                        className="mt-1 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">checklist</span>
                        Xem công việc bao gồm
                      </button>
                    </div>
                  </div>

                  {/* Lịch hẹn */}
                  <div className="flex gap-4 items-start p-4 bg-surface rounded-xl border border-outline-variant/20">
                    <span className="material-symbols-outlined text-primary text-2xl mt-0.5">calendar_month</span>
                    <div className="flex-1 space-y-2">
                      <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wide">Lịch hẹn</p>
                      {isSingle && repeatMode === 'once' && selectedDayObj && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">Ngày làm việc</span>
                            <span className="font-bold text-on-surface">{selectedDayObj.label} {selectedDayObj.dateNum}/{selectedDayObj.month + 1}/{selectedDayObj.year}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">Giờ bắt đầu</span>
                            <span className="font-semibold text-on-surface">{effectiveTime}</span>
                          </div>
                        </>
                      )}
                      {isSingle && repeatMode !== 'once' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">Tần suất</span>
                            <span className="font-bold text-on-surface">{repeatMode === 'weekly' ? 'Mỗi tuần' : 'Cách tuần'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">Ngày trong tuần</span>
                            <span className="font-semibold text-on-surface">{WEEK_DAY_OPTIONS.find(d => d.id === recurringDay)?.full}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">Giờ bắt đầu</span>
                            <span className="font-semibold text-on-surface">{effectiveTime}</span>
                          </div>
                        </>
                      )}
                      {isMonthly && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">Gói đăng ký</span>
                            <span className="font-bold text-on-surface">{monthlyDurationData?.label}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">Số ngày / tuần</span>
                            <span className="font-semibold text-on-surface">{selectedWeekDays.length} ngày</span>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-sm text-on-surface-variant">Các ngày</span>
                            <span className="font-semibold text-on-surface text-right ml-4">
                              {selectedWeekDays.map(id => WEEK_DAY_OPTIONS.find(d => d.id === id)?.full).join(', ')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">Giờ bắt đầu</span>
                            <span className="font-semibold text-on-surface">{effectiveTime}</span>
                          </div>
                          {totalSessions && (
                            <div className="flex justify-between">
                              <span className="text-sm text-on-surface-variant">Tổng số buổi</span>
                              <span className="font-bold text-primary">~{totalSessions} buổi</span>
                            </div>
                          )}
                        </>
                      )}
                      {isDeep && selectedDayObj && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">Ngày làm việc</span>
                            <span className="font-bold text-on-surface">{selectedDayObj.label} {selectedDayObj.dateNum}/{selectedDayObj.month + 1}/{selectedDayObj.year}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">Giờ bắt đầu</span>
                            <span className="font-semibold text-on-surface">{effectiveTime}</span>
                          </div>
                        </>
                      )}
                      {isUrgent && (
                        <div className="flex items-center gap-1 text-sm text-error font-medium pt-1 border-t border-outline-variant/10">
                          <span className="material-symbols-outlined text-base">bolt</span>
                          Đặt gấp — phụ phí {fmt(urgentFee)}
                        </div>
                      )}
                      <div className="flex justify-between pt-1 border-t border-outline-variant/10">
                        <span className="text-sm text-on-surface-variant">Nhân viên</span>
                        <span className="font-semibold text-on-surface text-right ml-4">
                          {staffFavorite && staffSelfPick ? 'Ưu tiên NV yêu thích + Tự chọn' :
                           staffFavorite ? 'Ưu tiên NV yêu thích' :
                           staffSelfPick ? 'Tự chọn nhân viên' : 'Ai nhận trước, làm trước'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Địa chỉ */}
                  <div className="flex gap-4 items-start p-4 bg-surface rounded-xl border border-outline-variant/20">
                    <span className="material-symbols-outlined text-primary text-2xl mt-0.5">location_on</span>
                    <div className="flex-1 space-y-2">
                      <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wide">Địa chỉ</p>
                      {addressMode === 'saved' ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">Tên địa chỉ</span>
                            <span className="font-bold text-on-surface">{SAVED_ADDRESSES[selectedSavedAddress].label}</span>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-sm text-on-surface-variant shrink-0">Địa chỉ cụ thể</span>
                            <span className="text-sm text-on-surface text-right ml-4">{SAVED_ADDRESSES[selectedSavedAddress].address}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">Số nhà, đường</span>
                            <span className="font-bold text-on-surface">{newAddress.street}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">Phường / Quận</span>
                            <span className="font-semibold text-on-surface">{newAddress.district}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {staffNote && (
                    <div className="flex gap-4 items-start p-4 bg-surface rounded-xl border border-outline-variant/20">
                      <span className="material-symbols-outlined text-primary text-2xl mt-0.5">edit_note</span>
                      <div className="flex-1">
                        <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wide mb-2">Ghi chú cho nhân viên</p>
                        <p className="text-sm text-on-surface whitespace-pre-line">{staffNote}</p>
                      </div>
                    </div>
                  )}

                  {/* Chi phí — FIX #4: tính đúng cho gói tháng */}
                  <div className="flex gap-4 items-start p-4 bg-surface rounded-xl border border-outline-variant/20">
                    <span className="material-symbols-outlined text-primary text-2xl mt-0.5">receipt_long</span>
                    <div className="flex-1">
                      <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wide mb-3">Chi phí</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-on-surface-variant">
                          <span>{pkgData.title}</span>
                          <span>{fmt(areaData ? areaData.price : pkgData.price)}/buổi</span>
                        </div>
                        {isMonthly && selectedWeekDays.length > 0 && (
                          <>
                            <div className="flex justify-between text-on-surface-variant">
                              <span>× ~{monthlySessionsPerMonth} buổi/tháng ({selectedWeekDays.length} ngày × 4.33 tuần)</span>
                              <span>{fmt((areaData ? areaData.price : pkgData.price) * monthlySessionsPerMonth)}/tháng</span>
                            </div>
                            <div className="flex justify-between text-on-surface-variant">
                              <span>× {monthlyDurationData?.months} tháng</span>
                              <span>{fmt(monthlyRawTotal)}</span>
                            </div>
                          </>
                        )}
                        {isMonthly && totalSessions && (
                          <div className="flex justify-between text-on-surface-variant">
                            <span>Tổng số buổi ({monthlyDurationData?.label})</span>
                            <span className="font-medium text-on-surface">~{totalSessions} buổi</span>
                          </div>
                        )}
                        {isMonthly && monthlyDurationData && monthlyDurationData.discount > 0 && (
                          <div className="flex justify-between text-primary font-medium">
                            <span>Ưu đãi gói {monthlyDurationData.label}</span>
                            <span>-{monthlyDurationData.discount}% (-{fmt(monthlyDiscount)})</span>
                          </div>
                        )}
                        {extras.map(id => {
                          const e = EXTRA_SERVICES.find(s => s.id === id);
                          return (
                            <div key={id} className="flex justify-between text-on-surface-variant">
                              <span>{e.title} (dịch vụ thêm)</span>
                              <span>+{fmt(e.price)}</span>
                            </div>
                          );
                        })}
                        {staffSelfPick && (
                          <div className="flex justify-between text-on-surface-variant">
                            <span>Phí tự chọn nhân viên</span>
                            <span>+{fmt(selfPickFee)}</span>
                          </div>
                        )}
                        {isUrgent && (
                          <div className="flex justify-between text-error font-medium">
                            <span>Phí đặt gấp</span>
                            <span>+{fmt(urgentFee)}</span>
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
                  </div>

                  <div className="flex gap-3 p-4 bg-surface-container/30 rounded-xl text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-base flex-shrink-0 mt-0.5">verified_user</span>
                    <span>Miễn phí hủy trước 24 giờ. Bảo hiểm thiệt hại 100% do lỗi nhân viên.</span>
                  </div>
                </div>
              </section>
            </div>

            <OrderSummary
              primaryLabel="Xác nhận đặt lịch"
              onPrimary={() => setStep(6)}
              onBack={() => setStep(4)}
              confirmMode={true}
            />
          </div>
        </>
      )}

      {/* ══════════ STEP 6 ══════════ */}
      {step === 6 && (
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
              {isMonthly && totalSessions && (
                <div className="flex justify-between text-on-surface-variant text-sm">
                  <span>Tổng số buổi</span>
                  <span className="font-semibold text-on-surface">~{totalSessions} buổi</span>
                </div>
              )}
              <div className="flex justify-between text-on-surface-variant text-sm">
                <span>Tổng tiền</span>
                <span className="font-bold text-primary">{fmt(total)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Link to="/" className="px-8 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary-container transition-all">
              Về trang chủ
            </Link>
            <button onClick={() => {
              setStep(1); setSelectedPackage('basic-single');
              setSelectedArea(null); setExtras([]); setHasPet(null);
              setStaffFavorite(false); setStaffSelfPick(false);
              setRepeatMode('once'); setSelectedDayIdx(null); setSelectedTime(null);
              setMonthlyDuration('1'); setSelectedWeekDays([]);
              setCustomTimeValue(null); setShowCustomTime(false); setRecurringDay('');
              setContactMode('saved'); setSelectedSavedContact(0);
              setNewContact({ name: '', phone: '', email: '' });
              setAddressMode('saved'); setSelectedSavedAddress(0);
              setNewAddress({ street: '', district: '', note: '' });
              setStaffNote(''); setPaymentMethod('cash');
              setPromoCode(''); setPromoApplied(false); setPromoDiscount(0); setErrors({});
              setShowStep5Tasks(false);
            }}
              className="px-8 py-3 border-2 border-outline-variant rounded-xl font-semibold hover:bg-surface-container transition-all">
              Đặt lịch mới
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default BookingPage;