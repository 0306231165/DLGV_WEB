import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const BookingPage = () => {
  const [step, setStep] = useState(1);

  const [frequency, setFrequency] = useState('single');
  const [selectedPackage, setSelectedPackage] = useState('standard');

  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [duration, setDuration] = useState(2); // 2 | 3 | 4 hours

  const [staffNote, setStaffNote] = useState('');

  const durationOptions = [
    { hours: 2, label: '2 tiếng', extraPrice: 0 },
    { hours: 3, label: '3 tiếng', extraPrice: 100000 },
    { hours: 4, label: '4 tiếng', extraPrice: 200000 },
  ];

  const [extras, setExtras] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const [addressMode, setAddressMode] = useState('saved'); // 'saved' | 'new'
  const [selectedSavedAddress, setSelectedSavedAddress] = useState(0);
  const [newAddress, setNewAddress] = useState({ street: '', district: '', note: '' });

  const savedAddresses = [
    { id: 0, label: 'Nhà riêng', address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM', icon: 'home' },
    { id: 1, label: 'Văn phòng', address: '456 Lê Lợi, Phường Phạm Ngũ Lão, Quận 1, TP.HCM', icon: 'business' },
  ];

  const packages = [
    {
      id: 'standard',
      title: 'Vệ sinh Tiêu chuẩn',
      description: 'Quét dọn, lau chùi cơ bản các phòng, dọn rác.',
      price: 150000,
      icon: 'home',
      iconBg: 'bg-secondary-container',
    },
    {
      id: 'deep',
      title: 'Tổng vệ sinh chuyên sâu',
      description: 'Vệ sinh toàn bộ ngóc ngách, tẩy ố, làm sạch kính.',
      price: 450000,
      icon: 'flare',
      iconBg: 'bg-tertiary-fixed',
    },
  ];

  const dates = [
    { day: 'T2', date: '15' },
    { day: 'T3', date: '16' },
    { day: 'T4', date: '17' },
    { day: 'T5', date: '18' },
    { day: 'T6', date: '19' },
    { day: 'T7', date: '20' },
  ];

  const extraServices = [
    {
      id: 'fridge',
      title: 'Làm sạch tủ lạnh',
      price: 100000,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBJeKHlmEKV3Tn4OX28kXPHGAPDm93cYjY9nFpRzox5KtWTVIZ2l9rUbFUIOVf_v7qJIPOBXXEsCrZe85sBroI4gDnC1AM4t6QwT_JVuI16LOwbASqYccX1eRydQNdy_5pXKZf_Hv59TrDTDrYlQJw5O0xVkjyzw6zKglZVqQfCCsIpQWqI0m5TFyhB9bBzavlu1UM6TaYMHjkxJ8kAuMDhVu6zevJjPrZEtpaeP5AqjZpMMdpoD1pyW6rX2YAWyurm61TK-ljBZL1k',
    },
    {
      id: 'glass',
      title: 'Lau kính',
      price: 150000,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCC5curV9u3nwgY0WWxp3O4ENjb667CvoKWZQmGtJFzo63-11vpwlIGAKWHTP1znik3061l5lk0Z2oKS1pXB6TMmmsaDpCQ7RX4cYpHvVey0MHyYorm1xRt5f8guBep1Lam1AaSD5uXQ4Zo3mwufyxUjNxUTm2QBUXWYIfKNN08-pK7b4WFnW4LtIXUmjM8R8WW25wkvbc7jnaGof_k6YvxP7eBks2uw609cnUj4wcHQjYidYkubxl5ZaDxBkuL8KpO_qAziNqChT_E',
    },
    {
      id: 'iron',
      title: 'Ủi quần áo',
      price: 80000,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA8sddz97bqiwJVcesTaOVtpzyoUjQsx_JkfXyArmyIpXO-CKgo4WTv2hyI1MLzKMdFNhji9BgWyswW7Tk2MeK0h4gynON0RIauNY3IbxPHKa1qMxeQ4-zVBxFDFHS5cw1Wpj8bnVm6gXbwCdJJ0mm9YoFrJvw-1HBwr-AIS8AHaWg3E9pD63kapNO4Mrbx49tzwYPUEnaYujscZNHrzdNHf-KNhKnWSCk7aWgClJU0q_qiTKFMZwqPf5US8NWTFDV2eD2fOMZRiyLA',
    },
  ];

  const selectedPackageData = packages.find((pkg) => pkg.id === selectedPackage);

  const frequencyText = {
    single: 'Vệ sinh lẻ',
    monthly: 'Gói tháng',
    recurring: 'Gói lặp lại',
  };

  const toggleExtra = (id) => {
    setExtras((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const extrasPrice = extraServices
    .filter((service) => extras.includes(service.id))
    .reduce((total, service) => total + service.price, 0);

  const travelFee = 15000;
  const durationExtraPrice = durationOptions.find((d) => d.hours === duration)?.extraPrice ?? 0;
  const total = selectedPackageData.price + extrasPrice + travelFee + durationExtraPrice;

  // ─── Shared Step Indicator (style from version 1) ───────────────────────────
  const StepIndicator = () => {
    const steps = [
      { num: 1, label: 'Dịch vụ & Gói' },
      { num: 2, label: 'Thời gian & Địa chỉ' },
      { num: 3, label: 'Xác nhận' },
    ];

    return (
      <div className="flex items-center gap-4 text-on-surface-variant">
        {steps.map((s, i) => {
          const isActive = step === s.num;
          const isDone = step > s.num;

          return (
            <React.Fragment key={s.num}>
              <span
                className={`flex items-center gap-2 ${
                  isActive ? 'text-primary font-bold' : ''
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-label-sm transition-all ${
                    isActive
                      ? 'bg-primary text-on-primary'
                      : isDone
                      ? 'bg-primary-fixed text-primary'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {isDone ? (
                    <span
                      className="material-symbols-outlined text-base"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check
                    </span>
                  ) : (
                    s.num
                  )}
                </span>
                {s.label}
              </span>

              {i < steps.length - 1 && (
                <div
                  className={`h-px w-12 transition-all ${
                    step > s.num ? 'bg-primary' : 'bg-outline-variant'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <main className="pt-32 pb-section-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen">

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <>
          {/* Step Indicator */}
          <div className="mb-12">
            <h1 className="font-h2 text-h2 text-primary mb-2">
              Đặt lịch - Bước 1: Dịch vụ & Gói
            </h1>
            <StepIndicator />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">

            {/* LEFT */}
            <div className="lg:col-span-8 space-y-14">

              {/* Tần suất */}
              <section>
                <h3 className="font-h3 text-h3 mb-6 text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">event_repeat</span>
                  Tần suất vệ sinh
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'single', icon: 'event', title: 'Ca lẻ', desc: 'Vệ sinh một lần duy nhất theo yêu cầu.' },
                    { id: 'monthly', icon: 'package_2', title: 'Gói tháng', desc: 'Lịch cố định hàng tháng, tiết kiệm 15%.', badge: 'Ưu đãi nhất' },
                    { id: 'recurring', icon: 'update', title: 'Gói lặp lại', desc: 'Dịch vụ định kỳ mỗi tuần hoặc 2 tuần.' },
                  ].map((item) => (
                    <label key={item.id} className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="frequency"
                        checked={frequency === item.id}
                        onChange={() => setFrequency(item.id)}
                        className="peer sr-only"
                      />

                      <div className="bg-surface-container-item glass-card p-6 rounded-xl border-2 border-outline-variant/30 peer-checked:border-primary peer-checked:bg-primary/5 transition-all h-full">
                        <div className="mb-4 w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">{item.icon}</span>
                        </div>

                        <h3 className="font-bold text-on-surface text-body-lg mb-2">{item.title}</h3>
                        <p className="text-on-surface-variant text-sm">{item.desc}</p>

                        {item.badge && (
                          <span className="inline-block mt-3 px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded text-[12px] font-bold">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <div className="absolute top-4 right-4 text-primary opacity-0 peer-checked:opacity-100">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </section>

              {/* Chọn gói */}
              <section>
                <h3 className="font-h3 text-h3 mb-6 text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">cleaning_services</span>
                  Chọn gói dịch vụ
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packages.map((pkg) => {
                    const isSelected = selectedPackage === pkg.id;
                    return (
                      <label key={pkg.id} className="relative cursor-pointer">
                        <input
                          type="radio"
                          name="package"
                          checked={isSelected}
                          onChange={() => setSelectedPackage(pkg.id)}
                          className="peer sr-only"
                        />

                        <div className={`bg-surface-container-item glass-card p-6 rounded-xl border-2 transition-all flex gap-4 h-full ${isSelected ? 'border-primary bg-primary/5' : 'border-outline-variant/30'}`}>
                          <div className={`w-16 h-16 rounded-lg flex items-center justify-center shrink-0 ${pkg.iconBg}`}>
                            <span className="material-symbols-outlined text-primary text-3xl">{pkg.icon}</span>
                          </div>

                          <div className="flex-1">
                            <h4 className="font-bold text-on-surface text-body-lg">{pkg.title}</h4>
                            <p className="text-on-surface-variant text-sm mb-3">{pkg.description}</p>
                            <span className="text-primary font-bold">{pkg.price.toLocaleString('vi-VN')}đ/buổi</span>
                          </div>
                        </div>

                        <div className="absolute top-6 right-6 text-primary opacity-0 peer-checked:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                            check_circle
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* SIDEBAR Step 1 */}
            <aside className="lg:col-span-4 sticky top-24">
              <div className="bg-background-2 glass-card p-8 rounded-2xl shadow-xl border border-white/50">
                <h3 className="font-h3 text-h3 text-primary mb-6">Tóm tắt dịch vụ</h3>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Loại dịch vụ</span>
                    <span className="font-semibold text-on-surface">{frequencyText[frequency]}</span>
                  </div>

                  <div className="flex justify-between text-on-surface-variant">
                    <span>Gói dịch vụ</span>
                    <span className="font-semibold text-on-surface">{selectedPackageData.title}</span>
                  </div>

                  <hr className="border-outline-variant/20" />

                  <div className="flex justify-between text-on-surface-variant">
                    <span>Giá cơ bản</span>
                    <span className="font-semibold text-on-surface">{selectedPackageData.price.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                <div className="pt-6 border-t-2 border-dashed border-outline-variant/30 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-on-surface-variant font-medium">Tổng thanh toán</span>
                    <span className="text-3xl font-h1 font-extrabold text-primary">
                      {selectedPackageData.price.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-body-lg shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Tiếp theo
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>

                <p className="mt-4 text-xs text-center text-on-surface-variant">
                  Bằng cách nhấn tiếp theo, bạn đồng ý với{' '}
                  <Link to="/terms" className="underline hover:text-primary transition-colors">
                    Điều khoản dịch vụ
                  </Link>{' '}
                  của CleanTrust.
                </p>
              </div>
            </aside>
          </div>
        </>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <>
          {/* Step Indicator — same style as step 1 */}
          <div className="mb-12">
            <h1 className="font-h2 text-h2 text-primary mb-2">
              Đặt lịch - Bước 2: Thời gian & Địa chỉ
            </h1>
            <StepIndicator />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">

            {/* LEFT */}
            <div className="lg:col-span-8 space-y-6">

              {/* Chọn thời gian */}
              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                <h3 className="font-h3 text-h3 mb-6 text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">calendar_month</span>
                  Chọn thời gian
                </h3>

                {/* Chọn ngày */}
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {dates.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedDate(index)}
                      className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl border cursor-pointer transition-all ${
                        selectedDate === index
                          ? 'border-primary bg-primary-container text-on-primary-container'
                          : 'border-outline-variant bg-surface'
                      }`}
                    >
                      <span className="text-label-sm">{item.day}</span>
                      <span className="text-h3">{item.date}</span>
                    </div>
                  ))}
                </div>

                {/* Giờ bắt đầu */}
                <div className="mt-8">
                  <p className="font-semibold mb-3">Giờ bắt đầu</p>

                  <div className="flex items-center gap-3">
                    {/* Chọn giờ */}
                    <div className="relative">
                      <select
                        value={selectedTime.split(':')[0]}
                        onChange={(e) => setSelectedTime(`${e.target.value}:${selectedTime.split(':')[1]}`)}
                        className="appearance-none pl-4 pr-10 py-3 rounded-xl border-2 border-primary bg-primary/5 text-primary font-bold text-lg focus:outline-none cursor-pointer"
                      >
                        {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-primary text-base pointer-events-none">
                        expand_more
                      </span>
                    </div>

                    <span className="text-2xl font-bold text-on-surface-variant">:</span>

                    {/* Chọn phút */}
                    <div className="relative">
                      <select
                        value={selectedTime.split(':')[1]}
                        onChange={(e) => setSelectedTime(`${selectedTime.split(':')[0]}:${e.target.value}`)}
                        className="appearance-none pl-4 pr-10 py-3 rounded-xl border-2 border-primary bg-primary/5 text-primary font-bold text-lg focus:outline-none cursor-pointer"
                      >
                        {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-primary text-base pointer-events-none">
                        expand_more
                      </span>
                    </div>

                    <div className="flex items-center gap-2 ml-2 px-3 py-2 bg-surface-container rounded-lg">
                      <span className="material-symbols-outlined text-on-surface-variant text-base">schedule</span>
                      <span className="text-sm text-on-surface-variant font-medium">{selectedTime}</span>
                    </div>
                  </div>

                  <p className="text-xs text-on-surface-variant mt-2">Chọn bất kỳ giờ nào phù hợp với bạn.</p>
                </div>

                {/* Thời lượng */}
                <div className="mt-8">
                  <p className="font-semibold mb-3">Thời lượng làm việc</p>
                  <div className="grid grid-cols-3 gap-3">
                    {durationOptions.map((opt) => (
                      <label key={opt.hours} className="relative cursor-pointer">
                        <input
                          type="radio"
                          checked={duration === opt.hours}
                          onChange={() => setDuration(opt.hours)}
                          className="peer sr-only"
                        />
                        <div className="p-4 rounded-xl border-2 border-outline-variant/30 peer-checked:border-primary peer-checked:bg-primary/5 transition-all text-center">
                          <p className="font-bold text-on-surface text-body-lg">{opt.label}</p>
                          {opt.extraPrice > 0 ? (
                            <p className="text-xs text-primary font-semibold mt-1">+{opt.extraPrice.toLocaleString('vi-VN')}đ</p>
                          ) : (
                            <p className="text-xs text-on-surface-variant mt-1">Giá cơ bản</p>
                          )}
                          {opt.hours === 4 && (
                            <span className="inline-block mt-2 px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded text-[11px] font-bold">
                              Triệt để nhất
                            </span>
                          )}
                        </div>
                        <div className="absolute top-3 right-3 text-primary opacity-0 peer-checked:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                            check_circle
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </section>

              {/* Địa chỉ */}
              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                <h3 className="font-h3 text-h3 mb-6 text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  Địa chỉ vệ sinh
                </h3>

                {/* Toggle tabs */}
                <div className="flex gap-2 p-1 bg-surface-container rounded-xl mb-6 w-fit">
                  {[
                    { id: 'saved', icon: 'bookmark', label: 'Địa chỉ đã lưu' },
                    { id: 'new', icon: 'add_location_alt', label: 'Nhập địa chỉ mới' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setAddressMode(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        addressMode === tab.id
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Saved addresses */}
                {addressMode === 'saved' && (
                  <div className="space-y-3">
                    {savedAddresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedSavedAddress === addr.id
                            ? 'border-primary bg-primary/5'
                            : 'border-outline-variant/40 hover:border-outline-variant'
                        }`}
                      >
                        <input
                          type="radio"
                          checked={selectedSavedAddress === addr.id}
                          onChange={() => setSelectedSavedAddress(addr.id)}
                          className="accent-primary mt-1 w-4 h-4 shrink-0"
                        />
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          selectedSavedAddress === addr.id ? 'bg-primary/10' : 'bg-surface-container'
                        }`}>
                          <span className={`material-symbols-outlined text-xl ${
                            selectedSavedAddress === addr.id ? 'text-primary' : 'text-on-surface-variant'
                          }`}>{addr.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-on-surface">{addr.label}</p>
                          <p className="text-sm text-on-surface-variant mt-0.5 leading-relaxed">{addr.address}</p>
                        </div>
                        {selectedSavedAddress === addr.id && (
                          <span
                            className="material-symbols-outlined text-primary shrink-0"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check_circle
                          </span>
                        )}
                      </label>
                    ))}

                    <button className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-outline-variant/50 text-on-surface-variant hover:border-primary hover:text-primary transition-all text-sm font-semibold">
                      <span className="material-symbols-outlined text-base">add</span>
                      Thêm địa chỉ mới
                    </button>
                  </div>
                )}

                {/* New address form */}
                {addressMode === 'new' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-2">
                        Số nhà, tên đường <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
                          signpost
                        </span>
                        <input
                          type="text"
                          placeholder="VD: 123 Nguyễn Huệ"
                          value={newAddress.street}
                          onChange={(e) => setNewAddress((p) => ({ ...p, street: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-outline-variant bg-surface focus:border-primary focus:outline-none transition-colors text-on-surface placeholder:text-on-surface-variant/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-2">
                        Phường / Quận <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
                          location_city
                        </span>
                        <input
                          type="text"
                          placeholder="VD: Phường Bến Nghé, Quận 1"
                          value={newAddress.district}
                          onChange={(e) => setNewAddress((p) => ({ ...p, district: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-outline-variant bg-surface focus:border-primary focus:outline-none transition-colors text-on-surface placeholder:text-on-surface-variant/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-2">
                        Ghi chú thêm <span className="text-on-surface-variant font-normal">(tùy chọn)</span>
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-3.5 text-on-surface-variant text-xl">
                          notes
                        </span>
                        <textarea
                          rows={3}
                          placeholder="VD: Tầng 5, toà nhà ABC, gọi trước 10 phút..."
                          value={newAddress.note}
                          onChange={(e) => setNewAddress((p) => ({ ...p, note: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-outline-variant bg-surface focus:border-primary focus:outline-none transition-colors text-on-surface placeholder:text-on-surface-variant/50 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Dịch vụ thêm */}
              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                <h3 className="font-h3 text-h3 mb-6 text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">add_circle</span>
                  Dịch vụ thêm
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {extraServices.map((service) => (
                    <label
                      key={service.id}
                      className={`flex flex-col rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        extras.includes(service.id)
                          ? 'border-primary'
                          : 'border-outline-variant hover:border-outline-variant/80'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={extras.includes(service.id)}
                        onChange={() => toggleExtra(service.id)}
                        className="sr-only"
                      />

                      {/* Ảnh */}
                      <div className="h-32 overflow-hidden relative">
                        <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                        {/* Checkmark overlay */}
                        {extras.includes(service.id) && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <span
                              className="material-symbols-outlined text-white text-4xl drop-shadow"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              check_circle
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Nội dung */}
                      <div className={`p-4 flex-1 flex flex-col justify-between transition-all ${
                        extras.includes(service.id) ? 'bg-primary/5' : 'bg-surface'
                      }`}>
                        <div>
                          <h4 className="font-bold text-on-surface">{service.title}</h4>
                          <p className={`font-semibold mt-1 ${extras.includes(service.id) ? 'text-primary' : 'text-primary'}`}>
                            {service.price.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                        <div className={`mt-3 flex items-center gap-2 text-sm font-semibold ${
                          extras.includes(service.id) ? 'text-primary' : 'text-on-surface-variant'
                        }`}>
                          <span className="material-symbols-outlined text-base" style={extras.includes(service.id) ? { fontVariationSettings: "'FILL' 1" } : {}}>
                            {extras.includes(service.id) ? 'check_circle' : 'add_circle'}
                          </span>
                          {extras.includes(service.id) ? 'Đã chọn' : 'Thêm dịch vụ'}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </section>

              {/* Ghi chú cho nhân viên */}
              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                <h3 className="font-h3 text-h3 mb-6 text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">edit_note</span>
                  Ghi chú cho nhân viên
                </h3>

                <div className="relative">
                  <textarea
                    rows={4}
                    placeholder="VD: Nhà có chó, cần gọi trước khi đến. Tập trung vệ sinh phòng bếp và phòng tắm..."
                    value={staffNote}
                    onChange={(e) => setStaffNote(e.target.value)}
                    className="w-full px-4 py-4 rounded-xl border-2 border-outline-variant/30 bg-surface focus:border-primary focus:outline-none transition-colors text-on-surface placeholder:text-on-surface-variant/40 resize-none"
                  />
                  <div className="absolute bottom-3 right-4 text-xs text-on-surface-variant/50">
                    {staffNote.length}/300
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">info</span>
                  Ghi chú sẽ được gửi trực tiếp đến nhân viên phụ trách.
                </p>
              </section>

              {/* Thanh toán */}
              <section className="glass-card bg-surface-container-item rounded-2xl p-8">
                <h3 className="font-h3 text-h3 mb-6 text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">payments</span>
                  Phương thức thanh toán
                </h3>

                <div className="space-y-3">
                  {[
                    { id: 'cash', icon: 'payments', title: 'Tiền mặt (COD)' },
                    { id: 'card', icon: 'credit_card', title: 'Visa/Mastercard' },
                    { id: 'wallet', icon: 'account_balance_wallet', title: 'MoMo/ZaloPay' },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === item.id
                          ? 'border-primary bg-primary/5'
                          : 'border-outline-variant'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={paymentMethod === item.id}
                        onChange={() => setPaymentMethod(item.id)}
                        className="accent-primary w-5 h-5"
                      />
                      <span className="material-symbols-outlined mx-4">{item.icon}</span>
                      <span className="font-semibold">{item.title}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>{/* end lg:col-span-8 */}

            {/* SIDEBAR Step 2 — same glass-card style */}
            <aside className="lg:col-span-4 sticky top-24">
              <div className="bg-background-2 glass-card p-8 rounded-2xl shadow-xl border border-white/50">
                <h3 className="font-h3 text-h3 text-primary mb-6">Tóm tắt đặt lịch</h3>

                <div className="space-y-4 mb-6 pb-6 border-b border-outline-variant/30">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Dịch vụ</span>
                    <span className="font-semibold text-on-surface">{selectedPackageData.title}</span>
                  </div>

                  <div className="flex justify-between text-on-surface-variant">
                    <span>Địa chỉ</span>
                    <span className="font-semibold text-on-surface text-right max-w-[60%] leading-snug text-sm">
                      {addressMode === 'saved'
                        ? savedAddresses[selectedSavedAddress].label
                        : newAddress.street || 'Chưa nhập'}
                    </span>
                  </div>

                  <div className="flex justify-between text-on-surface-variant">
                    <span>Thời gian</span>
                    <span className="font-semibold text-on-surface">
                      {dates[selectedDate].day}, {dates[selectedDate].date} — {selectedTime} ({duration}h)
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Giá cơ bản</span>
                    <span>{selectedPackageData.price.toLocaleString('vi-VN')}đ</span>
                  </div>

                  <div className="flex justify-between text-on-surface-variant">
                    <span>Dịch vụ thêm</span>
                    <span>{extrasPrice.toLocaleString('vi-VN')}đ</span>
                  </div>

                  {durationExtraPrice > 0 && (
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Phụ thu thời lượng</span>
                      <span>+{durationExtraPrice.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}

                  <div className="flex justify-between text-on-surface-variant">
                    <span>Phí di chuyển</span>
                    <span>{travelFee.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                <div className="pt-6 border-t-2 border-dashed border-outline-variant/30 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-on-surface-variant font-medium">Tổng thanh toán</span>
                    <span className="text-3xl font-h1 font-extrabold text-primary">
                      {total.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                <button className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-body-lg shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  Hoàn tất đặt lịch
                  <span className="material-symbols-outlined">check</span>
                </button>

                <button
                  onClick={() => setStep(1)}
                  className="w-full mt-4 border-2 border-outline-variant py-4 rounded-xl font-semibold hover:bg-surface-container active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Quay lại
                </button>
              </div>
            </aside>
          </div>
        </>
      )}
    </main>
  );
};

export default BookingPage;