<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ViTien extends Model
{
    protected $table = 'ViTien';
    public $timestamps = false;
    protected $guarded = ['id'];

    public function taiKhoan()
    {
        return $this->belongsTo(TaiKhoan::class, 'tai_khoan_id');
    }
    public function giaoDich()
    {
        return $this->hasMany(GiaoDichVi::class, 'vi_tien_id');
    }
}
