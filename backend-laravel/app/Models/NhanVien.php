<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NhanVien extends Model
{
    protected $table = 'NhanVien';
    public $timestamps = false;
    protected $guarded = ['id'];

    public function taiKhoan()
    {
        return $this->belongsTo(TaiKhoan::class, 'tai_khoan_id');
    }
    public function lichNghi()
    {
        return $this->hasMany(LichNghi::class, 'nhan_vien_id');
    }
    public function caLamViec()
    {
        return $this->hasMany(CaLamViec::class, 'nhan_vien_id');
    }

    // Bảng Pivot NhanVien_DichVu
    public function dichVuDangKy()
    {
        return $this->belongsToMany(DichVu::class, 'NhanVien_DichVu', 'nhan_vien_id', 'dich_vu_id')
            ->withPivot('trang_thai_duyet', 'ngay_dang_ky', 'ngay_duyet');
    }
}
