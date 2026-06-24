import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import khachHangApi from '../../../api/khachHangApi';
import nhanVienApi from '../../../api/nhanVienApi';

// ─── MOCK DATA PHÂN CHIA THÀNH 3 TAB RÕ RÀNG ─────────────────────────────────────────


const MessagePage = () => {
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
  
  // Quản lý 3 tab: 'active' (Theo đơn đặt), 'staff' (Nhân viên), 'history' (Đơn cũ)
  const [currentTab, setCurrentTab] = useState('active');

  // State lưu danh sách ID nhân viên đã được khách hàng yêu thích
  const [favoriteStaffIds, setFavoriteStaffIds] = useState([]);

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  
  const fetchRooms = async () => {
    try {
      const res = await khachHangApi.getChatRooms();
      setConversations(prev => {
        if (!prev || prev.length === 0) return res || [];
        return (res || []).map(newRoom => {
          const oldRoom = prev.find(p => p.id === newRoom.id);
          // Preserve messages array so the chat content doesn't disappear on polling
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

  const fetchMessages = async (chatId) => {
    try {
      const msgs = await khachHangApi.getMessages(chatId);
      setConversations(prev => prev.map(c => c.id === chatId ? { ...c, messages: msgs } : c));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await nhanVienApi.getYeuThich();
      if (res && res.data) {
        setFavoriteStaffIds(res.data.map(staff => staff.id));
      }
    } catch (e) {
      console.error("Lỗi khi tải danh sách nhân viên yêu thích", e);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let timerId;

    const pollData = async () => {
      if (!isMounted) return;
      await fetchRooms();
      
      // Also fetch messages for active chat so we don't miss incoming messages
      if (activeChatIdRef.current) {
        await fetchMessages(activeChatIdRef.current);
      }

      if (isMounted) {
        timerId = setTimeout(pollData, 10000);
      }
    };

    fetchFavorites();
    pollData();

    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, []);

  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
    }
  }, [activeChatId]);


  // Lọc dữ liệu hiển thị theo Tab được bấm
  const filteredConversations = conversations.filter(chat => {
    if (currentTab === 'active') return chat.type === 'booking' && (chat.status === 'confirmed' || chat.status === 'active' || chat.status === 'pending');
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

    const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!activeChat || activeChat.isLocked) return;
    if (!inputMessage.trim()) return;

    const tempMsg = { id: Date.now(), sender: 'customer', text: inputMessage, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) };
    
    // Optimistic Update
    setConversations(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          lastMessage: inputMessage,
          lastMessageTime: 'Vừa xong',
          messages: [...(chat.messages || []), tempMsg]
        };
      }
      return chat;
    }));

    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      await khachHangApi.sendMessage(activeChatId, { text: tempMsg.text });
      fetchMessages(activeChatId);
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi gửi tin nhắn.');
    }
  };



  // Hàm xử lý bật/tắt yêu thích nhân viên
  const toggleFavoriteStaff = async (staffId) => {
    if (!staffId) return;
    const isFav = favoriteStaffIds.includes(staffId);
    
    // Optimistic Update
    setFavoriteStaffIds(prev => 
      isFav 
        ? prev.filter(id => id !== staffId) 
        : [...prev, staffId]
    );

    try {
      if (isFav) {
        await nhanVienApi.xoaYeuThich(staffId);
      } else {
        await nhanVienApi.themYeuThich(staffId);
      }
    } catch (error) {
      console.error(error);
      // Revert if error
      setFavoriteStaffIds(prev => 
        !isFav 
          ? prev.filter(id => id !== staffId) 
          : [...prev, staffId]
      );
      alert('Có lỗi xảy ra khi cập nhật nhân viên yêu thích.');
    }
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
                {/* Nút Xem lịch hẹn */}
                {activeChat.type === 'booking' && activeChat.bookingId && (
                  <button
                    onClick={() => navigate(`/my-bookings/${activeChat.bookingId}`)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-primary/20 active:scale-95"
                    title="Xem chi tiết lịch hẹn"
                  >
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
                    <span>Xem lịch hẹn</span>
                  </button>
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
              {activeChat.messages?.map((msg) => {
                const isMe = msg.sender === 'customer';
                return (
                  <div key={msg.id} className={`flex flex-col max-w-[65%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                    <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-sm break-words whitespace-pre-wrap ${
                      isMe ? 'bg-[#1a368d] text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-200/50'
                    }`}>
                      {msg.text && <div>{msg.text}</div>}
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
                <form onSubmit={handleSendMessage} className="p-3 flex items-end gap-2 bg-white">
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
                    disabled={!inputMessage.trim()}
                    className="w-9 h-9 bg-[#1a368d] disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl flex items-center justify-center active:scale-[0.93] transition-all shadow-md shadow-blue-900/10 shrink-0 mb-0.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </button>
                </form>
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

          </div>
  );
};

export default MessagePage;