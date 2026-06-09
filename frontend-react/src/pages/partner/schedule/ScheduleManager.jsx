import React, { useState, useEffect, useRef } from "react";

// ===== BEAUTIFUL CUSTOM DATE PICKER =====
const TODAY = new Date("2026-06-08");

const CustomDatePicker = ({
  value,
  onChange,
  min,
  max,
  label,
  portalMode = false,
}) => {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(null);
  const [viewMonth, setViewMonth] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 280,
  });
  const triggerRef = useRef(null);

  const parseDate = (str) => {
    if (!str) return null;
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const parseMin = parseDate(min);
  const parseMax = parseDate(max);
  const selected = parseDate(value);

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Khi mở dropdown ở portalMode, tính vị trí tuyệt đối
  useEffect(() => {
    if (open && portalMode && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 280),
      });
    }
  }, [open, portalMode]);

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

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
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const daysInMonth =
    viewYear && viewMonth !== null ? getDaysInMonth(viewYear, viewMonth) : 0;
  const firstDay =
    viewYear && viewMonth !== null
      ? getFirstDayOfMonth(viewYear, viewMonth)
      : 0;
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isDisabled = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    if (parseMin && d < parseMin) return true;
    if (parseMax && d > parseMax) return true;
    return false;
  };

  const isSelected = (day) => {
    if (!selected) return false;
    return (
      selected.getFullYear() === viewYear &&
      selected.getMonth() === viewMonth &&
      selected.getDate() === day
    );
  };

  const isToday = (day) => {
    return (
      TODAY.getFullYear() === viewYear &&
      TODAY.getMonth() === viewMonth &&
      TODAY.getDate() === day
    );
  };

  // Calendar panel JSX — dùng lại cho cả 2 mode
  const CalendarPanel = () => (
    <div
      className="bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
      style={{ width: "280px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}
      onMouseDown={(e) => e.preventDefault()} // giữ focus không bị mất
    >
      <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors text-white"
        >
          <span className="material-symbols-outlined text-sm">
            chevron_left
          </span>
        </button>
        <span className="text-white font-bold text-sm">
          {monthNames[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors text-white"
        >
          <span className="material-symbols-outlined text-sm">
            chevron_right
          </span>
        </button>
      </div>
      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
        {dayNames.map((d) => (
          <div
            key={d}
            className="text-center py-2 text-[10px] font-black text-slate-400 uppercase"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 p-2 gap-0.5">
        {blanks.map((_, i) => (
          <div key={`b${i}`} />
        ))}
        {days.map((day) => {
          const disabled = isDisabled(day);
          const sel = isSelected(day);
          const tod = isToday(day);
          return (
            <button
              type="button"
              key={day}
              onClick={() => !disabled && handleSelectDay(day)}
              className={`h-9 w-full rounded-xl text-xs font-bold transition-all
                ${disabled ? "text-slate-300 cursor-not-allowed" : "cursor-pointer"}
                ${sel ? "bg-emerald-600 text-white shadow-md" : ""}
                ${!sel && tod ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300" : ""}
                ${!sel && !tod && !disabled ? "hover:bg-slate-100 text-slate-700" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
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
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 border border-slate-200 rounded-xl px-3 py-2.5 bg-white hover:border-emerald-400 transition-all shadow-sm text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-100"
      >
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-500 text-base">
            calendar_month
          </span>
          <span
            className={value ? "text-slate-800" : "text-slate-400 font-normal"}
          >
            {value ? formatDisplay(value) : "Chọn ngày..."}
          </span>
        </span>
        <span className="material-symbols-outlined text-slate-400 text-sm">
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>

      {open &&
        viewYear !== null &&
        (portalMode ? (
          // Portal mode: render fixed, thoát khỏi overflow của modal
          <div
            style={{
              position: "fixed",
              top: dropdownPos.top,
              left: dropdownPos.left,
              zIndex: 9999,
            }}
          >
            <CalendarPanel />
          </div>
        ) : (
          // Default: relative dropdown
          <div className="absolute z-50 top-full mt-2 left-0">
            <CalendarPanel />
          </div>
        ))}
    </div>
  );
};

// ===== BEAUTIFUL TIME PICKER =====
const TimePicker = ({ label, hour, minute, onHourChange, onMinuteChange }) => {
  const [openH, setOpenH] = useState(false);
  const [openM, setOpenM] = useState(false);

  const hours = Array.from({ length: 18 }, (_, i) =>
    String(i + 6).padStart(2, "0"),
  );
  const minutes = ["00", "15", "30", "45"];

  return (
    <div>
      {label && (
        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 hover:border-emerald-400 transition-all shadow-sm focus-within:ring-2 focus-within:ring-emerald-100">
        <span className="material-symbols-outlined text-emerald-500 text-base">
          schedule
        </span>

        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => {
              setOpenH((o) => !o);
              setOpenM(false);
            }}
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
                  onClick={() => {
                    onHourChange(h);
                    setOpenH(false);
                  }}
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
            onClick={() => {
              setOpenM((o) => !o);
              setOpenH(false);
            }}
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
                  onClick={() => {
                    onMinuteChange(m);
                    setOpenM(false);
                  }}
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

// ===== MAIN COMPONENT =====
const ScheduleManager = () => {
  const [activeTab, setActiveTab] = useState("calendar");
  const [hasRegisteredContract, setHasRegisteredContract] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  const [timelineDays, setTimelineDays] = useState([
    {
      dateStr: "08/06/2026",
      label: "Thứ 2",
      isToday: true,
      status: "has-jobs",
    },
    {
      dateStr: "09/06/2026",
      label: "Thứ 3",
      isToday: false,
      status: "has-jobs",
    },
    {
      dateStr: "10/06/2026",
      label: "Thứ 4",
      isToday: false,
      status: "available",
    },
    {
      dateStr: "11/06/2026",
      label: "Thứ 5",
      isToday: false,
      status: "has-jobs",
    },
    {
      dateStr: "12/06/2026",
      label: "Thứ 6",
      isToday: false,
      status: "available",
    },
    {
      dateStr: "13/06/2026",
      label: "Thứ 7",
      isToday: false,
      status: "available",
    },
    { dateStr: "14/06/2026", label: "CN", isToday: false, status: "available" },
  ]);
  const [selectedDate, setSelectedDate] = useState("08/06/2026");

  const [contractForm, setContractForm] = useState({
    startDate: "2026-06-08",
    endDate: "2026-08-08",
    selectedDays: [],
    timeSlots: [],
  });

  const [tempSlotUI, setTempSlotUI] = useState({
    startHour: "08",
    startMin: "00",
    endHour: "12",
    endMin: "00",
  });

  const [formError, setFormError] = useState("");

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelTargetJob, setCancelTargetJob] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelType, setCancelType] = useState("one_shift");
  const [cancelDateRange, setCancelDateRange] = useState({ from: "", to: "" });

  const [isBlockCalendarOpen, setIsBlockCalendarOpen] = useState(false);
  const [blockDate, setBlockDate] = useState("");

  const [currentTime] = useState({
    dateStr: "08/06/2026",
    hour: 7,
    minute: 35,
  });

  const parseTimeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const isCheckInAllowed = (job) => {
    if (job.dateStr !== currentTime.dateStr) return false;
    const [startStr] = job.time.split(" - ");
    const jobStartMin = parseTimeToMinutes(startStr);
    const nowMin = currentTime.hour * 60 + currentTime.minute;
    return nowMin >= jobStartMin - 30 && nowMin <= jobStartMin + 60;
  };

  // ─── DATA ─────────────────────────────────────────────────────────────────
  // calendarJobs: nguồn dữ liệu cho "Lịch làm việc" (timeline)
  // Bao gồm cả đơn từ customer book trực tiếp lẫn auto-matched
  const [calendarJobs, setCalendarJobs] = useState([
    {
      id: "CAL-901",
      customer: "Chị Mai Anh",
      phone: "0901.234.567",
      dateStr: "08/06/2026",
      time: "08:00 - 11:00",
      address: "Phòng 1205, Chung cư Sunrise City, Quận 7",
      service: "Dọn dẹp nhà theo giờ",
      bookingType: "MONTHLY",
      status: "Sắp diễn ra",
      jobNote: "Nhà có em bé đang ngủ, làm nhẹ nhàng.",
      area: "55 – 85m²",
      duration: "3 tiếng",
      staffCount: 1,
      totalSessions: 8,
      sessionIndex: 3,
      packageDuration: "2 tháng",
      district: "Quận 7, TP.HCM",
      addressNote: "Thang máy số 2, bấm tầng 12",
      staffRequest: null,
      paymentMethod: "Ví CleanTrust",
      price: "240.000đ",
    },
    {
      id: "CAL-902",
      customer: "Anh Tuấn Trần",
      phone: "0918.889.991",
      dateStr: "09/06/2026",
      time: "14:00 - 18:00",
      address: "Số 45 Đường số 2, Cư xá Chu Văn An, Bình Tân",
      service: "Tổng vệ sinh chuyên sâu",
      bookingType: "SINGLE",
      status: "Sắp diễn ra",
      jobNote: "Lau kỹ kính ban công.",
      area: "85 – 120m²",
      duration: "4 tiếng",
      staffCount: 1,
      totalSessions: null,
      sessionIndex: null,
      packageDuration: null,
      district: "Bình Tân, TP.HCM",
      addressNote: null,
      staffRequest: null,
      paymentMethod: "Tiền mặt",
      price: "350.000đ",
    },
    {
      id: "CAL-903",
      customer: "Chị Thảo Vy",
      phone: "0933.445.566",
      dateStr: "11/06/2026",
      time: "18:00 - 21:00",
      address: "Vinhomes Central Park, Bình Thạnh",
      service: "Hỗ trợ y tế & Nấu ăn gia đình",
      bookingType: "247",
      status: "Sắp diễn ra",
      jobNote: "Yêu cầu nhân sự chuyên môn cao, chăm sóc tận tâm.",
      area: "Dưới 55m²",
      duration: "3 tiếng",
      staffCount: 1,
      totalSessions: 30,
      sessionIndex: 7,
      packageDuration: "1 tháng",
      district: "Bình Thạnh, TP.HCM",
      addressNote: "Gửi xe hầm B2, nhắn tin trước khi lên",
      staffRequest: "Khách yêu cầu nhân viên quen: Chị Hương",
      paymentMethod: "MoMo / ZaloPay",
      price: "310.000đ",
    },
    // Auto-matched jobs cũng xuất hiện trong lịch làm việc
    {
      id: "AUTO-301",
      customer: "Chị Lan Phương",
      phone: "0909.112.233",
      dateStr: "13/06/2026",
      time: "08:00 - 11:00",
      address: "Chung cư Masteri Thảo Điền, Quận 2",
      service: "Dọn dẹp định kỳ cuối tuần",
      bookingType: "MONTHLY",
      status: "Sắp diễn ra",
      jobNote: null,
      autoMatched: true,
      area: "55 – 85m²",
      duration: "3 tiếng",
      staffCount: 1,
      totalSessions: 12,
      sessionIndex: 5,
      packageDuration: "3 tháng",
      district: "Quận 2, TP.HCM",
      addressNote: null,
      staffRequest: null,
      paymentMethod: "Ví CleanTrust",
      price: "220.000đ",
    },
    {
      id: "AUTO-302",
      customer: "Anh Minh Khoa",
      phone: "0977.654.321",
      dateStr: "14/06/2026",
      time: "14:00 - 17:00",
      address: "Số 12 Nguyễn Thị Minh Khai, Quận 1",
      service: "Vệ sinh văn phòng",
      bookingType: "RECURRING",
      status: "Sắp diễn ra",
      jobNote: null,
      autoMatched: true,
      area: "55 – 85m²",
      duration: "3 tiếng",
      staffCount: 1,
      totalSessions: 12,
      sessionIndex: 5,
      packageDuration: "3 tháng",
      district: "Quận 1, TP.HCM",
      addressNote: null,
      staffRequest: null,
      paymentMethod: "Ví CleanTrust",
      price: "220.000đ",
    },
  ]);

  const [jobOffers, setJobOffers] = useState([
    {
      id: "OFF-112",
      type: "FREELANCE",
      customer: "Hệ thống điều phối Chợ Việc",
      dateStr: "10/06/2026",
      time: "09:00 - 12:00",
      address: "Tòa Landmark 4, Vinhomes Central Park",
      district: "Bình Thạnh, TP.HCM",
      addressNote: null,
      service: "Vệ sinh máy lạnh & Máy giặt",
      bookingType: "SINGLE",
      price: "280.000đ",
      duration: "3 tiếng",
      staffCount: 1,
      deviceCount: 2,
      deviceType: "1 máy lạnh 1HP + 1 máy giặt cửa trước",
      totalSessions: null,
      sessionIndex: null,
      packageDuration: null,
      area: null,
      staffRequest: null,
      paymentMethod: "Tiền mặt",
      jobNote: null,
    },
    {
      id: "OFF-115",
      type: "DIRECT",
      customer: "Cô Thu Thủy (Khách quen đặt định kỳ)",
      dateStr: "12/06/2026",
      time: "14:00 - 17:00",
      address: "120/15A Lê Văn Sỹ, Phú Nhuận",
      district: "Phú Nhuận, TP.HCM",
      addressNote: "Nhà mặt tiền, cổng sắt xanh",
      service: "Chăm sóc người già + Dọn dẹp",
      bookingType: "RECURRING",
      price: "220.000đ",
      duration: "3 tiếng",
      staffCount: 1,
      careShift: "Ca chiều (14:00 – 17:00)",
      totalSessions: 12,
      sessionIndex: 5,
      packageDuration: "3 tháng",
      area: null,
      staffRequest: "Khách chỉ định: nhân viên quen của hộ",
      paymentMethod: "Ví CleanTrust",
      jobNote: "Cụ bà 78 tuổi, đi lại khó khăn. Cần hỗ trợ tắm và nấu cháo.",
    },
  ]);

  // acceptedJobs: "Lịch đã nhận" — danh sách đơn mình đã chủ động nhận
  // HOẶC được hệ thống tự ghép. Chỉ để xem thông tin, KHÔNG check-in ở đây.
  // Khi nhận đơn → thêm vào cả acceptedJobs lẫn calendarJobs.
  const [acceptedJobs, setAcceptedJobs] = useState([
    {
      id: "AUTO-301",
      type: "AUTO",
      customer: "Chị Lan Phương",
      phone: "0909.112.233",
      dateStr: "13/06/2026",
      time: "08:00 - 11:00",
      address: "Chung cư Masteri Thảo Điền, Quận 2",
      service: "Dọn dẹp định kỳ cuối tuần",
      bookingType: "MONTHLY",
      status: "Sắp diễn ra",
      jobNote: null,
      autoMatched: true,
      area: "55 – 85m²",
      duration: "3 tiếng",
      staffCount: 1,
      totalSessions: 12,
      sessionIndex: 5,
      packageDuration: "3 tháng",
      district: "Quận 2, TP.HCM",
      addressNote: null,
      staffRequest: null,
      paymentMethod: "Ví CleanTrust",
      price: "220.000đ",
    },
    {
      id: "AUTO-302",
      type: "AUTO",
      customer: "Anh Minh Khoa",
      phone: "0977.654.321",
      dateStr: "14/06/2026",
      time: "14:00 - 17:00",
      address: "Số 12 Nguyễn Thị Minh Khai, Quận 1",
      service: "Vệ sinh văn phòng",
      bookingType: "RECURRING",
      status: "Sắp diễn ra",
      jobNote: null,
      autoMatched: true,
      area: "55 – 85m²",
      duration: "3 tiếng",
      staffCount: 1,
      totalSessions: 12,
      sessionIndex: 5,
      packageDuration: "3 tháng",
      district: "Quận 1, TP.HCM",
      addressNote: null,
      staffRequest: null,
      paymentMethod: "Ví CleanTrust",
      price: "220.000đ",
    },
  ]);

  const [selectedJob, setSelectedJob] = useState(null);

  const [jobHistory, setJobHistory] = useState([
    {
      id: "CAL-800",
      customer: "Chị Ngọc Hà",
      phone: "0912.333.444",
      dateStr: "05/06/2026",
      time: "08:00 - 11:00",
      service: "Dọn dẹp nhà theo giờ",
      bookingType: "MONTHLY",
      price: "240.000đ",
      closedReason: "Hoàn thành",
      closedBy: "staff",
      closedAt: "05/06/2026 11:10",
      address: "Số 12 Lê Lợi, Quận 1",
    },
    {
      id: "CAL-801",
      customer: "Anh Đức Minh",
      phone: "0977.111.222",
      dateStr: "06/06/2026",
      time: "14:00 - 17:00",
      service: "Tổng vệ sinh chuyên sâu",
      bookingType: "SINGLE",
      price: "350.000đ",
      closedReason: "Khách hủy",
      closedBy: "customer",
      closedAt: "06/06/2026 09:30",
      address: "Số 12 Lê Lợi, Quận 1",
    },
    {
      id: "CAL-802",
      customer: "Chị Thanh Loan",
      phone: "0901.555.666",
      dateStr: "07/06/2026",
      time: "09:00 - 12:00",
      service: "Chăm sóc người già + Dọn dẹp",
      bookingType: "RECURRING",
      price: "220.000đ",
      closedReason: "Nhân viên hủy",
      closedBy: "staff",
      closedAt: "07/06/2026 07:15",
      address: "Số 12 Lê Lợi, Quận 1",
    },
  ]);

  // ─── LOGIC ─────────────────────────────────────────────────────────────────

  const handleCheckIn = (id) => {
    alert(`[Xác nhận chấm công] Ca làm ${id} đã bắt đầu tính giờ làm việc!`);
    setCalendarJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: "Đang làm việc" } : j)),
    );
    setSelectedJob((prev) =>
      prev ? { ...prev, status: "Đang làm việc" } : null,
    );
  };

  const handleCompleteJob = (id) => {
    alert(
      `[Chúc mừng] Bạn đã hoàn thành xuất sắc ca làm ${id}. Tiền công đã được cộng vào Ví đối tác!`,
    );
    const job = calendarJobs.find((j) => j.id === id);
    if (job) {
      setJobHistory((prev) => [
        {
          ...job,
          closedReason: "Hoàn thành",
          closedBy: "staff",
          closedAt: `${job.dateStr} (vừa xong)`,
        },
        ...prev,
      ]);
    }
    setCalendarJobs((prev) => prev.filter((j) => j.id !== id));
    setSelectedJob(null);
  };

  const handleAcceptOffer = (job) => {
    alert(
      `[Thành công] Bạn đã nhận đơn lịch ${job.id}.\nĐơn đã được thêm vào "Lịch đã nhận" và đồng bộ sang "Lịch làm việc" ngày ${job.dateStr}.`,
    );
    const formattedJob = {
      ...job,
      customer: job.customer.includes("Khách quen")
        ? "Cô Thu Thủy"
        : job.customer,
      status: "Sắp diễn ra",
      autoMatched: false,
    };
    // Thêm vào cả 2: lịch đã nhận + lịch làm việc (timeline)
    setAcceptedJobs((prev) => [formattedJob, ...prev]);
    setCalendarJobs((prev) => [formattedJob, ...prev]);
    setJobOffers((prev) => prev.filter((o) => o.id !== job.id));
    setSelectedJob(null);
  };

  const handleRejectOffer = (id) => {
    const reason = prompt("Vui lòng nhập lý do từ chối đơn lịch này:");
    if (reason !== null) {
      alert(`Đã từ chối đơn lịch ${id}.`);
      setJobOffers((prev) => prev.filter((o) => o.id !== id));
      setSelectedJob(null);
    }
  };

  const validateAndAddTimeSlot = () => {
    setFormError("");
    const startMin =
      parseInt(tempSlotUI.startHour) * 60 + parseInt(tempSlotUI.startMin);
    const endMin =
      parseInt(tempSlotUI.endHour) * 60 + parseInt(tempSlotUI.endMin);

    if (endMin <= startMin) {
      setFormError("Giờ kết thúc phải sau giờ bắt đầu!");
      return;
    }
    if (contractForm.timeSlots.length >= 2) {
      setFormError("Đã đủ tối đa 2 khung giờ cam kết!");
      return;
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
    setContractForm((prev) => ({
      ...prev,
      timeSlots: [...prev.timeSlots, newSlot],
    }));
  };

  const removeTimeSlot = (index) => {
    setContractForm((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index),
    }));
  };

  const handleToggleDay = (day) => {
    setContractForm((prev) => {
      const isExist = prev.selectedDays.includes(day);
      return {
        ...prev,
        selectedDays: isExist
          ? prev.selectedDays.filter((d) => d !== day)
          : [...prev.selectedDays, day],
      };
    });
  };

  const openCancelWorkflow = (job) => {
    setCancelTargetJob(job);
    setCancelType("one_shift");
    setIsCancelModalOpen(true);
  };

  const submitCancelJob = () => {
    let message = `[Xác nhận yêu cầu xin nghỉ đơn ${cancelTargetJob.id}]:\n`;
    if (
      cancelTargetJob.bookingType === "MONTHLY" ||
      cancelTargetJob.bookingType === "RECURRING"
    ) {
      if (cancelType === "one_shift") {
        message += `• Hình thức: Trường hợp 1 - Chỉ xin nghỉ 1 ca ngày ${cancelTargetJob.dateStr}.\n• Khấu trừ uy tín: -10.000đ phí vận hành hệ thống.`;
      } else if (cancelType === "multi_shifts") {
        if (!cancelDateRange.from || !cancelDateRange.to) {
          alert("Vui lòng chọn khoảng ngày bạn muốn xin nghỉ!");
          return;
        }
        message += `• Hình thức: Trường hợp 2 - Xin nghỉ nhiều ca từ ${cancelDateRange.from} đến ${cancelDateRange.to}.`;
      } else {
        message += `• Hình thức: Trường hợp 3 - HỦY HOÀN TOÀN GÓI.\n• Mức phạt: -150.000đ vào ví đối tác.`;
      }
    } else {
      message += `• Hình thức: Hủy ca làm đơn lẻ.\n• Phạt hủy sát giờ: -50.000đ.`;
    }
    message += `\n• Lý do: ${cancelReason || "Lý do cá nhân"}`;
    alert(message);
    setJobHistory((prev) => [
      {
        ...cancelTargetJob,
        closedReason:
          cancelType === "entire_package" ? "Hủy toàn gói" : "Nhân viên hủy",
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

  const handleBlockCalendarSubmit = () => {
    if (!blockDate) return;
    const [y, m, d] = blockDate.split("-");
    const formattedBlockDate = `${d}/${m}/${y}`;
    const hasJobOnDay = calendarJobs.some(
      (j) => j.dateStr === formattedBlockDate,
    );
    if (hasJobOnDay) {
      alert(
        `Không thể tự động khóa ngày ${formattedBlockDate}! Bạn đang có ca làm được giao vào ngày này.`,
      );
      return;
    }
    setTimelineDays((prev) =>
      prev.map((day) =>
        day.dateStr === formattedBlockDate
          ? { ...day, status: "blocked" }
          : day,
      ),
    );
    alert(
      `[Cài đặt thành công]: Hệ thống đã Khóa lịch bận ngày ${formattedBlockDate}.`,
    );
    setIsBlockCalendarOpen(false);
  };

  const renderBookingBadge = (type) => {
    const base =
      "text-[11px] font-bold px-2.5 py-0.5 rounded-md border bg-blue-50 text-blue-700 border-blue-200";
    switch (type) {
      case "SINGLE":
        return <span className={base}>Ca lẻ</span>;
      case "MONTHLY":
        return <span className={base}>Gói tháng</span>;
      case "RECURRING":
        return <span className={base}>Gói lặp lại</span>;
      case "247":
        return <span className={base}>Gói 24/7</span>;
      default:
        return null;
    }
  };

  const filteredCalendarJobs = calendarJobs.filter(
    (job) => job.dateStr === selectedDate,
  );

  const submitContractForm = () => {
    if (contractForm.selectedDays.length === 0) {
      alert("Vui lòng chọn ít nhất 1 ngày rảnh trong tuần!");
      return;
    }
    if (contractForm.timeSlots.length === 0) {
      alert(
        "Vui lòng thiết lập ít nhất 1 khung giờ làm việc trước khi kích hoạt!",
      );
      return;
    }
    setHasRegisteredContract(true);
    setIsContractModalOpen(false);
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-4 font-sans antialiased text-slate-800">
      {/* CONTRACT STATUS BANNER */}
      {!hasRegisteredContract ? (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-600 text-2xl mt-0.5">
              verified_user
            </span>
            <div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                Chưa kích hoạt Hợp đồng cam kết lịch rảnh cố định
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Đăng ký các khung giờ rảnh cố định để hệ thống tự động ghép đơn
                dài hạn, giúp tăng độ uy tín và ổn định thu nhập hàng tháng.
                Thời hạn tối thiểu 2 tháng.
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
              <span className="material-symbols-outlined text-emerald-600">
                verified_user
              </span>
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
                onClick={() => setIsBlockCalendarOpen(true)}
                className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-2 rounded-xl transition-all"
              >
                <span className="material-symbols-outlined text-sm">block</span>
                Cài đặt lịch bận
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Xóa hợp đồng và đăng ký lại?")) {
                    setHasRegisteredContract(false);
                    setContractForm((prev) => ({
                      ...prev,
                      timeSlots: [],
                      selectedDays: [],
                    }));
                  }
                }}
                className="text-xs font-bold text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all"
              >
                Xóa làm lại
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-slate-400 font-bold mb-2">
                📅 Ngày trực tuyến cố định tuần:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {contractForm.selectedDays.map((day, idx) => (
                  <span
                    key={idx}
                    className="bg-emerald-100 text-emerald-800 font-black px-2.5 py-0.5 rounded"
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-slate-400 font-bold mb-2">
                ⏰ Khung giờ hệ thống đẩy đơn:
              </p>
              <div className="space-y-1">
                {contractForm.timeSlots.map((slot, idx) => (
                  <p
                    key={idx}
                    className="font-bold text-slate-700 flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{" "}
                    Khung {idx + 1}: {slot}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2">
        {[
          {
            id: "calendar",
            icon: "calendar_view_month",
            label: "1. Lịch làm việc",
            badge: 0,
          },
          {
            id: "offers",
            icon: "explore",
            label: "2. Lịch mới / Đề xuất",
            badge: jobOffers.length,
          },
          {
            id: "accepted",
            icon: "assignment_turned_in",
            label: "3. Lịch đã nhận",
            badge: 0,
          },
          {
            id: "history",
            icon: "history",
            label: "4. Lịch sử",
            badge: 0,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedJob(null);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all relative focus:outline-none
              ${activeTab === tab.id ? "bg-emerald-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <span className="material-symbols-outlined text-base">
              {tab.icon}
            </span>
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
          {/* ─── TAB: LỊCH LÀM VIỆC (Timeline/Thời khóa biểu) ──────────────── */}
          {activeTab === "calendar" && (
            <div className="space-y-4">
              {/* Timeline 7 ngày */}
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex justify-between gap-1.5 shadow-sm overflow-x-auto">
                {timelineDays.map((day) => {
                  const isSelected = selectedDate === day.dateStr;
                  return (
                    <div
                      key={day.dateStr}
                      onClick={() => {
                        setSelectedDate(day.dateStr);
                        setSelectedJob(null);
                      }}
                      className={`flex flex-col items-center flex-1 p-2 rounded-xl cursor-pointer text-center min-w-[50px] transition-all
  ${isSelected ? "bg-emerald-600 text-white font-black scale-105" : "hover:bg-slate-100 text-slate-700"}`}
                    >
                      <span className="text-[10px] opacity-80 uppercase tracking-tight">
                        {day.label}
                      </span>
                      <span className="text-sm font-black my-0.5">
                        {day.dateStr.split("/")[0]}
                      </span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full
                        ${
                          day.status === "blocked"
                            ? "bg-rose-500"
                            : day.status === "has-jobs"
                              ? "bg-amber-400"
                              : "bg-emerald-400"
                        }`}
                      />
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
                    onClick={() =>
                      setSelectedJob({ ...job, origin: "calendar" })
                    }
                    className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-sm flex justify-between items-center
                      ${
                        selectedJob?.id === job.id
                          ? "border-2 border-emerald-600 ring-4 ring-emerald-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    <div className="space-y-1.5 pr-4 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-black tracking-wider px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                          {job.id}
                        </span>
                        {renderBookingBadge(job.bookingType)}
                        {job.autoMatched && (
                          <span className="bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-xs">
                              auto_awesome
                            </span>
                            Tự động ghép
                          </span>
                        )}
                        <span className="text-xs font-black text-slate-700">
                          {job.time}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-700 text-sm">{job.service}</h4>
                        <p className="text-[11px] font-bold text-slate-600">{job.customer}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-0.5 line-clamp-1">
                          <span className="material-symbols-outlined text-xs text-slate-400">location_on</span>
                          {job.address}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {job.price && (
                            <span className="text-xs font-black text-emerald-600">{job.price}</span>
                          )}
                          {job.duration && (
                            <span className="text-[11px] text-slate-400 font-medium">· {job.duration}</span>
                          )}
                          {job.deviceCount && (
                            <span className="text-[11px] text-slate-400 font-medium">· {job.deviceCount} thiết bị</span>
                          )}
                        </div>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full border shrink-0
                      ${
                        job.status === "Đang làm việc"
                          ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                          : "bg-emerald-50 text-emerald-700 border-emerald-100"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ─── TAB: LỊCH MỚI / ĐỀ XUẤT ───────────────────────────────────── */}
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
                    className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-sm flex justify-between items-center
                      ${
                        selectedJob?.id === job.id
                          ? "border-2 border-emerald-600 ring-4 ring-emerald-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
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
                      <h4 className="font-bold text-slate-700 text-sm">
                        {job.service}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {job.address}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-emerald-600">
                        {job.price}
                      </span>
                      <p className="text-[9px] text-slate-400 font-medium">
                        Thu về ví
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ─── TAB: LỊCH ĐÃ NHẬN (chỉ xem, không check-in) ──────────────── */}
          {activeTab === "accepted" && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-[11px] text-blue-800 font-medium flex items-start gap-2">
                <span className="material-symbols-outlined text-sm mt-0.5 shrink-0">
                  info
                </span>
                <span>
                  Đây là danh sách các đơn bạn đã nhận hoặc được hệ thống tự
                  ghép. Để <strong>chấm công</strong>, vào tab{" "}
                  <strong>"1. Lịch làm việc"</strong> và chọn ngày tương ứng.
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
                    onClick={() =>
                      setSelectedJob({ ...job, origin: "accepted" })
                    }
                    className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-sm flex justify-between items-center
                      ${
                        selectedJob?.id === job.id
                          ? "border-2 border-emerald-600 ring-4 ring-emerald-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black tracking-wider px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                          {job.id}
                        </span>
                        {renderBookingBadge(job.bookingType)}
                        {job.autoMatched && (
                          <span className="bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-xs">
                              auto_awesome
                            </span>
                            Tự động ghép
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
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {job.price && (
                            <span className="text-xs font-black text-emerald-600">{job.price}</span>
                          )}
                          {job.duration && (
                            <span className="text-[11px] text-slate-400 font-medium">· {job.duration}</span>
                          )}
                          {job.deviceCount && (
                            <span className="text-[11px] text-slate-400 font-medium">· {job.deviceCount} thiết bị</span>
                          )}
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-base">
                      arrow_forward_ios
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ─── TAB: LỊCH SỬ ───────────────────────────────────────────────── */}
          {activeTab === "history" && (
            <div className="space-y-3">
              {jobHistory.length === 0 ? (
                <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-400 text-xs">
                  Chưa có lịch sử ca làm nào.
                </div>
              ) : (
                jobHistory.map((job) => {
                  const isCompleted = job.closedReason === "Hoàn thành";
                  const isCustomerCancel = job.closedReason === "Khách hủy";
                  return (
                    <div
                      key={job.id}
                      onClick={() =>
                        setSelectedJob({ ...job, origin: "history" })
                      }
                      className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-sm
                        ${
                          selectedJob?.id === job.id
                            ? "border-2 border-emerald-600 ring-4 ring-emerald-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-black tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                              {job.id}
                            </span>
                            {renderBookingBadge(job.bookingType)}
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full border
                            ${
                              isCompleted
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                            >
                              {isCompleted
                                ? "✓ Hoàn thành"
                                : isCustomerCancel
                                  ? "Khách hủy"
                                  : "Nhân viên hủy"}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-700 text-sm">{job.service}</h4>
                            <p className="text-[11px] text-slate-500 font-semibold">
                              {job.customer} · {job.dateStr} · {job.time}
                            </p>
                            {job.address && (
                              <p className="text-[11px] text-slate-400 flex items-center gap-0.5 line-clamp-1 mt-0.5">
                                <span className="material-symbols-outlined text-xs">location_on</span>
                                {job.address}
                              </p>
                            )}
                        </div>
                        {job.price && isCompleted && (
                          <span className="text-sm font-black text-emerald-600 shrink-0">
                            {job.price}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* ─── RIGHT COLUMN: JOB DETAIL ─────────────────────────────────────── */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm min-h-[400px] sticky top-28">
          {selectedJob ? (
            <div className="h-full flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Chi tiết công việc ({selectedJob.id})
                    </span>
                    <h3 className="text-base font-black text-slate-700 mt-0.5">
                      {selectedJob.service}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                    {renderBookingBadge(selectedJob.bookingType)}
                    {selectedJob.price && (
                      <span className="text-sm font-black text-emerald-600">
                        {selectedJob.price}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  {selectedJob.bookingType === "RECURRING" && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                      <p className="font-bold text-purple-800 text-[11px] uppercase tracking-wide mb-1">
                        🔄 Gói lặp lại:
                      </p>
                      <p className="text-slate-600">
                        Hệ thống tự động kích hoạt ca làm định kỳ hàng tuần cố
                        định cho khách hàng.
                      </p>
                    </div>
                  )}
                  {selectedJob.bookingType === "MONTHLY" && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                      <p className="font-bold text-orange-800 text-[11px] uppercase tracking-wide mb-1">
                        📅 Gói tháng:
                      </p>
                      <p className="text-slate-600">
                        Chuỗi dịch vụ dài hạn hàng tháng đã ký hợp đồng ràng
                        buộc.
                      </p>
                    </div>
                  )}
                  {selectedJob.bookingType === "247" && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                      <p className="font-bold text-rose-800 text-[11px] uppercase tracking-wide mb-1">
                        ❤️ Gói 24/7:
                      </p>
                      <p className="text-slate-600">
                        Dịch vụ chăm sóc y tế, nấu ăn hoặc hỗ trợ sinh hoạt
                        chuyên sâu.
                      </p>
                    </div>
                  )}

                  <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="material-symbols-outlined text-slate-400 text-lg mt-0.5">
                      account_circle
                    </span>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Khách hàng
                      </p>
                      <p className="font-bold text-slate-800">
                        {selectedJob.customer}
                      </p>
                      {selectedJob.phone && (
                        <p className="text-[10px] text-slate-500 font-medium">
                          SĐT: {selectedJob.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="material-symbols-outlined text-slate-400 text-lg mt-0.5">
                      calendar_month
                    </span>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Thời gian
                      </p>
                      <p className="text-slate-800 font-bold">
                        {selectedJob.time} · Ngày {selectedJob.dateStr}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {selectedJob.duration}
                        {selectedJob.staffCount > 1 &&
                          ` · ${selectedJob.staffCount} nhân viên`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="material-symbols-outlined text-slate-400 text-lg mt-0.5">
                      pin_drop
                    </span>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Địa chỉ
                      </p>
                      <p className="text-slate-700 font-semibold leading-relaxed">
                        {selectedJob.address}
                      </p>
                      {selectedJob.district && (
                        <p className="text-[11px] text-slate-500">
                          {selectedJob.district}
                        </p>
                      )}
                      {selectedJob.addressNote && (
                        <p className="text-[11px] text-blue-600 font-semibold mt-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">
                            directions
                          </span>
                          {selectedJob.addressNote}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Diện tích — chỉ hiện nếu có */}
                  {selectedJob.area && (
                    <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="material-symbols-outlined text-slate-400 text-lg mt-0.5">
                        straighten
                      </span>
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Diện tích
                        </p>
                        <p className="font-bold text-slate-800">
                          {selectedJob.area}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Thiết bị — chỉ hiện với dịch vụ máy móc */}
                  {selectedJob.deviceType && (
                    <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="material-symbols-outlined text-slate-400 text-lg mt-0.5">
                        build
                      </span>
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Thiết bị cần vệ sinh
                        </p>
                        <p className="font-bold text-slate-800">
                          {selectedJob.deviceCount} thiết bị
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {selectedJob.deviceType}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Số buổi gói — chỉ hiện với gói tháng/recurring */}
                  {selectedJob.bookingType === "MONTHLY" &&
                    selectedJob.totalSessions && (
                      <div className="flex items-center gap-2 p-2.5 bg-orange-50 rounded-xl border border-orange-100">
                        <span className="material-symbols-outlined text-orange-400 text-base">
                          repeat
                        </span>
                        <p className="text-xs font-bold text-orange-800">
                          Buổi {selectedJob.sessionIndex}/
                          {selectedJob.totalSessions} · Gói{" "}
                          {selectedJob.packageDuration}
                        </p>
                      </div>
                    )}

                  {/* Thanh toán */}
                  {selectedJob.paymentMethod && (
                    <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="material-symbols-outlined text-slate-400 text-base">
                        payments
                      </span>
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Phương thức thanh toán
                        </p>
                        <p className="text-xs font-bold text-slate-800">
                          {selectedJob.paymentMethod}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Ghi chú yêu cầu từ khách */}
                  {selectedJob.jobNote && (
                    <div className="relative rounded-xl overflow-hidden border border-amber-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-yellow-50"></div>
                      <div className="relative p-3">
                        <p className="text-[10px] font-black text-amber-700 flex items-center gap-1 mb-1.5">
                          <span className="material-symbols-outlined text-xs">
                            sticky_note_2
                          </span>
                          YÊU CẦU TỪ KHÁCH
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
                {/* LỊCH LÀM VIỆC → có check-in, hủy ca */}
                {selectedJob.origin === "calendar" && (
                  <div className="space-y-2">
                    {selectedJob.status !== "Đang làm việc" && (
                      <button
                        onClick={() => openCancelWorkflow(selectedJob)}
                        className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-2 rounded-xl border border-rose-200 transition-all text-xs"
                      >
                        Hủy ca làm đã nhận
                      </button>
                    )}
                    {selectedJob.status === "Sắp diễn ra" &&
                      (isCheckInAllowed(selectedJob) ? (
                        <button
                          onClick={() => handleCheckIn(selectedJob.id)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all text-xs"
                        >
                          Bấm chấm công (Vào làm)
                        </button>
                      ) : (
                        <div className="w-full bg-slate-100 text-slate-400 font-bold py-2.5 rounded-xl text-xs text-center border border-slate-200 cursor-not-allowed">
                          <span className="material-symbols-outlined text-xs mr-1 align-middle">
                            schedule
                          </span>
                          Chấm công mở trước 30 phút giờ làm
                        </div>
                      ))}
                    {selectedJob.status === "Đang làm việc" && (
                      <button
                        onClick={() => handleCompleteJob(selectedJob.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all text-xs"
                      >
                        Hoàn thành ca làm việc
                      </button>
                    )}
                  </div>
                )}

                {/* LỊCH MỚI → nhận / từ chối */}
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

                {/* LỊCH SỬ → chỉ đọc */}
                {selectedJob.origin === "history" && (
                  <div className="space-y-2">
                    <div
                      className={`p-3 rounded-xl border text-[11px] font-medium flex items-start gap-2
                      ${
                        selectedJob.closedReason === "Hoàn thành"
                          ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                          : "bg-rose-50 border-rose-100 text-rose-800"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">
                        {selectedJob.closedReason === "Hoàn thành"
                          ? "check_circle"
                          : "cancel"}
                      </span>
                      <div>
                        <p className="font-bold">{selectedJob.closedReason}</p>
                        <p className="mt-0.5 opacity-80">
                          Ghi nhận lúc: {selectedJob.closedAt}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* LỊCH ĐÃ NHẬN → chỉ xem, hướng dẫn check-in */}
                {selectedJob.origin === "accepted" && (
                  <div className="space-y-2">
                    <div className="bg-emerald-50 text-emerald-800 text-[11px] font-medium p-3 rounded-xl border border-emerald-100 flex items-start gap-2">
                      <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">
                        info
                      </span>
                      <span>
                        Vào tab <strong>"1. Lịch làm việc"</strong>, chọn ngày{" "}
                        <strong>{selectedJob.dateStr}</strong> để chấm công khi
                        đến giờ.
                      </span>
                    </div>
                    {selectedJob.autoMatched && (
                      <div className="bg-teal-50 border border-teal-200 p-2.5 rounded-xl text-[11px] text-teal-800 font-medium flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-sm text-teal-600 shrink-0 mt-0.5">
                          auto_awesome
                        </span>
                        <span>
                          Đơn này được <strong>hệ thống tự động ghép</strong>{" "}
                          dựa trên hợp đồng cam kết lịch rảnh của bạn.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 text-center">
              <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">
                ads_click
              </span>
              <p className="text-xs font-semibold max-w-[200px] mx-auto text-slate-500">
                Bấm chọn một đơn lịch bên cột trái để kiểm tra chi tiết.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ===== CONTRACT MODAL ===== */}
      {isContractModalOpen && !hasRegisteredContract && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 font-bold text-sm tracking-wide">
                <span className="material-symbols-outlined text-emerald-500 text-xl">
                  edit_calendar
                </span>
                <span>ĐĂNG KÝ HỢP ĐỒNG CAM KẾT LỊCH RẢNH CỐ ĐỊNH</span>
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
              {/* DATE RANGE */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <p className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  <span className="material-symbols-outlined text-sm text-emerald-600">
                    date_range
                  </span>
                  Thời hạn hiệu lực hợp đồng (Tối thiểu 2 tháng)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CustomDatePicker
                    label="Ngày bắt đầu"
                    value={contractForm.startDate}
                    min="2026-06-08"
                    portalMode={false}
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
                    portalMode={false}
                    min={(() => {
                      const d = new Date(contractForm.startDate);
                      d.setMonth(d.getMonth() + 2);
                      return d.toISOString().split("T")[0];
                    })()}
                    onChange={(val) =>
                      setContractForm((prev) => ({ ...prev, endDate: val }))
                    }
                  />
                </div>
                <p className="text-[11px] text-amber-700 font-medium bg-amber-50 border border-amber-200/60 px-3 py-2 rounded-xl flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">
                    info
                  </span>
                  Thời hạn kết thúc phải cách ngày bắt đầu ít nhất 2 tháng.
                </p>
              </div>

              {/* DAYS OF WEEK */}
              <div className="space-y-3">
                <p className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  <span className="material-symbols-outlined text-sm text-emerald-600">
                    today
                  </span>
                  Chọn ngày rảnh cố định trong tuần:
                </p>
                {contractForm.selectedDays.length === 0 && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">
                      warning
                    </span>
                    Vui lòng chọn ít nhất 1 ngày trong tuần bạn có thể làm việc.
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {[
                    "Thứ 2",
                    "Thứ 3",
                    "Thứ 4",
                    "Thứ 5",
                    "Thứ 6",
                    "Thứ 7",
                    "Chủ Nhật",
                  ].map((day) => {
                    const isSel = contractForm.selectedDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleToggleDay(day)}
                        className={`px-4 py-2.5 rounded-xl font-bold border transition-all text-xs active:scale-95
                          ${isSel ? "bg-emerald-600 text-white border-emerald-600 shadow-md" : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TIME SLOTS */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-4">
                <p className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  <span className="material-symbols-outlined text-sm text-emerald-600">
                    schedule
                  </span>
                  Thiết lập khung giờ trực tuyến (Tối đa 2 ca | 06:00 – 23:00)
                </p>

                {formError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-xl text-[11px] font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">
                      error
                    </span>
                    {formError}
                  </div>
                )}

                {contractForm.timeSlots.length < 2 ? (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TimePicker
                        label="Từ giờ"
                        hour={tempSlotUI.startHour}
                        minute={tempSlotUI.startMin}
                        onHourChange={(h) =>
                          setTempSlotUI((p) => ({ ...p, startHour: h }))
                        }
                        onMinuteChange={(m) =>
                          setTempSlotUI((p) => ({ ...p, startMin: m }))
                        }
                      />
                      <TimePicker
                        label="Đến giờ"
                        hour={tempSlotUI.endHour}
                        minute={tempSlotUI.endMin}
                        onHourChange={(h) =>
                          setTempSlotUI((p) => ({ ...p, endHour: h }))
                        }
                        onMinuteChange={(m) =>
                          setTempSlotUI((p) => ({ ...p, endMin: m }))
                        }
                      />
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500 font-medium">
                        Dự kiến:{" "}
                        <strong className="text-slate-700">
                          {tempSlotUI.startHour}:{tempSlotUI.startMin}
                        </strong>
                        {" → "}
                        <strong className="text-slate-700">
                          {tempSlotUI.endHour}:{tempSlotUI.endMin}
                        </strong>
                      </span>
                      <button
                        type="button"
                        onClick={validateAndAddTimeSlot}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1 shadow-md transition-all active:scale-95 text-xs"
                      >
                        <span className="material-symbols-outlined text-sm">
                          add_circle
                        </span>
                        Thêm khung giờ
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-amber-700 font-semibold text-[11px] bg-amber-50 p-3 rounded-xl border border-amber-200">
                    🔒 Đã cấu hình đủ tối đa 2 khung giờ.
                  </p>
                )}

                <div className="space-y-2">
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                    Khung giờ đã cấu hình:
                  </p>
                  {contractForm.timeSlots.length === 0 ? (
                    <p className="text-slate-400 italic pl-1 text-[11px]">
                      Chưa có khung giờ nào.
                    </p>
                  ) : (
                    contractForm.timeSlots.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm"
                      >
                        <span className="font-bold text-slate-700 flex items-center gap-2 text-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                          Khung {index + 1}: {slot}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(index)}
                          className="text-rose-500 hover:text-rose-700 font-bold text-xs transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsContractModalOpen(false)}
                className="bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-xl hover:bg-slate-300 text-sm"
              >
                Đóng lại
              </button>
              <button
                type="button"
                onClick={submitContractForm}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-xl shadow-md transition-all active:scale-95 text-sm"
              >
                Kích hoạt & Ký cam kết
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== BLOCK CALENDAR MODAL ===== */}
      {isBlockCalendarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden border border-slate-100">
            <div className="bg-slate-900 p-3.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-bold">
                <span className="material-symbols-outlined text-base">
                  block
                </span>
                Khóa lịch bận cá nhân
              </div>
              <button
                onClick={() => setIsBlockCalendarOpen(false)}
                className="material-symbols-outlined text-sm"
              >
                close
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-500 leading-relaxed">
                Chọn ngày bạn bận việc đột xuất. Hệ thống sẽ chặn mọi đơn đẩy về
                trong ngày đó.
              </p>
              <CustomDatePicker
                label="Chọn ngày bận"
                value={blockDate}
                min="2026-06-08"
                max="2026-06-14"
                portalMode={false}
                onChange={setBlockDate}
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBlockCalendarOpen(false)}
                  className="flex-1 bg-slate-100 py-2 rounded-xl font-bold text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleBlockCalendarSubmit}
                  className="flex-1 bg-slate-900 text-white py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                >
                  Lưu lịch bận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CANCEL JOB MODAL ===== */}
      {isCancelModalOpen && cancelTargetJob && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {/* 
            FIX: Modal này KHÔNG dùng overflow-y:auto trên wrapper chính
            để dropdown calendar có thể thoát ra ngoài bình thường.
            Thay vào đó chỉ scroll phần nội dung bên trong.
          */}
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="bg-rose-600 p-3.5 text-white flex items-center justify-between shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-1.5 text-sm font-bold">
                <span className="material-symbols-outlined text-base">
                  warning
                </span>
                Xác nhận Hủy ca / Xin nghỉ phép
              </div>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="material-symbols-outlined text-sm"
              >
                close
              </button>
            </div>

            {/* Scroll chỉ ở đây, KHÔNG trên wrapper ngoài */}
            <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700">
                <p>
                  <strong>Ca làm:</strong> {cancelTargetJob.id} -{" "}
                  {cancelTargetJob.service}
                </p>
                <p>
                  <strong>Khách hàng:</strong> {cancelTargetJob.customer}
                </p>
                <p>
                  <strong>Thời gian:</strong> {cancelTargetJob.dateStr} (
                  {cancelTargetJob.time})
                </p>
              </div>

              {cancelTargetJob.bookingType === "MONTHLY" ||
              cancelTargetJob.bookingType === "RECURRING" ? (
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wide text-[10px]">
                    Chọn hình thức xin nghỉ:
                  </label>
                  <div className="space-y-2">
                    {/* TH1 */}
                    <label
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${cancelType === "one_shift" ? "border-emerald-500 bg-emerald-50/20" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                    >
                      <input
                        type="radio"
                        name="cancelType"
                        checked={cancelType === "one_shift"}
                        onChange={() => setCancelType("one_shift")}
                        className="mt-0.5 accent-emerald-600"
                      />
                      <div>
                        <p className="font-bold text-slate-800">
                          Trường hợp 1: Chỉ nghỉ 1 ca này
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Ca hôm nay tự động đẩy lên chợ tìm người thay. Lịch
                          tuần sau giữ nguyên.
                        </p>
                      </div>
                    </label>

                    {/* TH2 */}
                    <label
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${cancelType === "multi_shifts" ? "border-amber-500 bg-amber-50/20" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                    >
                      <input
                        type="radio"
                        name="cancelType"
                        checked={cancelType === "multi_shifts"}
                        onChange={() => setCancelType("multi_shifts")}
                        className="mt-0.5 accent-amber-600"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">
                          Trường hợp 2: Nghỉ nhiều ca liên tiếp
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Nghỉ phép dài ngày do việc gia đình hoặc lý do bất khả
                          kháng.
                        </p>
                      </div>
                    </label>

                    {/* Date range cho TH2: render NGOÀI label, KHÔNG bị clip */}
                    {cancelType === "multi_shifts" && (
                      <div className="grid grid-cols-2 gap-3 px-2.5 py-3 bg-amber-50/40 border border-amber-200/60 rounded-xl">
                        {/* portalMode=true: dropdown dùng position:fixed, thoát khỏi overflow */}
                        <CustomDatePicker
                          label="Nghỉ từ ngày"
                          value={cancelDateRange.from}
                          min="2026-06-08"
                          portalMode={true}
                          onChange={(v) =>
                            setCancelDateRange((p) => ({ ...p, from: v }))
                          }
                        />
                        <CustomDatePicker
                          label="Đến hết ngày"
                          value={cancelDateRange.to}
                          min={cancelDateRange.from || "2026-06-08"}
                          portalMode={true}
                          onChange={(v) =>
                            setCancelDateRange((p) => ({ ...p, to: v }))
                          }
                        />
                      </div>
                    )}

                    {/* TH3 */}
                    <label
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${cancelType === "entire_package" ? "border-rose-500 bg-rose-50/20" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                    >
                      <input
                        type="radio"
                        name="cancelType"
                        checked={cancelType === "entire_package"}
                        onChange={() => setCancelType("entire_package")}
                        className="mt-0.5 accent-rose-600"
                      />
                      <div>
                        <p className="font-bold text-rose-700">
                          Trường hợp 3: Hủy toàn bộ gói đã cam kết
                        </p>
                        <p className="text-[10px] text-rose-600 mt-0.5">
                          Hủy hợp đồng dài hạn — chịu phạt vi phạm nặng
                          -150.000đ.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3 rounded-xl">
                  <p className="font-bold uppercase text-[10px]">
                    ⚠️ PHẠT HỦY CA LẺ:
                  </p>
                  <p>Hệ thống tự động trừ -50.000đ vào ví nội bộ.</p>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lý do giải trình:
                </label>
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
