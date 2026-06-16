<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CaLamViec extends Model
{
    protected $table = 'CaLamViec';
    public $timestamps = false;
    protected $guarded = ['id'];

    public function donHang()
    {
        return $this->belongsTo(DonHang::class, 'don_hang_id');
    }
    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'nhan_vien_id');
    }
    public function dichVu()
    {
        return $this->belongsTo(DichVu::class, 'dich_vu_id');
    }
}
