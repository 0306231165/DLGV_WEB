<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class YeuCauXuLy extends Model
{
    protected $table = 'YeuCauXuLy';
    public $timestamps = false;
    protected $guarded = ['id'];

    public function donHang()
    {
        return $this->belongsTo(DonHang::class, 'don_hang_id');
    }
    public function caLamViec()
    {
        return $this->belongsTo(CaLamViec::class, 'ca_lam_viec_id');
    }

    // Quan hệ Đa hình: Lấy ra Khách Hàng hoặc Nhân Viên yêu cầu
    public function nguoiYeuCau()
    {
        return $this->morphTo('nguoi_yeu_cau', 'nguoi_yeu_cau_loai', 'nguoi_yeu_cau_id');
    }
}
