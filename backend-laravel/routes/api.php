<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Import AuthController vào đây
use App\Http\Controllers\AuthController; 

// ========================================================
// ĐƯA TRỰC TIẾP ROUTE ĐĂNG NHẬP RA ĐÂY ĐỂ ĐẢM BẢO CHẠY 100%
// ========================================================
Route::post('/admin/dang-nhap', [AuthController::class, 'loginAdmin']);


// Các file require khác vẫn giữ nguyên
require __DIR__ . '/api_khach_hang.php';
require __DIR__ . '/api_nhan_vien.php';
require __DIR__ . '/api_admin.php';