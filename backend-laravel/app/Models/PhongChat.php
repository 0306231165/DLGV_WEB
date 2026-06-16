<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PhongChat extends Model
{
    protected $table = 'PhongChat';
    public $timestamps = false;
    protected $guarded = ['id'];

    public function khachHang()
    {
        return $this->belongsTo(KhachHang::class, 'khach_hang_id');
    }
    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'nhan_vien_id');
    }
    public function donHang()
    {
        return $this->belongsTo(DonHang::class, 'don_hang_id');
    }
    public function tinNhan()
    {
        return $this->hasMany(TinNhan::class, 'phong_chat_id');
    }
}
