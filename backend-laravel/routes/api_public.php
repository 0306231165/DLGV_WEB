<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DichVuController;
use App\Http\Controllers\NhanVienController;

// Lấy danh sách dịch vụ hệ thống (Chỗ bạn đang thắc mắc đây!)
Route::get('/dich-vu', [DichVuController::class, 'getServicesPageData']);
Route::get('/dich-vu/{id}', [DichVuController::class, 'getServiceDetail']);

// Lấy nhân viên nổi bật (Bứng từ api_nhan_vien.php qua đây)
Route::get('/nhan-vien/noi-bat', [NhanVienController::class, 'getFeaturedStaff']);
Route::get('/nhan-vien/{id}', [NhanVienController::class, 'show']);