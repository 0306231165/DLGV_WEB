import React, { useState, useRef, useEffect } from "react";
import VoucherCard from "../../../components/customer/VoucherCard";
import publicApi from "../../../api/publicApi";
import khachHangApi from "../../../api/khachHangApi";

const VoucherPage = () => {
  const [filter, setFilter] = useState("all");
  const [filterOptions, setFilterOptions] = useState([
    { value: "all", label: "Tất cả" },
  ]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  // 1. Fetch dữ liệu từ API
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        const res = await publicApi.getVouchers();
        if (res.success) {
          // Map dữ liệu Nhóm dịch vụ vào Dropdown
          const groups = res.service_groups.map((g) => ({
            value: g.value,
            label: g.label,
          }));
          setFilterOptions([{ value: "all", label: "Tất cả" }, ...groups]);

          const now = new Date(); // Lấy thời gian hiện tại để so sánh hạn

          // Map dữ liệu Vouchers
          const formattedVouchers = res.vouchers.map((v) => {
            const isPercent = v.loai_giam_gia === "PhanTram";
            const val = Number(v.gia_tri_giam);
            const discountValue = isPercent ? `${val}%` : `${val / 1000}k`;

            const dateObj = new Date(v.ngay_ket_thuc);
            const expiryStr = `${dateObj.getDate().toString().padStart(2, "0")}/${(dateObj.getMonth() + 1).toString().padStart(2, "0")}/${dateObj.getFullYear()}`;

            const colors = [
              "bg-[#1a368d]", "bg-[#6b2c15]", "bg-[#5c6c75]",
              "bg-[#059669]", "bg-[#d97706]",
            ];
            const colorClass = colors[v.id % colors.length];

            // KIỂM TRA HẾT HẠN VÀ ĐÃ LƯU Ở ĐÂY
            const isExpired = dateObj < now;
            // res.saved_vouchers được Backend trả về ở trên (mảng rỗng [] nếu chưa đăng nhập)
            const isSaved = res.saved_vouchers ? res.saved_vouchers.includes(v.id) : false;

            // Ưu tiên: Nếu hết hạn -> 'expired', Nếu đã lưu -> 'saved', Còn lại -> 'active'
            let status = "active";
            if (isExpired) status = "expired";
            else if (isSaved) status = "saved";

            return {
              id: v.id,
              nhomDichVuId: v.nhom_dich_vu_id_mapped,
              type: v.tag_hien_thi || "Toàn sàn",
              colorClass: colorClass,
              discountValue: discountValue,
              discountType: "GIẢM",
              badge: v.ma_code,
              title: v.tieu_de,
              description: v.mo_ta,
              expiry: expiryStr,
              status: status, // CẬP NHẬT TRẠNG THÁI VÀO ĐÂY
            };
          });

          setVouchers(formattedVouchers);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách khuyến mãi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  // 2. Xử lý đóng Dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Xử lý lưu voucher (Frontend state + Gọi API)
  const handleSave = async (id) => {
    try {
      // Gọi API lên Backend
      const res = await khachHangApi.saveVoucher({ khuyen_mai_id: id });

      if (res.success) {
        // Nếu lưu DB thành công, cập nhật giao diện thành 'saved'
        setVouchers(
          vouchers.map((v) => (v.id === id ? { ...v, status: "saved" } : v)),
        );
        alert("Lưu mã thành công!"); // Có thể thay bằng thư viện Toast cho đẹp
      }
    } catch (error) {
      // Nếu lỗi 401 (chưa đăng nhập), axiosClient đã tự đẩy sang trang Login rồi.
      // Bạn chỉ cần hiển thị lỗi cho các trường hợp khác (ví dụ: đã lưu rồi, mã hết hạn...)
      if (error.response?.status !== 401) {
        alert(error.message || "Có lỗi xảy ra khi lưu mã.");
      }
    }
  };

  // 4. Lọc voucher
  const filteredVouchers = vouchers.filter((v) => {
    if (filter === "all") return true;

    // CHỖ SỬA SỐ 2: Khi người dùng chọn 1 nhóm, ta hiển thị voucher của nhóm đó
    // VÀ hiển thị luôn cả những voucher Toàn sàn (nhomDichVuId === null)
    return v.nhomDichVuId === filter || v.nhomDichVuId === null;
  });

  return (
    <div className="w-full bg-[#f4f7fb] dark:bg-surface-container-lowest min-h-screen pt-24 pb-20 font-sans">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-8 space-y-16">
        {/* Hero Section */}
        <div className="relative w-full h-[360px] md:h-[420px] rounded-3xl overflow-hidden bg-[#e6eeff] shadow-sm">
          <div className="absolute inset-0 right-0 w-full h-full flex justify-end">
            <div className="w-1/2 h-full relative">
              <img
                src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2000&auto=format&fit=crop"
                alt="Dọn dẹp vệ sinh"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#e6eeff] to-transparent"></div>
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-[#e6eeff] via-[#e6eeff] to-transparent w-full md:w-2/3"></div>

          <div className="relative h-full flex flex-col justify-center px-10 md:px-14 w-full md:w-[60%] z-10">
            <span className="inline-block bg-[#8c3a21] text-white text-[10px] font-bold px-3 py-1 rounded-full w-max mb-5 tracking-wide">
              ƯU ĐÃI NỔI BẬT
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-[#1c2b4d] mb-5 leading-[1.1]">
              Không Gian Sạch Bóng
              <br />
              Ngập Tràn Ưu Đãi
            </h1>
            <p className="text-[15px] md:text-base text-[#4a5568] mb-8 max-w-sm leading-relaxed font-medium">
              Tận hưởng không gian sống tinh khiết và trong lành với các gói dọn
              dẹp chuyên nghiệp. Áp dụng mã ngay hôm nay.
            </p>
            <button className="bg-[#1a368d] text-white px-7 py-3 rounded-full font-bold text-[13px] w-max hover:bg-[#1a368d]/90 transition-all flex items-center gap-2 shadow-md">
              Khám phá ngay
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </button>
          </div>
        </div>

        {/* Voucher Section */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <h2 className="text-3xl font-black text-primary">
                Khám Phá Ưu Đãi Hấp Dẫn
              </h2>
              <p className="text-[14px] text-[#6b7280] mt-2 font-medium">
                Lưu mã để áp dụng tự động khi đặt lịch dịch vụ.
              </p>
            </div>

            <div className="relative pt-2 min-w-[240px]" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-white border border-outline-variant/30 text-[#4b5563] text-[14px] font-semibold py-2.5 px-5 rounded-full shadow-sm cursor-pointer flex items-center justify-between hover:border-[#1a368d]/50 transition-colors"
              >
                {filterOptions.find((opt) => opt.value === filter)?.label ||
                  "Tất cả"}
                <span
                  className={`material-symbols-outlined text-on-surface-variant text-[20px] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                >
                  expand_more
                </span>
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-outline-variant/20 overflow-hidden z-20 py-1">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setFilter(opt.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-5 py-2.5 text-[14px] transition-colors hover:bg-surface-variant/30 ${filter === opt.value ? "font-bold text-[#1a368d] bg-[#eaf0fb]" : "font-medium text-[#4b5563]"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Render danh sách */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a368d]"></div>
            </div>
          ) : filteredVouchers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {filteredVouchers.map((voucher) => (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  onSave={handleSave}
                  context="public"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-[#6b7280] bg-white rounded-2xl border border-dashed border-gray-300">
              <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">
                loyalty
              </span>
              <p>Hiện chưa có mã khuyến mãi nào cho nhóm dịch vụ này.</p>
            </div>
          )}

          {!loading && filteredVouchers.length > 0 && (
            <div className="flex justify-center mt-10 pt-4">
              <button className="flex items-center gap-2 px-6 py-2.5 border border-[#d1d5db] bg-white rounded-full text-[14px] font-semibold text-[#4b5563] hover:bg-surface-variant/50 transition-colors shadow-sm">
                Xem thêm mã
                <span className="material-symbols-outlined text-[20px]">
                  expand_more
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoucherPage;
