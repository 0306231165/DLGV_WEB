import React, { useState } from 'react';

const PartnerNotifications = () => {
  // Mock data toàn bộ thông báo (Giống bên Layout nhưng nhiều dữ liệu hơn để test cuộn/lọc)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Lịch thi Test: Đi chợ & Nấu ăn',
      desc: 'Hệ thống đã xếp lịch thi cho bạn vào lúc 13:00 - 15:00 ngày 15/06/2026. Vui lòng mang theo CCCD và có mặt đúng giờ để làm bài kiểm tra tay nghề.',
      time: '10 phút trước',
      date: '15/06/2026',
      isRead: false,
      type: 'exam',
      icon: 'model_training',
      bgIcon: 'bg-amber-100 text-amber-600'
    },
    {
      id: 2,
      title: 'Yêu cầu đổi lịch làm việc thất bại',
      desc: 'Đơn hàng Tổng vệ sinh sâu #CT-9912 tại Quận 1 không chấp nhận dời lịch từ phía đối tác. Khách hàng đang cần gấp, vui lòng thực hiện đúng thời gian đã cam kết.',
      time: '2 giờ trước',
      date: '15/06/2026',
      isRead: false,
      type: 'warning',
      icon: 'warning',
      bgIcon: 'bg-rose-100 text-rose-600'
    },
    {
      id: 3,
      title: 'Ví tài khoản tăng +350.000đ',
      desc: 'Tiền công đơn hàng Tổng vệ sinh sâu #CT-9877 đã được duyệt thanh toán và cộng vào ví của bạn. Kiểm tra mục Ví & Thu nhập để biết thêm chi tiết.',
      time: 'Hôm qua',
      date: '14/06/2026',
      isRead: true,
      type: 'wallet',
      icon: 'account_balance_wallet',
      bgIcon: 'bg-emerald-100 text-emerald-600'
    },
    {
      id: 4,
      title: 'Đánh giá 5 sao từ Khách hàng',
      desc: 'Chị Mai Anh (Quận 3) vừa đánh giá bạn 5 sao kèm lời khen: "Dọn dẹp rất kỹ và sạch sẽ, đóng gói rác cẩn thận, thái độ vô cùng lịch sự". Thưởng hiệu suất +10 điểm uy tín.',
      time: '2 ngày trước',
      date: '13/06/2026',
      isRead: true,
      type: 'review',
      icon: 'star',
      bgIcon: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 5,
      title: 'Cập nhật chính sách thưởng Tuần mới',
      desc: 'CleanTrust thông báo chương trình đua top hiệu suất tuần từ 15/06 đến 22/06. Hoàn thành trên 8 đơn hàng nhận ngay voucher thưởng 200.000đ vào ví.',
      time: '3 ngày trước',
      date: '12/06/2026',
      isRead: true,
      type: 'system',
      icon: 'campaign',
      bgIcon: 'bg-blue-100 text-blue-600'
    }
  ]);

  const [activeTab, setActiveTab] = useState('all'); // 'all' hoặc 'unread'
  const [searchTerm, setSearchTerm] = useState('');

  // Đếm số lượng thông báo chưa đọc
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Xử lý click đọc từng thông báo
  const handleReadItem = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  // Đọc tất cả
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Xóa một thông báo (Nếu cần)
  const handleDeleteItem = (id, e) => {
    e.stopPropagation(); // Ngăn sự kiện click vào item
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Lọc dữ liệu theo Tab + Tìm kiếm theo Tiêu đề/Nội dung
  const filteredNotifications = notifications.filter(noti => {
    const matchesTab = activeTab === 'all' || !noti.isRead;
    const matchesSearch = noti.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          noti.desc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* THANH TIÊU ĐỀ TRANG VÀ NÚT TÁC VỤ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-wide flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-2xl">notifications</span>
            Trung tâm Thông báo
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Bạn đang có <span className="text-emerald-600 font-bold">{unreadCount}</span> thông báo chưa đọc liên quan đến công việc.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center justify-center gap-2 text-xs font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100/80 px-4 py-2.5 rounded-xl transition-all duration-150 border border-emerald-100 cursor-pointer shadow-sm self-start sm:self-center"
          >
            <span className="material-symbols-outlined text-base">done_all</span>
            Đánh dấu đọc tất cả
          </button>
        )}
      </div>

      {/* THANH BỘ LỌC TAB & Ô TÌM KIẾM */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60">
        
        {/* Nhóm Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 md:flex-none px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tất cả ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 md:flex-none px-5 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'unread'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Chưa đọc
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-black bg-amber-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Thanh tìm kiếm nhanh */}
        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            type="text"
            placeholder="Tìm kiếm thông báo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium text-slate-800"
          />
        </div>
      </div>

      {/* DANH SÁCH THÔNG BÁO CHI TIẾT */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((noti) => (
            <div
              key={noti.id}
              onClick={() => handleReadItem(noti.id)}
              className={`p-5 pl-6 flex items-start gap-4 rounded-2xl shadow-sm border transition-all duration-150 cursor-pointer relative group ${
                !noti.isRead
                  ? 'bg-emerald-50/40 hover:bg-emerald-50/70 border-emerald-100 border-l-4 border-l-emerald-500' 
                  : 'bg-white hover:bg-slate-50/60 border-slate-100'
              }`}
            >
              {/* Chấm tròn xanh chỉ thị tin chưa đọc (Căn giữa theo trục Y tuyệt đối) */}
              {!noti.isRead && (
                <span className="absolute left-2 w-1.5 h-1.5 rounded-full bg-emerald-500 top-1/2 -translate-y-1/2"></span>
              )}

              {/* Icon Đại Diện */}
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-black/5 shadow-sm ${noti.bgIcon}`}>
                <span className="material-symbols-outlined text-xl font-bold">{noti.icon}</span>
              </div>

              {/* Khối nội dung chữ */}
              <div className="flex-1 space-y-1 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className={`text-sm text-slate-800 tracking-wide ${!noti.isRead ? 'font-black text-emerald-950' : 'font-bold'}`}>
                    {noti.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded-md self-start sm:self-center">
                    {noti.time}
                  </span>
                </div>
                
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {noti.desc}
                </p>

                {/* Phần mở rộng hiển thị ngày tháng dưới chân tin */}
                <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 pt-1">
                  <span className="material-symbols-outlined text-xs">calendar_today</span>
                  Ngày gửi: {noti.date}
                </div>
              </div>

              {/* Nút tác vụ Xóa nhanh khi Hover vào dòng */}
              <button
                onClick={(e) => handleDeleteItem(noti.id, e)}
                className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0 self-center"
                title="Xóa thông báo này"
              >
                <span className="material-symbols-outlined text-base">delete</span>
              </button>
            </div>
          ))
        ) : (
          /* TRẠNG THÁI TRỐNG RỖNG (EMPTY STATE) */
          <div className="bg-white rounded-2xl border border-slate-200/60 py-16 text-center text-slate-400 space-y-3 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto shadow-inner text-slate-300">
              <span className="material-symbols-outlined text-4xl">notifications_off</span>
            </div>
            <div>
              <p className="text-sm font-black text-slate-700">Không tìm thấy thông báo nào</p>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Hộp thư của bạn hiện tại chưa nhận được thông tin mới tương ứng.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default PartnerNotifications;