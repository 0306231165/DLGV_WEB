import React, { useState, useEffect } from 'react';
import axiosClient from '../../../api/axiosClient'; 

const AdminAccount = () => {
  // 1. STATE DỮ LIỆU THẬT & LOADING
  const [usersData, setUsersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. STATE LỌC VÀ PHÂN TRANG
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('Tất cả Vai trò');
  const [filterStatus, setFilterStatus] = useState('Tất cả Trạng thái');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6; 

  // 3. STATE MODAL THÊM TÀI KHOẢN
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ ho_ten: '', loai_tai_khoan: 'KhachHang', email: '', mat_khau: '', so_dien_thoai: '' });

  // 4. STATE MODAL XEM THÔNG TIN
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // ================= CÁC HÀM GỌI API LARAVEL =================

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axiosClient.get('/admin/users'); 
      setUsersData(response); 
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Hàm Thêm tài khoản mới (Đã kết nối MySQL thật)
 const handleAddNewUserSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/admin/users', newUser);
      alert(`✅ Đã thêm tài khoản "${newUser.ho_ten}" thành công!`);
      setIsModalOpen(false);
      setNewUser({ ho_ten: '', loai_tai_khoan: 'KhachHang', email: '', mat_khau: '', so_dien_thoai: '' }); 
      fetchUsers(); 
    } catch (error) {
      // ÉP IN RA CÂU LỖI CHI TIẾT TỪ MYSQL LÊN MÀN HÌNH
      const errorMsg = error.response?.data?.message || 'Lỗi không xác định!';
      alert("❌ " + errorMsg);
    }
  };

  // Hàm Khóa / Mở khóa tài khoản (Đã kết nối MySQL thật)
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Hoạt động' ? 'BiKhoa' : 'HoatDong';
    const confirmMsg = currentStatus === 'Hoạt động' ? 'Bạn có chắc muốn KHÓA tài khoản này?' : 'Bạn có muốn MỞ KHÓA tài khoản này?';

    if (!window.confirm(confirmMsg)) return;

    try {
      await axiosClient.patch(`/admin/users/${id}/status`, { trang_thai: newStatus });
      fetchUsers(); 
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      alert("❌ Cập nhật thất bại!");
    }
  };

  // Hàm XÓA tài khoản (Tính năng mới)
  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${name}" không? Hành động này sẽ xóa dữ liệu khỏi cơ sở dữ liệu!`)) return;

    try {
      await axiosClient.delete(`/admin/users/${id}`);
      alert(`✅ Đã xóa tài khoản "${name}" thành công!`);
      fetchUsers(); // Tải lại bảng sau khi xóa
    } catch (error) {
      console.error("Lỗi khi xóa tài khoản:", error);
      alert("❌ Xóa thất bại! Tài khoản này có thể đang bị ràng buộc bởi các đơn hàng hoặc ví tiền trong hệ thống.");
    }
  };

  // ================= HELPER & LOGIC =================
  const getRoleIcon = (role) => {
    switch(role) {
      case 'Nhân viên vệ sinh': return 'cleaning_services';
      case 'Quản trị viên': return 'admin_panel_settings';
      default: return 'person';
    }
  };

  const getStatusStyle = (status) => {
    return status === 'Hoạt động' 
      ? { color: 'text-emerald-700 bg-emerald-50 border-emerald-100', dot: 'bg-emerald-500' }
      : { color: 'text-rose-700 bg-rose-50 border-rose-100', dot: 'bg-rose-500' };
  };

  // Lọc dữ liệu
  const filteredUsers = usersData.filter(user => {
    const matchSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === 'Tất cả Vai trò' || user.role === filterRole;
    const matchStatus = filterStatus === 'Tất cả Trạng thái' || user.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const staticTotalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1; 
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, staticTotalPages));

  // ================= RENDER GIAO DIỆN =================
  return (
    <div className="flex flex-col min-h-full relative p-6">
      
      {/* MODAL XEM THÔNG TIN */}
      {isInfoModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-800">Thông tin tài khoản</h2>
              <button onClick={() => setIsInfoModalOpen(false)} className="text-slate-400 hover:text-rose-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm font-bold text-slate-700">Mã ID:</span>
                <span className="text-sm text-slate-600">{selectedUser.id}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm font-bold text-slate-700">Tên:</span>
                <span className="text-sm text-slate-600">{selectedUser.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm font-bold text-slate-700">Vai trò:</span>
                <span className="text-sm text-slate-600">{selectedUser.role}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm font-bold text-slate-700">Tên đăng nhập / Số điện thoại:</span>
                <span className="text-sm text-slate-600">{selectedUser.so_dien_thoai || selectedUser.phone || 'Không có'}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-sm font-bold text-slate-700">Mật khẩu:</span>
                <span className="text-sm text-slate-600">123456</span>
              </div>
              
              <div className="pt-4 flex">
                <button type="button" onClick={() => setIsInfoModalOpen(false)} className="w-full px-4 py-2 rounded-xl bg-[#0f2857] text-white font-bold hover:bg-[#1a3873]">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM TÀI KHOẢN MỚI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-800">Thêm tài khoản mới</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddNewUserSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Họ và tên</label>
                <input type="text" required value={newUser.ho_ten} onChange={(e) => setNewUser({...newUser, ho_ten: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Số điện thoại</label>
                <input type="text" required value={newUser.so_dien_thoai} onChange={(e) => setNewUser({...newUser, so_dien_thoai: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Vai trò</label>
                <select value={newUser.loai_tai_khoan} onChange={(e) => setNewUser({...newUser, loai_tai_khoan: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm">
                  <option value="KhachHang">Khách hàng</option>
                  <option value="NhanVien">Nhân viên vệ sinh</option>
                  <option value="Admin">Quản trị viên</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email đăng nhập</label>
                <input type="email" required value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Mật khẩu</label>
                <input type="password" required value={newUser.mat_khau} onChange={(e) => setNewUser({...newUser, mat_khau: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm" />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 rounded-xl border font-bold text-slate-600 hover:bg-slate-50">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-xl bg-[#0f2857] text-white font-bold hover:bg-[#1a3873]">Lưu tài khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER VÀ NÚT THÊM */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Tài khoản & Người dùng</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý và theo dõi hoạt động của nhân viên và khách hàng.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#0f2857] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm">
          <span className="material-symbols-outlined text-[20px]">person_add</span> Thêm tài khoản
        </button>
      </div>

      {/* THANH BỘ LỌC */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Tìm kiếm theo tên hoặc email..." className="w-full pl-11 pr-4 py-2 bg-slate-50 border rounded-xl text-sm" />
        </div>
        <div className="flex gap-3">
          <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }} className="px-4 py-2 border rounded-xl text-sm">
            <option value="Tất cả Vai trò">Tất cả Vai trò</option>
            <option value="Khách hàng">Khách hàng</option>
            <option value="Nhân viên vệ sinh">Nhân viên vệ sinh</option>
            <option value="Quản trị viên">Quản trị viên</option>
          </select>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="px-4 py-2 border rounded-xl text-sm">
            <option value="Tất cả Trạng thái">Tất cả Trạng thái</option>
            <option value="Hoạt động">Hoạt động</option>
            <option value="Đã khóa">Đã khóa</option>
          </select>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6 flex-1 flex flex-col">
        <div className="overflow-x-auto min-h-[460px]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                <th className="py-4 pl-6">Người dùng</th>
                <th className="py-4">Vai trò</th>
                <th className="py-4">Ngày tham gia</th>
                <th className="py-4">Trạng thái</th>
                <th className="py-4 pr-6 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr><td colSpan="5" className="py-12 text-center font-bold text-blue-500">Đang tải dữ liệu từ MySQL...</td></tr>
              ) : currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-slate-50/70 group">
                    <td className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} alt="avatar" className="w-10 h-10 rounded-xl" />
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{user.name}</span>
                          <span className="text-[11px] text-slate-400">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <span className="material-symbols-outlined text-[18px]">{getRoleIcon(user.role)}</span>
                        {user.role}
                      </div>
                    </td>
                    <td className="py-4 text-slate-500 font-medium">{user.created_at}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(user.status).color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusStyle(user.status).dot}`}></span>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 pr-6">
                      <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100">
                        {/* Nút Xem Thông Tin */}
                        <button 
                          onClick={() => {
                            setSelectedUser(user);
                            setIsInfoModalOpen(true);
                          }} 
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100 flex items-center justify-center"
                          title="Xem thông tin"
                        >
                          Chi tiết
                        </button>

                        {/* Nút Khóa / Mở Khóa */}
                        {user.status === 'Hoạt động' ? (
                           <button onClick={() => handleToggleStatus(user.id, user.status)} className="px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 font-bold text-xs hover:bg-orange-100">Khóa</button>
                        ) : (
                           <button onClick={() => handleToggleStatus(user.id, user.status)} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs hover:bg-emerald-100">Mở khóa</button>
                        )}
                        
                        {/* Nút XÓA MỚI THÊM VÀO ĐÂY */}
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.name)} 
                          className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 flex items-center justify-center"
                          title="Xóa tài khoản"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="py-12 text-center text-slate-400">Không tìm thấy dữ liệu.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* GIAO DIỆN PHÂN TRANG (1 2 3 4...) */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-white">
          <span className="font-medium">
            Hiển thị <strong className="text-slate-800">{filteredUsers.length === 0 ? 0 : indexOfFirstUser + 1}</strong> - <strong className="text-slate-800">{Math.min(indexOfLastUser, filteredUsers.length)}</strong> trên <strong className="text-slate-800">{filteredUsers.length}</strong> tài khoản
          </span>
          <div className="flex items-center gap-1">
            <button onClick={prevPage} disabled={currentPage === 1} className={`w-8 h-8 flex items-center justify-center rounded-lg ${currentPage === 1 ? 'opacity-40' : 'hover:bg-slate-100'}`}>
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            {[...Array(staticTotalPages)].map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button key={pageNumber} onClick={() => paginate(pageNumber)} className={`w-8 h-8 flex items-center justify-center rounded-lg font-semibold ${currentPage === pageNumber ? 'bg-[#0f2857] text-white' : 'hover:bg-slate-100 text-slate-600'}`}>
                  {pageNumber}
                </button>
              );
            })}
            <button onClick={nextPage} disabled={currentPage === staticTotalPages} className={`w-8 h-8 flex items-center justify-center rounded-lg ${currentPage === staticTotalPages ? 'opacity-40' : 'hover:bg-slate-100'}`}>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAccount;