import React from 'react';
import './../../assets/styles/customer/MyBookingsPage.css';

const MyBookingsPage = () => {
  return (
    <>
      <main className="pt-32 pb-section-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="font-h1 text-h1 text-on-surface mb-2">Quản lý lịch hẹn</h1>
          <p className="text-on-surface-variant font-body-lg">Xem và điều chỉnh các yêu cầu dọn dẹp của bạn.</p>
        </div>

        {/* Tab System */}
        <div className="flex items-center gap-2 p-1.5 bg-surface-container-low w-fit rounded-2xl mb-8 border border-outline-variant/20 shadow-sm">
          <button className="px-8 py-2.5 rounded-xl bg-primary text-on-primary font-label-sm shadow-md shadow-primary/20 transition-all active:scale-95">
            Đơn sắp tới
          </button>
          <button className="px-8 py-2.5 rounded-xl text-on-surface-variant hover:text-primary hover:bg-white/50 font-label-sm transition-all duration-300">
            Lịch sử
          </button>
        </div>

        {/* Booking Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          
          {/* Active Booking Card 1 - ĐÃ ĐỔI MÀU NỀN */}
          <div className="glass-card bg-surface-container-item p-6 rounded-3xl flex flex-col md:flex-row gap-6 hover:shadow-xl hover:shadow-primary/5 transition-all group border-l-4 border-l-primary">
            <div className="w-full md:w-48 h-36 rounded-2xl overflow-hidden shrink-0 relative">
              <img 
                alt="Service" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6zDQdO-yTydefcZ27JgT_qA-WQJCte_X8TRJ0Moa5HOSWyGeuuIKQfBkr1wNeRzkI7YDtXak7EJWOaXfdesukeLWk32ULYmPSfW68tGDa_Aywe7jhF37T0Ys-Vq2hmC8bSaFlMYk_WRRhwtidEOEBq6AlSTp1N31zADzOCFQ_yOSCnCBq0ruOUfUsOJk5IvyH_CumPuf_EJbc-Dq9FUdj_YWeMmmtKb2mZkYfGx7jh7RDXlZ1m2uXDve9Lj_nV4EtvMaoi4WMkGRW" 
              />
              <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[12px] font-bold text-primary shadow-sm">
                ĐÃ XÁC NHẬN
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-h3 text-xl text-on-surface leading-tight">Vệ sinh nhà cửa định kỳ</h3>
                  <span className="text-primary font-bold text-lg">300.000đ</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-on-surface-variant text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">calendar_today</span>
                    <span>Thứ Tư, 24 Tháng 5, 2024</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
                    <span>08:00 - 11:00 (3 giờ)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                    <span>Nhân viên: <span className="font-semibold text-on-surface">Nguyễn Thu Hà</span></span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 py-2.5 bg-secondary-container text-on-secondary-fixed-variant rounded-xl font-label-sm hover:bg-secondary-fixed transition-colors active:scale-[0.98]">
                  Đổi lịch
                </button>
                <button className="flex-1 py-2.5 border border-error/20 text-error rounded-xl font-label-sm hover:bg-error/5 transition-colors active:scale-[0.98]">
                  Hủy đơn
                </button>
              </div>
            </div>
          </div>

          {/* Active Booking Card 2 - ĐÃ ĐỔI MÀU NỀN */}
          <div className="glass-card bg-surface-container-item p-6 rounded-3xl flex flex-col md:flex-row gap-6 hover:shadow-xl hover:shadow-primary/5 transition-all group border-l-4 border-l-surface-tint">
            <div className="w-full md:w-48 h-36 rounded-2xl overflow-hidden shrink-0 relative">
              <img 
                alt="Deep Cleaning" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkUgY0Cct8l6sD4Tgl5HXQz-vZxRhqLKDqCCgN9dq5piRPrSWu9NuHR11w0aR6aQ9TVcnPAo1zFz-RwE_pVuLtg9_zL2TcZEGwNora1fs7TZqRVoLxKQ3JYo7RYbekmjXJR3XL7YDaqvRjRea_QwGeibQkoAQr9hvgKl3jnLPpqn9xvWv1Y9HNVaJz4etJt_0O_qNoh5Zfom47aczuBnuV0NRMjtDJlcLic-aS_Ar8FJsbfzv58kIiU1z62OdxtF1canh8uLJI32g2" 
              />
              <div className="absolute top-3 left-3 px-3 py-1 bg-surface-tint text-white rounded-full text-[12px] font-bold shadow-sm">
                ĐANG THỰC HIỆN
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-h3 text-xl text-on-surface leading-tight">Tổng vệ sinh chuyên sâu</h3>
                  <span className="text-primary font-bold text-lg">1.250.000đ</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-on-surface-variant text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">calendar_today</span>
                    <span>Hôm nay, 22 Tháng 5</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
                    <span>13:30 - 17:30 (4 giờ)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">engineering</span>
                    <span>Đội: <span className="font-semibold text-on-surface">CleanTrust Team 04</span></span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 py-2.5 bg-primary text-on-primary rounded-xl font-label-sm hover:bg-primary-container transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  Theo dõi
                </button>
              </div>
            </div>
          </div>

          {/* Active Booking Card 3 (Pending) - ĐÃ ĐỔI MÀU NỀN */}
          <div className="glass-card bg-surface-container-item p-6 rounded-3xl flex flex-col md:flex-row gap-6 hover:shadow-xl hover:shadow-primary/5 transition-all group border-l-4 border-l-outline-variant">
            <div className="w-full md:w-48 h-36 rounded-2xl overflow-hidden shrink-0 relative">
              <img 
                alt="Office Cleaning" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYdUXqGUgXvPTys2Iyj-3dZxQQVKQlSUr6h4jJwmIQ4NRiAuQAvYmMnvimOaFmLxxi7rVO3ztJO5Y4COtGotubk1IOtPHbo78nGYkuEJL6pwjUeZgLnaMpZnShIyfUW6a7_NL86iG6iSUsLh2-lf5sMvISFOvZnOenlHiUE43IZvTHKRf1PUytD0ODGghfPpaNnF7y_j2VQTuAvObuPOtxJfSQqiOSPPBJfDRgQhUOth4_rsR_VkNe4OJ6dTZtisLElJ6Kjx8ufje_" 
              />
              <div className="absolute top-3 left-3 px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-[12px] font-bold shadow-sm">
                CHỜ XÁC NHẬN
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-h3 text-xl text-on-surface leading-tight">Vệ sinh văn phòng</h3>
                  <span className="text-primary font-bold text-lg">550.000đ</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-on-surface-variant text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">calendar_today</span>
                    <span>Thứ Hai, 29 Tháng 5</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
                    <span>09:00 - 12:00 (3 giờ)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">person_search</span>
                    <span className="italic">Đang điều phối nhân viên...</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 py-2.5 bg-secondary-container text-on-secondary-fixed-variant rounded-xl font-label-sm hover:bg-secondary-fixed transition-colors active:scale-[0.98]">
                  Chi tiết
                </button>
                <button className="flex-1 py-2.5 border border-error/20 text-error rounded-xl font-label-sm hover:bg-error/5 transition-colors active:scale-[0.98]">
                  Hủy đơn
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Empty State (Hidden by default based on your HTML, you can toggle it later) */}
        <div className="hidden flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-6 border border-outline-variant/30">
            <span className="material-symbols-outlined text-5xl text-outline">event_busy</span>
          </div>
          <h2 className="font-h2 text-h2 text-on-surface mb-2">Chưa có lịch hẹn nào</h2>
          <p className="text-on-surface-variant max-w-md mx-auto mb-8 font-body-md">Bạn chưa đặt dịch vụ dọn dẹp nào. Hãy đặt lịch ngay để tận hưởng không gian sạch sẽ!</p>
          <button className="px-10 py-4 bg-primary text-on-primary rounded-2xl font-h3 shadow-lg shadow-primary/30 hover:-translate-y-1 transition-all active:translate-y-0">
            Đặt lịch ngay
          </button>
        </div>
      </main>

      {/* FAB cho việc Đặt lịch nhanh */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group">
        <span className="material-symbols-outlined text-3xl">add</span>
        <span className="absolute right-full mr-4 px-4 py-2 bg-on-surface text-white rounded-xl text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">Đặt lịch mới</span>
      </button>
    </>
  );
};

export default MyBookingsPage;