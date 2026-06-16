<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NhomDichVuController;
use App\Http\Controllers\DichVuController;
use App\Http\Controllers\DonHangController;

Route::middleware(['auth:sanctum', 'ability:role:admin'])->prefix('admin')->group(function () {

    // Quản lý Dịch vụ hệ thống
    Route::get('/nhom-dich-vu', [NhomDichVuController::class, 'index']);
    Route::post('/nhom-dich-vu/them', [NhomDichVuController::class, 'store']);
    Route::put('/nhom-dich-vu/{id}/sua', [NhomDichVuController::class, 'update']);

    Route::post('/dich-vu/them', [DichVuController::class, 'store']);

    // Quản lý tổng thể Đơn hàng của toàn hệ thống
    Route::get('/don-hang/tat-ca', [DonHangController::class, 'index']);
    Route::get('/don-hang/{id}/chi-tiet', [DonHangController::class, 'show']);
    
});