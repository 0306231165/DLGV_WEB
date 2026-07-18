import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import nhanVienApi from "../../../api/nhanVienApi";
import { useSimulatedTime } from "../../../contexts/SimulatedTimeContext";
// ===== PORTAL ROOT (singleton) =====
let _portalRoot = null;
const getPortalRoot = () => {
  if (!_portalRoot) {
    _portalRoot = document.createElement("div");
    _portalRoot.id = "calendar-portal-root";
    _portalRoot.style.cssText = "position:fixed;top:0;left:0;z-index:99999;pointer-events:none;";
    document.body.appendChild(_portalRoot);
  }
  return _portalRoot;
};

let TODAY = new Date();

// ===== CUSTOM DATE PICKER =====
const CustomDatePicker = ({ value, onChange, min, max, label, disabled }) => {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(null);
  const [viewMonth, setViewMonth] = useState(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const [portalRoot] = useState(() => getPortalRoot());

  const parseDate = (str) => {
    if (!str) return null;
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const parseMin = parseDate(min);
  const parseMax = parseDate(max);
  const selected = parseDate(value);

  useEffect(() => {
    if (value) {
      const [y, m] = value.split("-").map(Number);
      setViewYear(y);
      setViewMonth(m - 1);
    } else {
      setViewYear(TODAY.getFullYear());
      setViewMonth(TODAY.getMonth());
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const calc = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const calHeight = 320;
      const top =
        window.innerHeight - rect.bottom >= calHeight
          ? rect.bottom + 6
          : rect.top - calHeight - 6;
      setPos({ top, left: rect.left });
    };
    calc();
    window.addEventListener("scroll", calc, true);
    window.addEventListener("resize", calc);
    return () => {
      window.removeEventListener("scroll", calc, true);
      window.removeEventListener("resize", calc);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        !document.getElementById("calendar-portal-root")?.contains(e.target)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const monthNames = [
    "Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
    "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12",
  ];
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (y, m) => new Date(y, m, 1).getDay();
  const formatDisplay = (str) => {
    if (!str) return "";
    const [y, m, d] = str.split("-");
    return `${d}/${m}/${y}`;
  };

  const handleSelectDay = (day) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const d = new Date(viewYear, viewMonth, day);
    if (parseMin && d < parseMin) return;
    if (parseMax && d > parseMax) return;
    onChange(dateStr);
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const daysInMonth = viewYear != null ? getDaysInMonth(viewYear, viewMonth) : 0;
  const firstDay = viewYear != null ? getFirstDay(viewYear, viewMonth) : 0;
  const blanks = Array(firstDay).fill(null);

  const isDisabled = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    if (parseMin && d < parseMin) return true;
    if (parseMax && d > parseMax) return true;
    return false;
  };
  const isSelected = (day) =>
    selected &&
    selected.getFullYear() === viewYear &&
    selected.getMonth() === viewMonth &&
    selected.getDate() === day;
  const isToday2 = (day) =>
    TODAY.getFullYear() === viewYear &&
    TODAY.getMonth() === viewMonth &&
    TODAY.getDate() === day;

  const calendarPanel = open && viewYear !== null && (
    <div style={{ position: "fixed", top: pos.top, left: pos.left, width: 280, zIndex: 99999, pointerEvents: "all" }}>
      <div
        className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.22)" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prevMonth(); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors text-white"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <span className="text-white font-bold text-sm">
            {monthNames[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); nextMonth(); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors text-white"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
          {dayNames.map((d) => (
            <div key={d} className="text-center py-2 text-[10px] font-black text-slate-400 uppercase">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 p-2 gap-0.5">
          {blanks.map((_, i) => <div key={`b${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const disabled = isDisabled(day);
            const sel = isSelected(day);
            const tod = isToday2(day);
            return (
              <button
                type="button"
                key={day}
                onClick={(e) => { e.stopPropagation(); !disabled && handleSelectDay(day); }}
                className={`h-9 w-full rounded-xl text-xs font-bold transition-all
                  ${disabled ? "text-slate-300 cursor-not-allowed" : "cursor-pointer"}
                  ${sel ? "bg-emerald-600 text-white shadow-md" : ""}
                  ${!sel && tod ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300" : ""}
                  ${!sel && !tod && !disabled ? "hover:bg-slate-100 text-slate-700" : ""}`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative" ref={triggerRef}>
      {label && (
        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-100 ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-70' : 'bg-white hover:border-emerald-400 transition-all text-slate-700'}`}
      >
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-500 text-base">calendar_month</span>
          <span className={value ? "text-slate-800" : "text-slate-400 font-normal"}>
            {value ? formatDisplay(value) : "Chọn ngày..."}
          </span>
        </span>
        <span className="material-symbols-outlined text-slate-400 text-sm">
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>
      {createPortal(calendarPanel, portalRoot)}
    </div>
  );
};

// ===== TIME PICKER =====
const TimePicker = ({ label, hour, minute, onHourChange, onMinuteChange }) => {
  const [openH, setOpenH] = useState(false);
  const [openM, setOpenM] = useState(false);
  const hours = Array.from({ length: 18 }, (_, i) => String(i + 6).padStart(2, "0"));
  const minutes = ["00", "15", "30", "45"];
  return (
    <div>
      {label && (
        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 hover:border-emerald-400 transition-all shadow-sm focus-within:ring-2 focus-within:ring-emerald-100">
        <span className="material-symbols-outlined text-emerald-500 text-base">schedule</span>
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => { setOpenH((o) => !o); setOpenM(false); }}
            className="w-full text-center font-black text-slate-800 text-base focus:outline-none hover:text-emerald-600 transition-colors"
          >
            {hour}
          </button>
          {openH && (
            <div
              className="absolute z-50 top-full mt-1 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden w-20"
              style={{ maxHeight: "200px", overflowY: "auto" }}
            >
              {hours.map((h) => (
                <button
                  type="button"
                  key={h}
                  onClick={() => { onHourChange(h); setOpenH(false); }}
                  className={`w-full py-2 text-sm font-bold text-center transition-colors ${h === hour ? "bg-emerald-600 text-white" : "hover:bg-slate-50 text-slate-700"}`}
                >
                  {h}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="text-slate-400 font-black text-lg">:</span>
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => { setOpenM((o) => !o); setOpenH(false); }}
            className="w-full text-center font-black text-slate-800 text-base focus:outline-none hover:text-emerald-600 transition-colors"
          >
            {minute}
          </button>
          {openM && (
            <div className="absolute z-50 top-full mt-1 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden w-20">
              {minutes.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => { onMinuteChange(m); setOpenM(false); }}
                  className={`w-full py-2.5 text-sm font-bold text-center transition-colors ${m === minute ? "bg-emerald-600 text-white" : "hover:bg-slate-50 text-slate-700"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== HELPERS =====
const VI_DAYS = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
const VI_DAY_TO_JS = {
  "Chủ Nhật": 0, "Thứ 2": 1, "Thứ 3": 2, "Thứ 4": 3,
  "Thứ 5": 4, "Thứ 6": 5, "Thứ 7": 6,
};

const calcAffectedShifts = (contractDays, fromStr, toStr) => {
  if (!fromStr || !toStr || !contractDays || contractDays.length === 0) return null;
  const from = new Date(fromStr);
  const to = new Date(toStr);
  if (from > to) return null;
  const targetDayIndexes = contractDays.map((d) => VI_DAYS.indexOf(d)).filter((i) => i !== -1);
  const affected = [];
  const cur = new Date(from);
  while (cur <= to) {
    if (targetDayIndexes.includes(cur.getDay())) affected.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return affected;
};

const formatDateShort = (d) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

const generateContractDays = (startDate, endDate, selectedDays, calendarJobs = []) => {
  const result = {};
  if (!startDate || !endDate || !selectedDays || selectedDays.length === 0) return result;
  const targetJsDay = selectedDays
    .map((d) => VI_DAY_TO_JS[d])
    .filter((i) => i !== undefined);
  const cur = new Date(startDate);
  const end = new Date(endDate);
  const activeJobDates = new Set(calendarJobs.map((j) => j.dateStr));
  while (cur <= end) {
    if (targetJsDay.includes(cur.getDay())) {
      const key = cur.toISOString().split("T")[0];
      const [y, m, d] = key.split("-");
      result[key] = {
        status: "working",
        hasActiveJob: activeJobDates.has(`${d}/${m}/${y}`),
      };
    }
    cur.setDate(cur.getDate() + 1);
  }
  return result;
};

// ===== BLOCK CALENDAR MODAL =====
// FIX: dùng draftBlocked (local copy) thay vì trực tiếp contractBlockedDates.
// Nút "Đóng" → bỏ draft, không lưu. Nút "Lưu & Đóng" → gọi onSave(draft) rồi đóng.
const BlockCalendarModal = ({
  isOpen,
  onClose,
  contractBlockedDates,
  onSave,
  onGoToCancelFlow,
  calendarJobs,
  contractForm,
}) => {
  const [viewYear, setViewYear] = useState(null);
  const [viewMonth, setViewMonth] = useState(null);
  const [warningJob, setWarningJob] = useState(null);
  // Draft state — chỉ commit vào parent khi nhấn "Lưu & Đóng"
  const [draftBlocked, setDraftBlocked] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setWarningJob(null);
      return;
    }
    // Sync bản copy mỗi lần mở lại modal và đảm bảo hiển thị các ca làm việc từ calendarJobs
    const merged = { ...contractBlockedDates };
    calendarJobs.forEach((job) => {
      if (job && job.dateStr) {
        const parts = job.dateStr.split("/");
        if (parts.length === 3) {
          const [d, m, y] = parts;
          const isoKey = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
          merged[isoKey] = {
            status: merged[isoKey]?.status || "working",
            hasActiveJob: true
          };
        }
      }
    });
    setDraftBlocked(merged);
    if (contractForm.startDate) {
      const [y, m] = contractForm.startDate.split("-").map(Number);
      setViewYear(y);
      setViewMonth(m - 1);
    } else {
      const now = new Date(TODAY);
      setViewYear(now.getFullYear());
      setViewMonth(now.getMonth());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen || viewYear === null) return null;

  const monthNames = [
    "Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
    "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12",
  ];
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (y, m) => new Date(y, m, 1).getDay();

  const contractStart = contractForm.startDate ? new Date(contractForm.startDate) : null;
  const contractEnd = contractForm.endDate ? new Date(contractForm.endDate) : null;
  const canGoPrev = contractStart
    ? new Date(viewYear, viewMonth, 1) > new Date(contractStart.getFullYear(), contractStart.getMonth(), 1)
    : true;
  const canGoNext = contractEnd
    ? new Date(viewYear, viewMonth, 1) < new Date(contractEnd.getFullYear(), contractEnd.getMonth(), 1)
    : true;

  const prevMonth = () => {
    if (!canGoPrev) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (!canGoNext) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDay(viewYear, viewMonth);
  const blanks = Array(firstDay).fill(null);

  // Thống kê tháng hiện tại từ draft
  const monthKeys = Object.keys(draftBlocked).filter((k) => {
    const [y, m] = k.split("-").map(Number);
    return y === viewYear && m - 1 === viewMonth;
  });
  const blockedCount = monthKeys.filter((k) => draftBlocked[k].status === "blocked").length;
  const workingCount = monthKeys.filter((k) => draftBlocked[k].status === "working").length;

  const getDayInfo = (day) => {
    const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    let info = draftBlocked[dateKey];
    if (!info) {
      const [y, m, d] = dateKey.split("-");
      const displayDate = `${d}/${m}/${y}`;
      const hasJob = calendarJobs.some((j) => j.dateStr === displayDate);
      if (hasJob) {
        return { status: "working", hasActiveJob: true };
      }
      const checkDate = new Date(viewYear, viewMonth, day);
      const todayDate = new Date(TODAY);
      todayDate.setHours(0,0,0,0);
      if (checkDate >= todayDate) {
        return { status: "working", hasActiveJob: false };
      }
    }
    return info;
  };

  const handleDayClick = (day) => {
    const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const info = getDayInfo(day);
    if (!info) return;
    if (info.hasActiveJob) {
      const [y, m, d] = dateKey.split("-");
      const displayDate = `${d}/${m}/${y}`;
      const job = calendarJobs.find((j) => j.dateStr === displayDate) || {
        id: "CA_CHOT",
        dateStr: displayDate,
        service: "Ca làm việc đã nhận",
        customer: "Khách hàng của bạn",
        time: "Giờ hành chính",
        bookingType: "SINGLE",
        price: "0đ"
      };
      setWarningJob(job);
      return;
    }
    // Toggle trong draft, không đụng state cha
    setDraftBlocked((prev) => {
      const cur = prev[dateKey] || getDayInfo(day);
      if (!cur || cur.hasActiveJob) return prev;
      return {
        ...prev,
        [dateKey]: { ...cur, status: cur.status === "working" ? "blocked" : "working" },
      };
    });
  };

  const getDayStyle = (day) => {
    const info = getDayInfo(day);
    if (!info) return { cls: "text-slate-300 cursor-default text-opacity-50", dot: null };
    if (info.hasActiveJob)
      return { cls: "bg-amber-50 text-amber-800 border border-amber-300 cursor-pointer hover:bg-amber-100 font-bold", dot: "bg-amber-500" };
    if (info.status === "blocked")
      return { cls: "bg-rose-100 text-rose-800 border border-rose-300 cursor-pointer hover:bg-rose-200 font-bold", dot: "bg-rose-500" };
    return { cls: "bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-pointer hover:bg-emerald-100 font-bold", dot: "bg-emerald-400" };
  };

  const today = new Date(TODAY);
  const isToday = (day) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

  const allBlocked = Object.entries(draftBlocked)
    .filter(([, v]) => v.status === "blocked")
    .map(([k]) => k)
    .sort();

  const handleSaveAndClose = () => {
    onSave(draftBlocked);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 flex flex-col max-h-[92vh]">

        {/* HEADER */}
        <div className="bg-slate-900 p-3.5 text-white flex items-center justify-between rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="material-symbols-outlined text-amber-400 text-base">event_busy</span>
            Quản lý lịch bận cá nhân
          </div>
          <button
            onClick={onClose}
            className="material-symbols-outlined text-sm hover:text-slate-300 transition-colors"
          >
            close
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4 text-xs">

          {/* CHÚ THÍCH */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-50 border border-emerald-300 shrink-0"></span>
              <span className="text-slate-600 font-semibold">Ngày rảnh</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-100 border border-rose-300 shrink-0"></span>
              <span className="text-slate-600 font-semibold">Đã khóa bận</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-50 border border-amber-300 shrink-0"></span>
              <span className="text-slate-600 font-semibold">Có ca chốt</span>
            </div>
            <div className="col-span-3 text-[10px] text-slate-400 pt-1 border-t border-slate-200 mt-0.5">
              Ngày mờ = ngoài hợp đồng · Click ngày rảnh → khóa · Click đã khóa → mở lại
            </div>
          </div>

          {/* CẢNH BÁO ngày có ca chốt */}
          {warningJob && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 space-y-2">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-600 text-base shrink-0 mt-0.5">warning</span>
                <div className="space-y-1">
                  <p className="font-bold text-amber-900 text-[11px] uppercase tracking-wide">
                    Ngày này có ca đang chốt!
                  </p>
                  <p className="text-amber-800 leading-relaxed">
                    Ca <strong>{warningJob.id}</strong> — {warningJob.service} — ngày{" "}
                    <strong>{warningJob.dateStr}</strong> đang được giao cho bạn.
                  </p>
                  <p className="text-amber-700 leading-relaxed">
                    Để khóa ngày này, bạn cần <strong>hủy ca trước</strong> (sẽ chịu phí hủy nếu có).
                    Hệ thống không tự động hủy ca.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setWarningJob(null)}
                  className="flex-1 py-1.5 rounded-lg font-bold border border-amber-300 text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  Đóng
                </button>
                {warningJob.id !== "?" && (
                  <button
                    onClick={() => { setWarningJob(null); onGoToCancelFlow(warningJob); }}
                    className="flex-1 py-1.5 rounded-lg font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                  >
                    Đi đến Hủy ca
                  </button>
                )}
              </div>
            </div>
          )}

          {/* THỐNG KÊ THÁNG */}
          {monthKeys.length > 0 && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                <p className="text-base font-black text-slate-700">{monthKeys.length}</p>
                <p className="text-[10px] text-slate-400 font-medium">Ca trong HĐ</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-100">
                <p className="text-base font-black text-emerald-700">{workingCount}</p>
                <p className="text-[10px] text-emerald-600 font-medium">Ngày rảnh</p>
              </div>
              <div className="bg-rose-50 rounded-xl p-2.5 border border-rose-100">
                <p className="text-base font-black text-rose-700">{blockedCount}</p>
                <p className="text-[10px] text-rose-600 font-medium">Đã khóa</p>
              </div>
            </div>
          )}

          {/* CALENDAR GRID */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
              <button
                onClick={prevMonth}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors text-white ${canGoPrev ? "hover:bg-slate-700" : "opacity-25 cursor-not-allowed"}`}
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <div className="text-center">
                <span className="text-white font-bold text-sm">
                  {monthNames[viewMonth]} {viewYear}
                </span>
                <p className="text-slate-400 text-[10px] mt-0.5">
                  HĐ: {contractForm.startDate?.split("-").reverse().join("/")} →{" "}
                  {contractForm.endDate?.split("-").reverse().join("/")}
                </p>
              </div>
              <button
                onClick={nextMonth}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors text-white ${canGoNext ? "hover:bg-slate-700" : "opacity-25 cursor-not-allowed"}`}
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
            <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
              {dayNames.map((d) => (
                <div key={d} className="text-center py-2 text-[10px] font-black text-slate-400 uppercase">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 p-2 gap-1">
              {blanks.map((_, i) => <div key={`b${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const { cls, dot } = getDayStyle(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className={`h-10 w-full rounded-xl text-[11px] transition-all flex flex-col items-center justify-center gap-0.5 ${cls} ${isToday(day) ? "ring-2 ring-slate-400 ring-offset-1" : ""}`}
                  >
                    <span>{day}</span>
                    {dot && <span className={`w-1 h-1 rounded-full ${dot}`}></span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DANH SÁCH NGÀY ĐÃ KHÓA */}
          {allBlocked.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-2">
              <p className="text-[10px] font-black text-rose-700 uppercase tracking-wide flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">block</span>
                Tất cả ngày đã khóa ({allBlocked.length})
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {allBlocked.map((k) => {
                  const [y, m, d] = k.split("-");
                  return (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1 bg-white border border-rose-200 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-md"
                    >
                      {d}/{m}/{y}
                      <button
                        type="button"
                        onClick={() =>
                          setDraftBlocked((prev) => ({
                            ...prev,
                            [k]: { ...prev[k], status: "working" },
                          }))
                        }
                        title="Mở lại ngày này"
                        className="text-rose-400 hover:text-rose-700 transition-colors leading-none"
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    </span>
                  );
                })}
              </div>
              <p className="text-[10px] text-rose-500">Click × để mở lại từng ngày</p>
            </div>
          )}

          {/* GHI CHÚ DB */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 text-[11px] text-blue-800 flex items-start gap-2">
            <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">info</span>
            <span>
              Thay đổi lưu vào <strong>LichCamKet_Block</strong>. Scheduler đọc bảng này trước khi đẩy
              đơn tự động — ngày nào bị khóa sẽ không nhận đơn mới.
            </span>
          </div>
        </div>

        {/* FOOTER — Đóng không lưu, Lưu & Đóng mới commit */}
        <div className="p-4 border-t border-slate-100 flex gap-2 justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
          >
            Đóng
          </button>
          <button
            onClick={handleSaveAndClose}
            className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors text-sm"
          >
            Lưu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== CANCEL JOB MODAL =====
const CancelJobModal = ({ isOpen, onClose, job, cancelType, onConfirmCancel }) => {
  const [selectedReason, setSelectedReason] = useState("Sức khỏe đột xuất không đảm bảo");
  const [customNote, setCustomNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statsData, setStatsData] = useState({ count: 0, list: [] });

  // Tính ngày cuối tháng
  const currentSim = TODAY ? new Date(TODAY) : new Date();
  const currentMonth = currentSim.getMonth() + 1;
  const currentYear = currentSim.getFullYear();
  const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();

  useEffect(() => {
    if (isOpen) {
      nhanVienApi
        .getCancelStatistics({ month: currentMonth, year: currentYear })
        .then((res) => {
          if (res && res.success) {
            setStatsData({ count: res.count || 0, list: res.data || [] });
          }
        })
        .catch((e) => console.error("Lỗi tải thống kê hủy:", e));
    }
  }, [isOpen, currentMonth, currentYear]);

  if (!isOpen || !job) return null;

  const cancelCount = statsData.count;
  const isOverLimit = cancelCount >= 5;

  const quickReasons = [
    "Sức khỏe đột xuất không đảm bảo",
    "Phương tiện di chuyển gặp sự cố trên đường",
    "Gia đình có việc khẩn cấp đột xuất",
    "Khách hàng đề nghị dời/hủy lịch",
    "Lý do cá nhân khác",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalReason = customNote ? `${selectedReason} - Chi tiết: ${customNote}` : selectedReason;
    setIsSubmitting(true);
    await onConfirmCancel(job, cancelType, finalReason);
    setIsSubmitting(false);
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[999999] p-4 animate-in fade-in duration-200" style={{ pointerEvents: "all" }}>
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-rose-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl">warning</span>
            <div>
              <h3 className="font-bold text-base">
                {cancelType === "CONTRACT" ? "Yêu cầu Hủy toàn bộ Hợp đồng" : "Yêu cầu Hủy ca làm việc"}
              </h3>
              <p className="text-[11px] text-rose-100">
                Dữ liệu sẽ được tạo và lưu vào bảng YeuCauXuLy
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-rose-700 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Thông tin ca cần hủy */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Đơn dịch vụ</span>
              <span className="font-black text-rose-600 text-xs">Mã #{job.id}</span>
            </div>
            <p className="font-extrabold text-slate-800 text-sm">{job.service}</p>
            <p className="text-slate-600 font-medium">Khách hàng: <strong>{job.customer}</strong> · {job.dateStr} ({job.time})</p>
          </div>

          {/* Cảnh báo số lần hủy lịch trong tháng từ YeuCauXuLy */}
          <div className={`p-4 rounded-2xl border space-y-2.5 ${isOverLimit ? "bg-rose-50 border-rose-300" : "bg-amber-50 border-amber-200"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-extrabold text-sm text-slate-800">
                <span className="material-symbols-outlined text-amber-600">history</span>
                <span>Thống kê hủy ca tháng {currentMonth}/{currentYear} (Từ 01/{String(currentMonth).padStart(2, "0")} đến {lastDayOfMonth}/{String(currentMonth).padStart(2, "0")})</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full font-black text-xs ${isOverLimit ? "bg-rose-600 text-white" : "bg-amber-500 text-white"}`}>
                Đã hủy: {cancelCount} ca
              </span>
            </div>

            {/* Bảng chi tiết từ YeuCauXuLy */}
            {cancelCount > 0 ? (
              <div className="bg-white/90 rounded-xl p-2.5 border border-slate-200 max-h-40 overflow-y-auto space-y-2">
                {statsData.list.map((c, idx) => (
                  <div key={c.id || idx} className="text-[11px] text-slate-700 border-b border-slate-100 last:border-0 pb-2 space-y-0.5">
                    <div className="flex justify-between items-center font-extrabold text-slate-800">
                      <span>#{c.id} · {c.loai_cap_do_yeu_cau} ({c.loai_cap_do_yeu_cau === "CaLam" ? `ca_lam_id: ${c.ca_lam_viec_id}` : `don_hang_id: ${c.don_hang_id}`})</span>
                      <span className="text-[10px] text-slate-400">{c.thoi_gian}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Loại: <strong className="text-rose-600">{c.loai_yeu_cau}</strong></span>
                      <span>Duyệt: <strong className="text-emerald-600">{c.trang_thai_duyet}</strong></span>
                    </div>
                    <p className="text-slate-600 italic">Lý do: &ldquo;{c.ly_do}&rdquo;</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 text-[11px] italic">Bạn chưa hủy ca nào trong tháng {currentMonth}/{currentYear} (từ ngày 01 đến {lastDayOfMonth}).</p>
            )}

            {/* Cảnh báo khóa tài khoản nếu >= 5 */}
            <div className="pt-1 border-t border-amber-200/60">
              {cancelCount >= 5 ? (
                <p className="text-rose-700 font-extrabold leading-relaxed flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-base shrink-0 mt-0.5">gpp_bad</span>
                  <span>
                    CẢNH BÁO NGHIÊM TRỌNG: Bạn đã hủy {cancelCount} ca trong tháng! Nếu tiếp tục vượt quá 5 ca, hệ thống sẽ cảnh báo vi phạm và KHÓA TÀI KHOẢN nhân viên.
                  </span>
                </p>
              ) : (
                <p className="text-amber-800 font-medium leading-relaxed">
                  Quy định hệ thống: Nhân viên hủy quá 5 ca làm việc trong 1 tháng sẽ bị cảnh báo và khóa tài khoản tạm thời.
                </p>
              )}
            </div>
          </div>

          {/* Chọn lý do hủy */}
          <div className="space-y-2">
            <label className="block font-extrabold text-slate-700 uppercase tracking-wide text-[11px]">
              Chọn lý do hủy lịch <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {quickReasons.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setSelectedReason(r)}
                  className={`text-left px-3.5 py-2 rounded-xl border font-semibold transition-all flex items-center justify-between ${
                    selectedReason === r
                      ? "bg-rose-50 border-rose-500 text-rose-800 ring-1 ring-rose-400"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{r}</span>
                  {selectedReason === r && <span className="material-symbols-outlined text-rose-600 text-sm">check_circle</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Ghi chú thêm lý do */}
          <div className="space-y-1.5">
            <label className="block font-extrabold text-slate-700 uppercase tracking-wide text-[11px]">
              Ghi chú chi tiết lý do (Tùy chọn)
            </label>
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Nhập thêm mô tả chi tiết nếu cần..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 text-slate-800 text-xs font-medium"
            />
          </div>

          {/* Footer */}
          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl transition-all"
            >
              Đóng / Giữ lại lịch
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Đang gửi yêu cầu...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">send</span>
                  <span>Xác nhận Hủy ca</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

// ===== REJECT OFFER MODAL (TỪ CHỐI LỊCH CHỈ ĐỊNH) =====
const RejectOfferModal = ({ isOpen, onClose, onConfirm, isSubmitting }) => {
  const REJECT_REASONS = [
    "Trùng lịch làm việc / bận việc đột xuất",
    "Khoảng cách di chuyển quá xa so với vị trí hiện tại",
    "Thời gian bắt đầu ca làm không phù hợp",
    "Sức khỏe cá nhân không đảm bảo",
    "Khác (Nhập lý do cụ thể)"
  ];
  const [selectedReason, setSelectedReason] = useState(REJECT_REASONS[0]);
  const [customReason, setCustomReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalReason = selectedReason === "Khác (Nhập lý do cụ thể)"
      ? (customReason.trim() || "Lý do cá nhân khác")
      : selectedReason;
    onConfirm(finalReason);
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" style={{ pointerEvents: "all" }}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl">warning</span>
            <div>
              <h3 className="font-bold text-base">Từ chối lịch chỉ định</h3>
              <p className="text-[11px] text-amber-100">Chọn lý do từ chối đơn lịch này</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Lý do từ chối của bạn sẽ được đính kèm vào thông báo gửi đến Khách hàng để giải thích nguyên nhân.
          </p>

          <div className="space-y-2">
            {REJECT_REASONS.map((reason, idx) => (
              <label
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedReason === reason
                    ? "border-amber-500 bg-amber-50/60 font-bold text-slate-900 shadow-sm"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                }`}
              >
                <input
                  type="radio"
                  name="reject_reason"
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span className="text-xs">{reason}</span>
              </label>
            ))}
          </div>

          {selectedReason === "Khác (Nhập lý do cụ thể)" && (
            <div>
              <textarea
                rows={3}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Nhập chi tiết lý do từ chối của bạn..."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? "Đang xử lý..." : "Xác nhận từ chối"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};


// ===== NOTIFICATION MODAL =====
const NotificationModal = ({ isOpen, onClose, title, message, type }) => {
  if (!isOpen) return null;
  
  const getIconAndColors = () => {
    switch (type) {
      case "success":
        return {
          icon: "check_circle",
          iconBg: "bg-emerald-100 text-emerald-600 border border-emerald-200",
          btnBg: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25",
        };
      case "error":
        return {
          icon: "error",
          iconBg: "bg-rose-100 text-rose-600 border border-rose-200",
          btnBg: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/25",
        };
      case "warning":
        return {
          icon: "warning",
          iconBg: "bg-amber-100 text-amber-600 border border-amber-200",
          btnBg: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/25",
        };
      default:
        return {
          icon: "info",
          iconBg: "bg-blue-100 text-blue-600 border border-blue-200",
          btnBg: "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/25",
        };
    }
  };

  const { icon, iconBg, btnBg } = getIconAndColors();

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[999999] p-4 animate-in fade-in duration-200" style={{ pointerEvents: "all" }}>
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full overflow-hidden transform transition-all scale-100 p-6 text-center space-y-4"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-inner ${iconBg}`}>
          <span className="material-symbols-outlined text-3xl font-bold">{icon}</span>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-black text-slate-800 tracking-tight">{title}</h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line font-medium px-2">
            {message}
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className={`w-full py-3 px-6 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${btnBg}`}
          >
            <span>Đã hiểu & Đóng</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ===== MAIN COMPONENT =====
const ScheduleManager = () => {
  const { simulatedTime } = useSimulatedTime();
  if (simulatedTime) TODAY = simulatedTime;

  const [isSimulateGPS, setIsSimulateGPS] = useState(true); // Mặc định bật chế độ giả lập GPS khi Demo trên lớp
  const [staffProfile, setStaffProfile] = useState(null); // Lưu thông tin nhân viên & tọa độ nhà riêng
  const [notifyModal, setNotifyModal] = useState({ isOpen: false, title: "", message: "", type: "info" });
  const [cancelModalState, setCancelModalState] = useState({
    isOpen: false,
    job: null,
    cancelType: "SINGLE",
  });
  const [rejectOfferModal, setRejectOfferModal] = useState({
    isOpen: false,
    jobId: null,
    isSubmitting: false,
  });

  const alert = (msg) => {
    let type = "info";
    let title = "Thông báo từ hệ thống";
    if (typeof msg === "string") {
      const lower = msg.toLowerCase();
      if (lower.includes("❌") || lower.includes("từ chối") || lower.includes("xung đột") || lower.includes("bị trùng") || lower.includes("lỗi") || lower.includes("thất bại") || lower.includes("không được") || lower.includes("vui lòng") || lower.includes("tối đa")) {
        type = lower.includes("❌") || lower.includes("từ chối") || lower.includes("xung đột") || lower.includes("lỗi") ? "error" : "warning";
        title = "Lưu ý từ hệ thống";
      } else if (lower.includes("thành công") || lower.includes("[thành công]") || (lower.includes("đã ") && !lower.includes("đã có ca") && !lower.includes("đã nhận trước đó"))) {
        type = "success";
        title = "Thao tác thành công";
      }
    }
    setNotifyModal({ isOpen: true, title, message: msg, type });
  };

  const [activeTab, setActiveTab] = useState("calendar");
  const [hasRegisteredContract, setHasRegisteredContract] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isEditContractMode, setIsEditContractMode] = useState(false);

  const generateTimelineDays = () => {
    const days = [];
    const t = new Date(TODAY);
    const dayNames = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(t);
      d.setDate(t.getDate() + i);
      const dateStr = String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear();
      days.push({
        dateStr,
        label: dayNames[d.getDay()],
        isToday: i === 0,
        status: "available",
      });
    }
    return days;
  };

  const [calendarJobs, setCalendarJobs] = useState([]);
  const [jobOffers, setJobOffers] = useState([]);
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [jobHistory, setJobHistory] = useState([]);

  const [timelineDays, setTimelineDays] = useState(() => generateTimelineDays());
  const [selectedDate, setSelectedDate] = useState(() => generateTimelineDays()[0].dateStr);

  // 1. Khi simulatedTime thay đổi -> reset ngày được chọn về ngày đầu tiên của tuần giả lập
  useEffect(() => {
    if (simulatedTime) {
      TODAY = simulatedTime;
      const newDays = generateTimelineDays();
      setSelectedDate(newDays[0].dateStr);
    }
  }, [simulatedTime]);

  // 2. Khi simulatedTime hoặc calendarJobs (do polling 10s tải mới) thay đổi -> chỉ cập nhật trạng thái có ca làm (has-jobs) trên timelineDays mà KHÔNG reset selectedDate
  useEffect(() => {
    if (simulatedTime) {
      TODAY = simulatedTime;
      const newDays = generateTimelineDays();
      const activeJobDates = new Set(calendarJobs.map((j) => j.dateStr));
      setTimelineDays(newDays.map(d => ({
        ...d,
        status: activeJobDates.has(d.dateStr) ? "has-jobs" : "available"
      })));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulatedTime, calendarJobs]);

  const [contractForm, setContractForm] = useState(() => {
    const minStart = new Date(TODAY);
    minStart.setDate(minStart.getDate() + 4);
    const minStartStr = minStart.toISOString().split("T")[0];

    const minEnd = new Date(minStart);
    minEnd.setMonth(minEnd.getMonth() + 2);
    const minEndStr = minEnd.toISOString().split("T")[0];

    return {
      startDate: minStartStr,
      endDate: minEndStr,
      daysOff: [],
      restSession: "none",
    };
  });
  const [formError, setFormError] = useState("");

  const [contractBlockedDates, setContractBlockedDates] = useState({});

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelTargetJob, setCancelTargetJob] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelType, setCancelType] = useState("one_shift");
  const [cancelDateRange, setCancelDateRange] = useState({ from: "", to: "" });
  const [isBlockCalendarOpen, setIsBlockCalendarOpen] = useState(false);
  

  const [selectedJob, setSelectedJob] = useState(null);

  // ── Logic helpers ──────────────────────────────────────────────────────────
  const parseTimeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const formatMinutesToTime = (minutes) => {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };



  const mapCaLamViecToFrontend = (ca, orderCounts = {}) => {
    const formatDateStr = (dateString) => {
        if (!dateString) return "";
        const parts = dateString.split("-");
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateString;
    };

    let dateStr = formatDateStr(ca.ngay_lam);
    if (ca.is_package) {
        dateStr = `Từ ${formatDateStr(ca.ngay_lam_start)} đến ${formatDateStr(ca.ngay_lam_end)}`;
    }
    
    let district = "TP.HCM";
    if (ca.dia_chi_lam_viec) {
      const addrParts = ca.dia_chi_lam_viec.split(',');
      if (addrParts.length > 1) {
        district = addrParts[addrParts.length - 2].trim();
      }
    }

    let bookingType = ca.don_hang?.is_lap_lai_hang_tuan ? 'RECURRING' : (ca.loai_goi_ca_lam === 'CaLe' ? 'SINGLE' : (ca.loai_goi_ca_lam === 'GoiThang' ? 'MONTHLY' : '247'));
    let totalSessions = ca.don_hang?.tong_so_buoi;
    let viTriCa = ca.vi_tri_ca;

    // Nếu đây không phải là gói (is_package !== true) và nhân viên chỉ có số ca rất ít so với tổng gói (hoặc chỉ có 1 ca)
    // thì hiển thị như ca lẻ (1 buổi), tránh hiện "Ca 21/50 Gói tháng" gây hiểu lầm cho nhân viên nhận lẻ
    if (!ca.is_package && !String(ca.id).startsWith("PACKAGE_") && (orderCounts[ca.don_hang_id] <= 1 || (ca.don_hang?.tong_so_buoi && orderCounts[ca.don_hang_id] < ca.don_hang.tong_so_buoi * 0.5))) {
      bookingType = 'SINGLE';
      totalSessions = 1;
      viTriCa = 1;
    }

    return {
        id: ca.id,
        don_hang_id: ca.don_hang_id,
        latKhach: ca.don_hang?.vi_do || null,
        lngKhach: ca.don_hang?.kinh_do || null,
        type: ca.trang_thai_ca === 'ChoNhanVienChiDinhXacNhan' ? 'DIRECT' : (ca.loai_ghep === 'TuDong' ? 'AUTO' : 'FREELANCE'),
        customer: ca.don_hang?.ho_ten_thuc_te || ca.don_hang?.khach_hang?.tai_khoan?.ho_ten,
        phone: ca.don_hang?.sdt_thuc_te || ca.don_hang?.khach_hang?.tai_khoan?.so_dien_thoai,
        dateStr: dateStr,
        time: ca.gio_bat_dau ? `${ca.gio_bat_dau.slice(0,5)} - ${formatMinutesToTime(parseTimeToMinutes(ca.gio_bat_dau.slice(0,5)) + ca.thoi_gian_lam_phut)}` : "",
        address: ca.dia_chi_lam_viec,
        service: ca.dich_vu?.ten_dich_vu || ca.don_hang?.dich_vu_loai_goi?.dich_vu?.ten_dich_vu,
        bookingType: bookingType,
        status: ca.trang_thai_ca === 'DaNhan' ? 'Sắp diễn ra' : (ca.trang_thai_ca === 'DangThucHien' ? 'Đang làm' : ca.trang_thai_ca),
        price: `${Number(ca.thuc_nhan_nv).toLocaleString('vi-VN')}đ`,
        duration: ca.is_package ? `${ca.so_ca_kha_dung} ca` : (ca.thoi_gian_lam_phut ? `${Math.round(ca.thoi_gian_lam_phut / 60)} tiếng` : ""),
        staffCount: 1, 
        jobNote: ca.don_hang?.ghi_chu_cho_nhan_vien,
        totalSessions: totalSessions,
        vi_tri_ca: viTriCa,
        daysOfWeek: (() => {
            if (!ca.don_hang?.cac_ngay_trong_tuan) return null;
            const dayMap = {
                mon: "Thứ 2", tue: "Thứ 3", wed: "Thứ 4", thu: "Thứ 5",
                fri: "Thứ 6", sat: "Thứ 7", sun: "Chủ nhật"
            };
            const sortOrder = {
                mon: 1, tue: 2, wed: 3, thu: 4,
                fri: 5, sat: 6, sun: 7
            };
            const daysArray = ca.don_hang.cac_ngay_trong_tuan.split(",").map(d => d.trim().toLowerCase());
            daysArray.sort((a, b) => (sortOrder[a] || 99) - (sortOrder[b] || 99));
            return daysArray.map(d => dayMap[d] || d).join(", ");
        })(),
        district: district,
        paymentMethod: ca.don_hang?.phuong_thuc_tt,
        trang_thai_ca: ca.trang_thai_ca,
        rawDate: ca.ngay_lam,
        rawStartTime: ca.gio_bat_dau,
        durationMinutes: ca.thoi_gian_lam_phut || 120,
        ca_lam_247: ca.don_hang?.ca_lam_247,
        dichVuThem: (() => {
            if (!ca.chi_tiet_dich_vu_them) return null;
            try {
                const arr = JSON.parse(ca.chi_tiet_dich_vu_them);
                return arr.map(item => item.ten).join(', ');
            } catch (e) {
                return ca.chi_tiet_dich_vu_them;
            }
        })()
    };
  };

  const fetchJobsData = async () => {
    try {
      const [resAvail, resAccept, resWork, resHist, resProfile] = await Promise.all([
         nhanVienApi.getAvailableJobs(),
         nhanVienApi.getAcceptedJobs(),
         nhanVienApi.getWorkingSchedule(),
         nhanVienApi.getJobHistory(),
         nhanVienApi.getProfile()
      ]);
      
      if (resProfile && resProfile.success) {
        setStaffProfile(resProfile.data);
      }

      const availData = resAvail && resAvail.success ? resAvail.data : [];
      const acceptData = resAccept && resAccept.success ? resAccept.data : [];
      const workData = resWork && resWork.success ? resWork.data : [];
      const histData = resHist && resHist.success ? resHist.data : [];

      // Dùng Map loại bỏ trùng lặp id vì ca "Đã nhận" sẽ xuất hiện ở cả acceptData và workData
      const uniqueShiftsMap = new Map();
      [...availData, ...acceptData, ...workData, ...histData].forEach((item) => {
        if (item && item.id && !uniqueShiftsMap.has(item.id)) {
          uniqueShiftsMap.set(item.id, item);
        }
      });

      const orderCounts = {};
      uniqueShiftsMap.forEach((item) => {
        if (item && item.don_hang_id) {
          orderCounts[item.don_hang_id] = (orderCounts[item.don_hang_id] || 0) + (item.is_package ? (item.so_ca_kha_dung || 2) : 1);
        }
      });

      setJobOffers(availData.map((ca) => mapCaLamViecToFrontend(ca, orderCounts)));
      setAcceptedJobs(acceptData.map((ca) => mapCaLamViecToFrontend(ca, orderCounts)));
      setCalendarJobs(workData.map((ca) => mapCaLamViecToFrontend(ca, orderCounts)));
      setJobHistory(histData.map((ca) => mapCaLamViecToFrontend(ca, orderCounts)));
    } catch (e) {
      console.error("Lỗi fetch dữ liệu ca làm việc:", e);
    }
  };

  useEffect(() => {
    fetchJobsData();
    const interval = setInterval(fetchJobsData, 10000); // Polling ngầm mỗi 10 giây cho trang lịch làm việc
    const handleFocus = () => fetchJobsData();
    window.addEventListener("focus", handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch Hợp đồng Lịch Nghỉ khi mount
  const fetchCamKet = async () => {
      try {
        const res = await nhanVienApi.getCamKetLichNghi();
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const list = res.data;
          const first = list[0];
          
          if (first.ngay_ket_thuc_ap_dung) {
            const endDate = new Date(first.ngay_ket_thuc_ap_dung);
            const now = new Date(TODAY);
            endDate.setHours(0, 0, 0, 0);
            now.setHours(0, 0, 0, 0);
            
            if (endDate < now) {
              setHasRegisteredContract(false);
              return;
            }
          }
          
          setHasRegisteredContract(true);
          
          // Reverse Parse
          const dayMapInverse = { 0: "Chủ Nhật", 1: "Thứ 2", 2: "Thứ 3", 3: "Thứ 4", 4: "Thứ 5", 5: "Thứ 6", 6: "Thứ 7" };
          const offDays = list.filter(x => x.thu_trong_tuan !== null).map(x => dayMapInverse[x.thu_trong_tuan]);
          
          let restSessionParsed = "none";
          const gapList = list.filter(x => x.gio_bat_dau_nghi !== null);
          if (gapList.length > 0) {
            const gap = gapList[0];
            const start = gap.gio_bat_dau_nghi.slice(0, 5);
            if (start === "06:00") restSessionParsed = "morning";
            else if (start === "13:00") restSessionParsed = "afternoon";
            else if (start === "17:00") restSessionParsed = "evening";
          }
          
          setContractForm(prev => ({
             ...prev,
             startDate: first.ngay_bat_dau_ap_dung,
             endDate: first.ngay_ket_thuc_ap_dung,
             daysOff: offDays,
             restSession: restSessionParsed
          }));
          
          const workingDaysForBlock = VI_DAYS.filter(d => !offDays.includes(d));
          const generated = generateContractDays(first.ngay_bat_dau_ap_dung, first.ngay_ket_thuc_ap_dung, workingDaysForBlock, calendarJobs);
          try {
            const resBlocked = await nhanVienApi.getBlockedDates();
            if (resBlocked && resBlocked.success && Array.isArray(resBlocked.data)) {
              resBlocked.data.forEach(dStr => {
                if (!generated[dStr]) {
                  generated[dStr] = { status: "blocked", hasActiveJob: false };
                } else {
                  generated[dStr].status = "blocked";
                }
              });
            }
          } catch (e) {
            console.error("Lỗi fetch ngày khóa:", e);
          }
          setContractBlockedDates(generated);
        } else {
          setHasRegisteredContract(false);
          try {
            const resBlocked = await nhanVienApi.getBlockedDates();
            const generated = {};
            if (resBlocked && resBlocked.success && Array.isArray(resBlocked.data)) {
              resBlocked.data.forEach(dStr => {
                generated[dStr] = { status: "blocked", hasActiveJob: false };
              });
            }
            setContractBlockedDates(generated);
          } catch (e) {
            console.error("Lỗi fetch ngày khóa cho staff tự do:", e);
          }
        }
      } catch (err) {
        console.error("Lỗi fetch hợp đồng:", err);
      }
    };
  
  const handleSaveBlockedDates = async (draft) => {
    setContractBlockedDates(draft);
    const blockedList = Object.entries(draft)
      .filter(([, v]) => v.status === "blocked")
      .map(([k]) => k);
    try {
      const res = await nhanVienApi.saveBlockedDates(blockedList);
      if (res && res.success) {
        alert("Đã lưu lịch bận thành công!");
      }
    } catch (e) {
      console.error("Lỗi lưu lịch bận:", e);
      alert("Có lỗi khi lưu lịch bận xuống hệ thống!");
    }
  };

  useEffect(() => {
    fetchCamKet();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Sync hasActiveJob khi calendarJobs thay đổi
  useEffect(() => {
    const activeJobDates = new Set(calendarJobs.map((j) => j.dateStr));
    
    // Đồng bộ cho timelineDays
    setTimelineDays(prev => prev.map(d => ({
      ...d,
      status: activeJobDates.has(d.dateStr) ? "has-jobs" : "available"
    })));

    setContractBlockedDates((prev) => {
      const updated = { ...prev };
      let changed = false;
      Object.entries(updated).forEach(([k, v]) => {
        const [y, m, d] = k.split("-");
        const displayKey = `${d}/${m}/${y}`;
        const newHasActiveJob = activeJobDates.has(displayKey);
        if (v.hasActiveJob !== newHasActiveJob) {
          updated[k] = { ...v, hasActiveJob: newHasActiveJob };
          changed = true;
        }
      });
      calendarJobs.forEach((job) => {
        if (job && job.dateStr) {
          const parts = job.dateStr.split("/");
          if (parts.length === 3) {
            const [d, m, y] = parts;
            const isoKey = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
            if (!updated[isoKey] || !updated[isoKey].hasActiveJob) {
              updated[isoKey] = {
                status: updated[isoKey]?.status || "working",
                hasActiveJob: true
              };
              changed = true;
            }
          }
        }
      });
      return changed ? updated : prev;
    });
  }, [calendarJobs]); // eslint-disable-line react-hooks/exhaustive-deps



  const handleCancelAcceptedJob = (id) => {
    const job =
      acceptedJobs.find((j) => j.id === id) ||
      calendarJobs.find((j) => j.id === id) ||
      selectedJob;
    setCancelModalState({ isOpen: true, job: job || selectedJob, cancelType: "SINGLE" });
  };

  const handleCancelAcceptedPackage = (id) => {
    const job =
      acceptedJobs.find((j) => j.id === id) ||
      calendarJobs.find((j) => j.id === id) ||
      selectedJob;
    setCancelModalState({ isOpen: true, job: job || selectedJob, cancelType: "CONTRACT" });
  };

  const handleConfirmCancelFromModal = async (job, cancelType, reason) => {
    try {
      let res;
      if (cancelType === "CONTRACT") {
        res = await nhanVienApi.cancelContract(job.id, { ly_do: reason });
      } else {
        res = await nhanVienApi.cancelAcceptedJob(job.id, { ly_do: reason });
      }
      if (res && res.success) {
        alert(res.message || "Đã gửi yêu cầu hủy và tạo dữ liệu YeuCauXuLy thành công.");
        setCancelModalState({ isOpen: false, job: null, cancelType: "SINGLE" });
        fetchJobsData();
        setSelectedJob(null);
      } else {
        alert(res?.message || "Hủy ca thất bại");
      }
    } catch (e) {
      alert("Lỗi khi gửi yêu cầu hủy.");
    }
  };

  // Hàm tính khoảng cách Haversine giữa 2 tọa độ (trả về mét)
  const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
    const R = 6371000; // Bán kính trái đất tính bằng mét
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
  };

  const handleUpdateProgress = async (id) => {
    try {
      const res = await nhanVienApi.updateProgress(id);
      if (res && res.success) {
        alert(res.message);
        fetchJobsData();
        setSelectedJob(null);
      } else {
        alert(res?.message || "Cập nhật tiến độ thất bại");
      }
    } catch (e) {
      alert("Lỗi khi cập nhật tiến độ.");
    }
  };

  // Hàm chấm công / hoàn thành có kiểm tra hàng rào địa lý (GPS Geofencing)
  const handleUpdateProgressWithGPS = async (job) => {
    if (isSimulateGPS) {
      alert("🕹️ [CHẾ ĐỘ DEMO] Giả lập GPS: Nhân viên đang có mặt tại đúng tọa độ nhà khách hàng!\n\nĐang tiến hành xác nhận trạng thái ca làm...");
      await handleUpdateProgress(job.id);
      return;
    }

    if (!navigator.geolocation) {
      alert("❌ Trình duyệt của bạn không hỗ trợ định vị GPS!");
      return;
    }

    if (!job.latKhach || !job.lngKhach) {
      alert("⚠️ Đơn hàng này chưa có tọa độ nhà khách hàng trong dữ liệu.\nCho phép cập nhật tiến độ!");
      await handleUpdateProgress(job.id);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latThucTe = position.coords.latitude;
        const lngThucTe = position.coords.longitude;
        const latKhach = Number(job.latKhach);
        const lngKhach = Number(job.lngKhach);
        const khoangCach = calculateDistanceMeters(latThucTe, lngThucTe, latKhach, lngKhach);

        const khoangCachText = khoangCach >= 1000 
          ? `${(khoangCach / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} km`
          : `${khoangCach.toLocaleString('vi-VN')} mét`;

        // --- IN RA F12 CONSOLE ĐỂ KIỂM TRA TỌA ĐỘ RÕ RÀNG ---
        console.group("📍 [CleanTrust Geofencing] Kiểm tra vị trí GPS khi chấm công");
        console.log("👉 Đơn hàng ID:", job.id, "-", job.service);
        console.table({
          "🏠 Nhà Khách Hàng (Trong DB)": { "Vĩ độ (Lat)": latKhach, "Kinh độ (Lng)": lngKhach },
          "📱 GPS Nhân Viên (Thực tế)": { "Vĩ độ (Lat)": latThucTe, "Kinh độ (Lng)": lngThucTe },
        });
        console.log(`📏 Khoảng cách đo được (Haversine): ${khoangCachText} (${khoangCach} mét)`);
        console.log(`🗺️ Xem trên Google Maps: https://www.google.com/maps/dir/?api=1&origin=${latThucTe},${lngThucTe}&destination=${latKhach},${lngKhach}`);
        console.groupEnd();
        // ----------------------------------------------------

        // Bán kính chuẩn cho dịch vụ tại nhà: 200 mét
        if (khoangCach > 200) {
          alert(`❌ TỪ CHỐI CHẤM CÔNG / HOÀN THÀNH CA!\n\n📍 Vị trí GPS hiện tại của bạn cách nhà khách hàng đến ${khoangCachText} (${khoangCach.toLocaleString('vi-VN')}m).\n\n👉 Bạn bắt buộc phải có mặt tại nhà khách hàng (trong bán kính cho phép 200m) mới được bấm xác nhận!`);
          return;
        }

        alert(`✅ Định vị hợp lệ (cách nhà khách hàng ${khoangCachText}). Đang tiến hành cập nhật...`);
        await handleUpdateProgress(job.id);
      },
      (error) => {
        alert("❌ Bạn phải nhấn CHO PHÉP TRUY CẬP VỊ TRÍ (Allow Location) trên popup trình duyệt thì mới được bấm vào làm!");
      }
    );
  };

  // Thuật toán kiểm tra ràng buộc Không gian - Thời gian giữa các ca liền kề (Spatial-Temporal Feasibility Check)
  const checkSpatialTemporalFeasibility = (newJob) => {
    // Nếu đang bật giả lập Demo -> Cho qua
    if (isSimulateGPS) {
      console.log("🕹️ [Routing Bypass] Chế độ Demo đang bật -> Bỏ qua kiểm tra khoảng cách 6km khi nhận đơn.");
      return true;
    }

    const latNew = Number(newJob.latKhach);
    const lngNew = Number(newJob.lngKhach);
    if (!latNew || !lngNew) return true; // Đơn mới chưa có tọa độ -> Cho qua

    // Tìm danh sách các ca làm việc mà nhân viên ĐÃ NHẬN trong CÙNG NGÀY với đơn mới
    const sameDayShifts = [...acceptedJobs, ...calendarJobs].filter(
      (item) => (item.dateStr === newJob.dateStr || item.rawDate === newJob.rawDate) && item.id !== newJob.id
    );

    // =========================================================================
    // KỊCH BẢN 1: TRONG NGÀY ĐÓ CHƯA CÓ CA LÀM NÀO -> SO SÁNH VỚI ĐỊA CHỈ NHÀ NHÂN VIÊN
    // =========================================================================
    if (sameDayShifts.length === 0) {
      const latHome = Number(staffProfile?.vi_do);
      const lngHome = Number(staffProfile?.kinh_do);
      if (!latHome || !lngHome) return true; // Chưa có tọa độ nhà trong DB -> Cho qua

      const distFromHome = calculateDistanceMeters(latHome, lngHome, latNew, lngNew);
      const distKm = (distFromHome / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 });

      console.group(`📍 [CleanTrust Routing] Kiểm tra ca đầu tiên trong ngày (${newJob.dateStr})`);
      console.table({
        "🏠 Nhà Nhân Viên": { "Vĩ độ (Lat)": latHome, "Kinh độ (Lng)": lngHome },
        "🎯 Đơn Lịch Mới": { "Vĩ độ (Lat)": latNew, "Kinh độ (Lng)": lngNew },
      });
      console.log(`📏 Khoảng cách từ nhà tới đơn mới: ${distKm} km (${distFromHome}m)`);
      console.groupEnd();

      if (distFromHome > 6000) {
        alert(
          `❌ TỪ CHỐI NHẬN LỊCH — VƯỢT QUÁ BÁN KÍNH TỪ NHÀ!\n\n` +
          `📅 Ngày làm việc: ${newJob.dateStr}\n` +
          `📍 Khoảng cách từ địa chỉ nhà bạn tới nhà khách hàng này là: ${distKm} km (giới hạn cho phép <= 6km).\n\n` +
          `👉 Theo quy định nghiệp vụ, ca làm đầu tiên trong ngày không được vượt quá bán kính 6 km từ địa chỉ nhà nhân viên để đảm bảo sức khỏe và đi lại đúng giờ!`
        );
        return false;
      }
      return true;
    }

    // =========================================================================
    // KỊCH BẢN 2: TRONG NGÀY ĐÓ ĐÃ CÓ CA LÀM -> TÌM CA LIỀN KỀ GẦN NHẤT & SO SÁNH
    // =========================================================================
    const parseStartMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
    };

    const newStartMin = parseStartMinutes(newJob.rawStartTime);
    const newEndMin = newStartMin + (newJob.durationMinutes || 120);

    let closestShift = null;
    let minTimeGap = 999999;

    sameDayShifts.forEach((shift) => {
      const shiftStartMin = parseStartMinutes(shift.rawStartTime);
      const shiftEndMin = shiftStartMin + (shift.durationMinutes || 120);

      let gap = 999999;
      if (shiftEndMin <= newStartMin) {
        gap = newStartMin - shiftEndMin; // Ca liền kề trước
      } else if (newEndMin <= shiftStartMin) {
        gap = shiftStartMin - newEndMin; // Ca liền kề sau
      } else {
        gap = 0; // Trùng giờ nhau
      }

      if (gap < minTimeGap) {
        minTimeGap = gap;
        closestShift = shift;
      }
    });

    if (closestShift) {
      const latAdjacent = Number(closestShift.latKhach);
      const lngAdjacent = Number(closestShift.lngKhach);
      if (!latAdjacent || !lngAdjacent) return true;

      const distFromAdjacent = calculateDistanceMeters(latAdjacent, lngAdjacent, latNew, lngNew);
      const distKm = (distFromAdjacent / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 });
      const gapHoursText = minTimeGap === 0 
        ? "Trùng giờ làm việc" 
        : minTimeGap < 60 
          ? `${minTimeGap} phút` 
          : `${(minTimeGap / 60).toFixed(0)} tiếng`;

      console.group(`📍 [CleanTrust Routing] Kiểm tra ca liền kề trong ngày (${newJob.dateStr})`);
      console.log(`👉 Ca liền kề gần nhất: ID ${closestShift.id} (${closestShift.time})`);
      console.table({
        "🏢 Ca Liền Kề Trước/Sau": { "Vĩ độ (Lat)": latAdjacent, "Kinh độ (Lng)": lngAdjacent },
        "🎯 Đơn Lịch Mới": { "Vĩ độ (Lat)": latNew, "Kinh độ (Lng)": lngNew },
      });
      console.log(`📏 Khoảng cách giữa 2 ca: ${distKm} km (${distFromAdjacent}m) | Thời gian trống: ${gapHoursText}`);
      console.groupEnd();

      if (minTimeGap === 0) {
        alert(
          `❌ TỪ CHỐI NHẬN LỊCH — XUNG ĐỘT THỜI GIAN!\n\n` +
          `📅 Ngày làm việc: ${newJob.dateStr}\n` +
          `⏱️ Đơn lịch mới (${newJob.time}) đang bị trùng thời gian với ca làm bạn đã nhận trước đó (ID: ${closestShift.id}, giờ làm: ${closestShift.time}).\n\n` +
          `👉 Bạn không thể nhận 2 ca trùng giờ nhau!`
        );
        return false;
      }

      if (distFromAdjacent > 6000) {
        alert(
          `❌ TỪ CHỐI NHẬN LỊCH — RÀNG BUỘC DI CHUYỂN & THỜI GIAN!\n\n` +
          `📅 Ngày làm việc: ${newJob.dateStr}\n` +
          `🏢 Bạn đã có ca làm liền kề (ID: ${closestShift.id}, giờ làm: ${closestShift.time}).\n` +
          `📍 Khoảng cách từ địa điểm ca liền kề tới đơn lịch mới này là: ${distKm} km (giới hạn <= 6km).\n` +
          `⏱️ Thời gian trống giữa 2 ca chỉ có: ${gapHoursText}.\n\n` +
          `👉 Theo thuật toán định tuyến Không gian - Thời gian, khoảng cách > 6 km giữa 2 ca liền kề là quá xa, bạn không thể vừa chạy xe vừa nghỉ ngơi/ăn uống kịp giờ làm! Vui lòng chọn ca gần hơn (` + `<= 6km).`
        );
        return false;
      }
    }

    return true;
  };

  const handleAcceptOffer = async (job) => {
    // Kiểm tra ràng buộc Không gian - Thời gian trước khi gọi API nhận lịch
    if (!checkSpatialTemporalFeasibility(job)) {
      return; // Dừng lại nếu vi phạm điều kiện bán kính <= 6km / ca liền kề
    }

    try {
      const res = await nhanVienApi.acceptJob(job.id);
      if (res && res.success) {
        alert(`[Thành công] Bạn đã nhận đơn lịch ${job.id}.\nĐơn đã được thêm vào "Lịch đã nhận" và đồng bộ sang "Lịch làm việc".`);
        fetchJobsData(); // Cập nhật lại 3 danh sách
        setSelectedJob(null);
      } else {
        alert(res?.message || "Nhận lịch thất bại");
      }
    } catch (e) {
      const errorMsg = e?.message || "Lỗi khi nhận lịch. Có thể lịch này không còn khả dụng.";
      alert(errorMsg);
    }
  };

  const handleRejectOffer = (id) => {
    setRejectOfferModal({
      isOpen: true,
      jobId: id,
      isSubmitting: false,
    });
  };

  const handleConfirmRejectFromModal = async (finalReason) => {
    if (!rejectOfferModal.jobId) return;
    setRejectOfferModal((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const res = await nhanVienApi.rejectJob(rejectOfferModal.jobId, { reason: finalReason });
      if (res && res.success) {
        alert(`Đã từ chối đơn lịch ${rejectOfferModal.jobId}.`);
        fetchJobsData();
        setSelectedJob(null);
        setRejectOfferModal({ isOpen: false, jobId: null, isSubmitting: false });
      } else {
        alert(res?.message || "Từ chối lịch thất bại");
        setRejectOfferModal((prev) => ({ ...prev, isSubmitting: false }));
      }
    } catch (e) {
      alert("Lỗi khi từ chối lịch.");
      setRejectOfferModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const DAY_ORDER = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","Chủ Nhật"];

  const handleToggleDayOff = (day) => {
    setContractForm((prev) => {
      const isExist = prev.daysOff.includes(day);
      let updated;
      if (isExist) {
        updated = prev.daysOff.filter((d) => d !== day);
      } else {
        if (prev.daysOff.length >= 2) {
          alert("Bạn chỉ được phép chọn tối đa 2 ngày nghỉ trong tuần!");
          return prev;
        }
        updated = [...prev.daysOff, day];
      }
      return {
        ...prev,
        daysOff: updated.sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)),
      };
    });
  };

  const openCancelWorkflow = (job) => {
    setCancelTargetJob(job);
    setCancelType("one_shift");
    setCancelDateRange({ from: "", to: "" });
    setCancelReason("");
    setIsCancelModalOpen(true);
  };

  const workingDaysList = (contractForm.daysOff && contractForm.daysOff.length > 0)
    ? VI_DAYS.filter(d => !contractForm.daysOff.includes(d))
    : ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];

  const affectedShifts =
    cancelType === "multi_shifts"
      ? calcAffectedShifts(workingDaysList, cancelDateRange.from, cancelDateRange.to)
      : null;

  const submitCancelJob = async () => {
    if (cancelType === "multi_shifts" && (!cancelDateRange.from || !cancelDateRange.to)) {
      alert("Vui lòng chọn khoảng ngày bạn muốn xin nghỉ!");
      return;
    }

    // Gọi API xuống Backend
    try {
      if (cancelTargetJob && cancelTargetJob.id && cancelTargetJob.id !== "CA_CHOT" && cancelTargetJob.id !== "?") {
        if (cancelType === "entire_package") {
          await nhanVienApi.cancelContract(cancelTargetJob.id);
        } else {
          await nhanVienApi.cancelAcceptedJob(cancelTargetJob.id);
        }
      }
    } catch (err) {
      console.error("Lỗi khi hủy ca / xin nghỉ:", err);
    }

    let message = `[Xác nhận yêu cầu xin nghỉ đơn ${cancelTargetJob.id}]:\n`;
    if (cancelTargetJob.bookingType === "MONTHLY" || cancelTargetJob.bookingType === "RECURRING") {
      if (cancelType === "one_shift")
        message += `• Hình thức: Chỉ xin nghỉ 1 ca ngày ${cancelTargetJob.dateStr}.\n• Khấu trừ uy tín: -10.000đ phí vận hành hệ thống.`;
      else if (cancelType === "multi_shifts") {
        const count = affectedShifts ? affectedShifts.length : "?";
        message += `• Hình thức: Xin nghỉ nhiều ca từ ${cancelDateRange.from} đến ${cancelDateRange.to}.\n• Tổng ${count} ca bị ảnh hưởng.`;
      } else
        message += `• Hình thức: HỦY HOÀN TOÀN GÓI.\n• Mức phạt: -150.000đ vào ví đối tác.`;
    } else {
      message += `• Hình thức: Hủy ca làm đơn lẻ.\n• Phạt hủy sát giờ: -50.000đ.`;
    }
    message += `\n• Lý do: ${cancelReason || "Lý do cá nhân"}`;
    alert(message);

    // Tự động giải phóng ngày chốt trên tờ lịch Block Calendar
    if (cancelTargetJob.dateStr) {
      setContractBlockedDates((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((k) => {
          const [y, m, d] = k.split("-");
          if (`${d}/${m}/${y}` === cancelTargetJob.dateStr) {
            updated[k] = { ...updated[k], hasActiveJob: false };
          }
        });
        return updated;
      });
    }

    setJobHistory((prev) => [
      {
        ...cancelTargetJob,
        closedReason: cancelType === "entire_package" ? "Hủy toàn gói" : "Nhân viên hủy",
        closedBy: "staff",
        closedAt: `${cancelTargetJob.dateStr} (vừa hủy)`,
      },
      ...prev,
    ]);
    setCalendarJobs((prev) => prev.filter((j) => j.id !== cancelTargetJob.id));
    setIsCancelModalOpen(false);
    setSelectedJob(null);
    setCancelReason("");
    setCancelDateRange({ from: "", to: "" });
    fetchJobsData();
  };

  const calculateLichNghiPayload = (daysOff, restSession, startDate, endDate) => {
    const payload = [];
    const dayMap = { "Chủ Nhật": 0, "Thứ 2": 1, "Thứ 3": 2, "Thứ 4": 3, "Thứ 5": 4, "Thứ 6": 5, "Thứ 7": 6 };
    
    // 1. Ngày nghỉ trọn ngày (Full-day off)
    daysOff.forEach(dayName => {
      const dayIndex = dayMap[dayName];
      payload.push({
        loai_nghi: 'DinhKy',
        thu_trong_tuan: dayIndex,
        ngay_nghi: null,
        gio_bat_dau_nghi: null,
        gio_ket_thuc_nghi: null,
        ngay_bat_dau_ap_dung: startDate,
        ngay_ket_thuc_ap_dung: endDate,
        ly_do: dayIndex === 0 ? 'Nghỉ định kỳ Chủ Nhật' : `Nghỉ định kỳ thứ ${dayIndex + 1}`
      });
    });

    // 2. Buổi nghỉ (Rest session)
    if (restSession !== "none") {
      let startStr = null;
      let endStr = null;
      let reason = "";
      if (restSession === "morning") { startStr = "06:00:00"; endStr = "10:00:00"; reason = "Nghỉ buổi sáng"; }
      else if (restSession === "afternoon") { startStr = "13:00:00"; endStr = "17:00:00"; reason = "Nghỉ buổi chiều"; }
      else if (restSession === "evening") { startStr = "17:00:00"; endStr = "23:00:00"; reason = "Nghỉ buổi tối"; }

      if (startStr && endStr) {
        payload.push({
          loai_nghi: 'DinhKy',
          thu_trong_tuan: null, // null nghĩa là áp dụng cho mọi ngày làm việc
          ngay_nghi: null,
          gio_bat_dau_nghi: startStr,
          gio_ket_thuc_nghi: endStr,
          ngay_bat_dau_ap_dung: startDate,
          ngay_ket_thuc_ap_dung: endDate,
          ly_do: reason
        });
      }
    }

    if (payload.length === 0) {
      payload.push({
        loai_nghi: 'DinhKy',
        thu_trong_tuan: null,
        ngay_nghi: null,
        gio_bat_dau_nghi: null,
        gio_ket_thuc_nghi: null,
        ngay_bat_dau_ap_dung: startDate,
        ngay_ket_thuc_ap_dung: endDate,
        ly_do: 'Lưu thời hạn hợp đồng'
      });
    }

    return payload;
  };


  const submitContractForm = async () => {
    if (!contractForm.daysOff || contractForm.daysOff.length === 0) {
      alert("Vui lòng chọn ít nhất 1 ngày nghỉ trong tuần!");
      return;
    }

    // --- Tính toán dữ liệu insert bảng LichNghi (DinhKy) ---
    const lichNghiPayload = calculateLichNghiPayload(
      contractForm.daysOff, 
      contractForm.restSession, 
      contractForm.startDate, 
      contractForm.endDate
    );

    try {
      await nhanVienApi.saveCamKetLichNghi(lichNghiPayload);
      alert("Lưu hợp đồng cam kết thành công!");
      
      const workingDays = VI_DAYS.filter(d => !contractForm.daysOff.includes(d));
      setContractBlockedDates(
        generateContractDays(contractForm.startDate, contractForm.endDate, workingDays, calendarJobs)
      );
      setHasRegisteredContract(true);
      setIsContractModalOpen(false);
      setIsEditContractMode(false);
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi lưu hợp đồng!");
    }
  };

  const handleCancelContract = async () => {
    if (window.confirm("Bạn có chắc chắn muốn hủy hợp đồng cam kết này không?")) {
      try {
        await nhanVienApi.cancelCamKetLichNghi();
        alert("Hủy hợp đồng cam kết thành công!");
        setHasRegisteredContract(false);
        setContractBlockedDates({});
        setContractForm((prev) => ({ ...prev, restSession: "none", daysOff: [] }));
      } catch (error) {
        console.error(error);
        alert("Có lỗi xảy ra khi hủy hợp đồng!");
      }
    }
  };

  const renderBookingBadge = (type) => {
    const base = "text-[11px] font-bold px-2.5 py-0.5 rounded-md border bg-blue-50 text-blue-700 border-blue-200";
    switch (type) {
      case "SINGLE":    return <span className={base}>Ca lẻ</span>;
      case "MONTHLY":   return <span className={base}>Gói tháng</span>;
      case "RECURRING": return <span className={base}>Gói lặp lại</span>;
      case "247":       return <span className={base}>Gói 24/7</span>;
      default: return null;
    }
  };

  const filteredCalendarJobs = calendarJobs.filter((job) => job.dateStr === selectedDate);

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-4 font-sans antialiased text-slate-800">

      {/* CONTRACT STATUS BANNER */}
      {!hasRegisteredContract ? (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-600 text-2xl mt-0.5">verified_user</span>
            <div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                Chưa kích hoạt Hợp đồng cam kết lịch rảnh cố định
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Đăng ký các khung giờ rảnh cố định để hệ thống tự động ghép đơn dài hạn, giúp tăng độ uy
                tín và ổn định thu nhập hàng tháng. Thời hạn tối thiểu 2 tháng.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsContractModalOpen(true)}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all whitespace-nowrap active:scale-95 shrink-0"
          >
            Đăng ký lịch làm việc ngay
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">verified_user</span>
              <div>
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">
                  Hợp đồng cam kết đang hoạt động
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Hiệu lực: {contractForm.startDate} → {contractForm.endDate}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setIsEditContractMode(true);
                  setIsContractModalOpen(true);
                }}
                className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-xl transition-all"
              >
                <span className="material-symbols-outlined text-sm">edit_calendar</span>Chỉnh sửa Lịch rảnh
              </button>
              <button
                onClick={() => setIsBlockCalendarOpen(true)}
                className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-2 rounded-xl transition-all"
              >
                <span className="material-symbols-outlined text-sm">event_busy</span>Cài đặt lịch bận
              </button>
              <button
                onClick={handleCancelContract}
                className="text-xs font-bold text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all"
              >
                Hủy hợp đồng
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-slate-400 font-bold mb-2">📅 Ngày nghỉ cố định tuần:</p>
              <div className="flex flex-wrap gap-1.5">
                {(!contractForm.daysOff || contractForm.daysOff.length === 0) ? (
                  <span className="text-slate-500 font-semibold italic">Không có (Làm cả tuần)</span>
                ) : (
                  contractForm.daysOff.map((day, idx) => (
                    <span key={idx} className="bg-rose-100 text-rose-800 font-black px-2.5 py-0.5 rounded">
                      {day}
                    </span>
                  ))
                )}
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-slate-400 font-bold mb-2">⏰ Buổi nghỉ trong ngày:</p>
              <div className="space-y-1">
                {(() => {
                  let restDisplay = "Không nghỉ (Sẵn sàng 06:00 - 23:00)";
                  let badgeColor = "bg-emerald-500";
                  if (contractForm.restSession === "morning") { restDisplay = "Nghỉ buổi sáng (06:00 - 10:00)"; badgeColor = "bg-amber-500"; }
                  else if (contractForm.restSession === "afternoon") { restDisplay = "Nghỉ buổi chiều (13:00 - 17:00)"; badgeColor = "bg-amber-500"; }
                  else if (contractForm.restSession === "evening") { restDisplay = "Nghỉ buổi tối (17:00 - 23:00)"; badgeColor = "bg-amber-500"; }
                  
                  return (
                    <p className="font-bold text-slate-700 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${badgeColor}`}></span>
                      {restDisplay}
                    </p>
                  );
                })()}
              </div>
            </div>
          </div>
          {Object.values(contractBlockedDates).filter((v) => v.status === "blocked").length > 0 && (
            <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              <span className="material-symbols-outlined text-sm">block</span>
              <span>
                Đang khóa{" "}
                <strong>
                  {Object.values(contractBlockedDates).filter((v) => v.status === "blocked").length}
                </strong>{" "}
                ngày bận —
                <button className="ml-1 underline font-bold" onClick={() => setIsBlockCalendarOpen(true)}>
                  xem chi tiết
                </button>
              </span>
            </div>
          )}
        </div>
      )}

      {/* TABS */}
      {hasRegisteredContract && (
        <React.Fragment>
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2">
        {[
          { id: "calendar", icon: "calendar_view_month", label: "1. Lịch làm việc", badge: 0 },
          { id: "offers", icon: "explore", label: "2. Lịch mới / Đề xuất", badge: jobOffers.length },
          { id: "accepted", icon: "assignment_turned_in", label: "3. Lịch đã nhận", badge: 0 },
          { id: "history", icon: "history", label: "4. Lịch sử", badge: 0 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedJob(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all relative focus:outline-none ${activeTab === tab.id ? "bg-emerald-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
            {tab.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black animate-bounce">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 space-y-4">

          {/* TAB: LỊCH LÀM VIỆC */}
          {activeTab === "calendar" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex justify-between gap-1.5 shadow-sm overflow-x-auto">
                {timelineDays.map((day) => {
                  const isSel = selectedDate === day.dateStr;
                  const [d, m, y] = day.dateStr.split("/");
                  const contractKey = `${y}-${m}-${d}`;
                  const isBlocked = contractBlockedDates[contractKey]?.status === "blocked";
                  const hasJob = day.status === "has-jobs" || calendarJobs.some(j => j.dateStr === day.dateStr);
                  return (
                    <div
                      key={day.dateStr}
                      onClick={() => { setSelectedDate(day.dateStr); setSelectedJob(null); }}
                      className={`flex flex-col items-center flex-1 p-2 rounded-xl cursor-pointer text-center min-w-[50px] transition-all ${isSel ? "bg-emerald-600 text-white font-black scale-105" : "hover:bg-slate-100 text-slate-700"}`}
                    >
                      <span className="text-[10px] opacity-80 uppercase tracking-tight">{day.label}</span>
                      <span className="text-sm font-black my-0.5">{day.dateStr.split("/")[0]}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${isBlocked ? "bg-rose-500" : hasJob ? "bg-amber-400" : "bg-emerald-400"}`} />
                    </div>
                  );
                })}
              </div>
              <p className="text-xs font-bold text-slate-500 flex items-center gap-1 px-1">
                <span className="material-symbols-outlined text-sm">event</span>
                Ca làm ngày {selectedDate}:
              </p>
              {filteredCalendarJobs.length === 0 ? (
                <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-400 font-medium text-xs">
                  Ngày này bạn đang trống lịch.
                </div>
              ) : (
                filteredCalendarJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob({ ...job, origin: "calendar" })}
                    className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-sm flex justify-between items-center ${selectedJob?.id === job.id ? "border-2 border-emerald-600 ring-4 ring-emerald-50" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <div className="space-y-1.5 pr-4 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-black tracking-wider px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                          {job.id}
                        </span>
                        {renderBookingBadge(job.bookingType)}
                        {job.autoMatched && (
                          <span className="bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-xs">auto_awesome</span>Tự động ghép
                          </span>
                        )}
                        <span className="text-xs font-black text-slate-700">{job.time}</span>
                      </div>
                      <h4 className="font-bold text-slate-700 text-sm">{job.service}</h4>
                      <p className="text-[11px] font-bold text-slate-600">{job.customer}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-0.5 line-clamp-1">
                        <span className="material-symbols-outlined text-xs text-slate-400">location_on</span>
                        {job.address}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {job.price && <span className="text-xs font-black text-emerald-600">{job.price}</span>}
                        {job.duration && <span className="text-[11px] text-slate-400 font-medium">· {job.duration}</span>}
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shrink-0 ${job.status === "Đang làm việc" ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
                      {job.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: LỊCH MỚI */}
          {activeTab === "offers" && (
            <div className="space-y-3">
              {jobOffers.length === 0 ? (
                <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-400 text-xs">
                  Hiện tại không có đề xuất lịch mới nào.
                </div>
              ) : (
                jobOffers.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob({ ...job, origin: "offers" })}
                    className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-sm flex justify-between items-center ${selectedJob?.id === job.id ? "border-2 border-emerald-600 ring-4 ring-emerald-50" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <div className="space-y-1.5 pr-4 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {job.type === "DIRECT" ? (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md border bg-violet-50 text-violet-700 border-violet-200">
                            Khách chỉ định
                          </span>
                        ) : (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md border bg-sky-50 text-sky-700 border-sky-200">
                            Lịch tự chọn
                          </span>
                        )}
                        {renderBookingBadge(job.bookingType)}
                        <span className="text-xs font-bold text-slate-600">
                          {job.time} | {job.daysOfWeek ? `${job.dateStr} (${job.daysOfWeek})` : `Ngày ${job.dateStr}`}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-700 text-sm">{job.service}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{job.address}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-emerald-600">{job.price}</span>
                      <p className="text-[9px] text-slate-400 font-medium">Thu về ví</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: LỊCH ĐÃ NHẬN */}
          {activeTab === "accepted" && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-[11px] text-blue-800 font-medium flex items-start gap-2">
                <span className="material-symbols-outlined text-sm mt-0.5 shrink-0">info</span>
                <span>
                  Đây là danh sách các đơn bạn đã nhận hoặc được hệ thống tự ghép. Để{" "}
                  <strong>chấm công</strong>, vào tab <strong>"1. Lịch làm việc"</strong> và chọn ngày
                  tương ứng.
                </span>
              </div>
              {acceptedJobs.length === 0 ? (
                <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-400 text-xs">
                  Chưa có lịch làm việc nào.
                </div>
              ) : (
                acceptedJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob({ ...job, origin: "accepted" })}
                    className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-sm flex justify-between items-center ${selectedJob?.id === job.id ? "border-2 border-emerald-600 ring-4 ring-emerald-50" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black tracking-wider px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                          {job.id}
                        </span>
                        {renderBookingBadge(job.bookingType)}
                        {job.autoMatched && (
                          <span className="bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-xs">auto_awesome</span>Tự động ghép
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-700 text-sm">{job.service}</h4>
                      <p className="text-[11px] font-bold text-slate-600">{job.customer}</p>
                      <p className="text-xs font-black text-slate-700">
                        {job.time} · {job.daysOfWeek ? `${job.dateStr} (${job.daysOfWeek})` : `Ngày ${job.dateStr}`}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-0.5 line-clamp-1">
                        <span className="material-symbols-outlined text-xs text-slate-400">location_on</span>
                        {job.address}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-base">arrow_forward_ios</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: LỊCH SỬ */}
          {activeTab === "history" && (
            <div className="space-y-3">
              {jobHistory.length === 0 ? (
                <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-400 text-xs">
                  Chưa có lịch sử ca làm nào.
                </div>
              ) : (
                jobHistory.map((job) => {
                  const isCompleted = job.status === "DaHoanThanh";
                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob({ ...job, origin: "history" })}
                      className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-sm ${selectedJob?.id === job.id ? "border-2 border-emerald-600 ring-4 ring-emerald-50" : "border-slate-200 hover:border-slate-300"}`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-black tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                              {job.id}
                            </span>
                            {renderBookingBadge(job.bookingType)}
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${isCompleted ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                              {isCompleted ? "✓ Hoàn thành" : "Đã hủy"}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-700 text-sm">{job.service}</h4>
                          <p className="text-[11px] text-slate-500 font-semibold">
                            {job.customer} · {job.dateStr} · {job.time}
                          </p>
                        </div>
                        {job.price && isCompleted && (
                          <span className="text-sm font-black text-emerald-600 shrink-0">{job.price}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* RIGHT: JOB DETAIL */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm min-h-[400px] sticky top-28">
          {selectedJob ? (
            <div className="h-full flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Chi tiết công việc ({selectedJob.id})
                    </span>
                    <h3 className="text-base font-black text-slate-700 mt-0.5">{selectedJob.service}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                    {renderBookingBadge(selectedJob.bookingType)}
                    {selectedJob.price && (
                      <span className="text-sm font-black text-emerald-600">{selectedJob.price}</span>
                    )}
                  </div>
                </div>
                <div className="space-y-3 text-xs">
                  {selectedJob.bookingType === "RECURRING" && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-purple-800 text-[11px] uppercase tracking-wide">🔄 Gói lặp lại:</p>
                        {selectedJob.totalSessions > 1 && !selectedJob.id.toString().startsWith("PACKAGE_") && (
                          <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                            Ca {selectedJob.vi_tri_ca} / {selectedJob.totalSessions}
                          </span>
                        )}
                        {selectedJob.id.toString().startsWith("PACKAGE_") && (
                          <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                            Tổng {selectedJob.totalSessions} ca
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600">Hệ thống tự động kích hoạt ca làm định kỳ hàng tuần cố định cho khách hàng.</p>
                    </div>
                  )}
                  {selectedJob.bookingType === "MONTHLY" && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-orange-800 text-[11px] uppercase tracking-wide">📅 Gói tháng:</p>
                        {selectedJob.totalSessions > 1 && !selectedJob.id.toString().startsWith("PACKAGE_") && (
                          <span className="bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                            Ca {selectedJob.vi_tri_ca} / {selectedJob.totalSessions}
                          </span>
                        )}
                        {selectedJob.id.toString().startsWith("PACKAGE_") && (
                          <span className="bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                            Tổng {selectedJob.totalSessions} ca
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600">Chuỗi dịch vụ dài hạn hàng tháng đã ký hợp đồng ràng buộc.</p>
                    </div>
                  )}
                  {selectedJob.bookingType === "247" && selectedJob.ca_lam_247 && (
                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-3">
                      <p className="font-bold text-sky-800 text-[11px] uppercase tracking-wide mb-1">⏰ 24/7 thường trực:</p>
                      <p className="text-slate-600 font-bold">
                        {selectedJob.ca_lam_247 === "Ngay" && "Ca ngày (12 tiếng)"}
                        {selectedJob.ca_lam_247 === "Dem" && "Ca đêm (12 tiếng)"}
                        {selectedJob.ca_lam_247 === "CaNgay" && "Cả ngày (24 tiếng)"}
                      </p>
                      <p className="text-slate-500 text-[10px] mt-0.5">Dịch vụ thường trực, đảm bảo luôn có người.</p>
                    </div>
                  )}
                  <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="material-symbols-outlined text-slate-400 text-lg mt-0.5">account_circle</span>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">Khách hàng</p>
                      <p className="font-bold text-slate-800">{selectedJob.customer}</p>
                      {selectedJob.phone && (
                        <p className="text-[10px] text-slate-500 font-medium">SĐT: {selectedJob.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="material-symbols-outlined text-slate-400 text-lg mt-0.5">calendar_month</span>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">Thời gian</p>
                      <p className="text-slate-800 font-bold">
                        {selectedJob.time} · {selectedJob.daysOfWeek ? `${selectedJob.dateStr} (${selectedJob.daysOfWeek})` : `Ngày ${selectedJob.dateStr}`}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{selectedJob.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="material-symbols-outlined text-slate-400 text-lg mt-0.5">pin_drop</span>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">Địa chỉ</p>
                      <p className="text-slate-700 font-semibold leading-relaxed">{selectedJob.address}</p>
                      {selectedJob.district && (
                        <p className="text-[11px] text-slate-500">{selectedJob.district}</p>
                      )}
                      {selectedJob.addressNote && (
                        <p className="text-[11px] text-blue-600 font-semibold mt-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">directions</span>
                          {selectedJob.addressNote}
                        </p>
                      )}
                    </div>
                  </div>
                  {selectedJob.area && (
                    <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="material-symbols-outlined text-slate-400 text-lg mt-0.5">straighten</span>
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">Diện tích</p>
                        <p className="font-bold text-slate-800">{selectedJob.area}</p>
                      </div>
                    </div>
                  )}
                  {selectedJob.paymentMethod && (
                    <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="material-symbols-outlined text-slate-400 text-base">payments</span>
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">Phương thức thanh toán</p>
                        <p className="text-xs font-bold text-slate-800">{selectedJob.paymentMethod}</p>
                      </div>
                    </div>
                  )}
                  {selectedJob.dichVuThem && (
                    <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="material-symbols-outlined text-slate-400 text-lg mt-0.5">add_circle</span>
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">Dịch vụ thêm</p>
                        <p className="font-bold text-slate-800 leading-relaxed">{selectedJob.dichVuThem}</p>
                      </div>
                    </div>
                  )}
                  {selectedJob.jobNote && (
                    <div className="relative rounded-xl overflow-hidden border border-amber-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-yellow-50"></div>
                      <div className="relative p-3">
                        <p className="text-[10px] font-black text-amber-700 flex items-center gap-1 mb-1.5">
                          <span className="material-symbols-outlined text-xs">sticky_note_2</span>YÊU CẦU TỪ KHÁCH
                        </p>
                        <p className="text-[12px] text-slate-800 font-semibold leading-relaxed italic">
                          {selectedJob.jobNote}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                {/* CHẾ ĐỘ DEMO / GIẢ LẬP GPS & ĐỊNH TUYẾN CHỈ HIỆN Ở TAB 1 VÀ TAB 2 */}
                {(selectedJob.origin === "calendar" || selectedJob.origin === "offers") && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 shadow-sm">
                    <input
                      type="checkbox"
                      id="gps-sim-toggle"
                      checked={isSimulateGPS}
                      onChange={(e) => setIsSimulateGPS(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500 cursor-pointer shrink-0"
                    />
                    <label htmlFor="gps-sim-toggle" className="text-[11px] font-bold text-amber-900 cursor-pointer select-none leading-tight">
                      🕹️ Bật giả lập GPS & Định tuyến (Dùng khi Demo đồ án trên localhost)
                    </label>
                  </div>
                )}

                {selectedJob.origin === "calendar" && (() => {
                  let canCheckIn = true;
                  let canCheckOut = true;
                  let checkInReason = "";
                  let checkOutReason = "";
                  let isPastStartTime = false;
                  let shiftEndStr = "";

                  if (selectedJob && selectedJob.rawDate && selectedJob.rawStartTime) {
                    try {
                      const shiftStart = new Date(`${selectedJob.rawDate}T${selectedJob.rawStartTime}`);
                      const shiftEnd = new Date(shiftStart.getTime() + (selectedJob.durationMinutes || 120) * 60000);
                      const allowCheckInTime = new Date(shiftStart.getTime() - 10 * 60000); // Cho phép trước 10 phút

                      const currentSimTime = TODAY ? new Date(TODAY) : new Date();

                      canCheckIn = currentSimTime >= allowCheckInTime && currentSimTime <= shiftStart;
                      canCheckOut = currentSimTime >= shiftEnd;
                      isPastStartTime = currentSimTime > shiftStart;

                      const allowStr = allowCheckInTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
                      const endStr = shiftEnd.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
                      shiftEndStr = endStr;

                      if (!canCheckIn && currentSimTime < allowCheckInTime) {
                        checkInReason = `Mở lúc ${allowStr} (Trước 10p)`;
                      }
                      if (!canCheckOut) {
                        checkOutReason = `Khóa đến giờ kết thúc ca (${endStr})`;
                      }
                    } catch (e) {
                      canCheckIn = true;
                      canCheckOut = true;
                    }
                  }

                  return (
                    <div className="space-y-2">
                      {selectedJob.status === "Sắp diễn ra" && (
                        <button
                          onClick={() => handleCancelAcceptedJob(selectedJob.id)}
                          className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-2 rounded-xl border border-rose-200 transition-all text-xs"
                        >
                          Hủy ca làm đã nhận
                        </button>
                      )}
                      {selectedJob.status === "Sắp diễn ra" && (selectedJob.bookingType === "MONTHLY" || selectedJob.bookingType === "247") && (
                        <button
                          onClick={() => handleCancelAcceptedPackage(selectedJob.id)}
                          className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2 rounded-xl border border-rose-300 transition-all text-xs"
                        >
                          Hủy hết hợp đồng
                        </button>
                      )}
                      {selectedJob.status === "Sắp diễn ra" && (
                        isPastStartTime ? (
                          <div className="w-full bg-amber-50 border border-amber-300 text-amber-900 p-3 rounded-xl text-xs space-y-1 shadow-sm">
                            <div className="flex items-center gap-1.5 font-bold text-amber-800">
                              <span className="material-symbols-outlined text-base text-amber-600">warning</span>
                              <span>Bạn đã bỏ lỡ giờ bắt đầu ca làm!</span>
                            </div>
                            <p className="text-[11px] text-amber-700 leading-relaxed">
                              Đã qua giờ bắt đầu ca ({selectedJob.rawStartTime}). Ca sẽ tự động bị hủy sau giờ kết thúc ({shiftEndStr}) hoặc bạn có thể chủ động bấm nút Hủy ca phía trên.
                            </p>
                          </div>
                        ) : (
                          <button
                            disabled={!canCheckIn}
                            onClick={() => canCheckIn && handleUpdateProgressWithGPS(selectedJob)}
                            className={`w-full font-bold py-2.5 rounded-xl shadow-sm transition-all text-xs flex items-center justify-center gap-1.5 ${
                              canCheckIn
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md"
                                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                            }`}
                          >
                            {canCheckIn ? (
                              <>
                                <span className="material-symbols-outlined text-sm">play_arrow</span>
                                Bấm chấm công (Vào làm)
                              </>
                            ) : (
                              <>
                                <span className="material-symbols-outlined text-sm">lock</span>
                                Chưa đến giờ chấm công ({checkInReason})
                              </>
                            )}
                          </button>
                        )
                      )}
                      {selectedJob.status === "Đang làm" && (
                        <button
                          disabled={!canCheckOut}
                          onClick={() => canCheckOut && handleUpdateProgressWithGPS(selectedJob)}
                          className={`w-full font-bold py-2.5 rounded-xl shadow-sm transition-all text-xs flex items-center justify-center gap-1.5 ${
                            canCheckOut
                              ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md"
                              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                          }`}
                        >
                          {canCheckOut ? (
                            <>
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              Hoàn thành ca làm việc
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-sm">lock</span>
                              Hoàn thành ca làm việc ({checkOutReason})
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })()}
                {selectedJob.origin === "offers" && (
                  <div className="flex gap-2">
                    {selectedJob.type === "DIRECT" && (
                      <button
                        onClick={() => handleRejectOffer(selectedJob.id)}
                        className="flex-1 bg-slate-100 text-slate-600 font-bold py-2.5 rounded-xl border border-slate-200 text-xs"
                      >
                        Từ chối lịch
                      </button>
                    )}
                    <button
                      onClick={() => handleAcceptOffer(selectedJob)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-md text-xs"
                    >
                      Nhận lịch ngay
                    </button>
                  </div>
                )}
                {selectedJob.origin === "history" && (
                  <div className={`p-3 rounded-xl border text-[11px] font-medium flex items-start gap-2 ${selectedJob.closedReason === "Hoàn thành" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800"}`}>
                    <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">
                      {selectedJob.closedReason === "Hoàn thành" ? "check_circle" : "cancel"}
                    </span>
                    <div>
                      <p className="font-bold">{selectedJob.closedReason}</p>
                      <p className="mt-0.5 opacity-80">Ghi nhận lúc: {selectedJob.closedAt}</p>
                    </div>
                  </div>
                )}
                {selectedJob.origin === "accepted" && (
                  <div className="space-y-2">
                    <div className="bg-emerald-50 text-emerald-800 text-[11px] font-medium p-3 rounded-xl border border-emerald-100 flex items-start gap-2">
                      <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">info</span>
                      <span>
                        Vào tab <strong>"1. Lịch làm việc"</strong>, chọn ngày{" "}
                        <strong>{selectedJob.dateStr}</strong> để chấm công khi đến giờ.
                      </span>
                    </div>
                    {selectedJob.autoMatched && (
                      <div className="bg-teal-50 border border-teal-200 p-2.5 rounded-xl text-[11px] text-teal-800 font-medium flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-sm text-teal-600 shrink-0 mt-0.5">auto_awesome</span>
                        <span>
                          Đơn này được <strong>hệ thống tự động ghép</strong> dựa trên hợp đồng cam kết
                          lịch rảnh của bạn.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 text-center">
              <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">ads_click</span>
              <p className="text-xs font-semibold max-w-[200px] mx-auto text-slate-500">
                Bấm chọn một đơn lịch bên cột trái để kiểm tra chi tiết.
              </p>
            </div>
          )}
        </div>
      </div>
        </React.Fragment>
      )}


      {/* ===== CONTRACT MODAL ===== */}
      {isContractModalOpen && (!hasRegisteredContract || isEditContractMode) && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 font-bold text-sm tracking-wide">
                <span className="material-symbols-outlined text-emerald-500 text-xl">edit_calendar</span>
                <span>{isEditContractMode ? "CHỈNH SỬA LỊCH RẢNH HỢP ĐỒNG" : "ĐĂNG KÝ HỢP ĐỒNG CAM KẾT LỊCH RẢNH CỐ ĐỊNH"}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsContractModalOpen(false)}
                className="material-symbols-outlined hover:text-slate-300 transition-colors"
              >
                close
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <p className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  <span className="material-symbols-outlined text-sm text-emerald-600">date_range</span>
                  Thời hạn hiệu lực hợp đồng (Tối thiểu 2 tháng)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CustomDatePicker
                    label="Ngày bắt đầu"
                    value={contractForm.startDate}
                    min={(() => {
                      const d = new Date(TODAY);
                      d.setDate(d.getDate() + 4);
                      return d.toISOString().split("T")[0];
                    })()}
                    disabled={isEditContractMode}
                    onChange={(val) => {
                      const d = new Date(val);
                      d.setMonth(d.getMonth() + 2);
                      const minEnd = d.toISOString().split("T")[0];
                      setContractForm((prev) => ({
                        ...prev,
                        startDate: val,
                        endDate: prev.endDate < minEnd ? minEnd : prev.endDate,
                      }));
                    }}
                  />
                  <CustomDatePicker
                    label="Ngày kết thúc"
                    value={contractForm.endDate}
                    disabled={isEditContractMode}
                    min={(() => {
                      const d = new Date(contractForm.startDate);
                      d.setMonth(d.getMonth() + 2);
                      return d.toISOString().split("T")[0];
                    })()}
                    onChange={(val) => setContractForm((prev) => ({ ...prev, endDate: val }))}
                  />
                </div>
                <p className="text-[11px] text-amber-700 font-medium bg-amber-50 border border-amber-200/60 px-3 py-2 rounded-xl flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">info</span>
                  Thời hạn kết thúc phải cách ngày bắt đầu ít nhất 2 tháng.
                </p>
              </div>
              <div className="space-y-3">
                <p className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  <span className="material-symbols-outlined text-sm text-emerald-600">today</span>
                  Chọn ngày nghỉ cố định trong tuần:
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"].map((day) => {
                    const isSel = contractForm.daysOff.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleToggleDayOff(day)}
                        className={`px-4 py-2.5 rounded-xl font-bold border transition-all text-xs active:scale-95 ${isSel ? "bg-rose-500 text-white border-rose-500 shadow-md" : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-4">
                <p className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  <span className="material-symbols-outlined text-sm text-emerald-600">nightlight</span>
                  Chọn buổi nghỉ cố định trên ngày làm việc
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "none", label: "Không nghỉ (Làm nguyên ngày)", time: "06:00 - 23:00" },
                    { id: "morning", label: "Nghỉ buổi sáng", time: "06:00 - 10:00" },
                    { id: "afternoon", label: "Nghỉ buổi chiều", time: "13:00 - 17:00" },
                    { id: "evening", label: "Nghỉ buổi tối", time: "17:00 - 23:00" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      disabled={isEditContractMode}
                      onClick={() => setContractForm(prev => ({ ...prev, restSession: option.id }))}
                      className={`flex flex-col items-start px-4 py-3 rounded-xl border transition-all text-left ${contractForm.restSession === option.id ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500" : "bg-white border-slate-200 hover:border-emerald-300"} ${isEditContractMode ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span className={`font-bold text-sm ${contractForm.restSession === option.id ? "text-emerald-700" : "text-slate-700"}`}>
                        {option.label}
                      </span>
                      {option.time && <span className="text-xs text-slate-500 mt-1">{option.time}</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsContractModalOpen(false);
                  setIsEditContractMode(false);
                  fetchCamKet(); // Reset local state
                }}
                className="bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-xl hover:bg-slate-300 text-sm"
              >
                Đóng lại
              </button>
              <button
                type="button"
                onClick={submitContractForm}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-xl shadow-md transition-all active:scale-95 text-sm"
              >
                {isEditContractMode ? "Lưu thay đổi" : "Kích hoạt & Ký cam kết"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== BLOCK CALENDAR MODAL ===== */}
      <BlockCalendarModal
        isOpen={isBlockCalendarOpen}
        onClose={() => setIsBlockCalendarOpen(false)}
        contractBlockedDates={contractBlockedDates}
        onSave={handleSaveBlockedDates}
        onGoToCancelFlow={(job) => { setIsBlockCalendarOpen(false); openCancelWorkflow(job); }}
        calendarJobs={calendarJobs}
        contractForm={contractForm}
      />

      {/* ===== CANCEL JOB MODAL ===== */}
      {isCancelModalOpen && cancelTargetJob && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="bg-rose-600 p-3.5 text-white flex items-center justify-between shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-1.5 text-sm font-bold">
                <span className="material-symbols-outlined text-base">warning</span>
                Xác nhận Hủy ca / Xin nghỉ phép
              </div>
              <button onClick={() => setIsCancelModalOpen(false)} className="material-symbols-outlined text-sm">
                close
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 space-y-0.5">
                <p><strong>Ca làm:</strong> {cancelTargetJob.id} - {cancelTargetJob.service}</p>
                <p><strong>Khách hàng:</strong> {cancelTargetJob.customer}</p>
                <p><strong>Thời gian:</strong> {cancelTargetJob.dateStr} ({cancelTargetJob.time})</p>
              </div>
              {(cancelTargetJob.bookingType === "MONTHLY" || cancelTargetJob.bookingType === "RECURRING") ? (
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wide text-[10px]">
                    Chọn hình thức xin nghỉ:
                  </label>
                  <div className="space-y-2">
                    <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${cancelType === "one_shift" ? "border-emerald-500 bg-emerald-50/30" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                      <input type="radio" name="cancelType" checked={cancelType === "one_shift"} onChange={() => setCancelType("one_shift")} className="mt-0.5 accent-emerald-600" />
                      <div>
                        <p className="font-bold text-slate-800">Trường hợp 1: Chỉ nghỉ 1 ca này</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Ca hôm nay tự động đẩy lên chợ tìm người thay. Lịch tuần sau giữ nguyên.</p>
                        <p className="text-[10px] text-amber-700 font-semibold mt-1">Khấu trừ uy tín: -10.000đ</p>
                      </div>
                    </label>
                    <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${cancelType === "multi_shifts" ? "border-amber-500 bg-amber-50/30" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                      <input type="radio" name="cancelType" checked={cancelType === "multi_shifts"} onChange={() => setCancelType("multi_shifts")} className="mt-0.5 accent-amber-600" />
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">Trường hợp 2: Nghỉ nhiều ca liên tiếp</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Chọn khoảng thời gian — hệ thống tự tính các ca của bạn bị ảnh hưởng.</p>
                      </div>
                    </label>
                    {cancelType === "multi_shifts" && (
                      <div className="mx-0.5 space-y-3">
                        <div className="grid grid-cols-2 gap-3 px-2.5 py-3 bg-amber-50/60 border border-amber-200 rounded-xl">
                          <CustomDatePicker
                            label="Nghỉ từ ngày"
                            value={cancelDateRange.from}
                            min="2026-06-08"
                            onChange={(v) =>
                              setCancelDateRange((p) => ({ ...p, from: v, to: p.to && p.to < v ? "" : p.to }))
                            }
                          />
                          <CustomDatePicker
                            label="Đến hết ngày"
                            value={cancelDateRange.to}
                            min={cancelDateRange.from || "2026-06-08"}
                            onChange={(v) => setCancelDateRange((p) => ({ ...p, to: v }))}
                          />
                        </div>
                        {affectedShifts !== null && (
                          <div className={`px-3 py-2.5 rounded-xl border text-[11px] font-medium flex items-start gap-2 ${affectedShifts.length > 0 ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                            <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">
                              {affectedShifts.length > 0 ? "event_busy" : "event_available"}
                            </span>
                            <div>
                              {affectedShifts.length > 0 ? (
                                <>
                                  <p className="font-bold">{affectedShifts.length} ca bị ảnh hưởng trong khoảng này:</p>
                                  <p className="mt-0.5 opacity-80 leading-relaxed">
                                    {affectedShifts.map(formatDateShort).join(" · ")}
                                  </p>
                                  <p className="mt-1 text-[10px] text-slate-500">
                                    (Hệ thống sẽ tự động tìm người thay cho các ca trên)
                                  </p>
                                </>
                              ) : (
                                <p>Khoảng ngày này không có ca nào của bạn.</p>
                              )}
                            </div>
                          </div>
                        )}
                        {(!cancelDateRange.from || !cancelDateRange.to) && (
                          <p className="text-[10px] text-slate-400 text-center">
                            ← Chọn ngày bắt đầu và kết thúc để xem trước số ca bị ảnh hưởng
                          </p>
                        )}
                      </div>
                    )}
                    <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${cancelType === "entire_package" ? "border-rose-500 bg-rose-50/30" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                      <input type="radio" name="cancelType" checked={cancelType === "entire_package"} onChange={() => setCancelType("entire_package")} className="mt-0.5 accent-rose-600" />
                      <div>
                        <p className="font-bold text-rose-700">Trường hợp 3: Hủy toàn bộ gói đã cam kết</p>
                        <p className="text-[10px] text-rose-600 mt-0.5">
                          Hủy hợp đồng dài hạn — chịu phạt vi phạm nặng -150.000đ.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3 rounded-xl">
                  <p className="font-bold uppercase text-[10px]">⚠️ PHẠT HỦY CA LẺ:</p>
                  <p>Hệ thống tự động trừ -50.000đ vào ví nội bộ.</p>
                </div>
              )}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Lý do giải trình:</label>
                <textarea
                  rows="2"
                  placeholder="Nhập lý do thực tế để tổng đài kiểm duyệt..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl focus:outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2 p-4 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 bg-slate-100 py-2 rounded-xl font-bold"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={submitCancelJob}
                className="flex-1 bg-rose-600 text-white py-2 rounded-xl font-bold hover:bg-rose-700 transition-colors"
              >
                Xác nhận gửi đơn nghỉ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT OFFER MODAL */}
      <RejectOfferModal
        isOpen={rejectOfferModal.isOpen}
        onClose={() => setRejectOfferModal({ isOpen: false, jobId: null, isSubmitting: false })}
        onConfirm={handleConfirmRejectFromModal}
        isSubmitting={rejectOfferModal.isSubmitting}
      />

      {/* CANCEL JOB MODAL */}
      <CancelJobModal
        isOpen={cancelModalState.isOpen}
        onClose={() => setCancelModalState({ isOpen: false, job: null, cancelType: "SINGLE" })}
        job={cancelModalState.job}
        cancelType={cancelModalState.cancelType}
        onConfirmCancel={handleConfirmCancelFromModal}
        historyJobs={jobHistory || []}
      />

      {/* NOTIFICATION MODAL */}
      <NotificationModal
        isOpen={notifyModal.isOpen}
        onClose={() => setNotifyModal({ ...notifyModal, isOpen: false })}
        title={notifyModal.title}
        message={notifyModal.message}
        type={notifyModal.type}
      />
    </div>
  );
};

export default ScheduleManager;