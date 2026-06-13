import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── MOCK DATA CHO PHÍA ĐỐI TÁC (PARTNER) ──────────────────────────────────────────
const MOCK_CUSTOMER_CONVERSATIONS = [
  // === TAB 1: ĐƠN HIỆN TẠI (ACTIVE) ===
  {
    id: 'chat_active_1',
    type: 'booking',
    bookingCode: 'CLN-20240001',
    serviceTitle: 'Vệ sinh nhà cửa định kỳ',
    status: 'confirmed',
    statusLabel: 'Đã xác nhận',
    customer: {
      id: 'cust_01',
      name: 'Chị Lan Anh (Quận 2)',
      avatar: 'https://i.pravatar.cc/150?u=lananh',
      isOnline: true,
      address: 'Chung cư Vista Verde, Thạnh Mỹ Lợi, Quận 2',
      phone: '0912345678'
    },
    lastMessage: 'Em sẽ đến đúng giờ như trong lịch đặt nhé.',
    lastMessageTime: '14:32',
    unreadCount: 0,
    isLocked: false,
    messages: [
      { id: 1, sender: 'partner', text: 'Xin chào anh/chị, em đã nhận được lịch hẹn dọn dẹp vào ngày mai rồi ạ!', time: '14:30' },
      { id: 2, sender: 'customer', text: 'Chào Hà nhé. Nhà mình có nuôi một chú chó nhỏ hơi nhát người, lúc bạn đến cứ bấm chuông để mình xích bé lại rồi hãy vào nha.', time: '14:31' },
      { id: 3, sender: 'partner', text: 'Dạ vâng ạ, em cảm ơn chị đã lưu ý trước cho em thông tin này.', time: '14:31' },
      { id: 4, sender: 'partner', text: 'Em sẽ chuẩn bị đầy đủ máy hút bụi và các chất tẩy rửa chuyên dụng mang qua luôn.', time: '14:32' },
      { id: 5, sender: 'customer', text: 'Ok em, các phòng ngủ thì chỉ cần lau bụi bề mặt thôi không cần dọn kỹ quá đâu, tập trung dọn phòng khách với bếp giúp chị là được.', time: '14:32' },
      { id: 6, sender: 'partner', text: 'Dạ em ghi nhận rồi ạ. Em sẽ đến đúng giờ như trong lịch đặt nhé.', time: '14:32' }
    ]
  },

  // === TAB 2: CHAT TRỰC TIẾP (DIRECT) ===
  {
    id: 'chat_direct_1',
    type: 'direct',
    bookingCode: null,
    serviceTitle: 'Khách hàng liên hệ trực tiếp',
    status: 'direct',
    statusLabel: 'Chat trực tiếp',
    customer: {
      id: 'cust_02',
      name: 'Cô Minh Tuyết (Quận 7)',
      avatar: 'https://i.pravatar.cc/150?u=tuyet',
      isOnline: true,
      address: '122 Nguyễn Thị Thập, Tân Phong, Quận 7',
      phone: '0988888888'
    },
    lastMessage: 'Tuần sau chị cần dọn cứ nhắn em trước nha.',
    lastMessageTime: 'Thứ Ba',
    unreadCount: 0,
    isLocked: false,
    messages: [
      { id: 1, sender: 'customer', text: 'Chào Hà, dạo này em có hay nhận lịch khu vực Quận 7 không em?', time: 'Thứ Ba 10:00' },
      { id: 2, sender: 'partner', text: 'Dạ em chào chị! Em vẫn nhận đều lịch bên Quận 7 đó chị ơi. Có việc gì không chị?', time: 'Thứ Ba 10:02' },
      { id: 3, sender: 'customer', text: 'À tại nhà chị tuần sau định tổng vệ sinh lại để đón người thân ở quê lên chơi, muốn book em làm cho an tâm vì em làm sạch sẽ quá.', time: 'Thứ Ba 10:05' },
      { id: 4, sender: 'partner', text: 'Ôi em cảm ơn chị nhiều vì đã tin tưởng em ạ! Chị dự định làm vào ngày nào thế chị yêu?', time: 'Thứ Ba 10:06' },
      { id: 5, sender: 'customer', text: 'Chắc tầm sáng Thứ Năm tuần sau nha em, khoảng 4 tiếng á.', time: 'Thứ Ba 10:08' },
      { id: 6, sender: 'partner', text: 'Dạ Thứ Năm sáng em trống lịch nè. Lúc nào chị lên app đặt đơn, chị cứ chọn mục "Chọn nhân viên đã làm" rồi tích vào tên em là hệ thống tự giao qua em nha.', time: 'Thứ Ba 10:10' },
      { id: 7, sender: 'customer', text: 'Ok em nhé, để tối nay chị vào app lên lịch luôn cho chắc ăn.', time: 'Thứ Ba 10:12' },
      { id: 8, sender: 'partner', text: 'Dạ vâng ạ, tuần sau chị cần dọn cứ nhắn em trước nha. Chúc chị một ngày vui vẻ!', time: 'Thứ Ba 10:13' }
    ]
  },

  // === TAB 3: ĐƠN CŨ / LỊCH SỬ (HISTORY) ===
  {
    id: 'chat_history_1',
    type: 'booking',
    bookingCode: 'CLN-20230555',
    serviceTitle: 'Tổng vệ sinh chuyên sâu',
    status: 'completed',
    statusLabel: 'Đã hoàn thành',
    customer: {
      id: 'cust_03',
      name: 'Anh Hoàng Nam',
      avatar: 'https://i.pravatar.cc/150?u=nam',
      isOnline: false,
      address: 'Số 45 Đường số 8, Bình An, Quận 2',
      phone: '0909090909'
    },
    lastMessage: 'Cảm ơn anh đã tin tưởng em ạ!',
    lastMessageTime: '01/06',
    unreadCount: 0,
    isLocked: true,
    messages: [
      { id: 1, sender: 'customer', text: 'Nghiệm thu nhà sạch sẽ lắm em nhé, nhất là mấy cái kính ban công lau bóng loáng.', time: '01/06 12:00' },
      { id: 2, sender: 'partner', text: 'Dạ em cảm ơn anh đã tin tưởng em ạ! Lần sau cần dọn anh lại đặt trên app ủng hộ em tiếp nha.', time: '01/06 12:05' }
    ]
  }
];

// Phím tắt nhắn tin nhanh cho Đối tác
const QUICK_REPLIES = [
  "Dạ, em đang trên đường đến rồi ạ!",
  "Em đã đến nơi rồi ạ, anh/chị ra mở cửa giúp em nhé.",
  "Dạ em đã ghi nhận yêu cầu của mình rồi ạ.",
  "Em đã hoàn thành xong công việc dọn dẹp, mời anh/chị kiểm tra ạ."
];

const PartnerMessagePage = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState(MOCK_CUSTOMER_CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState('chat_active_1');
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImageModal, setPreviewImageModal] = useState(null);

  // --- FIX: State quản lý mobile view (danh sách vs chi tiết chat) ---
  const [showChatDetail, setShowChatDetail] = useState(false);

  // Quản lý 3 tab: 'current' (Đơn hiện tại), 'direct' (Chat trực tiếp/Khách tự nhắn), 'history' (Đơn cũ)
  const [currentTab, setCurrentTab] = useState('current');

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Lọc dữ liệu hiển thị theo Tab
  const filteredConversations = conversations.filter(chat => {
    if (currentTab === 'current') return chat.type === 'booking' && (chat.status === 'confirmed' || chat.status === 'active');
    if (currentTab === 'direct') return chat.type === 'direct';
    return chat.status === 'completed' || chat.status === 'cancelled';
  });

  // Lấy dữ liệu chat đang active
  const activeChat = conversations.find(c => c.id === activeChatId) || filteredConversations[0] || conversations[0];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChatId, conversations]);

  useEffect(() => {
    if (filteredConversations.length > 0 && !filteredConversations.some(c => c.id === activeChatId)) {
      setActiveChatId(filteredConversations[0].id);
    }
  }, [currentTab, activeChatId, filteredConversations]);

  const handleSendMessage = (textToSend = '') => {
    if (activeChat.isLocked) return;

    const finalTxt = textToSend || inputMessage;
    if (!finalTxt.trim() && selectedImages.length === 0) return;

    const newMsg = {
      id: Date.now(),
      sender: 'partner',
      text: finalTxt,
      images: selectedImages.map(img => img.url),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setConversations(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          lastMessage: finalTxt || '[Hình ảnh]',
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

  return (
    <div className="h-screen w-screen max-w-[100vw] -mx-[calc((100vw-100%)/2)] bg-slate-50 flex overflow-hidden border-t border-slate-200">

      {/* ─── CỘT TRÁI: DANH SÁCH KHÁCH HÀNG ─── */}
      {/* FIX: Ẩn/hiện đúng cách trên mobile bằng cách dùng state showChatDetail */}
      <div className={`
        ${showChatDetail ? 'hidden' : 'flex'} md:flex
        w-full md:w-[360px] border-r border-slate-200 flex-col bg-white shrink-0
      `}>
        <div className="p-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-base font-black text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-xl">chat_bubble</span>
              Hộp thư Đối tác
            </h1>
            <button
              onClick={() => navigate('/partner/dashboard')}
              className="text-xs font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-0.5 bg-slate-100 hover:bg-emerald-50 px-2.5 py-1.5 rounded-xl transition-all"
            >
              <span className="material-symbols-outlined text-sm">dashboard</span>
              Bàn làm việc
            </button>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl text-[11px] font-bold gap-0.5">
            <button
              onClick={() => setCurrentTab('current')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${currentTab === 'current' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Đơn hiện tại
            </button>
            <button
              onClick={() => setCurrentTab('direct')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${currentTab === 'direct' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Chat trực tiếp
            </button>
            <button
              onClick={() => setCurrentTab('history')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${currentTab === 'history' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Đơn cũ
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400 font-medium">
              Không có cuộc hội thoại khách hàng nào.
            </div>
          ) : (
            filteredConversations.map((chat) => {
              const isActive = chat.id === activeChatId;

              return (
                <button
                  key={chat.id}
                  onClick={() => {
                    setActiveChatId(chat.id);
                    setConversations(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
                    // FIX: Trên mobile, chuyển sang màn hình chi tiết chat
                    setShowChatDetail(true);
                  }}
                  className={`w-full text-left p-3 rounded-xl flex gap-3 transition-all border ${
                    isActive ? 'bg-emerald-50/40 border-emerald-200/50 shadow-sm' : 'hover:bg-slate-50 border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img src={chat.customer.avatar} alt={chat.customer.name} className="w-11 h-11 rounded-full object-cover border border-slate-100" />
                    {chat.customer.isOnline && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className="font-bold text-xs text-slate-800 truncate">{chat.customer.name}</p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{chat.lastMessageTime}</span>
                    </div>
                    {chat.bookingCode ? (
                      <p className="text-[10px] font-bold text-emerald-700 mb-1">MÃ ĐƠN: {chat.bookingCode}</p>
                    ) : (
                      <p className="text-[10px] font-bold text-blue-600 mb-1">CHAT TRỰC TIẾP</p>
                    )}
                    <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'text-slate-900 font-black' : 'text-slate-400 font-medium'}`}>
                      {chat.sender === 'partner' ? 'Bạn: ' : ''}{chat.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ─── CỘT PHẢI: CHI TIẾT ĐOẠN CHAT VỚI KHÁCH HÀNG ─── */}
      {/* FIX: Trên mobile hiện khi showChatDetail=true, trên desktop luôn hiện */}
      <div className={`
        ${showChatDetail ? 'flex' : 'hidden'} md:flex
        flex-1 flex-col bg-[#f8fafc] h-full
      `}>
        {activeChat ? (
          <>
            {/* Header phòng chat */}
            <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                {/* FIX: Nút quay lại danh sách trên mobile */}
                <button
                  onClick={() => setShowChatDetail(false)}
                  className="md:hidden flex items-center justify-center w-8 h-8 rounded-xl text-slate-500 hover:bg-slate-100 transition-all shrink-0"
                >
                  <span className="material-symbols-outlined text-xl">arrow_back</span>
                </button>

                <img src={activeChat.customer.avatar} alt={activeChat.customer.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-sm text-slate-800">{activeChat.customer.name}</h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${
                      activeChat.status === 'active' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                      activeChat.status === 'confirmed' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                      activeChat.status === 'direct' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                      'bg-slate-100 border-slate-200 text-slate-500'
                    }`}>
                      {activeChat.statusLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5 truncate max-w-[200px] md:max-w-[400px]" title={activeChat.customer.address}>
                    <span className="material-symbols-outlined text-xs inline-block align-middle mr-0.5">location_on</span>
                    {activeChat.customer.address}
                  </p>
                </div>
              </div>

              {/* KHU VỰC CÁC NÚT THAO TÁC Ở HEADER */}
              <div className="flex items-center gap-2">
                {activeChat.bookingCode && !activeChat.isLocked && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeChat.customer.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-200"
                  >
                    <span className="material-symbols-outlined text-base">map</span>
                    <span className="hidden sm:inline">Đường đi</span>
                  </a>
                )}

                {!activeChat.isLocked && (
                  <a
                    href={`tel:${activeChat.customer.phone}`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-600 rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-base">call</span>
                    <span className="hidden sm:inline">Gọi khách</span>
                  </a>
                )}
              </div>
            </div>

            {/* Nội dung đoạn chat hội thoại */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 flex flex-col bg-[#f4f6f9]">
              {activeChat.messages.map((msg) => {
                const isMe = msg.sender === 'partner';
                return (
                  <div key={msg.id} className={`flex flex-col max-w-[75%] md:max-w-[65%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                    <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-sm break-words whitespace-pre-wrap ${
                      isMe ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-200/50'
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
                              alt="Sent content"
                              onClick={() => setPreviewImageModal(imgUrl)}
                              className="rounded-lg w-full aspect-square object-cover cursor-zoom-in border border-slate-200 shadow-sm hover:opacity-90 transition-all"
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

            {/* CHÂN TRANG GỬI TIN NHẮN VÀ TÍNH NĂNG TRẢ LỜI NHANH */}
            <div className="bg-white border-t border-slate-200/80 flex flex-col shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
              {activeChat.isLocked ? (
                <div className="p-4 bg-slate-50 text-slate-500 text-xs font-bold text-center flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-base text-slate-400">lock</span>
                  Đơn lịch này đã kết thúc. Cuộc hội thoại đã đóng tự động.
                </div>
              ) : (
                <>
                  {/* THANH TRẢ LỜI NHANH (QUICK REPLIES) */}
                  <div className="px-4 pt-2 pb-1 bg-slate-50 flex gap-2 overflow-x-auto border-b border-slate-100 no-scrollbar">
                    {QUICK_REPLIES.map((reply, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSendMessage(reply)}
                        className="bg-white text-[11px] text-slate-600 hover:text-emerald-700 font-semibold px-3 py-1 rounded-full border border-slate-200 hover:border-emerald-400 transition-all whitespace-nowrap shrink-0 shadow-sm"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>

                  {/* Xem trước ảnh chuẩn bị gửi */}
                  {selectedImages.length > 0 && (
                    <div className="p-4 bg-slate-50/80 border-b border-dashed border-slate-200/60 flex gap-3 overflow-x-auto items-center animate-in fade-in slide-in-from-bottom-2 duration-200">
                      {selectedImages.map((img) => (
                        <div key={img.id} className="relative w-16 h-16 shrink-0 group">
                          <img
                            src={img.url}
                            alt="Preview before upload"
                            onClick={() => setPreviewImageModal(img.url)}
                            className="w-16 h-16 object-cover rounded-xl border border-emerald-500/30 shadow-md cursor-zoom-in hover:opacity-80 transition-all duration-200"
                          />
                          <button
                            type="button"
                            onClick={() => setSelectedImages(prev => prev.filter(item => item.id !== img.id))}
                            className="absolute -top-1.5 -right-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-white transition-colors"
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

                  {/* Form Chat của Đối tác */}
                  <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-3 flex items-end gap-2 bg-white">
                    <input
                      type="file"
                      id="partner-image-input"
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
                      onClick={() => document.getElementById('partner-image-input').click()}
                      className="w-9 h-9 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-slate-100 flex items-center justify-center transition-all shrink-0 mb-0.5 active:scale-[0.93]"
                      title="Gửi hình ảnh báo cáo hiện trạng dọn dẹp"
                    >
                      <span className="material-symbols-outlined text-[22px]">photo_camera</span>
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
                          handleSendMessage();
                        }
                      }}
                      placeholder="Trao đổi thông tin với khách hàng..."
                      rows={1}
                      className="flex-1 bg-slate-100/90 focus:bg-white border border-transparent focus:border-emerald-300 outline-none rounded-xl py-2 px-4 text-xs font-medium text-slate-800 transition-all resize-none max-h-[100px] min-h-[36px] overflow-y-auto leading-relaxed"
                    />

                    <button
                      type="submit"
                      disabled={!inputMessage.trim() && selectedImages.length === 0}
                      className="w-9 h-9 bg-emerald-600 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl flex items-center justify-center transition-all shadow-md shrink-0 mb-0.5 active:scale-[0.93]"
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
            <p className="text-xs font-medium">Chọn một khách hàng trong danh sách để bắt đầu trò chuyện</p>
          </div>
        )}
      </div>

      {/* Modal Lightbox */}
      {previewImageModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={() => setPreviewImageModal(null)}>
          <button className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/60 w-10 h-10 rounded-full flex items-center justify-center transition-colors" onClick={() => setPreviewImageModal(null)}>
            <span className="material-symbols-outlined">close</span>
          </button>
          <img src={previewImageModal} alt="Enlarged preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default PartnerMessagePage;