import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import publicApi from "../../api/publicApi";
import khachHangApi from "../../api/khachHangApi";
import nhanVienApi from "../../api/nhanVienApi";

// ─── Constants ───────────────────────────────────────────────────────────────

const SHIFT_247_OPTIONS = [
  {
    id: "shift-day",
    label: "Ca ngày",
    hours: "06:00 – 18:00",
    icon: "light_mode",
    desc: "12 giờ ban ngày",
  },
  {
    id: "shift-night",
    label: "Ca đêm",
    hours: "18:00 – 06:00",
    icon: "dark_mode",
    desc: "12 giờ ban đêm",
  },
  {
    id: "shift-full",
    label: "Cả ngày lẫn đêm",
    hours: "24 giờ",
    icon: "bedtime",
    desc: "24 giờ liên tục",
  },
];

// ✅ MỚI: map icon theo id dịch vụ thật trong DB (đồng bộ với ServicesPage.jsx)
const SERVICE_ICONS_MAP = {
  1: "cleaning_services",
  2: "calendar_month",
  3: "cleaning",
  4: "elderly",
  5: "baby_changing_station",
  6: "medical_services",
  7: "construction",
  8: "ac_unit",
  9: "chair",
  10: "bed",
  11: "soup_kitchen",
  12: "layers",
  13: "corporate_fare",
};

const TIME_SLOTS = {
  morning: ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00"],
  afternoon: ["13:00", "14:00", "15:00", "16:00", "17:00"],
  evening: ["18:00", "19:00", "20:00", "21:00"],
};

const URGENT_THRESHOLD_HOURS = 1.5;

const MAX_HOURS_NORMAL = 4;
const MAX_HOURS_DEEP = 8;

const SERVICE_START_HOUR = 6;
const SERVICE_END_HOUR = 23;

const WEEK_DAY_OPTIONS = [
  { id: "mon", label: "T2", full: "Thứ Hai" },
  { id: "tue", label: "T3", full: "Thứ Ba" },
  { id: "wed", label: "T4", full: "Thứ Tư" },
  { id: "thu", label: "T5", full: "Thứ Năm" },
  { id: "fri", label: "T6", full: "Thứ Sáu" },
  { id: "sat", label: "T7", full: "Thứ Bảy" },
  { id: "sun", label: "CN", full: "Chủ Nhật" },
];

const MONTHLY_DURATION_OPTIONS = [
  { id: "1", label: "1 tháng", months: 1, discount: 0 },
  { id: "2", label: "2 tháng", months: 2, discount: 5 },
  { id: "3", label: "3 tháng", months: 3, discount: 10 },
  { id: "6", label: "6 tháng", months: 6, discount: 20 },
];

const DURATION_247_OPTIONS = [
  { id: "7", label: "7 ngày", days: 7, discount: 0 },
  { id: "14", label: "14 ngày", days: 14, discount: 5 },
  { id: "30", label: "1 tháng", days: 30, discount: 10 },
  { id: "90", label: "3 tháng", days: 90, discount: 20 },
];

const PAYMENT_METHODS = [
  { id: "cash", icon: "payments", label: "Tiền mặt" },
  {
    id: "cleantrust",
    icon: "account_balance_wallet",
    label: "Ví CleanTrust",
    badge: "Hoàn tiền TĐ",
  },
  { id: "card", icon: "credit_card", label: "Visa / Mastercard" },
  { id: "ewallet", icon: "smartphone", label: "MoMo / ZaloPay" },
];

const REPLACEMENT_OPTIONS = [
  {
    id: "favorite",
    label: "Tìm nhân viên yêu thích thay thế",
    desc: "Ưu tiên tìm nhân viên bạn đã đánh dấu yêu thích.",
  },
  {
    id: "standard",
    label: "Tìm nhân viên tiêu chuẩn thay thế",
    desc: "Phân bổ nhân viên khác phù hợp nhất.",
  },
  {
    id: "none",
    label: "Không tìm thay thế – Hủy ca nếu không xác nhận",
    desc: "Ca sẽ tự động bị hủy nếu nhân viên không xác nhận trong 24h.",
    isDestructive: true,
  },
];

const REPLACEMENT_OPTION_TO_ENUM = {
  favorite: "TimNhanVienYeuThich",
  standard: "TimNhanVienTieuChuan",
  none: "KhongTimThayThe",
};

const PAYMENT_METHOD_TO_ENUM = {
  cash: "TienMat",
  cleantrust: "ViTien",
  card: "Online",
  ewallet: "Online",
};

// ✅ MỚI: map shift247 (FE id) -> enum ca_lam_247 thật trong DB
const SHIFT_247_TO_ENUM = {
  "shift-day": "Ngay",
  "shift-night": "Dem",
  "shift-full": "CaNgay",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => Math.round(Number(n)).toLocaleString("vi-VN") + "đ";

// ✅ MỚI: Logic tag loại gói — copy nguyên từ ServicesPage.jsx để đồng bộ 100%
const getPackageTagInfo = (pkg) => {
  const packageNames =
    pkg.loai_goi?.map((lg) => lg.loai_goi?.ten_loai_goi).filter(Boolean) || [];
  const count = packageNames.length;

  if (count >= 3) {
    return {
      text: "Tùy chọn linh hoạt",
      style: "bg-red-500/10 text-red-600 border border-red-500/20",
    };
  }
  if (count === 2) {
    return {
      text: packageNames.join(" / "),
      style: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
    };
  }
  if (count === 1) {
    return {
      text: packageNames[0],
      style: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
    };
  }
  return {
    text: "Cố định",
    style:
      "bg-surface-container text-on-surface-variant border border-outline-variant/30",
  };
};

// ✅ MỚI: parse noi_dung_chi_tiet (string hoặc object) -> chỉ lấy mảng tasks
const getServiceTasks = (pkg) => {
  if (!pkg?.noi_dung_chi_tiet) return [];
  try {
    const parsed =
      typeof pkg.noi_dung_chi_tiet === "string"
        ? JSON.parse(pkg.noi_dung_chi_tiet)
        : pkg.noi_dung_chi_tiet;
    return Array.isArray(parsed?.tasks) ? parsed.tasks : [];
  } catch (e) {
    return [];
  }
};

// ✅ MỚI: dịch vụ có biến thể (co_bien_the=1) -> dùng tuy_chon_bien_the
//         dịch vụ không có biến thể -> 1 "option" ảo dựng từ don_gia_co_ban/thoi_gian_chuan_co_ban
const getAreaOptionsFromApi = (pkg) => {
  if (!pkg) return [];
  if (
    pkg.co_bien_the &&
    Array.isArray(pkg.tuy_chon_bien_the) &&
    pkg.tuy_chon_bien_the.length > 0
  ) {
    return pkg.tuy_chon_bien_the.map((opt) => ({
      id: `variant-${opt.id}`,
      label: opt.ten_tuy_chon,
      sub: opt.don_vi_tinh,
      baseHours: opt.thoi_gian_chuan / 60,
      price: Number(opt.don_gia),
    }));
  }
  return [];
};

// ✅ MỚI: dịch vụ thêm thật từ API (dich_vu_them quan hệ pivot dichvu_dichvuthem)
const getExtraServicesFromApi = (pkg) => {
  if (!pkg?.dich_vu_them || !Array.isArray(pkg.dich_vu_them)) return [];
  return pkg.dich_vu_them.map((item) => ({
    id: `extra-${item.id}`,
    masterId: item.dich_vu_them?.id ?? null,
    title: item.dich_vu_them?.ten_dv_them || "",
    icon: item.dich_vu_them?.icon || "add_circle",
    price: Number(item.gia_cong_them),
    addHours: item.thoi_gian_cong / 60,
  }));
};

// Lấy danh sách loaiGoi từ service API
const getLoaiGoiList = (pkg) => {
  if (!pkg?.loai_goi || !Array.isArray(pkg.loai_goi)) return [];
  return pkg.loai_goi
    .filter((lg) => lg.loai_goi && lg.trang_thai !== false)
    .map((lg) => ({
      pivotId: lg.id,
      id: lg.loai_goi_id || lg.loai_goi?.id,
      name: lg.loai_goi?.ten_loai_goi || "",
    }));
};

const getFrequencyOptionsFromApi = (loaiGoiList) => {
  return loaiGoiList.map((lg) => {
    const name = lg.name;
    if (name === "24/7 Thường trực") {
      return {
        id: "247",
        icon: "bedtime",
        label: "24/7 Thường trực",
        sublabel: "Chăm sóc liên tục",
        desc: "Nhân viên túc trực tại nhà 24 giờ, 7 ngày/tuần. Phù hợp người cần chăm sóc toàn thời gian.",
        resolvedType: "247",
        badge: "Toàn thời gian",
      };
    }
    if (name === "Gói tháng") {
      return {
        id: "monthly",
        icon: "calendar_month",
        label: "Gói tháng",
        sublabel: "Tiết kiệm hơn",
        desc: "Đăng ký lịch cố định hàng tuần trong 1–6 tháng. Tiết kiệm lên đến 20%.",
        resolvedType: "monthly",
        badge: "Tiết kiệm 20%",
      };
    }
    // Ca lẻ (default)
    return {
      id: "single",
      icon: "today",
      label: "Ca lẻ",
      sublabel: "Đặt từng buổi",
      desc: "Đặt lịch linh hoạt theo từng buổi, không cam kết dài hạn.",
      resolvedType: "single",
      badge: null,
    };
  });
};

// ✅ FIX 1: Helper sắp xếp mảng weekDay IDs theo thứ tự T2 → CN
const sortWeekDays = (ids) => {
  const order = WEEK_DAY_OPTIONS.map((o) => o.id);
  return [...ids].sort((a, b) => order.indexOf(a) - order.indexOf(b));
};

const getNext7Days = (startOffset = 0, includeLabels = true) => {
  const days = [];
  const today = new Date();
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + startOffset + i);
    days.push({
      label: includeLabels
        ? i === 0 && startOffset === 0
          ? "Hôm nay"
          : dayNames[d.getDay()]
        : "",
      dateNum: d.getDate(),
      month: d.getMonth(),
      year: d.getFullYear(),
      isToday: i === 0 && startOffset === 0,
      dateObj: d,
    });
  }
  return days;
};

const checkServiceHours = (h, m, durationHours = 0) => {
  const totalMin = h * 60 + m;
  const startMin = SERVICE_START_HOUR * 60;
  const endMin = SERVICE_END_HOUR * 60;
  if (totalMin < startMin)
    return { outsideHours: true, tooEarly: true, tooLate: false };
  if (totalMin >= endMin)
    return { outsideHours: true, tooEarly: false, tooLate: true };
  if (totalMin + durationHours * 60 > endMin)
    return {
      outsideHours: true,
      tooEarly: false,
      tooLate: false,
      exceedEnd: true,
    };
  return { outsideHours: false, tooEarly: false, tooLate: false };
};

const getEarliestBookableTime = () => {
  const now = new Date();
  const earliest = new Date(now.getTime() + URGENT_THRESHOLD_HOURS * 3600000);
  earliest.setSeconds(0, 0);
  const todayStart = new Date(now);
  todayStart.setHours(SERVICE_START_HOUR, 0, 0, 0);
  const result = earliest < todayStart ? todayStart : earliest;
  const todayEnd = new Date(now);
  todayEnd.setHours(SERVICE_END_HOUR, 0, 0, 0);
  if (result >= todayEnd) return null;
  return result;
};

const formatTimeHM = (date) => {
  if (!date) return "";
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

const isSlotDisabled = (dayObj, timeStr, durationHours = 0, staffSchedule = null) => {
  if (!dayObj || !timeStr) return false;
  const [h, m] = timeStr.split(":").map(Number);
  const { outsideHours } = checkServiceHours(h, m, durationHours);
  if (outsideHours) return true;
  if (dayObj.isToday) {
    const earliest = getEarliestBookableTime();
    if (!earliest) return true;
    const slotTime = new Date();
    slotTime.setHours(h, m, 0, 0);
    if (slotTime < earliest) return true;
  }

  // Check against busyJobs
  if (staffSchedule && staffSchedule.busyJobs && staffSchedule.busyJobs.length > 0) {
    const slotStartMin = h * 60 + m;
    const slotEndMin = slotStartMin + durationHours * 60;
    
    // Convert dayObj to string YYYY-MM-DD
    const dStr = `${dayObj.year}-${String(dayObj.month + 1).padStart(2, '0')}-${String(dayObj.dateNum).padStart(2, '0')}`;
    
    const isOverlapping = staffSchedule.busyJobs.some(job => {
      if (job.ngay_lam !== dStr) return false;
      if (!job.gio_bat_dau) return false;
      const [jh, jm] = job.gio_bat_dau.split(':').map(Number);
      const jobStartMin = jh * 60 + jm;
      const jobEndMin = jobStartMin + (job.thoi_gian_lam_phut || 0);
      
      // Overlap condition: (StartA < EndB) and (EndA > StartB)
      return (slotStartMin < jobEndMin) && (slotEndMin > jobStartMin);
    });
    
    if (isOverlapping) return true;
  }

  return false;
};

const isUrgentSlot = (dayObj, timeStr, durationHours = 0) => {
  if (!dayObj || !timeStr || !dayObj.isToday) return false;
  const [h, m] = timeStr.split(":").map(Number);
  const { outsideHours } = checkServiceHours(h, m, durationHours);
  if (outsideHours) return false;
  const earliest = getEarliestBookableTime();
  if (!earliest) return false;
  const slotTime = new Date();
  slotTime.setHours(h, m, 0, 0);
  return slotTime >= earliest;
};

// Hàm không còn dùng tới, đã xóa calcMonthlySessions để tránh fix cứng số buổi

const generateMonthlyDates = (months, weekDaysList) => {
  if (!months || !weekDaysList || weekDaysList.length === 0) return [];
  const start = new Date();
  start.setDate(start.getDate() + 3);
  start.setHours(0, 0, 0, 0);

  // Tính đúng theo Lịch Dương (Calendar Month). Máy tính tự động xử lý năm nhuận, tháng 28/29/30/31 ngày.
  const end = new Date(start);
  end.setMonth(end.getMonth() + parseInt(months, 10));
  end.setDate(end.getDate() - 1);
  end.setHours(23, 59, 59, 999);

  const dates = [];
  const dayMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  const targetDays = weekDaysList.map((d) => dayMap[d]);

  const curr = new Date(start);
  while (curr <= end) {
    if (targetDays.includes(curr.getDay())) {
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, "0");
      const d = String(curr.getDate()).padStart(2, "0");
      dates.push(`${y}-${m}-${d}`);
    }
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ErrorMsg = ({ message }) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-1.5 mt-2 text-error text-sm font-medium">
      <span
        className="material-symbols-outlined text-base"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        error
      </span>
      {message}
    </div>
  );
};

const SectionTitle = ({ icon, children, refProp }) => (
  <h3
    ref={refProp}
    className="font-h3 text-h3 mb-6 text-on-surface flex items-center gap-2 scroll-mt-28"
  >
    <span className="material-symbols-outlined text-primary">{icon}</span>
    {children}
  </h3>
);

const SelectedCheck = () => (
  <div className="absolute top-3 right-3 text-primary">
    <span
      className="material-symbols-outlined text-xl"
      style={{ fontVariationSettings: "'FILL' 1" }}
    >
      check_circle
    </span>
  </div>
);

const ToggleRow = ({
  icon,
  title,
  description,
  checked,
  onChange,
  extraBadge,
}) => (
  <div className="flex items-center justify-between gap-4 p-5 rounded-xl border-2 border-outline-variant/30 bg-surface-container-lowest">
    <div className="flex items-center gap-4">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${checked ? "bg-primary/10" : "bg-surface-container"}`}
      >
        <span
          className={`material-symbols-outlined transition-all ${checked ? "text-primary" : "text-on-surface-variant"}`}
        >
          {icon}
        </span>
      </div>
      <div>
        <p className="font-bold text-on-surface text-base flex items-center gap-2">
          {title}
          {extraBadge && (
            <span className="text-xs font-bold px-2 py-0.5 bg-error/10 text-error rounded-full">
              {extraBadge}
            </span>
          )}
        </p>
        <p className="text-sm text-on-surface-variant mt-0.5">{description}</p>
      </div>
    </div>
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${checked ? "bg-primary" : "bg-outline-variant"}`}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ${checked ? "translate-x-7" : "translate-x-0"}`}
      />
    </button>
  </div>
);

// ─── CustomTimePicker ────────────────────────────────────────────────────────

const CustomTimePicker = ({
  value,
  onChange,
  dayObj,
  onSelectEarliest,
  tick,
  totalHours,
  staffSchedule,
}) => {
  const [displayHour, setDisplayHour] = useState("08");
  const [displayMinute, setDisplayMinute] = useState("00");
  const [customError, setCustomError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const lastEmittedRef = useRef(null);
  const initializedRef = useRef(false);

  const displayHourRef = useRef("08");
  const displayMinuteRef = useRef("00");

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      if (value && typeof value === "string") {
        const [h, m] = value.split(":");
        setDisplayHour(h || "08");
        setDisplayMinute(m || "00");
        displayHourRef.current = h;
        displayMinuteRef.current = m;
        _checkAndEmit(h || "08", m || "00");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      value &&
      typeof value === "string" &&
      value !== lastEmittedRef.current
    ) {
      const [h, m] = value.split(":");
      setDisplayHour(h || "08");
      setDisplayMinute(m || "00");
      displayHourRef.current = h;
      displayMinuteRef.current = m;
      setCustomError(null);
      setErrorType(null);
      lastEmittedRef.current = value;
    }
  }, [value]);

  useEffect(() => {
    _checkAndEmit(displayHourRef.current, displayMinuteRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0"),
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0"),
  );

  const _checkAndEmit = (h, m) => {
    const hNum = parseInt(h, 10);
    const mNum = parseInt(m, 10);

    const { outsideHours, tooEarly, tooLate, exceedEnd } = checkServiceHours(
      hNum,
      mNum,
      totalHours,
    );
    if (outsideHours) {
      let msg = "";
      if (tooEarly) {
        msg = `Giờ ${h}:${m} quá sớm. Dịch vụ hoạt động từ ${SERVICE_START_HOUR}:00 đến ${SERVICE_END_HOUR}:00 mỗi ngày.`;
      } else if (tooLate) {
        msg = `Giờ ${h}:${m} quá muộn. Dịch vụ chỉ nhận đặt lịch bắt đầu trước ${SERVICE_END_HOUR}:00.`;
      } else if (exceedEnd) {
        msg = `Giờ kết thúc dự kiến quá muộn (vượt quá ${SERVICE_END_HOUR}:00). Vui lòng chọn giờ bắt đầu sớm hơn.`;
      }
      setCustomError(msg);
      setErrorType("outside_hours");
      lastEmittedRef.current = null;
      onChange(null);
      return;
    }

    if (dayObj && dayObj.isToday) {
      const earliest = getEarliestBookableTime();

      if (!earliest) {
        setCustomError(
          `Hôm nay đã hết khung giờ có thể đặt (quá ${SERVICE_END_HOUR}:00). Vui lòng chọn sang ngày mai.`,
        );
        setErrorType("no_slots_today");
        lastEmittedRef.current = null;
        onChange(null);
        return;
      }

      const slotTime = new Date();
      slotTime.setHours(hNum, mNum, 0, 0);

      if (slotTime < earliest) {
        const earliestStr = formatTimeHM(earliest);
        setCustomError(
          `Giờ ${h}:${m} không hợp lệ cho hôm nay. Cần đặt trước ít nhất 1 tiếng 30 phút. Giờ sớm nhất có thể đặt: ${earliestStr}`,
        );
        setErrorType("too_soon");
        lastEmittedRef.current = null;
        onChange(null);
        return;
      }
    }

    const timeStr = `${h}:${m}`;
    const disabledByStaff = isSlotDisabled(dayObj, timeStr, totalHours, staffSchedule);
    if (disabledByStaff) {
      setCustomError("Khung giờ này đã qua, nhân viên đang bận, hoặc không đủ thời gian làm tối thiểu. Vui lòng chọn giờ khác.");
      setErrorType("staff_busy");
      lastEmittedRef.current = null;
      onChange(null);
      return;
    }

    setCustomError(null);
    setErrorType(null);
    lastEmittedRef.current = timeStr;
    onChange(timeStr);
  };

  const handleHourChange = (h) => {
    setDisplayHour(h);
    displayHourRef.current = h;
    _checkAndEmit(h, displayMinute);
  };
  const handleMinuteChange = (m) => {
    setDisplayMinute(m);
    displayMinuteRef.current = m;
    _checkAndEmit(displayHour, m);
  };

  const earliest = dayObj?.isToday ? getEarliestBookableTime() : null;
  const earliestStr = earliest ? formatTimeHM(earliest) : null;
  const noSlotsToday = dayObj?.isToday && !earliest;

  const handlePickEarliest = () => {
    if (!earliest) return;
    const eh = String(earliest.getHours()).padStart(2, "0");
    const em = String(earliest.getMinutes()).padStart(2, "0");
    setDisplayHour(eh);
    setDisplayMinute(em);
    displayHourRef.current = eh;
    displayMinuteRef.current = em;
    setCustomError(null);
    setErrorType(null);
    const timeStr = `${eh}:${em}`;
    lastEmittedRef.current = timeStr;
    onChange(timeStr);
    if (onSelectEarliest) onSelectEarliest(timeStr);
  };

  return (
    <div className="mt-3 p-4 rounded-xl border-2 border-primary bg-primary/5 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="material-symbols-outlined text-primary text-base">
          schedule
        </span>
        <span className="text-sm font-semibold text-on-surface-variant">
          Chọn giờ:
        </span>
        <div className="flex items-center gap-2 ml-2">
          <div className="flex flex-col items-center">
            <span className="text-xs text-on-surface-variant mb-1 font-medium">
              Giờ
            </span>
            <select
              value={displayHour}
              onChange={(e) => handleHourChange(e.target.value)}
              className="w-16 py-2 px-1 rounded-lg border-2 border-primary/40 bg-surface text-on-surface font-bold text-center focus:outline-none focus:border-primary appearance-none cursor-pointer"
            >
              {hours.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xl font-bold text-primary mt-4">:</span>
          <div className="flex flex-col items-center">
            <span className="text-xs text-on-surface-variant mb-1 font-medium">
              Phút
            </span>
            <select
              value={displayMinute}
              onChange={(e) => handleMinuteChange(e.target.value)}
              className="w-16 py-2 px-1 rounded-lg border-2 border-primary/40 bg-surface text-on-surface font-bold text-center focus:outline-none focus:border-primary appearance-none cursor-pointer"
            >
              {minutes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <span
            className={`text-sm font-bold mt-4 ml-1 ${customError ? "text-error" : "text-primary"}`}
          >
            {displayHour}:{displayMinute}
          </span>
        </div>
      </div>

      <p className="text-xs text-on-surface-variant flex items-center gap-1">
        <span className="material-symbols-outlined text-xs text-primary">
          info
        </span>
        Giờ hoạt động:{" "}
        <span className="font-bold text-primary ml-1">
          {SERVICE_START_HOUR}:00 – {SERVICE_END_HOUR}:00
        </span>
        {dayObj?.isToday && earliestStr && (
          <span className="ml-2">
            · Hôm nay sớm nhất:{" "}
            <span className="font-bold text-primary">{earliestStr}</span>
          </span>
        )}
      </p>

      {noSlotsToday && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-error/10 border border-error/30">
          <span
            className="material-symbols-outlined text-error text-base mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            event_busy
          </span>
          <p className="text-sm text-error font-medium">
            Hôm nay đã hết khung giờ có thể đặt (sau {SERVICE_END_HOUR}:00). Vui
            lòng chọn sang ngày mai hoặc ngày khác.
          </p>
        </div>
      )}

      {customError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-error/10 border border-error/30">
          <span
            className="material-symbols-outlined text-error text-base mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            error
          </span>
          <div className="flex-1">
            <p className="text-sm text-error font-medium">{customError}</p>
            {errorType === "too_soon" && earliestStr && (
              <button
                onClick={handlePickEarliest}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-error text-white rounded-lg text-xs font-bold hover:bg-error/80 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  schedule
                </span>
                Chọn {earliestStr} ngay
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── TimeSlotPicker ───────────────────────────────────────────────────────────

const TimeSlotPicker = ({
  periods,
  showCustom,
  selectedDayObj,
  selectedTime,
  setSelectedTime,
  showCustomTime,
  setShowCustomTime,
  customTimeValue,
  setCustomTimeValue,
  errors,
  setErrors,
  isUrgent,
  urgentFee,
  tick,
  totalHours,
  staffSchedule,
}) => {
  const labels = {
    morning: "Buổi sáng",
    afternoon: "Buổi chiều",
    evening: "Buổi tối",
  };
  const icons = {
    morning: "light_mode",
    afternoon: "wb_twilight",
    evening: "dark_mode",
  };
  const earliest = selectedDayObj?.isToday ? getEarliestBookableTime() : null;
  const noSlotsToday = selectedDayObj?.isToday && !earliest;

  const handleToggleCustom = () => {
    const next = !showCustomTime;
    setShowCustomTime(next);
    if (next) {
      setSelectedTime(null);
      if (selectedDayObj?.isToday) {
        if (earliest) {
          const eh = String(earliest.getHours()).padStart(2, "0");
          const em = String(earliest.getMinutes()).padStart(2, "0");
          setCustomTimeValue(`${eh}:${em}`);
        } else {
          setCustomTimeValue(null);
        }
      } else {
        setCustomTimeValue("08:00");
      }
      setErrors((p) => ({ ...p, time: null }));
    }
  };

  return (
    <div className="space-y-5">
      {selectedDayObj?.isToday && !noSlotsToday && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-error/5 border border-error/30 text-sm">
          <span className="material-symbols-outlined text-error text-base mt-0.5">
            bolt
          </span>
          <div>
            <p className="font-semibold text-error">
              Đặt hôm nay — áp dụng phí đặt gấp{" "}
              <span className="font-bold">+{fmt(urgentFee)}</span>
            </p>
            <p className="text-error/80 mt-0.5">
              Mọi lịch đặt trong ngày hôm nay đều tính phí gấp, bất kể khung
              giờ.
              {earliest && (
                <>
                  {" "}
                  Giờ sớm nhất có thể đặt:{" "}
                  <strong className="text-error">
                    {formatTimeHM(earliest)}
                  </strong>
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {noSlotsToday && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-error/10 border border-error/50 text-sm">
          <span className="material-symbols-outlined text-error text-base mt-0.5">
            event_busy
          </span>
          <div>
            <p className="font-semibold text-error">
              Hôm nay đã hết khung giờ có thể đặt
            </p>
            <p className="text-error/80 mt-0.5">
              Tất cả các khung giờ hôm nay đã qua hoặc không đủ thời gian tối
              thiểu 1 tiếng 30 phút. Vui lòng chọn ngày khác.
            </p>
          </div>
        </div>
      )}

      {periods.map((period) => (
        <div key={period}>
          <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-base">
              {icons[period]}
            </span>
            {labels[period]}
          </h4>
          <div className="flex gap-2 flex-wrap">
            {TIME_SLOTS[period].map((t) => {
              const disabled = isSlotDisabled(selectedDayObj, t, totalHours, staffSchedule);
              const urgentBadge = selectedDayObj?.isToday && !disabled;
              const isSelected = !showCustomTime && selectedTime === t;
              return (
                <button
                  key={t}
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return;
                    setSelectedTime(t);
                    setShowCustomTime(false);
                    setErrors((p) => ({ ...p, time: null }));
                  }}
                  className={`relative py-2 px-3 border-2 rounded-xl text-sm font-semibold transition-all ${
                    disabled
                      ? "border-outline-variant/20 text-on-surface-variant/30 bg-surface-container-lowest cursor-not-allowed line-through"
                      : isSelected
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-outline-variant/50 text-on-surface hover:border-primary"
                  }`}
                >
                  {t}
                  {urgentBadge && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-error rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-[10px]">
                        bolt
                      </span>
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
            onClick={handleToggleCustom}
            className={`py-2 px-4 border-2 rounded-xl text-sm font-semibold transition-all ${
              showCustomTime
                ? "border-primary bg-primary/5 text-primary"
                : "border-outline-variant/50 text-on-surface hover:border-primary"
            }`}
          >
            {showCustomTime && customTimeValue
              ? `Giờ tùy chọn: ${customTimeValue}`
              : "Tự nhập giờ"}
          </button>

          {showCustomTime && (
            <CustomTimePicker
              value={customTimeValue}
              dayObj={selectedDayObj}
              tick={tick}
              totalHours={totalHours}
              onChange={(val) => {
                setCustomTimeValue(val);
                if (val) setErrors((p) => ({ ...p, time: null }));
              }}
              onSelectEarliest={(val) => {
                setCustomTimeValue(val);
                setErrors((p) => ({ ...p, time: null }));
              }}
            />
          )}
        </div>
      )}

      {isUrgent && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-error/10 border border-error/30 text-sm text-error font-medium">
          <span className="material-symbols-outlined text-base">bolt</span>
          Đặt hôm nay — áp dụng phí gấp{" "}
          <span className="font-bold ml-1">+{fmt(urgentFee)}</span>
        </div>
      )}

      <ErrorMsg message={errors.time} />
    </div>
  );
};

// ─── FrequencySelector ────────────────────────────────────────────────────────

const FrequencySelector = ({ options, selectedId, onSelect, errors }) => (
  <section className="glass-card bg-surface-container-item rounded-2xl p-8">
    <SectionTitle icon="tune">Chọn hình thức đặt lịch</SectionTitle>
    <p className="text-sm text-on-surface-variant -mt-4 mb-6">
      Chọn hình thức phù hợp với nhu cầu của bạn. Bạn có thể thay đổi sau khi
      xem chi tiết.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {options.map((opt) => {
        const isSelected = selectedId === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`relative text-left p-5 rounded-2xl border-2 transition-all flex flex-col gap-3 ${
              isSelected
                ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                : "border-outline-variant/40 bg-surface-container-lowest hover:border-primary/50 hover:bg-primary/[0.02]"
            }`}
          >
            {opt.badge && (
              <span
                className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full ${
                  isSelected
                    ? "bg-primary text-on-primary"
                    : "bg-secondary-container text-primary"
                }`}
              >
                {opt.badge}
              </span>
            )}
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                isSelected
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant"
              }`}
            >
              <span className="material-symbols-outlined text-2xl">
                {opt.icon}
              </span>
            </div>
            <div>
              <p
                className={`font-bold text-base ${isSelected ? "text-primary" : "text-on-surface"}`}
              >
                {opt.label}
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {opt.sublabel}
              </p>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {opt.desc}
            </p>
            {isSelected && (
              <div className="absolute bottom-3 right-3">
                <span
                  className="material-symbols-outlined text-primary text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
    <ErrorMsg message={errors?.frequency} />
  </section>
);

// ─── Schedule247 ─────────────────────────────────────────────────────────────

const Schedule247 = ({
  shift247,
  setShift247,
  duration247,
  setDuration247,
  startDate247,
  setStartDate247,
  next7Days247,
  errors,
  setErrors,
  sectionRefs,
}) => {
  const next7Days = next7Days247 || getNext7Days(7, false);

  return (
    <div className="space-y-6">
      <section className="glass-card bg-surface-container-item rounded-2xl p-8">
        <SectionTitle icon="schedule" refProp={sectionRefs?.shift247}>
          Chọn ca làm việc
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SHIFT_247_OPTIONS.map((opt) => {
            const isSelected = shift247 === opt.id;
            return (
              <label key={opt.id} className="relative cursor-pointer">
                <input
                  type="radio"
                  checked={isSelected}
                  onChange={() => {
                    setShift247(opt.id);
                    setErrors((p) => ({ ...p, shift247: null }));
                  }}
                  className="sr-only"
                />
                <div
                  className={`p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-3 text-center ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : errors?.shift247
                        ? "border-error/40"
                        : "border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected ? "bg-primary/10" : "bg-surface-container"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-2xl ${isSelected ? "text-primary" : "text-on-surface-variant"}`}
                    >
                      {opt.icon}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-base">
                      {opt.label}
                    </p>
                    <p className="text-sm font-semibold text-primary mt-0.5">
                      {opt.hours}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {opt.desc}
                    </p>
                  </div>
                </div>
                {isSelected && <SelectedCheck />}
              </label>
            );
          })}
        </div>
        <ErrorMsg message={errors?.shift247} />
      </section>

      <section className="glass-card bg-surface-container-item rounded-2xl p-8">
        <SectionTitle icon="calendar_today" refProp={sectionRefs?.date}>
          Ngày bắt đầu
        </SectionTitle>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-tertiary-fixed/40 border border-tertiary-fixed mb-5 text-sm text-on-tertiary-fixed-variant">
          <span className="material-symbols-outlined text-base mt-0.5">
            info
          </span>
          <span>
            Dịch vụ 24/7 chỉ bắt đầu từ mốc hôm nay + 7 ngày và duy trì liên tục
            theo gói đăng ký.
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {next7Days.map((d, idx) => {
            const isSelected = startDate247 === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  setStartDate247(idx);
                  setErrors((p) => ({ ...p, date: null }));
                }}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline-variant/50 bg-surface-container-lowest hover:border-primary/60"
                }`}
              >
                <span
                  className={`text-2xl font-bold mt-0.5 ${isSelected ? "text-on-primary" : "text-on-surface"}`}
                >
                  {d.dateNum}
                </span>
              </button>
            );
          })}
        </div>
        <ErrorMsg message={errors?.date} />
      </section>

      <section className="glass-card bg-surface-container-item rounded-2xl p-8">
        <SectionTitle icon="event_repeat">Thời gian đăng ký</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {DURATION_247_OPTIONS.map((opt) => {
            const isSelected = duration247 === opt.id;
            return (
              <label key={opt.id} className="relative cursor-pointer">
                <input
                  type="radio"
                  checked={isSelected}
                  onChange={() => setDuration247(opt.id)}
                  className="sr-only"
                />
                <div
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-outline-variant/30 bg-surface-container-lowest hover:border-primary/50"
                  }`}
                >
                  <p className="font-bold text-on-surface text-base">
                    {opt.label}
                  </p>
                  {opt.discount > 0 ? (
                    <p className="text-primary font-semibold text-sm mt-1">
                      Giảm {opt.discount}%
                    </p>
                  ) : (
                    <p className="text-on-surface-variant text-sm mt-1">
                      Giá gốc
                    </p>
                  )}
                </div>
                {isSelected && <SelectedCheck />}
              </label>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-on-surface-variant flex items-center gap-1">
          <span className="material-symbols-outlined text-base text-primary">
            info
          </span>
          Đăng ký càng dài, ưu đãi càng cao. Nhân viên sẽ thay ca mỗi 8–12 giờ.
        </p>
      </section>
    </div>
  );
};

// ─── CalendarModal ────────────────────────────────────────────────────────────

const CalendarModal = ({
  isOpen,
  onClose,
  defaultDates,
  customDates,
  onSave,
  durationMonths,
}) => {
  const [tempDates, setTempDates] = useState(new Set());
  const [baseDate, setBaseDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const start = new Date();
      start.setDate(start.getDate() + 3);
      start.setHours(0, 0, 0, 0);
      setBaseDate(start);

      const end = new Date(start);
      end.setMonth(end.getMonth() + parseInt(durationMonths, 10));
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      setEndDate(end);

      if (customDates) {
        setTempDates(new Set(customDates));
      } else {
        setTempDates(new Set(defaultDates));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen || !baseDate || !endDate) return null;

  const toggleDate = (dateStr) => {
    setTempDates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dateStr)) newSet.delete(dateStr);
      else newSet.add(dateStr);
      return newSet;
    });
  };

  const handleSave = () => {
    onSave(Array.from(tempDates));
  };

  // ✅ FIX 3: Render tất cả các tháng dương lịch có ngày nằm trong [baseDate, endDate]
  // VD: baseDate=28/5, endDate=27/6 → render Tháng 5 VÀ Tháng 6 (không chỉ 1 tháng)
  const monthsToRender = [];
  {
    let y = baseDate.getFullYear();
    let m = baseDate.getMonth();
    const endY = endDate.getFullYear();
    const endM = endDate.getMonth();
    while (y < endY || (y === endY && m <= endM)) {
      monthsToRender.push({ year: y, month: m });
      m++;
      if (m > 11) {
        m = 0;
        y++;
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl p-6 max-w-2xl w-full h-[80vh] flex flex-col shadow-2xl border border-outline-variant/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4 shrink-0">
          <div>
            <h3 className="font-h3 text-h3 text-on-surface">
              Tùy chỉnh lịch làm việc
            </h3>
            <p className="text-sm text-on-surface-variant mt-1">
              Chạm vào ngày để thêm/bỏ ca làm việc
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {monthsToRender.map(({ year, month }) => {
            const firstDay = new Date(year, month, 1).getDay(); // 0(Sun) - 6(Sat)
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
            // adjust offset for starting on Monday (1)
            const emptyCells = firstDay === 0 ? 6 : firstDay - 1;

            return (
              <div
                key={`${year}-${month}`}
                className="border border-outline-variant/30 rounded-xl p-4 bg-surface-container-lowest"
              >
                <h4 className="font-bold text-center text-primary mb-3">
                  Tháng {month + 1}/{year}
                </h4>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-on-surface-variant mb-2">
                  <div>T2</div>
                  <div>T3</div>
                  <div>T4</div>
                  <div>T5</div>
                  <div>T6</div>
                  <div>T7</div>
                  <div>CN</div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: emptyCells }).map((_, i) => (
                    <div key={`empty-${i}`}></div>
                  ))}
                  {days.map((d) => {
                    const dateObj = new Date(year, month, d);
                    dateObj.setHours(0, 0, 0, 0);
                    const y = dateObj.getFullYear();
                    const mStr = String(dateObj.getMonth() + 1).padStart(
                      2,
                      "0",
                    );
                    const dStr = String(dateObj.getDate()).padStart(2, "0");
                    const dateStr = `${y}-${mStr}-${dStr}`;
                    const isSelected = tempDates.has(dateStr);
                    const isOutside = dateObj < baseDate;

                    return (
                      <button
                        key={d}
                        disabled={isOutside}
                        onClick={() => toggleDate(dateStr)}
                        className={`aspect-square flex items-center justify-center rounded-full text-sm transition-all
                          ${isOutside ? "opacity-30 cursor-not-allowed" : ""}
                          ${isSelected && !isOutside ? "bg-primary text-on-primary font-bold shadow-md" : ""}
                          ${!isSelected && !isOutside ? "hover:bg-surface-container text-on-surface" : ""}
                        `}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-outline-variant/30 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary-container"
          >
            Lưu lịch
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const BookingPage = () => {
  const location = useLocation();
  const [step, setStep] = useState(1);
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  // ✅ MỚI: dữ liệu dịch vụ lấy từ API thay vì PACKAGE_GROUPS tĩnh
  const [apiGroups, setApiGroups] = useState([]);

  const [urgentFeeVal, setUrgentFeeVal] = useState(50000);
  const [selfPickFeeVal, setSelfPickFeeVal] = useState(20000);
  const [premiumRateVal, setPremiumRateVal] = useState(0.25);

  const [apiServices, setApiServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [selectedPackage, setSelectedPackage] = useState(
    location.state?.selectedPackage || null,
  );
  const [showTasksId, setShowTasksId] = useState(null);

  // ✅ MỚI: nhân viên được chọn trước từ StaffDetailPage (id thật)
  const [preselectedStaff, setPreselectedStaff] = useState(
    location.state?.preselectedStaff || null,
  );

  // ✅ MỚI: đặt riêng với 1 nhân viên → chỉ cho chọn 2 dịch vụ id 1, 2
  const ALLOWED_SERVICE_IDS_WITH_STAFF = [1];
  const availableServices = preselectedStaff
    ? apiServices.filter((s) => ALLOWED_SERVICE_IDS_WITH_STAFF.includes(s.id))
    : apiServices;

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const [svcRes, feeRes] = await Promise.all([
          publicApi.getServices(),
          publicApi.getPhuPhi(),
        ]);

        if (svcRes.success) {
          setApiGroups(svcRes.groups || []);
          setApiServices(svcRes.services || []);
        }

        if (feeRes?.success) {
          const fees = feeRes.data || [];
          const find = (ma) => fees.find((f) => f.ma_phu_phi === ma);
          const datGap = find("DAT_GAP");
          const chonNv = find("CHON_NV");
          const caoCap = find("CAO_CAP");
          if (datGap) setUrgentFeeVal(Number(datGap.gia_tri_phu_phi));
          if (chonNv) setSelfPickFeeVal(Number(chonNv.gia_tri_phu_phi));
          if (caoCap) setPremiumRateVal(Number(caoCap.gia_tri_phu_phi) / 100);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách dịch vụ:", err);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  // ✅ FIX: tự chọn dịch vụ đầu tiên trong danh sách CHO PHÉP, và tự đổi
  // nếu selectedPackage cũ không còn nằm trong availableServices (vd: từ
  // luồng chọn dịch vụ trước đó, sau đó mới chọn nhân viên)
  useEffect(() => {
    if (
      availableServices.length > 0 &&
      (!selectedPackage ||
        !availableServices.some((s) => s.id === selectedPackage))
    ) {
      setSelectedPackage(availableServices[0].id);
    }
  }, [availableServices, selectedPackage]);

  const [selectedArea, setSelectedArea] = useState(null);
  const [extras, setExtras] = useState([]);
  const [hasPet, setHasPet] = useState(null);
  const [staffFavorite, setStaffFavorite] = useState(false);
  const [staffSelfPick, setStaffSelfPick] = useState(false);
  const [premiumStaff, setPremiumStaff] = useState(false);

  const [showReplacementOptions, setShowReplacementOptions] = useState(false);
  const [replacementOption, setReplacementOption] = useState("none");

  // State lưu lịch bận của nhân viên
  const [staffSchedule, setStaffSchedule] = useState({ contract: null, busyJobs: [] });
  const [loadingStaffSchedule, setLoadingStaffSchedule] = useState(false);

  // Nếu có nhân viên được chọn trước từ trang chi tiết nhân viên, tự bật staffSelfPick
  useEffect(() => {
    if (preselectedStaff) {
      setStaffSelfPick(true);
      setReplacementOption("none");
      setPremiumStaff(false);

      setPromoCode("");
      setPromoApplied(false);
      setPromoDiscount(0);
      setPromoId(null);
    }
  }, [preselectedStaff]);

  useEffect(() => {
    if (!preselectedStaff) {
      setShowReplacementOptions(false);
      setReplacementOption("none");
    }
  }, [preselectedStaff]);

  // Fetch lịch bận của nhân viên khi staffSelfPick được bật
  useEffect(() => {
    const fetchStaffSchedule = async () => {
      const staffId = preselectedStaff?.id;
      if (staffSelfPick && staffId) {
        setLoadingStaffSchedule(true);
        try {
          const res = await nhanVienApi.getStaffBusySchedule(staffId);
          if (res && res.success) {
            setStaffSchedule(res.data);
          } else {
            setStaffSchedule({ contract: null, busyJobs: [] });
          }
        } catch (error) {
          console.error("Lỗi khi fetch lịch nhân viên:", error);
          setStaffSchedule({ contract: null, busyJobs: [] });
        } finally {
          setLoadingStaffSchedule(false);
        }
      } else {
        setStaffSchedule({ contract: null, busyJobs: [] });
      }
    };
    fetchStaffSchedule();
  }, [staffSelfPick, preselectedStaff]);

  const [careOptionId, setCareOptionId] = useState(null);
  const [frequencyChoice, setFrequencyChoice] = useState(null);
  const [isWeeklyRepeat, setIsWeeklyRepeat] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState(null);
  const [monthlyDuration, setMonthlyDuration] = useState("1");
  const [selectedWeekDays, setSelectedWeekDays] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [customTimeValue, setCustomTimeValue] = useState(null);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customDates, setCustomDates] = useState(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [recurringDay, setRecurringDay] = useState("");

  const [shift247, setShift247] = useState(null);
  const [duration247, setDuration247] = useState("7");
  const [startDate247, setStartDate247] = useState(null);

  const [contactMode, setContactMode] = useState("saved");
  const [selectedSavedContact, setSelectedSavedContact] = useState(null);
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
  });
  const [addressMode, setAddressMode] = useState("saved");
  const [selectedSavedAddress, setSelectedSavedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    street: "",
    district: "",
  });
  const [staffNote, setStaffNote] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoId, setPromoId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [showStep5Tasks, setShowStep5Tasks] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // ─── Step 3: dữ liệu từ API ───────────────────────────────────────────────
  const [savedContacts, setSavedContacts] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [myVouchers, setMyVouchers] = useState([]);
  const [loadingStep3, setLoadingStep3] = useState(false);

  useEffect(() => {
    if (step !== 3) return;
    const fetchStep3Data = async () => {
      setLoadingStep3(true);
      try {
        const [contactsRes, addressesRes, vouchersRes] = await Promise.all([
          khachHangApi.getContacts(), // ← thay authApi.get('/khach-hang/lien-he')
          khachHangApi.getAddresses(), // ← thay authApi.get('/khach-hang/dia-chi')
          khachHangApi.getMyVouchers(), // ← thay authApi.get('/khach-hang/khuyen-mai/cua-toi')
        ]);
        setSavedContacts(contactsRes.data || []);
        setSavedAddresses(addressesRes.data || []);
        // Chỉ lấy voucher còn dùng được (status = 'saved')
        setMyVouchers(
          (vouchersRes.data || []).filter((v) => v.status === "saved"),
        );
      } catch (err) {
        console.error("Lỗi tải dữ liệu bước 3:", err);
      } finally {
        setLoadingStep3(false);
      }
    };
    fetchStep3Data();
  }, [step]);

  const [summaryOpen, setSummaryOpen] = useState({
    service: true,
    schedule: false,
    payment: false,
  });
  const toggleSummary = (key) =>
    setSummaryOpen((p) => ({ ...p, [key]: !p[key] }));

  const [errors, setErrors] = useState({});

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const sectionRefs = {
    careOption: useRef(null),
    area: useRef(null),
    pet: useRef(null),
    date: useRef(null),
    time: useRef(null),
    recurringDay: useRef(null),
    name: useRef(null),
    street: useRef(null),
    paymentMethod: useRef(null),
    shift247: useRef(null),
  };

  const apiPkgData =
    availableServices.find((p) => p.id === selectedPackage) ||
    availableServices[0] ||
    null;
  // pkgData giữ tên cũ để không phải sửa toàn bộ phần dưới component còn dùng pkgData.title, pkgData.base_price...
  const pkgData = apiPkgData
    ? {
        id: apiPkgData.id,
        title: apiPkgData.ten_dich_vu,
        desc: apiPkgData.mo_ta,
        base_price: Number(apiPkgData.don_gia_co_ban),
        isDeep: apiPkgData.cap_do_dich_vu === "CaoCap" ? false : false, // giữ false, isDeep cũ không còn áp dụng theo dữ liệu thật
        groupId: apiPkgData.nhom_dich_vu_id,
        coBienThe: !!apiPkgData.co_bien_the,
        capDoDichVu: apiPkgData.cap_do_dich_vu,
        raw: apiPkgData,
      }
    : {
        id: null,
        title: "",
        desc: "",
        base_price: 0,
        isDeep: false,
        groupId: null,
        coBienThe: false,
        capDoDichVu: "TieuChuan",
        raw: null,
      };

  // Lấy danh sách loaiGoi từ dịch vụ thực
  const loaiGoiList = getLoaiGoiList(apiPkgData);
  const hasMultipleFrequency = loaiGoiList.length >= 2;
  const hasSingleFrequency = loaiGoiList.length === 1;

  // Nếu chỉ có 1 loaiGoi, auto-resolve type ngay
  const singleLoaiGoiName = hasSingleFrequency ? loaiGoiList[0]?.name : null;
  const autoResolvedType = hasSingleFrequency
    ? singleLoaiGoiName === "24/7 Thường trực"
      ? "247"
      : singleLoaiGoiName === "Gói tháng"
        ? "monthly"
        : "single"
    : null;

  const getResolvedType = () => {
    if (hasSingleFrequency) return autoResolvedType;
    if (!frequencyChoice) return null;
    return frequencyChoice; // '247' | 'single' | 'monthly'
  };
  const resolvedType = getResolvedType();

  // frequencyMode: dùng để kiểm soát hiển thị FrequencySelector
  // 'none' = không cần chọn (1 loaiGoi), 'select' = cần chọn (≥2 loaiGoi)
  const frequencyMode = hasSingleFrequency ? "none" : "select";

  const isDeep = pkgData.isDeep || resolvedType === "deep";
  const isMonthly = resolvedType === "monthly";
  const isSingle = resolvedType === "single";
  const is247 = resolvedType === "247";

  // Logic mới: 1 dịch vụ có "tùy chọn chi tiết" khi co_bien_the = true (bất kể nhóm nào).
  const hasVariants = pkgData.coBienThe;
  const variantOptions = getAreaOptionsFromApi(apiPkgData);
  const careData = hasVariants
    ? variantOptions.find((o) => o.id === careOptionId)
    : null;

  // ✅ FIX: giữ lại isCare để code Bước 2/3 (chưa sửa) không vỡ — alias của hasVariants
  const isCare = hasVariants;

  // areaList giữ lại để tương thích phần code Bước 2 (lịch hẹn) chưa sửa ở đây;
  // với dịch vụ không có biến thể, areaData sẽ là null và basePrice/baseHours dùng don_gia_co_ban.
  const areaData = careData;

  const next7Days = getNext7Days();
  const next7Days247 = getNext7Days(7, false);
  const selectedDayObj =
    selectedDayIdx !== null ? next7Days[selectedDayIdx] : null;

  const baseHours = isCare
    ? careData?.baseHours || 2
    : areaData
      ? areaData.baseHours
      : 2;
  const maxVariantHours =
    hasVariants && variantOptions.length > 0
      ? Math.max(...variantOptions.map((o) => o.baseHours))
      : MAX_HOURS_NORMAL;

  const MAX_HOURS = isDeep
    ? MAX_HOURS_DEEP
    : hasVariants
      ? maxVariantHours
      : MAX_HOURS_NORMAL;

  // ✅ FIX: phải tính extraHoursUsed (từ dịch vụ thêm THẬT của API) trước, rồi mới tính totalHours.
  // Hàm calcTotalHours cũ dùng EXTRA_SERVICES tĩnh (id 'fridge'/'glass'/'iron') không khớp với
  // id thật từ API ('extra-12'...) nên totalHours/isOverMax trước đây luôn sai (chỉ = baseHours).
  const apiExtraList = getExtraServicesFromApi(apiPkgData);
  const extraHoursUsed = apiExtraList
    .filter((s) => extras.includes(s.id))
    .reduce((sum, s) => sum + s.addHours, 0);
  const totalHours = baseHours + extraHoursUsed;
  const isOverMax = !!careOptionId && totalHours > MAX_HOURS;
  const allowedExtraHours = MAX_HOURS - baseHours;

  const effectiveTime = showCustomTime ? customTimeValue : selectedTime;
  const isUrgent = effectiveTime
    ? isUrgentSlot(selectedDayObj, effectiveTime, totalHours)
    : false;
  const urgentFee = isUrgent ? urgentFeeVal : 0;
  const selfPickFee = staffSelfPick ? selfPickFeeVal : 0;
  const travelFee = 15000;
  const extrasTotal = apiExtraList
    .filter((s) => extras.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);
  const basePrice = isCare
    ? careData?.price || pkgData.base_price
    : areaData
      ? areaData.price
      : pkgData.base_price;

  const shiftMultiplier = shift247 === "shift-full" ? 2 : 1;
  const price247PerDay = pkgData.base_price * shiftMultiplier;
  const duration247Data = DURATION_247_OPTIONS.find(
    (d) => d.id === duration247,
  );
  const raw247Total = price247PerDay * (duration247Data?.days || 7);
  const discount247 = Math.round(
    raw247Total * ((duration247Data?.discount || 0) / 100),
  );

  const monthlyDurationData = MONTHLY_DURATION_OPTIONS.find(
    (d) => d.id === monthlyDuration,
  );
  const weeklySessionCount =
    isMonthly && selectedWeekDays.length > 0 ? selectedWeekDays.length : 1;
  const monthlySessionsPerMonth = weeklySessionCount * 4;

  const defaultDates =
    isMonthly && selectedWeekDays.length > 0 && monthlyDurationData
      ? generateMonthlyDates(monthlyDurationData.months, selectedWeekDays)
      : [];

  const isCustomSchedule = customDates !== null && customDates.length > 0;

  // Luôn đếm số buổi thực tế trên lịch để tính tiền, không fix cứng 4 buổi
  const totalSessions =
    isMonthly && selectedWeekDays.length > 0 && monthlyDurationData
      ? isCustomSchedule && customDates
        ? customDates.length
        : defaultDates.length
      : null;

  const monthlyRawTotal = isMonthly
    ? basePrice *
      (totalSessions ??
        monthlySessionsPerMonth * (monthlyDurationData?.months || 1))
    : 0;
  const monthlyDiscount =
    isMonthly && monthlyDurationData
      ? Math.round(monthlyRawTotal * (monthlyDurationData.discount / 100))
      : 0;

  const showPremium = pkgData.capDoDichVu === "CaoCap" && !preselectedStaff;
  const premiumFeePerSession =
    premiumStaff && showPremium ? Math.round(basePrice * premiumRateVal) : 0;
  const premiumFeeTotal = isMonthly
    ? premiumFeePerSession *
      (totalSessions ??
        monthlySessionsPerMonth * (monthlyDurationData?.months || 1))
    : premiumFeePerSession;

  // ✅ Map resolvedType -> enum loai_goi_ca_lam của bảng calamviec
  const LOAI_GOI_CA_LAM_MAP = {
    single: "CaLe",
    monthly: "GoiThang",
    247: "Goi247",
  };

  // ✅ Danh sách ngày làm thực tế để sinh từng bản ghi calamviec.
  // - Ca lẻ: chỉ 1 ngày (selectedDayObj)
  // - Gói tháng: customDates (nếu khách tự chỉnh lịch, kể cả lung tung không trùng tuần nào)
  //   hoặc defaultDates (sinh tự động theo các thứ đã chọn, lặp đều mỗi tuần)
  // - 24/7: CHƯA xử lý ở đây — cách sinh ca cho 24/7 khác hẳn, cần bàn riêng.
  const getCaLamViecDates = () => {
    if (isSingle && selectedDayObj) {
      const y = selectedDayObj.year;
      const m = String(selectedDayObj.month + 1).padStart(2, "0");
      const d = String(selectedDayObj.dateNum).padStart(2, "0");
      return [`${y}-${m}-${d}`];
    }
    if (isMonthly) {
      return isCustomSchedule && customDates ? customDates : defaultDates;
    }
    return [];
  };

  // ✅ MỚI: sinh danh sách {ngay_lam, gio_bat_dau} cho từng ca trực 24/7
  // - shift-day / shift-night: 1 ca/ngày, 12 giờ
  // - shift-full: 2 ca/ngày (ca ngày 06:00 + ca đêm 18:00), mỗi ca 12 giờ
  const getCaLamViec247List = () => {
    if (!is247 || startDate247 === null || !duration247Data) return [];
    const startObj = next7Days247[startDate247];
    const startDateObj = new Date(
      startObj.year,
      startObj.month,
      startObj.dateNum,
    );

    const shiftsPerDay =
      shift247 === "shift-full"
        ? [{ gio_bat_dau: "06:00", thoi_gian_lam_phut: 1440 }]
        : shift247 === "shift-night"
          ? [{ gio_bat_dau: "18:00", thoi_gian_lam_phut: 720 }]
          : [{ gio_bat_dau: "06:00", thoi_gian_lam_phut: 720 }]; // shift-day hoặc chưa chọn -> mặc định ca ngày

    const result = [];
    for (let i = 0; i < duration247Data.days; i++) {
      const d = new Date(startDateObj);
      d.setDate(d.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const ngay_lam = `${y}-${m}-${dd}`;
      shiftsPerDay.forEach((s) => result.push({ ngay_lam, ...s }));
    }
    return result;
  };

  // ✅ Snapshot dịch vụ thêm đã chọn -> [{id, ten}] lưu vào calamviec.chi_tiet_dich_vu_them
  const getChiTietDichVuThemSnapshot = () =>
    apiExtraList
      .filter((s) => extras.includes(s.id))
      .map((s) => ({ id: s.masterId, ten: s.title }));

  // ✅ Sinh toàn bộ danh sách calamviec cần tạo cho đơn hiện tại (chỉ dựng payload, chưa gọi API)
  const buildCaLamViecList = () => {
    const diaChi =
      addressMode === "saved" && savedAddresses.length > 0
        ? savedAddresses.find((a) => a.id === selectedSavedAddress)?.address
        : `${newAddress.street}, ${newAddress.district}`;

    // ✅ MỚI: 24/7 sinh riêng — mỗi ca 12 giờ (720 phút), không dùng effectiveTime/totalHours
    if (is247) {
      const shiftsList = getCaLamViec247List();
      return shiftsList.map(
        ({ ngay_lam, gio_bat_dau, thoi_gian_lam_phut }) => ({
          dich_vu_id: pkgData.id,
          chi_tiet_dich_vu_them: null,
          ngay_lam,
          gio_bat_dau,
          thoi_gian_lam_phut,
          loai_goi_ca_lam: "Goi247",
          dia_chi_lam_viec: diaChi,
          // gia_ca_nay chỉ để pass validate, BE sẽ tự tính lại từ tien_giam_giu / tong_so_buoi
          gia_ca_nay: 0,
          trang_thai_ca: preselectedStaff
            ? "ChoNhanVienChiDinhXacNhan"
            : "ChoNhanVienTuDoNhan",
          loai_ghep: preselectedStaff ? "ThuCong" : "TuDong",
        }),
      );
    }

    const dates = getCaLamViecDates();
    const chiTietDichVuThem = getChiTietDichVuThemSnapshot();

    return dates.map((ngay_lam) => ({
      dich_vu_id: pkgData.id,
      chi_tiet_dich_vu_them:
        chiTietDichVuThem.length > 0 ? JSON.stringify(chiTietDichVuThem) : null,
      ngay_lam,
      gio_bat_dau: effectiveTime,
      thoi_gian_lam_phut: Math.round(totalHours * 60),
      loai_goi_ca_lam: LOAI_GOI_CA_LAM_MAP[resolvedType] || "CaLe",
      dia_chi_lam_viec: diaChi,
      gia_ca_nay: basePrice + premiumFeePerSession,
      trang_thai_ca: preselectedStaff
        ? "ChoNhanVienChiDinhXacNhan"
        : "ChoNhanVienTuDoNhan",
      loai_ghep: preselectedStaff ? "ThuCong" : "TuDong",
    }));
  };

  // ✅ Build payload đơn hàng gửi lên BE (donhang + mảng calamviec)
  const buildDonHangPayload = () => {
    // ✅ MỚI: tính trước để dùng chung cho cả tong_so_buoi và ca_lam_viec
    const caLamViecList = buildCaLamViecList();

    // ── dich_vu_loai_goi_id: tìm đúng pivotId theo resolvedType ──
    const nameMap = {
      single: "Ca lẻ",
      monthly: "Gói tháng",
      247: "24/7 Thường trực",
    };
    const targetName = hasSingleFrequency
      ? loaiGoiList[0]?.name
      : nameMap[resolvedType];
    const dichVuLoaiGoiId = loaiGoiList.find(
      (lg) => lg.name === targetName,
    )?.pivotId;

    // ── tuy_chon_bien_the_id: strip "variant-" ──
    const bienTheId = careOptionId
      ? parseInt(careOptionId.replace("variant-", ""), 10)
      : null;

    // ── Thông tin liên hệ thực tế ──
    const contactInfo =
      contactMode === "saved" && savedContacts.length > 0
        ? savedContacts.find((c) => c.id === selectedSavedContact)
        : null;
    const hoTenThucTe = contactInfo
      ? contactInfo.ten_nguoi_nhan
      : newContact.name;
    const sdtThucTe = contactInfo ? contactInfo.sdt_nhan : newContact.phone;

    // ── Địa chỉ thực tế ──
    const addrInfo =
      addressMode === "saved" && savedAddresses.length > 0
        ? savedAddresses.find((a) => a.id === selectedSavedAddress)
        : null;
    const diaChiThucTe = addrInfo
      ? addrInfo.address
      : `${newAddress.street}, ${newAddress.district}`;

    // ── ngay_bat_dau / ngay_ket_thuc ──
    const toYMD = (d) =>
      `${d.year}-${String(d.month + 1).padStart(2, "0")}-${String(d.dateNum).padStart(2, "0")}`;

    let ngayBatDau, ngayKetThuc;

    if (isSingle && selectedDayObj) {
      ngayBatDau = toYMD(selectedDayObj);
      ngayKetThuc = ngayBatDau;
    } else if (isMonthly) {
      const dates =
        isCustomSchedule && customDates ? customDates : defaultDates;
      ngayBatDau = dates[0];
      ngayKetThuc = dates[dates.length - 1];
    } else if (is247 && startDate247 !== null) {
      const startObj = next7Days247[startDate247];
      ngayBatDau = toYMD(startObj);
      const endD = new Date(
        startObj.year,
        startObj.month,
        startObj.dateNum + (duration247Data?.days || 7) - 1,
      );
      ngayKetThuc = `${endD.getFullYear()}-${String(endD.getMonth() + 1).padStart(2, "0")}-${String(endD.getDate()).padStart(2, "0")}`;
    }

    return {
      dich_vu_loai_goi_id: dichVuLoaiGoiId,
      tuy_chon_bien_the_id: bienTheId,
      so_luong_tuy_chon: 1,
      khuyen_mai_id: promoId ?? null,
      nhan_vien_duoc_yeu_cau_id: preselectedStaff?.id ?? null,
      phuong_an_thay_the: preselectedStaff
        ? REPLACEMENT_OPTION_TO_ENUM[replacementOption]
        : null,
      is_giu_nhan_vien: false,
      tong_so_buoi: is247 ? caLamViecList.length : (totalSessions ?? 1),
      is_lap_lai_hang_tuan: isWeeklyRepeat,
      cac_ngay_trong_tuan: isMonthly ? selectedWeekDays.join(",") : null,
      gio_lam_mac_dinh: isMonthly || is247 ? effectiveTime : null,
      so_thang_goi_thang: isMonthly ? parseInt(monthlyDuration, 10) : null,
      ca_lam_247: is247 ? SHIFT_247_TO_ENUM[shift247] : null,
      so_ngay_goi_247: is247 ? (duration247Data?.days ?? null) : null,
      tld_giam_goi_thang: isMonthly
        ? (monthlyDurationData?.discount ?? 0)
        : is247
          ? (duration247Data?.discount ?? 0)
          : 0,
      ngay_bat_dau: ngayBatDau,
      ngay_ket_thuc: ngayKetThuc,
      ho_ten_thuc_te: hoTenThucTe,
      sdt_thuc_te: sdtThucTe,
      dia_chi_thuc_te: diaChiThucTe,
      ghi_chu_cho_nhan_vien: staffNote || null,
      is_cao_cap: premiumStaff,
      ty_le_phu_phi_cao_cap_snapshot: premiumStaff
        ? Math.round(premiumRateVal * 100)
        : 0,
      phu_phi_cao_cap: premiumFeeTotal,
      co_thu_cung: hasPet ?? false,
      uu_tien_nv_yt: staffFavorite,
      phu_phi_chon_nhan_vien: selfPickFee,
      don_gia_co_ban: basePrice,
      tong_tien_ban_dau: subtotal,
      phu_phi_dat_gap: urgentFee,
      tong_tien_cuoi_cung: total,
      tien_giam_giu: total - travelFee,
      phuong_thuc_tt: PAYMENT_METHOD_TO_ENUM[paymentMethod],
      ca_lam_viec: caLamViecList,
      dich_vu_them: apiExtraList
        .filter((s) => extras.includes(s.id))
        .map((s) => ({
          dich_vu_dich_vu_them_id: parseInt(s.id.replace("extra-", ""), 10),
          so_luong: 1,
          gia_luc_dat: s.price,
        })),
    };
  };

  // ✅ Gọi API đặt lịch
  const handleSubmitOrder = async () => {
    setSubmitting(true);
    try {
      const payload = buildDonHangPayload();
      const res = await khachHangApi.datLich(payload);
      if (res.success) {
        setStep(5);
      } else {
        alert(res.message || "Đặt lịch thất bại, vui lòng thử lại.");
      }
    } catch (err) {
      alert("Lỗi kết nối, vui lòng thử lại.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveCalendar = (newDates) => {
    const sortedNew = [...newDates].sort();
    const sortedDefault = [...defaultDates].sort();
    let isMatch = sortedNew.length === sortedDefault.length;
    if (isMatch) {
      for (let i = 0; i < sortedNew.length; i++) {
        if (sortedNew[i] !== sortedDefault[i]) {
          isMatch = false;
          break;
        }
      }
    }

    if (isMatch) {
      setCustomDates(null);
    } else {
      setCustomDates(sortedNew);
    }
    setShowCalendarModal(false);
  };

  const singleRepeatDiscount = 0;

  let subtotal = 0;
  if (is247) {
    subtotal = raw247Total - discount247 + travelFee;
  } else {
    subtotal = isMonthly
      ? monthlyRawTotal +
        extrasTotal +
        travelFee +
        urgentFee +
        selfPickFee +
        premiumFeeTotal
      : basePrice +
        extrasTotal +
        travelFee +
        urgentFee +
        selfPickFee +
        premiumFeeTotal;
  }

  let actualPromoDiscount = promoDiscount;

  const total = Math.max(
    0,
    subtotal -
      actualPromoDiscount -
      (is247 ? 0 : monthlyDiscount) -
      singleRepeatDiscount,
  );
  const walletBalance = 320000;

  const timeSlotPickerProps = {
    selectedDayObj,
    selectedTime,
    setSelectedTime,
    showCustomTime,
    setShowCustomTime,
    customTimeValue,
    setCustomTimeValue,
    errors,
    setErrors,
    isUrgent,
    urgentFee: urgentFeeVal,
    tick,
    totalHours,
    staffSchedule,
  };

  const getFrequencyOptions = () => {
    return getFrequencyOptionsFromApi(loaiGoiList);
  };

  const handleSelectPackage = (id) => {
    if (id === selectedPackage) return;
    setSelectedPackage(id);
    setCareOptionId(null);
    setFrequencyChoice(null);
    setSelectedArea(null);
    setExtras([]);
    setHasPet(null);
    setStaffFavorite(false);
    setStaffSelfPick(false);
    setPremiumStaff(false);
    setIsWeeklyRepeat(false);
    setSelectedDayIdx(null);
    setSelectedWeekDays([]);
    setMonthlyDuration("1");
    setSelectedTime(null);
    setCustomTimeValue(null);
    setShowCustomTime(false);
    setCustomDates(null);
    setShowCalendarModal(false);
    setRecurringDay("");
    setShift247(null);
    setDuration247("7");
    setStartDate247(null);

    setContactMode("saved");
    setSelectedSavedContact(null);
    setNewContact({ name: "", phone: "" });
    setAddressMode("saved");
    setSelectedSavedAddress(null);
    setNewAddress({ street: "", district: "" });

    setStaffNote("");
    setPaymentMethod("");
    setPromoCode("");
    setPromoApplied(false);
    setPromoDiscount(0);
    setPromoId(null);
    setErrors({});
  };

  const handleSelectFrequency = (id) => {
    setFrequencyChoice(id);
    setSelectedDayIdx(null);
    setSelectedTime(null);
    setCustomTimeValue(null);
    setShowCustomTime(false);
    setCustomDates(null);
    setShowCalendarModal(false);
    setSelectedWeekDays([]);
    setMonthlyDuration("1");
    setShift247(null);
    setStartDate247(id === "247" ? 0 : null);
    // ✅ Gói tháng không cho chọn dịch vụ thêm — nếu lỡ chọn từ Bước 1
    // (lúc dịch vụ chưa rõ hình thức) thì xóa luôn để khỏi tính nhầm.
    if (id === "monthly") setExtras([]);
    // ✅ MỚI: Mã khuyến mãi chỉ áp dụng cho "Ca lẻ" — đổi hình thức thì reset luôn,
    // tránh trường hợp đã áp mã rồi đổi sang Gói tháng/24-7 mà mã vẫn âm thầm trừ tiền.
    setPromoCode("");
    setPromoApplied(false);
    setPromoDiscount(0);
    setPromoId(null);
    setErrors((p) => ({
      ...p,
      frequency: null,
      date: null,
      time: null,
      promo: null,
    }));
  };

  const toggleExtra = (id) => {
    if (isMonthly) return; // Gói tháng không cho chọn dịch vụ thêm
    const extraList = getExtraServicesFromApi(apiPkgData);
    const svc = extraList.find((s) => s.id === id);
    if (!svc) return;
    if (extras.includes(id)) {
      setExtras((prev) => prev.filter((i) => i !== id));
    } else {
      if (extraHoursUsed + svc.addHours > allowedExtraHours) return;
      setExtras((prev) => [...prev, id]);
    }
  };

  const toggleWeekDay = (id) => {
    setErrors((p) => ({ ...p, date: null }));
    setCustomDates(null);
    if (selectedWeekDays.includes(id)) {
      setSelectedWeekDays((prev) => prev.filter((d) => d !== id));
    } else {
      if (selectedWeekDays.length >= 7) return;
      setSelectedWeekDays((prev) => [...prev, id]);
    }
  };

  const focusFirstErrorSection = (errorObj, keys) => {
    for (const key of keys) {
      if (errorObj[key] && sectionRefs[key]?.current) {
        sectionRefs[key].current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        return;
      }
    }
  };

  const validateStep1 = () => {
    const e = {};
    // ✅ FIX: section "Tùy chọn chi tiết" chỉ gắn ref `sectionRefs.area` (xem JSX),
    // nên lỗi phải được set vào key `area` để focusFirstErrorSection tìm thấy đúng ref và scroll tới.
    if (hasVariants) {
      if (!careOptionId) e.area = "Vui lòng chọn tùy chọn dịch vụ cụ thể.";
      else if (isOverMax)
        e.area = `Tổng thời gian vượt ${MAX_HOURS} giờ! Vui lòng bỏ bớt dịch vụ thêm.`;
    }
    setErrors(e);
    if (Object.keys(e).length > 0) {
      focusFirstErrorSection(e, ["area"]);
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const e = {};

    if (frequencyMode !== "none" && !frequencyChoice) {
      e.frequency = "Vui lòng chọn hình thức đặt lịch.";
      setErrors(e);
      return false;
    }

    if (hasPet === null)
      e.pet = "Vui lòng cho biết nhà bạn có nuôi thú cưng không.";

    if (is247) {
      if (!shift247) e.shift247 = "Vui lòng chọn ca làm việc.";
      if (startDate247 === null) e.date = "Vui lòng chọn ngày bắt đầu.";
    } else if (isSingle) {
      if (selectedDayIdx === null) {
        e.date = "Vui lòng chọn ngày làm việc.";
      } else if (selectedDayObj?.isToday && !getEarliestBookableTime()) {
        e.date = `Hôm nay đã hết khung giờ có thể đặt. Vui lòng chọn ngày mai hoặc ngày khác.`;
      }
      if (!effectiveTime) {
        e.time = "Vui lòng chọn hoặc nhập giờ làm việc.";
      } else {
        const [hStr, mStr] = effectiveTime.split(":");
        const hNum = parseInt(hStr, 10);
        const mNum = parseInt(mStr, 10);
        const { outsideHours, tooEarly, tooLate, exceedEnd } =
          checkServiceHours(hNum, mNum, totalHours);
        if (outsideHours) {
          if (tooEarly)
            e.time = `Giờ ${effectiveTime} quá sớm — dịch vụ hoạt động từ ${SERVICE_START_HOUR}:00 đến ${SERVICE_END_HOUR}:00.`;
          else if (tooLate)
            e.time = `Giờ ${effectiveTime} quá muộn — dịch vụ chỉ nhận đặt trước ${SERVICE_END_HOUR}:00.`;
          else if (exceedEnd)
            e.time = `Giờ kết thúc dự kiến quá muộn (vượt quá ${SERVICE_END_HOUR}:00). Vui lòng chọn giờ bắt đầu sớm hơn.`;
        } else if (selectedDayObj?.isToday) {
          const earliest = getEarliestBookableTime();
          if (!earliest) {
            e.time = `Hôm nay không còn khung giờ hợp lệ. Vui lòng chọn ngày khác.`;
          } else {
            const slotTime = new Date();
            slotTime.setHours(hNum, mNum, 0, 0);
            if (slotTime < earliest) {
              e.time = `Giờ ${effectiveTime} chưa đủ thời gian tối thiểu 1 tiếng 30 phút. Giờ sớm nhất: ${formatTimeHM(earliest)}.`;
            }
          }
        }
      }
    } else if (isMonthly) {
      if (selectedWeekDays.length === 0)
        e.date = "Vui lòng chọn ít nhất 1 ngày làm việc.";
      if (!effectiveTime) {
        e.time = "Vui lòng chọn giờ làm việc.";
      } else {
        const [hStr, mStr] = effectiveTime.split(":");
        const { outsideHours, tooEarly, tooLate, exceedEnd } =
          checkServiceHours(parseInt(hStr, 10), parseInt(mStr, 10), totalHours);
        if (outsideHours) {
          if (tooEarly)
            e.time = `Giờ ${effectiveTime} quá sớm — dịch vụ hoạt động từ ${SERVICE_START_HOUR}:00.`;
          else if (tooLate)
            e.time = `Giờ ${effectiveTime} quá muộn — dịch vụ chỉ nhận đặt trước ${SERVICE_END_HOUR}:00.`;
          else if (exceedEnd)
            e.time = `Giờ kết thúc dự kiến quá muộn (vượt quá ${SERVICE_END_HOUR}:00). Vui lòng chọn giờ bắt đầu sớm hơn.`;
        }
      }
    } else if (pkgData.type === "deep") {
      if (selectedDayIdx === null) {
        e.date = "Vui lòng chọn ngày làm việc.";
      } else if (selectedDayObj?.isToday && !getEarliestBookableTime()) {
        e.date = `Hôm nay đã hết khung giờ có thể đặt. Vui lòng chọn ngày mai hoặc ngày khác.`;
      }
      if (!effectiveTime) {
        e.time = "Vui lòng chọn hoặc nhập giờ làm việc.";
      } else {
        const [hStr, mStr] = effectiveTime.split(":");
        const hNum = parseInt(hStr, 10);
        const mNum = parseInt(mStr, 10);
        const { outsideHours, tooEarly, tooLate, exceedEnd } =
          checkServiceHours(hNum, mNum, totalHours);
        if (outsideHours) {
          if (tooEarly)
            e.time = `Giờ ${effectiveTime} quá sớm — dịch vụ hoạt động từ ${SERVICE_START_HOUR}:00 đến ${SERVICE_END_HOUR}:00.`;
          else if (tooLate)
            e.time = `Giờ ${effectiveTime} quá muộn — dịch vụ chỉ nhận đặt trước ${SERVICE_END_HOUR}:00.`;
          else if (exceedEnd)
            e.time = `Giờ kết thúc dự kiến quá muộn (vượt quá ${SERVICE_END_HOUR}:00). Vui lòng chọn giờ bắt đầu sớm hơn.`;
        } else if (selectedDayObj?.isToday) {
          const earliest = getEarliestBookableTime();
          if (!earliest) {
            e.time = `Hôm nay không còn khung giờ hợp lệ. Vui lòng chọn ngày khác.`;
          } else {
            const slotTime = new Date();
            slotTime.setHours(hNum, mNum, 0, 0);
            if (slotTime < earliest) {
              e.time = `Giờ ${effectiveTime} chưa đủ thời gian tối thiểu 1 tiếng 30 phút. Giờ sớm nhất: ${formatTimeHM(earliest)}.`;
            }
          }
        }
      }
    }

    setErrors(e);
    if (Object.keys(e).length > 0) {
      focusFirstErrorSection(e, ["pet", "date", "time", "shift247"]);
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    const e = {};
    if (contactMode === "new" || savedContacts.length === 0) {
      if (!newContact.name.trim()) e.name = "Vui lòng nhập họ tên.";
      if (!newContact.phone.trim()) e.phone = "Vui lòng nhập số điện thoại.";
    } else if (selectedSavedContact === null) {
      e.name = "Vui lòng chọn một người liên hệ đã lưu.";
    }
    if (addressMode === "new" || savedAddresses.length === 0) {
      if (!newAddress.street.trim())
        e.street = "Vui lòng nhập số nhà, tên đường.";
      if (!newAddress.district.trim())
        e.district = "Vui lòng nhập phường / quận.";
    } else if (selectedSavedAddress === null) {
      e.street = "Vui lòng chọn một địa chỉ đã lưu.";
    }
    if (!paymentMethod) {
      e.paymentMethod = "Vui lòng chọn phương thức thanh toán.";
    }
    setErrors(e);
    if (Object.keys(e).length > 0) {
      focusFirstErrorSection(e, ["name", "street", "paymentMethod"]);
      return false;
    }
    return true;
  };

  const renderStepIndicator = () => {
    const steps = [
      { num: 1, label: "Dịch vụ" },
      { num: 2, label: "Lịch hẹn" },
      { num: 3, label: "Thông tin & Thanh toán" },
      { num: 4, label: "Xác nhận" },
    ];
    return (
      <div className="flex items-center gap-2 flex-wrap text-on-surface-variant mt-4">
        {steps.map((s, i) => {
          const isActive = step === s.num;
          const isDone = step > s.num;
          return (
            <React.Fragment key={s.num}>
              <span
                className={`flex items-center gap-2 ${isActive ? "text-primary font-bold" : ""}`}
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    isActive
                      ? "bg-primary text-on-primary"
                      : isDone
                        ? "bg-primary-fixed text-primary"
                        : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {isDone ? (
                    <span
                      className="material-symbols-outlined text-base"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check
                    </span>
                  ) : (
                    s.num
                  )}
                </span>
                <span className="hidden sm:inline text-sm">{s.label}</span>
              </span>
              {i < steps.length - 1 && (
                <div
                  className={`h-px flex-1 min-w-3 max-w-10 transition-all ${step > s.num ? "bg-primary" : "bg-outline-variant"}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderCostBreakdown = () => {
    if (is247) {
      const shiftData = SHIFT_247_OPTIONS.find((s) => s.id === shift247);
      const startDayObj =
        startDate247 !== null ? next7Days247[startDate247] : null;
      return (
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-surface rounded-xl border border-outline-variant/30">
            <p className="font-bold text-on-surface mb-3 flex items-center gap-2 text-xs uppercase tracking-wide">
              <span className="material-symbols-outlined text-sm text-primary">
                bedtime
              </span>
              Dịch vụ 24/7
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-on-surface-variant">
                <span>Ca làm việc</span>
                <span className="font-semibold text-on-surface">
                  {shiftData?.label || "—"}
                </span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Ngày bắt đầu</span>
                <span className="font-semibold text-on-surface">
                  {startDayObj
                    ? `${startDayObj.dateNum}/${startDayObj.month + 1}/${startDayObj.year}`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Thời hạn</span>
                <span className="font-semibold text-on-surface">
                  {duration247Data?.label || "—"}
                </span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Giá/ngày</span>
                <span>{fmt(price247PerDay)}</span>
              </div>
              {discount247 > 0 && (
                <div className="flex justify-between text-primary font-medium">
                  <span>Ưu đãi đăng ký dài ({duration247Data?.discount}%)</span>
                  <span>-{fmt(discount247)}</span>
                </div>
              )}
              <div className="flex justify-between text-on-surface-variant">
                <span>Phí di chuyển</span>
                <span>+{fmt(travelFee)}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-end pt-5 mt-2 border-t-[3px] border-dashed border-outline-variant/30">
            <span className="font-extrabold text-on-surface text-base uppercase tracking-wide">
              Tổng thanh toán
            </span>
            <span className="text-[28px] leading-none font-black text-primary">
              {fmt(total)}
            </span>
          </div>
        </div>
      );
    }

    const rawServiceTotal = isMonthly ? monthlyRawTotal : basePrice;
    const hasExtras = extras.length > 0;
    const hasFees =
      selfPickFee > 0 ||
      urgentFee > 0 ||
      travelFee > 0 ||
      hasExtras ||
      premiumFeeTotal > 0;
    const hasDiscounts =
      monthlyDiscount > 0 ||
      actualPromoDiscount > 0 ||
      singleRepeatDiscount > 0;

    return (
      <div className="space-y-4 text-sm">
        <div className="p-4 bg-surface rounded-xl border border-outline-variant/30">
          <p className="font-bold text-on-surface mb-3 flex items-center gap-2 text-xs uppercase tracking-wide">
            <span className="material-symbols-outlined text-sm text-primary">
              cleaning_services
            </span>
            1. Phí dịch vụ gốc
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-on-surface-variant">
              <span>{pkgData.title}</span>
              <span>{fmt(basePrice)}/buổi</span>
            </div>
            {isCare && careData && (
              <div className="flex justify-between text-on-surface-variant">
                <span className="pl-3 border-l-2 border-outline-variant/30 text-xs text-on-surface-variant/80">
                  Loại: {careData.label}
                </span>
              </div>
            )}
            {isMonthly && totalSessions && (
              <div className="flex justify-between text-on-surface font-semibold pt-2 border-t border-outline-variant/50">
                <span>Tổng số buổi ({totalSessions} buổi)</span>
                <span>{fmt(rawServiceTotal)}</span>
              </div>
            )}
          </div>
        </div>

        {hasFees && (
          <div className="p-4 bg-surface rounded-xl border border-outline-variant/30">
            <p className="font-bold text-on-surface mb-3 flex items-center gap-2 text-xs uppercase tracking-wide">
              <span className="material-symbols-outlined text-sm text-error">
                add_circle
              </span>
              2. Phụ phí dịch vụ
            </p>
            <div className="space-y-2">
              {extras.map((id) => {
                const e = apiExtraList.find((s) => s.id === id);
                if (!e) return null;
                return (
                  <div
                    key={id}
                    className="flex justify-between text-on-surface-variant"
                  >
                    <span>{e.title}</span>
                    <span>+{fmt(e.price)}</span>
                  </div>
                );
              })}
              {staffSelfPick && (
                <div className="flex justify-between text-on-surface-variant">
                  <span>Chọn nhân viên</span>
                  <span>+{fmt(selfPickFee)}</span>
                </div>
              )}
              {premiumFeeTotal > 0 && (
                <div className="flex justify-between text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span
                      className="material-symbols-outlined text-sm text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      diamond
                    </span>
                    Dịch vụ Cao cấp
                    {isMonthly && totalSessions
                      ? ` (${totalSessions} buổi)`
                      : ""}
                  </span>
                  <span>+{fmt(premiumFeeTotal)}</span>
                </div>
              )}
              {isUrgent && (
                <div className="flex justify-between text-error font-medium">
                  <span>Phí đặt gấp</span>
                  <span>+{fmt(urgentFee)}</span>
                </div>
              )}
              {travelFee > 0 && (
                <div className="flex justify-between text-on-surface-variant">
                  <span>Phí di chuyển</span>
                  <span>+{fmt(travelFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-on-surface font-semibold pt-2 border-t border-outline-variant/50 mt-2">
                <span>Tổng phụ phí</span>
                <span>
                  +
                  {fmt(
                    extrasTotal +
                      selfPickFee +
                      urgentFee +
                      travelFee +
                      premiumFeeTotal,
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {hasDiscounts && (
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
            <p className="font-bold text-primary mb-3 flex items-center gap-2 text-xs uppercase tracking-wide">
              <span className="material-symbols-outlined text-sm">redeem</span>
              3. Khuyến mãi & Ưu đãi
            </p>
            <div className="space-y-2">
              {monthlyDiscount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>
                    Ưu đãi gói {monthlyDurationData?.months} tháng (
                    {monthlyDurationData?.discount}%)
                  </span>
                  <span>-{fmt(monthlyDiscount)}</span>
                </div>
              )}
              {actualPromoDiscount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Mã khuyến mãi</span>
                  <span>-{fmt(actualPromoDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-primary font-semibold pt-2 border-t border-primary/20 mt-2">
                <span>Tổng giảm giá</span>
                <span>
                  -
                  {fmt(
                    monthlyDiscount +
                      actualPromoDiscount +
                      singleRepeatDiscount,
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {step >= 3 && (
          <div className="px-4 py-3 bg-surface rounded-xl border border-outline-variant/30 flex justify-between items-center text-on-surface font-semibold">
            <span className="flex items-center gap-2 text-on-surface-variant text-sm">
              <span className="material-symbols-outlined text-sm">
                account_balance_wallet
              </span>
              Thanh toán
            </span>
            <span className="text-primary">
              {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}
            </span>
          </div>
        )}

        <div className="flex justify-between items-end pt-5 mt-2 border-t-[3px] border-dashed border-outline-variant/30">
          <span className="font-extrabold text-on-surface text-base uppercase tracking-wide">
            Tổng thanh toán
          </span>
          <span className="text-[28px] leading-none font-black text-primary">
            {fmt(total)}
          </span>
        </div>
      </div>
    );
  };

  const renderOrderSummary = ({
    onPrimary,
    primaryLabel,
    onBack,
    showActions = true,
    confirmMode = false,
  }) => {
    const AccordionSection = ({ sectionKey, icon, title, children }) => {
      const isOpen = summaryOpen[sectionKey];
      const hasContent = React.Children.toArray(children).some(Boolean);
      if (!hasContent) return null;
      return (
        <div className="border border-outline-variant/20 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSummary(sectionKey)}
            className="w-full flex items-center justify-between px-4 py-3 bg-surface-container-lowest hover:bg-surface-container transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">
                {icon}
              </span>
              <span className="text-sm font-bold text-on-surface">{title}</span>
            </div>
            <span
              className={`material-symbols-outlined text-on-surface-variant text-base transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            >
              expand_more
            </span>
          </button>
          {isOpen && (
            <div className="px-4 pb-4 pt-2 border-t border-outline-variant/10 bg-surface space-y-2">
              {children}
            </div>
          )}
        </div>
      );
    };

    // Row giữ nguyên style gốc
    const Row = ({ label, value, highlight }) => (
      <div className="flex justify-between text-on-surface-variant">
        <span>{label}</span>
        <span
          className={`font-semibold ${highlight ? "text-primary font-medium" : "text-on-surface"}`}
        >
          {value}
        </span>
      </div>
    );

    return (
      <aside className="lg:col-span-4 sticky top-24">
        <div className="bg-background-2 glass-card rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          <div className="px-6 py-5 border-b border-outline-variant/20">
            <h3 className="font-h3 text-h3 text-primary">Tóm tắt dịch vụ</h3>
          </div>

          {/* Scrollable accordion body */}
          <div className="px-4 py-3 space-y-2 max-h-[420px] overflow-y-auto">
            {/* ── NHÓM 1: Dịch vụ ── */}
            <AccordionSection
              sectionKey="service"
              icon="cleaning_services"
              title="Dịch vụ & Chi phí"
            >
              <Row
                label="Dịch vụ"
                value={
                  <span className="font-semibold px-3 py-1 bg-secondary-container text-primary rounded-full text-sm text-right leading-snug">
                    {pkgData.title}
                  </span>
                }
              />
              {step >= 2 && (areaData || careData) && !is247 && (
                <Row label="Giá / buổi" value={fmt(basePrice)} />
              )}
              {frequencyMode !== "none" && frequencyChoice && (
                <Row
                  label="Hình thức"
                  value={
                    is247
                      ? "24/7 Thường trực"
                      : isSingle
                        ? "Ca lẻ"
                        : isMonthly
                          ? "Gói tháng"
                          : "—"
                  }
                />
              )}
              {is247 && (
                <>
                  <Row
                    label="Ca"
                    value={
                      SHIFT_247_OPTIONS.find((s) => s.id === shift247)?.label ||
                      "—"
                    }
                  />
                  <Row label="Thời hạn" value={duration247Data?.label || "—"} />
                </>
              )}
              {areaData && !is247 && (
                <>
                  <Row label="Tùy chọn" value={areaData.label} />
                  <Row
                    label="Thời lượng"
                    value={`${baseHours}h${isDeep && areaData.staffCount > 1 ? ` × ${areaData.staffCount} NV` : ""}`}
                  />
                </>
              )}
              {isMonthly && selectedWeekDays.length > 0 && (
                <Row
                  label="Ngày/tuần"
                  value={
                    isCustomSchedule
                      ? "Tùy chỉnh"
                      : `${selectedWeekDays.length} ngày`
                  }
                />
              )}
              {isMonthly && monthlyDurationData && (
                <Row label="Gói đăng ký" value={monthlyDurationData.label} />
              )}
              {isMonthly && totalSessions && (
                <Row label="Tổng số buổi" value={`${totalSessions} buổi`} />
              )}
              {isMonthly &&
                monthlyDurationData &&
                monthlyDurationData.discount > 0 && (
                  <Row
                    label={`Ưu đãi gói ${monthlyDurationData.label}`}
                    value={`-${monthlyDurationData.discount}%`}
                    highlight
                  />
                )}
              {!is247 &&
                extras.map((id) => {
                  const e = apiExtraList.find((s) => s.id === id);
                  if (!e) return null;
                  return (
                    <Row key={id} label={e.title} value={`+${fmt(e.price)}`} />
                  );
                })}
              <Row label="Phí di chuyển" value={fmt(travelFee)} />
              {staffSelfPick && !is247 && (
                <Row label="Phí tự chọn NV" value={`+${fmt(selfPickFee)}`} />
              )}
              {preselectedStaff && (
                <Row
                  label="Nhân viên"
                  value={
                    <span className="flex items-center gap-1">
                      <span
                        className="material-symbols-outlined text-sm text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        verified
                      </span>
                      {preselectedStaff.name}
                    </span>
                  }
                />
              )}
              {preselectedStaff && (
                <Row
                  label="Phương án thay thế"
                  value={
                    replacementOption === "favorite"
                      ? "Tìm nhân viên yêu thích thay thế"
                      : replacementOption === "standard"
                        ? "Tìm nhân viên tiêu chuẩn thay thế"
                        : "Không tìm thay thế – Hủy ca nếu không xác nhận"
                  }
                  highlight={replacementOption !== "none"}
                />
              )}
              {premiumFeeTotal > 0 && !is247 && (
                <>
                  {isMonthly && (
                    <Row
                      label={
                        <span className="flex items-center gap-1">
                          <span
                            className="material-symbols-outlined text-sm text-primary"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            diamond
                          </span>
                          Cao cấp / buổi
                        </span>
                      }
                      value={`+${fmt(premiumFeePerSession)}`}
                    />
                  )}
                  <Row
                    label={
                      <span className="flex flex-col">
                        <span className="flex items-center gap-1">
                          <span
                            className="material-symbols-outlined text-sm text-primary"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            diamond
                          </span>
                          Dịch vụ Cao cấp
                        </span>
                        {isMonthly && totalSessions && (
                          <span className="text-xs text-on-surface-variant pl-5">
                            ({totalSessions} buổi)
                          </span>
                        )}
                      </span>
                    }
                    value={`+${fmt(premiumFeeTotal)}`}
                  />
                </>
              )}
              {isUrgent && !is247 && (
                <Row
                  label="Phí đặt gấp (hôm nay)"
                  value={`+${fmt(urgentFee)}`}
                  highlight
                />
              )}
              {is247 && discount247 > 0 && (
                <Row
                  label="Ưu đãi đăng ký dài"
                  value={`-${fmt(discount247)}`}
                  highlight
                />
              )}
              {actualPromoDiscount > 0 && (
                <Row
                  label="Khuyến mãi"
                  value={`-${fmt(actualPromoDiscount)}`}
                  highlight
                />
              )}
            </AccordionSection>

            {/* ── NHÓM 2: Lịch hẹn ── */}
            {step >= 2 &&
              (selectedDayObj ||
                selectedWeekDays.length > 0 ||
                startDate247 !== null) && (
                <AccordionSection
                  sectionKey="schedule"
                  icon="calendar_month"
                  title="Lịch hẹn"
                >
                  {is247 && startDate247 !== null && (
                    <>
                      <Row
                        label="Ngày bắt đầu"
                        value={`${next7Days247[startDate247]?.dateNum}/${next7Days247[startDate247]?.month + 1}/${next7Days247[startDate247]?.year}`}
                      />
                      <Row
                        label="Ca"
                        value={
                          SHIFT_247_OPTIONS.find((s) => s.id === shift247)
                            ?.label || "—"
                        }
                      />
                      <Row
                        label="Thời hạn"
                        value={duration247Data?.label || "—"}
                      />
                    </>
                  )}
                  {isSingle && selectedDayObj && (
                    <>
                      <Row
                        label="Ngày"
                        value={`${selectedDayObj.label} ${selectedDayObj.dateNum}/${selectedDayObj.month + 1}/${selectedDayObj.year}`}
                      />
                      {effectiveTime && (
                        <Row label="Giờ bắt đầu" value={effectiveTime} />
                      )}
                      {isWeeklyRepeat && (
                        <Row
                          label="Tần suất"
                          value="Lặp lại hàng tuần"
                          highlight
                        />
                      )}
                    </>
                  )}
                  {isMonthly && selectedWeekDays.length > 0 && (
                    <>
                      <Row
                        label="Các ngày"
                        value={
                          isCustomSchedule
                            ? "Tùy chỉnh"
                            : sortWeekDays(selectedWeekDays)
                                .map(
                                  (id) =>
                                    WEEK_DAY_OPTIONS.find((o) => o.id === id)
                                      ?.label,
                                )
                                .join(", ")
                        }
                      />
                      {effectiveTime && (
                        <Row label="Giờ bắt đầu" value={effectiveTime} />
                      )}
                    </>
                  )}
                  {pkgData.type === "deep" &&
                    frequencyMode === "none" &&
                    selectedDayObj && (
                      <>
                        <Row
                          label="Ngày"
                          value={`${selectedDayObj.label} ${selectedDayObj.dateNum}/${selectedDayObj.month + 1}/${selectedDayObj.year}`}
                        />
                        {effectiveTime && (
                          <Row label="Giờ bắt đầu" value={effectiveTime} />
                        )}
                      </>
                    )}
                </AccordionSection>
              )}

            {/* ── NHÓM 3: Thanh toán ── */}
            {step >= 3 && (
              <AccordionSection
                sectionKey="payment"
                icon="payments"
                title="Thanh toán"
              >
                <Row
                  label="Phương thức"
                  value={
                    PAYMENT_METHODS.find((m) => m.id === paymentMethod)
                      ?.label || "—"
                  }
                />
              </AccordionSection>
            )}
          </div>

          {/* Tổng + Buttons — luôn hiện, không scroll */}
          <div className="px-6 pb-5 pt-4 border-t-2 border-dashed border-outline-variant/30">
            <div className="flex justify-between items-end mb-4">
              <span className="text-on-surface-variant font-medium text-sm">
                Tổng thanh toán
              </span>
              <span className="text-2xl font-extrabold text-primary">
                {fmt(total)}
              </span>
            </div>
            {showActions && (
              <>
                {confirmMode && (
                  <p className="text-xs text-center text-on-surface-variant mb-4">
                    Bằng việc bấm Xác nhận, bạn đồng ý với{" "}
                    <Link to="/terms" className="text-primary underline">
                      Điều khoản sử dụng
                    </Link>{" "}
                    của CleanTrust.
                  </p>
                )}
                <button
                  onClick={onPrimary}
                  disabled={confirmMode && submitting}
                  className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-body-lg shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {confirmMode && submitting ? "Đang xử lý..." : primaryLabel}
                  <span className="material-symbols-outlined">
                    {confirmMode ? "check" : "arrow_forward"}
                  </span>
                </button>
                {onBack && (
                  <button
                    onClick={onBack}
                    className="w-full mt-3 border-2 border-outline-variant py-3.5 rounded-xl font-semibold hover:bg-surface-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">
                      arrow_back
                    </span>
                    Quay lại
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </aside>
    );
  };

  const renderTaskModal = ({ pkgIdProp, onClose }) => {
    if (!pkgIdProp) return null;
    const pkg = apiServices.find((p) => p.id === pkgIdProp);
    if (!pkg) return null;

    const tasks = getServiceTasks(pkg);

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-surface rounded-2xl p-8 max-w-md w-full shadow-2xl border border-outline-variant/30"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-h3 text-h3 text-on-surface">
                {pkg.ten_dich_vu}
              </h3>
              <p className="text-sm text-on-surface-variant mt-1">
                Nhân viên sẽ thực hiện các công việc sau
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface p-1"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          {tasks.length > 0 ? (
            <ul className="space-y-3">
              {tasks.map((task, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-on-surface-variant"
                >
                  <span
                    className="material-symbols-outlined text-primary text-base flex-shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  {task}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-on-surface-variant">
              Chưa có danh sách công việc chi tiết cho dịch vụ này.
            </p>
          )}
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 bg-primary text-on-primary rounded-xl font-semibold transition-all hover:bg-primary-container"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    );
  };

  const renderVoucherModal = () => {
    if (!showVoucherModal) return null;

    // Lọc voucher phù hợp với dịch vụ đang chọn
    const applicableVouchers = myVouchers.filter((v) => {
      // Áp dụng tất cả (không gắn nhóm/dịch vụ cụ thể)
      if (!v.nhom_dich_vu_id_ap_dung && !v.dich_vu_id_ap_dung) return true;
      // Theo dịch vụ cụ thể
      // ✅ FIX: ép kiểu Number() để tránh lệch type "3" (string) vs 3 (number) từ API
      if (
        v.dich_vu_id_ap_dung &&
        Number(v.dich_vu_id_ap_dung) === Number(pkgData.id)
      )
        return true;
      // Theo nhóm dịch vụ
      if (
        v.nhom_dich_vu_id_ap_dung &&
        Number(v.nhom_dich_vu_id_ap_dung) === Number(pkgData.groupId)
      )
        return true;
      return false;
    });

    const handleApplyVoucher = (voucher) => {
      const rawServiceCost = is247
        ? raw247Total
        : isMonthly
          ? monthlyRawTotal
          : basePrice;
      // loai_giam_gia từ API: 'PhanTram' hoặc 'TienMat'
      let discount = 0;
      if (voucher.loai_giam_gia === "PhanTram") {
        const raw = Math.round(
          rawServiceCost * (Number(voucher.gia_tri_giam) / 100),
        );
        discount = voucher.giam_toi_da
          ? Math.min(raw, Number(voucher.giam_toi_da))
          : raw;
      } else if (voucher.loai_giam_gia === "TienMat") {
        discount = Number(voucher.gia_tri_giam);
      }

      // ✅ Bảo vệ: nếu dữ liệu voucher thiếu/sai field, không cho NaN lan ra toàn bộ tổng tiền
      if (!Number.isFinite(discount) || discount < 0) {
        console.error("Voucher thiếu dữ liệu hợp lệ:", voucher);
        setErrors((p) => ({
          ...p,
          promo: "Không thể áp dụng mã này, vui lòng thử mã khác.",
        }));
        setShowVoucherModal(false);
        return;
      }

      setPromoId(voucher.id);
      setPromoCode(voucher.ma_code);
      setPromoDiscount(discount);
      setPromoApplied(true);
      setErrors((p) => ({ ...p, promo: null }));
      setShowVoucherModal(false);
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={() => setShowVoucherModal(false)}
      >
        <div
          className="bg-surface rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-outline-variant/30 flex flex-col max-h-[80vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-6 shrink-0">
            <div>
              <h3 className="font-h3 text-h3 text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  redeem
                </span>
                Chọn mã khuyến mãi
              </h3>
              <p className="text-sm text-on-surface-variant mt-1">
                Các ưu đãi dành riêng cho dịch vụ bạn chọn
              </p>
            </div>
            <button
              onClick={() => setShowVoucherModal(false)}
              className="text-on-surface-variant hover:text-on-surface p-1"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-3 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-outline-variant/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-outline-variant/50 transition-colors">
            {applicableVouchers.length > 0 ? (
              applicableVouchers.map((v) => (
                <div
                  key={v.id}
                  className="p-4 rounded-xl border-2 border-outline-variant/40 hover:border-primary/50 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-on-surface text-base">
                        {v.ma_code}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                        Giảm {v.discountValue}
                      </span>
                    </div>
                    <p className="font-medium text-sm text-on-surface">
                      {v.tieu_de}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {v.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleApplyVoucher(v)}
                    className="shrink-0 px-4 py-2 bg-primary text-on-primary text-sm font-semibold rounded-lg hover:bg-primary-container transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">
                  loyalty
                </span>
                <p>Không có mã khuyến mãi nào cho dịch vụ này.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <main className="pt-32 pb-section-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen">
      {renderTaskModal({
        pkgIdProp: showTasksId,
        onClose: () => setShowTasksId(null),
      })}
      {renderTaskModal({
        pkgIdProp: showStep5Tasks ? selectedPackage : null,
        onClose: () => setShowStep5Tasks(false),
      })}
      {renderVoucherModal()}

      {/* ══════════ STEP 1 ══════════ */}
      {step === 1 && (
        <>
          <div ref={headingRef} className="mb-12 scroll-mt-24">
            <h1 className="font-h2 text-h2 text-primary mb-1">
              Bước 1: Chọn dịch vụ
            </h1>
            {renderStepIndicator()}
          </div>

          {loadingServices ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
              <div className="lg:col-span-8 space-y-6">
                <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                  <SectionTitle icon="cleaning_services">
                    Chọn gói dịch vụ
                  </SectionTitle>

                  {/* Banner nhân viên đã chọn — chỉ hiện khi có preselectedStaff */}
                  {preselectedStaff && (
                    <div className="mb-6 p-4 rounded-xl border-2 border-primary bg-primary/5 flex items-center gap-4">
                      <img
                        src={preselectedStaff.avatar}
                        alt={preselectedStaff.name}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-surface-container shadow"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-on-surface flex items-center gap-2">
                          {preselectedStaff.name}
                          <span
                            className="material-symbols-outlined text-primary text-sm"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            verified
                          </span>
                        </p>
                        <p className="text-sm text-on-surface-variant mt-0.5">
                          Nhân viên đã được chọn · Dịch vụ dọn dẹp nhà
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setPreselectedStaff(null);
                          setStaffSelfPick(false);
                          setShowReplacementOptions(false);
                          setReplacementOption("favorite");
                        }}
                        className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-all"
                      >
                        <span className="material-symbols-outlined text-xl">
                          close
                        </span>
                      </button>
                    </div>
                  )}

                  <div className="space-y-8">
                    {/* ✅ MỚI: nhóm "Phổ biến" ảo (is_noi_bat) luôn ở đầu, sau đó các nhóm thật theo thu_tu_hien_thi */}
                    {(() => {
                      const popularServices = availableServices.filter(
                        (s) => s.is_noi_bat,
                      );
                      const popularIds = new Set(
                        popularServices.map((s) => s.id),
                      );
                      const renderGroups = [];
                      if (popularServices.length > 0) {
                        renderGroups.push({
                          groupId: "popular",
                          groupLabel: "Phổ biến",
                          groupIcon: "star",
                          packages: popularServices,
                        });
                      }
                      apiGroups.forEach((g) => {
                        // ✅ FIX: loại bỏ dịch vụ đã hiện ở nhóm "Phổ biến" để tránh trùng card + trùng state
                        const servicesInGroup = availableServices.filter(
                          (s) =>
                            s.nhom_dich_vu_id === g.id && !popularIds.has(s.id),
                        );
                        if (servicesInGroup.length > 0) {
                          renderGroups.push({
                            groupId: g.id,
                            groupLabel: g.ten_nhom,
                            groupIcon: g.icon || "cleaning_services",
                            packages: servicesInGroup,
                          });
                        }
                      });
                      return renderGroups;
                    })().map((group) => (
                      <div key={group.groupId}>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="material-symbols-outlined text-primary text-base">
                            {group.groupIcon}
                          </span>
                          <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">
                            {group.groupLabel}
                          </h4>
                          <div className="flex-1 h-px bg-outline-variant/30 ml-1" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {group.packages.map((pkg) => {
                            const isSelected = selectedPackage === pkg.id;
                            const tagInfo = getPackageTagInfo(pkg);
                            return (
                              <div key={pkg.id} className="relative">
                                <label className="cursor-pointer block h-full">
                                  <input
                                    type="radio"
                                    name="package"
                                    checked={isSelected}
                                    onChange={() => handleSelectPackage(pkg.id)}
                                    className="peer sr-only"
                                  />
                                  <div
                                    className={`glass-card px-5 py-4 rounded-xl border-2 transition-all flex items-start gap-4 h-full ${
                                      isSelected
                                        ? "border-primary bg-primary/5"
                                        : "border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40"
                                    }`}
                                  >
                                    <div
                                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-all ${isSelected ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"}`}
                                    >
                                      <span className="material-symbols-outlined text-2xl">
                                        {SERVICE_ICONS_MAP[pkg.id] ||
                                          "cleaning_services"}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col">
                                      <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-bold text-on-surface text-base flex-1">
                                          {pkg.ten_dich_vu}
                                        </h4>
                                        <span
                                          className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap mt-0.5 ${tagInfo.style}`}
                                        >
                                          {tagInfo.text}
                                        </span>
                                      </div>
                                      <div className="mt-1 flex-1 pb-6">
                                        <p
                                          className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed"
                                          title={pkg.mo_ta}
                                        >
                                          {pkg.mo_ta}
                                        </p>
                                      </div>
                                      <p className="text-sm font-bold text-primary">
                                        từ {fmt(pkg.don_gia_co_ban)}
                                      </p>
                                    </div>
                                    {isSelected && (
                                      <span
                                        className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5"
                                        style={{
                                          fontVariationSettings: "'FILL' 1",
                                        }}
                                      >
                                        check_circle
                                      </span>
                                    )}
                                  </div>
                                </label>
                                <button
                                  onClick={() => setShowTasksId(pkg.id)}
                                  className="absolute bottom-3 right-4 flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                                >
                                  <span className="material-symbols-outlined text-sm">
                                    info
                                  </span>
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

                {/* ✅ MỚI: "Tùy chọn chi tiết" chỉ hiện khi co_bien_the = true */}
                {hasVariants && variantOptions.length > 0 && (
                  <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                    <SectionTitle icon="straighten" refProp={sectionRefs.area}>
                      Tùy chọn chi tiết
                    </SectionTitle>
                    <p className="text-sm text-on-surface-variant -mt-4 mb-5">
                      Chọn tùy chọn phù hợp để xác định thời lượng và chi phí
                      dịch vụ.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {variantOptions.map((opt) => {
                        const isSelected = careOptionId === opt.id;
                        return (
                          <label
                            key={opt.id}
                            className="relative cursor-pointer"
                          >
                            <input
                              type="radio"
                              checked={isSelected}
                              onChange={() => {
                                setCareOptionId(opt.id);
                                setExtras([]);
                                setErrors((p) => ({ ...p, area: null }));
                              }}
                              className="peer sr-only"
                            />
                            <div
                              className={`glass-card p-5 rounded-xl border-2 transition-all text-center h-full flex flex-col items-center gap-2 ${
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : errors.area
                                    ? "border-error/40"
                                    : "border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40"
                              }`}
                            >
                              <span className="material-symbols-outlined text-3xl text-primary">
                                home
                              </span>
                              <p className="font-bold text-on-surface text-base">
                                {opt.label}
                              </p>
                              {opt.sub && (
                                <p className="text-sm text-on-surface-variant">
                                  {opt.sub}
                                </p>
                              )}
                              <div className="mt-1 px-3 py-1 bg-primary/10 rounded-full">
                                <span className="text-primary font-bold text-sm">
                                  {opt.baseHours}h
                                </span>
                              </div>
                              <span className="font-bold text-primary text-base">
                                {fmt(opt.price)}
                              </span>
                            </div>
                            {isSelected && <SelectedCheck />}
                          </label>
                        );
                      })}
                    </div>
                    <ErrorMsg message={errors.area} />
                    {isOverMax && (
                      <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-error/5 border border-error/40">
                        <span className="material-symbols-outlined text-error mt-0.5">
                          warning
                        </span>
                        <div>
                          <p className="font-semibold text-error text-sm">
                            Tổng thời gian vượt {MAX_HOURS} giờ!
                          </p>
                          <p className="text-sm text-error/80 mt-0.5">
                            Ca dịch vụ tối đa {MAX_HOURS} giờ. Vui lòng bỏ bớt
                            dịch vụ thêm hoặc chọn tùy chọn khác.
                          </p>
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {/* ✅ MỚI: "Dịch vụ Cao cấp" chỉ hiện khi cap_do_dich_vu === 'CaoCap' VÀ chưa chọn nhân viên riêng */}
                {showPremium && (
                  <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                    <SectionTitle icon="workspace_premium">
                      Dịch vụ Cao cấp
                    </SectionTitle>
                    <p className="text-sm text-on-surface-variant -mt-4 mb-5 flex items-start gap-2 p-3 bg-surface-container/50 rounded-xl border border-outline-variant/20">
                      <span
                        className="text-primary material-symbols-outlined text-base shrink-0 mt-0.5"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        info
                      </span>
                      <span>
                        Mặc định: lịch sẽ được gửi{" "}
                        <strong className="text-on-surface">
                          tất cả nhân viên
                        </strong>{" "}
                        phù hợp. Bật Dịch vụ Cao cấp để chỉ ưu tiên nhân viên có
                        đánh giá{" "}
                        <strong className="text-on-surface">
                          từ 4.7★ trở lên.
                        </strong>
                      </span>
                    </p>
                    <div className="space-y-3">
                      <ToggleRow
                        icon="diamond"
                        title="Bật Dịch vụ Cao cấp"
                        description="Chỉ nhân viên có đánh giá từ 4.7★ trở lên mới nhận được lịch này. Phí tăng thêm 25%."
                        checked={premiumStaff}
                        onChange={() => setPremiumStaff((prev) => !prev)}
                        extraBadge={
                          premiumFeePerSession > 0
                            ? `+${fmt(premiumFeePerSession)}`
                            : null
                        }
                      />
                      {premiumStaff &&
                        (areaData ? (
                          <p className="flex items-center gap-1.5 text-sm text-on-surface-variant px-1">
                            <span
                              className="text-primary material-symbols-outlined text-base"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              verified
                            </span>
                            Phí Dịch vụ Cao cấp:{" "}
                            <strong className="text-on-surface ml-1">
                              +{fmt(premiumFeePerSession)}/buổi
                            </strong>
                            <span className="ml-1">
                              sẽ được tính vào tổng chi phí.
                            </span>
                          </p>
                        ) : (
                          <p className="flex items-center gap-1.5 text-sm text-on-surface-variant px-1">
                            <span className="material-symbols-outlined text-base text-primary">
                              info
                            </span>
                            Chọn tùy chọn ở trên để xem phí Dịch vụ Cao cấp.
                          </p>
                        ))}
                    </div>
                  </section>
                )}

                {/* ✅ MỚI: "Dịch vụ thêm (tùy chọn)" chỉ hiện khi service có dich_vu_them */}
                {(() => {
                  const extraList = getExtraServicesFromApi(apiPkgData);
                  if (extraList.length === 0 || isMonthly) return null;
                  return (
                    <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                      <SectionTitle icon="add_circle">
                        Dịch vụ thêm (tùy chọn)
                      </SectionTitle>
                      {areaData && (
                        <p className="text-sm text-on-surface-variant mb-4 -mt-3 flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">
                            info
                          </span>
                          Thời lượng còn lại:{" "}
                          <span className="font-bold text-primary ml-1">
                            {MAX_HOURS - baseHours - extraHoursUsed}h
                          </span>{" "}
                          / tối đa {MAX_HOURS}h
                        </p>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {extraList.map((service) => {
                          const isSelected = extras.includes(service.id);
                          const wouldExceed =
                            !isSelected &&
                            extraHoursUsed + service.addHours >
                              allowedExtraHours;
                          return (
                            <label
                              key={service.id}
                              className={`relative cursor-pointer ${wouldExceed ? "opacity-40 cursor-not-allowed" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() =>
                                  !wouldExceed && toggleExtra(service.id)
                                }
                                className="sr-only"
                              />
                              <div
                                className={`glass-card p-6 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-3 ${
                                  isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-outline-variant/50 bg-surface-container-lowest hover:border-primary/50"
                                }`}
                              >
                                {isSelected && <SelectedCheck />}
                                <div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? "bg-primary/10" : "bg-surface-container"}`}
                                >
                                  <span
                                    className={`material-symbols-outlined text-[28px] ${isSelected ? "text-primary" : "text-on-surface-variant"}`}
                                  >
                                    {service.icon}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-bold text-on-surface text-base">
                                    {service.title}
                                  </h4>
                                  <p className="text-primary font-semibold text-base mt-1">
                                    +{fmt(service.price)}
                                  </p>
                                  <p className="text-on-surface-variant text-sm mt-0.5">
                                    +{service.addHours} giờ
                                  </p>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </section>
                  );
                })()}
              </div>
              {renderOrderSummary({
                primaryLabel: "Tiếp theo",
                onPrimary: () => {
                  if (validateStep1()) setStep(2);
                },
              })}
            </div>
          )}
        </>
      )}

      {/* ══════════ STEP 2 ══════════ */}
      {step === 2 && (
        <>
          <div ref={headingRef} className="mb-12 scroll-mt-24">
            <h1 className="font-h2 text-h2 text-primary mb-1">
              Bước 2: Chọn lịch hẹn
            </h1>
            {renderStepIndicator()}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            <div className="lg:col-span-8 space-y-6">
              {/* Chỉ hiện FrequencySelector khi có ≥2 loaiGoi */}
              {frequencyMode !== "none" && (
                <FrequencySelector
                  options={getFrequencyOptions()}
                  selectedId={frequencyChoice}
                  onSelect={handleSelectFrequency}
                  errors={errors}
                />
              )}

              {(frequencyMode === "none" || frequencyChoice) && (
                <>
                  {is247 && (
                    <Schedule247
                      shift247={shift247}
                      setShift247={setShift247}
                      duration247={duration247}
                      setDuration247={setDuration247}
                      startDate247={startDate247}
                      setStartDate247={setStartDate247}
                      next7Days247={next7Days247}
                      errors={errors}
                      setErrors={setErrors}
                      sectionRefs={sectionRefs}
                    />
                  )}

                  {isMonthly && (
                    <>
                      <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                        <SectionTitle icon="calendar_month">
                          Loại gói
                        </SectionTitle>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {MONTHLY_DURATION_OPTIONS.map((opt) => {
                            const isSelected = monthlyDuration === opt.id;
                            return (
                              <label
                                key={opt.id}
                                className="relative cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  checked={isSelected}
                                  onChange={() => {
                                    setMonthlyDuration(opt.id);
                                    setSelectedWeekDays([]);
                                    setCustomDates(null);
                                    setSelectedTime(null);
                                    setCustomTimeValue(null);
                                    setShowCustomTime(false);
                                  }}
                                  className="sr-only"
                                />
                                <div
                                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                                    isSelected
                                      ? "border-primary bg-primary/5"
                                      : "border-outline-variant/30 bg-surface-container-lowest hover:border-primary/50"
                                  }`}
                                >
                                  <p className="font-bold text-on-surface text-base">
                                    {opt.label}
                                  </p>
                                  {opt.discount > 0 ? (
                                    <p className="text-primary font-semibold text-sm mt-1">
                                      Giảm {opt.discount}%
                                    </p>
                                  ) : (
                                    <p className="text-on-surface-variant text-sm mt-1">
                                      Giá gốc
                                    </p>
                                  )}
                                </div>
                                {isSelected && <SelectedCheck />}
                              </label>
                            );
                          })}
                        </div>
                        <p className="mt-3 text-sm text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-base text-primary">
                            info
                          </span>
                          Gói càng dài, tiết kiệm càng nhiều. Hủy bất kỳ lúc nào
                          trước khi gia hạn.
                        </p>
                      </section>

                      <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                        <SectionTitle
                          icon="calendar_today"
                          refProp={sectionRefs.date}
                        >
                          Chọn ngày làm việc hằng tuần
                          <span className="ml-auto text-sm font-normal text-on-surface-variant">
                            {selectedWeekDays.length}/7 ngày
                          </span>
                        </SectionTitle>
                        <p className="text-sm text-on-surface-variant -mt-4 mb-5">
                          Chọn tối thiểu 1 ngày, tối đa 7 ngày mỗi tuần. Giá sẽ
                          được tính theo số ngày chọn.
                        </p>
                        <div className="flex gap-3 flex-wrap">
                          {WEEK_DAY_OPTIONS.map((d) => {
                            const isSelected =
                              selectedWeekDays.includes(d.id) &&
                              !isCustomSchedule;
                            const isDisabled =
                              !isSelected && selectedWeekDays.length >= 7;
                            return (
                              <button
                                key={d.id}
                                disabled={isDisabled}
                                onClick={() => toggleWeekDay(d.id)}
                                className={`relative w-14 h-14 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center justify-center gap-0.5 ${
                                  isSelected
                                    ? "border-primary bg-primary text-on-primary"
                                    : isDisabled
                                      ? "border-outline-variant/20 text-on-surface-variant/30 cursor-not-allowed bg-surface-container-lowest"
                                      : errors.date
                                        ? "border-error/40 hover:border-error hover:text-error"
                                        : "border-outline-variant hover:border-primary hover:text-primary bg-surface-container-lowest"
                                }`}
                              >
                                {d.label}
                              </button>
                            );
                          })}
                          {isCustomSchedule && (
                            <div className="relative w-24 h-14 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center justify-center gap-0.5 border-primary bg-primary text-on-primary">
                              Tùy chỉnh
                            </div>
                          )}
                        </div>
                        <ErrorMsg message={errors.date} />
                        <div
                          className="mt-6 space-y-5 scroll-mt-28"
                          ref={sectionRefs.time}
                        >
                          <p className="font-semibold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-base">
                              schedule
                            </span>
                            Khung giờ mỗi buổi
                            <span className="text-xs font-normal text-on-surface-variant ml-1">
                              (Hoạt động {SERVICE_START_HOUR}:00 –{" "}
                              {SERVICE_END_HOUR}:00)
                            </span>
                          </p>
                          <TimeSlotPicker
                            periods={["morning", "afternoon", "evening"]}
                            showCustom={true}
                            {...timeSlotPickerProps}
                          />
                        </div>
                      </section>

                      {selectedWeekDays.length > 0 && effectiveTime && (
                        <section className="glass-card bg-surface-container-item rounded-2xl p-6 border-l-4 border-l-primary flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-on-surface">
                              Các ngày trong tuần:{" "}
                              {sortWeekDays(selectedWeekDays)
                                .map(
                                  (id) =>
                                    WEEK_DAY_OPTIONS.find((o) => o.id === id)
                                      ?.label,
                                )
                                .join(", ")}
                              {isCustomSchedule && (
                                <span className="ml-2 text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                  Đã tùy chỉnh
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-on-surface-variant mt-1">
                              Lịch được tạo tự động dựa trên số tháng và các
                              ngày bạn đã chọn.
                            </p>
                          </div>
                          <button
                            onClick={() => setShowCalendarModal(true)}
                            className="shrink-0 px-6 py-2.5 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-all flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-xl">
                              calendar_month
                            </span>
                            Xem / Chỉnh sửa lịch
                          </button>
                        </section>
                      )}
                    </>
                  )}

                  {isSingle && (
                    <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                      <SectionTitle
                        icon="calendar_today"
                        refProp={sectionRefs.date}
                      >
                        Chọn ngày làm việc
                      </SectionTitle>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {next7Days.map((d, idx) => {
                          const isSelected = selectedDayIdx === idx;
                          let isBlockedByStaff = false;
                          if (staffSchedule?.contract && staffSchedule.contract.startDate && staffSchedule.contract.endDate) {
                            const dDate = new Date(d.year, d.month, d.dateNum);
                            dDate.setHours(0, 0, 0, 0);
                            const sDate = new Date(staffSchedule.contract.startDate);
                            sDate.setHours(0, 0, 0, 0);
                            const eDate = new Date(staffSchedule.contract.endDate);
                            eDate.setHours(0, 0, 0, 0);
                            if (dDate < sDate || dDate > eDate) {
                              isBlockedByStaff = true;
                            } else {
                              const dayOfWeek = dDate.getDay();
                              if (staffSchedule.contract.offDays?.includes(dayOfWeek)) {
                                isBlockedByStaff = true;
                              }
                            }
                          }
                          const noSlots =
                            (d.isToday && !getEarliestBookableTime()) || isBlockedByStaff;
                          return (
                            <button
                              key={idx}
                              disabled={noSlots}
                              onClick={() => {
                                if (noSlots) return;
                                setSelectedDayIdx(idx);
                                setSelectedTime(null);
                                setCustomTimeValue(null);
                                setShowCustomTime(false);
                                setErrors((p) => ({ ...p, date: null }));
                              }}
                              title={
                                isBlockedByStaff
                                  ? "Nhân viên không làm việc ngày này"
                                  : noSlots
                                    ? "Hôm nay đã hết khung giờ đặt lịch"
                                    : undefined
                              }
                              className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl border-2 transition-all ${
                                noSlots
                                  ? "border-outline-variant/20 bg-surface-container-lowest cursor-not-allowed opacity-40"
                                  : isSelected
                                    ? "border-primary bg-primary text-on-primary cursor-pointer"
                                    : "border-outline-variant/50 bg-surface-container-lowest hover:border-primary/60 cursor-pointer"
                              }`}
                            >
                              <span
                                className={`text-sm font-semibold ${isSelected ? "text-on-primary" : noSlots ? "text-on-surface-variant/50" : "text-on-surface-variant"}`}
                              >
                                {d.label}
                              </span>
                              <span
                                className={`text-2xl font-bold mt-0.5 ${isSelected ? "text-on-primary" : noSlots ? "text-on-surface/40" : "text-on-surface"}`}
                              >
                                {d.dateNum}
                              </span>
                              {noSlots && (
                                <span className="text-[9px] text-error/70 font-medium mt-0.5">
                                  Hết giờ
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <ErrorMsg message={errors.date} />
                      {selectedDayIdx === 0 && getEarliestBookableTime() && (
                        <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-error/5 border border-error/30">
                          <span className="material-symbols-outlined text-error mt-0.5 text-base">
                            bolt
                          </span>
                          <div>
                            <p className="font-semibold text-error text-sm">
                              Đặt hôm nay — áp dụng phí gấp +{fmt(urgentFeeVal)}
                            </p>
                            <p className="text-sm text-error/80 mt-0.5">
                              Tất cả lịch đặt trong ngày hôm nay đều tính thêm
                              phí gấp. Giờ sớm nhất:{" "}
                              <strong>
                                {formatTimeHM(getEarliestBookableTime())}
                              </strong>
                              . Dịch vụ hoạt động{" "}
                              <strong>
                                {SERVICE_START_HOUR}:00 – {SERVICE_END_HOUR}:00
                              </strong>
                              .
                            </p>
                          </div>
                        </div>
                      )}
                      <div
                        className="mt-6 space-y-5 scroll-mt-28"
                        ref={sectionRefs.time}
                      >
                        <p className="font-semibold flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-base">
                            schedule
                          </span>
                          Chọn khung giờ
                          <span className="text-xs font-normal text-on-surface-variant ml-1">
                            (Hoạt động {SERVICE_START_HOUR}:00 –{" "}
                            {SERVICE_END_HOUR}:00)
                          </span>
                        </p>
                        <TimeSlotPicker
                          periods={["morning", "afternoon", "evening"]}
                          showCustom={true}
                          {...timeSlotPickerProps}
                        />
                      </div>

                      {/* Lặp lại hàng tuần — CHỈ có ở ca lẻ của dịch vụ id = 1 */}
                      {pkgData.id === 1 && !preselectedStaff && (
                        <div className="mt-8 border-t border-outline-variant/20 pt-6">
                          <ToggleRow
                            icon="update"
                            title="Lặp lại lịch này hàng tuần"
                            description="Tự động đặt lại lịch này mỗi tuần. Bạn có thể hủy bất kỳ lúc nào."
                            checked={isWeeklyRepeat}
                            onChange={() => setIsWeeklyRepeat((prev) => !prev)}
                          />
                        </div>
                      )}
                    </section>
                  )}

                  <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                    <SectionTitle icon="pets" refProp={sectionRefs.pet}>
                      Nhà bạn có nuôi thú cưng không?
                    </SectionTitle>
                    <div className="grid grid-cols-2 gap-4 max-w-sm">
                      {[
                        { val: false, icon: "check_circle", label: "Không có" },
                        { val: true, icon: "pets", label: "Có (chó/mèo...)" },
                      ].map((opt) => {
                        const isSelected = hasPet === opt.val;
                        return (
                          <button
                            key={String(opt.val)}
                            onClick={() => {
                              setHasPet(opt.val);
                              setErrors((p) => ({ ...p, pet: null }));
                            }}
                            className={`glass-card p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : errors.pet
                                  ? "border-error/40"
                                  : "border-outline-variant/30 bg-surface-container-lowest hover:border-primary/50"
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined text-2xl ${isSelected ? "text-primary" : "text-on-surface-variant"}`}
                            >
                              {opt.icon}
                            </span>
                            <span
                              className={`font-semibold text-base ${isSelected ? "text-primary" : "text-on-surface"}`}
                            >
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {hasPet && (
                      <p className="mt-3 text-sm text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-base text-primary">
                          info
                        </span>
                        Nhân viên sẽ được thông báo trước. Bạn có thể ghi thêm
                        ghi chú ở bước sau.
                      </p>
                    )}
                    <ErrorMsg message={errors.pet} />
                  </section>

                  {(selectedPackage || preselectedStaff) && (
                    <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                      <SectionTitle icon="badge">
                        Nhân viên phụ trách
                      </SectionTitle>

                      {preselectedStaff && (
                        <div className="mb-5 p-4 rounded-xl border-2 border-primary bg-primary/5 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={preselectedStaff.avatar}
                              alt={preselectedStaff.name}
                              className="w-14 h-14 rounded-xl object-cover border-2 border-surface-container shadow"
                            />
                            <div>
                              <p className="font-bold text-on-surface flex items-center gap-2">
                                {preselectedStaff.name}
                                <span
                                  className="material-symbols-outlined text-primary text-sm"
                                  style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                  verified
                                </span>
                              </p>
                              <div className="flex items-center gap-1 text-sm text-on-surface-variant mt-0.5">
                                <span
                                  className="material-symbols-outlined text-tertiary text-sm"
                                  style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                  star
                                </span>
                                <span className="font-semibold text-tertiary">
                                  {preselectedStaff.rating}
                                </span>
                                <span>· Nhân viên Cao cấp</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setPreselectedStaff(null);
                              setStaffSelfPick(false);
                              setShowReplacementOptions(false);
                              setReplacementOption("favorite");
                            }}
                            className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-all"
                          >
                            <span className="material-symbols-outlined text-xl">
                              close
                            </span>
                          </button>
                        </div>
                      )}
                      {!preselectedStaff && (
                        <p className="text-sm text-on-surface-variant -mt-4 mb-5 flex items-start gap-2 p-3 bg-surface-container/50 rounded-xl border border-outline-variant/20">
                          <span className="material-symbols-outlined text-base text-primary shrink-0 mt-0.5">
                            info
                          </span>
                          <span>
                            Mặc định: Lịch sẽ được gửi đến tất cả nhân viên phù
                            hợp —
                            <strong className="text-on-surface">
                              {" "}
                              ai nhận trước, làm trước
                            </strong>
                            .
                          </span>
                        </p>
                      )}
                      <div className="space-y-3">
                        {preselectedStaff ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setShowReplacementOptions((prev) => !prev)
                              }
                              className={`w-full flex items-center justify-between gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                                showReplacementOptions
                                  ? "border-primary bg-primary/5 shadow-sm"
                                  : "border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${showReplacementOptions ? "bg-primary/10 text-primary" : "bg-surface-container text-on-surface-variant"}`}
                                >
                                  <span className="material-symbols-outlined">
                                    swap_horiz
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-on-surface text-base">
                                    Phương án thay thế
                                  </p>
                                  <p className="text-sm text-on-surface-variant mt-0.5">
                                    Chọn cách xử lý nếu {preselectedStaff.name}{" "}
                                    bận lịch
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`material-symbols-outlined transition-transform ${showReplacementOptions ? "rotate-90 text-primary" : "text-on-surface-variant"}`}
                              >
                                chevron_right
                              </span>
                            </button>
                            {showReplacementOptions && (
                              <div className="space-y-2">
                                {REPLACEMENT_OPTIONS.map((opt) => (
                                  <label
                                    key={opt.id}
                                    onClick={() => setReplacementOption(opt.id)}
                                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                      replacementOption === opt.id
                                        ? opt.isDestructive
                                          ? "border-error bg-error/5"
                                          : "border-primary bg-primary/5 shadow-sm"
                                        : "border-outline-variant/30 hover:bg-surface-container"
                                    }`}
                                  >
                                    <div
                                      className={`w-4 h-4 rounded-full border-2 flex shrink-0 mt-0.5 items-center justify-center ${replacementOption === opt.id ? (opt.isDestructive ? "border-error" : "border-primary") : "border-outline-variant"}`}
                                    >
                                      {replacementOption === opt.id && (
                                        <div
                                          className={`w-2 h-2 rounded-full ${opt.isDestructive ? "bg-error" : "bg-primary"}`}
                                        ></div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <span
                                        className={`text-sm font-bold ${opt.isDestructive ? "text-error" : "text-on-surface"}`}
                                      >
                                        {opt.label}
                                      </span>
                                      <p
                                        className={`text-xs mt-0.5 leading-relaxed ${opt.isDestructive ? "text-error/80" : "text-on-surface-variant"}`}
                                      >
                                        {opt.desc}
                                      </p>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <ToggleRow
                              icon="favorite"
                              title="Ưu tiên nhân viên yêu thích"
                              description="Ưu tiên gửi lịch đến những nhân viên bạn đã đánh dấu yêu thích."
                              checked={staffFavorite}
                              onChange={() => setStaffFavorite((prev) => !prev)}
                            />
                            {staffFavorite && (
                              <p className="flex items-center gap-1.5 text-sm text-on-surface-variant px-1">
                                <span className="material-symbols-outlined text-base text-primary">
                                  info
                                </span>
                                Nếu không có nhân viên yêu thích nào rảnh, hệ
                                thống sẽ tự động chọn người phù hợp nhất.
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </section>
                  )}
                </>
              )}

              {frequencyMode !== "none" && !frequencyChoice && (
                <div className="flex flex-col items-center justify-center py-16 px-8 rounded-2xl border-2 border-dashed border-outline-variant/40 text-center">
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant">
                      tune
                    </span>
                  </div>
                  <p className="font-semibold text-on-surface-variant text-base">
                    Vui lòng chọn hình thức đặt lịch ở trên
                  </p>
                  <p className="text-sm text-on-surface-variant/70 mt-1">
                    Các tùy chọn lịch hẹn sẽ hiện ra sau khi bạn chọn.
                  </p>
                </div>
              )}
            </div>
            {renderOrderSummary({
              primaryLabel: "Tiếp theo",
              onPrimary: () => {
                if (validateStep2()) setStep(3);
              },
              onBack: () => setStep(1),
            })}
          </div>
        </>
      )}

      {/* ══════════ STEP 3 ══════════ */}
      {step === 3 && (
        <>
          <div ref={headingRef} className="mb-12 scroll-mt-24">
            <h1 className="font-h2 text-h2 text-primary mb-1">
              Bước 3: Thông tin & Thanh toán
            </h1>
            {renderStepIndicator()}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            <div className="lg:col-span-8 space-y-6">
              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                <SectionTitle icon="person" refProp={sectionRefs.name}>
                  Thông tin liên hệ
                </SectionTitle>

                {/* Chỉ hiện tab "Đã lưu" nếu API trả về data */}
                {savedContacts.length > 0 && (
                  <div className="flex gap-2 p-1 bg-surface-container rounded-xl mb-6 w-fit">
                    {[
                      {
                        id: "saved",
                        icon: "bookmark",
                        label: "Thông tin đã lưu",
                      },
                      { id: "new", icon: "person_add", label: "Nhập mới" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setContactMode(tab.id);
                          setErrors({});
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          contactMode === tab.id
                            ? "bg-primary text-on-primary shadow-sm"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">
                          {tab.icon}
                        </span>
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}

                {contactMode === "saved" && savedContacts.length > 0 && (
                  <div className="space-y-3">
                    {savedContacts.map((c) => (
                      <label
                        key={c.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedSavedContact === c.id
                            ? "border-primary bg-primary/5"
                            : errors.name
                              ? "border-error/40"
                              : "border-outline-variant/40 hover:border-outline-variant"
                        }`}
                      >
                        <input
                          type="radio"
                          checked={selectedSavedContact === c.id}
                          onChange={() => {
                            setSelectedSavedContact(c.id);
                            if (errors.name)
                              setErrors((p) => ({ ...p, name: null }));
                          }}
                          className="accent-primary w-4 h-4 shrink-0"
                        />
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${selectedSavedContact === c.id ? "bg-primary/10" : "bg-surface-container"}`}
                        >
                          <span
                            className={`material-symbols-outlined text-xl ${selectedSavedContact === c.id ? "text-primary" : "text-on-surface-variant"}`}
                          >
                            person
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-on-surface">
                            {c.ten_nguoi_nhan}
                          </p>
                          <p className="text-sm text-on-surface-variant">
                            {c.sdt_nhan}
                          </p>
                        </div>
                        {selectedSavedContact === c.id && (
                          <span
                            className="material-symbols-outlined text-primary text-xl shrink-0"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check_circle
                          </span>
                        )}
                      </label>
                    ))}
                    <ErrorMsg message={errors.name} />
                  </div>
                )}

                {/* Hiện form nhập nếu chọn "Nhập mới" HOẶC không có data đã lưu */}
                {(contactMode === "new" || savedContacts.length === 0) && (
                  <div className="space-y-4">
                    {[
                      {
                        key: "name",
                        label: "Họ và tên",
                        icon: "person",
                        placeholder: "Nguyễn Văn A",
                        type: "text",
                        required: true,
                      },
                      {
                        key: "phone",
                        label: "Số điện thoại",
                        icon: "phone",
                        placeholder: "0901 234 567",
                        type: "tel",
                        required: true,
                      },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-sm font-semibold text-on-surface mb-2">
                          {f.label}
                          {f.required && <span className="text-error"> *</span>}
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl pointer-events-none">
                            {f.icon}
                          </span>
                          <input
                            type={f.type}
                            placeholder={f.placeholder}
                            value={newContact[f.key]}
                            onChange={(e) => {
                              setNewContact((p) => ({
                                ...p,
                                [f.key]: e.target.value,
                              }));
                              if (errors[f.key])
                                setErrors((p) => ({ ...p, [f.key]: null }));
                            }}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-surface focus:outline-none transition-colors text-on-surface placeholder:text-on-surface-variant/50 ${errors[f.key] ? "border-error" : "border-outline-variant focus:border-primary"}`}
                          />
                        </div>
                        <ErrorMsg message={errors[f.key]} />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                <SectionTitle icon="location_on" refProp={sectionRefs.street}>
                  Địa chỉ vệ sinh
                </SectionTitle>

                {savedAddresses.length > 0 && (
                  <div className="flex gap-2 p-1 bg-surface-container rounded-xl mb-6 w-fit">
                    {[
                      {
                        id: "saved",
                        icon: "bookmark",
                        label: "Địa chỉ đã lưu",
                      },
                      {
                        id: "new",
                        icon: "add_location_alt",
                        label: "Nhập địa chỉ mới",
                      },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setAddressMode(tab.id);
                          setErrors((p) => ({
                            ...p,
                            street: null,
                            district: null,
                          }));
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          addressMode === tab.id
                            ? "bg-primary text-on-primary shadow-sm"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">
                          {tab.icon}
                        </span>
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}

                {addressMode === "saved" && savedAddresses.length > 0 && (
                  <div className="space-y-3">
                    {savedAddresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedSavedAddress === addr.id
                            ? "border-primary bg-primary/5"
                            : errors.street
                              ? "border-error/40"
                              : "border-outline-variant/40 hover:border-outline-variant"
                        }`}
                      >
                        <input
                          type="radio"
                          checked={selectedSavedAddress === addr.id}
                          onChange={() => {
                            setSelectedSavedAddress(addr.id);
                            if (errors.street)
                              setErrors((p) => ({ ...p, street: null }));
                          }}
                          className="accent-primary w-4 h-4 shrink-0"
                        />
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${selectedSavedAddress === addr.id ? "bg-primary/10" : "bg-surface-container"}`}
                        >
                          <span
                            className={`material-symbols-outlined text-xl ${selectedSavedAddress === addr.id ? "text-primary" : "text-on-surface-variant"}`}
                          >
                            {addr.label === "Nhà riêng"
                              ? "home"
                              : addr.label === "Văn phòng"
                                ? "business"
                                : "location_on"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-on-surface">
                            {addr.label}
                          </p>
                          <p className="text-sm text-on-surface-variant mt-0.5">
                            {addr.address}
                          </p>
                        </div>
                        {selectedSavedAddress === addr.id && (
                          <span
                            className="material-symbols-outlined text-primary text-xl shrink-0"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check_circle
                          </span>
                        )}
                      </label>
                    ))}
                    <ErrorMsg message={errors.street} />
                  </div>
                )}
                {(addressMode === "new" || savedAddresses.length === 0) && (
                  <div className="space-y-4">
                    {[
                      {
                        key: "street",
                        label: "Số nhà, tên đường",
                        icon: "signpost",
                        placeholder: "123 Nguyễn Huệ",
                      },
                      {
                        key: "district",
                        label: "Phường / Quận",
                        icon: "location_city",
                        placeholder: "Phường Bến Nghé, Quận 1",
                      },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-sm font-semibold text-on-surface mb-2">
                          {f.label} <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl pointer-events-none">
                            {f.icon}
                          </span>
                          <input
                            type="text"
                            placeholder={f.placeholder}
                            value={newAddress[f.key]}
                            onChange={(e) => {
                              setNewAddress((p) => ({
                                ...p,
                                [f.key]: e.target.value,
                              }));
                              if (errors[f.key])
                                setErrors((p) => ({ ...p, [f.key]: null }));
                            }}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-surface focus:outline-none transition-colors text-on-surface placeholder:text-on-surface-variant/50 ${
                              errors[f.key]
                                ? "border-error"
                                : "border-outline-variant focus:border-primary"
                            }`}
                          />
                        </div>
                        <ErrorMsg message={errors[f.key]} />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                <SectionTitle icon="edit_note">
                  Ghi chú cho nhân viên
                </SectionTitle>
                <div className="relative">
                  <textarea
                    rows={4}
                    placeholder={`VD: Nhà có chó, cần gọi trước khi đến.\nTập trung vệ sinh phòng bếp và phòng tắm...${hasPet ? "\n⚠️ Nhà có nuôi thú cưng." : ""}`}
                    value={staffNote}
                    onChange={(e) => setStaffNote(e.target.value)}
                    maxLength={300}
                    className="w-full px-4 py-4 rounded-xl border-2 border-outline-variant/30 bg-surface focus:border-primary focus:outline-none transition-colors text-on-surface placeholder:text-on-surface-variant/40 resize-none"
                  />
                  <div className="absolute bottom-3 right-4 text-xs text-on-surface-variant/50">
                    {staffNote.length}/300
                  </div>
                </div>
              </section>

              <section
                className={`glass-card bg-surface-container-item rounded-2xl p-8 transition-colors ${errors.paymentMethod ? "border border-error/50 bg-error/5" : ""}`}
              >
                <SectionTitle
                  icon="payments"
                  refProp={sectionRefs.paymentMethod}
                >
                  Phương thức thanh toán
                </SectionTitle>
                <div className="grid grid-cols-1 gap-3">
                  {PAYMENT_METHODS.filter(
                    (method) => !((isMonthly || is247) && method.id === "cash"),
                  ).map((method) => {
                    const isSelected = paymentMethod === method.id;
                    return (
                      <label
                        key={method.id}
                        className="relative cursor-pointer"
                      >
                        <input
                          type="radio"
                          checked={isSelected}
                          onChange={() => {
                            setPaymentMethod(method.id);
                            if (errors.paymentMethod)
                              setErrors((p) => ({ ...p, paymentMethod: null }));
                          }}
                          className="peer sr-only"
                        />
                        <div
                          className={`w-full bg-surface-container-lowest border-2 rounded-xl p-4 flex items-center gap-4 transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-outline-variant/50 hover:border-primary/50"
                          }`}
                        >
                          <input
                            type="radio"
                            checked={isSelected}
                            readOnly
                            className="accent-primary w-5 h-5 shrink-0"
                          />
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-primary/10" : "bg-surface-container"}`}
                          >
                            <span
                              className={`material-symbols-outlined text-2xl ${isSelected ? "text-primary" : "text-on-surface-variant"}`}
                            >
                              {method.icon}
                            </span>
                          </div>
                          <div className="flex-1 flex flex-col items-start">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-on-surface text-base">
                                {method.label}
                              </span>
                              {method.badge && (
                                <span className="px-2 py-0.5 bg-secondary-container text-primary rounded text-[11px] font-bold">
                                  {method.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <ErrorMsg message={errors.paymentMethod} />
                {paymentMethod === "cleantrust" && (
                  <div className="mt-4 p-3 rounded-xl bg-secondary-container/40 border border-secondary-container flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-sm mt-0.5">
                      info
                    </span>
                    <p className="text-sm text-on-surface-variant">
                      Số dư ví:{" "}
                      <span className="font-semibold text-primary">
                        {fmt(walletBalance)}
                      </span>
                      . Chỉ dùng thanh toán dịch vụ CleanTrust.
                    </p>
                  </div>
                )}
              </section>

              {isSingle && !preselectedStaff && (
                <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                  <SectionTitle icon="redeem">Mã khuyến mãi</SectionTitle>
                  <div
                    onClick={() => setShowVoucherModal(true)}
                    className={`w-full p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4 ${
                      promoApplied
                        ? "border-primary bg-primary/5"
                        : "border-outline-variant hover:border-primary/50 bg-surface"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${promoApplied ? "bg-primary/10" : "bg-surface-container"}`}
                      >
                        <span
                          className={`material-symbols-outlined text-xl ${promoApplied ? "text-primary" : "text-on-surface-variant"}`}
                        >
                          loyalty
                        </span>
                      </div>
                      <div>
                        {promoApplied ? (
                          <>
                            <p className="font-bold text-on-surface flex items-center gap-2">
                              {promoCode}
                              <span className="material-symbols-outlined text-primary text-sm">
                                check_circle
                              </span>
                            </p>
                            <p className="text-sm text-primary font-medium mt-0.5">
                              Giảm {fmt(actualPromoDiscount)}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold text-on-surface">
                              Chọn mã khuyến mãi
                            </p>
                            <p className="text-sm text-on-surface-variant mt-0.5">
                              Nhấn để xem các ưu đãi có sẵn
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    {promoApplied ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPromoCode("");
                          setPromoApplied(false);
                          setPromoDiscount(0);
                        }}
                        className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-all flex items-center justify-center"
                        title="Bỏ chọn"
                      >
                        <span className="material-symbols-outlined text-xl">
                          close
                        </span>
                      </button>
                    ) : (
                      <span className="material-symbols-outlined text-on-surface-variant">
                        chevron_right
                      </span>
                    )}
                  </div>
                  <ErrorMsg message={errors.promo} />
                </section>
              )}
            </div>
            {renderOrderSummary({
              primaryLabel: "Tiếp theo",
              onPrimary: () => {
                if (validateStep3()) setStep(4);
              },
              onBack: () => setStep(2),
            })}
          </div>
        </>
      )}

      {/* ══════════ STEP 4 ══════════ */}
      {step === 4 && (
        <>
          <div ref={headingRef} className="mb-12 scroll-mt-24">
            <h1 className="font-h2 text-h2 text-primary mb-1">
              Bước 4: Xác nhận đặt lịch
            </h1>
            {renderStepIndicator()}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            <div className="lg:col-span-8 space-y-6">
              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                <SectionTitle icon="receipt_long">
                  Xác nhận thông tin đặt lịch
                </SectionTitle>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start p-4 bg-surface rounded-xl border border-outline-variant/20">
                    <span className="material-symbols-outlined text-primary text-2xl mt-0.5">
                      cleaning_services
                    </span>
                    <div className="flex-1 space-y-2">
                      <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wide">
                        Dịch vụ
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-on-surface-variant">
                          Loại dịch vụ
                        </span>
                        <span className="font-bold text-on-surface">
                          {pkgData.title}
                        </span>
                      </div>
                      {frequencyMode !== "none" && frequencyChoice && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-on-surface-variant">
                            Hình thức
                          </span>
                          <span className="font-semibold text-on-surface">
                            {is247
                              ? "24/7 Thường trực"
                              : isSingle
                                ? "Ca lẻ"
                                : isMonthly
                                  ? "Gói tháng"
                                  : "—"}
                          </span>
                        </div>
                      )}
                      {areaData && !is247 && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-on-surface-variant">
                              Tùy chọn
                            </span>
                            <span className="font-semibold text-on-surface">
                              {areaData.label}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-on-surface-variant">
                              Thời lượng
                            </span>
                            <span className="font-semibold text-on-surface">
                              {baseHours} giờ
                              {isDeep && areaData.staffCount > 1
                                ? ` × ${areaData.staffCount} nhân viên`
                                : ""}
                            </span>
                          </div>
                        </>
                      )}
                      {extras.length > 0 && !is247 && (
                        <div className="flex justify-between items-start pt-1 border-t border-outline-variant/10">
                          <span className="text-sm text-on-surface-variant">
                            Dịch vụ thêm
                          </span>
                          <span className="font-semibold text-on-surface text-right ml-4">
                            {extras
                              .map(
                                (id) =>
                                  apiExtraList.find((s) => s.id === id)?.title,
                              )
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      )}
                      {hasPet && (
                        <div className="flex items-center gap-1.5 pt-1 border-t border-outline-variant/10">
                          <span className="material-symbols-outlined text-base text-on-surface-variant">
                            pets
                          </span>
                          <span className="text-sm text-on-surface-variant">
                            Nhà có nuôi thú cưng
                          </span>
                        </div>
                      )}
                      {isMonthly && totalSessions && (
                        <div className="flex justify-between items-center pt-1 border-t border-outline-variant/10">
                          <span className="text-sm text-on-surface-variant">
                            Tổng số buổi
                          </span>
                          <span className="font-semibold text-primary">
                            {totalSessions} buổi / {monthlyDurationData?.label}
                          </span>
                        </div>
                      )}
                      {is247 && (
                        <>
                          <div className="flex justify-between items-center pt-1 border-t border-outline-variant/10">
                            <span className="text-sm text-on-surface-variant">
                              Ca làm việc
                            </span>
                            <span className="font-semibold text-on-surface">
                              {
                                SHIFT_247_OPTIONS.find((s) => s.id === shift247)
                                  ?.label
                              }
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-on-surface-variant">
                              Thời hạn
                            </span>
                            <span className="font-semibold text-on-surface">
                              {duration247Data?.label}
                            </span>
                          </div>
                        </>
                      )}
                      {preselectedStaff && (
                        <div className="flex items-center gap-3 pt-1 border-t border-outline-variant/10 mt-1">
                          <img
                            src={preselectedStaff.avatar}
                            alt={preselectedStaff.name}
                            className="w-9 h-9 rounded-lg object-cover border border-surface-container"
                          />
                          <div>
                            <p className="text-sm font-bold text-on-surface flex items-center gap-1">
                              {preselectedStaff.name}
                              <span
                                className="material-symbols-outlined text-primary text-sm"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                verified
                              </span>
                            </p>
                            <p className="text-xs text-on-surface-variant">
                              Nhân viên phụ trách · ★ {preselectedStaff.rating}
                            </p>
                          </div>
                        </div>
                      )}
                      {preselectedStaff && (
                        <div className="flex justify-between pt-1 border-t border-outline-variant/10">
                          <span className="text-sm text-on-surface-variant">
                            Phương án thay thế
                          </span>
                          <span
                            className={`font-semibold text-right ml-4 ${replacementOption === "none" ? "text-error" : "text-on-surface"}`}
                          >
                            {replacementOption === "favorite"
                              ? "Tìm nhân viên yêu thích thay thế"
                              : replacementOption === "standard"
                                ? "Tìm nhân viên tiêu chuẩn thay thế"
                                : "Không tìm thay thế – Hủy ca nếu không xác nhận"}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => setShowStep5Tasks(true)}
                        className="mt-1 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">
                          checklist
                        </span>
                        Xem công việc bao gồm
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start p-4 bg-surface rounded-xl border border-outline-variant/20">
                    <span className="material-symbols-outlined text-primary text-2xl mt-0.5">
                      calendar_month
                    </span>
                    <div className="flex-1 space-y-2">
                      <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wide">
                        Lịch hẹn
                      </p>
                      {is247 && startDate247 !== null && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">
                              Ngày bắt đầu
                            </span>
                            <span className="font-bold text-on-surface">
                              {next7Days247[startDate247]?.dateNum}/
                              {next7Days247[startDate247]?.month + 1}/
                              {next7Days247[startDate247]?.year}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">
                              Ca
                            </span>
                            <span className="font-semibold text-on-surface">
                              {
                                SHIFT_247_OPTIONS.find((s) => s.id === shift247)
                                  ?.hours
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">
                              Thời hạn
                            </span>
                            <span className="font-bold text-primary">
                              {duration247Data?.label}
                            </span>
                          </div>
                        </>
                      )}
                      {isSingle && selectedDayObj && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">
                              Ngày làm việc
                            </span>
                            <span className="font-bold text-on-surface">
                              {selectedDayObj.label} {selectedDayObj.dateNum}/
                              {selectedDayObj.month + 1}/{selectedDayObj.year}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">
                              Giờ bắt đầu
                            </span>
                            <span className="font-semibold text-on-surface">
                              {effectiveTime}
                            </span>
                          </div>
                          {isWeeklyRepeat && (
                            <div className="flex justify-between">
                              <span className="text-sm text-on-surface-variant">
                                Tần suất
                              </span>
                              <span className="font-bold text-primary">
                                Lặp lại hàng tuần
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      {isMonthly && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">
                              Gói đăng ký
                            </span>
                            <span className="font-bold text-on-surface">
                              {monthlyDurationData?.label}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">
                              Thời gian thực hiện
                            </span>
                            <span className="font-semibold text-on-surface">
                              {(() => {
                                const start = new Date();
                                start.setDate(start.getDate() + 3);
                                let endStr;
                                if (
                                  isCustomSchedule &&
                                  customDates &&
                                  customDates.length > 0
                                ) {
                                  const sorted = [...customDates].sort();
                                  const lastDate = new Date(
                                    sorted[sorted.length - 1],
                                  );
                                  endStr = lastDate.toLocaleDateString("vi-VN");
                                } else {
                                  const end = new Date(start);
                                  end.setMonth(
                                    end.getMonth() + monthlyDurationData.months,
                                  );
                                  end.setDate(end.getDate() - 1);
                                  endStr = end.toLocaleDateString("vi-VN");
                                }
                                return `${start.toLocaleDateString("vi-VN")} - ${endStr}`;
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">
                              Số ngày / tuần
                            </span>
                            <span className="font-semibold text-on-surface">
                              {isCustomSchedule
                                ? "Tùy chỉnh"
                                : `${selectedWeekDays.length} ngày`}
                            </span>
                          </div>
                          {/* ✅ FIX 1 & 2 applied to Step 4: sorted days */}
                          <div className="flex justify-between items-start">
                            <span className="text-sm text-on-surface-variant">
                              Các ngày
                            </span>
                            <span className="font-semibold text-on-surface text-right ml-4">
                              {isCustomSchedule
                                ? `Lịch tùy chỉnh (${customDates.length} buổi)`
                                : sortWeekDays(selectedWeekDays)
                                    .map(
                                      (id) =>
                                        WEEK_DAY_OPTIONS.find(
                                          (d) => d.id === id,
                                        )?.full,
                                    )
                                    .join(", ")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">
                              Giờ bắt đầu
                            </span>
                            <span className="font-semibold text-on-surface">
                              {effectiveTime}
                            </span>
                          </div>
                          {totalSessions && (
                            <div className="flex justify-between">
                              <span className="text-sm text-on-surface-variant">
                                Tổng số buổi
                              </span>
                              <span className="font-bold text-primary">
                                {totalSessions} buổi
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      {pkgData.type === "deep" &&
                        frequencyMode === "none" &&
                        selectedDayObj && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm text-on-surface-variant">
                                Ngày làm việc
                              </span>
                              <span className="font-bold text-on-surface">
                                {selectedDayObj.label} {selectedDayObj.dateNum}/
                                {selectedDayObj.month + 1}/{selectedDayObj.year}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-on-surface-variant">
                                Giờ bắt đầu
                              </span>
                              <span className="font-semibold text-on-surface">
                                {effectiveTime}
                              </span>
                            </div>
                          </>
                        )}
                      {isUrgent && !is247 && (
                        <div className="flex justify-between items-center text-sm text-error font-medium pt-1 border-t border-outline-variant/10">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">
                              bolt
                            </span>
                            Đặt hôm nay — phụ phí gấp
                          </span>
                          <span className="font-bold">{fmt(urgentFee)}</span>
                        </div>
                      )}
                      {!is247 && (
                        <div className="flex justify-between pt-1 border-t border-outline-variant/10">
                          <span className="text-sm text-on-surface-variant">
                            Nhân viên
                          </span>
                          <span className="font-semibold text-on-surface text-right ml-4">
                            {staffFavorite && staffSelfPick
                              ? "Ưu tiên NV yêu thích + Tự chọn"
                              : staffFavorite
                                ? "Ưu tiên NV yêu thích"
                                : staffSelfPick
                                  ? "Tự chọn nhân viên"
                                  : "Ai nhận trước, làm trước"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 items-start p-4 bg-surface rounded-xl border border-outline-variant/20">
                    <span className="material-symbols-outlined text-primary text-2xl mt-0.5">
                      person
                    </span>
                    <div className="flex-1 space-y-2">
                      <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wide">
                        Thông tin liên hệ
                      </p>
                      {contactMode === "saved" && savedContacts.length > 0 ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">
                              Người liên hệ
                            </span>
                            <span className="font-bold text-on-surface">
                              {
                                savedContacts.find(
                                  (c) => c.id === selectedSavedContact,
                                )?.ten_nguoi_nhan
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">
                              Số điện thoại
                            </span>
                            <span className="font-semibold text-on-surface">
                              {
                                savedContacts.find(
                                  (c) => c.id === selectedSavedContact,
                                )?.sdt_nhan
                              }
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">
                              Người liên hệ
                            </span>
                            <span className="font-bold text-on-surface">
                              {newContact.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">
                              Số điện thoại
                            </span>
                            <span className="font-semibold text-on-surface">
                              {newContact.phone}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 items-start p-4 bg-surface rounded-xl border border-outline-variant/20">
                    <span className="material-symbols-outlined text-primary text-2xl mt-0.5">
                      location_on
                    </span>
                    <div className="flex-1 space-y-2">
                      <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wide">
                        Địa chỉ
                      </p>
                      {addressMode === "saved" && savedAddresses.length > 0 ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">
                              Tên địa chỉ
                            </span>
                            <span className="font-bold text-on-surface">
                              {
                                savedAddresses.find(
                                  (a) => a.id === selectedSavedAddress,
                                )?.label
                              }
                            </span>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-sm text-on-surface-variant shrink-0">
                              Địa chỉ cụ thể
                            </span>
                            <span className="text-sm text-on-surface text-right ml-4">
                              {
                                savedAddresses.find(
                                  (a) => a.id === selectedSavedAddress,
                                )?.address
                              }
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">
                              Số nhà, đường
                            </span>
                            <span className="font-bold text-on-surface">
                              {newAddress.street}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-on-surface-variant">
                              Phường / Quận
                            </span>
                            <span className="font-semibold text-on-surface">
                              {newAddress.district}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {staffNote && (
                    <div className="flex gap-4 items-start p-4 bg-surface rounded-xl border border-outline-variant/20">
                      <span className="material-symbols-outlined text-primary text-2xl mt-0.5">
                        edit_note
                      </span>
                      <div className="flex-1">
                        <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wide mb-2">
                          Ghi chú cho nhân viên
                        </p>
                        <p className="text-sm text-on-surface whitespace-pre-line">
                          {staffNote}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 items-start p-4 bg-surface rounded-xl border border-outline-variant/20">
                    <span className="material-symbols-outlined text-primary text-2xl mt-0.5">
                      receipt_long
                    </span>
                    <div className="flex-1 w-full min-w-0">
                      <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wide mb-3">
                        Chi tiết chi phí
                      </p>
                      {renderCostBreakdown()}
                    </div>
                  </div>

                  <div className="flex gap-3 p-4 bg-surface-container/30 rounded-xl text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-base flex-shrink-0 mt-0.5">
                      verified_user
                    </span>
                    <span>
                      Miễn phí hủy trước 24 giờ. Bảo hiểm thiệt hại 100% do lỗi
                      nhân viên.
                    </span>
                  </div>
                </div>
              </section>
            </div>
            {renderOrderSummary({
              primaryLabel: "Xác nhận đặt lịch",
              onPrimary: handleSubmitOrder,
              onBack: () => setStep(3),
              confirmMode: true,
            })}
          </div>
        </>
      )}

      {/* ══════════ STEP 5 ══════════ */}
      {step === 5 && (
        <div
          ref={headingRef}
          className="flex flex-col items-center justify-center py-20 text-center scroll-mt-24"
        >
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8">
            <span
              className="material-symbols-outlined text-primary text-5xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <h1 className="font-h2 text-h2 text-primary mb-4">
            Đặt lịch thành công!
          </h1>
          <p className="text-on-surface-variant text-body-lg max-w-md mb-8">
            Chúng tôi đã nhận được yêu cầu của bạn. Thông tin xác nhận đã được
            gửi qua SMS và Email.
          </p>
          <div className="glass-card bg-surface-container-item rounded-2xl p-8 max-w-md w-full text-left mb-8">
            <div className="space-y-3">
              <div className="flex justify-between text-on-surface-variant text-sm">
                <span>Mã đặt lịch</span>
                <span className="font-bold text-primary">
                  #CT{Math.floor(Math.random() * 90000) + 10000}
                </span>
              </div>
              <div className="flex justify-between text-on-surface-variant text-sm">
                <span>Dịch vụ</span>
                <span className="font-semibold text-on-surface">
                  {pkgData.title}
                </span>
              </div>
              {frequencyMode !== "none" && frequencyChoice && (
                <div className="flex justify-between text-on-surface-variant text-sm">
                  <span>Hình thức</span>
                  <span className="font-semibold text-on-surface">
                    {is247
                      ? "24/7 Thường trực"
                      : isSingle
                        ? "Ca lẻ"
                        : "Gói tháng"}
                  </span>
                </div>
              )}
              {areaData && !is247 && (
                <div className="flex justify-between text-on-surface-variant text-sm">
                  <span>Tùy chọn</span>
                  <span className="font-semibold text-on-surface">
                    {areaData.label} ({baseHours}h)
                  </span>
                </div>
              )}
              {isMonthly && totalSessions && (
                <div className="flex justify-between text-on-surface-variant text-sm">
                  <span>Tổng số buổi</span>
                  <span className="font-semibold text-on-surface">
                    {totalSessions} buổi
                  </span>
                </div>
              )}
              {is247 && (
                <div className="flex justify-between text-on-surface-variant text-sm">
                  <span>Thời hạn</span>
                  <span className="font-semibold text-on-surface">
                    {duration247Data?.label}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-on-surface-variant text-sm">
                <span>Tổng tiền</span>
                <span className="font-bold text-primary">{fmt(total)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Link
              to="/"
              className="px-8 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary-container transition-all"
            >
              Về trang chủ
            </Link>
            <button
              onClick={() => {
                setStep(1);
                setSelectedPackage(null);
                setSelectedArea(null);
                setExtras([]);
                setHasPet(null);
                setStaffFavorite(false);
                setStaffSelfPick(false);
                setFrequencyChoice(null);
                setIsWeeklyRepeat(false);
                setSelectedDayIdx(null);
                setSelectedTime(null);
                setMonthlyDuration("1");
                setSelectedWeekDays([]);
                setCustomTimeValue(null);
                setShowCustomTime(false);
                setRecurringDay("");
                setShift247(null);
                setDuration247("7");
                setStartDate247(null);
                setCareOptionId(null);
                setShowReplacementOptions(false);
                setReplacementOption("favorite");

                setContactMode("saved");
                setSelectedSavedContact(null);
                setNewContact({ name: "", phone: "" });
                setAddressMode("saved");
                setSelectedSavedAddress(null);
                setNewAddress({ street: "", district: "" });

                setStaffNote("");
                setPaymentMethod("cash");
                setPromoCode("");
                setPromoApplied(false);
                setPromoDiscount(0);
                setErrors({});
                setShowStep5Tasks(false);
              }}
              className="px-8 py-3 border-2 border-outline-variant rounded-xl font-semibold hover:bg-surface-container transition-all"
            >
              Đặt lịch mới
            </button>
          </div>
        </div>
      )}
      <CalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        defaultDates={defaultDates}
        customDates={customDates}
        onSave={handleSaveCalendar}
        durationMonths={monthlyDurationData?.months || 1}
      />
    </main>
  );
};

export default BookingPage;
