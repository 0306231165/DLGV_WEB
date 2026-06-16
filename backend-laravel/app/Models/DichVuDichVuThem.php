<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DichVuDichVuThem extends Model
{
    protected $table = 'DichVu_DichVuThem';
    public $timestamps = false;
    protected $guarded = ['id'];

    public function dichVu()
    {
        return $this->belongsTo(DichVu::class, 'dich_vu_id');
    }
    public function dichVuThem()
    {
        return $this->belongsTo(DichVuThem::class, 'dich_vu_them_id');
    }
}
