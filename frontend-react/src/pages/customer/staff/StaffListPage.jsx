import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import nhanVienApi from "../../../api/nhanVienApi"; // Đổi import sang nhanVienApi

const StaffListPage = () => {
  // ── State quản lý dữ liệu ─────────────────────────────────────
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Gọi API khi trang vừa load ────────────────────────────────
  useEffect(() => {
    const fetchStaffs = async () => {
      try {
        setLoading(true);
        
        // Gọi thông qua file API tập trung (không gọi axiosClient trực tiếp nữa)
        const data = await nhanVienApi.getFeaturedStaff();

        // LƯU TOÀN BỘ MẢNG ĐỂ HIỂN THỊ FULL
        setStaffs(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách nhân viên nổi bật:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffs();
  }, []);

  // ── Hiển thị lúc đang chờ dữ liệu ─────────────────────────────
  if (loading) {
    return (
      <main className="pt-32 pb-section-padding flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          {/* Biểu tượng loading xoay tròn */}
          <svg
            className="animate-spin h-8 w-8 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
          <p className="text-body-lg text-on-surface-variant">
            Đang tải danh sách nhân viên xuất sắc...
          </p>
        </div>
      </main>
    );
  }

  // ── RENDER GIAO DIỆN CHÍNH ────────────────────────────────────
  return (
    <main className="pt-32 pb-section-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="font-h1 text-h1 text-primary mb-4">Nhân viên Nổi bật</h1>
        <p className="text-body-lg text-on-surface-variant">
          Gặp gỡ đội ngũ nhân viên xuất sắc nhất của CleanTrust. Họ là những
          chuyên gia được khách hàng đánh giá cao nhất về thái độ và chất lượng
          phục vụ.
        </p>
      </div>

      {/* Rào lỗi nếu lỡ Backend không trả về ai */}
      {staffs.length === 0 ? (
        <div className="text-center py-10 bg-surface-container-lowest rounded-3xl border border-outline-variant/30">
          <p className="text-on-surface-variant text-body-lg">
            Hiện chưa có nhân viên nào đạt đủ điều kiện nổi bật.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {staffs.map((staff) => (
            <div
              key={staff.id}
              className="group bg-surface rounded-3xl p-6 border border-outline-variant/30 hover:border-primary/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <img
                  src={staff.avatar}
                  alt={staff.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-surface-container-lowest shadow-sm"
                />
                <div className="flex items-center gap-1 bg-tertiary-container/30 text-tertiary px-3 py-1 rounded-full">
                  <span
                    className="material-symbols-outlined text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span className="font-bold text-sm">{staff.rating}</span>
                </div>
              </div>

              <h3 className="font-h4 text-h4 text-on-surface mb-1 group-hover:text-primary transition-colors">
                {staff.name}
              </h3>
              {/* Lưu ý: Nếu ở Backend bạn đã trả về cứng chữ "Chuyên gia" thì đoạn này sẽ hiện "Chuyên gia kinh nghiệm" */}
              <p className="text-sm text-on-surface-variant mb-4">
                {staff.experience} kinh nghiệm
              </p>

              <div className="flex flex-col gap-2 mb-6 flex-1">
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-base">
                    task_alt
                  </span>
                  <span>
                    <strong className="text-on-surface">
                      {staff.completedJobs.toLocaleString("vi-VN")}
                    </strong>{" "}
                    công việc
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-base">
                    reviews
                  </span>
                  <span>
                    <strong className="text-on-surface">{staff.reviews}</strong>{" "}
                    đánh giá
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-base">
                    work_history
                  </span>
                  <span>
                    <strong className="text-on-surface">
                      {staff.experience}
                    </strong>
                  </span>
                </div>
              </div>

              <Link
                to={`/staff/${staff.id}`}
                className="block w-full text-center py-3 rounded-xl bg-primary/10 text-primary font-bold group-hover:bg-primary group-hover:text-on-primary transition-colors mt-auto"
              >
                Xem chi tiết
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default StaffListPage;