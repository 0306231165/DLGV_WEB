<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Service; 

//sử dụng controller của admin
use App\Http\Controllers\AdminAccountController;
use App\Http\Controllers\AdminDashboardController;

require __DIR__ . '/api_auth.php';         // Cổng đăng nhập
require __DIR__ . '/api_khach_hang.php';   // Route của Khách
require __DIR__ . '/api_nhan_vien.php';    // Route của Nhân viên
require __DIR__ . '/api_admin.php';        // Route của Admin
