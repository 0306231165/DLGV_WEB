<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LienHe extends Model
{
    protected $table = 'LienHe';
    public $timestamps = false;
    protected $guarded = ['id'];

    public function adminXuLy()
    {
        return $this->belongsTo(TaiKhoanAdmin::class, 'admin_xu_ly_id');
    }
}
