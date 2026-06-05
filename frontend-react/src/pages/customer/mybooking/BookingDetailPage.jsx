import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// ─── Mock Data cho 3 card khác nhau ─────────────────────────────────────────
const MOCK_BOOKINGS = {
  '1': {
    id: '1',
    code: 'CLN-20240001',
    createdAt: '20/05/2024 14:30',
    status: 'confirmed',
    statusLabel: 'ĐÃ XÁC NHẬN',
    statusColor: 'text-primary bg-surface-container-high border-primary/20',
    service: {
      title: 'Vệ sinh nhà cửa định kỳ',
      icon: 'cleaning_services',
      packageType: 'Gói tháng • Dọn dẹp cơ bản',
      duration: '3 giờ',
      staffCount: 1,
      details: 'Quét lau sàn, lau bụi nội thất, dọn rác và vệ sinh bếp, toilet cơ bản.',
      extras: ['Ủi quần áo (+1 giờ)', 'Lau kính (+1 giờ)'],
      areaSize: 'Dưới 55m² (1–2 phòng)',
    },
    schedule: {
      date: 'Thứ Tư, 24 Tháng 5, 2024',
      time: '08:00 – 11:00',
      recurringInfo: 'Mỗi Thứ 4 hàng tuần (Gói 1 tháng)',
      note: 'Nhà có chó nhỏ, các bạn vào nhớ bấm chuông đợi mình xích chó lại nhé.',
    },
    location: {
      name: 'Nguyễn Văn Khách',
      phone: '0901 234 567',
      address: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
    },
    staff: {
      name: 'Nguyễn Thu Hà',
      rating: 4.9,
      jobs: 120,
      avatar: 'https://i.pravatar.cc/150?u=ha',
    },
    hasPet: true,
    payment: {
      method: 'Tiền mặt',
      methodIcon: 'payments',
      status: 'Chưa thanh toán',
      basePrice: 200000,
      extrasPrice: 230000,
      travelFee: 15000,
      discount: 20000,
      total: 425000,
    },
  },
  '2': {
    id: '2',
    code: 'CLN-20240002',
    createdAt: '22/05/2024 09:15',
    status: 'active',
    statusLabel: 'ĐANG THỰC HIỆN',
    statusColor: 'text-white bg-surface-tint border-surface-tint/30',
    service: {
      title: 'Tổng vệ sinh chuyên sâu',
      icon: 'auto_awesome',
      packageType: 'Ca lẻ • Vệ sinh chuyên sâu',
      duration: '4 giờ',
      staffCount: 2,
      details: 'Làm sạch toàn diện mọi ngóc ngách: chà sàn, tẩy ố nhà vệ sinh, lau kính cửa sổ.',
      extras: [],
      areaSize: '60 – 80m² (2–3 phòng)',
    },
    schedule: {
      date: 'Hôm nay, 22 Tháng 5, 2024',
      time: '13:30 – 17:30',
      recurringInfo: null,
      note: 'Cửa chính mã khóa 2580, bấm rồi đẩy cửa vào.',
    },
    location: {
      name: 'Trần Văn Bình',
      phone: '0912 345 678',
      address: '456 Đường Lê Lợi, Phường Phạm Ngũ Lão, Quận 1, TP.HCM',
    },
    staff: {
      name: 'Đội CleanTrust Team 04',
      rating: 4.8,
      jobs: 350,
      avatar: 'https://i.pravatar.cc/150?u=team04',
    },
    hasPet: false,
    payment: {
      method: 'Ví MoMo',
      methodIcon: 'smartphone',
      status: 'Đã thanh toán',
      basePrice: 1100000,
      extrasPrice: 0,
      travelFee: 20000,
      discount: 0,
      total: 1120000,
    },
  },
  '3': {
    id: '3',
    code: 'CLN-20240003',
    createdAt: '25/05/2024 20:45',
    status: 'pending',
    statusLabel: 'CHỜ XÁC NHẬN',
    statusColor: 'text-on-surface-variant bg-surface-container-high border-outline-variant/30',
    service: {
      title: 'Vệ sinh văn phòng',
      icon: 'domain',
      packageType: 'Ca lẻ • Doanh nghiệp',
      duration: '3 giờ',
      staffCount: 1,
      details: 'Lau dọn bàn làm việc, phòng họp, khu vực sinh hoạt chung của công ty.',
      extras: ['Vệ sinh bếp chuyên sâu (+2 giờ)'],
      areaSize: 'Văn phòng vừa (50–100m²)',
    },
    schedule: {
      date: 'Thứ Hai, 29 Tháng 5, 2024',
      time: '09:00 – 12:00',
      recurringInfo: null,
      note: '',
    },
    location: {
      name: 'Công ty ABC Corp',
      phone: '028 1234 5678',
      address: '789 Đường Võ Văn Tần, Phường 6, Quận 3, TP.HCM',
    },
    staff: null,
    hasPet: false,
    payment: {
      method: 'Visa / Mastercard',
      methodIcon: 'credit_card',
      status: 'Chưa thanh toán',
      basePrice: 280000,
      extrasPrice: 220000,
      travelFee: 20000,
      discount: 50000,
      total: 470000,
    },
  },
};

// ─── Component ──────────────────────────────────────────────────────────────────
const BookingDetailPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const data = MOCK_BOOKINGS[id] || MOCK_BOOKINGS['1'];
    setBooking(data);
  }, [id]);

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

  // Hàm lấy icon tương ứng với từng trạng thái
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

  return (
    <div className="min-h-screen bg-background-2 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* ── Nút Quay lại ── */}
        <Link
          to="/my-bookings"
          className="inline-flex items-center gap-3 py-1.5 pl-2 pr-5 mb-6 bg-white hover:bg-surface-container-low text-on-surface hover:text-primary border border-outline-variant/60 hover:border-primary/30 rounded-full text-sm font-bold transition-all duration-300 active:scale-[0.97] group/back w-fit shadow-md shadow-gray-200/80 hover:shadow-lg hover:shadow-primary/10"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary group-hover/back:bg-primary group-hover/back:text-on-primary flex items-center justify-center transition-all duration-300">
            <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover/back:-translate-x-0.5">
              arrow_back
            </span>
          </div>
          <span className="text-primary">Quay lại Quản lý lịch hẹn</span>
        </Link>

        {/* ── Header ── */}
        <div className="mb-8 flex flex-col gap-2.5">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Chữ trạng thái bọc nền kèm Icon nằm chung div ở bên trái */}
            <h1 className={`font-h1 text-xl md:text-2xl px-4 py-1.5 rounded-2xl font-black border w-fit uppercase flex items-center gap-2 ${booking.statusColor}`}>
              <span className="material-symbols-outlined text-[22px] md:text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {getStatusIcon(booking.status)}
              </span>
              {booking.statusLabel}
            </h1>
            
            {/* Mã đơn lịch luôn cố định 1 màu xám đen sang trọng */}
            <span className="px-3 py-1 rounded-full text-xs font-bold border text-slate-700 bg-slate-100 border-slate-200/80">
              {booking.code}
            </span>
          </div>
          <p className="text-on-surface-variant text-sm pl-1">
            Đặt lúc <span className="font-medium text-on-surface">{booking.createdAt}</span>
          </p>
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ─── CỘT TRÁI: Thông tin chi tiết (8 cột) ─── */}
          <div className="lg:col-span-8 space-y-8">

            {/* Box 1: Dịch vụ */}
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
                  <p className="text-on-surface-variant text-sm mt-4 leading-relaxed">{booking.service.details}</p>
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
                {/* Diện tích */}
                <div className="bg-surface p-4 rounded-xl border border-outline-variant/20 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>straighten</span>
                  <div>
                    <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Diện tích</div>
                    <div className="font-bold text-on-surface text-sm">{booking.service.areaSize}</div>
                  </div>
                </div>
                {/* Thú cưng */}
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

            {/* Box 2: Lịch hẹn & Địa điểm */}
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
                  <div className="text-on-surface text-sm font-medium leading-relaxed">
                    {booking.location.address}
                  </div>
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
          </div>

          {/* ─── CỘT PHẢI: Nhân viên, Thanh toán (4 cột) ─── */}
          <div className="lg:col-span-4 sticky top-28 space-y-6">

            {/* Box 3: Nhân viên phụ trách */}
            {booking.staff ? (
              <div className="glass-card bg-surface-container-lowest p-6 rounded-2xl shadow-xl border border-outline-variant/30 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full -z-10"></div>
                <h3 className="font-h3 text-h3 text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>badge</span>
                  Nhân viên phụ trách
                </h3>

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
                  <button className="flex-1 py-3 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-base">call</span> Gọi điện
                  </button>
                  <button className="flex-1 py-3 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-base">chat</span> Nhắn tin
                  </button>
                </div>
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
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      CleanTrust đang chọn nhân viên tối ưu và gần vị trí của bạn nhất.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Box 4: Chi tiết thanh toán */}
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
                <button className="w-full py-4 bg-error/10 text-error font-bold rounded-xl hover:bg-error/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm shadow-sm">
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

              {isCompleted && (
                <>
                  <button className="w-full py-4 bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-base">star_rate</span>
                    Đánh giá dịch vụ
                  </button>
                  <button className="w-full py-3 bg-white text-error font-bold rounded-xl border border-error/30 hover:bg-error/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm">
                    Báo cáo sự cố phát sinh
                  </button>
                </>
              )}

              {isCancelled && (
                <Link
                  to="/booking"
                  className="w-full py-4 bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                  Đặt lịch mới
                </Link>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingDetailPage;