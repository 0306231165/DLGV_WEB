<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TinNhan extends Model
{
    protected $table = 'TinNhan';
    public $timestamps = false;
    protected $guarded = ['id'];

    public function phongChat()
    {
        return $this->belongsTo(PhongChat::class, 'phong_chat_id');
    }

    // Quan hệ Đa hình: Lấy người gửi tin (User/NV/Admin)
    public function nguoiGui()
    {
        return $this->morphTo('nguoi_gui', 'nguoi_gui_loai', 'nguoi_gui_id');
    }
}
