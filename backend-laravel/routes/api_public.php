<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DichVuController;
use App\Http\Controllers\NhanVienController;
use App\Http\Controllers\KhuyenMaiController;

// Lấy danh sách dịch vụ hệ thống
Route::get('/dich-vu', [DichVuController::class, 'getServicesPageData']);
Route::get('/dich-vu/{id}', [DichVuController::class, 'getServiceDetail']);

// Lấy nhân viên nổi bật
Route::get('/nhan-vien/noi-bat', [NhanVienController::class, 'getFeaturedStaff']);
Route::get('/nhan-vien/{id}', [NhanVienController::class, 'show']);

// Lấy danh sách khuyến mãi đang có hiệu lực
Route::get('/khuyen-mai', [KhuyenMaiController::class, 'getPublicVouchers']);