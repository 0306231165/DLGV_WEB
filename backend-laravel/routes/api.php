<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

require __DIR__ . '/api_auth.php';         // Cổng đăng nhập
require __DIR__ . '/api_khach_hang.php';   // Route của Khách
require __DIR__ . '/api_nhan_vien.php';    // Route của Nhân viên
require __DIR__ . '/api_admin.php';        // Route của Admin
