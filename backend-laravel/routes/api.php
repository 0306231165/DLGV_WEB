<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Service; 

//sử dụng controller của admin
use App\Http\Controllers\AdminAccountController;
use App\Http\Controllers\AdminDashboardController;

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