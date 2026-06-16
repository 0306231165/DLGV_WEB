<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThongTinNganHang extends Model
{
    protected $table = 'ThongTinNganHang';
    public $timestamps = false;
    protected $guarded = ['id'];

    public function taiKhoan()
    {
        return $this->belongsTo(TaiKhoan::class, 'tai_khoan_id');
    }
}
