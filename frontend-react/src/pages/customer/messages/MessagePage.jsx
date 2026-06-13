import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── MOCK DATA PHÂN CHIA THÀNH 3 TAB RÕ RÀNG ─────────────────────────────────────────
const MOCK_CONVERSATIONS = [
  // === TAB 1: ĐƠN ĐANG CHẠY (ACTIVE) ===
  {
    id: 'chat_active_1',
    type: 'booking', // Loại chat theo đơn
    bookingCode: 'CLN-20240001',
    serviceTitle: 'Vệ sinh nhà cửa định kỳ',
    status: 'confirmed',
    statusLabel: 'Đã xác nhận',
    staff: {
      id: 'staff_ha', // Thêm ID để định danh nhân viên
      name: 'Nguyễn Thu Hà',
      avatar: 'https://i.pravatar.cc/150?u=ha',
      isOnline: true,
      role: 'Nhân viên phụ trách đơn',
      phone: '0901234567' // Thêm số điện thoại để phục vụ tính năng gọi điện
    },
    lastMessage: 'Em sẽ đến đúng giờ như trong lịch đặt nhé.',
    lastMessageTime: '14:32',
    unreadCount: 0,
    isLocked: false,
    messages: [
      { id: 1, sender: 'staff', text: 'Xin chào anh/chị, em đã nhận được lịch hẹn dọn dẹp vào ngày mai rồi ạ!', time: '14:30' },
      { id: 2, sender: 'customer', text: 'Chào Hà nhé. Nhà mình có nuôi một chú chó nhỏ hơi nhát người, lúc bạn đến cứ bấm chuông để mình xích bé lại rồi hãy vào nha.', time: '14:31' },
      { id: 3, sender: 'staff', text: 'Dạ vâng ạ, em cảm ơn chị đã lưu ý trước cho em thông tin này.', time: '14:31' },
      { id: 4, sender: 'staff', text: 'Em sẽ chuẩn bị đầy đủ máy hút bụi và các chất tẩy rửa chuyên dụng mang qua luôn.', time: '14:32' },
      { id: 5, sender: 'customer', text: 'Ok em, các phòng ngủ thì chỉ cần lau bụi bề mặt thôi không cần dọn kỹ quá đâu, tập trung dọn phòng khách với bếp giúp chị là được.', time: '14:32' },
      { id: 6, sender: 'staff', text: 'Dạ em ghi nhận rồi ạ. Em sẽ đến đúng giờ như trong lịch đặt nhé.', time: '14:32' }
    ]
  },
  {
    id: 'chat_active_2',
    type: 'booking',
    bookingCode: 'CLN-20240002',
    serviceTitle: 'Tổng vệ sinh chuyên sâu',
    status: 'active',
    statusLabel: 'Đang thực hiện',
    staff: {
      id: 'staff_team04',
      name: 'Đội CleanTrust Team 04',
      avatar: 'https://i.pravatar.cc/150?u=team04',
      isOnline: true,
      role: 'Đội ngũ thực hiện',
      phone: '0907654321'
    },
    lastMessage: 'Dạ em đã nhận được thông tin/hình ảnh của mình rồi ạ!',
    lastMessageTime: 'Hôm qua',
    unreadCount: 2,
    isLocked: false,
    messages: [
      { id: 1, sender: 'customer', text: 'Đội ơi, lát nữa dọn dẹp nhớ lau kỹ phần dầu mỡ bám trên máy hút mùi bếp giúp mình với nhé, chỗ đó bám lâu ngày nên hơi cứng đầu.', time: 'Hôm qua 09:15' },
      { id: 2, sender: 'staff', text: 'Dạ bên em nhận được yêu cầu rồi ạ. Team có mang theo nước tẩy đa năng chuyên dụng chuyên trị mảng bám dầu mỡ nên anh cứ yên tâm nhé.', time: 'Hôm qua 09:20' },
      { id: 3, sender: 'customer', text: 'Gửi trước cho team ảnh hiện trạng khu vực ban công, chỗ này hơi nhiều lá cây khô tích tụ.', time: 'Hôm qua 09:22', images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=500'] },
      { id: 4, sender: 'staff', text: 'Dạ em đã nhận được thông tin/hình ảnh của mình rồi ạ!', time: 'Hôm qua 09:25' }
    ]
  },

  // === TAB 2: CHAT VỚI NHÂN VIÊN (STAFF TRỰC TIẾP/YÊU THÍCH) ===
  {
    id: 'chat_staff_1',
    type: 'direct', 
    bookingCode: null,
    serviceTitle: 'Nhân viên yêu thích của bạn',
    status: 'direct',
    statusLabel: 'Trò chuyện',
    staff: {
      id: 'staff_mai',
      name: 'Trần Thị Mai',
      avatar: 'https://i.pravatar.cc/150?u=mai',
      isOnline: true,
      role: 'Đối tác CleanTrust'
    },
    lastMessage: 'Tuần sau chị cần dọn cứ nhắn em trước nha.',
    lastMessageTime: 'Thứ Ba',
    unreadCount: 0,
    isLocked: false,
    messages: [
      { id: 1, sender: 'customer', text: 'Chào Mai, dạo này em có hay nhận lịch khu vực Quận 7 không em?', time: 'Thứ Ba 10:00' },
      { id: 2, sender: 'staff', text: 'Dạ em chào chị! Em vẫn nhận đều lịch bên Quận 7 đó chị ơi. Có việc gì không chị?', time: 'Thứ Ba 10:02' },
      { id: 3, sender: 'customer', text: 'À tại nhà chị tuần sau định tổng vệ sinh lại để đón người thân ở quê lên chơi, muốn book em làm cho an tâm vì em làm sạch sẽ quá.', time: 'Thứ Ba 10:05' },
      { id: 4, sender: 'staff', text: 'Ôi em cảm ơn chị nhiều vì đã tin tưởng em ạ! Chị dự định làm vào ngày nào thế chị yêu?', time: 'Thứ Ba 10:06' },
      { id: 5, sender: 'customer', text: 'Chắc tầm sáng Thứ Năm tuần sau nha em, khoảng 4 tiếng á.', time: 'Thứ Ba 10:08' },
      { id: 6, sender: 'staff', text: 'Dạ Thứ Năm sáng em trống lịch nè. Lúc nào chị lên app đặt đơn, chị cứ chọn mục "Chọn nhân viên đã làm" rồi tích vào tên em là hệ thống tự giao qua em nha.', time: 'Thứ Ba 10:10' },
      { id: 7, sender: 'customer', text: 'Ok em nhé, để tối nay chị vào app lên lịch luôn cho chắc ăn.', time: 'Thứ Ba 10:12' },
      { id: 8, sender: 'staff', text: 'Dạ vâng ạ, tuần sau chị cần dọn cứ nhắn em trước nha. Chúc chị một ngày vui vẻ!', time: 'Thứ Ba 10:13' }
    ]
  },
  {
    id: 'chat_staff_2',
    type: 'direct',
    bookingCode: null,
    serviceTitle: 'Nhân viên hỗ trợ tư vấn',
    status: 'direct',
    statusLabel: 'Tư vấn viên',
    staff: {
      id: 'staff_cskh',
      name: 'Tổng đài viên Minh Thư',
      avatar: 'https://i.pravatar.cc/150?u=thu',
      isOnline: false,
      role: 'Chăm sóc khách hàng'
    },
    lastMessage: 'Dạ yêu cầu hoàn tiền của anh đã được duyệt...',
    lastMessageTime: '25/05',
    unreadCount: 0,
    isLocked: false,
    messages: [
      { id: 1, sender: 'customer', text: 'Cho mình hỏi đơn lịch mã CLN-20230899 mình bấm hủy trước 24h sao chưa thấy tiền hoàn về ví CleanTrust vậy bạn?', time: '25/05 15:00' },
      { id: 2, sender: 'staff', text: 'Dạ CleanTrust xin chào anh ạ. Anh vui lòng đợi em vài phút để em kiểm tra lại trên hệ thống kế toán nhé.', time: '25/05 15:02' },
      { id: 3, sender: 'staff', text: 'Dạ em kiểm tra thấy hệ thống đã xử lý xong rồi ạ. Do hôm nay là Chủ Nhật nên dòng tiền ngân hàng có thể bị chậm một chút.', time: '25/05 15:05' },
      { id: 4, sender: 'staff', text: 'Dạ yêu cầu hoàn tiền của anh đã được duyệt thành công, tiền sẽ tinh tinh vào tài khoản của anh trong vòng 1-2 tiếng nữa ạ.', time: '25/05 15:06' }
    ]
  },

  // === TAB 3: ĐƠN CŨ ĐÃ HOÀN THÀNH / HỦY (HISTORY) ===
  {
    id: 'chat_history_1',
    type: 'booking',
    bookingCode: 'CLN-20230988',
    serviceTitle: 'Vệ sinh văn phòng',
    status: 'completed',
    statusLabel: 'Đã hoàn thành',
    staff: {
      id: 'staff_hong',
      name: 'Lê Thị Hồng',
      avatar: 'https://i.pravatar.cc/150?u=hong',
      isOnline: false,
      role: 'Nhân viên cũ'
    },
    lastMessage: 'Cảm ơn anh/chị đã tin tưởng dịch vụ ạ!',
    lastMessageTime: '20/05/2024',
    unreadCount: 0,
    isLocked: true,
    messages: [
      { id: 1, sender: 'customer', text: 'Nhà sạch lắm chị ạ, mấy cái kính phòng tắm chà hết cặn canxi nhìn sáng sủa hẳn ra. Cảm ơn chị nhiều nhé.', time: '20/05/2024 17:00' },
      { id: 2, sender: 'staff', text: 'Cảm ơn anh/chị đã tin tưởng dịch vụ ạ! Lần sau có nhu cầu dọn dẹp văn phòng hay nhà cửa anh chị lại ủng hộ công ty em tiếp nha.', time: '20/05/2024 17:05' }
    ]
  }
];

const MessagePage = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState('chat_active_1');
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImageModal, setPreviewImageModal] = useState(null);
  
  // Quản lý 3 tab: 'active' (Theo đơn đặt), 'staff' (Nhân viên), 'history' (Đơn cũ)
  const [currentTab, setCurrentTab] = useState('active');

  // State lưu danh sách ID nhân viên đã được khách hàng thả tim/yêu thích
  const [favoriteStaffIds, setFavoriteStaffIds] = useState(['staff_mai']);

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Lọc dữ liệu hiển thị theo Tab được bấm
  const filteredConversations = conversations.filter(chat => {
    if (currentTab === 'active') return chat.type === 'booking' && (chat.status === 'confirmed' || chat.status === 'active');
    if (currentTab === 'staff') return chat.type === 'direct';
    return chat.status === 'completed' || chat.status === 'cancelled';
  });

  // Lấy dữ liệu chat đang active
  const activeChat = conversations.find(c => c.id === activeChatId) || filteredConversations[0] || conversations[0];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChatId, conversations]);

  // Tự động chuyển đổi active chat nếu chuyển tab mà chat cũ không thuộc tab đó
  useEffect(() => {
    if (filteredConversations.length > 0 && !filteredConversations.some(c => c.id === activeChatId)) {
      setActiveChatId(filteredConversations[0].id);
    }
  }, [currentTab, activeChatId, filteredConversations]);

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (activeChat.isLocked) return;
    if (!inputMessage.trim() && selectedImages.length === 0) return;

    const newMsg = {
      id: Date.now(),
      sender: 'customer',
      text: inputMessage,
      images: selectedImages.map(img => img.url),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setConversations(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          lastMessage: inputMessage || '[Hình ảnh]',
          lastMessageTime: 'Vừa xong',
          messages: [...chat.messages, newMsg]
        };
      }
      return chat;
    }));

    setInputMessage('');
    setSelectedImages([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Hàm xử lý bật/tắt yêu thích nhân viên
  const toggleFavoriteStaff = (staffId) => {
    if (!staffId) return;
    setFavoriteStaffIds(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId) 
        : [...prev, staffId]
    );
  };

  return (
    <div className="h-screen w-screen max-w-[100vw] -mx-[calc((100vw-100%)/2)] bg-slate-50 flex overflow-hidden border-t border-slate-200">
      
      {/* ─── CỘT TRÁI: DANH SÁCH CHAT TRỰC QUAN (360px) ─── */}
      <div className="w-full md:w-[360px] border-r border-slate-200 flex flex-col bg-white shrink-0">
        <div className="p-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-base font-black text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1a368d] text-xl">forum</span>
              Hộp thư CleanTrust
            </h1>
            <button 
              onClick={() => navigate('/')}
              className="text-xs font-bold text-slate-500 hover:text-[#1a368d] flex items-center gap-0.5 bg-slate-100 hover:bg-blue-50 px-2.5 py-1.5 rounded-xl transition-all"
            >
              <span className="material-symbols-outlined text-sm">home</span>
              Trang chủ
            </button>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl text-[11px] font-bold gap-0.5">
            <button 
              onClick={() => setCurrentTab('active')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${currentTab === 'active' ? 'bg-white text-[#1a368d] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Theo đơn đặt
            </button>
            <button 
              onClick={() => setCurrentTab('staff')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${currentTab === 'staff' ? 'bg-white text-[#1a368d] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Nhân viên
            </button>
            <button 
              onClick={() => setCurrentTab('history')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${currentTab === 'history' ? 'bg-white text-[#1a368d] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Đơn cũ
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400 font-medium">
              Không có cuộc trò chuyện nào ở mục này.
            </div>
          ) : (
            filteredConversations.map((chat) => {
              const isActive = chat.id === activeChatId;
              const isFavorite = favoriteStaffIds.includes(chat.staff.id);

              return (
                <button
                  key={chat.id}
                  onClick={() => {
                    setActiveChatId(chat.id);
                    setConversations(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
                  }}
                  className={`w-full text-left p-3 rounded-xl flex gap-3 transition-all border ${
                    isActive ? 'bg-blue-50/70 border-blue-200/60 shadow-sm' : 'hover:bg-slate-50 border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img src={chat.staff.avatar} alt={chat.staff.name} className="w-11 h-11 rounded-full object-cover border border-slate-100" />
                    {chat.staff.isOnline && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="font-bold text-xs text-slate-800 truncate">{chat.staff.name}</p>
                        {isFavorite && (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="currentColor" 
                            viewBox="0 0 24 24" 
                            className="w-3.5 h-3.5 text-rose-500 shrink-0 animate-in zoom-in duration-200"
                            title="Nhân viên yêu thích"
                          >
                            <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{chat.lastMessageTime}</span>
                    </div>
                    {chat.bookingCode ? (
                      <p className="text-[10px] font-bold text-[#1a368d] mb-1">MÃ ĐƠN: {chat.bookingCode}</p>
                    ) : (
                      <p className="text-[10px] font-bold text-emerald-600 mb-1">CHAT TRỰC TIẾP</p>
                    )}
                    <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'text-slate-900 font-black' : 'text-slate-400 font-medium'}`}>
                      {chat.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ─── CỘT PHẢI: KHUNG CHAT FULL CHI TIẾT ─── */}
      <div className="hidden md:flex flex-1 flex-col bg-[#f8fafc] h-full">
        {activeChat ? (
          <>
            {/* Header phòng chat */}
            <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <img src={activeChat.staff.avatar} alt={activeChat.staff.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-sm text-slate-800">{activeChat.staff.name}</h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${
                      activeChat.status === 'active' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                      activeChat.status === 'confirmed' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                      activeChat.status === 'direct' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                      'bg-slate-100 border-slate-200 text-slate-500'
                    }`} >
                      {activeChat.statusLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {activeChat.staff.role} {activeChat.bookingCode && `· Mã đơn: ${activeChat.bookingCode}`}
                  </p>
                </div>
              </div>

              {/* KHU VỰC CÁC NÚT THAO TÁC Ở HEADER CHAT */}
              <div className="flex items-center gap-2">
                {/* 👉 ĐÃ SỬA: Chỉ hiển thị nút gọi điện thoại khi ở tab "Theo đơn đặt" và đơn chưa bị khóa */}
                {currentTab === 'active' && !activeChat.isLocked && activeChat.staff.phone && (
                  <a
                    href={`tel:${activeChat.staff.phone}`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-200 active:scale-95"
                    title={`Gọi điện cho ${activeChat.staff.name}`}
                  >
                    <span className="material-symbols-outlined text-base">call</span>
                    <span>Gọi điện</span>
                  </a>
                )}

                {/* Nút bấm Chọn nhân viên yêu thích (Hình Trái Tim) */}
                {activeChat.staff.id && activeChat.staff.id !== 'staff_cskh' && (
                  <button
                    onClick={() => toggleFavoriteStaff(activeChat.staff.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 transform active:scale-95 border ${
                      favoriteStaffIds.includes(activeChat.staff.id)
                        ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm shadow-rose-100'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100'
                    }`}
                    title={favoriteStaffIds.includes(activeChat.staff.id) ? "Xóa khỏi danh sách yêu thích" : "Thêm vào nhân viên yêu thích"}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill={favoriteStaffIds.includes(activeChat.staff.id) ? "currentColor" : "none"} 
                      viewBox="0 0 24 24" 
                      strokeWidth={1.8} 
                      stroke="currentColor" 
                      className={`w-4 h-4 transition-transform duration-300 ${favoriteStaffIds.includes(activeChat.staff.id) ? 'scale-110' : ''}`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    <span>
                      {favoriteStaffIds.includes(activeChat.staff.id) ? 'Đã yêu thích' : 'Yêu thích nhân viên'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Nội dung đoạn chat hội thoại */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 flex flex-col bg-[#f4f6f9]">
              {activeChat.messages.map((msg) => {
                const isMe = msg.sender === 'customer';
                return (
                  <div key={msg.id} className={`flex flex-col max-w-[65%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                    <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-sm break-words whitespace-pre-wrap ${
                      isMe ? 'bg-[#1a368d] text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-200/50'
                    }`}>
                      {msg.text && <div>{msg.text}</div>}
                      
                      {msg.images && msg.images.length > 0 && (
                        <div
                          className={`mt-2 grid gap-1 ${msg.images.length === 1 ? 'grid-cols-1' : msg.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} ${isMe ? 'ml-auto' : 'mr-auto'}`}
                          style={{ width: msg.images.length === 1 ? '180px' : msg.images.length === 2 ? '220px' : '240px' }}
                        >
                          {msg.images.map((imgUrl, i) => (
                            <img 
                              key={i} 
                              src={imgUrl} 
                              alt="Sent preview content" 
                              onClick={() => setPreviewImageModal(imgUrl)}
                              className="rounded-lg w-full aspect-square object-cover cursor-zoom-in border border-slate-400 shadow-sm hover:opacity-90 transition-all"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1 tracking-wider">{msg.time}</span>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* CHÂN TRANG GỬI TIN NHẮN */}
            <div className="bg-white border-t border-slate-200/80 flex flex-col shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
              {activeChat.isLocked ? (
                <div className="p-4 bg-slate-50 text-slate-500 text-xs font-bold text-center flex items-center justify-center gap-2 border-b border-slate-100">
                  <span className="material-symbols-outlined text-base text-slate-400">lock</span>
                  Đơn lịch đã hoàn thành. Cuộc hội thoại này đã tự động đóng.
                </div>
              ) : (
                <>
                  {selectedImages.length > 0 && (
                    <div className="p-4 bg-slate-50/80 border-b border-dashed border-slate-200/60 flex gap-3 overflow-x-auto items-center animate-in fade-in slide-in-from-bottom-2 duration-200">
                      {selectedImages.map((img) => (
                        <div key={img.id} className="relative w-16 h-16 shrink-0 group">
                          <img 
                            src={img.url} 
                            alt="Preview before upload" 
                            onClick={() => setPreviewImageModal(img.url)}
                            className="w-16 h-16 object-cover rounded-xl border border-blue-500/30 shadow-md shadow-blue-900/5 transition-all duration-300 group-hover:brightness-90 group-hover:scale-[1.03] cursor-zoom-in"
                          />
                          <button
                            type="button"
                            onClick={() => setSelectedImages(prev => prev.filter(item => item.id !== img.id))}
                            className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-white hover:bg-rose-600 active:scale-90 transition-all z-10"
                          >
                            <span className="material-symbols-outlined text-[10px] font-black">close</span>
                          </button>
                        </div>
                      ))}
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1 select-none animate-pulse">
                        Sẵn sàng gửi...
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSendMessage} className="p-3 flex items-end gap-2 bg-white">
                    <input 
                      type="file" 
                      id="page-image-input" 
                      accept="image/*" 
                      multiple 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files) {
                          const filesArray = Array.from(e.target.files).map(file => ({
                            id: Math.random().toString(36).substr(2, 9),
                            file: file,
                            url: URL.createObjectURL(file)
                          }));
                          setSelectedImages(prev => [...prev, ...filesArray]);
                          e.target.value = ''; 
                        }
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => document.getElementById('page-image-input').click()}
                      className="w-9 h-9 rounded-xl text-slate-500 hover:text-[#1a368d] hover:bg-slate-100 flex items-center justify-center transition-all duration-200 shrink-0 mb-0.5 active:scale-[0.93]"
                      title="Chọn hình ảnh"
                    >
                      <span className="material-symbols-outlined text-[22px]">image</span>
                    </button>

                    <textarea 
                      ref={textareaRef}
                      value={inputMessage}
                      onChange={(e) => {
                        setInputMessage(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Nhập tin nhắn để trao đổi..."
                      rows={1}
                      className="flex-1 bg-slate-100/90 border border-transparent focus:border-blue-200/80 focus:bg-white outline-none rounded-xl py-2 px-4 text-xs font-medium text-slate-800 transition-all resize-none max-h-[100px] min-h-[36px] overflow-y-auto leading-relaxed placeholder:text-slate-400"
                    />
                    
                    <button 
                      type="submit" 
                      disabled={!inputMessage.trim() && selectedImages.length === 0}
                      className="w-9 h-9 bg-[#1a368d] disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl flex items-center justify-center active:scale-[0.93] transition-all shadow-md shadow-blue-900/10 shrink-0 mb-0.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">send</span>
                    </button>
                  </form>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
            <span className="material-symbols-outlined text-4xl">chat_bubble</span>
            <p className="text-xs font-medium">Chọn một cuộc trò chuyện để xem nội dung</p>
          </div>
        )}
      </div>

      {/* Modal Lightbox */}
      {previewImageModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in" onClick={() => setPreviewImageModal(null)}>
          <button className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/60 w-10 h-10 rounded-full flex items-center justify-center transition-colors" onClick={() => setPreviewImageModal(null)}>
            <span className="material-symbols-outlined">close</span>
          </button>
          <img src={previewImageModal} alt="Enlarged view" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl transition-transform" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default MessagePage;