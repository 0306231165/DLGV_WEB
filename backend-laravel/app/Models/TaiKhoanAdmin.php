<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable; // Dùng Authenticatable để có thể Đăng nhập
use Laravel\Sanctum\HasApiTokens; // Cấp Token sau khi đăng nhập thành công

class TaiKhoanAdmin extends Authenticatable
{
    use HasApiTokens;

    // Chỉ định đích danh tên bảng
    protected $table = 'taikhoanadmin';

    // Bảng này không có created_at, updated_at
    public $timestamps = false;

    // BÁO CHO LARAVEL BIẾT: "Cột mật khẩu của tôi tên là 'mat_khau' chứ không phải 'password' như mặc định"
    public function getAuthPassword()
    {
        return $this->mat_khau;
    }
}