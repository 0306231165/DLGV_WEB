<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaiKhoan extends Model
{
    use HasFactory;

    // 1. Chỉ định chính xác tên bảng
    protected $table = 'taikhoan';

    // 2. Tắt tính năng tự động cập nhật created_at và updated_at của Laravel vì bạn dùng ngay_tao
    public $timestamps = false;

    // 3. Khai báo các cột có trong DB dựa theo ảnh
    protected $fillable = [
        'so_dien_thoai',
        'mat_khau',
        'ho_ten',
        'email',
        'avatar',
        'ngay_sinh',
        'gioi_tinh',
        'loai_tai_khoan',
        'ngay_tao',
        'trang_thai',
    ];
}