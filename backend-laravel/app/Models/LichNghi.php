<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LichNghi extends Model
{
    protected $table = 'LichNghi';
    public $timestamps = false;
    protected $guarded = ['id'];

    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'nhan_vien_id');
    }
}
