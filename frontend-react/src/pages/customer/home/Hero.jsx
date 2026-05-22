import React from 'react';

const Hero = () => {
  return (
    <section className="relative w-full min-h-[600px] flex items-center justify-center pt-section-padding pb-section-padding px-margin-mobile md:px-margin-desktop bg-surface-container overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          alt="Không gian phòng khách sạch sẽ" 
          className="w-full h-full object-cover opacity-20" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVHQtj_UZaHAZsJYyDxA_Ues6htzIYDUyCrLsUpqIgMaQcM9Ub1sInJcDCj5Md07arKl9w9fPqgJ2MQEL1oyU0pTS6QmJjSsohIkN2pkFJ8-zRSiu6a1PlADg0ETwYlyMDAKgLMc9nOfBhEBOuRIHtCNSvQxQMwbB-smGKhHC85E82ts1mBcQSVSpVGjJKv67je7DrImQHnUD5OAkYl2HY0bh7cK1n4h8B1UkcqCTaLdq6ERHyk5uym3cVuosbIGPw6wm0b56u23xP" 
        />
      </div>
      <div className="relative z-10 max-w-container-max mx-auto text-center">
        <h1 className="font-h1 text-h1 text-on-primary-fixed mb-6">Sự Tinh Khiết Cho Ngôi Nhà Của Bạn</h1>
        <p className="font-body-lg text-body-lg text-secondary max-w-2xl mx-auto mb-8">
          Trải nghiệm dịch vụ vệ sinh chuyên nghiệp, mang đến không gian sống thoáng đãng, sạch sẽ và an toàn. Đội ngũ tận tâm, uy tín hàng đầu.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="bg-primary text-on-primary px-8 py-4 rounded-xl font-h3 text-[20px] hover:bg-primary-container transition-all shadow-md shadow-primary/20 w-full sm:w-auto">
            Đặt lịch ngay
          </button>
          <button className="bg-surface text-primary border border-primary/20 px-8 py-4 rounded-xl font-h3 text-[20px] hover:bg-surface-container transition-all w-full sm:w-auto">
            Tìm hiểu thêm
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;