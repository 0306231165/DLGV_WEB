import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// MOCK dữ liệu thông báo hệ thống CleanTrust
const MOCK_ALL_NOTIFICATIONS = [
  { id: 1, tieu_de: '🎉 Đặt lịch thành công', noi_dung: 'Đơn lịch dọn dẹp hằng ngày #102 của bạn đã được hệ thống tiếp nhận thành công.', ngay_tao: '5 phút trước', is_da_doc: false, loai_doi_tuong: 'Booking', doi_tuong_id: 102 },
  { id: 2, tieu_de: '💼 Nhân viên đã nhận lịch', noi_dung: 'Chị Trần Thị Mai đã xác nhận tham gia ca làm việc ngày mai (09/06) tại nhà của bạn.', ngay_tao: '1 giờ trước', is_da_doc: false, loai_doi_tuong: 'Booking', doi_tuong_id: 102 },
  { id: 3, tieu_de: '💰 Biến động số dư ví', noi_dung: 'Tài khoản ví CleanTrust của bạn đã thanh toán tự động 200.000đ cho đơn lịch #102.', ngay_tao: '4 giờ trước', is_da_doc: true, loai_doi_tuong: 'Transaction', doi_tuong_id: 5501 },
  { id: 4, tieu_de: '🔥 Khuyến mãi độc quyền cuối tuần', noi_dung: 'Nhập ngay mã CLEAN50 để nhận ưu đãi giảm giá 50.000đ cho tất cả các dịch vụ Tổng vệ sinh (Deep Clean). Áp dụng duy nhất tuần này!', ngay_tao: '2 ngày trước', is_da_doc: true, loai_doi_tuong: 'Promotion', doi_tuong_id: 12 },
  { id: 5, tieu_de: '⭐ Hãy đánh giá dịch vụ', noi_dung: 'Ca làm việc đơn #098 ngày 05/06 đã hoàn thành. Hãy gửi phản hồi về nhân viên để hệ thống tối ưu chất lượng tốt hơn nhé.', ngay_tao: '3 ngày trước', is_da_doc: true, loai_doi_tuong: 'Review', doi_tuong_id: 0 },
];

const NotificationPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(MOCK_ALL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('all');

  // Đọc đơn lẻ và chuyển hướng tới trang tính năng tương ứng
  const markAsRead = (id, targetRoute) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_da_doc: true } : n));
    if (targetRoute) navigate(targetRoute);
  };

  // Đánh dấu đọc tất cả
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_da_doc: true })));
  };

  // Xóa thông báo khỏi danh sách
  const deleteNotification = (id, e) => {
    e.stopPropagation(); // Không kích hoạt sự kiện click thẻ cha
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Lọc thông báo theo tab
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'booking') return n.loai_doi_tuong === 'Booking';
    if (activeTab === 'promo') return n.loai_doi_tuong === 'Promotion';
    return true;
  });

  return (
    <main className="pt-32 pb-section-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen">
      
      {/* Khối Header chuẩn chỉ giống MyBookingsLayout */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface text-primary mb-2">Trung tâm thông báo</h1>
          <p className="text-on-surface-variant font-body-lg">
            Cập nhật tiến độ đơn lịch, dòng tiền ví điện tử và các ưu đãi dành riêng cho bạn.
          </p>
        </div>
        
        {notifications.some(n => !n.is_da_doc) && (
          <button 
            onClick={markAllAsRead}
            className="text-xs font-bold text-primary hover:bg-primary/10 border border-primary/30 px-5 py-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">done_all</span>
            Đánh dấu đã đọc tất cả
          </button>
        )}
      </div>

      {/* Bộ lọc Tab điều hướng đồng bộ hệ thống */}
      <div className="flex border-b border-outline-variant/30 mb-8 gap-6 overflow-x-auto whitespace-nowrap scrollbar-none">
        {[
          { id: 'all', label: 'Tất cả thông báo' },
          { id: 'booking', label: 'Đơn lịch & Tiến độ' },
          { id: 'promo', label: 'Ưu đãi & Quà tặng' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 font-semibold text-body-md transition-all relative px-1 ${
              activeTab === tab.id 
                ? 'text-primary font-bold border-b-2 border-primary' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vùng danh sách hiển thị thẻ thông báo */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          /* Trạng thái trống (Empty State) */
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-outline-variant/40">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-3">notifications_off</span>
            <h3 className="text-body-lg font-bold text-on-surface mb-1">Hộp thư trống</h3>
            <p className="text-on-surface-variant max-w-xs mx-auto text-sm">
              Hiện tại bạn không có thông báo nào trong danh mục này.
            </p>
          </div>
        ) : (
          /* Render vòng lặp danh sách thông báo */
          filteredNotifications.map(item => {
            // Cấu hình Icon và Màu sắc cho từng thực thể đối tượng khác nhau
            let iconName = 'notifications';
            let iconStyle = 'bg-primary/10 text-primary';
            let targetRoute = null;

            if (item.loai_doi_tuong === 'Booking') {
              iconName = 'calendar_month';
              iconStyle = 'bg-secondary-container text-on-secondary-container';
              targetRoute = `/my-bookings/${item.doi_tuong_id}`;
            } else if (item.loai_doi_tuong === 'Transaction') {
              iconName = 'account_balance_wallet';
              iconStyle = 'bg-emerald-500/10 text-emerald-600';
              targetRoute = '/wallet';
            } else if (item.loai_doi_tuong === 'Promotion') {
              iconName = 'redeem';
              iconStyle = 'bg-amber-500/10 text-amber-600';
              targetRoute = '/promotions';
            } else if (item.loai_doi_tuong === 'Review') {
              iconName = 'star_rate';
              iconStyle = 'bg-primary/10 text-primary';
              targetRoute = '/my-bookings/history';
            }

            return (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id, targetRoute)}
                className={`group p-5 rounded-2xl border border-outline-variant/30 hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex gap-4 relative items-start ${
                  !item.is_da_doc ? 'bg-primary/[0.02] border-primary/30' : 'bg-white'
                }`}
              >
                {/* Đã bọc khối icon & chấm tròn chung flex để căn giữa tuyệt đối theo trục Y của icon */}
                <div className="flex items-center shrink-0 relative pl-3">
                  {/* Dấu chấm tròn xanh định vị căn giữa tuyệt đối theo trục Y của icon trái */}
                  {!item.is_da_doc && (
                    <span className="absolute left-0 w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}

                  {/* Khối tròn Icon bọc bên trái */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${iconStyle}`}>
                    <span className="material-symbols-outlined text-xl">{iconName}</span>
                  </div>
                </div>

                {/* Khối text nội dung chi tiết thông báo */}
                <div className="flex-1 pr-4 pt-1">
                  <h3 className={`text-body-lg font-bold text-on-surface mb-1 ${!item.is_da_doc ? 'text-primary' : ''}`}>
                    {item.tieu_de}
                  </h3>
                  <p className="text-body-md text-on-surface-variant leading-relaxed mb-2">
                    {item.noi_dung}
                  </p>
                  <span className="text-[11px] text-outline-variant font-medium block">
                    {item.ngay_tao}
                  </span>
                </div>

                {/* Nút xóa thông báo nhanh - Xuất hiện nhẹ nhàng mượt mà khi di chuột vào (Hover) */}
                <button
                  onClick={(e) => deleteNotification(item.id, e)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-150 shrink-0 focus:outline-none self-center"
                  title="Xóa thông báo"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
};

export default NotificationPage;