import React, { useState } from 'react';

const AdminAccount = () => {
  // 1. DATA NGƯỜI DÙNG (20 Người)
  const [usersData, setUsersData] = useState([
    { id: 1, name: 'Nguyễn Văn An', email: 'an.nguyen@example.com', role: 'Nhân viên vệ sinh', roleIcon: 'cleaning_services', date: '12 Th04, 2024', status: 'Hoạt động', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-100', dotColor: 'bg-emerald-500', avatar: 'https://i.pravatar.cc/150?img=11' },
    { id: 2, name: 'Trần Thị Bích', email: 'bich.tran@example.com', role: 'Khách hàng', roleIcon: 'person', date: '08 Th04, 2024', status: 'Đã khóa', statusColor: 'text-rose-700 bg-rose-50 border-rose-100', dotColor: 'bg-rose-500', avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: 3, name: 'Lê Hoàng Nam', email: 'nam.le@example.com', role: 'Quản lý khu vực', roleIcon: 'manage_accounts', date: '01 Th04, 2024', status: 'Hoạt động', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-100', dotColor: 'bg-emerald-500', avatar: 'https://i.pravatar.cc/150?img=12' },
    { id: 4, name: 'Phạm Thị Mai', email: 'mai.pham@example.com', role: 'Khách hàng', roleIcon: 'person', date: '20 Th05, 2024', status: 'Hoạt động', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-100', dotColor: 'bg-emerald-500', avatar: 'https://i.pravatar.cc/150?img=44' },
    { id: 5, name: 'Trần Tuấn Kiệt', email: 'kiet.tran@example.com', role: 'Nhân viên vệ sinh', roleIcon: 'cleaning_services', date: '05 Th01, 2024', status: 'Đã khóa', statusColor: 'text-rose-700 bg-rose-50 border-rose-100', dotColor: 'bg-rose-500', avatar: 'https://i.pravatar.cc/150?img=53' },
    { id: 6, name: 'Lê Thị Hoa', email: 'hoa.le@example.com', role: 'Nhân viên vệ sinh', roleIcon: 'cleaning_services', date: '18 Th02, 2024', status: 'Hoạt động', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-100', dotColor: 'bg-emerald-500', avatar: 'https://i.pravatar.cc/150?img=32' },
    { id: 7, name: 'Hoàng Quang Huy', email: 'huy.hoang@example.com', role: 'Khách hàng', roleIcon: 'person', date: '10 Th06, 2024', status: 'Hoạt động', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-100', dotColor: 'bg-emerald-500', avatar: 'https://i.pravatar.cc/150?img=15' },
    { id: 8, name: 'Đỗ Mỹ Linh', email: 'linh.do@example.com', role: 'Quản lý khu vực', roleIcon: 'manage_accounts', date: '22 Th11, 2023', status: 'Hoạt động', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-100', dotColor: 'bg-emerald-500', avatar: 'https://i.pravatar.cc/150?img=20' },
    { id: 9, name: 'Vũ Văn Đức', email: 'duc.vu@example.com', role: 'Khách hàng', roleIcon: 'person', date: '02 Th05, 2024', status: 'Đã khóa', statusColor: 'text-rose-700 bg-rose-50 border-rose-100', dotColor: 'bg-rose-500', avatar: 'https://i.pravatar.cc/150?img=60' },
    { id: 10, name: 'Bùi Thanh Trúc', email: 'truc.bui@example.com', role: 'Nhân viên vệ sinh', roleIcon: 'cleaning_services', date: '14 Th03, 2024', status: 'Hoạt động', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-100', dotColor: 'bg-emerald-500', avatar: 'https://i.pravatar.cc/150?img=47' },
    { id: 11, name: 'Phan Văn Tài', email: 'tai.phan@example.com', role: 'Nhân viên vệ sinh', roleIcon: 'cleaning_services', date: '11 Th04, 2024', status: 'Hoạt động', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-100', dotColor: 'bg-emerald-500', avatar: 'https://i.pravatar.cc/150?img=33' },
    { id: 12, name: 'Ngô Thu Thảo', email: 'thao.ngo@example.com', role: 'Khách hàng', roleIcon: 'person', date: '25 Th04, 2024', status: 'Hoạt động', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-100', dotColor: 'bg-emerald-500', avatar: 'https://i.pravatar.cc/150?img=24' },
    { id: 13, name: 'Lý Quốc Bảo', email: 'bao.ly@example.com', role: 'Quản trị viên', roleIcon: 'admin_panel_settings', date: '10 Th01, 2024', status: 'Đã khóa', statusColor: 'text-rose-700 bg-rose-50 border-rose-100', dotColor: 'bg-rose-500', avatar: 'https://i.pravatar.cc/150?img=59' },
    { id: 14, name: 'Đinh Phương Nam', email: 'nam.dinh@example.com', role: 'Nhân viên vệ sinh', roleIcon: 'cleaning_services', date: '28 Th05, 2024', status: 'Hoạt động', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-100', dotColor: 'bg-emerald-500', avatar: 'https://i.pravatar.cc/150?img=13' },
    { id: 15, name: 'Vũ Thanh Hằng', email: 'hang.vu@example.com', role: 'Khách hàng', roleIcon: 'person', date: '15 Th06, 2024', status: 'Đã khóa', statusColor: 'text-rose-700 bg-rose-50 border-rose-100', dotColor: 'bg-rose-500', avatar: 'https://i.pravatar.cc/150?img=34' },
    { id: 16, name: 'Bùi Gia Khiêm', email: 'khiem.bui@example.com', role: 'Nhân viên vệ sinh', roleIcon: 'cleaning_services', date: '03 Th03, 2024', status: 'Hoạt động', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-100', dotColor: 'bg-emerald-500', avatar: 'https://i.pravatar.cc/150?img=51' },
    { id: 17, name: 'Hồ Bích Ngọc', email: 'ngoc.ho@example.com', role: 'Khách hàng', roleIcon: 'person', date: '19 Th05, 2024', status: 'Hoạt động', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-100', dotColor: 'bg-emerald-500', avatar: 'https://i.pravatar.cc/150?img=42' },
    { id: 18, name: 'Lê Minh Triết', email: 'triet.le@example.com', role: 'Nhân viên vệ sinh', roleIcon: 'cleaning_services', date: '11 Th02, 2024', status: 'Đã khóa', statusColor: 'text-rose-700 bg-rose-50 border-rose-100', dotColor: 'bg-rose-500', avatar: 'https://i.pravatar.cc/150?img=61' },
    { id: 19, name: 'Lâm Bích Hữu', email: 'huu.lam@example.com', role: 'Khách hàng', roleIcon: 'person', date: '21 Th04, 2024', status: 'Hoạt động', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-100', dotColor: 'bg-emerald-500', avatar: 'https://i.pravatar.cc/150?img=41' },
    { id: 20, name: 'Tạ Đình Phong', email: 'phong.ta@example.com', role: 'Quản lý khu vực', roleIcon: 'manage_accounts', date: '09 Th01, 2024', status: 'Hoạt động', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-100', dotColor: 'bg-emerald-500', avatar: 'https://i.pravatar.cc/150?img=68' },
  ]);

  // 2. STATE QUẢN LÝ LỌC VÀ TÌM KIẾM
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('Tất cả Vai trò');
  const [filterStatus, setFilterStatus] = useState('Tất cả Trạng thái');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;

  // 3. LOGIC LỌC DỮ LIỆU
  const filteredUsers = usersData.filter(user => {
    const matchSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === 'Tất cả Vai trò' || user.role === filterRole;
    const matchStatus = filterStatus === 'Tất cả Trạng thái' || user.status === filterStatus;
    
    return matchSearch && matchRole && matchStatus;
  });

  // ================= CẬP NHẬT Ở ĐÂY: GIỮ CỐ ĐỊNH NÚT PHÂN TRANG =================
  // Luôn luôn tính tổng số trang dựa trên mảng GỐC (20 người), nên sẽ luôn có 4 trang hiển thị.
  const staticTotalPages = Math.ceil(usersData.length / usersPerPage); 
  
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, staticTotalPages));
  // ==============================================================================

  // 5. CÁC HÀM XỬ LÝ SỰ KIỆN NÚT BẤM
  const handleAddUser = () => {
    const newName = window.prompt('Nhập tên người dùng mới:');
    if (newName) {
      const newUser = {
        id: usersData.length + 1,
        name: newName,
        email: `${newName.replace(/\s/g, '').toLowerCase()}@example.com`,
        role: 'Khách hàng',
        roleIcon: 'person',
        date: 'Hôm nay',
        status: 'Hoạt động',
        statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-100',
        dotColor: 'bg-emerald-500',
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
      };
      setUsersData([newUser, ...usersData]);
      alert(`Đã thêm thành công: ${newName}`);
    }
  };

  const handleLockAccount = (id) => {
    setUsersData(prev => prev.map(u => 
      u.id === id ? { ...u, status: 'Đã khóa', statusColor: 'text-rose-700 bg-rose-50 border-rose-100', dotColor: 'bg-rose-500' } : u
    ));
  };

  const handleUnlockAccount = (id) => {
    setUsersData(prev => prev.map(u => 
      u.id === id ? { ...u, status: 'Hoạt động', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-100', dotColor: 'bg-emerald-500' } : u
    ));
  };

  // 6. THỐNG KÊ DATA ĐỘNG
  const totalUsersCount = usersData.length;
  const activeStaffCount = usersData.filter(u => u.role === 'Nhân viên vệ sinh' && u.status === 'Hoạt động').length;
  const lockedUsersCount = usersData.filter(u => u.status === 'Đã khóa').length;

  return (
    <div className="flex flex-col min-h-full">
      {/* KHU VỰC TIÊU ĐỀ & NÚT THÊM */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Tài khoản & Người dùng</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý và theo dõi hoạt động của nhân viên và khách hàng.</p>
        </div>
        <button 
          onClick={handleAddUser}
          className="bg-[#0f2857] hover:bg-[#1a3873] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm text-sm"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Thêm tài khoản mới
        </button>
      </div>

      {/* THANH CÔNG CỤ TÌM KIẾM & LỌC */}
      <div className="bg-white p-4 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Tìm kiếm theo tên hoặc email..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>
        
        <div className="flex gap-3">
          <select 
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 outline-none hover:bg-slate-50 transition-colors cursor-pointer min-w-[150px] appearance-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="Tất cả Vai trò">Tất cả Vai trò</option>
            <option value="Khách hàng">Khách hàng</option>
            <option value="Nhân viên vệ sinh">Nhân viên vệ sinh</option>
            <option value="Quản lý khu vực">Quản lý khu vực</option>
            <option value="Quản trị viên">Quản trị viên</option>
          </select>

          <select 
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 outline-none hover:bg-slate-50 transition-colors cursor-pointer min-w-[160px] appearance-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="Tất cả Trạng thái">Tất cả Trạng thái</option>
            <option value="Hoạt động">Hoạt động</option>
            <option value="Đã khóa">Đã khóa</option>
          </select>
        </div>
      </div>

      {/* BẢNG DANH SÁCH NGƯỜI DÙNG */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden mb-6 flex-1 flex flex-col">
        {/* Min-height cố định để bảng không bị thụt khi có ít dòng */}
        <div className="overflow-x-auto flex-1 min-h-[460px]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 pl-6 font-semibold">Người dùng</th>
                <th className="py-4 font-semibold">Vai trò</th>
                <th className="py-4 font-semibold">Ngày tham gia</th>
                <th className="py-4 font-semibold">Trạng thái</th>
                <th className="py-4 pr-6 text-center font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors group">
                    <td className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm group-hover:scale-105 transition-transform" />
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{user.name}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <span className="material-symbols-outlined text-[18px] text-slate-400">{user.roleIcon}</span>
                        {user.role}
                      </div>
                    </td>
                    <td className="py-4 text-slate-500 font-medium">{user.date}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${user.statusColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.dotColor}`}></span>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 pr-6">
                      <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleLockAccount(user.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 border border-rose-100 transition-colors text-xs tracking-wide"
                        >
                          Khóa
                        </button>
                        <button 
                          onClick={() => handleUnlockAccount(user.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold hover:bg-emerald-100 border border-emerald-100 transition-colors text-xs tracking-wide"
                        >
                          Mở khóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                    <p>Không tìm thấy người dùng nào phù hợp với bộ lọc.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* GIAO DIỆN PHÂN TRANG (CỐ ĐỊNH HIỂN THỊ TẤT CẢ CÁC TRANG) */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-white">
          <span className="font-medium">
            Hiển thị <strong className="text-slate-800">{filteredUsers.length === 0 ? 0 : indexOfFirstUser + 1}</strong> - <strong className="text-slate-800">{Math.min(indexOfLastUser, filteredUsers.length)}</strong> trên <strong className="text-slate-800">{filteredUsers.length}</strong> tài khoản
          </span>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors border border-transparent ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100 hover:border-slate-200'}`}
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            {[...Array(staticTotalPages)].map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button 
                  key={pageNumber}
                  onClick={() => paginate(pageNumber)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg font-semibold transition-colors ${
                    currentPage === pageNumber 
                      ? 'bg-[#0f2857] text-white shadow-sm' 
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button 
              onClick={nextPage}
              disabled={currentPage === staticTotalPages}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors border border-transparent ${currentPage === staticTotalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100 hover:border-slate-200'}`}
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* KHỐI THỐNG KÊ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#e0eafb] p-5 rounded-2xl flex flex-col justify-center border border-blue-100/50 shadow-sm hover:-translate-y-1 transition-transform cursor-default">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <span className="material-symbols-outlined text-[20px]">groups</span>
            <span className="text-xs font-black uppercase tracking-wider">Tổng người dùng</span>
          </div>
          <h3 className="text-3xl font-black text-slate-800">{totalUsersCount}</h3>
        </div>
        
        <div className="bg-[#e4e4fc] p-5 rounded-2xl flex flex-col justify-center border border-indigo-100/50 shadow-sm hover:-translate-y-1 transition-transform cursor-default">
          <div className="flex items-center gap-2 text-indigo-700 mb-2">
            <span className="material-symbols-outlined text-[20px]">cleaning_services</span>
            <span className="text-xs font-black uppercase tracking-wider">Nhân viên trực tuyến</span>
          </div>
          <h3 className="text-3xl font-black text-slate-800">{activeStaffCount}</h3>
        </div>
        
        <div className="bg-[#fce5e5] p-5 rounded-2xl flex flex-col justify-center border border-rose-100/50 shadow-sm hover:-translate-y-1 transition-transform cursor-default">
          <div className="flex items-center gap-2 text-rose-700 mb-2">
            <span className="material-symbols-outlined text-[20px]">gpp_bad</span>
            <span className="text-xs font-black uppercase tracking-wider">Tài khoản bị khóa</span>
          </div>
          <h3 className="text-3xl font-black text-rose-600">{lockedUsersCount}</h3>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-auto pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-slate-500 font-medium">
        <p>© 2024 CleanTrust Management. Bảo mật & Tin cậy.</p>
        <div className="flex gap-6">
          <button className="hover:text-blue-600 transition-colors">Hỗ trợ kỹ thuật</button>
          <button className="hover:text-blue-600 transition-colors">Chính sách bảo mật</button>
        </div>
      </div>

    </div>
  );
};

export default AdminAccount;