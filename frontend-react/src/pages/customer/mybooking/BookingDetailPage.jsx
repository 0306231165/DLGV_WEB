import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mapApiToBookingDetailFormat } from './BookingUtils';
import khachHangApi from '../../../api/khachHangApi';


// ─── Helpers ─────────────────────────────────────────────────────────────
const getToday = () => {
  const dt = new Date();
  dt.setHours(0, 0, 0, 0);
  return dt;
};

const formatDMY = (dt) =>
  `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;

const parseDMY = (str) => {
  const [d, m, y] = str.split('/').map(Number);
  return new Date(y, m - 1, d);
};


const getOriginalPackageEndDate = (booking) =>
  booking.packageInfo?.endDate;

const getExtensionLimitDate = (booking) => {
  const contractEndDate = parseDMY(getOriginalPackageEndDate(booking));
  return new Date(contractEndDate.getFullYear(), contractEndDate.getMonth() + 2, 0);
};



const SESSION_STATUS_ORDER = {
  awaiting_confirm: 0,
  active: 1,
  upcoming: 2,
  completed: 3,
  cancelled: 4,
};

const isRescheduleRequest = (session) =>
  session?.status === 'awaiting_confirm' &&
  !!session?.rescheduleDate &&
  session.rescheduleDate !== session.date;

const getSessionDisplayDate = (session) =>
  isRescheduleRequest(session) ? session.rescheduleDate : session?.date;

const sortPackageSessions = (sessions = []) =>
  [...sessions].sort((a, b) => {
    const dateA = parseDMY(getSessionDisplayDate(a));
    const dateB = parseDMY(getSessionDisplayDate(b));
    const dateDiff = dateA - dateB;
    if (dateDiff !== 0) return dateDiff;

    const statusDiff = (SESSION_STATUS_ORDER[a.status] ?? 9) - (SESSION_STATUS_ORDER[b.status] ?? 9);
    if (statusDiff !== 0) return statusDiff;

    const timeDiff = String(a.time || '').localeCompare(String(b.time || ''), 'vi');
    if (timeDiff !== 0) return timeDiff;

    return String(a.id || '').localeCompare(String(b.id || ''), 'vi');
  });

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const isMonthlyPackageBooking = (booking) => {
  if (!booking?.isPackage) return false;
  const packageText = [
    booking?.packageInfo?.type,
    booking?.service?.packageType,
    booking?.service?.title,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return packageText.includes('tháng') || packageText.includes('24/7');
};

const getTransferStatusLabel = (label) =>
  label?.includes('ĐANG THỰC HIỆN')
    ? label.replace('ĐANG THỰC HIỆN', 'CHỜ XÁC NHẬN')
    : label
      ? `${label} • CHỜ XÁC NHẬN`
      : 'CHỜ XÁC NHẬN';


const PackageSessionPanel = ({
  booking,
  allSessions,
  renderSessionTitle,
  renderSessionSubInfo,
  handleOpenActionModal,
  setBooking,
  fetchBookingDetail,
}) => {
  const { startDate, endDate } = booking.packageInfo;
  const [, sm, sy] = startDate.split('/').map(Number);
  const [, em, ey] = endDate.split('/').map(Number);
  const originalContractEndDate = parseDMY(getOriginalPackageEndDate(booking));
  const originalContractEndMonth = new Date(
    originalContractEndDate.getFullYear(),
    originalContractEndDate.getMonth(),
    1
  );
  const isSessionBeyondOriginalContract = (session) =>
    parseDMY(getSessionDisplayDate(session)) > originalContractEndDate;

  // Tạo danh sách tháng từ startDate → endDate
  const months = [];
  let cur = new Date(sy, sm - 1, 1);
  const endD = new Date(ey, em - 1, 1);
  while (cur <= endD) {
    months.push({ year: cur.getFullYear(), month: cur.getMonth() + 1 });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const getDefaultTab = () => {
    const activeSession = allSessions.find((s) => s.status === 'active');
    if (activeSession) {
      const [, mo, y] = activeSession.date.split('/').map(Number);
      return months.find((m) => m.year === y && m.month === mo) || months[0];
    }
    const inRange = months.find((m) => m.year === currentYear && m.month === currentMonth);
    if (inRange) return inRange;
    return months[months.length - 1];
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab);
  const tabsRef = useRef(null);

  useEffect(() => {
    const el = tabsRef.current?.querySelector('[data-active="true"]');
    if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, []);

  // Khi endDate thay đổi (mở rộng hợp đồng), auto-jump sang tab tháng mới nhất
  const prevEndDateRef = useRef(endDate);
  useEffect(() => {
    if (endDate !== prevEndDateRef.current) {
      prevEndDateRef.current = endDate;
      const [, em2, ey2] = endDate.split('/').map(Number);
      setActiveTab({ year: ey2, month: em2 });
    }
  }, [endDate]);

  const sessionsByMonth = {};
  allSessions.forEach((s) => {
    const [, mo, y] = s.date.split('/').map(Number);
    const key = `${y}-${mo}`;
    if (!sessionsByMonth[key]) sessionsByMonth[key] = [];
    sessionsByMonth[key].push(s);
  });

  const tabKey = `${activeTab.year}-${activeTab.month}`;
  const tabSessions = sortPackageSessions(sessionsByMonth[tabKey] || []);

  const getStats = (m) => {
    const ss = sessionsByMonth[`${m.year}-${m.month}`] || [];
    return {
      total: ss.length,
      completed: ss.filter((s) => s.status === 'completed').length,
      active: ss.filter((s) => s.status === 'active').length,
      upcoming: ss.filter((s) => s.status === 'upcoming' || s.status === 'awaiting_confirm').length,
      cancelled: ss.filter((s) => s.status === 'cancelled').length,
    };
  };

  return (
    <>
      {/* ── Thanh tháng ── */}
      <div
        ref={tabsRef}
        className="flex gap-2 overflow-x-auto overscroll-x-contain scroll-smooth pt-2 pb-3 mb-5 -mx-1 px-1 max-w-full"
        style={{ scrollbarWidth: 'thin', msOverflowStyle: 'auto' }}
      >
        {months.map((m) => {
          const isActive = m.year === activeTab.year && m.month === activeTab.month;
          const isCurrent = m.year === currentYear && m.month === currentMonth;
          const isPast = m.year < currentYear || (m.year === currentYear && m.month < currentMonth);
          const stats = getStats(m);
          const monthDate = new Date(m.year, m.month - 1, 1);
          const hasExtendedSession = monthDate > originalContractEndMonth;

          let badgeText = '';
          let badgeColor = isActive ? 'text-white/80' : 'text-primary';
          if (stats.active > 0) { badgeText = '▶ đang làm'; badgeColor = isActive ? 'text-white' : 'text-blue-600'; }
          else if (stats.upcoming > 0) badgeText = `${stats.upcoming} ca`;
          else if (stats.completed > 0 && stats.upcoming === 0) { badgeText = `✓ ${stats.completed}`; badgeColor = isActive ? 'text-white/70' : 'text-green-600'; }

          return (
            <button
              key={`${m.year}-${m.month}`}
              data-active={isActive}
              onClick={() => setActiveTab(m)}
              className={`
                shrink-0 flex flex-col items-center px-3 py-2.5 rounded-2xl border transition-all font-bold min-w-[64px] relative
                ${isActive
                  ? hasExtendedSession
                    ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/30 scale-105'
                    : 'bg-primary text-white border-primary shadow-lg shadow-primary/30 scale-105'
                  : hasExtendedSession
                  ? 'bg-orange-50 text-orange-700 border-orange-300 ring-1 ring-orange-200'
                  : isCurrent
                  ? 'bg-primary/10 text-primary border-primary/40 ring-2 ring-primary/20'
                  : isPast
                  ? 'bg-surface text-on-surface-variant/60 border-outline-variant/20'
                  : 'bg-surface text-on-surface-variant border-outline-variant/30 hover:border-primary/40 hover:text-primary'}
              `}
            >
              {hasExtendedSession && !isActive && (
                <span className="absolute -top-1.5 -right-1.5 text-[8px] font-black bg-orange-500 text-white px-1 py-0.5 rounded-full leading-none">+MR</span>
              )}
              <span className="text-sm font-black leading-none">T{m.month}</span>
              <span className={`text-[10px] mt-0.5 leading-none ${isActive ? 'text-white/70' : 'text-on-surface-variant/60'}`}>
                {m.year}
              </span>
              {badgeText && (
                <span className={`text-[9px] font-black mt-1 leading-none ${badgeColor}`}>
                  {badgeText}
                </span>
              )}
              {!isActive && stats.active > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-0.5"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tiêu đề tháng đang xem ── */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="text-sm font-black text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[16px]">calendar_month</span>
          Tháng {activeTab.month}/{activeTab.year}
          {/* Badge "Mở rộng" nếu tháng này có ca extended */}
          {(new Date(activeTab.year, activeTab.month - 1, 1)) > originalContractEndMonth && (
            <span className="text-[9px] font-black bg-orange-100 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
              Mở rộng HĐ
            </span>
          )}
        </div>
        {(() => {
          const stats = getStats(activeTab);
          return (
            <div className="flex gap-1.5 flex-wrap justify-end">
              {stats.active > 0 && <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{stats.active} đang làm</span>}
              {stats.upcoming > 0 && <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full">{stats.upcoming} sắp tới</span>}
              {stats.completed > 0 && <span className="text-[10px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ {stats.completed} hoàn thành</span>}
              {stats.cancelled > 0 && <span className="text-[10px] font-black bg-red-100 text-red-500 px-2 py-0.5 rounded-full">{stats.cancelled} đã hủy</span>}
            </div>
          );
        })()}
      </div>

      {/* ── Danh sách ca ── */}
      {tabSessions.length === 0 ? (
        <div className="text-center py-10 text-on-surface-variant text-sm font-medium bg-surface-container-low/50 rounded-2xl border border-outline-variant/20">
          <span className="material-symbols-outlined text-2xl mb-2 block opacity-40">event_busy</span>
          Không có ca nào trong tháng này.
        </div>
      ) : (
        <div className="space-y-3">
          {tabSessions.map((session) => {
            const displaySession = {
              ...session,
              isExtended: isSessionBeyondOriginalContract(session),
            };

            return (
              <SessionRow
                key={displaySession.id}
                session={displaySession}
                renderSessionTitle={renderSessionTitle}
                renderSessionSubInfo={renderSessionSubInfo}
                onReschedule={() => handleOpenActionModal('reschedule', displaySession.id)}
                onCancel={() => handleOpenActionModal('cancel', displaySession.id)}
                fetchBookingDetail={fetchBookingDetail}
              />
            );
          })}
        </div>
      )}
    </>
  );
};

// ─── SessionRow ──────────────────────────────────────────────────────────────
const SessionRow = ({ session, renderSessionTitle, renderSessionSubInfo, onReschedule, onCancel, fetchBookingDetail }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeForm, setActiveForm] = useState(null); // 'rating' | 'report' | null

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300
          ${session.status === 'completed' ? 'bg-primary/5 border-primary/20'
          : session.status === 'cancelled' ? 'bg-red-50/50 border-red-100 opacity-60'
          : session.status === 'active' ? 'bg-surface border-blue-200 shadow-md shadow-blue-500/10'
          : session.status === 'awaiting_confirm' ? 'bg-amber-50 border-amber-200 shadow-sm shadow-amber-100'
          : session.isExtended ? 'bg-orange-50/60 border-orange-200 hover:border-orange-300'
          : 'bg-surface hover:border-primary/30 border-outline-variant/20 hover:shadow-md'}`}
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-0.5
              ${session.status === 'completed' ? 'bg-primary text-white shadow-primary/20'
              : session.status === 'cancelled' ? 'bg-red-100 text-red-500'
              : session.status === 'active' ? 'bg-blue-600 text-white shadow-blue-600/30 animate-pulse'
              : session.status === 'awaiting_confirm' ? 'bg-amber-100 text-amber-600'
              : session.isExtended ? 'bg-orange-100 text-orange-600'
              : 'bg-primary/10 text-primary'}`}
          >
            <span className="material-symbols-outlined text-xl">
              {session.status === 'completed' ? 'check'
              : session.status === 'cancelled' ? 'close'
              : session.status === 'active' ? 'motion_photos_on'
              : session.status === 'awaiting_confirm' ? 'hourglass_empty'
              : session.isExtended ? 'event_available'
              : 'event'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            {renderSessionTitle(session)}
            {renderSessionSubInfo(session)}
          </div>
        </div>

        {session.status === 'upcoming' && (
          <div className="flex gap-2 w-full sm:w-auto shrink-0 sm:self-center">
            <button
              onClick={onReschedule}
              className="flex-1 sm:flex-none px-4 py-2 bg-white border border-outline-variant/30 text-primary text-sm font-bold rounded-xl hover:bg-primary/5 active:scale-95 transition-all shadow-sm"
            >
              Dời lịch
            </button>
            <button
              onClick={onCancel}
              className="flex-1 sm:flex-none px-4 py-2 bg-white border border-error/20 text-error text-sm font-bold rounded-xl hover:bg-error/5 active:scale-95 transition-all shadow-sm"
            >
              Hủy ca
            </button>
          </div>
        )}

        {session.status === 'awaiting_confirm' && (
          <div className="flex gap-2 w-full sm:w-auto shrink-0 sm:self-center">
            <button
              onClick={onCancel}
              className="flex-1 sm:flex-none px-4 py-2 bg-error/10 border border-error/20 text-error text-sm font-bold rounded-xl hover:bg-error/15 active:scale-95 transition-all shadow-sm"
            >
              Hủy ca
            </button>
          </div>
        )}

        {session.status === 'completed' && (
          <div className="flex gap-2 w-full sm:w-auto shrink-0 sm:self-center">
            <button
              onClick={() => { setIsExpanded(!isExpanded); setActiveForm(null); }}
              className="flex-1 sm:flex-none px-4 py-2 bg-white border border-outline-variant/30 text-primary text-sm font-bold rounded-xl hover:bg-primary/5 active:scale-95 transition-all shadow-sm"
            >
              {isExpanded ? 'Đóng' : 'Chi tiết'}
            </button>
          </div>
        )}
      </div>

      {isExpanded && session.status === 'completed' && (
        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 flex flex-col md:flex-row gap-4 animate-in slide-in-from-top-2">
          {/* Left Buttons */}
          <div className="flex flex-col gap-2 w-full md:w-1/3 shrink-0">
            <button 
              onClick={() => setActiveForm(activeForm === 'rating' ? null : 'rating')}
              className={`w-full py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeForm === 'rating' ? 'bg-primary text-on-primary shadow-md' : 'bg-white border border-outline-variant/30 text-primary hover:bg-primary/5'}`}
            >
              <span className="material-symbols-outlined text-base">star_rate</span>
              {session.sao_danh_gia ? 'Đã đánh giá' : 'Đánh giá dịch vụ'}
            </button>
            <button 
              onClick={() => setActiveForm(activeForm === 'report' ? null : 'report')}
              className={`w-full py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeForm === 'report' ? 'bg-error text-white shadow-md' : 'bg-white border border-error/30 text-error hover:bg-error/5'}`}
            >
              {session.khieu_nai ? 'Đã báo cáo sự cố' : 'Báo cáo sự cố'}
            </button>
          </div>

          {/* Right Form Content */}
          <div className="flex-1 min-w-0">
            {activeForm === 'rating' ? (
              <RatingForm 
                session={session} 
                onSuccess={() => { setActiveForm(null); setIsExpanded(false); if(fetchBookingDetail) fetchBookingDetail(); }} 
                onCancel={() => setActiveForm(null)} 
              />
            ) : activeForm === 'report' ? (
              <ReportForm 
                session={session} 
                onSuccess={() => { setActiveForm(null); setIsExpanded(false); if(fetchBookingDetail) fetchBookingDetail(); }} 
                onCancel={() => setActiveForm(null)} 
              />
            ) : (
              <div className="h-full min-h-[100px] flex items-center justify-center text-on-surface-variant text-sm p-4 bg-white rounded-xl border border-dashed border-outline-variant/50">
                Chọn một chức năng bên trái để thao tác.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Forms ───────────────────────────────────────────────────────────────────
const RatingForm = ({ session, onSuccess, onCancel }) => {
  const [stars, setStars] = useState(5);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await khachHangApi.rateSession(session.id, { sao_danh_gia: stars, noi_dung_danh_gia: content });
      onSuccess();
    } catch (err) {
      alert("Có lỗi xảy ra khi gửi đánh giá.");
    } finally {
      setLoading(false);
    }
  };

  if (session.sao_danh_gia) {
    return (
      <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex flex-col items-center justify-center text-center">
        <div className="flex gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={`material-symbols-outlined text-2xl ${star <= session.sao_danh_gia ? 'text-amber-400' : 'text-gray-200'}`}>
              star
            </span>
          ))}
        </div>
        <p className="text-sm text-on-surface-variant font-medium">Bạn đã đánh giá {session.sao_danh_gia} sao cho ca này.</p>
        {session.noi_dung_danh_gia && (
          <p className="text-xs text-on-surface-variant mt-2 italic">"{session.noi_dung_danh_gia}"</p>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 animate-in fade-in slide-in-from-top-2">
      <h4 className="font-bold text-sm mb-3">Đánh giá chất lượng dịch vụ</h4>
      <div className="flex items-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} onClick={() => setStars(star)} className="focus:outline-none transition-transform hover:scale-110 active:scale-95">
            <span className={`material-symbols-outlined text-3xl ${star <= stars ? 'text-amber-400' : 'text-gray-200'}`}>
              star
            </span>
          </button>
        ))}
      </div>
      <textarea
        placeholder="Chia sẻ trải nghiệm của bạn (không bắt buộc)..."
        value={content}
        onChange={e => setContent(e.target.value)}
        className="w-full p-3 bg-white border border-outline-variant/50 rounded-xl text-sm focus:outline-none focus:border-primary/50 resize-none mb-3"
        rows={3}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button onClick={onCancel} className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container rounded-lg transition-all">
            Hủy
          </button>
        )}
        <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 text-sm font-bold bg-primary text-on-primary rounded-lg shadow-md hover:bg-primary/90 transition-all disabled:opacity-50">
          {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </div>
    </div>
  );
};

const ReportForm = ({ session, onSuccess, onCancel }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return alert("Vui lòng nhập lý do sự cố.");
    setLoading(true);
    try {
      await khachHangApi.reportSession(session.id, { ly_do_khieu_nai: reason, mo_ta_chi_tiet: details });
      alert("Đã gửi báo cáo sự cố thành công. Chúng tôi sẽ xử lý sớm nhất.");
      onSuccess();
    } catch (err) {
      alert("Có lỗi xảy ra khi gửi báo cáo.");
    } finally {
      setLoading(false);
    }
  };

  if (session.khieu_nai) {
    const kn = session.khieu_nai;
    return (
      <div className="p-4 bg-error/5 rounded-xl border border-error/20 flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-3xl text-error mb-2">report</span>
        <p className="text-sm text-error font-bold mb-1">Bạn đã gửi báo cáo sự cố.</p>
        <p className="text-xs text-on-surface-variant font-medium">Lý do: {kn.ly_do_khieu_nai}</p>
        {kn.mo_ta_chi_tiet && (
          <p className="text-xs text-on-surface-variant mt-2 italic">Chi tiết: "{kn.mo_ta_chi_tiet}"</p>
        )}
        <div className={`mt-3 px-3 py-1 text-xs font-bold rounded-full ${kn.trang_thai_xu_ly === 'DangXuLy' ? 'bg-amber-100 text-amber-700' : kn.trang_thai_xu_ly === 'DaGiaiQuyet' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          Trạng thái: {kn.trang_thai_xu_ly === 'DangXuLy' ? 'Đang xử lý' : kn.trang_thai_xu_ly === 'DaGiaiQuyet' ? 'Đã giải quyết' : 'Từ chối'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-error/5 rounded-xl border border-error/20 animate-in fade-in slide-in-from-top-2">
      <h4 className="font-bold text-sm text-error mb-3">Báo cáo sự cố phát sinh</h4>
      <input
        type="text"
        placeholder="Lý do ngắn gọn (VD: Nhân viên đến muộn, Hư hỏng đồ đạc...)"
        value={reason}
        onChange={e => setReason(e.target.value)}
        className="w-full p-3 mb-3 bg-white border border-error/30 rounded-xl text-sm focus:outline-none focus:border-error/50"
      />
      <textarea
        placeholder="Mô tả chi tiết sự việc..."
        value={details}
        onChange={e => setDetails(e.target.value)}
        className="w-full p-3 bg-white border border-error/30 rounded-xl text-sm focus:outline-none focus:border-error/50 resize-none mb-3"
        rows={3}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button onClick={onCancel} className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container rounded-lg transition-all">
            Hủy
          </button>
        )}
        <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 text-sm font-bold bg-error text-white rounded-lg shadow-md shadow-error/20 hover:bg-error/90 transition-all disabled:opacity-50">
          {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
        </button>
      </div>
    </div>
  );
};

// ─── Component chính ─────────────────────────────────────────────────────────
const BookingDetailPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [chatRoomId, setChatRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isPolling, setIsPolling] = useState(false);
  const chatRoomIdRef = useRef(null);
  const isChatOpenRef = useRef(false);

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);


  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [refundData, setRefundData] = useState(null);

  const [calendarViewDate, setCalendarViewDate] = useState(new Date());

  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: null,
    sessionId: null,
    data: null,
    staffOption: 'favorite',
  });


  // Cập nhật ref để dùng trong polling
  useEffect(() => {
    chatRoomIdRef.current = chatRoomId;
  }, [chatRoomId]);

  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
  }, [isChatOpen]);

  // Polling chat
  useEffect(() => {
    let isMounted = true;
    let timerId;

    const pollChatData = async () => {
      if (!isMounted) return;
      
      // Chỉ poll khi chat đang mở và có booking
      if (isChatOpenRef.current && booking?.id) {
        try {
          let currentRoomId = chatRoomIdRef.current;
          
          // Nếu chưa có room id, gọi danh sách room để tìm
          if (!currentRoomId) {
            const rooms = await khachHangApi.getChatRooms();
            // Match room với donHangId hiện tại
            const matchedRoom = rooms.find(r => String(r.bookingId) === String(booking.id));
            if (matchedRoom) {
              currentRoomId = matchedRoom.id;
              setChatRoomId(currentRoomId);
            }
          }
          
          // Nếu đã có room id, load tin nhắn
          if (currentRoomId) {
            const msgs = await khachHangApi.getMessages(currentRoomId);
            setMessages(msgs);
          }
        } catch (e) {
          console.error("Lỗi lấy tin nhắn:", e);
        }
      }

      if (isMounted) {
        timerId = setTimeout(pollChatData, 10000);
      }
    };

    pollChatData();

    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [booking?.id]);

  useEffect(() => {
    if (isChatOpen) {
      // Khi vừa mở chat, gọi ngay lập tức để không phải chờ 10s
      const fetchInitial = async () => {
        try {
          let currentRoomId = chatRoomIdRef.current;
          if (!currentRoomId && booking?.id) {
            const rooms = await khachHangApi.getChatRooms();
            const matchedRoom = rooms.find(r => String(r.bookingId) === String(booking.id));
            if (matchedRoom) {
              currentRoomId = matchedRoom.id;
              setChatRoomId(currentRoomId);
            }
          }
          if (currentRoomId) {
            const msgs = await khachHangApi.getMessages(currentRoomId);
            setMessages(msgs);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchInitial();
      
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [isChatOpen, booking?.id]);

  const fetchBookingDetail = useCallback(() => {
    khachHangApi.getBookingDetail(id)
      .then((res) => {
        if (res.success && res.data) {
          const formattedData = mapApiToBookingDetailFormat(res.data);
          setBooking(formattedData);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi tải chi tiết đơn hàng:", err);
      });
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBookingDetail();
  }, [fetchBookingDetail]);

  useEffect(() => {
    if (isChatOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isChatOpen, messages]);

  if (!booking) {
    return (
      <div className="min-h-screen bg-background-2 flex items-center justify-center">
        <span className="text-on-surface-variant">Đang tải...</span>
      </div>
    );
  }

  const fmt = (n) => n.toLocaleString('vi-VN') + 'đ';
  const isPending = booking.status === 'pending';
  const isConfirmed = booking.status === 'confirmed';
  const isActive = booking.status === 'active';
  const isCompleted = booking.status === 'completed';
  const isCancelled = booking.status === 'cancelled';
  const isStaffTransferRequested = !!booking.staffTransfer?.isRequested;
  const isTransferEligible = isMonthlyPackageBooking(booking);

  const handleOpenCancelPackage = () => {
    if (booking.isPackage) {
      const usedAmount = booking.packageInfo.completedSessions * booking.payment.sessionPrice;
      const refund = booking.payment.total - usedAmount;
      setRefundData({ usedAmount, refundAmount: refund > 0 ? refund : 0 });
    } else {
      setRefundData({ usedAmount: 0, refundAmount: booking.payment.total });
    }
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancelOrder = async () => {
    try {
      await khachHangApi.cancelOrder(id);
      setIsCancelModalOpen(false);
      fetchBookingDetail();
    } catch (err) {
      console.error("Lỗi khi hủy đơn hàng:", err);
      alert("Có lỗi xảy ra khi yêu cầu hủy đơn hàng.");
    }
  };

  // ── Tính bounds calendar ──
  // maxDate = tháng endDate + 1 (để KH có thể dời sang tháng kế tiếp ngoài HĐ)
  const getCalendarBounds = () => {
    if (!booking.isPackage) {
      return { minDate: null, maxDate: null, contractEndDate: null };
    }
    const { startDate } = booking.packageInfo;
    const [, sm, sy] = startDate.split('/').map(Number);
    const originalEndDate = getOriginalPackageEndDate(booking);
    const contractEndDate = parseDMY(originalEndDate);
    const extensionLimitDate = getExtensionLimitDate(booking);

    const minDate = new Date(sy, sm - 1, 1);
    const maxDate = new Date(extensionLimitDate.getFullYear(), extensionLimitDate.getMonth(), 1);

    return { minDate, maxDate, contractEndDate, extensionLimitDate };
  };

  const handleOpenActionModal = (type, sessionId = null) => {
    const { minDate, maxDate } = getCalendarBounds();
    let initialView = getToday();
    initialView.setDate(1);
    if (minDate && initialView < minDate) initialView = new Date(minDate);
    if (maxDate && initialView > maxDate) initialView = new Date(maxDate);

    setCalendarViewDate(initialView);
    setActionModal({
      isOpen: true,
      type,
      sessionId,
      data: null,
      staffOption: 'favorite',
    });
  };

  const getPendingRequestDates = () => {
    if (!booking.isPackage) return new Set();
    return new Set(
      (booking.packageInfo.sessions || [])
        .filter((s) => s.status === 'awaiting_confirm')
        .map((s) => getSessionDisplayDate(s))
    );
  };

  // ── Calendar đầy đủ — mở rộng 1 tháng sau endDate ──
  const renderFullCalendar = (pendingDates = new Set()) => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthLabel = `Tháng ${month + 1}/${year}`;

    const { minDate, maxDate, contractEndDate, extensionLimitDate } = getCalendarBounds();
    const curMonthDate = new Date(year, month, 1);
    const canGoPrev = !minDate || curMonthDate > minDate;
    const canGoNext = !maxDate || curMonthDate < maxDate;

    // Kiểm tra tháng hiện tại calendar có nằm ngoài endDate hợp đồng không
    const contractEndMonth = contractEndDate
      ? new Date(contractEndDate.getFullYear(), contractEndDate.getMonth(), 1)
      : null;
    const isExtendedMonth = contractEndMonth && curMonthDate > contractEndMonth;

    const sessionDatesISO = new Set(
      (booking.packageInfo?.sessions || [])
        .filter((s) => s.status !== 'cancelled')
        .map((s) => {
          const [d, mo, y] = s.date.split('/');
          return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        })
    );

    const pendingDatesISO = new Set(
      [...pendingDates].map((dateStr) => {
        if (!dateStr) return '';
        const [d, mo, y] = dateStr.split('/');
        return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      })
    );

    const today = getToday();
    const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Ngày cuối hợp đồng dạng ISO
    const contractEndISO = contractEndDate
      ? `${contractEndDate.getFullYear()}-${String(contractEndDate.getMonth() + 1).padStart(2, '0')}-${String(contractEndDate.getDate()).padStart(2, '0')}`
      : null;
    const extensionLimitISO = extensionLimitDate
      ? `${extensionLimitDate.getFullYear()}-${String(extensionLimitDate.getMonth() + 1).padStart(2, '0')}-${String(extensionLimitDate.getDate()).padStart(2, '0')}`
      : null;

    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, iso });
    }

    const prevMonth = () => { if (!canGoPrev) return; setCalendarViewDate(new Date(year, month - 1, 1)); };
    const nextMonth = () => { if (!canGoNext) return; setCalendarViewDate(new Date(year, month + 1, 1)); };

    return (
      <div>
        {/* Header điều hướng tháng */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={prevMonth}
            disabled={!canGoPrev}
            className="w-9 h-9 rounded-xl hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <div className="flex flex-col items-center">
            <span className="text-sm font-black text-on-surface">{monthLabel}</span>
            {isExtendedMonth && (
              <span className="text-[9px] font-black text-orange-600 bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-full mt-0.5 uppercase tracking-wide">
                Ngoài hợp đồng
              </span>
            )}
          </div>
          <button
            onClick={nextMonth}
            disabled={!canGoNext}
            className="w-9 h-9 rounded-xl hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>

        {/* Banner cảnh báo tháng mở rộng */}
        {isExtendedMonth && (
          <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-2">
            <span className="material-symbols-outlined text-orange-500 text-[16px] mt-0.5 shrink-0">info</span>
            <div className="text-xs text-orange-700 leading-relaxed">
              Tháng này <strong>nằm ngoài thời hạn hợp đồng</strong>. Chỉ các ca bạn chọn và được nhân viên chấp nhận mới được thêm vào tháng {month + 1}/{year}.
            </div>
          </div>
        )}

        {/* Cảnh báo pending dates */}
        {pendingDates.size > 0 && (
          <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
            <span className="material-symbols-outlined text-amber-500 text-[16px] mt-0.5 shrink-0">warning</span>
            <div className="text-xs text-amber-700 leading-relaxed">
              <strong>{[...pendingDates].join(', ')}</strong> đang có yêu cầu chờ xác nhận — không thể chọn ngày này.
            </div>
          </div>
        )}

        {/* Grid header ngày */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
            <div key={d} className="text-center text-[10px] font-black text-on-surface-variant py-1">{d}</div>
          ))}
        </div>

        {/* Grid ngày */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell) return <div key={`pad-${i}`} className="aspect-square" />;
            const { day, iso } = cell;
            const isPast = iso < todayISO;
            const isToday = iso === todayISO;
            const hasSessions = sessionDatesISO.has(iso);
            const isPendingDate = pendingDatesISO.has(iso);
            const isSelected = actionModal.data === iso;
            const isAfterExtensionLimit = extensionLimitISO && iso > extensionLimitISO;
            const isDisabled = isPast || isPendingDate || hasSessions || isAfterExtensionLimit;

            // Ngày ngay sau endDate hợp đồng (cuối HĐ) → đánh dấu đặc biệt
            const isAfterContract = contractEndISO && iso > contractEndISO;

            return (
              <button
                key={iso}
                disabled={isDisabled}
                onClick={() => setActionModal((prev) => ({ ...prev, data: iso }))}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all relative gap-0
                  ${isSelected
                    ? isAfterContract
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30 ring-2 ring-orange-500 ring-offset-1'
                      : 'bg-primary text-white shadow-md shadow-primary/30 ring-2 ring-primary ring-offset-1'
                    : isPast
                    ? 'text-on-surface-variant/25 cursor-not-allowed'
                    : isPendingDate
                    ? 'bg-amber-100 text-amber-500 border border-amber-200 cursor-not-allowed'
                    : hasSessions
                    ? 'bg-primary/8 text-primary/60 border border-primary/15 cursor-not-allowed'
                    : isAfterContract && !isDisabled
                    ? 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 hover:border-orange-400'
                    : isToday
                    ? 'border-2 border-primary text-primary hover:bg-primary/10 font-black'
                    : 'hover:bg-primary/10 hover:text-primary text-on-surface border border-transparent hover:border-primary/20'}
                `}
              >
                <span>{day}</span>
                {isToday && !isSelected && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary"></span>
                )}
                {hasSessions && !isSelected && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary/50"></span>
                )}
                {isPendingDate && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-amber-400"></span>
                )}
                {isAfterContract && !isDisabled && !isSelected && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-orange-400"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Hiển thị ngày đang chọn + cảnh báo nếu ngoài HĐ */}
        {actionModal.data && (() => {
          const [selY, selM, selD] = actionModal.data.split('-');
          const selISO = actionModal.data;
          const isOutOfContract = contractEndISO && selISO > contractEndISO;
          const selLabel = `${selD}/${selM}/${selY}`;
          return (
            <div className={`mt-3 p-3 rounded-xl border text-xs font-medium flex items-start gap-2 ${
              isOutOfContract
                ? 'bg-orange-50 border-orange-200 text-orange-800'
                : 'bg-primary/5 border-primary/20 text-primary'
            }`}>
              <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0">
                {isOutOfContract ? 'warning' : 'event_available'}
              </span>
              <div>
                <div className="font-black">Đã chọn: {selLabel}</div>
                {isOutOfContract && (
                  <div className="mt-0.5 text-orange-700 leading-relaxed">
                    Ngày này <strong>ngoài hợp đồng</strong>. Nếu nhân viên chấp nhận, chỉ ca này được chuyển/thêm vào tháng {parseInt(selM)}/{selY}.
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Legend */}
        <div className="flex gap-3 mt-4 text-[10px] uppercase font-bold text-on-surface-variant justify-center flex-wrap">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary"></span>Đang chọn</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary/40"></span>Đã có ca</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span>Đang chờ dời</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400"></span>Ngoài HĐ</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full border border-primary/30 bg-transparent"></span>Hôm nay</div>
        </div>
      </div>
    );
  };

  const handleConfirmAction = async () => {
    const { type, sessionId, data, staffOption } = actionModal;

    if ((type === 'reschedule' || type === 'add') && !data) {
      alert('Vui lòng chọn ngày trước khi xác nhận.');
      return;
    }

    if (type === 'reschedule') {
      try {
        await khachHangApi.rescheduleSession(sessionId, { ngay_moi: data });
        fetchBookingDetail();
      } catch (err) {
        console.error("Lỗi khi dời lịch:", err);
        alert("Có lỗi xảy ra khi yêu cầu dời lịch.");
      }
    } else if (type === 'cancel') {
      try {
        await khachHangApi.cancelSession(sessionId);
        fetchBookingDetail();
      } catch (err) {
        console.error("Lỗi khi hủy ca:", err);
        alert("Có lỗi xảy ra khi yêu cầu hủy ca.");
      }
    } else if (type === 'add') {
      const [y, mo, d] = data.split('-');
      const formattedDate = d + '/' + mo + '/' + y;
      const { contractEndDate } = getCalendarBounds();
      const selectedDate = new Date(parseInt(y), parseInt(mo) - 1, parseInt(d));
      const isOutOfContract = contractEndDate && selectedDate > contractEndDate;

      setBooking((prev) => {
        const newId = 's' + (prev.packageInfo.sessions.length + 1);
        const newSession = {
          id: newId,
          date: formattedDate,
          time: prev.schedule.time,
          status: 'awaiting_confirm',
          staff: prev.staff ? prev.staff.name : '?ang ch? ph?n c?ng',
          rescheduleDate: undefined,
          rescheduleStaffOption: staffOption,
          isAddedExtra: true,
          isExtended: isOutOfContract || undefined,
        };

        let newEndDate = prev.packageInfo.endDate;
        if (isOutOfContract) {
          const lastDayOfExtend = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
          newEndDate = formatDMY(lastDayOfExtend);
        }

        return {
          ...prev,
          packageInfo: {
            ...prev.packageInfo,
            sessions: sortPackageSessions([...prev.packageInfo.sessions, newSession]),
            totalSessions: prev.packageInfo.totalSessions + 1,
            endDate: newEndDate,
          },
        };
      });
    } else if (type === 'transfer_staff') {
      setBooking((prev) => {
        const requestedAt = formatDMY(getToday());
        const broadcastAllAt = formatDMY(addDays(getToday(), 2));
        const minReadyAt = formatDMY(addDays(getToday(), 3));
        const transferTitle = prev.title?.includes('CHỜ XÁC NHẬN')
          ? prev.title
          : `${prev.title || prev.service?.title || 'Gói dịch vụ'} • CHỜ XÁC NHẬN`;

        return {
          ...prev,
          title: transferTitle,
          statusLabel: getTransferStatusLabel(prev.statusLabel),
          statusColor: 'text-primary bg-primary/10 border-primary/20 shadow-md shadow-primary/10',
          staff: null,
          assignee: 'Đang phân bổ nhân viên',
          assigneeIcon: 'person_search',
          staffTransfer: {
            isRequested: true,
            requestedAt,
            broadcastAllAt,
            minReadyAt,
            priorityFlow: 'premium-first',
          },
        };
      });
      setIsChatOpen(false);
    }

    setActionModal({ isOpen: false, type: null, sessionId: null, data: null, staffOption: 'favorite' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'hourglass_empty';
      case 'confirmed': return 'check_circle';
      case 'active': return 'motion_photos_on';
      case 'completed': return 'task_alt';
      case 'cancelled': return 'cancel';
      default: return 'info';
    }
  };


  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !chatRoomId) return;

    const textToSend = inputMessage.trim();
    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Optimistic update
    const tempMsg = {
      id: Date.now(),
      sender: 'customer',
      text: textToSend,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await khachHangApi.sendMessage(chatRoomId, { text: textToSend });
    } catch (err) {
      console.error(err);
      alert('Không thể gửi tin nhắn.');
    }
  };

  const renderSessionTitle = (session) => (
    <div className="font-bold text-on-surface flex items-center gap-2 flex-wrap">
      <span>Ngày {session.date}</span>
      <span className="text-on-surface-variant font-medium text-sm">• {session.time}</span>
      {session.isRescheduled && session.status !== 'awaiting_confirm' && (
        <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md uppercase font-black tracking-wide border border-orange-200">
          Đã dời lịch
        </span>
      )}
      {session.isAddedExtra && (
        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md uppercase font-black tracking-wide border border-primary/20">
          Ca bổ sung
        </span>
      )}
      {session.status === 'completed' && (
        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md uppercase font-black tracking-wide">Đã hoàn thành</span>
      )}
      {session.status === 'cancelled' && (
        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-md uppercase font-black tracking-wide">Đã hủy</span>
      )}
      {session.status === 'active' && (
        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md uppercase font-black tracking-wide animate-pulse">Đang thực hiện</span>
      )}
      {session.status === 'upcoming' && (
        <>
          {isStaffTransferRequested && (
            <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md uppercase font-black tracking-wide flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">swap_horiz</span>
              Đang đổi nhân viên
            </span>
          )}
          <span className={session.isExtended ? "text-[10px] px-2 py-0.5 rounded-md uppercase font-black tracking-wide bg-orange-100 text-orange-700 border border-orange-200" : "text-[10px] px-2 py-0.5 rounded-md uppercase font-black tracking-wide bg-slate-100 text-slate-700"}>
            {session.isExtended ? "Mở rộng HĐ" : "Sắp tới"}
          </span>
        </>
      )}
      {session.status === 'awaiting_confirm' && (
        <span className="text-[10px] bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md uppercase font-black tracking-wide flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block"></span>
          {session.isAddedExtra ? "Ca mới chờ xác nhận" : isRescheduleRequest(session) ? "Chờ xác nhận dời lịch" : "Chờ nhân viên xác nhận"}
        </span>
      )}
    </div>
  );

  const renderSessionSubInfo = (session) => {
    if (session.status === 'awaiting_confirm') {
      const isReschedule = isRescheduleRequest(session);
      const staffLabel =
        session.rescheduleStaffOption === 'favorite' ? 'nhân viên yêu thích'
        : session.rescheduleStaffOption === 'standard' ? 'nhân viên tiêu chuẩn'
        : null;
      return (
        <div className="mt-1.5 space-y-1">
          <div className="text-sm text-amber-700 font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">edit_calendar</span>
            {isReschedule
              ? <>Yêu cầu dời sang: <strong>{session.rescheduleDate}</strong></>
              : <>Yêu cầu thêm ca ngày: <strong>{session.date}</strong></>
            }
          </div>
          {staffLabel ? (
            <div className="text-xs text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[13px]">person_search</span>
              {isReschedule
                ? `Đang tìm ${staffLabel} thay thế nếu nhân viên không xác nhận...`
                : "Đang tìm nhân viên nhận ca mới..."}
            </div>
          ) : (
            <div className="text-xs text-red-500 flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-[13px]">person_off</span>
              Nếu nhân viên không xác nhận trong 24h, ca này sẽ bị hủy tự động.
            </div>
          )}
        </div>
      );
    }

    const isTransferInProgress = isStaffTransferRequested && session.status === 'upcoming';
    const displayStaffLabel = isTransferInProgress
      ? 'Đang tìm nhân viên (được phân bổ lại)'
      : session.staff;

    return (
      <div className="mt-1.5 space-y-1">
        {isTransferInProgress && (
          <div className="text-xs text-amber-700 flex items-center gap-1.5 font-semibold">
            <span className="material-symbols-outlined text-[13px]">swap_horiz</span>
            Đang đổi nhân viên cho ca tương lai
          </div>
        )}
        {(session.isRescheduled || session.isAddedExtra) && (
          <div className="text-xs text-orange-700 flex items-center gap-1.5 font-semibold">
            <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
            {session.isRescheduled && session.rescheduledFromDate ? (
              <>
                Lịch dời từ <strong>{session.rescheduledFromDate}</strong> sang <strong>{session.date}</strong>
              </>
            ) : session.isAddedExtra ? (
              <>Ca bổ sung đã được thêm vào lịch</>
            ) : null}
          </div>
        )}
        <div className="text-sm text-on-surface-variant mt-0.5 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">person</span>
          {displayStaffLabel}
        </div>
      </div>
    );
  };
  const allSessions = booking.isPackage ? booking.packageInfo.sessions : [];

  return (
    <div className="min-h-screen bg-background-2 py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">

        {/* Nút Quay lại */}
        <Link
          to="/my-bookings"
          className="inline-flex items-center gap-3 py-1.5 pl-2 pr-5 mb-6 bg-white hover:bg-surface-container-low text-on-surface hover:text-primary border border-outline-variant/60 hover:border-primary/30 rounded-full text-sm font-bold transition-all duration-300 active:scale-[0.97] group/back w-fit shadow-md shadow-gray-200/80 hover:shadow-lg hover:shadow-primary/10"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary group-hover/back:bg-primary group-hover/back:text-on-primary flex items-center justify-center transition-all duration-300">
            <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover/back:-translate-x-0.5">arrow_back</span>
          </div>
          <span className="text-primary">Quay lại Quản lý lịch hẹn</span>
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-2.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className={`font-h1 text-xl md:text-2xl px-4 py-1.5 rounded-2xl font-black border w-fit uppercase flex items-center gap-2 ${booking.statusColor}`}>
              <span className="material-symbols-outlined text-[22px] md:text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isStaffTransferRequested ? 'person_search' : getStatusIcon(booking.status)}
              </span>
              {booking.statusLabel}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold border text-slate-700 bg-slate-100 border-slate-200/80">
              {booking.code}
            </span>
          </div>
          <p className="text-on-surface-variant text-sm pl-1">
            Đặt lúc <span className="font-medium text-on-surface">{booking.createdAt}</span>
          </p>
        </div>

        {isStaffTransferRequested && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 flex items-start gap-3 shadow-sm">
            <span className="material-symbols-outlined text-amber-700 mt-0.5">swap_horiz</span>
            <div className="text-sm leading-relaxed">
              <p className="font-bold text-amber-900">Đơn này đang đổi nhân viên</p>
              <p className="text-amber-800/90">
                CleanTrust đang ưu tiên nhân viên cao cấp trong 2 ngày đầu, sau đó sẽ mở sang toàn bộ nhân viên.
                Khách sẽ chờ tối thiểu 3 ngày để hệ thống phân bổ xong.
              </p>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ─── Cột trái ─── */}
          <div className="lg:col-span-8 space-y-8">

            {/* Box: Dịch vụ */}
            <div className="glass-card bg-surface-container-lowest p-8 rounded-3xl shadow-lg border border-outline-variant/30">
              <h2 className="font-h3 text-h3 text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">{booking.service.icon}</span>
                Thông tin dịch vụ
              </h2>
              <div className="flex flex-col sm:flex-row justify-between gap-4 pb-6 border-b border-outline-variant/20">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-on-surface">{booking.service.title}</h3>
                  <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mt-2">
                    {booking.service.packageType}
                  </span>
                </div>
                <div className="text-right shrink-0 flex sm:flex-col gap-2">
                  <div className="text-sm font-bold text-on-surface bg-surface-container-low px-4 py-2 rounded-xl inline-block whitespace-nowrap border border-outline-variant/10">
                    <span className="material-symbols-outlined text-sm text-primary align-middle mr-1.5" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                    {booking.service.duration}
                  </div>
                  <div className="text-sm font-bold text-on-surface bg-surface-container-low px-4 py-2 rounded-xl inline-block whitespace-nowrap border border-outline-variant/10">
                    <span className="material-symbols-outlined text-sm text-primary align-middle mr-1.5" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                    {booking.service.staffCount} Nhân viên
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                <div className="bg-surface p-4 rounded-xl border border-outline-variant/20 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>straighten</span>
                  <div>
                    <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Tùy chọn chi tiết</div>
                    <div className="font-bold text-on-surface text-sm">{booking.service.areaSize}</div>
                  </div>
                </div>
                <div className="bg-surface p-4 rounded-xl border border-outline-variant/20 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                  <div>
                    <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Thú cưng</div>
                    <div className="font-bold text-on-surface text-sm">{booking.hasPet ? 'Có nuôi thú cưng' : 'Không có'}</div>
                  </div>
                </div>
              </div>
              {booking.service.extras.length > 0 && (
                <div className="pt-6 mt-6 border-t border-outline-variant/20">
                  <h4 className="text-xs font-black text-on-surface mb-3 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-primary">add_circle</span>
                    Dịch vụ thêm kèm theo
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {booking.service.extras.map((extra, idx) => (
                      <span key={idx} className="flex items-center gap-1.5 text-on-surface-variant text-sm bg-surface px-3 py-1.5 rounded-lg border border-outline-variant/10">
                        <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        {extra}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Box: Lịch hẹn & Địa điểm */}
            <div className="glass-card bg-surface-container-lowest p-8 rounded-3xl shadow-lg border border-outline-variant/30">
              <h2 className="font-h3 text-h3 text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">location_on</span>
                Thời gian & Địa điểm
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-surface p-4 rounded-2xl border border-outline-variant/20">
                  <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Ngày làm việc</div>
                  <div className="font-bold text-on-surface text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
                    {booking.schedule.date}
                  </div>
                </div>
                <div className="bg-surface p-4 rounded-2xl border border-outline-variant/20">
                  <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Giờ làm việc</div>
                  <div className="font-bold text-on-surface text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                    {booking.schedule.time}
                  </div>
                </div>
              </div>
              {booking.schedule.recurringInfo && (
                <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/15 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>event_repeat</span>
                  <span className="text-sm font-bold text-primary">{booking.schedule.recurringInfo}</span>
                </div>
              )}
              <div className="space-y-4 p-5 bg-surface rounded-2xl border border-outline-variant/20">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">person</span>
                  <div>
                    <div className="font-bold text-on-surface text-base">{booking.location.name}</div>
                    <div className="text-on-surface-variant text-sm mt-0.5">{booking.location.phone}</div>
                  </div>
                </div>
                <div className="h-px bg-outline-variant/10 w-full" />
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">home_pin</span>
                  <div className="text-on-surface text-sm font-medium leading-relaxed">{booking.location.address}</div>
                </div>
              </div>
              {booking.schedule.note && (
                <div className="flex gap-3 mt-5 p-5 bg-primary/5 rounded-2xl border border-primary/20">
                  <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>speaker_notes</span>
                  <div>
                    <div className="text-xs font-black text-primary uppercase tracking-wider mb-1">Ghi chú gửi nhân viên</div>
                    <div className="text-on-surface text-sm italic font-medium">"{booking.schedule.note}"</div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Box: Tiến độ Gói dịch vụ ── */}
            {booking.isPackage && (
              <div className="glass-card bg-surface-container-lowest p-8 rounded-3xl shadow-lg border border-outline-variant/30 mt-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10"></div>

                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-h3 text-h3 text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">view_timeline</span>
                    Tiến độ Gói dịch vụ
                  </h2>
                  <div className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                    {booking.packageInfo.completedSessions} / {booking.packageInfo.totalSessions} ca hoàn thành
                  </div>
                </div>

                <div className="w-full bg-surface-container-high rounded-full h-2.5 mb-2 overflow-hidden border border-outline-variant/20 shadow-inner">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-1000 relative overflow-hidden"
                    style={{ width: `${(booking.packageInfo.completedSessions / booking.packageInfo.totalSessions) * 100}%` }}
                  >
                    <div className="absolute top-0 left-0 bottom-0 w-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:20px_20px]"></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-on-surface-variant font-medium mb-8">
                  <span>Bắt đầu: {booking.packageInfo.startDate}</span>
                  <span className="flex items-center gap-1">
                    Kết thúc: {booking.packageInfo.endDate}
                  </span>
                </div>

                <PackageSessionPanel
                  booking={booking}
                  allSessions={allSessions}
                  renderSessionTitle={renderSessionTitle}
                  renderSessionSubInfo={renderSessionSubInfo}
                  handleOpenActionModal={handleOpenActionModal}
                  setBooking={setBooking}
                  fetchBookingDetail={fetchBookingDetail}
                />

                {booking.status === 'active' && booking.packageInfo.allowExtraSession && (
                  <button
                    onClick={() => handleOpenActionModal('add')}
                    className="w-full mt-4 py-3 border-2 border-dashed border-primary/30 text-primary font-bold rounded-2xl hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">add_circle</span>
                    Thêm 1 ca vào gói
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ─── Cột phải ─── */}
          <div className="lg:col-span-4 sticky top-28 space-y-6">

            {/* Box: Nhân viên */}
            {booking.staff ? (
              <div className="glass-card bg-surface-container-lowest p-6 rounded-2xl shadow-xl border border-outline-variant/30 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full -z-10"></div>
                <h3 className="font-h3 text-h3 text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>badge</span>
                  Nhân viên phụ trách
                </h3>
                {isStaffTransferRequested && (
                  <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                    <p className="font-bold text-sm">Đã gửi yêu cầu đổi nhân viên</p>
                    <p className="text-xs mt-1 leading-relaxed text-amber-800">
                      CleanTrust đang ưu tiên nhân viên cao cấp trước, sau 2 ngày sẽ tự mở sang tất cả nhân viên nếu chưa ai nhận.
                    </p>
                    <p className="text-[11px] mt-1.5 font-bold uppercase tracking-wide text-amber-700">
                      Khách cần chờ tối thiểu 3 ngày
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-outline-variant/20 mb-4">
                  <img src={booking.staff.avatar} alt={booking.staff.name} className="w-16 h-16 rounded-xl object-cover border-2 border-surface-container shadow" />
                  <div className="flex-1">
                    <p className="font-bold text-on-surface text-base">{booking.staff.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-1">
                      <span className="flex items-center gap-0.5 text-tertiary font-bold">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        {booking.staff.rating}
                      </span>
                      <span>· {booking.staff.jobs} công việc</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <a href={`tel:${booking.location.phone}`} className="flex-1 py-3 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm text-center">
                    <span className="material-symbols-outlined text-base">call</span> Gọi điện
                  </a>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="flex-1 py-3 bg-[#1a368d] text-white font-bold rounded-xl hover:bg-[#1a368d]/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-blue-900/10"
                  >
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span> Nhắn tin
                  </button>
                </div>
                {isTransferEligible && !isStaffTransferRequested && (
                  <button
                    onClick={() => handleOpenActionModal('transfer_staff')}
                    className="w-full mt-3 py-3 bg-amber-500/10 text-amber-900 font-bold rounded-xl border border-amber-200 hover:bg-amber-500/15 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <span className="material-symbols-outlined text-base">swap_horiz</span>
                    Đổi nhân viên
                  </button>
                )}
              </div>
            ) : (
              <div className="glass-card bg-surface-container-lowest p-6 rounded-2xl shadow-xl border border-outline-variant/30">
                <h3 className="font-h3 text-h3 text-on-surface-variant mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">badge</span>
                  Nhân viên phụ trách
                </h3>
                <div className="flex flex-col items-center text-center p-6 bg-surface rounded-xl border border-outline-variant/20 gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                    <span className="material-symbols-outlined text-2xl">person_search</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-sm">Đang phân bổ nhân viên</p>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">CleanTrust đang chọn nhân viên tối ưu và gần vị trí của bạn nhất.</p>
                  </div>
                </div>
                {isStaffTransferRequested && (
                  <div className="mt-4 space-y-3">
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                      <p className="font-bold mb-1">Đơn đang đổi nhân viên</p>
                      <p>Ưu tiên đăng cho nhân viên cao cấp trong 2 ngày đầu. Nếu chưa ai nhận, hệ thống sẽ mở sang toàn bộ nhân viên.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-xs text-on-surface-variant">
                      <div className="p-3 rounded-xl bg-surface border border-outline-variant/20">
                        <span className="font-bold text-on-surface block mb-1">Đã gửi lúc</span>
                        {booking.staffTransfer?.requestedAt || 'Hôm nay'}
                      </div>
                      <div className="p-3 rounded-xl bg-surface border border-outline-variant/20">
                        <span className="font-bold text-on-surface block mb-1">Mở toàn bộ sau</span>
                        {booking.staffTransfer?.broadcastAllAt || 'Sau 2 ngày'}
                      </div>
                      <div className="p-3 rounded-xl bg-surface border border-outline-variant/20">
                        <span className="font-bold text-on-surface block mb-1">Xác nhận tối thiểu</span>
                        {booking.staffTransfer?.minReadyAt || 'Sau 3 ngày'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Box: Chi tiết thanh toán */}
            <div className="glass-card bg-surface-container-lowest p-6 rounded-2xl shadow-xl border border-outline-variant/30">
              <h3 className="font-h3 text-h3 text-on-surface mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
                Chi tiết thanh toán
              </h3>
              <div className="space-y-3 text-sm mb-5 pb-4 border-b border-outline-variant/20">
                <div className="flex justify-between text-on-surface-variant font-medium">
                  <span>Phí dịch vụ cơ bản</span>
                  <span className="font-bold text-on-surface">{fmt(booking.payment.basePrice)}</span>
                </div>
                {booking.payment.extrasPrice > 0 && (
                  <div className="flex justify-between text-on-surface-variant font-medium">
                    <span>Dịch vụ cộng thêm</span>
                    <span className="font-bold text-on-surface">+{fmt(booking.payment.extrasPrice)}</span>
                  </div>
                )}
                {booking.payment.travelFee > 0 && (
                  <div className="flex justify-between text-on-surface-variant font-medium">
                    <span>Phí di chuyển xa</span>
                    <span className="font-bold text-on-surface">+{fmt(booking.payment.travelFee)}</span>
                  </div>
                )}
                {booking.payment.discount > 0 && (
                  <div className="flex justify-between text-primary font-bold">
                    <span>Khuyến mãi áp dụng</span>
                    <span>-{fmt(booking.payment.discount)}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center mb-5">
                <span className="text-sm font-black text-on-surface uppercase tracking-wide">Tổng tiền thanh toán</span>
                <span className="text-2xl font-black text-primary">{fmt(booking.payment.total)}</span>
              </div>
              <div className="bg-surface p-4 rounded-xl border border-outline-variant/20 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">{booking.payment.methodIcon}</span>
                  <span className="font-bold text-on-surface">{booking.payment.method}</span>
                </div>
                <span className={`font-black uppercase text-xs px-2.5 py-1 rounded-md ${booking.payment.status === 'Chưa thanh toán' ? 'text-error bg-error/10' : 'text-secondary bg-secondary/10'}`}>
                  {booking.payment.status}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {(isPending || isConfirmed) && (
                <button 
                  onClick={handleOpenCancelPackage}
                  className="w-full py-4 bg-error/10 text-error font-bold rounded-xl hover:bg-error/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                >
                  <span className="material-symbols-outlined text-base">cancel</span>
                  Hủy lịch hẹn này
                </button>
              )}
              {isActive && (
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">info</span>
                  <div className="text-xs text-on-surface-variant leading-relaxed font-medium">
                    Lịch hẹn đang diễn ra. Nếu cần hỗ trợ khẩn cấp, vui lòng{' '}
                    <Link to="/contact" className="text-primary font-bold hover:underline">Liên hệ tổng đài</Link>.
                  </div>
                </div>
              )}
              {isCompleted && !booking.isPackage && (
                <div className="flex flex-col gap-3">
                  {activeForm === null ? (
                    <>
                      {!booking.sessions[0]?.sao_danh_gia && (
                        <button onClick={() => setActiveForm('rating')} className="w-full py-4 bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-base">star_rate</span>
                          Đánh giá dịch vụ
                        </button>
                      )}
                      {booking.sessions[0]?.sao_danh_gia && (
                        <div className="mb-2">
                           <RatingForm session={booking.sessions[0]} onSuccess={() => {}} onCancel={null} />
                        </div>
                      )}
                      {!booking.sessions[0]?.khieu_nai && (
                        <button onClick={() => setActiveForm('report')} className="w-full py-3 bg-white text-error font-bold rounded-xl border border-error/30 hover:bg-error/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm">
                          Báo cáo sự cố phát sinh
                        </button>
                      )}
                      {booking.sessions[0]?.khieu_nai && (
                        <div className="mb-2">
                           <ReportForm session={booking.sessions[0]} onSuccess={() => {}} onCancel={null} />
                        </div>
                      )}
                    </>
                  ) : activeForm === 'rating' ? (
                    <RatingForm 
                      session={booking.sessions[0]} 
                      onSuccess={() => { setActiveForm(null); fetchBookingDetail(); }} 
                      onCancel={() => setActiveForm(null)} 
                    />
                  ) : (
                    <ReportForm 
                      session={booking.sessions[0]} 
                      onSuccess={() => { setActiveForm(null); fetchBookingDetail(); }} 
                      onCancel={() => setActiveForm(null)} 
                    />
                  )}
                </div>
              )}
              {isCancelled && (
                <Link to="/booking" className="w-full py-4 bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-base">refresh</span>
                  Đặt lịch mới
                </Link>
              )}
              {booking.isPackage && booking.status === 'active' && (
                <button
                  onClick={handleOpenCancelPackage}
                  className="w-full mt-3 py-4 bg-error/10 text-error font-bold rounded-xl border border-error/20 hover:bg-error/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                >
                  <span className="material-symbols-outlined text-base">cancel</span>
                  Hủy toàn bộ Gói dịch vụ
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Modal hủy gói ─── */}
      {isCancelModalOpen && refundData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-error/10 flex items-center gap-3 border-b border-error/20">
              <div className="w-10 h-10 bg-white text-error rounded-full flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div>
                <h3 className="font-h3 text-lg text-error font-bold leading-tight">{booking.isPackage ? 'Xác nhận hủy Gói' : 'Xác nhận hủy lịch hẹn'}</h3>
                <p className="text-xs text-error/80 font-medium">{booking.isPackage ? 'Bạn sắp hủy toàn bộ hợp đồng gói dịch vụ.' : 'Bạn sắp hủy lịch hẹn này.'}</p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-surface p-4 rounded-xl border border-outline-variant/30 space-y-3 shadow-inner">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-on-surface-variant">Tổng giá trị gói:</span>
                  <span className="text-on-surface font-bold">{fmt(booking.payment.total)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-on-surface-variant">Đã dùng ({booking.isPackage ? booking.packageInfo.completedSessions : 0} ca):</span>
                  <span className="text-on-surface font-bold">-{fmt(refundData.usedAmount)}</span>
                </div>
                <div className="h-px w-full bg-outline-variant/20 border-dashed" />
                <div className="flex justify-between items-center">
                  <span className="text-on-surface font-black">Dự kiến hoàn trả:</span>
                  <span className="text-xl font-black text-emerald-600">{fmt(refundData.refundAmount)}</span>
                </div>
              </div>
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex gap-3 shadow-sm">
                <span className="material-symbols-outlined text-primary mt-0.5">account_balance_wallet</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Số tiền <strong className="text-primary">{fmt(refundData.refundAmount)}</strong> sẽ được hoàn vào <strong>Ví CleanTrust</strong> trong vòng 24h.
                </p>
              </div>
            </div>
            <div className="p-6 pt-2 flex gap-3">
              <button onClick={() => setIsCancelModalOpen(false)} className="flex-1 py-3 bg-surface text-on-surface font-bold rounded-xl border border-outline-variant/30 hover:bg-surface-container active:scale-95 transition-all">
                Đóng
              </button>
              <button
                onClick={handleConfirmCancelOrder}
                className="flex-1 py-3 bg-error text-white font-bold rounded-xl hover:bg-error/90 active:scale-95 transition-all shadow-md shadow-error/30"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Action Modals ─── */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

            {/* Modal hủy ca */}
            {actionModal.type === 'cancel' && (
              <>
                <div className="p-6 bg-error/10 flex items-center gap-3 border-b border-error/20">
                  <div className="w-10 h-10 bg-white text-error rounded-full flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined">event_busy</span>
                  </div>
                  <h3 className="font-h3 text-lg text-error font-bold leading-tight">Xác nhận hủy ca</h3>
                </div>
                <div className="p-6 text-sm text-on-surface-variant font-medium leading-relaxed">
                  Bạn có chắc muốn hủy ca này không? Ca đã hủy sẽ{' '}
                  <strong className="text-error">không được hoàn tiền</strong> trừ khi hủy toàn bộ Gói.
                </div>
                <div className="p-6 pt-0 flex gap-3">
                  <button onClick={() => setActionModal({ isOpen: false, type: null, sessionId: null, data: null })} className="flex-1 py-3 bg-surface text-on-surface font-bold rounded-xl border border-outline-variant/30 hover:bg-surface-container active:scale-95 transition-all">
                    Đóng
                  </button>
                  <button onClick={handleConfirmAction} className="flex-1 py-3 bg-error text-white font-bold rounded-xl hover:bg-error/90 active:scale-95 transition-all shadow-md shadow-error/30">
                    Hủy ca này
                  </button>
                </div>
              </>
            )}

            {/* Modal dời lịch */}
            {actionModal.type === 'reschedule' && (
              <>
                <div className="p-6 bg-primary/10 flex items-center gap-3 border-b border-primary/20">
                  <div className="w-10 h-10 bg-white text-primary rounded-full flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined">edit_calendar</span>
                  </div>
                  <h3 className="font-h3 text-lg text-primary font-bold leading-tight">Dời lịch làm việc</h3>
                </div>
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                  {renderFullCalendar(getPendingRequestDates())}

                  <div className="mt-6 space-y-3">
                    <label className="block text-sm font-bold text-on-surface">Phương án nếu nhân viên bận:</label>
                    <div className="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-on-surface-variant leading-relaxed">
                      Sau khi lưu, hệ thống gửi yêu cầu tới nhân viên. Nếu <strong>không xác nhận</strong> trong 24h:
                    </div>
                    <div className="space-y-2">
                      {[
                        { id: 'favorite', label: 'Tìm nhân viên yêu thích thay thế', desc: 'Ưu tiên tìm nhân viên bạn đã đánh dấu yêu thích.' },
                        { id: 'standard', label: 'Tìm nhân viên tiêu chuẩn thay thế', desc: 'Phân bổ nhân viên khác phù hợp nhất.' },
                        { id: 'none', label: 'Không tìm thay thế – Hủy ca nếu không xác nhận', desc: 'Ca sẽ tự động bị hủy nếu nhân viên không xác nhận trong 24h.', isDestructive: true },
                      ].map((opt) => (
                        <label
                          key={opt.id}
                          onClick={() => setActionModal({ ...actionModal, staffOption: opt.id })}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            actionModal.staffOption === opt.id
                              ? opt.isDestructive ? 'border-error bg-error/5' : 'border-primary bg-primary/5 shadow-sm'
                              : 'border-outline-variant/30 hover:bg-surface-container'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex shrink-0 mt-0.5 items-center justify-center ${actionModal.staffOption === opt.id ? (opt.isDestructive ? 'border-error' : 'border-primary') : 'border-outline-variant'}`}>
                            {actionModal.staffOption === opt.id && <div className={`w-2 h-2 rounded-full ${opt.isDestructive ? 'bg-error' : 'bg-primary'}`}></div>}
                          </div>
                          <div className="flex-1">
                            <span className={`text-sm font-bold ${opt.isDestructive ? 'text-error' : 'text-on-surface'}`}>{opt.label}</span>
                            {opt.desc && <p className={`text-xs mt-0.5 leading-relaxed ${opt.isDestructive ? 'text-error/80' : 'text-on-surface-variant'}`}>{opt.desc}</p>}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-2 flex gap-3 border-t border-outline-variant/10">
                  <button onClick={() => setActionModal({ isOpen: false, type: null, sessionId: null, data: null, staffOption: 'favorite' })} className="flex-1 py-3 bg-surface text-on-surface font-bold rounded-xl border border-outline-variant/30 hover:bg-surface-container active:scale-95 transition-all">
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    disabled={!actionModal.data}
                    className="flex-1 py-3 bg-primary disabled:bg-surface-container disabled:text-on-surface-variant text-white font-bold rounded-xl hover:bg-primary-container active:scale-95 transition-all shadow-md shadow-primary/30 disabled:shadow-none"
                  >
                    {actionModal.data ? 'Gửi yêu cầu dời lịch' : 'Chọn ngày trước'}
                  </button>
                </div>
              </>
            )}

            {/* Modal đổi nhân viên */}
            {actionModal.type === 'transfer_staff' && (
              <>
                <div className="p-6 bg-primary/10 flex items-center gap-3 border-b border-primary/20">
                  <div className="w-10 h-10 bg-white text-primary rounded-full flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined">swap_horiz</span>
                  </div>
                  <h3 className="font-h3 text-lg text-primary font-bold leading-tight">Xác nhận đổi nhân viên</h3>
                </div>
                <div className="p-6 overflow-y-auto max-h-[70vh] text-sm text-on-surface-variant leading-relaxed">
                  <p>
                    Bạn chắc chắn muốn đổi nhân viên cho gói tháng này không? CleanTrust sẽ ưu tiên đăng lịch cho nhân viên cao cấp
                    trước, nếu sau 2 ngày chưa ai nhận thì sẽ mở sang toàn bộ nhân viên.
                  </p>

                  <div className="mt-4 space-y-2">
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                      <p className="font-bold text-on-surface">Bước 1</p>
                      <p className="text-xs mt-1">Đẩy lịch tới nhóm nhân viên cao cấp và gần vị trí của bạn nhất.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                      <p className="font-bold text-on-surface">Bước 2</p>
                      <p className="text-xs mt-1">Sau 48 giờ, hệ thống chuyển sang đăng cho toàn bộ nhân viên.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                      <p className="font-bold text-on-surface">Bước 3</p>
                      <p className="text-xs mt-1">Khách sẽ ở trạng thái chờ xác nhận ít nhất 3 ngày.</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-on-surface-variant leading-relaxed">
                    Tiêu đề của gói sẽ đổi sang trạng thái <strong className="text-primary">CHỜ XÁC NHẬN</strong> để khách dễ nhận biết đơn đang đổi nhân viên.
                  </div>
                </div>
                <div className="p-6 pt-0 flex gap-3">
                  <button onClick={() => setActionModal({ isOpen: false, type: null, sessionId: null, data: null, staffOption: 'favorite' })} className="flex-1 py-3 bg-surface text-on-surface font-bold rounded-xl border border-outline-variant/30 hover:bg-surface-container active:scale-95 transition-all">
                    Để tôi xem lại
                  </button>
                  <button onClick={handleConfirmAction} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-container active:scale-95 transition-all shadow-md shadow-primary/30">
                    Xác nhận đổi
                  </button>
                </div>
              </>
            )}            {actionModal.type === 'add' && (
              <>
                <div className="p-6 bg-primary/10 flex items-center gap-3 border-b border-primary/20">
                  <div className="w-10 h-10 bg-white text-primary rounded-full flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined">playlist_add</span>
                  </div>
                  <h3 className="font-h3 text-lg text-primary font-bold leading-tight">Thêm 1 ca vào gói</h3>
                </div>
                <div className="p-6 pb-2 overflow-y-auto max-h-[70vh]">
                  {renderFullCalendar(getPendingRequestDates())}
                  <div className="mt-6 space-y-3">
                    <label className="block text-sm font-bold text-on-surface">Phương án nếu nhân viên bận:</label>
                    <div className="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-on-surface-variant leading-relaxed">
                      Ca mới này cũng sẽ được gửi tới nhân viên để <strong>chấp nhận hoặc từ chối</strong>. Nếu chưa ai nhận, hệ thống sẽ hiển thị trạng thái đang tìm nhân viên.
                    </div>
                    <div className="space-y-2">
                      {[
                        { id: 'favorite', label: 'Tìm nhân viên yêu thích thay thế', desc: 'Ưu tiên tìm nhân viên bạn đã đánh dấu yêu thích.' },
                        { id: 'standard', label: 'Tìm nhân viên tiêu chuẩn thay thế', desc: 'Phân bổ nhân viên khác phù hợp nhất.' },
                        { id: 'none', label: 'Không tìm thay thế – Hủy ca nếu không xác nhận', desc: 'Ca sẽ tự động bị hủy nếu nhân viên không xác nhận trong 24h.', isDestructive: true },
                      ].map((opt) => (
                        <label
                          key={opt.id}
                          onClick={() => setActionModal({ ...actionModal, staffOption: opt.id })}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            actionModal.staffOption === opt.id
                              ? opt.isDestructive ? 'border-error bg-error/5' : 'border-primary bg-primary/5 shadow-sm'
                              : 'border-outline-variant/30 hover:bg-surface-container'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex shrink-0 mt-0.5 items-center justify-center ${actionModal.staffOption === opt.id ? (opt.isDestructive ? 'border-error' : 'border-primary') : 'border-outline-variant'}`}>
                            {actionModal.staffOption === opt.id && <div className={`w-2 h-2 rounded-full ${opt.isDestructive ? 'bg-error' : 'bg-primary'}`}></div>}
                          </div>
                          <div className="flex-1">
                            <span className={`text-sm font-bold ${opt.isDestructive ? 'text-error' : 'text-on-surface'}`}>{opt.label}</span>
                            {opt.desc && <p className={`text-xs mt-0.5 leading-relaxed ${opt.isDestructive ? 'text-error/80' : 'text-on-surface-variant'}`}>{opt.desc}</p>}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm bg-surface p-3 rounded-xl border border-outline-variant/20 mt-6">
                    <span className="text-on-surface-variant font-medium">Chi phí phát sinh:</span>
                    <span className="font-black text-primary">{fmt(booking.payment.sessionPrice)}</span>
                  </div>
                  <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 text-xs text-on-surface-variant leading-relaxed mt-3">
                    Ca mới sẽ được đẩy vào danh sách với ngày bạn vừa chọn và sẽ hiện trạng thái chờ nhân viên xác nhận. Phí sẽ được trừ tự động vào Ví CleanTrust khi được chấp nhận.
                  </div>
                </div>
                <div className="p-6 pt-2 flex gap-3 border-t border-outline-variant/10">
                  <button onClick={() => setActionModal({ isOpen: false, type: null, sessionId: null, data: null, staffOption: 'favorite' })} className="flex-1 py-3 bg-surface text-on-surface font-bold rounded-xl border border-outline-variant/30 hover:bg-surface-container active:scale-95 transition-all">
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    disabled={!actionModal.data}
                    className="flex-1 py-3 bg-primary disabled:bg-surface-container disabled:text-on-surface-variant text-white font-bold rounded-xl hover:bg-primary-container active:scale-95 transition-all shadow-md shadow-primary/30 disabled:shadow-none"
                  >
                    {actionModal.data ? 'Xác nhận thêm' : 'Chọn ngày trước'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Chat Widget ─── */}
      {isChatOpen && booking.staff && (
        <div className="fixed bottom-6 right-6 sm:w-96 w-[calc(100vw-32px)] sm:h-[480px] h-[75vh] bg-white shadow-2xl rounded-2xl border border-outline-variant/40 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 bg-[#1a368d] text-white flex justify-between items-center shadow-md shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img src={booking.staff.avatar} alt={booking.staff.name} className="w-9 h-9 rounded-full object-cover border border-white/20" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#1a368d]"></div>
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">{booking.staff.name}</p>
                <p className="text-[11px] text-blue-200/90 font-medium">Đơn lịch: {booking.code}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Link to="/messages" title="Mở rộng" className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white transition-colors">
                <span className="material-symbols-outlined text-[18px]">open_in_full</span>
              </Link>
              <button onClick={() => setIsChatOpen(false)} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3.5 flex flex-col">
            <div className="text-center my-1">
              <span className="text-[11px] text-slate-400 font-bold bg-slate-200/50 px-2.5 py-1 rounded-full uppercase tracking-wider">Bảo mật bởi CleanTrust</span>
            </div>
            {messages.map((msg) => {
              const isMe = msg.sender === 'customer';
              return (
                <div key={msg.id} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                  <div className={`p-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${isMe ? 'bg-[#1a368d] text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'}`} style={{ wordBreak: 'break-word' }}>
                    {msg.text && <div>{msg.text}</div>}

                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1 font-medium">{msg.time}</span>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
          <div className="bg-white border-t border-outline-variant/20 flex flex-col shrink-0">
            {(booking.status === 'completed' || booking.status === 'cancelled') ? (
              <div className="p-4 text-center">
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-4 py-2 rounded-xl inline-block">
                  Đơn lịch đã kết thúc. Cuộc trò chuyện này đã tự động đóng
                </span>
              </div>
            ) : (
              <div className="p-3 flex items-end gap-2 relative">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => { setInputMessage(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`; }}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
                  placeholder="Nhập tin nhắn..."
                  rows={1}
                  className="flex-1 bg-slate-100 border border-transparent focus:border-primary/20 focus:bg-white outline-none rounded-xl py-2 px-4 text-sm font-medium text-slate-800 transition-all placeholder:text-slate-400 resize-none max-h-[100px] min-h-[36px] overflow-y-auto leading-relaxed"
                />
                <button type="submit" onClick={handleSendMessage} disabled={!inputMessage.trim() || !chatRoomId} className="w-9 h-9 bg-[#1a368d] disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl flex items-center justify-center active:scale-[0.95] transition-all shadow-md shrink-0 mb-0.5">
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}



    </div>
  );
};

export default BookingDetailPage;
//Can_Chinh
