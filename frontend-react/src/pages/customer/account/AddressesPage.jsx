import React, { useCallback, useEffect, useState } from "react";
import khachHangApi from "../../../api/khachHangApi";

const emptyForm = {
  label: "",
  icon: "home",
  address: "",
  note: "",
  contact: "",
};

// ─── Loading skeleton cho 1 card ────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="rounded-xl border-2 border-outline-variant/20 p-6 animate-pulse space-y-4">
    <div className="flex items-start gap-4">
      <div className="w-11 h-11 rounded-lg bg-surface-container-high shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3.5 bg-surface-container-high rounded-full w-1/3" />
        <div className="h-3 bg-surface-container-high rounded-full w-full" />
        <div className="h-3 bg-surface-container-high rounded-full w-2/3" />
      </div>
    </div>
    <div className="h-px bg-outline-variant/20" />
    <div className="flex gap-4">
      <div className="h-3 bg-surface-container-high rounded-full w-12" />
      <div className="h-3 bg-surface-container-high rounded-full w-12" />
    </div>
  </div>
);

const AddressesPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  // ── Fetch danh sách địa chỉ ──────────────────────────────────────────────
  const fetchAddresses = useCallback(async () => {
    try {
      const res = await khachHangApi.getAddresses();
      if (res.success) setAddresses(res.data); // bỏ .data thừa ở điều kiện
    } catch {
      showToast("error", "Không thể tải danh sách địa chỉ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // ── Toast helper ─────────────────────────────────────────────────────────
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Mở form thêm / sửa ───────────────────────────────────────────────────
  const openAdd = () => {
    setForm(emptyForm);
    setFormErrors({});
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (addr) => {
    setForm({ label: addr.label, address: addr.address });
    setFormErrors({});
    setEditingId(addr.id);
    setShowForm(true);
  };

  // ── Validate ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.label.trim()) e.label = "Vui lòng nhập tên địa chỉ.";
    if (!form.address.trim()) e.address = "Vui lòng nhập địa chỉ chi tiết.";
    return e;
  };

  const geocodeAddress = async (address) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
      const response = await fetch(url, { headers: { "Accept-Language": "vi-VN" } });
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
      return null;
    } catch (e) {
      console.error("Geocoding error:", e);
      return null;
    }
  };

  // ── Lưu (thêm / cập nhật) ────────────────────────────────────────────────
  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setFormErrors(e);
      return;
    }

    setSaving(true);
    
    // Tìm tọa độ (Geocoding) với thuật toán cắt chuỗi giảm dần
    let coords = await geocodeAddress(form.address);
    if (!coords) {
      const parts = form.address.split(",");
      if (parts.length > 1) coords = await geocodeAddress(parts.slice(1).join(",").trim());
      if (!coords && parts.length > 2) coords = await geocodeAddress(parts.slice(2).join(",").trim());
    }

    const payload = {
      label: form.label,
      address: form.address,
      vi_do: coords?.lat ?? null,
      kinh_do: coords?.lon ?? null,
    };

    try {
      if (editingId) {
        await khachHangApi.updateAddress(editingId, payload);
        showToast("success", "Cập nhật địa chỉ thành công.");
      } else {
        await khachHangApi.addAddress(payload);
        showToast("success", "Thêm địa chỉ thành công.");
      }
      setShowForm(false);
      setEditingId(null);
      await fetchAddresses(); // reload list
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "Lỗi khi lưu địa chỉ. Vui lòng thử lại.";
      if (err.response?.status === 422) {
        const laravelErrors = err.response.data.errors ?? {};
        const mapped = {};
        // Map field names: label → label, address → address
        Object.keys(laravelErrors).forEach((k) => {
          mapped[k] = laravelErrors[k][0];
        });
        setFormErrors(mapped);
      } else {
        showToast("error", msg);
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Xóa địa chỉ ──────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await khachHangApi.deleteAddress(id);
      showToast("success", "Đã xóa địa chỉ.");
      setDeleteConfirmId(null);
      await fetchAddresses();
    } catch {
      showToast("error", "Không thể xóa địa chỉ. Vui lòng thử lại.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-sm font-semibold transition-all
          ${
            toast.type === "success"
              ? "bg-[#E8F5E9] border-[#A5D6A7] text-[#2E7D32]"
              : "bg-error/10 border-error/30 text-error"
          }`}
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="p-8 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-h3 text-h3 text-on-surface mb-1">
            Địa chỉ đã lưu
          </h1>
          <p className="text-sm text-on-surface-variant">
            Quản lý các địa chỉ để đặt lịch nhanh hơn.
          </p>
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
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4 text-outline-variant">
              location_off
            </span>
            <p className="font-semibold text-on-surface mb-1">
              Chưa có địa chỉ nào
            </p>
            <p className="text-sm">Thêm địa chỉ để đặt lịch nhanh hơn.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`rounded-xl border-2 p-6 flex flex-col gap-4 transition-all ${
                  addr.isDefault
                    ? "border-primary bg-primary/3"
                    : "border-outline-variant/30 hover:border-outline-variant"
                }`}
              >
                {/* Top row */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${addr.isDefault ? "bg-primary/10" : "bg-surface-container"}`}
                  >
                    <span
                      className={`material-symbols-outlined text-xl ${addr.isDefault ? "text-primary" : "text-on-surface-variant"}`}
                      style={
                        addr.isDefault
                          ? { fontVariationSettings: "'FILL' 1" }
                          : {}
                      }
                    >
                      location_on
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-on-surface">
                        {addr.label}
                      </h3>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[11px] font-bold rounded-full">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {addr.address}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-outline-variant/20">
                  <button
                    onClick={() => openEdit(addr)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      edit
                    </span>{" "}
                    Sửa
                  </button>
                  {!addr.isDefault && (
                    <>
                      <button
                        onClick={() => setDeleteConfirmId(addr.id)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-error hover:underline"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          delete
                        </span>{" "}
                        Xóa
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
              <h2 className="font-h3 text-h3 text-on-surface">
                {editingId ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="w-9 h-9 rounded-lg hover:bg-surface-container flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">
                  close
                </span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Tên gợi nhớ */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">
                  Tên gợi nhớ <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Nhà riêng"
                  value={form.label}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, label: e.target.value }));
                    setFormErrors((p) => ({ ...p, label: "" }));
                  }}
                  className={`h-11 px-4 rounded-xl border bg-surface-bright focus:ring-1 outline-none text-sm text-on-surface transition-all
        ${formErrors.label ? "border-error focus:border-error focus:ring-error/20" : "border-outline-variant/60 focus:border-primary focus:ring-primary"}`}
                />
                {formErrors.label && (
                  <p className="text-xs text-error">{formErrors.label}</p>
                )}
              </div>

              {/* Address */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">
                  Địa chỉ <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant/60 text-[20px]">
                    location_on
                  </span>
                  <textarea
                    rows={2}
                    placeholder="Số nhà, tên đường, phường, quận..."
                    value={form.address}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, address: e.target.value }));
                      setFormErrors((p) => ({ ...p, address: "" }));
                    }}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-surface-bright focus:ring-1 outline-none text-sm text-on-surface transition-all resize-none
          ${formErrors.address ? "border-error focus:border-error focus:ring-error/20" : "border-outline-variant/60 focus:border-primary focus:ring-primary"}`}
                  />
                </div>
                {formErrors.address && (
                  <p className="text-xs text-error">{formErrors.address}</p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-outline-variant/20 flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors border border-outline-variant/40 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-on-primary hover:bg-primary-container shadow-[0_4px_12px_rgba(0,40,142,0.15)] transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed min-w-[130px] flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                    Đang lưu...
                  </>
                ) : editingId ? (
                  "Lưu thay đổi"
                ) : (
                  "Thêm địa chỉ"
                )}
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
              <span
                className="material-symbols-outlined text-error text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                delete
              </span>
            </div>
            <div>
              <p className="font-semibold text-on-surface mb-1">
                Xóa địa chỉ này?
              </p>
              <p className="text-sm text-on-surface-variant">
                Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-outline-variant/40 text-sm font-semibold hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-error text-on-error text-sm font-semibold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <span className="w-4 h-4 border-2 border-on-error/30 border-t-on-error rounded-full animate-spin" />
                ) : (
                  "Xóa"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressesPage;
