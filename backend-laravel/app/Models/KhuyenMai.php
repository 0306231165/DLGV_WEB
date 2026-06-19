<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KhuyenMai extends Model
{
    protected $table = 'KhuyenMai';
    public $timestamps = false;
    protected $guarded = ['id'];

    protected $casts = [
        'nhom_dich_vu_id_ap_dung' => 'integer',
        'dich_vu_id_ap_dung'      => 'integer',
        'gia_tri_giam'            => 'float',
        'gia_tri_don_toi_thieu'   => 'float',
        'giam_toi_da'             => 'float',
    ];
}
