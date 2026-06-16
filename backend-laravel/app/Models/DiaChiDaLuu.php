<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiaChiDaLuu extends Model
{
    protected $table = 'DiaChiDaLuu';
    public $timestamps = false;
    protected $guarded = ['id'];

    public function khachHang()
    {
        return $this->belongsTo(KhachHang::class, 'khach_hang_id');
    }
}
