import React, { useCallback, useEffect, useState } from "react";
import VoucherCard from "../../../components/customer/VoucherCard";
import { Link } from "react-router-dom";
import khachHangApi from "../../../api/khachHangApi";

// ─── Skeleton cho 1 card khi đang tải ───────────────────────────────────────
const CardSkeleton = () => (
  <div className="rounded-2xl border border-outline-variant/30 p-5 flex gap-4 animate-pulse">
    <div className="w-24 h-24 rounded-xl bg-surface-container-high shrink-0" />
    <div className="flex-1 space-y-3 py-1">
      <div className="h-3 bg-surface-container-high rounded-full w-1/3" />
      <div className="h-4 bg-surface-container-high rounded-full w-2/3" />
      <div className="h-3 bg-surface-container-high rounded-full w-full" />
      <div className="h-3 bg-surface-container-high rounded-full w-1/4" />
    </div>
  </div>
);

const MyVouchersPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await khachHangApi.getMyVouchers();
      if (res.success) {
        setVouchers(res.data);
      } else {
        setError(res.message ?? "Không thể tải mã giảm giá.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ??
          "Không thể tải mã giảm giá. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="font-h3 text-h3 font-bold text-on-surface">
          Mã giảm giá của tôi
        </h1>
        <p className="text-body-md text-on-surface-variant mt-2">
          Quản lý các mã giảm giá bạn đã lưu từ trang Khuyến mãi. Các mã này sẽ
          được tự động gợi ý khi bạn đặt lịch.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-container-low rounded-2xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-[56px] text-error mb-4 opacity-70">
            error
          </span>
          <h3 className="font-bold text-lg text-on-surface mb-2">
            Đã có lỗi xảy ra
          </h3>
          <p className="text-on-surface-variant text-sm mb-6 max-w-md leading-relaxed">
            {error}
          </p>
          <button
            onClick={fetchVouchers}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition-all shadow-sm"
          >
            Thử lại
          </button>
        </div>
      ) : vouchers.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {[...vouchers]
            .sort((a, b) => {
              const weight = (v) => (v.status === "saved" ? 0 : 1);
              return weight(a) - weight(b);
            })
            .map((voucher) => (
              <VoucherCard
                key={voucher.id}
                voucher={voucher}
                onSave={() => {}}
              />
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-container-low rounded-2xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-[72px] text-outline-variant mb-4 opacity-50">
            local_offer
          </span>
          <h3 className="font-bold text-lg text-on-surface mb-2">
            Chưa có mã giảm giá nào
          </h3>
          <p className="text-on-surface-variant text-sm mb-6 max-w-md leading-relaxed">
            Bạn chưa lưu mã giảm giá nào. Hãy đến trang Khuyến mãi để săn những
            ưu đãi hấp dẫn giúp tiết kiệm chi phí dọn dẹp nhé!
          </p>
          <Link
            to="/promotions"
            className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition-all shadow-sm"
          >
            Đến trang Khuyến mãi
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyVouchersPage;
