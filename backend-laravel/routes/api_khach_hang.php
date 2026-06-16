<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\KhachHangController;
use App\Http\Controllers\DonHangController;
use App\Http\Controllers\PhongChatController;

Route::middleware(['auth:sanctum', 'ability:role:khach-hang'])->prefix('khach-hang')->group(function () {

    // Tài khoản & Địa chỉ (Gọi lồng trong KhachHangController)
    Route::get('/profile', [KhachHangController::class, 'profile']);
    Route::get('/dia-chi', [KhachHangController::class, 'getAddresses']);
    Route::post('/dia-chi/them', [KhachHangController::class, 'storeAddress']);

    // Đặt lịch giúp việc
    Route::post('/don-hang/dat-lich', [DonHangController::class, 'store']); 

    // Giao tiếp qua phòng chat
    Route::get('/phong-chat/{id}/tin-nhan', [PhongChatController::class, 'getMessages']);
    Route::post('/phong-chat/{id}/gui-tin', [PhongChatController::class, 'sendMessage']);
    
});