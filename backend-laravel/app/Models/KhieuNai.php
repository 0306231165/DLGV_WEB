<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KhieuNai extends Model
{
    protected $table = 'KhieuNai';
    public $timestamps = false;
    protected $guarded = ['id'];

    public function donHang()
    {
        return $this->belongsTo(DonHang::class, 'don_hang_id');
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
