import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import nhanVienApi from '../../../api/nhanVienApi';

const FeaturedStaff = () => {
  // ── State quản lý dữ liệu ─────────────────────────────────────
  const [topStaffs, setTopStaffs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Gọi API khi component vừa render ──────────────────────────
  useEffect(() => {
    const fetchEliteStaffs = async () => {
      try {
        setLoading(true);
        const data = await nhanVienApi.getFeaturedStaff();

        // CHỈ LẤY 4 NGƯỜI ĐẦU TIÊN TỪ MẢNG TRẢ VỀ
        setTopStaffs(data.slice(0, 4));
      } catch (error) {
        console.error("Lỗi khi lấy danh sách nhân viên nổi bật:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEliteStaffs();
  }, []);

  // Nếu đang tải dữ liệu thì có thể hiển thị Skeleton hoặc Spinner
  if (loading) {
    return (
      <div className="py-24 text-center">
        Đang tải danh sách nhân viên ưu tú...
      </div>
    );
  }

  // ── RENDER Y NHƯ CŨ (Chỉ thay đổi topStaffs) ──────────────────
  return (
    <section className="py-24 bg-surface-container-lowest">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        {/* ... (Phần Header chứa Tiêu đề và nút Xem tất cả giữ nguyên) ... */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="font-h2 text-h2 text-on-surface mb-4">
              Các nhân viên nổi bật
            </h2>
            <p className="text-body-lg text-on-surface-variant max-w-2xl">
              Những người giúp việc được đánh giá cao nhất — chuyên dọn dẹp nhà
              cửa hằng ngày, tỉ mỉ và đáng tin cậy.
            </p>
          </div>
          <Link
            to="/staff"
            className="flex items-center gap-2 text-primary font-bold hover:bg-primary/10 px-5 py-3 rounded-xl transition-colors shrink-0"
          >
            Xem tất cả
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>

        {/* ... (Phần Grid Render danh sách nhân viên) ... */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topStaffs.map((staff) => (
            <div
              key={staff.id}
              className="group bg-surface rounded-3xl p-6 border border-outline-variant/30 hover:border-primary/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Ảnh và Rating */}
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

              {/* Tên và Kinh nghiệm */}
              <h3 className="font-h4 text-h4 text-on-surface mb-1 group-hover:text-primary transition-colors">
                {staff.name}
              </h3>
              <p className="text-sm text-on-surface-variant mb-4">
                {staff.experience} kinh nghiệm
              </p>

              {/* Thông số chi tiết */}
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

              {/* Nút Xem chi tiết */}
              <Link
                to={`/staff/${staff.id}`}
                className="block w-full text-center py-3 rounded-xl bg-primary/10 text-primary font-bold group-hover:bg-primary group-hover:text-on-primary transition-colors"
              >
                Xem chi tiết
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedStaff;
