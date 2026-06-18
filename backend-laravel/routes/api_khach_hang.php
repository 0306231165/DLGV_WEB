<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DonHangController;
use App\Http\Controllers\PhongChatController;
use App\Http\Controllers\KhuyenMaiController;
use App\Http\Controllers\KhachHangController;

Route::middleware(['auth:sanctum', 'ability:role:khach-hang'])->prefix('khach-hang')->group(function () {

    // ─── Profile ──────────────────────────────────────────────────────────────
    Route::get('/profile', [KhachHangController::class, 'profile']);
    Route::put('/profile', [KhachHangController::class, 'updateProfile']);

    // ─── Địa chỉ đã lưu ───────────────────────────────────────────────────────
    Route::get('/dia-chi', [KhachHangController::class, 'getAddresses']);
    Route::post('/dia-chi/them', [KhachHangController::class, 'storeAddress']);
    Route::put('/dia-chi/{id}', [KhachHangController::class, 'updateAddress']);
    Route::delete('/dia-chi/{id}', [KhachHangController::class, 'deleteAddress']);
    Route::post('/dia-chi/{id}/mac-dinh', [KhachHangController::class, 'setDefaultAddress']);

    // ─── Khuyến mãi ───────────────────────────────────────────────────────────
    Route::get('/khuyen-mai/cua-toi', [KhuyenMaiController::class, 'getMyVouchers']);
    Route::post('/khuyen-mai/luu', [KhuyenMaiController::class, 'luuKhuyenMai']);

    // ─── Đặt lịch ─────────────────────────────────────────────────────────────
    Route::post('/don-hang/dat-lich', [DonHangController::class, 'store']);

    // ─── Phòng chat ───────────────────────────────────────────────────────────
    Route::get('/phong-chat/{id}/tin-nhan', [PhongChatController::class, 'getMessages']);
    Route::post('/phong-chat/{id}/gui-tin', [PhongChatController::class, 'sendMessage']);

});