<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TuyChonBienTheDichVu extends Model
{
    protected $table = 'TuyChonBienTheDichVu';
    public $timestamps = false;
    protected $guarded = ['id'];

    public function dichVu()
    {
        return $this->belongsTo(DichVu::class, 'dich_vu_id');
    }
}
