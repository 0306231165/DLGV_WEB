import React from 'react';

const ServicesSection = () => {
  return (
    <section className="py-section-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-h2 text-h2 text-on-background mb-4">Dịch Vụ Của Chúng Tôi</h2>
        <p className="font-body-md text-body-md text-secondary">Giải pháp làm sạch toàn diện cho mọi nhu cầu.</p>
      </div>
      
      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        
        {/* Service 1 */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-8 flex flex-col justify-between hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
          <div>
            <span className="material-symbols-outlined text-primary text-4xl mb-4 transition-transform duration-300 group-hover:scale-110" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
            <h3 className="font-h3 text-h3 text-on-background mb-2">Vệ sinh nhà cửa định kỳ</h3>
            <p className="font-body-md text-body-md text-secondary mb-4">
              Duy trì không gian sống sạch sẽ mỗi ngày. Phù hợp cho các gia đình bận rộn cần sự chăm sóc thường xuyên.
            </p>
          </div>
          <div className="mt-4">
            <span className="inline-block bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full font-label-sm text-label-sm font-semibold shadow-sm">
              Phổ biến nhất
            </span>
          </div>
        </div>

        {/* Service 2 */}
        <div className="col-span-1 bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-8 flex flex-col justify-between hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
          <div>
            <span className="material-symbols-outlined text-primary text-4xl mb-4 transition-transform duration-300 group-hover:scale-110" style={{ fontVariationSettings: "'FILL' 1" }}>cleaning_services</span>
            <h3 className="font-h3 text-h3 text-on-background mb-2">Tổng vệ sinh sâu</h3>
            <p className="font-body-md text-body-md text-secondary">Làm sạch kỹ lưỡng mọi ngóc ngách, loại bỏ bụi bẩn lâu ngày.</p>
          </div>
        </div>

        {/* Service 3 */}
        <div className="col-span-1 bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-8 flex flex-col justify-between hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
          <div>
            <span className="material-symbols-outlined text-primary text-4xl mb-4 transition-transform duration-300 group-hover:scale-110" style={{ fontVariationSettings: "'FILL' 1" }}>business</span>
            <h3 className="font-h3 text-h3 text-on-background mb-2">Vệ sinh văn phòng</h3>
            <p className="font-body-md text-body-md text-secondary">Môi trường làm việc chuyên nghiệp, sạch sẽ giúp tăng năng suất.</p>
          </div>
        </div>

        {/* Service 4 */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-8 flex flex-col justify-between hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
          <div>
            <span className="material-symbols-outlined text-primary text-4xl mb-4 transition-transform duration-300 group-hover:scale-110" style={{ fontVariationSettings: "'FILL' 1" }}>moving</span>
            <h3 className="font-h3 text-h3 text-on-background mb-2">Chuyển nhà / Chuyển đến</h3>
            <p className="font-body-md text-body-md text-secondary mb-4">Chuẩn bị không gian hoàn hảo trước khi dọn vào hoặc dọn dẹp sạch sẽ sau khi chuyển đi.</p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ServicesSection;