<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LichSuCuocGoi extends Model
{
    protected $table = 'LichSuCuocGoi';
    public $timestamps = false;
    protected $guarded = ['id'];

    public function phongChat()
    {
        return $this->belongsTo(PhongChat::class, 'phong_chat_id');
    }

    public function nguoiGoi()
    {
        return $this->morphTo('nguoi_goi', 'nguoi_goi_loai', 'nguoi_goi_id');
    }
    public function nguoiNhan()
    {
        return $this->morphTo('nguoi_nhan', 'nguoi_nhan_loai', 'nguoi_nhan_id');
    }
}
