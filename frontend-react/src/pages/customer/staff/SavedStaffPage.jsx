import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import nhanVienApi from '../../../api/nhanVienApi';

// ─── Component card nhân viên dùng chung trong modal ────────────────────────
const StaffPickerCard = ({ staff, onToggle, isLoading }) => (
  <div className="flex items-center gap-4 p-4 bg-surface rounded-2xl border border-outline-variant/30 hover:border-primary/40 transition-all">
    <img
      src={staff.avatar}
      alt={staff.name}
      className="w-14 h-14 rounded-full object-cover border-2 border-surface-container shrink-0"
    />
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-on-surface text-sm truncate">{staff.name}</p>
      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
        <span className="flex items-center gap-0.5 text-xs text-tertiary font-bold">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          {staff.rating}
        </span>
        <span className="text-xs text-on-surface-variant">
          {staff.completedJobs?.toLocaleString('vi-VN')} ca hoàn thành
        </span>
      </div>
    </div>
    <button
      onClick={() => onToggle(staff)}
      disabled={isLoading}
      className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50 ${
        staff.is_saved
          ? 'bg-primary/10 text-primary border border-primary/30 hover:bg-red-500/10 hover:text-red-500 hover:border-red-300'
          : 'bg-primary text-on-primary shadow-sm shadow-primary/20 hover:opacity-90'
      }`}
    >
      {isLoading ? (
        <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: `'FILL' ${staff.is_saved ? 1 : 0}` }}>
          {staff.is_saved ? 'favorite' : 'favorite'}
        </span>
      )}
      {staff.is_saved ? 'Đã lưu' : 'Lưu'}
    </button>
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────
const SavedStaffPage = () => {
  const navigate = useNavigate();

  // ── State: danh sách yêu thích ──────────────────────────────────────────
  const [staffList, setStaffList]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [isExpanded, setIsExpanded]   = useState(false);

  // ── State: modal xóa ────────────────────────────────────────────────────
  const [deleteModal, setDeleteModal]       = useState(false);
  const [deleteAnimate, setDeleteAnimate]   = useState(false);
  const [selectedStaff, setSelectedStaff]   = useState(null);
  const [isDeleting, setIsDeleting]         = useState(false);

  // ── State: modal thêm (chọn từ lịch sử đã làm) ─────────────────────────
  const [pickerOpen, setPickerOpen]         = useState(false);
  const [pickerAnimate, setPickerAnimate]   = useState(false);
  const [pickerList, setPickerList]         = useState([]);
  const [pickerLoading, setPickerLoading]   = useState(false);
  const [togglingId, setTogglingId]         = useState(null); // NV đang được toggle

  // ── Load danh sách yêu thích khi mount ──────────────────────────────────
  useEffect(() => {
    fetchYeuThich();
  }, []);

  const fetchYeuThich = async () => {
    try {
      setLoading(true);
      const res = await nhanVienApi.getYeuThich();
      setStaffList(res.data ?? []);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách nhân viên yêu thích:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Điều khiển modal xóa ─────────────────────────────────────────────────
  const openDeleteModal = (staff, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedStaff(staff);
    setDeleteModal(true);
  };

  useEffect(() => {
    if (deleteModal) {
      const t = setTimeout(() => setDeleteAnimate(true), 10);
      return () => clearTimeout(t);
    } else {
      setDeleteAnimate(false);
    }
  }, [deleteModal]);

  const closeDeleteModal = () => {
    setDeleteAnimate(false);
    setTimeout(() => { setDeleteModal(false); setSelectedStaff(null); }, 150);
  };

  const confirmDelete = async () => {
    if (!selectedStaff) return;
    try {
      setIsDeleting(true);
      await nhanVienApi.xoaYeuThich(selectedStaff.id);
      setStaffList(prev => prev.filter(s => s.id !== selectedStaff.id));
    } catch (err) {
      console.error('Lỗi khi xóa nhân viên yêu thích:', err);
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  // ── Điều khiển modal picker ──────────────────────────────────────────────
  const openPicker = async () => {
    setPickerOpen(true);
    setPickerLoading(true);
    try {
      const res = await nhanVienApi.getNhanVienDaLam();
      // Đồng bộ is_saved với danh sách yêu thích hiện tại trên FE
      const savedIds = new Set(staffList.map(s => s.id));
      setPickerList((res.data ?? []).map(s => ({ ...s, is_saved: savedIds.has(s.id) })));
    } catch (err) {
      console.error('Lỗi khi lấy danh sách nhân viên đã làm:', err);
    } finally {
      setPickerLoading(false);
    }
    const t = setTimeout(() => setPickerAnimate(true), 10);
    return () => clearTimeout(t);
  };

  const closePicker = () => {
    setPickerAnimate(false);
    setTimeout(() => { setPickerOpen(false); setPickerList([]); }, 200);
  };

  // Toggle yêu thích bên trong modal picker
  const handleToggleFavorite = async (staff) => {
    if (togglingId === staff.id) return;
    setTogglingId(staff.id);
    try {
      if (staff.is_saved) {
        // Bỏ yêu thích
        await nhanVienApi.xoaYeuThich(staff.id);
        setPickerList(prev => prev.map(s => s.id === staff.id ? { ...s, is_saved: false } : s));
        setStaffList(prev => prev.filter(s => s.id !== staff.id));
      } else {
        // Thêm yêu thích
        await nhanVienApi.themYeuThich(staff.id);
        setPickerList(prev => prev.map(s => s.id === staff.id ? { ...s, is_saved: true } : s));
        // Thêm vào staffList nếu chưa có
        setStaffList(prev => {
          if (prev.find(s => s.id === staff.id)) return prev;
          return [...prev, { ...staff, is_saved: true }];
        });
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật yêu thích:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleBookWithStaff = (staff) => {
    navigate('/booking', {
      state: {
        preselectedStaff: {
          id: staff.id,
          name: staff.name,
          avatar: staff.avatar,
          rating: staff.rating,
        },
      },
    });
  };

  const visibleStaff = isExpanded ? staffList : staffList.slice(0, 8);

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="pt-32 pb-section-padding flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-body-lg text-on-surface-variant">Đang tải danh sách yêu thích...</p>
        </div>
      </main>
    );
  }

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <main className="pt-32 pb-section-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen bg-surface">

      {/* ── Header ── */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="font-h1 text-h1 text-primary mb-4">Nhân viên Yêu thích</h1>
        <p className="text-body-lg text-on-surface-variant">
          Danh sách những người giúp việc tin cậy bạn đã lưu. Hệ thống CleanTrust sẽ tự động
          ưu tiên hiển thị họ khi bạn đặt lịch mới.
        </p>
      </div>

      {/* ── Nút thêm nhân viên yêu thích ── */}
      <div className="flex justify-center mb-8">
        <button
          onClick={openPicker}
          className="flex items-center gap-2 bg-primary text-on-primary font-bold px-6 py-3 rounded-2xl shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all text-sm"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          Thêm nhân viên yêu thích
        </button>
      </div>

      {/* ── Danh sách yêu thích ── */}
      {staffList.length === 0 ? (
        /* Empty state */
        <div className="text-center py-20 bg-surface rounded-3xl border-2 border-dashed border-outline-variant/50">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">favorite_border</span>
          <h3 className="text-xl font-bold text-on-surface mb-2">Danh sách trống</h3>
          <p className="text-on-surface-variant max-w-xs mx-auto mb-8 text-body-md">
            Bạn chưa lưu nhân viên nào vào danh sách yêu thích. Hãy đặt lịch và thêm những
            nhân viên bạn hài lòng!
          </p>
          <button
            onClick={() => navigate('/services')}
            className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            Khám phá dịch vụ ngay
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleStaff.map((staff) => (
              <div
                key={staff.id}
                className="group bg-surface rounded-3xl p-6 border border-outline-variant/30 hover:border-primary/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative"
              >
                {/* Nút xóa */}
                <button
                  onClick={(e) => openDeleteModal(staff, e)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 opacity-0 group-hover:opacity-100 z-20"
                  title="Bỏ yêu thích"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>

                {/* Avatar + tên + sao */}
                <div className="flex flex-col items-center text-center mb-6">
                  <img
                    src={staff.avatar}
                    alt={staff.name}
                    className="w-24 h-24 rounded-full object-cover mb-4 border border-outline-variant/20"
                  />
                  <h2 className="text-body-lg font-semibold text-on-surface mb-1">{staff.name}</h2>
                  <div className="flex items-center gap-1 bg-primary/10 px-2.5 py-0.5 rounded-full text-xs font-bold text-primary mt-1">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span>{staff.rating}</span>
                  </div>
                </div>

                {/* Thống kê */}
                <div className="flex flex-col gap-2 mb-6 flex-1">
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-base">task_alt</span>
                    <span><strong className="text-on-surface">{staff.completedJobs?.toLocaleString('vi-VN')}</strong> công việc hoàn thành</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-base">reviews</span>
                    <span><strong className="text-on-surface">{staff.reviews}</strong> đánh giá</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-base">work_history</span>
                    <span><strong className="text-on-surface">{staff.experience}</strong> kinh nghiệm</span>
                  </div>
                </div>

                {/* Nút hành động */}
                <div className="flex flex-col gap-2 mt-auto w-full">
                  <button
                    onClick={() => handleBookWithStaff(staff)}
                    className="w-full bg-primary text-on-primary font-bold py-3 rounded-xl hover:opacity-90 shadow-md shadow-primary/10 transition-all text-sm flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-lg">event_available</span>
                    Đặt lịch ngay
                  </button>
                  <div className="flex items-center gap-2 w-full">
                    <Link
                      to={`/staff/${staff.id}`}
                      className="flex-1 text-center py-2.5 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors text-xs active:scale-95"
                    >
                      Hồ sơ
                    </Link>
                    <button
                      onClick={() => navigate('/messages')}
                      className="flex-1 bg-outline-variant/20 hover:bg-outline-variant/40 text-on-surface font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-1 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-sm">chat</span>
                      Nhắn tin
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Xem thêm / thu gọn */}
          {staffList.length > 8 && (
            <div className="flex justify-center mt-12">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 bg-surface border border-outline-variant/50 hover:border-primary text-primary font-bold px-6 py-3 rounded-2xl text-sm shadow-sm hover:shadow transition-all duration-200 active:scale-95"
              >
                <span>{isExpanded ? 'Thu gọn danh sách' : 'Xem tất cả thành viên'}</span>
                <span className={`material-symbols-outlined text-lg transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                  keyboard_arrow_down
                </span>
              </button>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL XÓA KHỎI YÊU THÍCH
      ═══════════════════════════════════════════════════════════════════════ */}
      {deleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-150 ease-out ${deleteAnimate ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeDeleteModal}
          />
          <div className={`bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative z-10 border border-outline-variant/30 text-center transform transition-all duration-150 ease-out ${deleteAnimate ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}`}>
            <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-2xl">heart_broken</span>
            </div>
            <h3 className="text-body-lg font-bold text-on-surface mb-2">Bỏ lưu nhân viên?</h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Bạn có chắc muốn bỏ <span className="font-bold text-on-surface">{selectedStaff?.name}</span> khỏi danh sách yêu thích không?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="flex-1 bg-outline-variant/20 hover:bg-outline-variant/40 text-on-surface font-bold py-3 rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-xs shadow-md shadow-red-500/10 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : 'Đồng ý xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL PICKER — CHỌN NHÂN VIÊN TỪ LỊCH SỬ ĐÃ LÀM
      ═══════════════════════════════════════════════════════════════════════ */}
      {pickerOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ease-out ${pickerAnimate ? 'opacity-100' : 'opacity-0'}`}
            onClick={closePicker}
          />

          {/* Sheet — bottom sheet trên mobile, dialog trên desktop */}
          <div className={`relative z-10 w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl border border-outline-variant/20 flex flex-col max-h-[85dvh] transform transition-all duration-200 ease-out ${pickerAnimate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/20 shrink-0">
              <div>
                <h3 className="font-h3 text-h3 text-on-surface">Thêm nhân viên yêu thích</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Những nhân viên đã từng phục vụ bạn
                </p>
              </div>
              <button
                onClick={closePicker}
                className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {pickerLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <svg className="animate-spin h-7 w-7 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-sm text-on-surface-variant">Đang tải...</p>
                </div>
              ) : pickerList.length === 0 ? (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-5xl text-outline-variant block mb-3">history</span>
                  <p className="text-on-surface font-semibold mb-1">Chưa có lịch sử làm việc</p>
                  <p className="text-sm text-on-surface-variant">
                    Sau khi đặt lịch và hoàn thành dịch vụ, bạn có thể lưu nhân viên yêu thích tại đây.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pickerList.map(staff => (
                    <StaffPickerCard
                      key={staff.id}
                      staff={staff}
                      onToggle={handleToggleFavorite}
                      isLoading={togglingId === staff.id}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-outline-variant/20 shrink-0">
              <button
                onClick={closePicker}
                className="w-full py-3 bg-primary/10 text-primary font-bold rounded-xl text-sm hover:bg-primary/20 transition-colors active:scale-95"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default SavedStaffPage;