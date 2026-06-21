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

    public function yeuCauDoiLich()
    {
        return $this->hasOne(YeuCauXuLy::class, 'ca_lam_viec_id')
                    ->where('loai_yeu_cau', 'DoiLich')
                    ->where('trang_thai_duyet', 'ChoXuLy')
                    ->latest('thoi_gian');
    }

    public function khieuNai()
    {
        return $this->hasOne(KhieuNai::class, 'ca_lam_viec_id')
                    ->where('nguoi_khieu_nai_loai', 'KhachHang')
                    ->latest('ngay_tao');
    }
}
