import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import khachHangApi from '../../../api/khachHangApi';

const NotificationPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await khachHangApi.getNotifications();
      if (res && res.success) {
        setNotifications(res.data || []);
      }
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Đọc đơn lẻ và chuyển hướng tới trang tính năng tương ứng
  const markAsRead = async (id, targetRoute) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_da_doc: true } : n));
    try {
      await khachHangApi.markNotificationRead(id);
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc:', error);
    }
    if (targetRoute) navigate(targetRoute);
  };

  // Đánh dấu đọc tất cả
  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_da_doc: true })));
    try {
      await khachHangApi.markAllNotificationsRead();
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc tất cả:', error);
    }
  };

  // Xóa thông báo khỏi danh sách
  const deleteNotification = async (id, e) => {
    e.stopPropagation(); // Không kích hoạt sự kiện click thẻ cha
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await khachHangApi.deleteNotification(id);
    } catch (error) {
      console.error('Lỗi xóa thông báo:', error);
    }
  };

  // Lọc thông báo theo tab
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'booking') return n.loai_doi_tuong === 'Booking' || n.loai_doi_tuong === 'DonHang' || n.loai_doi_tuong === 'CaLamViec';
    if (activeTab === 'promo') return n.loai_doi_tuong === 'Promotion' || n.loai_doi_tuong === 'KhuyenMai';
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

            if (item.loai_doi_tuong === 'Booking' || item.loai_doi_tuong === 'DonHang' || item.loai_doi_tuong === 'CaLamViec') {
              iconName = 'calendar_month';
              iconStyle = 'bg-secondary-container text-on-secondary-container';
              targetRoute = `/my-bookings/${item.doi_tuong_id}`;
            } else if (item.loai_doi_tuong === 'Transaction' || item.loai_doi_tuong === 'ViTien') {
              iconName = 'account_balance_wallet';
              iconStyle = 'bg-emerald-500/10 text-emerald-600';
              targetRoute = '/wallet';
            } else if (item.loai_doi_tuong === 'Promotion' || item.loai_doi_tuong === 'KhuyenMai') {
              iconName = 'redeem';
              iconStyle = 'bg-amber-500/10 text-amber-600';
              targetRoute = '/promotions';
            } else if (item.loai_doi_tuong === 'Review' || item.loai_doi_tuong === 'DanhGia') {
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