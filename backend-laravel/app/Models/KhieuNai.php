<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KhieuNai extends Model
{
    protected $table = 'KhieuNai';
    public $timestamps = false;
    protected $guarded = ['id'];

    protected $casts = [
        'is_visible' => 'boolean',
        'rating' => 'integer',
        'ngay_tao' => 'datetime',
        'ngay_dong' => 'datetime',
    ];

    public function caLamViec()
    {
        return $this->belongsTo(CaLamViec::class, 'ca_lam_viec_id');
    }
    public function adminXuLy()
    {
        return $this->belongsTo(TaiKhoanAdmin::class, 'admin_xu_ly_id');
    }

    // Quan hệ Đa hình: Lấy ra Khách Hàng hoặc Nhân Viên khiếu nại
    public function nguoiKhieuNai()
    {
        return $this->morphTo('nguoi_khieu_nai', 'nguoi_khieu_nai_loai', 'nguoi_khieu_nai_id');
    }
}
