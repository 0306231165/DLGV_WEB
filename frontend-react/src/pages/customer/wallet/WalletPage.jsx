import React, { useState, useRef, useEffect } from "react";
import viTienApi from "../../../api/khachHangApi";

// ── Danh sách ngân hàng VN ─────────────────────────────────────────────────
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
];

// ── BankDropdown ───────────────────────────────────────────────────────────
const BankDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = VN_BANKS.filter((b) =>
    b.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-11 pl-10 pr-4 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all text-left flex items-center justify-between font-bold"
      >
        <span
          className={value ? "text-on-surface" : "text-on-surface-variant/50"}
        >
          {value || "Chọn ngân hàng..."}
        </span>
        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[20px] pointer-events-none">
        account_balance
      </span>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white rounded-xl shadow-xl border border-outline-variant/30 overflow-hidden">
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
                  className="w-full h-9 pl-8 pr-3 rounded-lg border border-outline-variant/40 bg-surface text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
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
                      onClick={() => {
                        onChange(bank);
                        setOpen(false);
                        setSearch("");
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-surface-container transition-colors ${
                        value === bank
                          ? "bg-primary/5 text-primary font-semibold"
                          : "text-on-surface"
                      }`}
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (num) => Number(num).toLocaleString("vi-VN") + "đ";

const formatNumberWithCommas = (value) => {
  if (!value) return "";
  return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const parseRawNumber = (str) => {
  if (!str) return 0;
  return Number(str.replace(/,/g, ""));
};

// Map loai_giao_dich từ backend → type UI
const mapLoaiGD = (loai) => {
  const m = {
    NapTien: "deposit",
    ThanhToanDonHang: "payment",
    HoanTien: "refund",
    RutTien: "withdraw",
    NhanLuongCaLam: "deposit",
    PhatHuyDon: "payment",
  };
  return m[loai] || "payment";
};

const mapTrangThai = (t) => {
  if (t === "ThanhCong") return "success";
  if (t === "DangXuLy") return "pending";
  return "failed";
};

const formatDateTime = (str) => {
  if (!str) return "";
  const d = new Date(str);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Component ────────────────────────────────────────────────────────────────
const WalletPage = () => {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [savedBanks, setSavedBanks] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");

  // ── UI state ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("all");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Deposit modal
  const [isDepositDropdownOpen, setIsDepositDropdownOpen] = useState(false);
  const [depositMethod, setDepositMethod] = useState("Ví điện tử MoMo");
  const [depositAmountStr, setDepositAmountStr] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState("");
  const depositDropdownRef = useRef(null);

  // Withdraw modal
  const [withdrawMode, setWithdrawMode] = useState("saved"); // 'saved' | 'manual'
  const [selectedBankId, setSelectedBankId] = useState("");
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [manualBank, setManualBank] = useState({
    ten_ngan_hang: "",
    so_tai_khoan: "",
    chu_tai_khoan: "",
  });
  const [withdrawAmountStr, setWithdrawAmountStr] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const bankDropdownRef = useRef(null);

  const rawDepositAmount = parseRawNumber(depositAmountStr);
  const rawWithdrawAmount = parseRawNumber(withdrawAmountStr);
  const withdrawFee = Math.round(rawWithdrawAmount * 0.2);
  const actualReceive = rawWithdrawAmount - withdrawFee;

  // ── Fetch data on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      setDataLoading(true);
      setDataError("");
      try {
        const [viRes, bankRes] = await Promise.all([
          viTienApi.getViTien(),
          viTienApi.getNganHangDaLuu(),
        ]);
        setBalance(viRes.so_du ?? 0);
        setTransactions(viRes.giao_dich ?? []);
        setSavedBanks(bankRes.data ?? []);
        // Mặc định chọn ngân hàng đầu tiên nếu có
        if (bankRes.data?.length > 0) {
          setSelectedBankId(String(bankRes.data[0].id));
        }
      } catch {
        setDataError("Không thể tải dữ liệu ví. Vui lòng thử lại.");
      } finally {
        setDataLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        depositDropdownRef.current &&
        !depositDropdownRef.current.contains(e.target)
      )
        setIsDepositDropdownOpen(false);
      if (
        bankDropdownRef.current &&
        !bankDropdownRef.current.contains(e.target)
      )
        setIsBankDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (rawDepositAmount <= 0) return;
    setDepositLoading(true);
    setDepositError("");
    try {
      const res = await viTienApi.napTien({
        so_tien: rawDepositAmount,
        phuong_thuc_nap: depositMethod,
      });
      setBalance(res.so_du_moi);
      // Reload giao dịch
      const viRes = await viTienApi.getViTien();
      setTransactions(viRes.giao_dich ?? []);
      setShowDepositModal(false);
      setDepositAmountStr("");
    } catch (err) {
      setDepositError(err?.message || "Nạp tiền thất bại. Vui lòng thử lại.");
    } finally {
      setDepositLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    if (rawWithdrawAmount <= 0) return;
    setWithdrawLoading(true);
    setWithdrawError("");

    try {
      let payload = { so_tien: rawWithdrawAmount };

      if (withdrawMode === "saved") {
        if (!selectedBankId) {
          setWithdrawError("Vui lòng chọn ngân hàng đã lưu.");
          setWithdrawLoading(false);
          return;
        }
        payload.ngan_hang_id = Number(selectedBankId);
      } else {
        if (
          !manualBank.ten_ngan_hang ||
          !manualBank.so_tai_khoan ||
          !manualBank.chu_tai_khoan
        ) {
          setWithdrawError("Vui lòng điền đầy đủ thông tin ngân hàng.");
          setWithdrawLoading(false);
          return;
        }
        payload = { ...payload, ...manualBank };
      }

      const res = await viTienApi.rutTien(payload);
      setBalance(res.so_du_moi);
      const viRes = await viTienApi.getViTien();
      setTransactions(viRes.giao_dich ?? []);
      setShowWithdrawModal(false);
      setWithdrawAmountStr("");
      setManualBank({ ten_ngan_hang: "", so_tai_khoan: "", chu_tai_khoan: "" });
    } catch (err) {
      setWithdrawError(err?.message || "Rút tiền thất bại. Vui lòng thử lại.");
    } finally {
      setWithdrawLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((txn) => {
    const type = mapLoaiGD(txn.loai_giao_dich);
    if (activeTab === "all") return true;
    return type === activeTab;
  });

  const selectedBank = savedBanks.find((b) => String(b.id) === selectedBankId);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background-2 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-h1 text-h1 text-primary mb-2">
          Ví CleanTrust của tôi
        </h1>
        <p className="text-on-surface-variant text-sm mb-8">
          Quản lý nguồn tiền, nạp tiền tiện lợi và theo dõi lịch sử chi tiêu
          dịch vụ của bạn.
        </p>

        {/* Lỗi tải data */}
        {dataError && (
          <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-xl text-error text-sm">
            {dataError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* ─── CỘT TRÁI ─── */}
          <div className="md:col-span-5 space-y-6">
            {/* Thẻ ví */}
            <div className="bg-gradient-to-br from-primary via-primary/90 to-blue-700 text-on-primary p-6 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
                <span
                  className="material-symbols-outlined text-[150px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  account_balance_wallet
                </span>
              </div>
              <div className="flex items-center gap-2 text-on-primary/70 text-xs font-black uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-sm">
                  shield
                </span>
                Số dư khả dụng
              </div>
              {dataLoading ? (
                <div className="text-3xl font-black mb-8 tracking-tight opacity-50 animate-pulse">
                  Đang tải...
                </div>
              ) : (
                <div className="text-3xl font-black mb-8 tracking-tight">
                  {fmt(balance)}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDepositModal(true);
                    setDepositError("");
                  }}
                  className="flex-1 py-3 bg-white text-primary hover:bg-surface-container-lowest font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base font-bold">
                    add_circle
                  </span>
                  Nạp tiền
                </button>
                {/* Fix: thêm bg rõ ràng + cursor-pointer để hover/click ăn toàn button */}
                <button
                  onClick={() => {
                    setShowWithdrawModal(true);
                    setWithdrawError("");
                  }}
                  className="flex-1 py-3 bg-white/20 text-white border border-white/30 hover:bg-white/30 font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base ">
                    account_balance
                  </span>
                  Rút về bank
                </button>
              </div>
            </div>

            {/* Quy định */}
            <div className="bg-white p-5 rounded-3xl border border-outline-variant/40 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-primary font-black text-base border-b border-outline-variant/20 pb-2.5">
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  gavel
                </span>
                Quy định sử dụng ví:
              </div>
              <div className="flex gap-3 items-start text-sm text-on-surface font-medium leading-relaxed">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                <p>
                  Thanh toán trực tiếp bằng số dư ví được{" "}
                  <span className="text-primary font-bold">giảm thêm 2%</span>{" "}
                  trên tổng giá trị hóa đơn đặt lịch dọn dẹp.
                </p>
              </div>
              <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 flex gap-3 items-start">
                <span
                  className="material-symbols-outlined text-red-700 shrink-0 mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  error
                </span>
                <div className="text-xs text-red-900 leading-relaxed font-bold">
                  CHÍNH SÁCH KHẤU TRỪ SÀN:
                  <span className="block font-medium text-red-800 mt-1">
                    Khi rút tiền từ Ví nội bộ về tài khoản Ngân hàng, hệ thống
                    áp dụng mức{" "}
                    <span className="text-red-700 font-black underline decoration-2">
                      phí xử lý 20%
                    </span>{" "}
                    trên tổng số tiền rút.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── CỘT PHẢI: LỊCH SỬ ─── */}
          <div className="md:col-span-7 bg-white p-6 rounded-3xl shadow-md border border-outline-variant/30">
            <h3 className="font-h3 text-h3 text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                history
              </span>
              Lịch sử giao dịch
            </h3>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-2 mb-4 border-b border-outline-variant/20 scrollbar-none">
              {[
                { id: "all", label: "Tất cả" },
                { id: "deposit", label: "Nạp tiền" },
                { id: "payment", label: "Thanh toán" },
                { id: "withdraw", label: "Rút tiền" },
                { id: "refund", label: "Hoàn tiền" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-primary text-on-primary"
                      : "bg-surface hover:bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Danh sách giao dịch */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {dataLoading ? (
                <div className="py-12 text-center text-on-surface-variant text-sm animate-pulse">
                  Đang tải lịch sử giao dịch...
                </div>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((txn) => {
                  const type = mapLoaiGD(txn.loai_giao_dich);
                  const isNegative = txn.loai_bien_dong === "Giam";
                  const status = mapTrangThai(txn.trang_thai);
                  return (
                    <div
                      key={txn.id}
                      className="flex items-start justify-between gap-3 p-3 bg-surface hover:bg-surface-container-low rounded-xl border border-outline-variant/20 transition-all"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold ${
                            type === "deposit"
                              ? "bg-secondary/10 text-secondary"
                              : type === "payment"
                                ? "bg-primary/10 text-primary"
                                : type === "refund"
                                  ? "bg-tertiary/10 text-tertiary"
                                  : "bg-error/10 text-error"
                          }`}
                        >
                          <span className="material-symbols-outlined text-xl">
                            {type === "deposit"
                              ? "arrow_downward"
                              : type === "payment"
                                ? "shopping_bag"
                                : type === "refund"
                                  ? "keyboard_return"
                                  : "arrow_upward"}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-on-surface">
                            {txn.noi_dung}
                          </p>
                          <p className="text-[11px] text-on-surface-variant mt-0.5">
                            {formatDateTime(txn.thoi_gian)} ·{" "}
                            <span className="italic">{txn.ma_giao_dich}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p
                          className={`text-sm font-black ${isNegative ? "text-error" : "text-secondary"}`}
                        >
                          {isNegative ? "-" : "+"}
                          {fmt(txn.so_tien)}
                        </p>
                        <p className="text-[10px] text-on-surface-variant">
                          Dư: {fmt(txn.so_du_sau_giao_dich)}
                        </p>
                        <span
                          className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-1 ${
                            status === "success"
                              ? "bg-emerald-100 text-emerald-700"
                              : status === "pending"
                                ? "bg-orange-100 text-orange-600"
                                : "bg-red-100 text-red-600"
                          }`}
                        >
                          {status === "success"
                            ? "Thành công"
                            : status === "pending"
                              ? "Chờ duyệt"
                              : "Thất bại"}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-on-surface-variant text-sm">
                  Không tìm thấy giao dịch nào tương ứng.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── MODAL NẠP TIỀN ─── */}
        {showDepositModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/30">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-h3 text-h3 text-on-surface">
                  Nạp tiền vào ví
                </h3>
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant hover:bg-error/10 hover:text-error flex items-center justify-center transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">
                    close
                  </span>
                </button>
              </div>

              <form onSubmit={handleDepositSubmit} className="space-y-5">
                {/* Số tiền */}
                <div>
                  <label className="block text-xs font-black uppercase text-on-surface-variant mb-1.5 tracking-wider">
                    Nhập số tiền muốn nạp (VND)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Ví dụ: 2,000,000"
                      required
                      value={depositAmountStr}
                      onChange={(e) =>
                        setDepositAmountStr(
                          formatNumberWithCommas(e.target.value),
                        )
                      }
                      className="w-full pl-4 pr-12 py-3 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-base font-black tracking-wide text-on-surface"
                    />
                    <span className="absolute right-4 text-sm font-bold text-on-surface-variant">
                      đ
                    </span>
                  </div>
                </div>

                {/* Phương thức nạp */}
                <div className="relative" ref={depositDropdownRef}>
                  <label className="block text-xs font-black uppercase text-on-surface-variant mb-1.5 tracking-wider">
                    Chọn phương thức nạp
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setIsDepositDropdownOpen(!isDepositDropdownOpen)
                    }
                    className="w-full bg-surface border border-outline-variant text-on-surface text-[14px] font-semibold py-3 px-4 rounded-xl cursor-pointer flex items-center justify-between hover:border-primary/50 transition-all"
                  >
                    <span className="font-bold">{depositMethod}</span>
                    <span
                      className={`material-symbols-outlined text-on-surface-variant text-[22px] transition-transform duration-200 ${
                        isDepositDropdownOpen ? "rotate-180 text-primary" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {isDepositDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-outline-variant/30 overflow-hidden z-30 py-1">
                      {[
                        "Ví điện tử MoMo",
                        "Cổng thanh toán VNPAY",
                        "Thẻ quốc tế Visa/Mastercard",
                      ].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => {
                            setDepositMethod(method);
                            setIsDepositDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-[14px] transition-colors hover:bg-primary/5 cursor-pointer ${
                            depositMethod === method
                              ? "font-black text-primary bg-primary/10"
                              : "font-medium text-on-surface"
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Error */}
                {depositError && (
                  <p className="text-error text-sm bg-error/10 border border-error/20 rounded-xl px-4 py-2">
                    {depositError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={depositLoading || rawDepositAmount < 10000}
                  className="w-full py-3.5 bg-primary text-on-primary font-bold rounded-xl mt-4 shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {depositLoading
                    ? "Đang xử lý..."
                    : "Xác nhận Thanh toán & Nạp ví"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ─── MODAL RÚT TIỀN ─── */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/30 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-h3 text-h3 text-on-surface">
                  Rút tiền về Ngân hàng
                </h3>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant hover:bg-error/10 hover:text-error flex items-center justify-center transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">
                    close
                  </span>
                </button>
              </div>

              {/* Cảnh báo phí */}
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 mb-4 flex items-start gap-2">
                <span
                  className="material-symbols-outlined text-red-700 text-sm shrink-0 mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  warning
                </span>
                <span className="font-medium">
                  Phí rút về ngân hàng là{" "}
                  <span className="font-black text-red-700 underline">20%</span>{" "}
                  giá trị giao dịch theo điều khoản sàn.
                </span>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                {/* Toggle chọn ngân hàng */}
                <div>
                  <label className="block text-xs font-black uppercase text-on-surface-variant mb-2 tracking-wider">
                    Thông tin ngân hàng nhận
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-outline-variant">
                    <button
                      type="button"
                      onClick={() => setWithdrawMode("saved")}
                      className={`flex-1 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                        withdrawMode === "saved"
                          ? "bg-primary text-white"
                          : "bg-surface text-on-surface-variant hover:bg-surface-container-low"
                      }`}
                    >
                      Ngân hàng đã lưu
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithdrawMode("manual")}
                      className={`flex-1 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                        withdrawMode === "manual"
                          ? "bg-primary text-white"
                          : "bg-surface text-on-surface-variant hover:bg-surface-container-low"
                      }`}
                    >
                      Tự nhập mới
                    </button>
                  </div>
                </div>

                {/* Mode: Ngân hàng đã lưu */}
                {withdrawMode === "saved" && (
                  <div className="relative" ref={bankDropdownRef}>
                    {savedBanks.length === 0 ? (
                      <div className="p-4 bg-surface-container-low rounded-xl text-sm text-on-surface-variant text-center">
                        Bạn chưa lưu ngân hàng nào.{" "}
                        <button
                          type="button"
                          onClick={() => setWithdrawMode("manual")}
                          className="text-primary font-bold hover:underline cursor-pointer"
                        >
                          Tự nhập ngay
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setIsBankDropdownOpen(!isBankDropdownOpen)
                          }
                          className="w-full bg-surface border border-outline-variant text-on-surface text-[14px] py-3 px-4 rounded-xl cursor-pointer flex items-center justify-between hover:border-primary/50 transition-all"
                        >
                          <div className="text-left">
                            {selectedBank ? (
                              <>
                                <span className="font-bold block">
                                  {selectedBank.ten_ngan_hang}
                                </span>
                                <span className="text-xs text-on-surface-variant">
                                  {selectedBank.so_tai_khoan} ·{" "}
                                  {selectedBank.chu_tai_khoan}
                                </span>
                              </>
                            ) : (
                              <span className="font-semibold">
                                Chọn ngân hàng...
                              </span>
                            )}
                          </div>
                          <span
                            className={`material-symbols-outlined text-on-surface-variant text-[22px] transition-transform duration-200 shrink-0 ${
                              isBankDropdownOpen
                                ? "rotate-180 text-primary"
                                : ""
                            }`}
                          >
                            expand_more
                          </span>
                        </button>
                        {isBankDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-outline-variant/30 overflow-hidden z-30 py-1">
                            {savedBanks.map((bank) => (
                              <button
                                key={bank.id}
                                type="button"
                                onClick={() => {
                                  setSelectedBankId(String(bank.id));
                                  setIsBankDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 transition-colors hover:bg-primary/5 cursor-pointer ${
                                  String(bank.id) === selectedBankId
                                    ? "bg-primary/10"
                                    : ""
                                }`}
                              >
                                <span
                                  className={`font-bold block text-sm ${String(bank.id) === selectedBankId ? "text-primary" : "text-on-surface"}`}
                                >
                                  {bank.ten_ngan_hang}
                                </span>
                                <span className="text-xs text-on-surface-variant">
                                  {bank.so_tai_khoan} · {bank.chu_tai_khoan}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Mode: Tự nhập */}
                {withdrawMode === "manual" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-black uppercase text-on-surface-variant mb-1.5 tracking-wider">
                        Tên ngân hàng
                      </label>
                      <BankDropdown
                        value={manualBank.ten_ngan_hang}
                        onChange={(val) =>
                          setManualBank({ ...manualBank, ten_ngan_hang: val })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-black uppercase text-on-surface-variant mb-1.5 tracking-wider">
                          Số tài khoản
                        </label>
                        <input
                          type="text"
                          placeholder="1903..."
                          value={manualBank.so_tai_khoan}
                          onChange={(e) =>
                            setManualBank({
                              ...manualBank,
                              so_tai_khoan: e.target.value.replace(/\D/g, ""),
                            })
                          }
                          className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm font-bold focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase text-on-surface-variant mb-1.5 tracking-wider">
                          Tên chủ thẻ
                        </label>
                        <input
                          type="text"
                          placeholder="NGUYEN VAN A"
                          value={manualBank.chu_tai_khoan}
                          onChange={(e) =>
                            setManualBank({
                              ...manualBank,
                              chu_tai_khoan: e.target.value.toUpperCase(),
                            })
                          }
                          className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm uppercase font-black tracking-wide focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Số tiền rút */}
                <div>
                  <label className="block text-xs font-black uppercase text-on-surface-variant mb-1.5 tracking-wider">
                    Số tiền muốn rút từ ví
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Tối thiểu 50,000"
                      required
                      value={withdrawAmountStr}
                      onChange={(e) =>
                        setWithdrawAmountStr(
                          formatNumberWithCommas(e.target.value),
                        )
                      }
                      className="w-full pl-4 pr-12 py-3 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-base font-black text-error"
                    />
                    <span className="absolute right-4 text-sm font-bold text-on-surface-variant">
                      đ
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant mt-1.5 block font-medium">
                    Số dư hiện tại:{" "}
                    <span className="font-bold text-on-surface">
                      {fmt(balance)}
                    </span>
                  </span>
                </div>

                {/* Tính tiền tự động */}
                {rawWithdrawAmount > 0 && (
                  <div className="p-4 bg-surface rounded-xl border border-outline-variant/30 space-y-2 text-xs font-semibold">
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Số tiền yêu cầu rút:</span>
                      <span className="font-bold text-on-surface">
                        {fmt(rawWithdrawAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-error">
                      <span>Phí sàn khấu trừ (20%):</span>
                      <span className="font-bold">-{fmt(withdrawFee)}</span>
                    </div>
                    <div className="h-px bg-outline-variant/20 my-1" />
                    <div className="flex justify-between text-sm text-secondary font-black">
                      <span>Thực nhận về ngân hàng:</span>
                      <span>{fmt(actualReceive <= 0 ? 0 : actualReceive)}</span>
                    </div>
                  </div>
                )}

                {/* Error */}
                {withdrawError && (
                  <p className="text-error text-sm bg-error/10 border border-error/20 rounded-xl px-4 py-2">
                    {withdrawError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={
                    withdrawLoading ||
                    rawWithdrawAmount > balance ||
                    rawWithdrawAmount < 50000 ||
                    (withdrawMode === "saved" &&
                      !selectedBankId &&
                      savedBanks.length > 0)
                  }
                  className="w-full py-3.5 bg-error text-white font-bold rounded-xl shadow-lg shadow-error/20 hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                  {withdrawLoading
                    ? "Đang xử lý..."
                    : rawWithdrawAmount > balance
                      ? "Số dư không đủ"
                      : "Tạo lệnh rút tiền"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
