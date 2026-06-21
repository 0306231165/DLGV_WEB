<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NhanVienController;
use App\Http\Controllers\CaLamViecController;
use App\Http\Controllers\PhongChatController;

Route::middleware(['auth:sanctum', 'ability:role:nhan-vien'])->prefix('nhan-vien')->group(function () {

    // Hồ sơ nhân viên
    Route::get('/profile', [NhanVienController::class, 'profile']);
    
    // Dashboard (Thống kê & lịch làm việc)
    Route::get('/dashboard', [NhanVienController::class, 'dashboard']);

    // Ví và Thu nhập
    Route::get('/wallet', [NhanVienController::class, 'wallet']);

    // Quản lý ca làm việc (Nhận ca / Cập nhật tiến độ dọn dẹp)
    Route::get('/ca-lam/cho-nhan', [CaLamViecController::class, 'getAvailableJobs']); 
    Route::post('/ca-lam/{id}/bam-nhan', [CaLamViecController::class, 'acceptJob']); 
    Route::put('/ca-lam/{id}/cap-nhat', [CaLamViecController::class, 'updateProgress']); 

    // Chat với khách
    Route::get('/phong-chat/{id}/tin-nhan', [PhongChatController::class, 'getMessages']);
    Route::post('/phong-chat/{id}/gui-tin', [PhongChatController::class, 'sendMessage']);

});
