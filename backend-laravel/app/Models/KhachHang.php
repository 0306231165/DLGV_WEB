<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KhachHang extends Model
{
    protected $table = 'KhachHang';
    public $timestamps = false;
    protected $guarded = ['id'];

    public function taiKhoan()
    {
        return $this->belongsTo(TaiKhoan::class, 'tai_khoan_id');
    }
    public function diaChiDaLuu()
    {
        return $this->hasMany(DiaChiDaLuu::class, 'khach_hang_id');
    }
    public function lienHeDaLuu()
    {
        return $this->hasMany(LienHeDaLuu::class, 'khach_hang_id');
    }
    public function donHang()
    {
        return $this->hasMany(DonHang::class, 'khach_hang_id');
    }
    public function phongChat()
    {
        return $this->hasMany(PhongChat::class, 'khach_hang_id');
    }

    // Bảng Pivot NhanVienYeuThich
    public function nhanVienYeuThich()
    {
        return $this->belongsToMany(NhanVien::class, 'NhanVienYeuThich', 'khach_hang_id', 'nhan_vien_id');
    }
    // Bảng Pivot KhachHang_KhuyenMai
    public function khuyenMaiDaLuu()
    {
        return $this->belongsToMany(KhuyenMai::class, 'KhachHang_KhuyenMai', 'khach_hang_id', 'khuyen_mai_id')
            ->withPivot('ngay_luu', 'ngay_su_dung', 'trang_thai_luu');
    }
}
