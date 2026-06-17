<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DichVu extends Model
{
    protected $table = 'DichVu';
    public $timestamps = false;
    protected $guarded = ['id'];

    // 🌟 QUAN TRỌNG NHẤT: Thêm cast để tự động ép kiểu JSON thành Array
    protected $casts = [
        'noi_dung_chi_tiet' => 'array',
        'is_noi_bat' => 'boolean',
        'co_bien_the' => 'boolean',
        'trang_thai' => 'boolean',
    ];

    public function nhomDichVu()
    {
        return $this->belongsTo(NhomDichVu::class, 'nhom_dich_vu_id');
    }
    public function tuyChonBienThe()
    {
        return $this->hasMany(TuyChonBienTheDichVu::class, 'dich_vu_id');
    }

    // Các quan hệ qua Pivot có sẵn Model
    public function loaiGoi()
    {
        return $this->hasMany(DichVuLoaiGoi::class, 'dich_vu_id');
    }
    public function dichVuThem()
    {
        return $this->hasMany(DichVuDichVuThem::class, 'dich_vu_id');
    }
}
