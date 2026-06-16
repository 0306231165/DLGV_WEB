<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// NHÓM API KHÔNG CẦN ĐĂNG NHẬP (Public)
Route::post('/khach-hang/dang-ky', [AuthController::class, 'registerKhachHang']);
Route::post('/khach-hang/dang-nhap', [AuthController::class, 'loginKhachHang']);
Route::post('/nhan-vien/dang-nhap', [AuthController::class, 'loginNhanVien']);
Route::post('/admin/dang-nhap', [AuthController::class, 'loginAdmin']);

// NHÓM API BẮT BUỘC ĐÃ ĐĂNG NHẬP MỚI ĐƯỢC GỌI (Protected)
Route::middleware('auth:sanctum')->group(function () {
    
    // Đăng xuất gọi chung 1 đường link, ai đang login thì người đó bị văng
    Route::post('/dang-xuat', [AuthController::class, 'logout']);
    Route::get('/me',         [AuthController::class, 'me']);
    // Tương lai bạn viết thêm các API ở đây: Lấy thông tin user, đổi mật khẩu...
    
});