import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PACKAGES, PACKAGE_GROUPS } from '../BookingPage';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const pkg = PACKAGES.find(p => p.id === id);

  if (!pkg) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center pt-20">
        <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
        <h2 className="text-2xl font-bold text-on-surface mb-2">Không tìm thấy dịch vụ</h2>
        <p className="text-on-surface-variant mb-6">Dịch vụ bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ.</p>
        <button 
          onClick={() => navigate('/services')}
          className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-container"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const group = PACKAGE_GROUPS.find(g => g.groupId === pkg.groupId);
  const fmt = n => n.toLocaleString('vi-VN') + 'đ';

  return (
    <div className="bg-surface min-h-screen pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="text-sm font-medium text-on-surface-variant mb-8 flex items-center gap-2">
          <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Trang chủ</button>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <button onClick={() => navigate('/services')} className="hover:text-primary transition-colors">Dịch vụ</button>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-primary">{pkg.title}</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-surface-container-item rounded-3xl p-8 md:p-12 border border-outline-variant/30 shadow-lg relative overflow-hidden mb-10">
          {/* Decorative shapes */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className={`w-24 h-24 shrink-0 rounded-3xl flex items-center justify-center transition-all bg-surface-container text-on-surface-variant shadow-sm`}>
              <span className="material-symbols-outlined text-5xl">{pkg.icon}</span>
            </div>
            <div className="flex-grow">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="font-h2 text-h2 font-bold text-on-surface">{pkg.title}</h1>
                {pkg.type === 'monthly' && (
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20">Gói tháng</span>
                )}
                {pkg.isDeep && (
                  <span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-xs font-bold">Chuyên sâu</span>
                )}
              </div>
              <p className="text-on-surface-variant text-lg font-medium mb-1">
                {group?.groupLabel}
              </p>
              <div className="flex items-end gap-2 mt-4">
                <span className="text-sm text-on-surface-variant font-medium pb-1">Giá chỉ từ</span>
                <span className="text-3xl font-bold text-primary">{fmt(pkg.base_price)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-8">
            <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-outline-variant/30 shadow-sm">
              <h3 className="font-h3 text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                Mô tả dịch vụ
              </h3>
              <p className="text-on-surface-variant leading-relaxed text-[15px] mb-4">
                {pkg.desc}
              </p>
              <p className="text-on-surface-variant leading-relaxed text-[15px] mb-4">
                Tại CleanTrust, chúng tôi hiểu rằng một không gian sạch sẽ không chỉ mang lại vẻ đẹp thẩm mỹ mà còn bảo vệ sức khỏe cho bạn và những người thân yêu. Gói dịch vụ <strong>{pkg.title}</strong> được thiết kế tỉ mỉ với quy trình chuẩn hóa, sử dụng trang thiết bị hiện đại và dung dịch tẩy rửa an toàn.
              </p>
              <p className="text-on-surface-variant leading-relaxed text-[15px]">
                Đội ngũ nhân viên của chúng tôi không chỉ được đào tạo bài bản về kỹ năng chuyên môn mà còn thấm nhuần tinh thần tận tâm, chuyên nghiệp, cam kết mang đến sự hài lòng cao nhất. Bạn hoàn toàn có thể yên tâm giao phó không gian của mình cho chúng tôi để tận hưởng những phút giây thảnh thơi trọn vẹn.
              </p>
            </section>

            <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-outline-variant/30 shadow-sm">
              <h3 className="font-h3 text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">task_alt</span>
                Bao gồm trong dịch vụ
              </h3>
              <ul className="space-y-4">
                {(() => {
                  const getTaskList = () => {
                    if (pkg?.isDeep) {
                      return [
                        'Tất cả công việc vệ sinh Tiêu chuẩn',
                        'Chà bóng, tẩy ố sàn gạch, đánh bay vết bẩn cứng đầu',
                        'Làm sạch kính cửa sổ (mặt trong và mặt ngoài nếu an toàn)',
                        'Vệ sinh sâu tủ bếp, tẩy dầu mỡ bám lâu ngày',
                        'Lau quạt trần, đèn trang trí và các vị trí trên cao',
                        'Đánh bóng thiết bị vệ sinh, tẩy cặn canxi',
                        'Xử lý bụi mịn, vết sơn, xi măng dư thừa (Dọn sau xây dựng)',
                      ];
                    }
                    if (pkg?.id === 'elderly-care') {
                      return [
                        'Hỗ trợ vệ sinh cá nhân hàng ngày (tắm rửa, thay quần áo)',
                        'Chuẩn bị và hỗ trợ bữa ăn theo chế độ dinh dưỡng',
                        'Đo huyết áp, theo dõi sức khỏe cơ bản hàng ngày',
                        'Đưa đón đi khám bệnh, hỗ trợ mua thuốc',
                        'Trò chuyện, đọc sách, giải trí để giảm sự cô đơn',
                        'Dọn dẹp phòng ngủ, khu vực sinh hoạt và giặt giũ nhẹ',
                        'Nhắc nhở uống thuốc đúng giờ, đúng liều lượng',
                      ];
                    }
                    if (pkg?.id === 'babysitting') {
                      return [
                        'Trông giữ và chơi cùng bé an toàn tại nhà',
                        'Chuẩn bị bữa ăn nhẹ, pha sữa và cho bé ăn',
                        'Thay tã, tắm rửa, vệ sinh cá nhân cho bé',
                        'Đọc truyện, hát và tham gia các hoạt động giáo dục nhẹ',
                        'Ru bé ngủ và theo dõi giấc ngủ sát sao',
                        'Cập nhật tình hình, gửi hình ảnh/video cho phụ huynh',
                        'Đảm bảo không gian chơi của bé luôn sạch sẽ, an toàn',
                      ];
                    }
                    if (pkg?.id === 'patient-care') {
                      return [
                        'Hỗ trợ vệ sinh cá nhân tại giường hoặc phòng tắm',
                        'Theo dõi liên tục dấu hiệu sinh tồn (mạch, huyết áp, nhiệt độ)',
                        'Nhắc và hỗ trợ người bệnh uống thuốc đúng giờ',
                        'Hỗ trợ di chuyển, thay đổi tư thế, tập vật lý trị liệu nhẹ',
                        'Chuẩn bị bữa ăn tuân thủ nghiêm ngặt chế độ bệnh lý',
                        'Ghi chép nhật ký sức khỏe chi tiết hàng ngày',
                        'Liên hệ ngay với gia đình và y tế khi có dấu hiệu bất thường',
                      ];
                    }
                    return [
                      'Quét và lau sàn toàn bộ các phòng',
                      'Lau sạch bụi bẩn trên bề mặt đồ đạc (TV, kệ, bàn ghế)',
                      'Gom rác, thay túi rác và đổ rác đúng nơi quy định',
                      'Vệ sinh bề mặt bếp, lau dọn khu vực nấu nướng',
                      'Chà rửa bồn cầu, bồn rửa mặt, gương trong nhà vệ sinh',
                      'Xếp dọn gọn gàng đồ đạc, đồ chơi, chăn gối',
                    ];
                  };
                  return getTaskList().map((task, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary mt-0.5" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                      <span className="text-on-surface-variant text-[15px]">{task}</span>
                    </li>
                  ));
                })()}
              </ul>
            </section>
          </div>

          <div className="md:col-span-1">
            <div className="sticky top-28 bg-surface-container-item rounded-2xl p-6 border border-primary/20 shadow-lg">
              <h3 className="font-h3 text-lg font-bold text-on-surface mb-4">Bạn đã sẵn sàng?</h3>
              <p className="text-sm text-on-surface-variant mb-6">
                Đặt lịch ngay hôm nay để tận hưởng không gian sạch sẽ, trong lành. Chúng tôi luôn sẵn sàng phục vụ!
              </p>
              <button 
                onClick={() => navigate('/booking', { state: { selectedPackage: pkg.id } })}
                className="w-full bg-primary text-on-primary font-bold py-3.5 rounded-xl hover:bg-primary-container hover:text-on-primary-container shadow hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">calendar_month</span>
                Đặt lịch ngay
              </button>
              
              <div className="mt-6 pt-6 border-t border-outline-variant/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">support_agent</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant font-medium">Hỗ trợ 24/7</p>
                    <p className="text-sm font-bold text-on-surface">1900 xxxx</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant font-medium">Đảm bảo</p>
                    <p className="text-sm font-bold text-on-surface">Uy tín 100%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ServiceDetailPage;
