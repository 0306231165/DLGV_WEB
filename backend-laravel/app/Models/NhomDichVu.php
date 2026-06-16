<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NhomDichVu extends Model
{
    protected $table = 'NhomDichVu';
    public $timestamps = false;
    protected $guarded = ['id'];

    public function dichVu()
    {
        return $this->hasMany(DichVu::class, 'nhom_dich_vu_id');
    }
}
