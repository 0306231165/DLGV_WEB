<?php
//sử dụng controller của admin
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NhomDichVuController;
use App\Http\Controllers\DichVuController;
use App\Http\Controllers\DonHangController;
use App\Http\Controllers\AdminAccountController;
use App\Http\Controllers\AdminDashboardController;

Route::middleware(['auth:sanctum', 'ability:role:admin'])->prefix('admin')->group(function () {

    // Quản lý Dịch vụ hệ thống
    Route::get('/nhom-dich-vu', [NhomDichVuController::class, 'index']);
    Route::post('/nhom-dich-vu/them', [NhomDichVuController::class, 'store']);
    Route::put('/nhom-dich-vu/{id}/sua', [NhomDichVuController::class, 'update']);

    Route::post('/dich-vu/them', [DichVuController::class, 'store']);

    // Quản lý tổng thể Đơn hàng của toàn hệ thống
    Route::get('/don-hang/tat-ca', [DonHangController::class, 'index']);
    Route::get('/don-hang/{id}/chi-tiet', [DonHangController::class, 'show']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');

    // route các trang admin
    Route::get('/admin/users', [AdminAccountController::class, 'index']);
    // Đổi trạng thái (Khóa / Mở khóa)
    Route::patch('/admin/users/{id}/status', [AdminAccountController::class, 'updateStatus']);
    // Thêm tài khoản mới (Cho nút Thêm tài khoản)
    Route::post('/admin/users', [AdminAccountController::class, 'store']);
    // Lấy 10 đơn hàng mới nhất cho Dashboard
    Route::get('/admin/recent-orders', [AdminDashboardController::class, 'recentOrders']);
    
});