<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaiKhoan extends Model
{
    use HasFactory;

    // Lưu ý: Kiểm tra lại tên bảng chính xác trong DB của bạn là 'taikhoan' hay 'TaiKhoan' nhé
    protected $table = 'TaiKhoan';

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

    // Mối quan hệ giữa các bảng
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