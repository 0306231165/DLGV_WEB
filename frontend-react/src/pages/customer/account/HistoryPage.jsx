import React, { useState } from 'react';

const allBookings = [
  {
    id: 'CT-20240520-001',
    service: 'Vệ sinh Tiêu chuẩn',
    type: 'Ca lẻ',
    date: '20/05/2024',
    time: '08:00',
    duration: 2,
    address: 'Nhà riêng — 123 Nguyễn Văn Linh, Q.7',
    staff: 'Trần Thị B',
    status: 'completed',
    total: 165000,
    rating: 5,
  },
  {
    id: 'CT-20240515-002',
    service: 'Tổng vệ sinh chuyên sâu',
    type: 'Ca lẻ',
    date: '15/05/2024',
    time: '09:00',
    duration: 4,
    address: 'Công ty — Bitexco, Q.1',
    staff: 'Nguyễn Văn C',
    status: 'completed',
    total: 465000,
    rating: 4,
  },
  {
    id: 'CT-20240510-003',
    service: 'Vệ sinh Tiêu chuẩn',
    type: 'Gói tháng',
    date: '10/05/2024',
    time: '08:00',
    duration: 2,
    address: 'Nhà riêng — 123 Nguyễn Văn Linh, Q.7',
    staff: 'Hệ thống chọn',
    status: 'cancelled',
    total: 0,
    rating: null,
  },
  {
    id: 'CT-20240501-004',
    service: 'Vệ sinh Tiêu chuẩn',
    type: 'Gói lặp lại',
    date: '01/05/2024',
    time: '08:00',
    duration: 3,
    address: 'Nhà riêng — 123 Nguyễn Văn Linh, Q.7',
    staff: 'Trần Thị B',
    status: 'completed',
    total: 265000,
    rating: 5,
  },
];

const statusConfig = {
  completed: { label: 'Hoàn thành', color: 'bg-[#E8F5E9] text-[#2E7D32]', icon: 'check_circle' },
  cancelled: { label: 'Đã hủy',    color: 'bg-error/10 text-error',        icon: 'cancel' },
  upcoming:  { label: 'Sắp tới',   color: 'bg-primary/10 text-primary',    icon: 'schedule' },
};

const HistoryPage = () => {
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = filter === 'all' ? allBookings : allBookings.filter((b) => b.status === filter);

  return (
    <div className="flex flex-col">

      {/* Header */}
      <div className="p-8 border-b border-outline-variant/20">
        <h1 className="font-h3 text-h3 text-on-surface mb-1">Lịch sử dịch vụ</h1>
        <p className="text-sm text-on-surface-variant">Tất cả các buổi vệ sinh bạn đã đặt.</p>
      </div>

      {/* Filter tabs */}
      <div className="px-8 pt-6">
        <div className="flex gap-2 p-1 bg-surface-container rounded-xl w-fit">
          {[
            { id: 'all',       label: 'Tất cả' },
            { id: 'completed', label: 'Hoàn thành' },
            { id: 'cancelled', label: 'Đã hủy' },
            { id: 'upcoming',  label: 'Sắp tới' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="p-8 space-y-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4 text-outline-variant">history</span>
            <p className="font-semibold text-on-surface mb-1">Không có lịch sử</p>
            <p className="text-sm">Chưa có buổi nào trong mục này.</p>
          </div>
        ) : (
          filtered.map((booking) => {
            const st = statusConfig[booking.status];
            const isExpanded = expandedId === booking.id;

            return (
              <div
                key={booking.id}
                className="border border-outline-variant/30 rounded-xl overflow-hidden transition-all hover:border-outline-variant"
              >
                {/* Main row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                  className="w-full p-5 flex flex-col sm:flex-row sm:items-center gap-4 text-left hover:bg-surface-container-low/50 transition-colors"
                >
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>cleaning_services</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold text-on-surface">{booking.service}</p>
                      <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-[11px] rounded-full font-semibold">{booking.type}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      {booking.date} · {booking.time} · {booking.duration}h · {booking.address}
                    </p>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${st.color}`}>
                      <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>{st.icon}</span>
                      {st.label}
                    </div>
                    {booking.status === 'completed' && (
                      <p className="font-semibold text-on-surface text-sm">{booking.total.toLocaleString('vi-VN')}đ</p>
                    )}
                    <span className={`material-symbols-outlined text-on-surface-variant text-[20px] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-outline-variant/20 px-5 py-4 bg-surface-container-low/30">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-xs text-on-surface-variant mb-0.5">Mã đơn</p>
                        <p className="font-semibold text-on-surface">{booking.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant mb-0.5">Nhân viên</p>
                        <p className="font-semibold text-on-surface">{booking.staff}</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant mb-0.5">Tổng tiền</p>
                        <p className="font-semibold text-on-surface">
                          {booking.status === 'cancelled' ? '—' : `${booking.total.toLocaleString('vi-VN')}đ`}
                        </p>
                      </div>
                      {booking.rating && (
                        <div>
                          <p className="text-xs text-on-surface-variant mb-0.5">Đánh giá</p>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className="material-symbols-outlined text-[16px] text-[#F59E0B]"
                                style={{ fontVariationSettings: `'FILL' ${i < booking.rating ? 1 : 0}` }}
                              >
                                star
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 flex-wrap">
                      {booking.status === 'completed' && !booking.rating && (
                        <button className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary-container transition-all active:scale-[0.98]">
                          <span className="material-symbols-outlined text-[16px]">star</span>
                          Đánh giá
                        </button>
                      )}
                      {booking.status === 'completed' && (
                        <button className="flex items-center gap-1.5 px-4 py-2 border border-outline-variant/50 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">
                          <span className="material-symbols-outlined text-[16px]">refresh</span>
                          Đặt lại
                        </button>
                      )}
                      {booking.status === 'upcoming' && (
                        <button className="flex items-center gap-1.5 px-4 py-2 border border-error/40 rounded-lg text-sm font-semibold text-error hover:bg-error/5 transition-colors">
                          <span className="material-symbols-outlined text-[16px]">cancel</span>
                          Hủy lịch
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistoryPage;