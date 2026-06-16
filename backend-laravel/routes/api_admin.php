<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\NhomDichVuController;
use App\Http\Controllers\DichVuController;
use App\Http\Controllers\DonHangController;
use App\Http\Controllers\AdminAccountController;
use App\Http\Controllers\AdminDashboardController;

// --- CÁC ROUTE ĐANG LÀM GIAO DIỆN CHƯA CẦN BẢO MẬT (Để ra ngoài này) ---
Route::prefix('admin')->group(function () {
    Route::get('/users', [AdminAccountController::class, 'index']);
    Route::patch('/users/{id}/status', [AdminAccountController::class, 'updateStatus']);
    Route::post('/users', [AdminAccountController::class, 'store']);
    Route::get('/recent-orders', [AdminDashboardController::class, 'recentOrders']);
    Route::delete('/users/{id}', [AdminAccountController::class, 'destroy']);
});

// --- CÁC ROUTE CẦN ĐĂNG NHẬP MỚI ĐƯỢC XEM (Để trong này) ---
Route::middleware(['auth:sanctum', 'ability:role:admin'])->prefix('admin')->group(function () {
    Route::get('/nhom-dich-vu', [NhomDichVuController::class, 'index']);
    Route::post('/nhom-dich-vu/them', [NhomDichVuController::class, 'store']);
    Route::put('/nhom-dich-vu/{id}/sua', [NhomDichVuController::class, 'update']);

    Route::post('/dich-vu/them', [DichVuController::class, 'store']);

    Route::get('/don-hang/tat-ca', [DonHangController::class, 'index']);
    Route::get('/don-hang/{id}/chi-tiet', [DonHangController::class, 'show']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});