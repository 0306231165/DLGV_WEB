import React, { useCallback, useEffect, useState } from "react";
import khachHangApi from "../../../api/khachHangApi";

const emptyForm = {
  ten_nguoi_nhan: "",
  sdt_nhan: "",
};

// ─── Loading skeleton cho 1 card ────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="rounded-xl border-2 border-outline-variant/20 p-6 animate-pulse space-y-4">
    <div className="flex items-start gap-4">
      <div className="w-11 h-11 rounded-lg bg-surface-container-high shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3.5 bg-surface-container-high rounded-full w-1/3" />
        <div className="h-3 bg-surface-container-high rounded-full w-1/2" />
      </div>
    </div>
  </div>
);

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  // ── Fetch danh sách liên hệ ──────────────────────────────────────────────
  const fetchContacts = useCallback(async () => {
    try {
      const res = await khachHangApi.getContacts();
      if (res.success) setContacts(res.data);
    } catch {
      showToast("error", "Không thể tải danh sách liên hệ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // ── Toast helper ─────────────────────────────────────────────────────────
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Mở form thêm ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(emptyForm);
    setFormErrors({});
    setEditingId(null);
    setShowForm(true);
  };

  // ── Mở form sửa ───────────────────────────────────────────────────────────
  const openEdit = (c) => {
    setForm({ ten_nguoi_nhan: c.ten_nguoi_nhan, sdt_nhan: c.sdt_nhan });
    setFormErrors({});
    setEditingId(c.id);
    setShowForm(true);
  };

  // ── Validate ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.ten_nguoi_nhan.trim()) e.ten_nguoi_nhan = "Vui lòng nhập tên người nhận.";
    const sdt = form.sdt_nhan.trim();
    if (!sdt) {
      e.sdt_nhan = "Vui lòng nhập số điện thoại.";
    } else if (!/^[0-9]{1,15}$/.test(sdt)) {
      e.sdt_nhan = "Số điện thoại chỉ gồm chữ số, tối đa 15 số.";
    }
    return e;
  };

  // ── Lưu (thêm) ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setFormErrors(e);
      return;
    }

    setSaving(true);
    const payload = {
      ten_nguoi_nhan: form.ten_nguoi_nhan,
      sdt_nhan: form.sdt_nhan,
    };

    try {
      if (editingId) {
        await khachHangApi.updateContact(editingId, payload);
        showToast("success", "Cập nhật liên hệ thành công.");
      } else {
        await khachHangApi.addContact(payload);
        showToast("success", "Thêm liên hệ thành công.");
      }
      setShowForm(false);
      setEditingId(null);
      await fetchContacts(); // reload list
    } catch (err) {
      const msg =
        err.response?.data?.message ?? "Lỗi khi lưu liên hệ. Vui lòng thử lại.";
      if (err.response?.status === 422) {
        const laravelErrors = err.response.data.errors ?? {};
        const mapped = {};
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

  // ── Xóa liên hệ ───────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await khachHangApi.deleteContact(id);
      showToast("success", "Đã xóa liên hệ.");
      setDeleteConfirmId(null);
      await fetchContacts();
    } catch {
      showToast("error", "Không thể xóa liên hệ. Vui lòng thử lại.");
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
            Liên hệ đã lưu
          </h1>
          <p className="text-sm text-on-surface-variant">
            Lưu sẵn người nhận để đặt lịch nhanh hơn.
          </p>
        </div>
        <button
          onClick={openAdd}
          disabled={contacts.length >= 10}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold shadow-[0_4px_12px_rgba(0,40,142,0.15)] hover:bg-primary-container transition-all active:scale-[0.98] shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm liên hệ mới
        </button>
      </div>

      {/* Contact list */}
      <div className="p-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4 text-outline-variant">
              person_off
            </span>
            <p className="font-semibold text-on-surface mb-1">
              Chưa có liên hệ nào
            </p>
            <p className="text-sm">Thêm liên hệ để đặt lịch nhanh hơn.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border-2 border-outline-variant/30 hover:border-outline-variant p-6 flex flex-col gap-4 transition-all"
              >
                {/* Top row */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 bg-surface-container">
                    <span className="material-symbols-outlined text-xl text-on-surface-variant">
                      person
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-on-surface mb-1">
                      {c.ten_nguoi_nhan}
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {c.sdt_nhan}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-outline-variant/20">
                  <button
                    onClick={() => openEdit(c)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      edit
                    </span>{" "}
                    Sửa
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(c.id)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-error hover:underline"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      delete
                    </span>{" "}
                    Xóa
                  </button>
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
                {editingId ? "Chỉnh sửa liên hệ" : "Thêm liên hệ mới"}
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
              {/* Tên người nhận */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">
                  Tên người nhận <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn A"
                  value={form.ten_nguoi_nhan}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, ten_nguoi_nhan: e.target.value }));
                    setFormErrors((p) => ({ ...p, ten_nguoi_nhan: "" }));
                  }}
                  className={`h-11 px-4 rounded-xl border bg-surface-bright focus:ring-1 outline-none text-sm text-on-surface transition-all
        ${formErrors.ten_nguoi_nhan ? "border-error focus:border-error focus:ring-error/20" : "border-outline-variant/60 focus:border-primary focus:ring-primary"}`}
                />
                {formErrors.ten_nguoi_nhan && (
                  <p className="text-xs text-error">{formErrors.ten_nguoi_nhan}</p>
                )}
              </div>

              {/* SĐT */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">
                  Số điện thoại <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[20px]">
                    call
                  </span>
                  <input
                    type="tel"
                    placeholder="VD: 0901234567"
                    value={form.sdt_nhan}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, sdt_nhan: e.target.value }));
                      setFormErrors((p) => ({ ...p, sdt_nhan: "" }));
                    }}
                    className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-surface-bright focus:ring-1 outline-none text-sm text-on-surface transition-all
          ${formErrors.sdt_nhan ? "border-error focus:border-error focus:ring-error/20" : "border-outline-variant/60 focus:border-primary focus:ring-primary"}`}
                  />
                </div>
                {formErrors.sdt_nhan && (
                  <p className="text-xs text-error">{formErrors.sdt_nhan}</p>
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
                  "Thêm liên hệ"
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
                Xóa liên hệ này?
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

export default ContactsPage;