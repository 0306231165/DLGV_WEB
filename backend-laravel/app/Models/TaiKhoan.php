<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaiKhoan extends Model
{
    protected $table = 'TaiKhoan';
    public $timestamps = false;
    protected $guarded = ['id'];

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
