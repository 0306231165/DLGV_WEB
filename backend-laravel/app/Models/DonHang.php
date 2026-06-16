<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DonHang extends Model
{
    use HasFactory;

    // Lưu ý: Hãy kiểm tra tên bảng trong database của bạn là 'DonHang' hay 'donhang' để đồng bộ nhé
    protected $table = 'DonHang';
    
    public $timestamps = false;
    protected $guarded = ['id'];

    public function khachHang()
    {
        return $this->belongsTo(KhachHang::class, 'khach_hang_id');
    }

    public function dichVuLoaiGoi()
    {
        return $this->belongsTo(DichVuLoaiGoi::class, 'dich_vu_loai_goi_id');
    }

    public function khuyenMai()
    {
        return $this->belongsTo(KhuyenMai::class, 'khuyen_mai_id');
    }

    public function nhanVienYeuCau()
    {
        return $this->belongsTo(NhanVien::class, 'nhan_vien_duoc_yeu_cau_id');
    }

    public function caLamViec()
    {
        return $this->hasMany(CaLamViec::class, 'don_hang_id');
    }

    // Bảng Pivot DonHang_DichVuThem
    public function dichVuThemDaChon()
    {
        return $this->belongsToMany(DichVuDichVuThem::class, 'DonHang_DichVuThem', 'don_hang_id', 'dich_vu_dich_vu_them_id')
            ->withPivot('so_luong', 'gia_luc_dat');
    }
}