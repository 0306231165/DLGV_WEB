import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Dữ liệu giả lập nhân viên yêu thích
const MOCK_SAVED_STAFF = [
  { id: 's1', name: 'Trần Thị Mai', avatar: 'https://i.pravatar.cc/150?u=mai', rating: 4.9, jobsCount: 124, reviews: 110, experience: '3 năm' },
  { id: 's2', name: 'Nguyễn Thu Hà', avatar: 'https://i.pravatar.cc/150?u=ha', rating: 4.8, jobsCount: 96, reviews: 85, experience: '2 năm' },
  { id: 's3', name: 'Lê Văn Nam', avatar: 'https://i.pravatar.cc/150?u=nam', rating: 4.7, jobsCount: 150, reviews: 142, experience: '4 năm' },
  { id: 's4', name: 'Phạm Minh Tuyết', avatar: 'https://i.pravatar.cc/150?u=tuyet', rating: 5.0, jobsCount: 88, reviews: 80, experience: '1 năm' },
  { id: 's5', name: 'Vũ Hoàng Yến', avatar: 'https://i.pravatar.cc/150?u=yen', rating: 4.9, jobsCount: 112, reviews: 101, experience: '3 năm' },
  { id: 's6', name: 'Đặng Quốc Bảo', avatar: 'https://i.pravatar.cc/150?u=bao', rating: 4.6, jobsCount: 74, reviews: 68, experience: '2 năm' },
  { id: 's7', name: 'Bùi Phương Linh', avatar: 'https://i.pravatar.cc/150?u=linh', rating: 4.9, jobsCount: 210, reviews: 195, experience: '5 năm' },
  { id: 's8', name: 'Ngô Tiến Đạt', avatar: 'https://i.pravatar.cc/150?u=dat', rating: 4.8, jobsCount: 135, reviews: 120, experience: '3 năm' },
  { id: 's9', name: 'Đỗ Thùy Chi', avatar: 'https://i.pravatar.cc/150?u=chi', rating: 4.7, jobsCount: 59, reviews: 50, experience: '1 năm' },
  { id: 's10', name: 'Hoàng Hải Yến', avatar: 'https://i.pravatar.cc/150?u=haiyen', rating: 5.0, jobsCount: 102, reviews: 96, experience: '2 năm' }
];

const SavedStaffPage = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState(MOCK_SAVED_STAFF);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // States điều khiển Modal và trigger animation siêu tốc
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAnimate, setModalAnimate] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const openDeleteModal = (staff, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedStaff(staff);
    setModalOpen(true);
  };

  useEffect(() => {
    if (modalOpen) {
      const timer = setTimeout(() => setModalAnimate(true), 10);
      return () => clearTimeout(timer);
    } else {
      setModalAnimate(false);
    }
  }, [modalOpen]);

  const closeDeleteModal = () => {
    setModalAnimate(false);
    setTimeout(() => {
      setModalOpen(false);
      setSelectedStaff(null);
    }, 150);
  };

  const confirmDeleteStaff = () => {
    if (selectedStaff) {
      setStaffList(prev => prev.filter(item => item.id !== selectedStaff.id));
    }
    closeDeleteModal();
  };

  const visibleStaff = isExpanded ? staffList : staffList.slice(0, 8);

  return (
    <main className="pt-32 pb-section-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen bg-surface">
      
      {/* Title Header */}
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="font-h1 text-h1 text-primary mb-4">Nhân viên Yêu thích</h1>
        <p className="text-body-lg text-on-surface-variant">
          Danh sách những người giúp việc tin cậy bạn đã lưu. Hệ thống CleanTrust sẽ tự động ưu thiện hiển thị họ khi bạn đặt lịch mới.
        </p>
      </div>

      {/* Grid Layout chuẩn 4 cột giống StaffListPage */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visibleStaff.map((staff) => (
          <div
            key={staff.id}
            className="group bg-surface rounded-3xl p-6 border border-outline-variant/30 hover:border-primary/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative"
          >
            {/* Nút Thùng rác xóa nằm gọn ở góc phải */}
            <button
              onClick={(e) => openDeleteModal(staff, e)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 opacity-0 group-hover:opacity-100 z-20"
              title="Bỏ yêu thích"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>

            {/* Layout Ảnh, Tên chuẩn font size nhỏ gọn & Hiển thị Số sao bên dưới tên */}
            <div className="flex flex-col items-center text-center mb-6">
              <img
                src={staff.avatar}
                alt={staff.name}
                className="w-24 h-24 rounded-full object-cover mb-4 border border-outline-variant/20"
              />
              <h2 className="text-body-lg font-semibold text-on-surface mb-1">{staff.name}</h2>
              
              {/* Hiển thị số sao đánh giá vàng đặc */}
              <div className="flex items-center gap-1 bg-primary/10 px-2.5 py-0.5 rounded-full text-xs font-bold text-primary mt-1">
                <span className="material-symbols-outlined text-sm fill-primary">star</span>
                <span>{staff.rating}</span>
              </div>
            </div>

            {/* Khối thống kê: Đổi icon tích xanh task_alt đồng bộ chuẩn hệ thống */}
            <div className="flex flex-col gap-2 mb-6 flex-1">
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-base">task_alt</span>
                <span><strong className="text-on-surface">{staff.jobsCount}</strong> công việc hoàn thành</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-base">reviews</span>
                <span><strong className="text-on-surface">{staff.reviews}</strong> đánh giá</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-base">work_history</span>
                <span><strong className="text-on-surface">{staff.experience}</strong> kinh nghiệm</span>
              </div>
            </div>

            {/* Cặp nút Hành động */}
            <div className="flex items-center gap-3 mt-auto w-full">
              <Link
                to={`/staff/${staff.id}`}
                className="w-1/3 text-center py-3 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors text-sm active:scale-95"
              >
                Hồ sơ
              </Link>
              <button
                onClick={() => navigate('/messages')}
                className="flex-1 bg-primary text-on-primary font-bold py-3 rounded-xl hover:opacity-90 shadow-sm transition-all text-sm flex items-center justify-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">chat</span>
                Nhắn tin
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Phân trang: Xem tất cả / Thu gọn */}
      {staffList.length > 8 && (
        <div className="flex justify-center mt-12">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 bg-surface border border-outline-variant/50 hover:border-primary text-primary font-bold px-6 py-3 rounded-2xl text-sm shadow-sm hover:shadow transition-all duration-200 active:scale-95"
          >
            <span>{isExpanded ? 'Thu gọn danh sách' : 'Xem tất cả thành viên'}</span>
            <span className={`material-symbols-outlined text-lg transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              keyboard_arrow_down
            </span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {staffList.length === 0 && (
        <div className="text-center py-20 bg-surface rounded-3xl border-2 border-dashed border-outline-variant/50">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">person_off</span>
          <h3 className="text-xl font-bold text-on-surface mb-2">Danh sách trống</h3>
          <p className="text-on-surface-variant max-w-xs mx-auto mb-8 text-body-md">
            Bạn chưa lưu nhân viên nào vào danh sách yêu thích của mình.
          </p>
          <button 
            onClick={() => navigate('/services')}
            className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            Khám phá dịch vụ ngay
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* HIGH-END MODAL UX SIÊU TỐC (150ms PHẢN HỒI TỨC THÌ)        */}
      {/* ========================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          
          {/* Backdrop mờ hậu cảnh */}
          <div 
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-150 ease-out ${
              modalAnimate ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeDeleteModal}
          />
          
          {/* Thân Modal phóng to nẩy nhẹ */}
          <div 
            className={`bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative z-10 border border-outline-variant/30 text-center transform transition-all duration-150 ease-out ${
              modalAnimate ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
            }`}
          >
            <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-2xl">delete_forever</span>
            </div>
            
            <h3 className="text-body-lg font-bold text-on-surface mb-2">
              Bỏ lưu nhân viên?
            </h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Bạn có chắc chắn muốn bỏ nhân viên <span className="font-bold text-on-surface">{selectedStaff?.name}</span> khỏi danh sách yêu thích không?
            </p>
            
            <div className="flex items-center gap-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 bg-outline-variant/20 hover:bg-outline-variant/40 text-on-surface font-bold py-3 rounded-xl text-xs transition-all active:scale-95"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDeleteStaff}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-xs shadow-md shadow-red-500/10 transition-all active:scale-95"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default SavedStaffPage;