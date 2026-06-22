import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import nhanVienApi from "../../../api/nhanVienApi";
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

const TODAY = new Date();

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
    // Sync bản copy mỗi lần mở lại modal
    setDraftBlocked(contractBlockedDates);
    if (contractForm.startDate) {
      const [y, m] = contractForm.startDate.split("-").map(Number);
      setViewYear(y);
      setViewMonth(m - 1);
    } else {
      const now = new Date();
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

  const handleDayClick = (day) => {
    const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const info = draftBlocked[dateKey];
    if (!info) return;
    if (info.hasActiveJob) {
      const [y, m, d] = dateKey.split("-");
      const displayDate = `${d}/${m}/${y}`;
      const job = calendarJobs.find((j) => j.dateStr === displayDate);
      setWarningJob(job || { dateStr: displayDate, id: "?", service: "Ca đã chốt" });
      return;
    }
    // Toggle trong draft, không đụng state cha
    setDraftBlocked((prev) => {
      if (!prev[dateKey]) return prev;
      const cur = prev[dateKey];
      if (cur.hasActiveJob) return prev;
      return {
        ...prev,
        [dateKey]: { ...cur, status: cur.status === "working" ? "blocked" : "working" },
      };
    });
  };

  const getDayStyle = (day) => {
    const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const info = draftBlocked[dateKey];
    if (!info) return { cls: "text-slate-300 cursor-default text-opacity-50", dot: null };
    if (info.hasActiveJob)
      return { cls: "bg-amber-50 text-amber-800 border border-amber-300 cursor-pointer hover:bg-amber-100 font-bold", dot: "bg-amber-500" };
    if (info.status === "blocked")
      return { cls: "bg-rose-100 text-rose-800 border border-rose-300 cursor-pointer hover:bg-rose-200 font-bold", dot: "bg-rose-500" };
    return { cls: "bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-pointer hover:bg-emerald-100 font-bold", dot: "bg-emerald-400" };
  };

  const today = new Date();
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

// ===== MAIN COMPONENT =====
const ScheduleManager = () => {
  const [activeTab, setActiveTab] = useState("calendar");
  const [hasRegisteredContract, setHasRegisteredContract] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isEditContractMode, setIsEditContractMode] = useState(false);

  const generateTimelineDays = () => {
    const days = [];
    const t = new Date();
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

  const [timelineDays, setTimelineDays] = useState(generateTimelineDays());
  const [selectedDate, setSelectedDate] = useState(generateTimelineDays()[0].dateStr);

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
      selectedDays: [],
      timeSlots: [],
    };
  });
  const [tempSlotUI, setTempSlotUI] = useState({
    startHour: "08", startMin: "00", endHour: "12", endMin: "00",
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

  const [calendarJobs, setCalendarJobs] = useState([]);
  const [jobOffers, setJobOffers] = useState([]);
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [jobHistory, setJobHistory] = useState([]);

  // ── Logic helpers ──────────────────────────────────────────────────────────
  const parseTimeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const formatMinutesToTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };



  const mapCaLamViecToFrontend = (ca) => {
    const parts = ca.ngay_lam ? ca.ngay_lam.split("-") : [];
    const dateStr = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : ca.ngay_lam;
    
    let district = "TP.HCM";
    if (ca.dia_chi_lam_viec) {
      const addrParts = ca.dia_chi_lam_viec.split(',');
      if (addrParts.length > 1) {
        district = addrParts[addrParts.length - 2].trim();
      }
    }

    return {
        id: ca.id,
        don_hang_id: ca.don_hang_id,
        type: ca.trang_thai_ca === 'ChoNhanVienChiDinhXacNhan' ? 'DIRECT' : (ca.loai_ghep === 'TuDong' ? 'AUTO' : 'FREELANCE'),
        customer: ca.don_hang?.ho_ten_thuc_te || ca.don_hang?.khach_hang?.tai_khoan?.ho_ten,
        phone: ca.don_hang?.sdt_thuc_te || ca.don_hang?.khach_hang?.tai_khoan?.so_dien_thoai,
        dateStr: dateStr,
        time: ca.gio_bat_dau ? `${ca.gio_bat_dau.slice(0,5)} - ${formatMinutesToTime(parseTimeToMinutes(ca.gio_bat_dau.slice(0,5)) + ca.thoi_gian_lam_phut)}` : "",
        address: ca.dia_chi_lam_viec,
        service: ca.dich_vu?.ten_dich_vu || ca.don_hang?.dich_vu_loai_goi?.dich_vu?.ten_dich_vu,
        bookingType: ca.loai_goi_ca_lam === 'CaLe' ? 'SINGLE' : (ca.loai_goi_ca_lam === 'GoiThang' ? 'MONTHLY' : '247'),
        status: ca.trang_thai_ca === 'DaNhan' ? 'Sắp diễn ra' : (ca.trang_thai_ca === 'DangThucHien' ? 'Đang làm' : ca.trang_thai_ca),
        price: `${Number(ca.thuc_nhan_nv).toLocaleString('vi-VN')}đ`,
        duration: ca.thoi_gian_lam_phut ? `${Math.round(ca.thoi_gian_lam_phut / 60)} tiếng` : "",
        staffCount: 1, 
        jobNote: ca.don_hang?.ghi_chu_cho_nhan_vien,
        totalSessions: ca.don_hang?.tong_so_buoi,
        district: district,
        paymentMethod: ca.don_hang?.phuong_thuc_tt,
        trang_thai_ca: ca.trang_thai_ca
    };
  };

  const fetchJobsData = async () => {
    try {
      const [resAvail, resAccept, resWork, resHist] = await Promise.all([
         nhanVienApi.getAvailableJobs(),
         nhanVienApi.getAcceptedJobs(),
         nhanVienApi.getWorkingSchedule(),
         nhanVienApi.getJobHistory()
      ]);
      
      if (resAvail && resAvail.success) {
         setJobOffers(resAvail.data.map(mapCaLamViecToFrontend));
      }
      if (resAccept && resAccept.success) {
         setAcceptedJobs(resAccept.data.map(mapCaLamViecToFrontend));
      }
      if (resWork && resWork.success) {
         setCalendarJobs(resWork.data.map(mapCaLamViecToFrontend));
      }
      if (resHist && resHist.success) {
         setJobHistory(resHist.data.map(mapCaLamViecToFrontend));
      }
    } catch (e) {
      console.error("Lỗi fetch dữ liệu ca làm việc:", e);
    }
  };

  useEffect(() => {
    fetchJobsData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch Hợp đồng Lịch Nghỉ khi mount
  useEffect(() => {
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
          const offDays = list.filter(x => x.thu_trong_tuan !== null).map(x => x.thu_trong_tuan);
          const workingDays = [0, 1, 2, 3, 4, 5, 6].filter(d => !offDays.includes(d)).map(d => dayMapInverse[d]);
          
          const gapList = list.filter(x => x.gio_bat_dau_nghi !== null).sort((a, b) => {
            return parseTimeToMinutes(a.gio_bat_dau_nghi.slice(0, 5)) - parseTimeToMinutes(b.gio_bat_dau_nghi.slice(0, 5));
          });
          
          let currentMin = 6 * 60;
          const timeSlotsParsed = [];
          
          gapList.forEach(gap => {
            const gapStartMin = parseTimeToMinutes(gap.gio_bat_dau_nghi.slice(0, 5));
            const gapEndMin = parseTimeToMinutes(gap.gio_ket_thuc_nghi.slice(0, 5));
            
            if (gapStartMin > currentMin) {
              timeSlotsParsed.push(`${formatMinutesToTime(currentMin)} - ${formatMinutesToTime(gapStartMin)}`);
            }
            currentMin = gapEndMin;
          });
          
          if (currentMin < 23 * 60) {
             timeSlotsParsed.push(`${formatMinutesToTime(currentMin)} - 23:00`);
          }
          
          setContractForm(prev => ({
             ...prev,
             startDate: first.ngay_bat_dau_ap_dung,
             endDate: first.ngay_ket_thuc_ap_dung,
             selectedDays: workingDays,
             timeSlots: timeSlotsParsed
          }));
          
          setContractBlockedDates(
            generateContractDays(first.ngay_bat_dau_ap_dung, first.ngay_ket_thuc_ap_dung, workingDays, calendarJobs)
          );
        } else {
          setHasRegisteredContract(false);
        }
      } catch (err) {
        console.error("Lỗi fetch hợp đồng:", err);
      }
    };
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

    if (Object.keys(contractBlockedDates).length === 0) return;
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
      return changed ? updated : prev;
    });
  }, [calendarJobs]); // eslint-disable-line react-hooks/exhaustive-deps



  const handleCancelAcceptedJob = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy nhận ca làm này không? Lịch sẽ được đưa trở lại chợ việc.")) {
      try {
        const res = await nhanVienApi.cancelAcceptedJob(id);
        if (res && res.success) {
          alert(res.message || "Đã hủy ca.");
          fetchJobsData();
          setSelectedJob(null);
        } else {
          alert(res?.message || "Hủy ca thất bại");
        }
      } catch (e) {
        alert("Lỗi khi hủy ca.");
      }
    }
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

  const handleAcceptOffer = async (job) => {
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
      alert("Lỗi khi nhận lịch. Có thể lịch này không còn khả dụng.");
    }
  };

  const handleRejectOffer = async (id) => {
    const reason = prompt("Vui lòng nhập lý do từ chối đơn lịch này:");
    if (reason !== null) {
      try {
        const res = await nhanVienApi.rejectJob(id);
        if (res && res.success) {
          alert(`Đã từ chối đơn lịch ${id}.`);
          fetchJobsData();
          setSelectedJob(null);
        } else {
          alert(res?.message || "Từ chối lịch thất bại");
        }
      } catch (e) {
        alert("Lỗi khi từ chối lịch.");
      }
    }
  };

  const validateAndAddTimeSlot = () => {
    setFormError("");
    const startMin = parseInt(tempSlotUI.startHour) * 60 + parseInt(tempSlotUI.startMin);
    const endMin = parseInt(tempSlotUI.endHour) * 60 + parseInt(tempSlotUI.endMin);

    if (startMin < 6 * 60 || endMin > 23 * 60) {
      setFormError("Thời gian làm việc phải nằm trong khoảng từ 06:00 đến 23:00!");
      return;
    }

    if (endMin <= startMin) { setFormError("Giờ kết thúc phải sau giờ bắt đầu!"); return; }
    if (contractForm.timeSlots.length >= 2) { setFormError("Đã đủ tối đa 2 khung giờ cam kết!"); return; }

    if (contractForm.timeSlots.length === 1) {
      const existEnd = contractForm.timeSlots[0].split(" - ")[1];
      const eEndMin = parseTimeToMinutes(existEnd);
      if (startMin < eEndMin) {
        setFormError("Khung giờ thứ 2 phải bắt đầu sau khi khung giờ thứ 1 kết thúc!");
        return;
      }
    }

    for (const slot of contractForm.timeSlots) {
      const [existStart, existEnd] = slot.split(" - ");
      const eStartMin = parseTimeToMinutes(existStart);
      const eEndMin = parseTimeToMinutes(existEnd);
      if (startMin < eEndMin && endMin > eStartMin) {
        setFormError(`Khung giờ mới bị trùng với khung giờ đã có: ${slot}!`);
        return;
      }
    }
    const newSlot = `${tempSlotUI.startHour}:${tempSlotUI.startMin} - ${tempSlotUI.endHour}:${tempSlotUI.endMin}`;
    setContractForm((prev) => ({ ...prev, timeSlots: [...prev.timeSlots, newSlot] }));
  };

  const removeTimeSlot = (index) =>
    setContractForm((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index),
    }));

  const DAY_ORDER = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","Chủ Nhật"];

  const handleToggleDay = (day) =>
    setContractForm((prev) => {
      const isExist = prev.selectedDays.includes(day);
      const updated = isExist
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day];
      return {
        ...prev,
        selectedDays: updated.sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)),
      };
    });

  const openCancelWorkflow = (job) => {
    setCancelTargetJob(job);
    setCancelType("one_shift");
    setCancelDateRange({ from: "", to: "" });
    setCancelReason("");
    setIsCancelModalOpen(true);
  };

  const affectedShifts =
    cancelType === "multi_shifts"
      ? calcAffectedShifts(
          contractForm.selectedDays.length > 0
            ? contractForm.selectedDays
            : ["Thứ 2", "Thứ 6", "Chủ Nhật"],
          cancelDateRange.from,
          cancelDateRange.to
        )
      : null;

  const submitCancelJob = () => {
    if (cancelType === "multi_shifts" && (!cancelDateRange.from || !cancelDateRange.to)) {
      alert("Vui lòng chọn khoảng ngày bạn muốn xin nghỉ!");
      return;
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
  };

  const calculateLichNghiPayload = (selectedDays, timeSlots, startDate, endDate) => {
    const payload = [];
    const dayMap = { "Chủ Nhật": 0, "Thứ 2": 1, "Thứ 3": 2, "Thứ 4": 3, "Thứ 5": 4, "Thứ 6": 5, "Thứ 7": 6 };
    const allDays = [0, 1, 2, 3, 4, 5, 6];
    
    // 1. Tính các ngày nghỉ trọn ngày
    const workingDays = selectedDays.map(d => dayMap[d]);
    const offDays = allDays.filter(d => !workingDays.includes(d));
    
    offDays.forEach(day => {
      payload.push({
        loai_nghi: 'DinhKy',
        thu_trong_tuan: day,
        ngay_nghi: null,
        gio_bat_dau_nghi: null,
        gio_ket_thuc_nghi: null,
        ngay_bat_dau_ap_dung: startDate,
        ngay_ket_thuc_ap_dung: endDate,
        ly_do: day === 0 ? 'Nghỉ định kỳ Chủ Nhật' : `Nghỉ định kỳ thứ ${day + 1}`
      });
    });

    // 2. Tính các khung giờ nghỉ
    // Sắp xếp timeSlots
    const sortedSlots = [...timeSlots].sort((a, b) => {
      return parseTimeToMinutes(a.split(' - ')[0]) - parseTimeToMinutes(b.split(' - ')[0]);
    });

    let currentMin = 6 * 60; // Bắt đầu từ 06:00
    const endOfDayMin = 23 * 60; // Kết thúc lúc 23:00

    sortedSlots.forEach((slot, index) => {
      const [startStr, endStr] = slot.split(' - ');
      const startMin = parseTimeToMinutes(startStr);
      const endMin = parseTimeToMinutes(endStr);

      if (startMin > currentMin) {
        payload.push({
          loai_nghi: 'DinhKy',
          thu_trong_tuan: null,
          ngay_nghi: null,
          gio_bat_dau_nghi: formatMinutesToTime(currentMin) + ':00',
          gio_ket_thuc_nghi: startStr + ':00',
          ngay_bat_dau_ap_dung: startDate,
          ngay_ket_thuc_ap_dung: endDate,
          ly_do: 'Nghỉ ngoài khung giờ làm việc'
        });
      }
      currentMin = endMin;
    });

    if (currentMin < endOfDayMin) {
      payload.push({
        loai_nghi: 'DinhKy',
        thu_trong_tuan: null,
        ngay_nghi: null,
        gio_bat_dau_nghi: formatMinutesToTime(currentMin) + ':00',
        gio_ket_thuc_nghi: '23:00:00',
        ngay_bat_dau_ap_dung: startDate,
        ngay_ket_thuc_ap_dung: endDate,
        ly_do: 'Nghỉ ngoài khung giờ làm việc'
      });
    }

    return payload;
  };


  const submitContractForm = async () => {
    if (contractForm.selectedDays.length === 0) {
      alert("Vui lòng chọn ít nhất 1 ngày rảnh trong tuần!");
      return;
    }
    if (contractForm.timeSlots.length === 0) {
      alert("Vui lòng thiết lập ít nhất 1 khung giờ làm việc trước khi kích hoạt!");
      return;
    }

    // --- Tính toán dữ liệu insert bảng LichNghi (DinhKy) ---
    const lichNghiPayload = calculateLichNghiPayload(
      contractForm.selectedDays, 
      contractForm.timeSlots, 
      contractForm.startDate, 
      contractForm.endDate
    );

    try {
      await nhanVienApi.saveCamKetLichNghi(lichNghiPayload);
      alert("Lưu hợp đồng cam kết thành công!");
      
      setContractBlockedDates(
        generateContractDays(contractForm.startDate, contractForm.endDate, contractForm.selectedDays, calendarJobs)
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
        setContractForm((prev) => ({ ...prev, timeSlots: [], selectedDays: [] }));
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
            Đăng ký lịch rảnh ngay
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
              <p className="text-slate-400 font-bold mb-2">📅 Ngày trực tuyến cố định tuần:</p>
              <div className="flex flex-wrap gap-1.5">
                {contractForm.selectedDays.map((day, idx) => (
                  <span key={idx} className="bg-emerald-100 text-emerald-800 font-black px-2.5 py-0.5 rounded">
                    {day}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-slate-400 font-bold mb-2">⏰ Khung giờ hệ thống đẩy đơn:</p>
              <div className="space-y-1">
                {contractForm.timeSlots.map((slot, idx) => (
                  <p key={idx} className="font-bold text-slate-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Khung {idx + 1}: {slot}
                  </p>
                ))}
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
                  return (
                    <div
                      key={day.dateStr}
                      onClick={() => { setSelectedDate(day.dateStr); setSelectedJob(null); }}
                      className={`flex flex-col items-center flex-1 p-2 rounded-xl cursor-pointer text-center min-w-[50px] transition-all ${isSel ? "bg-emerald-600 text-white font-black scale-105" : "hover:bg-slate-100 text-slate-700"}`}
                    >
                      <span className="text-[10px] opacity-80 uppercase tracking-tight">{day.label}</span>
                      <span className="text-sm font-black my-0.5">{day.dateStr.split("/")[0]}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${isBlocked ? "bg-rose-500" : day.status === "has-jobs" ? "bg-amber-400" : "bg-emerald-400"}`} />
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
                          {job.time} | Ngày {job.dateStr}
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
                        {job.time} · Ngày {job.dateStr}
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
                      <p className="font-bold text-purple-800 text-[11px] uppercase tracking-wide mb-1">🔄 Gói lặp lại:</p>
                      <p className="text-slate-600">Hệ thống tự động kích hoạt ca làm định kỳ hàng tuần cố định cho khách hàng.</p>
                    </div>
                  )}
                  {selectedJob.bookingType === "MONTHLY" && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                      <p className="font-bold text-orange-800 text-[11px] uppercase tracking-wide mb-1">📅 Gói tháng:</p>
                      <p className="text-slate-600">Chuỗi dịch vụ dài hạn hàng tháng đã ký hợp đồng ràng buộc.</p>
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
                      <p className="text-slate-800 font-bold">{selectedJob.time} · Ngày {selectedJob.dateStr}</p>
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
              <div className="pt-3 border-t border-slate-100 space-y-2">
                {selectedJob.origin === "calendar" && (
                  <div className="space-y-2">
                    {selectedJob.status === "Sắp diễn ra" && (
                      <button
                        onClick={() => handleCancelAcceptedJob(selectedJob.id)}
                        className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-2 rounded-xl border border-rose-200 transition-all text-xs"
                      >
                        Hủy ca làm đã nhận
                      </button>
                    )}
                    {selectedJob.status === "Sắp diễn ra" && (
                      <button
                        onClick={() => handleUpdateProgress(selectedJob.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all text-xs"
                      >
                        Bấm chấm công (Vào làm)
                      </button>
                    )}
                    {selectedJob.status === "Đang làm" && (
                      <button
                        onClick={() => handleUpdateProgress(selectedJob.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all text-xs"
                      >
                        Hoàn thành ca làm việc
                      </button>
                    )}
                  </div>
                )}
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
                  Chọn ngày rảnh cố định trong tuần:
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"].map((day) => {
                    const isSel = contractForm.selectedDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleToggleDay(day)}
                        className={`px-4 py-2.5 rounded-xl font-bold border transition-all text-xs active:scale-95 ${isSel ? "bg-emerald-600 text-white border-emerald-600 shadow-md" : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-4">
                <p className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  <span className="material-symbols-outlined text-sm text-emerald-600">schedule</span>
                  Thiết lập khung giờ trực tuyến (Tối đa 2 ca | 06:00 – 23:00)
                </p>
                {formError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-xl text-[11px] font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">error</span>{formError}
                  </div>
                )}
                {!isEditContractMode && (
                  <>
                    {contractForm.timeSlots.length < 2 ? (
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <TimePicker
                            label="Từ giờ"
                            hour={tempSlotUI.startHour}
                            minute={tempSlotUI.startMin}
                            onHourChange={(h) => setTempSlotUI((p) => ({ ...p, startHour: h }))}
                            onMinuteChange={(m) => setTempSlotUI((p) => ({ ...p, startMin: m }))}
                          />
                          <TimePicker
                            label="Đến giờ"
                            hour={tempSlotUI.endHour}
                            minute={tempSlotUI.endMin}
                            onHourChange={(h) => setTempSlotUI((p) => ({ ...p, endHour: h }))}
                            onMinuteChange={(m) => setTempSlotUI((p) => ({ ...p, endMin: m }))}
                          />
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                          <span className="text-[11px] text-slate-500 font-medium">
                            Dự kiến:{" "}
                            <strong className="text-slate-700">{tempSlotUI.startHour}:{tempSlotUI.startMin}</strong>
                            {" → "}
                            <strong className="text-slate-700">{tempSlotUI.endHour}:{tempSlotUI.endMin}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={validateAndAddTimeSlot}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1 shadow-md transition-all active:scale-95 text-xs"
                          >
                            <span className="material-symbols-outlined text-sm">add_circle</span>Thêm khung giờ
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-amber-700 font-semibold text-[11px] bg-amber-50 p-3 rounded-xl border border-amber-200">
                        🔒 Đã cấu hình đủ tối đa 2 khung giờ.
                      </p>
                    )}
                  </>
                )}
                <div className="space-y-2">
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Khung giờ đã cấu hình:</p>
                  {contractForm.timeSlots.length === 0 ? (
                    <p className="text-slate-400 italic pl-1 text-[11px]">Chưa có khung giờ nào.</p>
                  ) : (
                    contractForm.timeSlots.map((slot, index) => (
                      <div key={index} className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                        <span className="font-bold text-slate-700 flex items-center gap-2 text-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                          Khung {index + 1}: {slot}
                        </span>
                        {!isEditContractMode && (
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(index)}
                            className="text-rose-500 hover:text-rose-700 font-bold text-xs transition-colors"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsContractModalOpen(false);
                  setIsEditContractMode(false);
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
        onSave={(draft) => setContractBlockedDates(draft)}
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
    </div>
  );
};

export default ScheduleManager;