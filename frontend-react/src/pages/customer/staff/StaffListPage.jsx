import React from 'react';
import { Link } from 'react-router-dom';
import { ELITE_STAFFS } from '../../../data/mockStaffs';

const StaffListPage = () => {
  return (
    <main className="pt-32 pb-section-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="font-h1 text-h1 text-primary mb-4">Nhân viên Nổi bật</h1>
        <p className="text-body-lg text-on-surface-variant">
          Gặp gỡ đội ngũ nhân viên xuất sắc nhất của CleanTrust. Họ là những chuyên gia được khách hàng đánh giá cao nhất về thái độ và chất lượng phục vụ.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {ELITE_STAFFS.map((staff) => (
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
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="font-bold text-sm">{staff.rating}</span>
              </div>
            </div>

            <h3 className="font-h4 text-h4 text-on-surface mb-1 group-hover:text-primary transition-colors">
              {staff.name}
            </h3>
            <p className="text-sm text-on-surface-variant mb-4">{staff.experience} kinh nghiệm</p>

            <div className="flex flex-col gap-2 mb-6 flex-1">
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-base">task_alt</span>
                <span><strong className="text-on-surface">{staff.completedJobs.toLocaleString('vi-VN')}</strong> công việc</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-base">reviews</span>
                <span><strong className="text-on-surface">{staff.reviews}</strong> đánh giá</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-base">work_history</span>
                <span><strong className="text-on-surface">{staff.experience}</strong> kinh nghiệm</span>
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
    </main>
  );
};

export default StaffListPage;
