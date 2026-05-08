import React from 'react';

const WhyChooseUs = () => {
  return (
    <section className="py-section-padding px-margin-mobile md:px-margin-desktop bg-surface-container-low">
      <div className="max-w-container-max mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-h2 text-h2 text-on-background mb-4">Tại Sao Chọn CleanTrust?</h2>
          <p className="font-body-md text-body-md text-secondary">Sự tin cậy và chuyên nghiệp là kim chỉ nam của chúng tôi.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-surface rounded-full flex items-center justify-center shadow-sm border border-outline-variant/30 mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
            </div>
            <h4 className="font-h3 text-[20px] text-on-background mb-2">Đội ngũ kiểm định</h4>
            <p className="font-body-md text-[14px] text-secondary">Nhân viên được đào tạo bài bản và kiểm tra lý lịch rõ ràng.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-surface rounded-full flex items-center justify-center shadow-sm border border-outline-variant/30 mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">eco</span>
            </div>
            <h4 className="font-h3 text-[20px] text-on-background mb-2">Hóa chất an toàn</h4>
            <p className="font-body-md text-[14px] text-secondary">Sử dụng sản phẩm thân thiện với môi trường, an toàn cho trẻ em và thú cưng.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-surface rounded-full flex items-center justify-center shadow-sm border border-outline-variant/30 mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">schedule</span>
            </div>
            <h4 className="font-h3 text-[20px] text-on-background mb-2">Linh hoạt thời gian</h4>
            <p className="font-body-md text-[14px] text-secondary">Đặt lịch dễ dàng, phục vụ đúng giờ theo yêu cầu của bạn.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-surface rounded-full flex items-center justify-center shadow-sm border border-outline-variant/30 mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">thumb_up</span>
            </div>
            <h4 className="font-h3 text-[20px] text-on-background mb-2">Bảo hành dịch vụ</h4>
            <p className="font-body-md text-[14px] text-secondary">Làm lại miễn phí nếu bạn không hài lòng với chất lượng.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;