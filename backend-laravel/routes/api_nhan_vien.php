<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NhanVienController;
use App\Http\Controllers\CaLamViecController;
use App\Http\Controllers\PhongChatController;
use App\Http\Controllers\ThongBaoController;

Route::middleware(['auth:sanctum', 'ability:role:nhan-vien'])->prefix('nhan-vien')->group(function () {

    // Hồ sơ nhân viên
    Route::get('/profile', [NhanVienController::class, 'profile']);
    
    // Dashboard (Thống kê & lịch làm việc)
    Route::get('/dashboard', [NhanVienController::class, 'dashboard']);

    // Ví và Thu nhập
    Route::get('/wallet', [NhanVienController::class, 'wallet']);
    Route::post('/wallet/deposit', [NhanVienController::class, 'deposit']);
    Route::post('/wallet/nhan-luong', [NhanVienController::class, 'nhanLuong']);
    Route::post('/wallet/withdraw', [NhanVienController::class, 'withdraw']);

    // Quản lý ca làm việc (Nhận ca / Cập nhật tiến độ dọn dẹp)
    Route::get('/ca-lam/cho-nhan', [CaLamViecController::class, 'getAvailableJobs']); 
    Route::get('/ca-lam/da-nhan', [CaLamViecController::class, 'getAcceptedJobs']); 
    Route::get('/ca-lam/lich-lam-viec', [CaLamViecController::class, 'getWorkingSchedule']); 
    Route::get('/ca-lam/lich-su', [CaLamViecController::class, 'getJobHistory']); 
    Route::get('/ca-lam/thong-ke-huy', [CaLamViecController::class, 'getCancelStatistics']); 
    Route::post('/ca-lam/{id}/bam-nhan', [CaLamViecController::class, 'acceptJob']); 
    Route::post('/ca-lam/{id}/tu-choi', [CaLamViecController::class, 'rejectJob']); 
    Route::post('/ca-lam/{id}/huy-ca', [CaLamViecController::class, 'cancelAcceptedJob']);
    Route::post('/ca-lam/{id}/huy-hop-dong', [CaLamViecController::class, 'cancelContract']);
    Route::put('/ca-lam/{id}/cap-nhat', [CaLamViecController::class, 'updateProgress']); 

    // Chat với khách
    Route::get('/phong-chat/danh-sach', [PhongChatController::class, 'getStaffRooms']);
    Route::get('/phong-chat/{id}/tin-nhan', [PhongChatController::class, 'getMessages']);
    Route::post('/phong-chat/{id}/gui-tin', [PhongChatController::class, 'sendMessage']);
    Route::get('/phong-chat/{id}/chi-tiet-don', [PhongChatController::class, 'getRoomOrderDetails']);

    // Lịch nghỉ (Cam kết)
    Route::get('/lich-nghi/cam-ket', [NhanVienController::class, 'getCamKetLichNghi']);
    Route::post('/lich-nghi/cam-ket', [NhanVienController::class, 'saveCamKetLichNghi']);
    Route::delete('/lich-nghi/cam-ket', [NhanVienController::class, 'cancelCamKetLichNghi']);
    Route::get('/lich-nghi/dot-xuat', [NhanVienController::class, 'getBlockedDates']);
    Route::post('/lich-nghi/dot-xuat', [NhanVienController::class, 'saveBlockedDates']);
    // Danh sách đánh giá
    Route::get('/reviews', [NhanVienController::class, 'getReviews']);

    // Đăng ký dịch vụ (kỹ năng)
    Route::get('/dich-vu-dang-ky', [NhanVienController::class, 'getSkills']);
    Route::post('/dich-vu-dang-ky/{id}/dang-ky', [NhanVienController::class, 'registerSkill']);
    Route::delete('/dich-vu-dang-ky/{id}/huy', [NhanVienController::class, 'cancelSkill']);

    // Thông báo cho nhân viên
    Route::prefix('thong-bao')->group(function () {
        Route::get('/', [ThongBaoController::class, 'getStaffNotifications']);
        Route::post('/{id}/doc', [ThongBaoController::class, 'markStaffAsRead']);
        Route::post('/doc-tat-ca', [ThongBaoController::class, 'markAllStaffAsRead']);
    });

});
