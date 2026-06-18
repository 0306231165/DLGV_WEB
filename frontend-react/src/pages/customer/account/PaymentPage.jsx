import React, { useEffect, useState, useCallback } from "react";
import khachHangApi from "../../../api/khachHangApi";

// ── Danh sách ngân hàng VN ────────────────────────────────────────────────────
const VN_BANKS = [
  "Vietcombank",
  "VietinBank",
  "BIDV",
  "Agribank",
  "Techcombank",
  "MB Bank",
  "ACB",
  "VPBank",
  "TPBank",
  "Sacombank",
  "HDBank",
  "VIB",
  "OCB",
  "MSB",
  "SeABank",
  "SHB",
  "Eximbank",
  "LPBank",
  "NamABank",
  "BacABank",
  "PVcomBank",
  "Vietbank",
  "CBBank",
  "OceanBank",
  "GPBank",
  "BaoVietBank",
  "VietABank",
  "KienLongBank",
  "PGBank",
  "NCB",
  "VISA",
  "MASTERCARD",
  "AMEX",
];

// ── helpers ───────────────────────────────────────────────────────────────────
const maskCard = (num = "") => {
  const clean = num.replace(/\s/g, "");
  return clean.length >= 4 ? "**** **** **** " + clean.slice(-4) : num;
};

const CARD_COLORS = {
  VISA: "from-[#1A1F36] to-[#2E3650]",
  MASTERCARD: "from-[#1B0000] to-[#4A0000]",
  AMEX: "from-[#003366] to-[#005B99]",
  Techcombank: "from-[#CC0000] to-[#8B0000]",
  Vietcombank: "from-[#005F3D] to-[#003D28]",
  MB: "from-[#003087] to-[#001A4D]",
  DEFAULT: "from-[#1A1A2E] to-[#16213E]",
};

const getCardColor = (bank = "") => {
  const key = Object.keys(CARD_COLORS).find((k) =>
    bank.toLowerCase().includes(k.toLowerCase()),
  );
  return CARD_COLORS[key] ?? CARD_COLORS.DEFAULT;
};

// ── BankDropdown ──────────────────────────────────────────────────────────────
const BankDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = VN_BANKS.filter((b) =>
    b.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (bank) => {
    onChange(bank);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-11 pl-10 pr-4 rounded-xl border border-outline-variant/60 bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all text-left flex items-center justify-between"
      >
        <span
          className={value ? "text-on-surface" : "text-on-surface-variant/50"}
        >
          {value || "Chọn ngân hàng..."}
        </span>
        <span className="material-symbols-outlined text-on-surface-variant/60 text-[18px]">
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[20px] pointer-events-none">
        account_balance
      </span>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-xl overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-outline-variant/20">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[16px]">
                  search
                </span>
                <input
                  autoFocus
                  type="text"
                  placeholder="Tìm ngân hàng..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-8 pr-3 rounded-lg border border-outline-variant/40 bg-surface-bright text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
            {/* List */}
            <ul className="max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-sm text-on-surface-variant text-center">
                  Không tìm thấy
                </li>
              ) : (
                filtered.map((bank) => (
                  <li key={bank}>
                    <button
                      type="button"
                      onClick={() => handleSelect(bank)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-surface-container transition-colors
                        ${value === bank ? "bg-primary/5 text-primary font-semibold" : "text-on-surface"}`}
                    >
                      {bank}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

// ── Component chính ───────────────────────────────────────────────────────────
const PaymentPage = () => {
  const [cards, setCards] = useState([]);
  const [momo, setMomo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showMomoModal, setShowMomoModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [showUnlinkMomo, setShowUnlinkMomo] = useState(false);

  const [form, setForm] = useState({
    ten_ngan_hang: "",
    so_tai_khoan: "",
    chu_tai_khoan: "",
  });
  const [momoPhone, setMomoPhone] = useState("");

  // ── toast ──
  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── fetch ──
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await khachHangApi.getPaymentMethods();

      // axiosClient đã unwrap 1 lần: res.data = { success, data: { cards, momo } }
      // nhưng thực tế res.data = { cards, momo } luôn → dùng trực tiếp
      const payload = res.data?.data ?? res.data; // tương thích cả 2 trường hợp

      setCards(payload.cards ?? []);
      setMomo(payload.momo ?? null);
    } catch (err) {
      console.error("fetchPayments error:", err);
      showToast(
        "error",
        err?.response?.data?.message ?? "Không thể tải dữ liệu thanh toán.",
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // ── thêm thẻ ──
  const handleAddCard = async () => {
    if (!form.ten_ngan_hang || !form.so_tai_khoan || !form.chu_tai_khoan)
      return;
    setSubmitting(true);
    try {
      await khachHangApi.addCard({
        ten_ngan_hang: form.ten_ngan_hang,
        so_tai_khoan: form.so_tai_khoan.replace(/\s/g, ""),
        chu_tai_khoan: form.chu_tai_khoan.toUpperCase(),
      });
      showToast("success", "Thêm thẻ thành công!");
      setShowAddCard(false);
      setForm({ ten_ngan_hang: "", so_tai_khoan: "", chu_tai_khoan: "" });
      fetchPayments();
    } catch (err) {
      showToast("error", err?.response?.data?.message ?? "Thêm thẻ thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── xóa thẻ ──
  const handleDeleteCard = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await khachHangApi.deletePaymentMethod(deleteTarget.id);
      showToast("success", "Đã xóa thẻ.");
      setDeleteTarget(null);
      fetchPayments();
    } catch {
      showToast("error", "Xóa thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── MoMo ──
  const handleLinkMomo = async () => {
    if (!momoPhone) return;
    setSubmitting(true);
    try {
      await khachHangApi.linkMomo({ so_dien_thoai: momoPhone });
      showToast("success", "Liên kết MoMo thành công!");
      setShowMomoModal(false);
      setMomoPhone("");
      fetchPayments();
    } catch {
      showToast("error", "Liên kết MoMo thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlinkMomo = async () => {
    setSubmitting(true);
    try {
      await khachHangApi.unlinkMomo();
      showToast("success", "Đã hủy liên kết MoMo.");
      setMomo(null);
    } catch {
      showToast("error", "Hủy liên kết thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── format số thẻ ──
  const handleCardNumberInput = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    const spaced = digits.replace(/(.{4})/g, "$1 ").trim();
    setForm((f) => ({ ...f, so_tai_khoan: spaced }));
  };

  // Chỉ cần 3 trường không rỗng là được
  const formValid =
    form.ten_ngan_hang.trim() &&
    form.so_tai_khoan.trim() &&
    form.chu_tai_khoan.trim();

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-sm font-semibold
          ${toast.type === "success" ? "bg-[#E8F5E9] border-[#A5D6A7] text-[#2E7D32]" : "bg-[#FFEBEE] border-[#EF9A9A] text-[#C62828]"}`}
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
      <div className="p-8 border-b border-outline-variant/20">
        <h1 className="font-h3 text-h3 text-on-surface mb-1">
          Thanh toán & Ưu đãi
        </h1>
        <p className="text-sm text-on-surface-variant">
          Quản lý thẻ và ví điện tử của bạn.
        </p>
      </div>

      <div className="p-8 space-y-10">
        {/* ── Thẻ thanh toán ── */}
        <section>
          <h2 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              credit_card
            </span>
            Thẻ thanh toán
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[168px] rounded-xl bg-surface-container-high animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`relative bg-gradient-to-br ${getCardColor(card.ten_ngan_hang)} rounded-xl p-6 shadow-lg border border-white/10 overflow-hidden group`}
                >
                  <button
                    onClick={() =>
                      setDeleteTarget({
                        id: card.id,
                        label: maskCard(card.so_tai_khoan),
                      })
                    }
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/15 hover:bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20"
                  >
                    <span className="material-symbols-outlined text-white text-[15px]">
                      close
                    </span>
                  </button>

                  {/* Icon thẻ — thêm mt để cách xa nút X */}
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="text-white">
                      <p className="text-xs opacity-60 mb-1">Ngân hàng</p>
                      <p className="font-semibold text-sm">
                        {card.ten_ngan_hang}
                      </p>
                    </div>
                    {/* Thêm mt-6 để đẩy icon xuống, tránh đè lên nút X */}
                    <span className="material-symbols-outlined text-white/30 text-[40px] mt-6">
                      credit_card
                    </span>
                  </div>
                  <div className="relative z-10 text-white">
                    <p className="tracking-[0.2em] text-sm mb-4 font-mono">
                      {maskCard(card.so_tai_khoan)}
                    </p>
                    <div>
                      <p className="text-[10px] opacity-60 uppercase">
                        Chủ thẻ
                      </p>
                      <p className="text-sm font-semibold">
                        {card.chu_tai_khoan}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {cards.length < 5 && (
                <button
                  onClick={() => setShowAddCard(true)}
                  className="bg-surface-container-low border-2 border-dashed border-outline-variant/50 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-surface-container hover:border-primary/50 transition-all group min-h-[168px]"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-primary">
                      add
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    Thêm thẻ mới
                  </p>
                </button>
              )}
            </div>
          )}
        </section>

        {/* ── Ví MoMo ── */}
        <section>
          <h2 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              account_balance_wallet
            </span>
            Ví điện tử đã liên kết
          </h2>
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4 flex items-center justify-between shadow-sm max-w-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#AE2070]/10 rounded-lg flex items-center justify-center text-[#AE2070] font-bold text-lg">
                M
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">MoMo</p>
                {loading ? (
                  <div className="h-3 w-24 bg-surface-container-high rounded-full animate-pulse mt-1" />
                ) : (
                  <p className="text-xs text-on-surface-variant">
                    {momo
                      ? `${momo.so_dien_thoai.slice(0, 3)}****${momo.so_dien_thoai.slice(-3)} · Đã liên kết`
                      : "Chưa liên kết"}
                  </p>
                )}
              </div>
            </div>
            {momo ? (
              <button
                onClick={() => setShowUnlinkMomo(true)} // ← mở modal
                disabled={submitting}
                className="text-sm font-semibold text-error hover:underline disabled:opacity-50"
              >
                Hủy liên kết
              </button>
            ) : (
              <button
                onClick={() => setShowMomoModal(true)}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Liên kết
              </button>
            )}
          </div>
        </section>
      </div>

      {/* ══ Modal thêm thẻ ══ */}
      {showAddCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/30 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md border border-outline-variant/20 overflow-hidden">
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
              <h2 className="font-h3 text-h3 text-on-surface">Thêm thẻ mới</h2>
              <button
                onClick={() => {
                  setShowAddCard(false);
                  setForm({
                    ten_ngan_hang: "",
                    so_tai_khoan: "",
                    chu_tai_khoan: "",
                  });
                }}
                className="w-9 h-9 rounded-lg hover:bg-surface-container flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-on-surface-variant">
                  close
                </span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Ngân hàng */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">
                  Ngân hàng / Tổ chức phát hành
                </label>
                <BankDropdown
                  value={form.ten_ngan_hang}
                  onChange={(val) =>
                    setForm((f) => ({ ...f, ten_ngan_hang: val }))
                  }
                />
              </div>

              {/* Số thẻ */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">
                  Số thẻ
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[20px]">
                    credit_card
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="1234 5678 9012 3456"
                    value={form.so_tai_khoan}
                    onChange={(e) => handleCardNumberInput(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-outline-variant/60 bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all font-mono tracking-widest"
                  />
                </div>
              </div>

              {/* Chủ thẻ */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">
                  Tên chủ thẻ
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[20px]">
                    person
                  </span>
                  <input
                    type="text"
                    placeholder="NGUYEN VAN A"
                    value={form.chu_tai_khoan}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        chu_tai_khoan: e.target.value.toUpperCase(),
                      }))
                    }
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-outline-variant/60 bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all uppercase"
                  />
                </div>
              </div>

              <p className="text-xs text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">
                  lock
                </span>
                Thông tin thẻ được mã hóa và bảo mật.
              </p>
            </div>
            <div className="p-6 border-t border-outline-variant/20 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddCard(false);
                  setForm({
                    ten_ngan_hang: "",
                    so_tai_khoan: "",
                    chu_tai_khoan: "",
                  });
                }}
                className="px-5 py-2.5 rounded-xl border border-outline-variant/40 text-sm font-semibold hover:bg-surface-container transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleAddCard}
                disabled={submitting || !formValid}
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold shadow-[0_4px_12px_rgba(0,40,142,0.15)] hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? "Đang lưu..." : "Lưu thẻ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Modal liên kết MoMo ══ */}
      {showMomoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/30 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm border border-outline-variant/20 overflow-hidden">
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#AE2070]/10 rounded-lg flex items-center justify-center text-[#AE2070] font-bold">
                  M
                </div>
                <h2 className="font-semibold text-on-surface">Liên kết MoMo</h2>
              </div>
              <button
                onClick={() => {
                  setShowMomoModal(false);
                  setMomoPhone("");
                }}
                className="w-9 h-9 rounded-lg hover:bg-surface-container flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-on-surface-variant">
                  close
                </span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-on-surface-variant">
                Nhập số điện thoại đã đăng ký tài khoản MoMo của bạn.
              </p>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">
                  Số điện thoại MoMo
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[20px]">
                    smartphone
                  </span>
                  <input
                    type="tel"
                    placeholder="09xxxxxxxx"
                    value={momoPhone}
                    onChange={(e) =>
                      setMomoPhone(
                        e.target.value.replace(/\D/g, "").slice(0, 11),
                      )
                    }
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-outline-variant/60 bg-surface-bright focus:border-[#AE2070] focus:ring-1 focus:ring-[#AE2070] outline-none text-sm transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-outline-variant/20 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowMomoModal(false);
                  setMomoPhone("");
                }}
                className="px-5 py-2.5 rounded-xl border border-outline-variant/40 text-sm font-semibold hover:bg-surface-container transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleLinkMomo}
                disabled={submitting || momoPhone.length < 9}
                className="px-6 py-2.5 rounded-xl bg-[#AE2070] text-white text-sm font-semibold hover:bg-[#8D1959] transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? "Đang liên kết..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Modal xác nhận xóa thẻ ══ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/30 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm border border-outline-variant/20 p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-outlined text-error text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  delete
                </span>
              </div>
              <div>
                <p className="font-semibold text-on-surface mb-1">
                  Xóa thẻ này?
                </p>
                <p className="text-sm text-on-surface-variant">
                  Thẻ{" "}
                  <span className="font-semibold text-on-surface">
                    {deleteTarget.label}
                  </span>{" "}
                  sẽ bị xóa khỏi tài khoản của bạn.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2.5 rounded-xl border border-outline-variant/40 text-sm font-semibold hover:bg-surface-container transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteCard}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-error text-on-error text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {submitting ? "Đang xóa..." : "Xóa thẻ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Modal xác nhận hủy MoMo ══ */}
      {showUnlinkMomo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/30 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm border border-outline-variant/20 p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-full bg-[#AE2070]/10 flex items-center justify-center shrink-0">
                <span className="text-[#AE2070] font-bold text-lg">M</span>
              </div>
              <div>
                <p className="font-semibold text-on-surface mb-1">
                  Hủy liên kết MoMo?
                </p>
                <p className="text-sm text-on-surface-variant">
                  Số{" "}
                  <span className="font-semibold text-on-surface">
                    {momo
                      ? `${momo.so_dien_thoai.slice(0, 3)}****${momo.so_dien_thoai.slice(-3)}`
                      : ""}
                  </span>{" "}
                  sẽ bị hủy liên kết khỏi tài khoản của bạn.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowUnlinkMomo(false)}
                className="px-5 py-2.5 rounded-xl border border-outline-variant/40 text-sm font-semibold hover:bg-surface-container transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  setShowUnlinkMomo(false);
                  await handleUnlinkMomo();
                }}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-[#AE2070] text-white text-sm font-semibold hover:bg-[#8D1959] transition-all disabled:opacity-50"
              >
                {submitting ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
