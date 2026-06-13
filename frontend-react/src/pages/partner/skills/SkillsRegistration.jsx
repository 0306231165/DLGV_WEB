import React, { useState } from 'react';

const SkillsRegistration = () => {
  // Danh sách dịch vụ ban đầu trong State
  const [services, setServices] = useState([
    { 
      id: 1, 
      name: 'Dọn dẹp nhà phổ thông', 
      icon: 'clean_hands', 
      desc: 'Lau dọn sàn, quét bụi, dọn phòng khách, phòng ngủ cơ bản.', 
      status: 'active', 
      statusText: 'Đang hoạt động' 
    },
    { 
      id: 2, 
      name: 'Tổng vệ sinh sâu (Deep Clean)', 
      icon: 'imagesearch_roller', 
      desc: 'Vệ sinh nhà mới xây, dọn dẹp tổng thể quy mô lớn bằng máy móc.', 
      status: 'active', 
      statusText: 'Đang hoạt động' 
    },
    { 
      id: 3, 
      name: 'Đi chợ & Nấu ăn gia đình', 
      icon: 'cooking', 
      desc: 'Lên thực đơn, đi chợ lựa chọn thực phẩm tươi ngon và chế biến.', 
      status: 'pending', 
      statusText: 'Đang chờ thi test',
      examSchedule: {
        date: '15/06/2026',
        time: '13:00 - 15:00',
        location: 'Phòng thực hành tầng 3, Trụ sở CleanTrust Quận 1'
      }
    },
    { 
      id: 4, 
      name: 'Vệ sinh máy lạnh / Thiết bị', 
      icon: 'ac_unit', 
      desc: 'Tháo màng lọc, xịt rửa bảo dưỡng cục nóng, cục lạnh điều hòa.', 
      status: 'available', 
      statusText: 'Có thể đăng ký' 
    },
    { 
      id: 5, 
      name: 'Chăm sóc trẻ em (Babysitting)', 
      icon: 'child_care', 
      desc: 'Hỗ trợ trông trẻ, cho trẻ ăn, chơi cùng trẻ theo giờ.', 
      status: 'available', 
      statusText: 'Có thể đăng ký' 
    },
    { 
      id: 6, 
      name: 'Ủi đồ & Giặt là chuyên sâu', 
      icon: 'iron', 
      desc: 'Phân loại vải, giặt sấy, là phẳng phiu các loại quần áo cao cấp.', 
      status: 'available', 
      statusText: 'Có thể đăng ký' 
    },
  ]);

  // Quản lý trạng thái các Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [calculatedSchedule, setCalculatedSchedule] = useState(null);

  // Helper chuyển đổi chuỗi ngày (DD/MM/YYYY) và giờ (HH:MM) thành đối tượng Date để so sánh/sắp xếp
  const parseDateTime = (dateStr, timeStr) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    const [hour, minute] = timeStr.split(' - ')[0].split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute);
  };

  // ================= THUẬT TOÁN PHÂN BỔ CA THI CỐ ĐỊNH SÁNG/CHIỀU =================
  const generateSmartSchedule = () => {
    const pendingServices = services.filter(s => s.status === 'pending' && s.examSchedule);
    
    // 1. Nếu chưa đăng ký ca nào, mặc định xếp ca đầu tiên là Ca sáng ngày 15/06/2026
    if (pendingServices.length === 0) {
      return {
        date: '15/06/2026',
        time: '09:00 - 11:00',
        location: 'Phòng thực hành tầng 3, Trụ sở CleanTrust Quận 1'
      };
    }

    // 2. Tìm ca thi muộn nhất hiện tại để làm mốc tịnh tiến tiếp theo
    let latestDateTime = null;
    let latestSchedule = null;

    pendingServices.forEach(s => {
      const currentDateTime = parseDateTime(s.examSchedule.date, s.examSchedule.time);
      if (!latestDateTime || currentDateTime > latestDateTime) {
        latestDateTime = currentDateTime;
        latestSchedule = s.examSchedule;
      }
    });

    // Phân tách mốc giờ, ngày tháng của ca muộn nhất
    const startHour = Number(latestSchedule.time.split(' - ')[0].split(':')[0]);
    const [day, month, year] = latestSchedule.date.split('/').map(Number);

    let nextTimeStr = '';
    let nextDay = day;
    let nextMonth = month;
    let nextYear = year;

    // 3. LOGIC QUYẾT ĐỊNH CA THI:
    if (startHour === 9) {
      // Nếu ca muộn nhất là Ca Sáng (9h-11h) -> Ca tiếp theo sẽ là Ca Chiều (13h-15h) cùng ngày
      nextTimeStr = '13:00 - 15:00';
    } else {
      // Nếu ca muộn nhất đã là Ca Chiều (13h-15h) -> Bắt buộc chuyển sang Ca Sáng ngày hôm sau
      nextTimeStr = '09:00 - 11:00';
      nextDay = day + 1;
      
      // Xử lý logic chuyển tháng nếu vượt quá ngày 30
      if (nextDay > 30) {
        nextDay = 1;
        nextMonth = month + 1;
        if (nextMonth > 12) {
          nextMonth = 1;
          nextYear = year + 1;
        }
      }
    }

    const pad = (num) => String(num).padStart(2, '0');
    return {
      date: `${pad(nextDay)}/${pad(nextMonth)}/${nextYear}`,
      time: nextTimeStr,
      location: 'Phòng thực hành tầng 3, Trụ sở CleanTrust Quận 1'
    };
  };

  // ================= LOGIC SẮP XẾP DỊCH VỤ THEO THỨ TỰ TRỰC QUAN =================
  const getSortedServices = () => {
    return [...services].sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;

      if (a.status === 'pending' && b.status === 'pending' && a.examSchedule && b.examSchedule) {
        const timeA = parseDateTime(a.examSchedule.date, a.examSchedule.time);
        const timeB = parseDateTime(b.examSchedule.date, b.examSchedule.time);
        return timeA - timeB;
      }
      return 0;
    });
  };

  // Mở modal Đăng ký
  const handleOpenRegisterModal = (service) => {
    setSelectedService(service);
    const dynamicSchedule = generateSmartSchedule();
    setCalculatedSchedule(dynamicSchedule);
    setIsRegisterModalOpen(true);
  };

  // Xác nhận Đăng ký
  const handleConfirmRegistration = () => {
    setServices(prevServices => 
      prevServices.map(item => 
        item.id === selectedService.id 
          ? { 
              ...item, 
              status: 'pending', 
              statusText: 'Đang chờ thi test', 
              examSchedule: calculatedSchedule 
            }
          : item
      )
    );
    setIsRegisterModalOpen(false);
    setSelectedService(null);
    setCalculatedSchedule(null);
  };

  // Mở modal Hủy lịch
  const handleOpenCancelModal = (service) => {
    setSelectedService(service);
    setIsCancelModalOpen(true);
  };

  // Xác nhận Hủy lịch
  const handleConfirmCancel = () => {
    setServices(prevServices => 
      prevServices.map(item => 
        item.id === selectedService.id 
          ? { ...item, status: 'available', statusText: 'Có thể đăng ký', examSchedule: null }
          : item
      )
    );
    setIsCancelModalOpen(false);
    setSelectedService(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative select-none">
      
      {/* Tiêu đề trang */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-2xl">model_training</span>
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800">Đăng ký dịch vụ & Khảo sát chuyên môn</h1>
          <p className="text-xs text-slate-500 font-medium">Đăng ký thêm năng lực để nhận được nhiều loại đơn hàng và tăng thu nhập của bạn.</p>
        </div>
      </div>

      {/* Grid danh sách các dịch vụ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {getSortedServices().map((service) => (
          <div 
            key={service.id} 
            className={`bg-white p-5 rounded-2xl border flex flex-col justify-between transition-all hover:shadow-md ${
              service.status === 'pending' ? 'border-amber-300 ring-2 ring-amber-500/5 bg-amber-50/10' : 'border-slate-200/60'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 border border-slate-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">{service.icon}</span>
                </div>

                {/* Badge trạng thái */}
                {service.status === 'active' && (
                  <span className="px-2.5 py-1 text-[10px] font-black tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200/60 rounded-lg flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {service.statusText.toUpperCase()}
                  </span>
                )}
                {service.status === 'pending' && (
                  <span className="px-2.5 py-1 text-[10px] font-black tracking-wide bg-amber-100 text-amber-800 border border-amber-200 rounded-lg flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
                    {service.statusText.toUpperCase()}
                  </span>
                )}
                {service.status === 'available' && (
                  <span className="px-2.5 py-1 text-[10px] font-bold tracking-wide bg-slate-100 text-slate-600 border border-slate-200 rounded-lg">
                    {service.statusText.toUpperCase()}
                  </span>
                )}
              </div>

              <h3 className="font-bold text-slate-900 text-base">{service.name}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{service.desc}</p>

              {/* KHỐI LỊCH HẸN TINH GỌN */}
              {service.status === 'pending' && service.examSchedule && (
                <div className="mt-4 p-3.5 bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200 rounded-xl space-y-1.5 text-slate-700">
                  <p className="text-[11px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <span className="material-symbols-outlined text-sm">calendar_month</span> Lịch hẹn kiểm tra tay nghề
                  </p>
                  <div className="text-xs space-y-1 font-medium text-slate-600">
                    <p>• <span className="font-bold text-slate-800">Thời gian:</span> {service.examSchedule.time} | {service.examSchedule.date}</p>
                    <p>• <span className="font-bold text-slate-800">Địa điểm:</span> {service.examSchedule.location}</p>
                  </div>
                  <p className="text-[10px] text-amber-700 font-semibold leading-tight pt-1">
                    *Vui lòng mặc đồng phục CleanTrust khi tham gia.
                  </p>
                </div>
              )}
            </div>

            {/* Khu vực nút bấm xử lý tương tác */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
              {service.status === 'active' && (
                <button className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 cursor-not-allowed flex items-center gap-1" disabled>
                  <span className="material-symbols-outlined text-sm">verified</span> Sẵn sàng nhận đơn
                </button>
              )}
              {service.status === 'pending' && (
                <button 
                  onClick={() => handleOpenCancelModal(service)}
                  className="text-xs font-bold text-rose-600 bg-rose-100 hover:bg-rose-100 border border-rose-100 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy lịch đăng ký
                </button>
              )}
              {service.status === 'available' && (
                <button 
                  onClick={() => handleOpenRegisterModal(service)}
                  className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/10 px-4 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add_circle</span> Đăng ký & Đặt lịch thi Test
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Khối quy trình chân trang */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-950 text-slate-100 rounded-2xl p-5 flex gap-4 text-xs leading-relaxed shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center shrink-0 font-bold shadow-md shadow-amber-500/20">
          <span className="material-symbols-outlined text-xl font-black">gavel</span>
        </div>
        <div>
          <h4 className="font-black text-sm text-amber-400 tracking-wide mb-1">QUY TRÌNH KIỂM TRA CHUYÊN MÔN DÀNH CHO ĐỐI TÁC</h4>
          <p className="text-slate-300 font-medium">
            Mỗi đối tác tại <span className="text-emerald-400 font-bold">CleanTrust</span> có quyền đăng ký không giới hạn các dịch vụ để tối ưu hóa nguồn thu nhập cá nhân. Tuy nhiên, để đảm bảo an toàn cho khách hàng, bạn bắt buộc phải vượt qua vòng khảo sát lý thuyết thực tế và bài kiểm tra tay nghề trực tiếp tại văn phòng đại diện. Quyền nhận đơn sẽ tự động được mở trong hệ thống ngay sau khi bạn nhận được thông báo <span className="text-emerald-400 font-bold">"Đạt yêu cầu"</span> từ hội đồng chấm thi.
          </p>
        </div>
      </div>

      {/* ================= MODAL XÁC NHẬN ĐĂNG KÝ ================= */}
      {isRegisterModalOpen && selectedService && calculatedSchedule && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
            <div className="p-6 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <span className="material-symbols-outlined text-xl font-bold">add_task</span>
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Xác nhận xếp lịch kiểm tra</h3>
                <p className="text-[11px] text-slate-400 font-medium">Hệ thống phân bổ lịch tự động</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Dịch vụ chọn thêm</p>
                <p className="text-sm font-black text-slate-800 mt-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-slate-600 text-base">{selectedService.icon}</span>
                  {selectedService.name}
                </p>
              </div>

              <div className="space-y-2 border border-emerald-100 rounded-xl p-4 bg-emerald-50/20">
                <p className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">event_available</span> Khung giờ trống được chỉ định:
                </p>
                <div className="text-xs font-semibold text-slate-700 space-y-1.5 pl-1">
                  <p>• <span>Thời gian:</span> {calculatedSchedule.time} | {calculatedSchedule.date}</p>
                  <p>• <span>Địa điểm:</span> {calculatedSchedule.location}</p>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50/50 border border-amber-100 rounded-xl flex gap-2.5">
                <span className="material-symbols-outlined text-amber-600 text-lg shrink-0 mt-0.5">info</span>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Để đảm bảo sức khỏe, hệ thống chỉ sắp xếp tối đa <span className="font-bold text-slate-800">2 ca thi/ngày</span> (Ca sáng: 09h-11h, Ca chiều: 13h-15h). Bạn sẽ có 2 tiếng nghỉ trưa trọn vẹn.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button 
                onClick={() => { setIsRegisterModalOpen(false); setSelectedService(null); }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button 
                onClick={handleConfirmRegistration}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/10 transition-colors cursor-pointer"
              >
                Xác nhận lịch thi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL XÁC NHẬN HỦY LỊCH THI ================= */}
      {isCancelModalOpen && selectedService && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
            
            <div className="p-5 text-center space-y-3 pt-7">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 mx-auto shadow-sm">
                <span className="material-symbols-outlined text-2xl font-bold">warning</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-900 text-base">Bạn muốn hủy lịch thi này?</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed px-2">
                  Hành động này sẽ xóa bỏ lịch kiểm tra chuyên môn dịch vụ <span className="font-bold text-slate-700">"{selectedService.name}"</span> của bạn vào ngày {selectedService.examSchedule?.date}.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2.5">
              <button 
                onClick={() => { setIsCancelModalOpen(false); setSelectedService(null); }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Giữ lại lịch
              </button>
              <button 
                onClick={handleConfirmCancel}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/10 transition-colors cursor-pointer"
              >
                Xác nhận Hủy
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SkillsRegistration;