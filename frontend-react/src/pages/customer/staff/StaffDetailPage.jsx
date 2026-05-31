import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ELITE_STAFFS } from '../../../data/mockStaffs';

// Đánh giá mẫu
const MOCK_REVIEWS = [
  { id: 'r1', customer: 'Nguyễn Thị A.', rating: 5, text: 'Rất hài lòng với dịch vụ! Nhân viên cẩn thận, tỉ mỉ và rất lịch sự.', date: '20/05/2026' },
  { id: 'r2', customer: 'Trần Văn B.', rating: 5, text: 'Nhà sạch bong kin kít, vượt mong đợi. Chắc chắn sẽ đặt lại!', date: '15/05/2026' },
  { id: 'r3', customer: 'Lê Thu C.', rating: 4, text: 'Làm việc nhanh, chuyên nghiệp. Chỉ cần đúng giờ hơn một chút thì hoàn hảo.', date: '10/05/2026' },
  { id: 'r4', customer: 'Phạm Minh D.', rating: 5, text: 'Bạn nhân viên thân thiện, nhiệt tình. Dọn sạch cả góc khuất mà mình không ngờ tới.', date: '02/05/2026' },
];

const StaffDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const staff = ELITE_STAFFS.find(s => s.id === id);

  if (!staff) {
    return (
      <main className="pt-32 pb-section-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">person_off</span>
        <h2 className="font-h2 text-h2 text-on-surface mb-2">Không tìm thấy nhân viên</h2>
        <p className="text-on-surface-variant mb-6">Nhân viên này có thể đã ngừng hoạt động hoặc không tồn tại.</p>
        <Link to="/staff" className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary-container transition-colors">
          ← Quay lại danh sách
        </Link>
      </main>
    );
  }

  const handleBookWithStaff = () => {
    navigate('/booking', {
      state: {
        preselectedStaff: {
          id: staff.id,
          name: staff.name,
          avatar: staff.avatar,
          rating: staff.rating,
        }
      }
    });
  };

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const stars = [];
    for (let i = 0; i < full; i++) {
      stars.push(
        <span key={`f${i}`} className="material-symbols-outlined text-xl text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      );
    }
    if (hasHalf) {
      stars.push(
        <span key="h" className="material-symbols-outlined text-xl text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
      );
    }
    return stars;
  };

  return (
    <main className="pt-32 pb-section-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <Link to="/staff" className="hover:text-primary transition-colors">Nhân viên</Link>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <span className="text-on-surface font-medium">{staff.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── MAIN CONTENT ── */}
        <div className="lg:col-span-8 space-y-8">

          {/* Hero Card */}
          <section className="glass-card bg-surface rounded-3xl p-8 border border-outline-variant/30 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <img
                src={staff.avatar}
                alt={staff.name}
                className="w-28 h-28 rounded-2xl object-cover border-4 border-surface-container-lowest shadow-md shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="font-h2 text-h2 text-on-surface">{staff.name}</h1>
                  <span className="flex items-center gap-1 bg-tertiary-container/30 text-tertiary px-3 py-1 rounded-full text-sm font-bold">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    {staff.rating}
                  </span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
                    Cao cấp
                  </span>
                </div>
                <p className="text-on-surface-variant mb-4">{staff.bio}</p>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-base">work_history</span>
                    <span><strong className="text-on-surface">{staff.experience}</strong> kinh nghiệm</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-base">task_alt</span>
                    <span><strong className="text-on-surface">{staff.completedJobs.toLocaleString('vi-VN')}</strong> công việc hoàn thành</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-base">reviews</span>
                    <span><strong className="text-on-surface">{staff.reviews}</strong> đánh giá</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Kỹ năng & Chuyên môn */}
          <section className="glass-card bg-surface rounded-2xl p-8 border border-outline-variant/30">
            <h2 className="font-h3 text-h3 text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">insights</span>
              Thành tích & Hoạt động
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: 'task_alt', label: 'Công việc hoàn thành', value: staff.completedJobs.toLocaleString('vi-VN'), unit: 'ca', color: 'text-primary' },
                { icon: 'reviews', label: 'Đánh giá từ khách', value: staff.reviews, unit: 'đánh giá', color: 'text-tertiary' },
                { icon: 'work_history', label: 'Kinh nghiệm', value: staff.experience, unit: '', color: 'text-secondary' },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center p-5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 text-center gap-2">
                  <span className={`material-symbols-outlined text-3xl ${item.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {item.icon}
                  </span>
                  <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-on-surface-variant font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Đánh giá */}
          <section className="glass-card bg-surface rounded-2xl p-8 border border-outline-variant/30">
            <h2 className="font-h3 text-h3 text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">rate_review</span>
              Đánh giá từ khách hàng
            </h2>

            {/* Summary */}
            <div className="flex items-center gap-6 p-5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 mb-6">
              <div className="text-center">
                <p className="text-4xl font-black text-primary">{staff.rating}</p>
                <div className="flex justify-center mt-1">{renderStars(staff.rating)}</div>
                <p className="text-xs text-on-surface-variant mt-1">{staff.reviews} đánh giá</p>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map(star => {
                  const pct = star === 5 ? 82 : star === 4 ? 15 : star === 3 ? 3 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-on-surface-variant w-3 text-right">{star}</span>
                      <span className="material-symbols-outlined text-sm text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-tertiary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-on-surface-variant w-8">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review List */}
            <div className="space-y-4">
              {MOCK_REVIEWS.map(review => (
                <div key={review.id} className="p-5 bg-surface-container-lowest rounded-xl border border-outline-variant/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {review.customer.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface text-sm">{review.customer}</p>
                        <p className="text-xs text-on-surface-variant">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex">{renderStars(review.rating)}</div>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── SIDEBAR ── */}
        <aside className="lg:col-span-4 sticky top-28">
          <div className="glass-card bg-surface rounded-2xl shadow-xl border border-outline-variant/30 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-outline-variant/20 bg-gradient-to-r from-primary/5 to-transparent">
              <h3 className="font-h3 text-h3 text-primary flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
                Đặt lịch
              </h3>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Staff mini card */}
              <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
                <img src={staff.avatar} alt={staff.name} className="w-14 h-14 rounded-xl object-cover border-2 border-surface-container shadow" />
                <div className="flex-1">
                  <p className="font-bold text-on-surface text-sm">{staff.name}</p>
                  <div className="flex items-center gap-1 text-xs text-on-surface-variant mt-0.5">
                    <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-semibold text-tertiary">{staff.rating}</span>
                    <span>· {staff.reviews} đánh giá</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>

              {/* Features */}
              <div className="space-y-3">
                {[
                  { icon: 'diamond', label: 'Nhân viên Cao cấp', desc: 'Đánh giá ≥ 4.9 sao' },
                  { icon: 'verified_user', label: 'Uy tín đảm bảo', desc: 'Đã xác minh bởi CleanTrust' },
                  { icon: 'workspace_premium', label: staff.experience + ' kinh nghiệm', desc: `${staff.completedJobs.toLocaleString('vi-VN')}+ công việc` },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-lg mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                    <div>
                      <p className="font-semibold text-on-surface">{item.label}</p>
                      <p className="text-xs text-on-surface-variant">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={handleBookWithStaff}
                className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-body-lg shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">event_available</span>
                Đặt lịch với {staff.name}
              </button>
              <p className="text-center text-xs text-on-surface-variant">
                Nhân viên sẽ được chỉ định tự động cho đơn hàng của bạn
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default StaffDetailPage;
