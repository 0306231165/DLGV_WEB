import React, { useState } from 'react';

const ProfilePage = () => {
  const [form, setForm] = useState({
    fullName: 'Nguyễn Trần Hoàng Nam',
    email: 'hoangnam.nguyen@example.com',
    phone: '0901 234 567',
    dob: '1992-05-15',
    gender: 'male',
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: gọi API lưu thông tin
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col">

      {/* Header */}
      <div className="p-8 border-b border-outline-variant/20">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

          {/* Avatar */}
          <div className="relative group cursor-pointer shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-surface-container-lowest shadow-md bg-surface-variant">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAodb5nqaPcIeE9L-abLsf13OfhQc2rxWp19RsIgB9LYZuxUR8jnnaIfn_-nJcZJgWdSowviUeDPHE8zY-bu_pSH22JDX9vb6eCt6HnW7-vh-4crG4lL74nT0kvccugYygkgcuIXb-u9Db2WmRkGdArhhmS4vhznJgI4flKMjNVeRhrii0VgTLYDrmx3c7R2bOCM88tg421idaGpPYWmnP8VSZrzu4WUIMmo-Zx86on4omLVUStVcYTDtC8VzDKSqhgIHzLW1CnL9gS"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
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
            <h1 className="font-h3 text-h3 text-on-surface mb-2">{form.fullName}</h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF8E1] border border-[#FFE082] text-[#F57F17] rounded-full shadow-sm">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              <span className="text-sm font-bold">Thành viên Vàng</span>
            </div>
            <p className="text-sm text-on-surface-variant mt-2 max-w-md">
              Cập nhật thông tin cá nhân để chúng tôi có thể phục vụ tốt hơn và cá nhân hóa trải nghiệm của bạn.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-8">
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
                  value={form.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant/60 bg-surface-bright focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm text-on-surface shadow-sm"
                />
              </div>
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
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant/60 bg-surface-bright focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm text-on-surface shadow-sm"
                />
              </div>
            </div>

            {/* Ngày sinh */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface">Ngày sinh</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60">calendar_month</span>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => handleChange('dob', e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant/60 bg-surface-bright focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm text-on-surface shadow-sm"
                />
              </div>
            </div>

            {/* Giới tính */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-semibold text-on-surface">Giới tính</label>
              <div className="flex gap-6 mt-1">
                {[
                  { value: 'male', label: 'Nam' },
                  { value: 'female', label: 'Nữ' },
                  { value: 'other', label: 'Khác' },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                    <div
                      onClick={() => handleChange('gender', opt.value)}
                      className={`relative w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
                        form.gender === opt.value ? 'border-primary' : 'border-outline-variant group-hover:border-primary'
                      }`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full bg-primary transition-transform ${form.gender === opt.value ? 'scale-100' : 'scale-0'}`} />
                    </div>
                    <span
                      onClick={() => handleChange('gender', opt.value)}
                      className="text-sm text-on-surface group-hover:text-primary transition-colors cursor-pointer"
                    >
                      {opt.label}
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
              onClick={() => setSaved(false)}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant/50"
            >
              Hủy thay đổi
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-xl text-sm font-semibold bg-primary text-on-primary hover:bg-primary-container shadow-[0_4px_12px_rgba(0,40,142,0.15)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {saved ? (
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