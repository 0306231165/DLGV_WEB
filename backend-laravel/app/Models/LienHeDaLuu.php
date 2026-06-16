<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LienHeDaLuu extends Model
{
    protected $table = 'LienHeDaLuu';
    public $timestamps = false;
    protected $guarded = ['id'];

    public function khachHang()
    {
        return $this->belongsTo(KhachHang::class, 'khach_hang_id');
    }
}
