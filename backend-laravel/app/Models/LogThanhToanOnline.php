<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogThanhToanOnline extends Model
{
    protected $table = 'LogThanhToanOnline';
    public $timestamps = false;
    protected $guarded = ['id'];

    public function donHang()
    {
        return $this->belongsTo(DonHang::class, 'don_hang_id');
    }
}
