<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DichVuLoaiGoi extends Model
{
    protected $table = 'DichVu_LoaiGoi';
    public $timestamps = false;
    protected $guarded = ['id'];

    public function dichVu()
    {
        return $this->belongsTo(DichVu::class, 'dich_vu_id');
    }
    public function loaiGoi()
    {
        return $this->belongsTo(LoaiGoiDichVu::class, 'loai_goi_id');
    }
}
