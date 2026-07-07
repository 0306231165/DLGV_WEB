import React, { createContext, useContext, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import nhanVienApi from "../api/nhanVienApi";

const SimulatedTimeContext = createContext();

export const useSimulatedTime = () => {
  const context = useContext(SimulatedTimeContext);
  if (!context) {
    throw new Error("useSimulatedTime must be used within a SimulatedTimeProvider");
  }
  return context;
};

// Helper tìm thời điểm Chủ Nhật 23:59:59 của tuần chứa ngày date
const getSundayEndOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0: CN, 1: T2, ..., 6: T7
  const diffToSunday = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + diffToSunday);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Helper tìm Thứ 2 00:00:00 của tuần chứa ngày date
const getMondayStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatDateShort = (d) => {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

export const SimulatedTimeProvider = ({ children }) => {
  const [simulatedTime, setSimulatedTimeState] = useState(() => new Date());
  
  // Modal thông báo quyết toán tuần
  const [settlementModal, setSettlementModal] = useState({
    isOpen: false,
    weekRangeStr: "",
    jobCount: 0,
    totalAmount: 0,
    isSuccess: true,
    message: ""
  });

  // Hàm chuyển đổi chuỗi ngày DD/MM/YYYY thành Date
  const parseDateStr = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
    const isoParts = dateStr.split("-");
    if (isoParts.length === 3) {
      return new Date(Number(isoParts[0]), Number(isoParts[1]) - 1, Number(isoParts[2]));
    }
    return null;
  };

  // Hàm quyết toán cho tuần vừa qua
  // Hàm quyết toán cho tuần vừa qua hoặc khoảng thời gian tua vượt qua
  const triggerWeeklySettlement = async (prevDate, newDate) => {
    const monday = getMondayStartOfWeek(prevDate);
    const targetDate = newDate || getSundayEndOfWeek(prevDate);
    const weekRangeStr = `Từ ${formatDateShort(monday)} đến ${formatDateShort(targetDate)}`;

    try {
      // Lấy lịch sử công việc và ca làm việc để tổng hợp số ca hoàn thành
      const [resHist, resWork] = await Promise.all([
        nhanVienApi.getJobHistory().catch(() => ({ success: false, data: [] })),
        nhanVienApi.getWorkingSchedule().catch(() => ({ success: false, data: [] }))
      ]);

      const allJobs = [
        ...(resHist?.data || []),
        ...(resWork?.data || [])
      ];

      // Lọc các ca trong khoảng từ Thứ 2 gần nhất đến ngày kết thúc đã chọn
      const jobsInWeek = allJobs.filter(job => {
        const jobDate = parseDateStr(job.dateStr || job.ngay_lam);
        if (!jobDate) return false;
        jobDate.setHours(12, 0, 0, 0);
        const inRange = jobDate >= monday && jobDate <= targetDate;
        if (!inRange) return false;

        // Chỉ duyệt các ca làm việc có trang_thai_ca = DaHoanThanh
        const status = job.trang_thai_ca || job.status || job.trang_thai || "";
        const isCompleted = status === "DaHoanThanh" || status === "DA_HOAN_THANH" || status === "completed" || status === "hoan_thanh" || job.isCompleted === true;
        return isCompleted;
      });

      let jobCount = jobsInWeek.length;
      let totalAmount = jobsInWeek.reduce((sum, job) => {
        const price = Number(job.thuc_nhan_nv || job.price || 250000);
        return sum + (isNaN(price) ? 250000 : price);
      }, 0);

      // Gọi API cộng tiền vào ví với loai_giao_dich là NhanLuongCaLam
      if (totalAmount > 0) {
        await nhanVienApi.nhanLuongWallet({
          amount: totalAmount,
          loai_giao_dich: "NhanLuongCaLam",
          type: "NhanLuongCaLam",
          loai: "NhanLuongCaLam",
          description: `Nhận lương ca làm (${jobCount} ca hoàn thành - ${weekRangeStr})`,
          noi_dung: `Nhận lương ca làm (${jobCount} ca hoàn thành - ${weekRangeStr})`,
          note: `Nhận lương ca làm (${jobCount} ca hoàn thành - ${weekRangeStr})`
        }).catch(err => console.log("Lỗi deposit wallet simulation:", err));
      }

      // Hiển thị Modal chúc mừng quyết toán
      setSettlementModal({
        isOpen: true,
        weekRangeStr,
        jobCount,
        totalAmount,
        isSuccess: true,
        message: `Hệ thống đã kiểm tra và chốt sổ ${weekRangeStr}.\nTổng cộng ${jobCount} ca làm việc (Đã hoàn thành). Thu nhập +${totalAmount.toLocaleString("vi-VN")}đ đã được chuyển thẳng vào Ví của bạn!`
      });

    } catch (error) {
      console.error("Lỗi khi quyết toán tuần giả lập:", error);
    }
  };

  // Hàm thay đổi thời gian giả lập (có kiểm tra ranh giới tuần)
  const setSimulatedTime = (newDate) => {
    setSimulatedTimeState((prevDate) => {
      const prevSundayEnd = getSundayEndOfWeek(prevDate);
      
      // Nếu thời gian mới tiến vượt qua 23:59:59 Chủ Nhật của tuần cũ -> Kích hoạt quyết toán tuần
      if (newDate.getTime() > prevSundayEnd.getTime() && newDate > prevDate) {
        // Trigger asynchronous settlement
        triggerWeeklySettlement(prevDate, newDate);
      }
      return newDate;
    });
  };

  // Các tiện ích chỉnh sửa thời gian
  const setSimulatedDate = (year, month, day) => {
    setSimulatedTime(new Date(year, month, day, simulatedTime.getHours(), simulatedTime.getMinutes(), simulatedTime.getSeconds()));
  };

  const setSimulatedTimeOfDay = (hour, minute) => {
    const next = new Date(simulatedTime);
    next.setHours(Number(hour), Number(minute), 0, 0);
    setSimulatedTime(next);
  };

  const resetToRealTime = () => {
    setSimulatedTime(new Date());
  };

  return (
    <SimulatedTimeContext.Provider
      value={{
        simulatedTime,
        setSimulatedTime,
        setSimulatedDate,
        setSimulatedTimeOfDay,
        resetToRealTime
      }}
    >
      {children}

      {/* MODAL THÔNG BÁO QUYẾT TOÁN TUẦN */}
      {settlementModal.isOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[999999] p-4 animate-in fade-in duration-200" style={{ pointerEvents: "all" }}>
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden transform transition-all scale-100 p-6 text-center space-y-4"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-inner bg-emerald-100 text-emerald-600 border border-emerald-200">
              <span className="material-symbols-outlined text-3xl font-bold">celebration</span>
            </div>
            
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-full uppercase tracking-wider border border-emerald-200">
                Tự động quyết toán tuần
              </span>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Chốt Sổ Thu Nhập Tuần!</h3>
              <p className="text-xs font-bold text-slate-500">{settlementModal.weekRangeStr}</p>
              
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 my-3 flex items-center justify-around">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Ca hoàn thành</p>
                  <p className="text-xl font-black text-slate-800 mt-0.5">{settlementModal.jobCount} <span className="text-xs font-bold">ca</span></p>
                </div>
                <div className="w-[1px] h-10 bg-slate-200"></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Chuyển vào ví</p>
                  <p className="text-xl font-black text-emerald-600 mt-0.5">+{settlementModal.totalAmount.toLocaleString("vi-VN")}đ</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium px-2">
                {settlementModal.message}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSettlementModal({ ...settlementModal, isOpen: false })}
                className="w-full py-3 px-6 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25 cursor-pointer"
              >
                <span>Tuyệt vời! Đã nhận thu nhập</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </SimulatedTimeContext.Provider>
  );
};
