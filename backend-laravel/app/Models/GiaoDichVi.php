<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GiaoDichVi extends Model
{
    protected $table = 'GiaoDichVi';
    public $timestamps = false;
    protected $guarded = ['id'];

    public function viTien()
    {
        return $this->belongsTo(ViTien::class, 'vi_tien_id');
    }
    public function viHeThong()
    {
        return $this->belongsTo(ViHeThong::class, 'vi_he_thong_id');
    }
}
