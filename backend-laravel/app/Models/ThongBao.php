<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThongBao extends Model
{
    protected $table = 'ThongBao';
    public $timestamps = false;
    protected $guarded = ['id'];

    // Lấy người nhận thông báo
    public function nguoiNhan()
    {
        return $this->morphTo('nguoi_nhan', 'loai_nguoi_nhan', 'nguoi_nhan_id');
    }
    // Đối tượng sinh ra thông báo (DonHang, CaLamViec, KhieuNai...)
    public function doiTuong()
    {
        return $this->morphTo('doi_tuong', 'loai_doi_tuong', 'doi_tuong_id');
    }
}
