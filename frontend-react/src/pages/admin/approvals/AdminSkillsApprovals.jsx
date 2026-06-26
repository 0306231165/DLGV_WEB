import React, { useState, useEffect } from 'react';
import axiosClient from '../../../api/axiosClient';

const AdminSkillsApprovals = () => {
  const [pendingSkills, setPendingSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'

  useEffect(() => {
    fetchPendingSkills();
  }, []);

  const fetchPendingSkills = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/admin/skills-approvals');
      if (res && res.success) {
        setPendingSkills(res.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách kỹ năng:', error);
      alert('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirm = (item, type) => {
    setSelectedItem(item);
    setActionType(type);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedItem) return;
    setProcessingId(selectedItem.nhanvien_id + '-' + selectedItem.dich_vu_id);
    
    try {
      if (actionType === 'approve') {
        const res = await axiosClient.put(`/admin/skills-approvals/${selectedItem.nhanvien_id}/${selectedItem.dich_vu_id}/approve`);
        if (res && res.success) {
          alert(res.message || 'Đã duyệt thành công!');
          fetchPendingSkills();
        }
      } else if (actionType === 'reject') {
        const res = await axiosClient.put(`/admin/skills-approvals/${selectedItem.nhanvien_id}/${selectedItem.dich_vu_id}/reject`);
        if (res && res.success) {
          alert(res.message || 'Đã xóa yêu cầu đăng ký!');
          fetchPendingSkills();
        }
      }
    } catch (error) {
      console.error('Lỗi khi duyệt/từ chối:', error);
      alert(error.message || error.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setProcessingId(null);
      setIsConfirmModalOpen(false);
      setSelectedItem(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <span className="material-symbols-outlined text-2xl font-black">model_training</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">Duyệt Nâng Cấp Kỹ Năng</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Quản lý các yêu cầu đăng ký thêm dịch vụ của đối tác đang hoạt động</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <span className="text-sm font-bold text-slate-600">Đang chờ duyệt:</span>
          <span className="px-3 py-1 bg-amber-100 text-amber-700 font-black rounded-lg text-sm">{pendingSkills.length}</span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-500">Đang tải dữ liệu...</p>
        </div>
      ) : pendingSkills.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center border border-slate-200 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-4xl text-slate-300">task_alt</span>
          </div>
          <h3 className="text-lg font-black text-slate-800">Tuyệt vời!</h3>
          <p className="text-slate-500 font-medium max-w-sm mt-2">Không có yêu cầu nâng cấp kỹ năng nào đang chờ duyệt lúc này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {pendingSkills.map((item) => (
            <div key={`${item.nhanvien_id}-${item.dich_vu_id}`} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4 transition-all hover:shadow-md">
              
              <div className="flex gap-4">
                {/* Avatar đối tác */}
                {item.partner_avatar ? (
                  <img src={`http://localhost:8000/storage/${item.partner_avatar}`} alt="avatar" className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-white shadow-sm" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 font-black flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
                    {item.partner_initials}
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900">{item.partner_name}</h3>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">call</span> {item.partner_phone}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-bold tracking-wide bg-amber-50 text-amber-600 border border-amber-200 rounded-lg">
                      {item.ngay_dang_ky}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hộp dịch vụ đăng ký */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Dịch vụ yêu cầu cấp quyền</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined">{item.service_icon}</span>
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">{item.service_name}</p>
                    <p className="text-[11px] font-medium text-amber-600 mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">history_edu</span> Đã thi thực hành: {item.exam_date}
                    </p>
                  </div>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="flex items-center gap-3 mt-1">
                <button 
                  onClick={() => handleOpenConfirm(item, 'reject')}
                  disabled={processingId === `${item.nhanvien_id}-${item.dich_vu_id}`}
                  className="flex-1 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:text-rose-600 transition-colors disabled:opacity-50"
                >
                  Từ chối
                </button>
                <button 
                  onClick={() => handleOpenConfirm(item, 'approve')}
                  disabled={processingId === `${item.nhanvien_id}-${item.dich_vu_id}`}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 border border-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {processingId === `${item.nhanvien_id}-${item.dich_vu_id}` ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">check_circle</span> Phê duyệt
                    </>
                  )}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal Xác nhận */}
      {isConfirmModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden p-6 text-center">
            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${actionType === 'approve' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
              <span className="material-symbols-outlined text-3xl font-black">
                {actionType === 'approve' ? 'verified' : 'delete_forever'}
              </span>
            </div>
            <h3 className="font-black text-slate-800 text-lg">
              {actionType === 'approve' ? 'Xác nhận Phê duyệt?' : 'Xóa yêu cầu này?'}
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-2 mb-6">
              {actionType === 'approve' 
                ? `Cho phép đối tác ${selectedItem.partner_name} nhận đơn hàng ${selectedItem.service_name}.` 
                : `Hủy bỏ yêu cầu đăng ký ${selectedItem.service_name} của đối tác ${selectedItem.partner_name}.`}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setIsConfirmModalOpen(false)}
                className="py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleConfirmAction}
                className={`py-2.5 font-bold rounded-xl text-white shadow-md transition-colors ${actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'}`}
              >
                {actionType === 'approve' ? 'Phê duyệt' : 'Xóa bỏ'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminSkillsApprovals;
