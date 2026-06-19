<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DonHangController;
use App\Http\Controllers\PhongChatController;
use App\Http\Controllers\KhuyenMaiController;
use App\Http\Controllers\KhachHangController;
use App\Http\Controllers\ViTienController;
use App\Http\Controllers\NhanVienController;

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

    // ─── Liên hệ đã lưu ───────────────────────────────────────────────────────
    Route::get('/lien-he', [KhachHangController::class, 'getContacts']);
    Route::post('/lien-he/them', [KhachHangController::class, 'storeContact']);
    Route::delete('/lien-he/{id}', [KhachHangController::class, 'deleteContact']);

    // ─── Khuyến mãi ───────────────────────────────────────────────────────────
    Route::get('/khuyen-mai/cua-toi', [KhuyenMaiController::class, 'getMyVouchers']);
    Route::post('/khuyen-mai/luu', [KhuyenMaiController::class, 'luuKhuyenMai']);

    // ─── Thanh toán (Thẻ & MoMo) ──────────────────────────────────────────────
    Route::get('/thanh-toan', [KhachHangController::class, 'getPaymentMethods']);
    Route::post('/thanh-toan/them-the', [KhachHangController::class, 'addCard']);
    Route::delete('/thanh-toan/{id}', [KhachHangController::class, 'deletePaymentMethod']);
    Route::post('/thanh-toan/momo/lien-ket', [KhachHangController::class, 'linkMomo']);
    Route::delete('/thanh-toan/momo/huy-lien-ket', [KhachHangController::class, 'unlinkMomo']);

    // ─── Ví tiền ──────────────────────────────────────────────────────────────
    Route::prefix('vi-tien')->group(function () {
        Route::get('/',          [ViTienController::class, 'index']);          // Lấy số dư + lịch sử
        Route::post('/nap',      [ViTienController::class, 'napTien']);        // Nạp tiền
        Route::post('/rut',      [ViTienController::class, 'rutTien']);        // Rút tiền
        Route::get('/ngan-hang', [ViTienController::class, 'getNganHangDaLuu']); // Ngân hàng đã lưu
    });

    // ─── Nhân viên yêu thích ──────────────────────────────────────────────────────
    Route::prefix('nhan-vien-yeu-thich')->group(function () {
        Route::get('/',        [NhanVienController::class, 'getYeuThich']);    // Lấy danh sách
        Route::post('/{id}',   [NhanVienController::class, 'themYeuThich']);   // Thêm
        Route::delete('/{id}', [NhanVienController::class, 'xoaYeuThich']);   // Xóa
    });
 
// ─── Nhân viên đã từng làm (để picker chọn yêu thích) ────────────────────────
Route::get('/nhan-vien-da-lam', [NhanVienController::class, 'getNhanVienDaLam']);

    // ─── Đặt lịch ─────────────────────────────────────────────────────────────
    Route::post('/don-hang/dat-lich', [DonHangController::class, 'store']);

    // ─── Phòng chat ───────────────────────────────────────────────────────────
    Route::get('/phong-chat/{id}/tin-nhan', [PhongChatController::class, 'getMessages']);
    Route::post('/phong-chat/{id}/gui-tin', [PhongChatController::class, 'sendMessage']);
});
