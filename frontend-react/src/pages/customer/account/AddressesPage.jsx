import React, { useState } from 'react';

const initialAddresses = [
  {
    id: 1,
    label: 'Nhà riêng',
    icon: 'home',
    address: '123 Đường Nguyễn Văn Linh, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh',
    note: '',
    contact: 'Nguyễn Hoàng Nam - 0901 234 567',
    isDefault: true,
  },
  {
    id: 2,
    label: 'Công ty',
    icon: 'work',
    address: 'Tòa nhà Bitexco, 2 Hải Triều, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    note: 'Lên tầng 42, gọi lễ tân',
    contact: '',
    isDefault: false,
  },
];

const iconOptions = ['home', 'work', 'apartment', 'other_houses'];

const emptyForm = { label: '', icon: 'home', address: '', note: '', contact: '' };

const AddressesPage = () => {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (addr) => {
    setForm({ label: addr.label, icon: addr.icon, address: addr.address, note: addr.note, contact: addr.contact });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.label.trim() || !form.address.trim()) return;
    if (editingId) {
      setAddresses((prev) => prev.map((a) => a.id === editingId ? { ...a, ...form } : a));
    } else {
      setAddresses((prev) => [...prev, { id: Date.now(), ...form, isDefault: prev.length === 0 }]);
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    setAddresses((prev) => {
      const next = prev.filter((a) => a.id !== id);
      // Nếu xóa địa chỉ mặc định thì tự động set cái đầu tiên còn lại làm mặc định
      if (prev.find((a) => a.id === id)?.isDefault && next.length > 0) {
        next[0].isDefault = true;
      }
      return next;
    });
    setDeleteConfirmId(null);
  };

  const handleSetDefault = (id) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  return (
    <div className="flex flex-col">

      {/* Header */}
      <div className="p-8 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-h3 text-h3 text-on-surface mb-1">Địa chỉ đã lưu</h1>
          <p className="text-sm text-on-surface-variant">Quản lý các địa chỉ để đặt lịch nhanh hơn.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold shadow-[0_4px_12px_rgba(0,40,142,0.15)] hover:bg-primary-container transition-all active:scale-[0.98] shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm địa chỉ mới
        </button>
      </div>

      {/* Address list */}
      <div className="p-8">
        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4 text-outline-variant">location_off</span>
            <p className="font-semibold text-on-surface mb-1">Chưa có địa chỉ nào</p>
            <p className="text-sm">Thêm địa chỉ để đặt lịch nhanh hơn.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`rounded-xl border-2 p-6 flex flex-col gap-4 transition-all ${
                  addr.isDefault ? 'border-primary bg-primary/3' : 'border-outline-variant/30 hover:border-outline-variant'
                }`}
              >
                {/* Top row */}
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${addr.isDefault ? 'bg-primary/10' : 'bg-surface-container'}`}>
                    <span className={`material-symbols-outlined text-xl ${addr.isDefault ? 'text-primary' : 'text-on-surface-variant'}`} style={addr.isDefault ? { fontVariationSettings: "'FILL' 1" } : {}}>
                      {addr.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-on-surface">{addr.label}</h3>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[11px] font-bold rounded-full">Mặc định</span>
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{addr.address}</p>
                    {addr.note && <p className="text-xs text-on-surface-variant/70 mt-1">Ghi chú: {addr.note}</p>}
                    {addr.contact && <p className="text-xs text-on-surface-variant/70 mt-0.5">Người nhận: {addr.contact}</p>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-outline-variant/20">
                  <button
                    onClick={() => openEdit(addr)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span> Sửa
                  </button>
                  {!addr.isDefault && (
                    <>
                      <button
                        onClick={() => setDeleteConfirmId(addr.id)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-error hover:underline"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span> Xóa
                      </button>
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="ml-auto text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
                      >
                        Đặt làm mặc định
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Form modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/30 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg border border-outline-variant/20 overflow-hidden">
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
              <h2 className="font-h3 text-h3 text-on-surface">{editingId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</h2>
              <button onClick={() => setShowForm(false)} className="w-9 h-9 rounded-lg hover:bg-surface-container flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Icon & Label */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-on-surface">Biểu tượng</label>
                  <div className="flex gap-2">
                    {iconOptions.map((ic) => (
                      <button
                        key={ic}
                        onClick={() => setForm((p) => ({ ...p, icon: ic }))}
                        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${form.icon === ic ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant/40 text-on-surface-variant hover:border-primary/50'}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">{ic}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-on-surface">Tên địa chỉ <span className="text-error">*</span></label>
                  <input
                    type="text"
                    placeholder="VD: Nhà riêng"
                    value={form.label}
                    onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                    className="h-11 px-4 rounded-xl border border-outline-variant/60 bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm text-on-surface transition-all"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">Địa chỉ <span className="text-error">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant/60 text-[20px]">location_on</span>
                  <textarea
                    rows={2}
                    placeholder="Số nhà, tên đường, phường, quận..."
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant/60 bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm text-on-surface transition-all resize-none"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">Người nhận <span className="text-on-surface-variant font-normal">(tùy chọn)</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[20px]">person</span>
                  <input
                    type="text"
                    placeholder="Tên - Số điện thoại"
                    value={form.contact}
                    onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-outline-variant/60 bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm text-on-surface transition-all"
                  />
                </div>
              </div>

              {/* Note */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">Ghi chú <span className="text-on-surface-variant font-normal">(tùy chọn)</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant/60 text-[20px]">notes</span>
                  <textarea
                    rows={2}
                    placeholder="VD: Tầng 5, gọi trước 10 phút..."
                    value={form.note}
                    onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant/60 bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm text-on-surface transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-outline-variant/20 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors border border-outline-variant/40">
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={!form.label.trim() || !form.address.trim()}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-on-primary hover:bg-primary-container shadow-[0_4px_12px_rgba(0,40,142,0.15)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingId ? 'Lưu thay đổi' : 'Thêm địa chỉ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/30 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm border border-outline-variant/20 p-6 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-error text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span>
            </div>
            <div>
              <p className="font-semibold text-on-surface mb-1">Xóa địa chỉ này?</p>
              <p className="text-sm text-on-surface-variant">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 rounded-xl border border-outline-variant/40 text-sm font-semibold hover:bg-surface-container transition-colors">
                Hủy
              </button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-2.5 rounded-xl bg-error text-on-error text-sm font-semibold hover:opacity-90 transition-all active:scale-[0.98]">
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressesPage;