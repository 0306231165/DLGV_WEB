import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import nhanVienApi from '../../../api/nhanVienApi';

const PartnerMessagePage = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeChatIdState, setActiveChatIdState] = useState(null);
  const activeChatIdRef = useRef(null);
  const [inputMessage, setInputMessage] = useState('');
  
  const activeChatId = activeChatIdState;
  const setActiveChatId = (id) => {
    activeChatIdRef.current = id;
    setActiveChatIdState(id);
  };

  const [showChatDetail, setShowChatDetail] = useState(false);
  const [currentTab, setCurrentTab] = useState('current');
  
  // Modal Xem lịch hẹn
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderDetailData, setOrderDetailData] = useState(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Lấy danh sách phòng chat
  const fetchRooms = async () => {
    try {
      const res = await nhanVienApi.getChatRooms();
      setConversations(prev => {
        if (!prev || prev.length === 0) return res || [];
        return (res || []).map(newRoom => {
          const oldRoom = prev.find(p => p.id === newRoom.id);
          if (oldRoom && oldRoom.messages) {
            return { ...newRoom, messages: oldRoom.messages };
          }
          return newRoom;
        });
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Lấy tin nhắn của phòng chat cụ thể
  const fetchMessages = async (chatId) => {
    try {
      const msgs = await nhanVienApi.getMessages(chatId);
      setConversations(prev => prev.map(c => c.id === chatId ? { ...c, messages: msgs } : c));
    } catch (e) {
      console.error(e);
    }
  };

  // Polling data liên tục mỗi 10 giây
  useEffect(() => {
    let isMounted = true;
    let timerId;

    const pollData = async () => {
      if (!isMounted) return;
      await fetchRooms();
      
      if (activeChatIdRef.current) {
        await fetchMessages(activeChatIdRef.current);
      }

      if (isMounted) {
        timerId = setTimeout(pollData, 10000);
      }
    };

    pollData();

    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, []);

  // Thay đổi activeChatId khi load được danh sách mới hoặc mới mount
  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
    }
  }, [activeChatId]);

  // Lọc dữ liệu hiển thị theo Tab
  const filteredConversations = conversations.filter(chat => {
    if (currentTab === 'current') return chat.type === 'booking' && (chat.status === 'confirmed' || chat.status === 'active' || chat.status === 'pending');
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

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!activeChat || activeChat.isLocked) return;
    if (!inputMessage.trim()) return;

    const textToSend = inputMessage.trim();
    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // Optimistic update
      const tempMsg = {
        id: Date.now(),
        sender: 'staff',
        text: textToSend,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split('T')[0],
      };

      setConversations(prev => prev.map(c => c.id === activeChatId ? {
        ...c,
        messages: [...(c.messages || []), tempMsg],
        lastMessage: textToSend,
        lastMessageTime: tempMsg.time
      } : c));

      await nhanVienApi.sendMessage(activeChatId, textToSend);
    } catch (error) {
      console.error(error);
      alert('Không thể gửi tin nhắn.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Xử lý mở Modal Xem Lịch Hẹn
  const handleOpenOrderModal = async () => {
    if (!activeChat || !activeChat.id) return;
    setShowOrderModal(true);
    setIsLoadingOrder(true);
    setOrderDetailData(null);
    try {
      const res = await nhanVienApi.getRoomOrderDetails(activeChat.id);
      setOrderDetailData(res.data || res);
    } catch (e) {
      console.error(e);
      alert('Không thể tải thông tin lịch hẹn.');
      setShowOrderModal(false);
    } finally {
      setIsLoadingOrder(false);
    }
  };

  // Component render nội dung tin nhắn
  const renderMessageContent = (msg, index, messages) => {
    if (msg.text && (msg.text.includes('[Hệ thống]') || msg.text.startsWith('⚠️'))) {
      return (
        <div key={msg.id} className="flex justify-center my-3 w-full">
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2.5 rounded-2xl max-w-[85%] text-center shadow-sm">
            <p className="text-xs font-bold whitespace-pre-wrap">{msg.text}</p>
            <span className="text-[10px] text-rose-400 block mt-1">{msg.time}</span>
          </div>
        </div>
      );
    }

    const isMe = msg.sender === 'staff';
    const showAvatar = !isMe && (index === 0 || messages[index - 1].sender === 'staff');

    return (
      <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''} mb-4`}>
        {/* Avatar khách hàng */}
        {!isMe ? (
          <div className="w-8 h-8 shrink-0">
            {showAvatar && (
              <img src={activeChat.customer.avatar} alt="avatar" className="w-full h-full rounded-full object-cover shadow-sm" />
            )}
          </div>
        ) : null}

        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
          <div className={`relative px-4 py-2.5 rounded-2xl shadow-sm text-[13.5px] leading-relaxed ${
            isMe 
              ? 'bg-emerald-600 text-white rounded-br-sm' 
              : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm'
          }`}>
            <p className="whitespace-pre-wrap">{msg.text}</p>
          </div>
          <span className="text-[10px] text-slate-400 mt-1.5 font-medium px-1">
            {msg.time}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen max-w-[100vw] -mx-[calc((100vw-100%)/2)] bg-slate-50 flex overflow-hidden border-t border-slate-200">

      {/* ─── CỘT TRÁI: DANH SÁCH KHÁCH HÀNG ─── */}
      <div className={`
        ${showChatDetail ? 'hidden' : 'flex'} md:flex
        w-full md:w-[360px] border-r border-slate-200 flex-col bg-white shrink-0
      `}>
        <div className="p-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-base font-black text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
              Hộp thư Đối tác
            </h1>
            <button
              onClick={() => navigate('/partner/dashboard')}
              className="text-xs font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-0.5 bg-slate-100 hover:bg-emerald-600/10 px-2.5 py-1.5 rounded-xl transition-all"
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
              Theo đơn đặt
            </button>

            <button
              onClick={() => setCurrentTab('history')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${currentTab === 'history' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Đơn cũ
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">forum</span>
              <p className="text-xs font-medium">Chưa có cuộc trò chuyện nào</p>
            </div>
          ) : (
            filteredConversations.map((chat) => {
              const isActive = chat.id === activeChatId;
              return (
                <button
                  key={chat.id}
                  onClick={() => {
                    setActiveChatId(chat.id);
                    setShowChatDetail(true);
                  }}
                  className={`w-full text-left p-3 rounded-2xl flex items-start gap-3 transition-all ${
                    isActive ? 'bg-emerald-600/5 ring-1 ring-emerald-600/20' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img src={chat.customer.avatar} alt={chat.customer.name} className="w-11 h-11 rounded-full object-cover shadow-sm" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className="font-bold text-xs text-slate-800 truncate">{chat.customer.name}</p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{chat.lastMessageTime}</span>
                    </div>
                    {chat.bookingCode ? (
                      <p className="text-[10px] font-bold text-emerald-600 mb-1">MÃ ĐƠN: {chat.bookingCode}</p>
                    ) : (
                      <p className="text-[10px] font-bold text-blue-600 mb-1">CHAT TRỰC TIẾP</p>
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

      {/* ─── CỘT PHẢI: CHI TIẾT ĐOẠN CHAT VỚI KHÁCH HÀNG ─── */}
      <div className={`
        ${showChatDetail ? 'flex' : 'hidden'} md:flex
        flex-1 flex-col bg-[#f8fafc] h-full
      `}>
        {activeChat ? (
          <>
            {/* Header phòng chat */}
            <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
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
                      activeChat.status === 'pending' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                      activeChat.status === 'direct' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                      'bg-slate-100 border-slate-200 text-slate-500'
                    }`}>
                      {activeChat.statusLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5 truncate max-w-[200px] md:max-w-[400px]" title={activeChat.serviceTitle}>
                    {activeChat.type === 'booking' ? `Dịch vụ: ${activeChat.serviceTitle}` : 'Khách hàng tự liên hệ'}
                  </p>
                </div>
              </div>

              {/* Nút Xem lịch hẹn */}
              <div className="flex items-center gap-2">
                {activeChat.type === 'booking' && activeChat.bookingId && (
                  <button
                    onClick={handleOpenOrderModal}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 active:scale-95"
                    title="Xem chi tiết lịch hẹn"
                  >
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
                    <span className="hidden sm:inline">Xem lịch hẹn</span>
                  </button>
                )}
              </div>
            </div>

            {/* Vùng hiển thị tin nhắn */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar flex flex-col">
              {activeChat.messages && activeChat.messages.length > 0 ? (
                <>
                  <div className="flex justify-center mb-8">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      Bắt đầu cuộc trò chuyện
                    </span>
                  </div>
                  
                  {activeChat.messages.map((msg, index) => renderMessageContent(msg, index, activeChat.messages))}
                  
                  {activeChat.isLocked && (
                    <div className="flex justify-center mt-6 mb-2">
                      <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-4 py-2 rounded-full border border-amber-200 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">lock</span>
                        Đơn lịch đã kết thúc. Cuộc trò chuyện này đã tự động đóng.
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl opacity-50 text-emerald-600">chat</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-600 mb-1">Chưa có tin nhắn</p>
                    <p className="text-xs">Hãy gửi lời chào đầu tiên đến {activeChat.customer.name}</p>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input nhập tin nhắn */}
            {!activeChat.isLocked && (
              <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-600/20 focus-within:border-emerald-600 transition-all shadow-sm">
                  <textarea
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn trao đổi..."
                    className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-[120px] min-h-[40px] text-[13.5px] p-2 custom-scrollbar placeholder:text-slate-400"
                    rows="1"
                    style={{ height: '40px' }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95 ${
                      inputMessage.trim()
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-600-dark'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                  </button>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/50">
            <span className="material-symbols-outlined text-6xl mb-4 text-slate-300">forum</span>
            <h3 className="text-lg font-bold text-slate-600 mb-2">Hộp thư Đối tác</h3>
            <p className="text-sm">Chọn một đoạn chat để bắt đầu trao đổi với khách hàng</p>
          </div>
        )}
      </div>

      {/* ─── MODAL XEM LỊCH HẸN ─── */}
      {showOrderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">calendar_month</span>
                Thông tin Lịch hẹn
              </h3>
              <button 
                onClick={() => setShowOrderModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
              {isLoadingOrder ? (
                <div className="flex justify-center items-center h-40">
                  <span className="material-symbols-outlined animate-spin text-emerald-600 text-3xl">progress_activity</span>
                </div>
              ) : orderDetailData ? (
                <div className="space-y-6">
                  {/* Thông tin đơn hàng */}
                  <div className="bg-emerald-600/5 rounded-xl p-4 border border-emerald-600/10">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-[10px] font-bold text-emerald-600 mb-1">MÃ ĐƠN: {orderDetailData.donHang.ma_don}</p>
                        <h4 className="font-bold text-slate-800 text-base">{orderDetailData.donHang.ten_dich_vu}</h4>
                      </div>
                      <span className="px-2.5 py-1 text-[10px] font-bold bg-white text-slate-600 rounded-md border border-slate-200 shadow-sm">
                        {orderDetailData.donHang.trang_thai}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mt-3">
                      <div className="flex gap-2 items-start">
                        <span className="material-symbols-outlined text-[16px] text-slate-400 mt-0.5">location_on</span>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{orderDetailData.donHang.dia_chi}</p>
                      </div>
                      {orderDetailData.donHang.ghi_chu && (
                        <div className="flex gap-2 items-start">
                          <span className="material-symbols-outlined text-[16px] text-amber-500 mt-0.5">sticky_note_2</span>
                          <p className="text-xs text-amber-700 leading-relaxed bg-amber-50/50 p-1.5 rounded-md border border-amber-100 flex-1">
                            {orderDetailData.donHang.ghi_chu}
                          </p>
                        </div>
                      )}
                      {orderDetailData.donHang.dich_vu_them && orderDetailData.donHang.dich_vu_them.length > 0 && (
                        <div className="flex gap-2 items-start">
                          <span className="material-symbols-outlined text-[16px] text-blue-500 mt-0.5">add_circle</span>
                          <div className="flex flex-wrap gap-1.5 flex-1">
                            {orderDetailData.donHang.dich_vu_them.map((dv, idx) => (
                              <span key={idx} className="bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                {dv}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Danh sách ca làm */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-emerald-600 text-[18px]">event_available</span>
                      Các ca làm sắp tới của bạn
                    </h4>
                    
                    {orderDetailData.upcomingShifts && orderDetailData.upcomingShifts.length > 0 ? (
                      <div className="space-y-2.5">
                        {orderDetailData.upcomingShifts.map((ca, idx) => {
                          const dateObj = new Date(ca.ngay_lam_viec);
                          const dayOfWeek = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][dateObj.getDay()];
                          const dateStr = dateObj.toLocaleDateString('vi-VN');
                          
                          return (
                            <div key={ca.id} className="flex bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-emerald-200 hover:shadow-md transition-all group">
                              {/* Cột trái: Ngày tháng */}
                              <div className="bg-slate-50 px-4 py-3 flex flex-col items-center justify-center border-r border-slate-100 min-w-[90px] group-hover:bg-emerald-50 transition-colors">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{dayOfWeek}</span>
                                <span className="font-black text-slate-800 text-sm mt-0.5">{dateStr}</span>
                              </div>
                              {/* Cột phải: Giờ */}
                              <div className="p-3 flex-1 flex flex-col justify-center">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="material-symbols-outlined text-[16px] text-emerald-500">schedule</span>
                                  <span className="font-bold text-slate-700 text-sm">{ca.thoi_gian_bat_dau} - {ca.thoi_gian_ket_thuc}</span>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded w-fit">
                                  {ca.trang_thai}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {orderDetailData.upcomingShifts.length === 3 && (
                          <p className="text-center text-[11px] text-slate-400 mt-3 font-medium italic">
                            Hiển thị tối đa 3 ca làm tiếp theo...
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                        <p className="text-sm font-medium text-slate-500">Không có ca làm nào sắp diễn ra.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-sm">Không tìm thấy dữ liệu.</div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setShowOrderModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerMessagePage;
