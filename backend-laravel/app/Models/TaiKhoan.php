<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class TaiKhoan extends Model
{
    // Gộp cả 2 thư viện cần thiết vào một dòng
    use HasApiTokens, HasFactory;

    // Tên bảng (nên để chữ thường cho an toàn trên mọi hệ điều hành)
    protected $table = 'taikhoan';

    // Tắt tính năng tự động cập nhật created_at và updated_at
    public $timestamps = false;

    // Khai báo các cột cho phép điền dữ liệu (Mass Assignment)
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

    // ==========================================
    // MỐI QUAN HỆ GIỮA CÁC BẢNG
    // ==========================================
    public function khachHang()
    {
        return $this->hasOne(KhachHang::class, 'tai_khoan_id');
    }

    public function nhanVien()
    {
        return $this->hasOne(NhanVien::class, 'tai_khoan_id');
    }

    public function viTien()
    {
        return $this->hasOne(ViTien::class, 'tai_khoan_id');
    }

    public function thongTinNganHang()
    {
        return $this->hasMany(ThongTinNganHang::class, 'tai_khoan_id');
    }
}