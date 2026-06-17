import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import publicApi from '../../../api/publicApi';

const SERVICE_ICONS = {
  1: 'cleaning_services',
  2: 'calendar_month',
  3: 'cleaning',
  4: 'elderly',
  5: 'baby_changing_station',
  6: 'medical_services',
  7: 'construction',
  8: 'ac_unit',
  9: 'chair',
  10: 'bed',
  11: 'soup_kitchen',
  12: 'layers',
  13: 'corporate_fare',
};

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        setLoading(true);
        const res = await publicApi.getServiceDetail(id);
        if (res.success) {
          setPkg(res.service || null);
        }
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết dịch vụ:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchServiceDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center pt-20">
        <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
        <h2 className="text-2xl font-bold text-on-surface mb-2">Không tìm thấy dịch vụ</h2>
        <p className="text-on-surface-variant mb-6">Dịch vụ bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ.</p>
        <button 
          onClick={() => navigate('/services')}
          className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-container transition-colors"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const fmt = n => Number(n).toLocaleString('vi-VN') + 'đ';
  const hasMonthly = pkg.loai_goi?.some(lg => lg.loai_goi_id === 2);

  // 🌟 HÀM XỬ LÝ LẤY CẢ DESCRIPTION VÀ TASKS TỪ JSON
  const getDetailContent = () => {
    let descriptions = [];
    let tasks = [];

    // 1. Lấy dữ liệu từ noi_dung_chi_tiet trong DB
    if (pkg.noi_dung_chi_tiet) {
      try {
        const parsedData = typeof pkg.noi_dung_chi_tiet === 'string'
          ? JSON.parse(pkg.noi_dung_chi_tiet)
          : pkg.noi_dung_chi_tiet;
          
        if (parsedData.description && Array.isArray(parsedData.description)) {
          descriptions = parsedData.description;
        }
        if (parsedData.tasks && Array.isArray(parsedData.tasks)) {
          tasks = parsedData.tasks;
        }
      } catch (e) {
        console.error("Lỗi khi parse noi_dung_chi_tiet JSON:", e);
      }
    }

    // 2. Fallback cho Descriptions nếu DB không có
    if (descriptions.length === 0) {
      descriptions = [
        pkg.mo_ta,
        "Tại CleanTrust, chúng tôi hiểu rằng một không gian sạch sẽ không chỉ mang lại vẻ đẹp thẩm mỹ mà còn bảo vệ sức khỏe cho bạn và những người thân yêu.",
        "Đội ngũ nhân viên của chúng tôi không chỉ được đào tạo bài bản về kỹ năng chuyên môn mà còn thấm nhuần tinh thần tận tâm, chuyên nghiệp."
      ];
    }

    // 3. Fallback cho Tasks nếu DB không có
    if (tasks.length === 0) {
      const serviceId = Number(pkg.id);
      if (serviceId === 3 || serviceId === 7) {
        tasks = [
          'Tất cả công việc vệ sinh Tiêu chuẩn',
          'Chà bóng, tẩy ố sàn gạch, đánh bay vết bẩn cứng đầu',
          'Làm sạch kính cửa sổ (mặt trong và mặt ngoài nếu an toàn)',
          'Vệ sinh sâu tủ bếp, tẩy dầu mỡ bám lâu ngày',
          'Lau quạt trần, đèn trang trí và các vị trí trên cao',
          'Đánh bóng thiết bị vệ sinh, tẩy cặn canxi',
          'Xử lý bụi mịn, vết sơn, xi măng dư thừa (Dọn sau xây dựng)',
        ];
      } else if (serviceId === 4) {
        tasks = [
          'Hỗ trợ vệ sinh cá nhân hàng ngày (tắm rửa, thay quần áo)',
          'Chuẩn bị và hỗ trợ bữa ăn theo chế độ dinh dưỡng',
          'Đo huyết áp, theo dõi sức khỏe cơ bản hàng ngày',
          'Đưa đón đi khám bệnh, hỗ trợ mua thuốc',
          'Trò chuyện, đọc sách, giải trí để giảm sự cô đơn',
        ];
      } else {
        tasks = [
          'Quét và lau sàn toàn bộ các phòng',
          'Lau sạch bụi bẩn trên bề mặt đồ đạc (TV, kệ, bàn ghế)',
          'Gom rác, thay túi rác và đổ rác đúng nơi quy định',
          'Vệ sinh bề mặt bếp, lau dọn khu vực nấu nướng',
          'Chà rửa bồn cầu, bồn rửa mặt, gương trong nhà vệ sinh',
        ];
      }
    }

    return { descriptions, tasks };
  };

  const { descriptions, tasks } = getDetailContent();

  return (
    <div className="bg-surface min-h-screen pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="text-sm font-medium text-on-surface-variant mb-8 flex items-center gap-2">
          <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Trang chủ</button>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <button onClick={() => navigate('/services')} className="hover:text-primary transition-colors">Dịch vụ</button>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-primary">{pkg.ten_dich_vu}</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-surface-container-item rounded-3xl p-8 md:p-12 border border-outline-variant/30 shadow-lg relative overflow-hidden mb-10">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="w-24 h-24 shrink-0 rounded-3xl flex items-center justify-center transition-all bg-surface-container text-on-surface-variant shadow-sm">
              <span className="material-symbols-outlined text-5xl">
                {SERVICE_ICONS[pkg.id] || 'cleaning_services'}
              </span>
            </div>
            <div className="flex-grow">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="font-h2 text-h2 font-bold text-on-surface">{pkg.ten_dich_vu}</h1>
                {hasMonthly && (
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20">Gói tháng</span>
                )}
                {pkg.is_noi_bat ? (
                  <span className="bg-error/10 text-error px-3 py-1 rounded-full text-xs font-bold">Phổ biến</span>
                ) : null}
              </div>
              <p className="text-on-surface-variant text-lg font-medium mb-1">
                {pkg.nhom_dich_vu?.ten_nhom || 'Dịch vụ chuyên nghiệp'}
              </p>
              <div className="flex items-end gap-2 mt-4">
                <span className="text-sm text-on-surface-variant font-medium pb-1">Giá chỉ từ</span>
                <span className="text-3xl font-bold text-primary">{fmt(pkg.don_gia_co_ban)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-8">
            {/* Mô tả - Render động từ mảng descriptions */}
            <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-outline-variant/30 shadow-sm">
              <h3 className="font-h3 text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                Mô tả dịch vụ
              </h3>
              
              {descriptions.map((paragraph, index) => (
                <p key={index} className="text-on-surface-variant leading-relaxed text-[15px] mb-4 last:mb-0">
                  {/* Bôi đậm tên dịch vụ nếu có trong chuỗi */}
                  {paragraph.includes('Gói dịch vụ') ? (
                    <span dangerouslySetInnerHTML={{ __html: paragraph.replace('Gói dịch vụ', `Gói dịch vụ <strong>${pkg.ten_dich_vu}</strong>`) }} />
                  ) : (
                    paragraph
                  )}
                </p>
              ))}
            </section>

            {/* Công việc bao gồm - Render động từ mảng tasks */}
            <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-outline-variant/30 shadow-sm">
              <h3 className="font-h3 text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">task_alt</span>
                Bao gồm trong dịch vụ
              </h3>
              <ul className="space-y-4">
                {tasks.map((task, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-0.5" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                    <span className="text-on-surface-variant text-[15px]">{task}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar Đặt Lịch */}
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