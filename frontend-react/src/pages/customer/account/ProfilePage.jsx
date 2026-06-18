import React, { useEffect, useState } from 'react';
import { useAccount } from '../../customer/account/AccountLayout';
import khachHangApi from '../../../api/khachHangApi';

// Hạng thành viên → màu badge
const TIER_STYLE = {
  'Thành viên Bạch Kim': { bg: 'bg-[#E8F5E9]', border: 'border-[#A5D6A7]', text: 'text-[#2E7D32]' },
  'Thành viên Vàng':     { bg: 'bg-[#FFF8E1]', border: 'border-[#FFE082]', text: 'text-[#F57F17]' },
  'Thành viên Bạc':      { bg: 'bg-[#F5F5F5]', border: 'border-[#BDBDBD]', text: 'text-[#616161]' },
  'Thành viên':          { bg: 'bg-[#E3F2FD]', border: 'border-[#90CAF9]', text: 'text-[#1565C0]' },
};

const ProfilePage = () => {
  const { profile, setProfile, loading: layoutLoading } = useAccount();

  const [form, setForm] = useState({
    ho_ten: '',
    email: '',
    so_dien_thoai: '',
    ngay_sinh: '',
    gioi_tinh: 'Nam',
  });
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [errors, setErrors]       = useState({});
  const [serverError, setServerError] = useState('');

  // Sync form khi profile load xong từ layout
  useEffect(() => {
  console.log("ProfilePage: Giá trị profile từ Context:", profile);
  if (profile) {
    console.log("ProfilePage: Đang sync dữ liệu vào form...");
    setForm({
      ho_ten: profile.ho_ten ?? '',
      email: profile.email ?? '',
      so_dien_thoai: profile.so_dien_thoai ?? '',
      ngay_sinh: profile.ngay_sinh ?? '',
      gioi_tinh: profile.gioi_tinh ?? 'Nam',
    });
  }
}, [profile]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
    setErrors(prev => ({ ...prev, [field]: '' }));
    setServerError('');
  };

  const validate = () => {
    const e = {};
    if (!form.ho_ten.trim())        e.ho_ten = 'Vui lòng nhập họ tên.';
    if (!form.so_dien_thoai.trim()) e.so_dien_thoai = 'Vui lòng nhập số điện thoại.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }

    setSaving(true);
    setServerError('');
    try {
      const res = await khachHangApi.updateProfile({
        ho_ten:        form.ho_ten,
        so_dien_thoai: form.so_dien_thoai,
        ngay_sinh:     form.ngay_sinh || null,
        gioi_tinh:     form.gioi_tinh || null,
      });

      if (res.data.success) {
        // Cập nhật lại profile trong context → sidebar cũng cập nhật tên
        setProfile(prev => ({ ...prev, ...res.data }));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Lỗi khi lưu thông tin. Vui lòng thử lại.';
      // Laravel validation errors trả về dạng object
      if (err.response?.status === 422) {
        const laravelErrors = err.response.data.errors ?? {};
        const mapped = {};
        Object.keys(laravelErrors).forEach(k => { mapped[k] = laravelErrors[k][0]; });
        setErrors(mapped);
      } else {
        setServerError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        ho_ten:          profile.ho_ten          ?? '',
        email:           profile.email           ?? '',
        so_dien_thoai:   profile.so_dien_thoai   ?? '',
        ngay_sinh:       profile.ngay_sinh        ?? '',
        gioi_tinh:       profile.gioi_tinh        ?? 'Nam',
      });
      setErrors({});
      setServerError('');
      setSaved(false);
    }
  };

  // ─── Skeleton ────────────────────────────────────────────────────────────
  if (layoutLoading) {
    return (
      <div className="p-8 animate-pulse space-y-6">
        <div className="flex gap-6 items-center border-b border-outline-variant/20 pb-8">
          <div className="w-24 h-24 rounded-full bg-surface-container-high shrink-0" />
          <div className="space-y-3 flex-1">
            <div className="h-5 bg-surface-container-high rounded-full w-1/3" />
            <div className="h-4 bg-surface-container-high rounded-full w-1/4" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3.5 bg-surface-container-high rounded-full w-1/4" />
              <div className="h-12 bg-surface-container-high rounded-xl w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const tierKey   = profile?.hang_thanh_vien ?? 'Thành viên';
  const tierStyle = TIER_STYLE[tierKey] ?? TIER_STYLE['Thành viên'];
  const initials  = profile?.ho_ten
    ? profile.ho_ten.trim().split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()
    : '?';

  return (
    <div className="flex flex-col">

      {/* Header */}
      <div className="p-8 border-b border-outline-variant/20">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

          {/* Avatar */}
          <div className="relative group cursor-pointer shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-surface-container-lowest shadow-md bg-surface-variant">
              {profile?.avatar
                ? <img src={profile.avatar} alt={profile.ho_ten} className="w-full h-full object-cover" />
                : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-primary bg-primary/10">
                    {initials}
                  </div>
                )
              }
            </div>
            <div className="absolute inset-0 bg-on-surface/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="material-symbols-outlined text-white">photo_camera</span>
            </div>
            <button className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-sm hover:bg-primary-container transition-colors border-2 border-surface-container-lowest">
              <span className="material-symbols-outlined text-[14px]">edit</span>
            </button>
          </div>

          {/* Name & tier */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left mt-2">
            <h1 className="font-h3 text-h3 text-on-surface mb-2">{profile?.ho_ten}</h1>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${tierStyle.bg} border ${tierStyle.border} ${tierStyle.text} rounded-full shadow-sm`}>
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              <span className="text-sm font-bold">{tierKey}</span>
            </div>
            <p className="text-sm text-on-surface-variant mt-2 max-w-md">
              Cập nhật thông tin cá nhân để chúng tôi có thể phục vụ tốt hơn và cá nhân hóa trải nghiệm của bạn.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-8">

        {/* Server error */}
        {serverError && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-error/5 border border-error/20 text-error text-sm">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

            {/* Họ tên */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface">
                Họ và tên <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60">person</span>
                <input
                  type="text"
                  value={form.ho_ten}
                  onChange={e => handleChange('ho_ten', e.target.value)}
                  className={`w-full h-12 pl-12 pr-4 rounded-xl border bg-surface-bright focus:bg-surface-container-lowest focus:ring-1 outline-none transition-all text-sm text-on-surface shadow-sm
                    ${errors.ho_ten ? 'border-error focus:border-error focus:ring-error/20' : 'border-outline-variant/60 focus:border-primary focus:ring-primary'}`}
                />
              </div>
              {errors.ho_ten && <p className="text-xs text-error">{errors.ho_ten}</p>}
            </div>

            {/* Email (readonly) */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface">Địa chỉ Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60">mail</span>
                <input
                  type="email"
                  value={form.email}
                  readOnly
                  className="w-full h-12 pl-12 pr-28 rounded-xl border border-outline-variant/30 bg-surface-container-low text-on-surface-variant/80 outline-none cursor-not-allowed text-sm"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary">Đã xác minh</span>
              </div>
              <p className="text-xs text-on-surface-variant/70">Email không thể thay đổi để đảm bảo bảo mật.</p>
            </div>

            {/* SĐT */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface">
                Số điện thoại <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60">call</span>
                <input
                  type="tel"
                  value={form.so_dien_thoai}
                  onChange={e => handleChange('so_dien_thoai', e.target.value)}
                  className={`w-full h-12 pl-12 pr-4 rounded-xl border bg-surface-bright focus:bg-surface-container-lowest focus:ring-1 outline-none transition-all text-sm text-on-surface shadow-sm
                    ${errors.so_dien_thoai ? 'border-error focus:border-error focus:ring-error/20' : 'border-outline-variant/60 focus:border-primary focus:ring-primary'}`}
                />
              </div>
              {errors.so_dien_thoai && <p className="text-xs text-error">{errors.so_dien_thoai}</p>}
            </div>

            {/* Ngày sinh */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface">Ngày sinh</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60">calendar_month</span>
                <input
                  type="date"
                  value={form.ngay_sinh ?? ''}
                  onChange={e => handleChange('ngay_sinh', e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant/60 bg-surface-bright focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm text-on-surface shadow-sm"
                />
              </div>
            </div>

            {/* Giới tính */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-semibold text-on-surface">Giới tính</label>
              <div className="flex gap-6 mt-1">
                {['Nam', 'Nữ', 'Khác'].map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                    <div
                      onClick={() => handleChange('gioi_tinh', opt)}
                      className={`relative w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer
                        ${form.gioi_tinh === opt ? 'border-primary' : 'border-outline-variant group-hover:border-primary'}`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full bg-primary transition-transform ${form.gioi_tinh === opt ? 'scale-100' : 'scale-0'}`} />
                    </div>
                    <span
                      onClick={() => handleChange('gioi_tinh', opt)}
                      className="text-sm text-on-surface group-hover:text-primary transition-colors cursor-pointer"
                    >
                      {opt}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-outline-variant/20 mt-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant/50 disabled:opacity-50"
            >
              Hủy thay đổi
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl text-sm font-semibold bg-primary text-on-primary hover:bg-primary-container shadow-[0_4px_12px_rgba(0,40,142,0.15)] transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed min-w-[160px]"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : saved ? (
                <>
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Đã lưu!
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  Lưu thông tin
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;