<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// 1. Chỉ dành cho khách vãng lai / Trang chủ / Form tư vấn
require __DIR__ . '/api_public.php';       
require __DIR__ . '/api_auth.php';         

// 2. Tách biệt hoàn toàn theo Role
require __DIR__ . '/api_khach_hang.php';   
require __DIR__ . '/api_nhan_vien.php';    
require __DIR__ . '/api_admin.php';
