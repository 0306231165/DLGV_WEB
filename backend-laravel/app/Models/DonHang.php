<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DonHang extends Model
{
    use HasFactory;

    // Chỉ định chính xác tên bảng trong database
    protected $table = 'donhang';

    // Tắt timestamps nếu bảng donhang không có created_at / updated_at
    // public $timestamps = false; 
}