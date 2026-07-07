import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSimulatedTime } from "../../contexts/SimulatedTimeContext";

const SidebarTimeSimulator = () => {
  const { simulatedTime, setSimulatedDate, setSimulatedTimeOfDay, resetToRealTime } = useSimulatedTime();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("date"); // 'date' hoặc 'time'

  // Temporary state for the form inside modal
  const [formDate, setFormDate] = useState("");
  const [formHour, setFormHour] = useState(8);
  const [formMinute, setFormMinute] = useState(0);

  const dayNames = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const dayName = dayNames[simulatedTime.getDay()];

  const formatDateDisplay = (d) => {
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const formatTimeDisplay = (d) => {
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const getIsoDateStr = (d) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const openModal = (tab = "date") => {
    setActiveTab(tab);
    setFormDate(getIsoDateStr(simulatedTime));
    setFormHour(simulatedTime.getHours());
    setFormMinute(simulatedTime.getMinutes());
    setIsModalOpen(true);
  };

  const handleHourChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val !== "" && val.length > 1 && val.startsWith("0")) {
      val = val.replace(/^0+/, "") || "0";
    }
    let num = val === "" ? "" : Number(val);
    if (num !== "" && num > 23) num = 23;
    setFormHour(num);
  };

  const handleMinuteChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val !== "" && val.length > 1 && val.startsWith("0")) {
      val = val.replace(/^0+/, "") || "0";
    }
    let num = val === "" ? "" : Number(val);
    if (num !== "" && num > 59) num = 59;
    setFormMinute(num);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === "date") {
      if (formDate) {
        const [y, m, d] = formDate.split("-").map(Number);
        setSimulatedDate(y, m - 1, d);
      }
    } else {
      setSimulatedTimeOfDay(Number(formHour || 0), Number(formMinute || 0));
    }
    setIsModalOpen(false);
  };

  // Quick jump helpers
  const jumpDays = (days) => {
    const next = new Date(simulatedTime);
    next.setDate(next.getDate() + days);
    setSimulatedDate(next.getFullYear(), next.getMonth(), next.getDate());
    setIsModalOpen(false);
  };

  const jumpToSundayEnd = () => {
    const next = new Date(simulatedTime);
    const day = next.getDay();
    const diffToSunday = day === 0 ? 7 : 7 - day; // Nếu đang là CN thì nhảy qua CN tuần sau
    next.setDate(next.getDate() + diffToSunday);
    setSimulatedDate(next.getFullYear(), next.getMonth(), next.getDate());
    setIsModalOpen(false);
  };

  const isModified = Math.abs(simulatedTime.getTime() - new Date().getTime()) > 60000 || simulatedTime.getDate() !== new Date().getDate();

  return (
    <>
      <div className="mx-3 mb-2 p-3 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white shadow-lg border border-slate-700/60 relative overflow-hidden group">
        {/* Huy hiệu nhấp nháy */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-[10px] font-black tracking-wider uppercase text-amber-300">
              Giả lập thời gian
            </span>
          </div>
          {isModified && (
            <button
              type="button"
              onClick={resetToRealTime}
              title="Quay về giờ thực tế"
              className="text-[10px] bg-white/10 hover:bg-white/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md transition-all flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[12px]">restart_alt</span>
              Reset
            </button>
          )}
        </div>

        {/* Hiển thị Ngày / Tháng / Năm */}
        <div 
          onClick={() => openModal("date")}
          className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-xl p-2 transition-colors mb-1.5 cursor-pointer group/item"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Ngày hệ thống</span>
            <span className="text-[10px] text-amber-300 font-bold group-hover/item:underline flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">edit_calendar</span>
              Đổi ngày
            </span>
          </div>
          
          <div className="mt-1 font-black text-xs text-white flex items-center gap-1.5 group-hover/item:text-amber-300 transition-colors">
            <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-extrabold">{dayName}</span>
            <span className="tracking-wide">{formatDateDisplay(simulatedTime)}</span>
          </div>
        </div>

        {/* Hiển thị Giờ / Phút */}
        <div 
          onClick={() => openModal("time")}
          className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-xl p-2 transition-colors cursor-pointer group/item"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Đồng hồ gốc</span>
            <span className="text-[10px] text-emerald-300 font-bold group-hover/item:underline flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">schedule</span>
              Tua giờ
            </span>
          </div>

          <div className="mt-1 font-black text-sm text-emerald-400 flex items-center gap-1.5 group-hover/item:text-emerald-300 transition-colors">
            <span className="material-symbols-outlined text-base">timer</span>
            <span className="tracking-wider">{formatTimeDisplay(simulatedTime)}</span>
          </div>
        </div>

        {/* Chú thích nhỏ bên dưới */}
        <div className="mt-2 text-[9px] text-slate-400 text-center italic">
          Bấm để mở bảng chọn ngày & tua nhanh
        </div>
      </div>

      {/* MODAL FORM CHỌN NGÀY / GIỜ */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[999999] p-4 animate-in fade-in duration-200" style={{ pointerEvents: "all" }}>
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden transform transition-all scale-100 p-6 space-y-5"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">update</span>
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Bộ Điều Khiển Giả Lập</h3>
                  <p className="text-xs text-slate-400 font-medium">Tua thời gian hệ thống để kiểm thử đồ án</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Tabs chọn Ngày vs Giờ */}
            <div className="flex bg-slate-100 p-1 rounded-xl font-bold text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("date")}
                className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === "date" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
              >
                <span className="material-symbols-outlined text-sm text-amber-500">calendar_month</span>
                Chỉnh Ngày / Tháng
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("time")}
                className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === "time" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
              >
                <span className="material-symbols-outlined text-sm text-emerald-500">schedule</span>
                Chỉnh Giờ / Phút
              </button>
            </div>

            {/* Nội dung theo Tab */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === "date" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Chọn ngày cụ thể
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Cụm nút tua nhanh */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Tua nhanh thời gian (Nút tắt)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => jumpDays(1)}
                        className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">fast_forward</span>
                        +1 Ngày (Ngày mai)
                      </button>
                      <button
                        type="button"
                        onClick={() => jumpDays(7)}
                        className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">redo</span>
                        +7 Ngày (1 Tuần)
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={jumpToSundayEnd}
                      className="w-full py-3 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">payments</span>
                      Tua sang Chủ Nhật tuần tới (Chốt sổ lương tuần!)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Giờ (0 - 23)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formHour}
                        onChange={handleHourChange}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Phút (0 - 59)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formMinute}
                        onChange={handleMinuteChange}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Chọn giờ nhanh */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Mốc giờ làm việc phổ biến
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[8, 12, 14, 18].map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => { setFormHour(h); setFormMinute(0); }}
                          className={`py-2 rounded-xl text-xs font-extrabold transition-all border ${formHour === h && formMinute === 0 ? "bg-emerald-600 text-white border-emerald-600" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"}`}
                        >
                          {String(h).padStart(2, "0")}:00
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Nút submit */}
              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">check</span>
                  Cập nhật thời gian
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default SidebarTimeSimulator;
