<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\DonHang;
use App\Models\ThongBao;
use App\Models\PhongChat;
use App\Models\TinNhan;

class DonHangController extends Controller
{
    /**
     * POST /api/khach-hang/dat-lich
     * Nhận 1 request gộp donhang + mảng calamviec, xử lý trong 1 transaction.
     */
    public function store(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            // ── Đơn hàng ──────────────────────────────────────────────────
            'dich_vu_loai_goi_id'             => 'required|integer|exists:dichvu_loaigoi,id',
            'tuy_chon_bien_the_id'            => 'nullable|integer|exists:tuychonbienthedichvu,id',
            'so_luong_tuy_chon'               => 'nullable|integer|min:1',
            'khuyen_mai_id'                   => 'nullable|integer|exists:khuyenmai,id',
            'nhan_vien_duoc_yeu_cau_id'       => 'nullable|integer|exists:nhanvien,id',
            'phuong_an_thay_the'              => 'nullable|in:TimNhanVienYeuThich,TimNhanVienTieuChuan,KhongTimThayThe',
            'is_giu_nhan_vien'                => 'boolean',
            'tong_so_buoi'                    => 'required|integer|min:1',
            'is_lap_lai_hang_tuan'            => 'required|boolean',
            'cac_ngay_trong_tuan'             => 'nullable|string|max:50',
            'gio_lam_mac_dinh'                => 'nullable|date_format:H:i',
            'so_thang_goi_thang'              => 'nullable|integer|min:1',
            'ca_lam_247'                      => 'nullable|string|max:50',
            'so_ngay_goi_247'                 => 'nullable|integer|min:1',
            'tld_giam_goi_thang'              => 'nullable|integer|min:0',
            'ngay_bat_dau'                    => 'required|date',
            'ngay_ket_thuc'                   => 'required|date|after_or_equal:ngay_bat_dau',
            'ho_ten_thuc_te'                  => 'required|string|max:150',
            'sdt_thuc_te'                     => 'required|string|max:15',
            'dia_chi_thuc_te'                 => 'required|string|max:255',
            'vi_do'                           => 'nullable|numeric',
            'kinh_do'                         => 'nullable|numeric',
            'ghi_chu_cho_nhan_vien'           => 'nullable|string|max:1000',
            'is_cao_cap'                      => 'boolean',
            'ty_le_phu_phi_cao_cap_snapshot'  => 'nullable|integer|min:0',
            'phu_phi_cao_cap'                 => 'nullable|numeric|min:0',
            'co_thu_cung'                     => 'boolean',
            'uu_tien_nv_yt'                   => 'boolean',
            'phu_phi_chon_nhan_vien'          => 'nullable|numeric|min:0',
            'don_gia_co_ban'                  => 'nullable|numeric|min:0',
            'tong_tien_ban_dau'               => 'required|numeric|min:0',
            'phu_phi_dat_gap'                 => 'nullable|numeric|min:0',
            'tong_tien_cuoi_cung'             => 'required|numeric|min:0',
            'tien_giam_giu'                   => 'nullable|numeric|min:0',
            'phuong_thuc_tt'                  => 'required|in:ViTien,ChuyenKhoan,Online,TienMat',

            // ── Mảng ca làm việc ──────────────────────────────────────────
            // min:0 vì 24/7 không sinh ca trước
            'ca_lam_viec' => 'present|array',
            'ca_lam_viec.*.dich_vu_id'             => 'required|integer|exists:dichvu,id',
            'ca_lam_viec.*.ngay_lam'               => 'required|date',
            'ca_lam_viec.*.gio_bat_dau'            => 'required|date_format:H:i',
            'ca_lam_viec.*.thoi_gian_lam_phut'     => 'required|integer|min:30',
            'ca_lam_viec.*.loai_goi_ca_lam'        => 'required|in:CaLe,GoiThang,Goi247',
            'ca_lam_viec.*.dia_chi_lam_viec'       => 'required|string|max:255',
            'ca_lam_viec.*.gia_ca_nay'             => 'required|numeric|min:0',
            'ca_lam_viec.*.trang_thai_ca'          => 'nullable|in:ChoXacNhan,ChoNhanVienChiDinhXacNhan,ChoNhanVienTuDoNhan',
            'ca_lam_viec.*.loai_ghep'              => 'nullable|in:TuDong,ThuCong',
            'ca_lam_viec.*.chi_tiet_dich_vu_them'  => 'nullable|string',

            // ── Mảng dịch vụ thêm (donhang_dichvuthem) ─────────────────────
            'dich_vu_them'                              => 'nullable|array',
            'dich_vu_them.*.dich_vu_dich_vu_them_id'     => 'required|integer|exists:dichvu_dichvuthem,id',
            'dich_vu_them.*.so_luong'                    => 'nullable|integer|min:1',
            'dich_vu_them.*.gia_luc_dat'                 => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            // 1. Lấy khach_hang từ user đang đăng nhập
            $khachHang = $request->user()->khachHang;
            if (!$khachHang) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy hồ sơ khách hàng.',
                ], 404);
            }

            // 2. Tạo donhang
            $donHang = DonHang::create([
                'khach_hang_id'                  => $khachHang->id,
                'dich_vu_loai_goi_id'            => $validated['dich_vu_loai_goi_id'],
                'tuy_chon_bien_the_id'           => $validated['tuy_chon_bien_the_id']           ?? null,
                'so_luong_tuy_chon'              => $validated['so_luong_tuy_chon']              ?? 1,
                'khuyen_mai_id'                  => $validated['khuyen_mai_id']                  ?? null,
                'nhan_vien_duoc_yeu_cau_id'      => $validated['nhan_vien_duoc_yeu_cau_id']      ?? null,
                'phuong_an_thay_the'             => $validated['phuong_an_thay_the']             ?? null,
                'is_giu_nhan_vien'               => $validated['is_giu_nhan_vien']               ?? false,
                'tong_so_buoi'                   => $validated['tong_so_buoi'],
                'is_lap_lai_hang_tuan'           => $validated['is_lap_lai_hang_tuan'],
                'cac_ngay_trong_tuan'            => $validated['cac_ngay_trong_tuan']            ?? null,
                'gio_lam_mac_dinh'               => $validated['gio_lam_mac_dinh']               ?? null,
                'so_thang_goi_thang'             => $validated['so_thang_goi_thang']             ?? null,
                'ca_lam_247'                     => $validated['ca_lam_247']                     ?? null,
                'so_ngay_goi_247'                => $validated['so_ngay_goi_247']                ?? null,
                'tld_giam_goi_thang'             => $validated['tld_giam_goi_thang']             ?? 0,
                'ngay_bat_dau'                   => $validated['ngay_bat_dau'],
                'ngay_ket_thuc'                  => $validated['ngay_ket_thuc'],
                'ho_ten_thuc_te'                 => $validated['ho_ten_thuc_te'],
                'sdt_thuc_te'                    => $validated['sdt_thuc_te'],
                'dia_chi_thuc_te'                => $validated['dia_chi_thuc_te'],
                'vi_do'                          => $validated['vi_do']                          ?? null,
                'kinh_do'                        => $validated['kinh_do']                        ?? null,
                'ghi_chu_cho_nhan_vien'          => $validated['ghi_chu_cho_nhan_vien']          ?? null,
                'is_cao_cap'                     => $validated['is_cao_cap']                     ?? false,
                'ty_le_phu_phi_cao_cap_snapshot' => $validated['ty_le_phu_phi_cao_cap_snapshot'] ?? 0,
                'phu_phi_cao_cap'                => $validated['phu_phi_cao_cap']                ?? 0,
                'co_thu_cung'                    => $validated['co_thu_cung']                    ?? false,
                'uu_tien_nv_yt'                  => $validated['uu_tien_nv_yt']                  ?? false,
                'phu_phi_chon_nhan_vien'         => $validated['phu_phi_chon_nhan_vien']         ?? 0,
                'don_gia_co_ban'                 => $validated['don_gia_co_ban']                 ?? null,
                'tong_tien_ban_dau'              => $validated['tong_tien_ban_dau'],
                'phu_phi_dat_gap'                => $validated['phu_phi_dat_gap']                ?? 0,
                'tong_tien_cuoi_cung'            => $validated['tong_tien_cuoi_cung'],
                'tien_giam_giu'                  => $validated['tien_giam_giu']                  ?? 0,
                'phuong_thuc_tt'                 => $validated['phuong_thuc_tt'],
                'trang_thai_thanh_toan'          => 'DaThanhToan',
                'trang_thai_don'                 => 'ChoXuLy',
            ]);

            // [Auto-Assignment] Logic gán lịch tự động <= 3km (Haversine thực tế) & Check Trùng Giờ
            $autoAssignNhanVienId = null;
            $isCaLe = false;
            if (!empty($validated['ca_lam_viec'])) {
                $isCaLe = ($validated['ca_lam_viec'][0]['loai_goi_ca_lam'] ?? 'CaLe') === 'CaLe';
            }

            if ($isCaLe && empty($validated['nhan_vien_duoc_yeu_cau_id'])) {
                $caLam = $validated['ca_lam_viec'][0];
                $ngayLamStr = $caLam['ngay_lam'];
                $dow = (int) date('w', strtotime($ngayLamStr));
                
                // 0. Lọc ra các nhân viên đã đăng ký và được duyệt (DaDuyet) cho dịch vụ của ca làm này
                $skilledStaffIds = DB::table('NhanVien_DichVu')
                    ->where('dich_vu_id', $caLam['dich_vu_id'])
                    ->where('trang_thai_duyet', 'DaDuyet')
                    ->pluck('nhan_vien_id')
                    ->toArray();

                // 1. Lọc nhân viên có hợp đồng cam kết rảnh hợp lệ trong khoảng thời gian ngày làm
                $activeStaffIds = DB::table('lichnghi')
                    ->where('loai_nghi', 'DinhKy')
                    ->whereIn('nhan_vien_id', $skilledStaffIds)
                    ->whereDate('ngay_bat_dau_ap_dung', '<=', $ngayLamStr)
                    ->whereDate('ngay_ket_thuc_ap_dung', '>=', $ngayLamStr)
                    ->pluck('nhan_vien_id')
                    ->unique()
                    ->toArray();
                
                // 2. Lọc nhân viên đăng ký nghỉ định kỳ vào ngày thứ trong tuần ($dow)
                $offDinhKy = DB::table('lichnghi')
                    ->where('loai_nghi', 'DinhKy')
                    ->where('thu_trong_tuan', $dow)
                    ->whereDate('ngay_bat_dau_ap_dung', '<=', $ngayLamStr)
                    ->whereDate('ngay_ket_thuc_ap_dung', '>=', $ngayLamStr)
                    ->pluck('nhan_vien_id')
                    ->toArray();
                    
                // 3. Lọc nhân viên nghỉ đột xuất (Đã được duyệt) trong ngày làm
                $offDotXuat = DB::table('lichnghi')
                    ->where('loai_nghi', 'DotXuat')
                    ->whereDate('ngay_nghi', $ngayLamStr)
                    ->where('trang_thai_duyet', 'DaDuyet')
                    ->pluck('nhan_vien_id')
                    ->toArray();
                    
                // 4. Lọc nhân viên có buổi nghỉ trong ngày trùng với giờ của ca làm
                $shiftStart = \Carbon\Carbon::parse($ngayLamStr . ' ' . $caLam['gio_bat_dau']);
                $shiftEnd = (clone $shiftStart)->addMinutes($caLam['thoi_gian_lam_phut']);
                
                $offSessionStaffIds = DB::table('lichnghi')
                    ->where('loai_nghi', 'DinhKy')
                    ->whereNotNull('gio_bat_dau_nghi')
                    ->whereNotNull('gio_ket_thuc_nghi')
                    ->whereDate('ngay_bat_dau_ap_dung', '<=', $ngayLamStr)
                    ->whereDate('ngay_ket_thuc_ap_dung', '>=', $ngayLamStr)
                    ->get(['nhan_vien_id', 'gio_bat_dau_nghi', 'gio_ket_thuc_nghi'])
                    ->filter(function ($nghi) use ($shiftStart, $shiftEnd, $ngayLamStr) {
                        $nghiStart = \Carbon\Carbon::parse($ngayLamStr . ' ' . $nghi->gio_bat_dau_nghi);
                        $nghiEnd = \Carbon\Carbon::parse($ngayLamStr . ' ' . $nghi->gio_ket_thuc_nghi);
                        return ($shiftStart < $nghiEnd && $shiftEnd > $nghiStart);
                    })
                    ->pluck('nhan_vien_id')
                    ->toArray();
                    
                $leaveStaffIds = array_unique(array_merge($offDinhKy, $offDotXuat, $offSessionStaffIds));
                
                // 5. Lọc nhân viên trùng lịch làm việc khác (CaLamViec) + khoảng nghỉ 1 tiếng
                $startDtWithGap = (clone $shiftStart)->subMinutes(60);
                $endDtWithGap = (clone $shiftEnd)->addMinutes(60);
                
                $overlappingStaffIds = DB::table('calamviec')
                    ->where('ngay_lam', $ngayLamStr)
                    ->whereNotIn('trang_thai_ca', ['KhachHuy', 'NhanVienHuy', 'DaHuy', 'TuChoiDuyet', 'DaTuChoi'])
                    ->whereNotNull('nhan_vien_id')
                    ->get(['nhan_vien_id', 'gio_bat_dau', 'thoi_gian_lam_phut'])
                    ->filter(function ($ca) use ($startDtWithGap, $endDtWithGap, $ngayLamStr) {
                        if (!$ca->gio_bat_dau || !$ca->thoi_gian_lam_phut) return false;
                        $cStart = \Carbon\Carbon::parse($ngayLamStr . ' ' . $ca->gio_bat_dau);
                        $cEnd = (clone $cStart)->addMinutes($ca->thoi_gian_lam_phut);
                        
                        return ($startDtWithGap < $cEnd && $endDtWithGap > $cStart);
                    })
                    ->pluck('nhan_vien_id')
                    ->unique()
                    ->toArray();
                    
                $allUnavailableStaffIds = array_unique(array_merge($leaveStaffIds, $overlappingStaffIds));
                
                // Nhân viên sẵn sàng
                $availableStaffIds = array_values(array_diff($activeStaffIds, $allUnavailableStaffIds));
                
                // 6. Tìm nhân viên trong phạm vi <= 10km (hoặc theo bán kính quy định),
                // ƯU TIÊN nhân viên có tong_so_ca_hoan_thanh bé nhất trước, sau đó mới xét khoảng cách
                if (!empty($availableStaffIds) && $donHang->vi_do && $donHang->kinh_do) {
                    $lat = $donHang->vi_do;
                    $lon = $donHang->kinh_do;
                    
                    $nearestStaff = DB::table('NhanVien')
                        ->whereIn('id', $availableStaffIds)
                        ->whereNotNull('vi_do')
                        ->whereNotNull('kinh_do')
                        ->select('id', 'tong_so_ca_hoan_thanh', DB::raw("
                            ( 6371 * acos( cos( radians($lat) ) * cos( radians( vi_do ) ) 
                            * cos( radians( kinh_do ) - radians($lon) ) 
                            + sin( radians($lat) ) * sin( radians( vi_do ) ) ) ) AS distance
                        "))
                        ->having('distance', '<=', 3)
                        ->orderBy('tong_so_ca_hoan_thanh', 'asc')
                        ->orderBy('distance', 'asc')
                        ->first();
                        
                    if ($nearestStaff) {
                        $autoAssignNhanVienId = $nearestStaff->id;
                    }
                }
            }

            // 3. Bulk insert calamviec — chia đều tien_giam_giu cho từng buổi, sau đó tách hoa hồng
            if (!empty($validated['ca_lam_viec'])) {
                $hoaHongRate = 0.20;
                $soCa        = count($validated['ca_lam_viec']);
                $tienGiamGiu = (float) $validated['tien_giam_giu']; // = tong_tien_cuoi_cung - phí di chuyển, tính từ FE

                // Chia đều cho từng buổi, làm tròn xuống; phần dư do làm tròn dồn vào buổi cuối
                // để tổng tất cả gia_ca_nay luôn khớp đúng tien_giam_giu, không lệch vài đồng.
                $giaMoiBuoi = floor($tienGiamGiu / $soCa);
                $tienDu     = $tienGiamGiu - ($giaMoiBuoi * $soCa);

                $rows = [];
                $index = 0;

                foreach ($validated['ca_lam_viec'] as $ca) {
                    $index++;
                    $gia = $giaMoiBuoi;
                    if ($index === $soCa) {
                        $gia += $tienDu; // buổi cuối nhận thêm phần dư
                    }

                    $hoaHong  = round($gia * $hoaHongRate);
                    $thucNhan = $gia - $hoaHong;

                    $trangThaiCa = $ca['trang_thai_ca'] ?? 'ChoNhanVienTuDoNhan';
                    $ghepNhanVienId = null;
                    $loaiGhep = 'ThuCong';
                    
                    if (!empty($validated['nhan_vien_duoc_yeu_cau_id'])) {
                        $ghepNhanVienId = $validated['nhan_vien_duoc_yeu_cau_id'];
                        $trangThaiCa = 'ChoNhanVienChiDinhXacNhan';
                        $loaiGhep = 'ThuCong';
                    } elseif ($autoAssignNhanVienId) {
                        $ghepNhanVienId = $autoAssignNhanVienId;
                        $trangThaiCa = 'DaNhan';
                        $loaiGhep = 'TuDong';
                    }

                    $rows[] = [
                        'don_hang_id'           => $donHang->id,
                        'nhan_vien_id'          => $ghepNhanVienId,
                        'dich_vu_id'            => $ca['dich_vu_id'],
                        'chi_tiet_dich_vu_them' => $ca['chi_tiet_dich_vu_them'] ?? null,
                        'ngay_lam'              => $ca['ngay_lam'],
                        'gio_bat_dau'           => $ca['gio_bat_dau'],
                        'thoi_gian_lam_phut'    => $ca['thoi_gian_lam_phut'],
                        'loai_goi_ca_lam'       => $ca['loai_goi_ca_lam'],
                        'dia_chi_lam_viec'      => $ca['dia_chi_lam_viec'],
                        'gia_ca_nay'            => $gia,
                        'hoa_hong_app'          => $hoaHong,
                        'thuc_nhan_nv'          => $thucNhan,
                        'trang_thai_ca'         => $trangThaiCa,
                        'loai_ghep'             => $loaiGhep,
                    ];
                }

                DB::table('calamviec')->insert($rows);

                // 3.1 Gửi thông báo cho các nhân viên đủ điều kiện (NhanVien_DichVu.trang_thai_duyet = 'DaDuyet')
                $firstCa = $validated['ca_lam_viec'][0] ?? null;
                if ($firstCa && isset($firstCa['dich_vu_id'])) {
                    $dichVuId = $firstCa['dich_vu_id'];
                    $ngayLam = \Carbon\Carbon::parse($firstCa['ngay_lam'])->format('d/m/Y');
                    $gioBatDau = $firstCa['gio_bat_dau'];

                    // Tìm danh sách ID nhân viên có dịch vụ đã duyệt khớp với đơn này
                    $qualifiedStaffIds = DB::table('NhanVien_DichVu')
                        ->where('dich_vu_id', $dichVuId)
                        ->where('trang_thai_duyet', 'DaDuyet')
                        ->pluck('nhan_vien_id')
                        ->toArray();

                    if (!empty($qualifiedStaffIds)) {
                        $thongBaos = [];
                        foreach ($qualifiedStaffIds as $nvId) {
                            if (!empty($validated['nhan_vien_duoc_yeu_cau_id']) && $nvId == $validated['nhan_vien_duoc_yeu_cau_id']) {
                                $thongBaos[] = [
                                    'loai_nguoi_nhan' => 'NhanVien',
                                    'nguoi_nhan_id'   => $nvId,
                                    'tieu_de'         => '📌 Bạn nhận được yêu cầu chỉ định ca làm mới',
                                    'noi_dung'        => "Khách hàng {$validated['ho_ten_thuc_te']} đã chỉ định bạn cho ca làm ngày {$ngayLam} lúc {$gioBatDau}. Vui lòng xác nhận.",
                                    'loai_doi_tuong'  => 'DonHang',
                                    'doi_tuong_id'    => $donHang->id,
                                    'ngay_tao'        => now(),
                                    'is_da_doc'       => false
                                ];
                            } elseif ($autoAssignNhanVienId && $nvId == $autoAssignNhanVienId) {
                                $thongBaos[] = [
                                    'loai_nguoi_nhan' => 'NhanVien',
                                    'nguoi_nhan_id'   => $nvId,
                                    'tieu_de'         => '🎉 Bạn được gán tự động ca làm việc mới',
                                    'noi_dung'        => "Hệ thống đã tự động gán cho bạn ca làm ngày {$ngayLam} lúc {$gioBatDau} tại {$validated['dia_chi_thuc_te']}.",
                                    'loai_doi_tuong'  => 'DonHang',
                                    'doi_tuong_id'    => $donHang->id,
                                    'ngay_tao'        => now(),
                                    'is_da_doc'       => false
                                ];
                            } elseif (empty($validated['nhan_vien_duoc_yeu_cau_id']) && !$autoAssignNhanVienId) {
                                // Ca tự do trên chợ việc
                                $thongBaos[] = [
                                    'loai_nguoi_nhan' => 'NhanVien',
                                    'nguoi_nhan_id'   => $nvId,
                                    'tieu_de'         => '💼 Có ca làm việc mới phù hợp với kỹ năng của bạn',
                                    'noi_dung'        => "Khách hàng {$validated['ho_ten_thuc_te']} vừa đặt lịch ngày {$ngayLam} lúc {$gioBatDau}. Hãy vào danh sách chờ nhận ngay!",
                                    'loai_doi_tuong'  => 'DonHang',
                                    'doi_tuong_id'    => $donHang->id,
                                    'ngay_tao'        => now(),
                                    'is_da_doc'       => false
                                ];
                            }
                        }

                        if (!empty($thongBaos)) {
                            DB::table('ThongBao')->insert($thongBaos);
                        }
                    }
                }
            }

            // 4. Lưu dịch vụ thêm đã chọn (nếu có) vào donhang_dichvuthem
            if (!empty($validated['dich_vu_them'])) {
                $dvtRows = [];
                foreach ($validated['dich_vu_them'] as $dvt) {
                    $dvtRows[] = [
                        'don_hang_id'             => $donHang->id,
                        'dich_vu_dich_vu_them_id' => $dvt['dich_vu_dich_vu_them_id'],
                        'so_luong'                => $dvt['so_luong'] ?? 1,
                        'gia_luc_dat'             => $dvt['gia_luc_dat'],
                    ];
                }
                DB::table('donhang_dichvuthem')->insert($dvtRows);
            }

            // 5. Nếu dùng mã khuyến mãi → đánh dấu đã dùng
            if (!empty($validated['khuyen_mai_id'])) {
                DB::table('khachhang_khuyenmai')
                    ->where('khach_hang_id', $khachHang->id)
                    ->where('khuyen_mai_id', $validated['khuyen_mai_id'])
                    ->update([
                        'trang_thai_luu' => 'DaSuDung',
                        'ngay_su_dung'   => now(),
                    ]);

                DB::table('khuyenmai')
                    ->where('id', $validated['khuyen_mai_id'])
                    ->increment('so_luong_da_dung');
            }

            DB::commit();

            return response()->json([
                'success'      => true,
                'message'      => 'Đặt lịch thành công!',
                'don_hang_id'  => $donHang->id,
                'tong_so_buoi' => count($validated['ca_lam_viec'] ?? []),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo đơn hàng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/khach-hang/don-hang
     * Lấy danh sách đơn hàng của khách hàng hiện tại
     */
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $khachHang = $request->user()->khachHang;
            if (!$khachHang) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy hồ sơ khách hàng.',
                ], 404);
            }

            $donHangs = DonHang::with([
                'caLamViec.nhanVien.taiKhoan',
                'dichVuLoaiGoi.dichVu',
                'nhanVienYeuCau.taiKhoan',
                'dichVuThemDaChon'
            ])
            ->where('khach_hang_id', $khachHang->id)
            ->orderBy('ngay_tao', 'desc')
            ->get();

            // Ẩn đánh giá chứa [HIDDEN] khỏi khách hàng
            foreach ($donHangs as $donHang) {
                foreach ($donHang->caLamViec as $ca) {
                    if (isset($ca->noi_dung_danh_gia) && strpos($ca->noi_dung_danh_gia, '[HIDDEN]') === 0) {
                        $ca->noi_dung_danh_gia = 'Đánh giá này đã bị ẩn bởi quản trị viên.';
                    }
                }
            }

            return response()->json([
                'success' => true,
                'data' => $donHangs
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách đơn hàng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/khach-hang/don-hang/{id}
     * Lấy chi tiết đơn hàng
     */
    public function show(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        try {
            $khachHang = $request->user()->khachHang;
            if (!$khachHang) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy hồ sơ khách hàng.',
                ], 404);
            }

            $donHang = DonHang::with([
                'caLamViec.nhanVien.taiKhoan',
                'caLamViec.yeuCauDoiLich',
                'caLamViec.khieuNai',
                'dichVuLoaiGoi.dichVu',
                'dichVuLoaiGoi.loaiGoi',
                'nhanVienYeuCau.taiKhoan',
                'dichVuThemDaChon.dichVuThem',
                'khuyenMai',
                'tuyChonBienThe'
            ])
            ->where('khach_hang_id', $khachHang->id)
            ->where('id', $id)
            ->first();

            if (!$donHang) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy đơn hàng.',
                ], 404);
            }

            // Ẩn đánh giá chứa [HIDDEN] khỏi khách hàng
            if ($donHang->caLamViec) {
                foreach ($donHang->caLamViec as $ca) {
                    if (isset($ca->noi_dung_danh_gia) && strpos($ca->noi_dung_danh_gia, '[HIDDEN]') === 0) {
                        $ca->noi_dung_danh_gia = 'Đánh giá này đã bị ẩn bởi quản trị viên.';
                    }
                }
            }

            return response()->json([
                'success' => true,
                'data' => $donHang
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy chi tiết đơn hàng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /api/khach-hang/don-hang/ca-lam/{id}/doi-lich
     * Khách hàng yêu cầu dời lịch 1 ca làm việc
     */
    public function doiLich(Request $request, $caLamViecId)
    {
        try {
            $khachHang = $request->user()->khachHang;
            if (!$khachHang) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy hồ sơ khách hàng.',
                ], 404);
            }

            $validated = $request->validate([
                'ngay_moi' => 'required|string'
            ]);

            $caLamViec = \App\Models\CaLamViec::where('id', $caLamViecId)
                ->whereHas('donHang', function($q) use ($khachHang) {
                    $q->where('khach_hang_id', $khachHang->id);
                })->first();

            if (!$caLamViec) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy ca làm việc hoặc không có quyền.',
                ], 404);
            }

            // Update trạng thái ca
            $caLamViec->trang_thai_ca = 'ChoXacNhan';
            $caLamViec->save();

            // Tạo yêu cầu
            $lyDoStr = 'Yêu cầu dời lịch sang ngày mới: ' . $validated['ngay_moi'];

            \App\Models\YeuCauXuLy::create([
                'loai_cap_do_yeu_cau' => 'CaLam',
                'ca_lam_viec_id'      => $caLamViec->id,
                'nguoi_yeu_cau_loai'  => 'KhachHang',
                'nguoi_yeu_cau_id'    => $khachHang->id,
                'loai_yeu_cau'        => 'DoiLich',
                'trang_thai_duyet'    => 'ChoXuLy',
                'ly_do'               => $lyDoStr,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Đã gửi yêu cầu dời lịch thành công'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/khach-hang/don-hang/ca-lam/{id}/huy
     * Khách hàng chủ động hủy 1 ca làm việc
     */
    public function huyCa(Request $request, $caLamViecId)
    {
        try {
            $khachHang = $request->user()->khachHang;
            if (!$khachHang) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy hồ sơ khách hàng.',
                ], 404);
            }

            $caLamViec = \App\Models\CaLamViec::where('id', $caLamViecId)
                ->whereHas('donHang', function($q) use ($khachHang) {
                    $q->where('khach_hang_id', $khachHang->id);
                })->first();

            if (!$caLamViec) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy ca làm việc hoặc không có quyền.',
                ], 404);
            }

            // Hủy các yêu cầu xử lý đang chờ (như yêu cầu dời lịch cũ)
            \App\Models\YeuCauXuLy::where('ca_lam_viec_id', $caLamViec->id)
                ->where('trang_thai_duyet', 'ChoXuLy')
                ->delete();

            // Cập nhật trạng thái ca
            $caLamViec->trang_thai_ca = 'KhachHuy';
            $caLamViec->save();

            // Gửi thông báo cho nhân viên nếu ca đã có nhân viên nhận
            if ($caLamViec->nhan_vien_id) {
                ThongBao::create([
                    'loai_nguoi_nhan' => 'NhanVien',
                    'nguoi_nhan_id'   => $caLamViec->nhan_vien_id,
                    'tieu_de'         => '🚨 Khách hàng đã hủy lịch làm việc',
                    'noi_dung'        => "Khách hàng {$khachHang->ho_ten} đã hủy ca làm việc ngày " . \Carbon\Carbon::parse($caLamViec->ngay_lam)->format('d/m/Y') . " lúc " . \Carbon\Carbon::parse($caLamViec->gio_bat_dau)->format('H:i') . ".",
                    'loai_doi_tuong'  => 'DonHang',
                    'doi_tuong_id'    => $caLamViec->don_hang_id,
                    'ngay_tao'        => now(),
                    'is_da_doc'       => false
                ]);

                $phongChat = PhongChat::where('don_hang_id', $caLamViec->don_hang_id)
                    ->where('nhan_vien_id', $caLamViec->nhan_vien_id)
                    ->first();
                if ($phongChat) {
                    TinNhan::create([
                        'phong_chat_id'  => $phongChat->id,
                        'nguoi_gui_loai' => 'KhachHang',
                        'nguoi_gui_id'   => $khachHang->id,
                        'noi_dung'       => "⚠️ [Hệ thống] Khách hàng đã hủy ca làm việc ngày " . \Carbon\Carbon::parse($caLamViec->ngay_lam)->format('d/m/Y') . " (" . \Carbon\Carbon::parse($caLamViec->gio_bat_dau)->format('H:i') . ").",
                        'thoi_gian_gui'  => now()
                    ]);
                    $phongChat->thoi_gian_nhan_tin_cuoi = now();
                    $phongChat->save();
                }
            }

            // Lưu log lịch sử hủy
            \App\Models\YeuCauXuLy::create([
                'loai_cap_do_yeu_cau' => 'CaLam',
                'ca_lam_viec_id'      => $caLamViec->id,
                'nguoi_yeu_cau_loai'  => 'KhachHang',
                'nguoi_yeu_cau_id'    => $khachHang->id,
                'loai_yeu_cau'        => 'HuyCaLe',
                'trang_thai_duyet'    => 'DaDuyet',
                'ly_do'               => 'Khách hàng chủ động hủy ca',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Đã hủy ca thành công'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/khach-hang/don-hang/{id}/huy
     * Khách hàng chủ động hủy toàn bộ đơn hàng/gói dịch vụ
     */
    public function huyDonHang(Request $request, $id)
    {
        try {
            $khachHang = $request->user()->khachHang;
            if (!$khachHang) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy hồ sơ khách.'], 404);
            }

            $donHang = \App\Models\DonHang::where('id', $id)
                ->where('khach_hang_id', $khachHang->id)
                ->first();

            if (!$donHang) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy đơn hàng.'], 404);
            }

            // Update trạng thái đơn hàng
            $donHang->trang_thai_don = 'DaHuy';
            $donHang->save();

            // Lấy tất cả ca làm việc chưa hoàn thành/hủy
            $caLamViecs = \App\Models\CaLamViec::where('don_hang_id', $donHang->id)
                ->whereNotIn('trang_thai_ca', ['DaHuy', 'KhachHuy', 'NhanVienHuy', 'DaHoanThanh'])
                ->get();

            $notifiedStaffIds = [];

            foreach ($caLamViecs as $ca) {
                // Xóa các yêu cầu dời lịch/đổi nhân viên đang chờ
                \App\Models\YeuCauXuLy::where('ca_lam_viec_id', $ca->id)
                    ->where('trang_thai_duyet', 'ChoXuLy')
                    ->delete();

                if ($ca->nhan_vien_id && !in_array($ca->nhan_vien_id, $notifiedStaffIds)) {
                    $notifiedStaffIds[] = $ca->nhan_vien_id;
                }

                // Cập nhật trạng thái ca
                $ca->trang_thai_ca = 'KhachHuy';
                $ca->save();
            }

            // Gửi thông báo cho từng nhân viên phụ trách ca làm trong đơn
            foreach ($notifiedStaffIds as $nvId) {
                ThongBao::create([
                    'loai_nguoi_nhan' => 'NhanVien',
                    'nguoi_nhan_id'   => $nvId,
                    'tieu_de'         => '🚨 Khách hàng đã hủy toàn bộ đơn hàng',
                    'noi_dung'        => "Khách hàng {$khachHang->ho_ten} đã hủy toàn bộ đơn hàng #DH-" . str_pad($donHang->id, 6, '0', STR_PAD_LEFT) . ". Các ca làm việc liên quan đã được hủy.",
                    'loai_doi_tuong'  => 'DonHang',
                    'doi_tuong_id'    => $donHang->id,
                    'ngay_tao'        => now(),
                    'is_da_doc'       => false
                ]);

                $phongChat = PhongChat::where('don_hang_id', $donHang->id)
                    ->where('nhan_vien_id', $nvId)
                    ->first();
                if ($phongChat) {
                    TinNhan::create([
                        'phong_chat_id'  => $phongChat->id,
                        'nguoi_gui_loai' => 'KhachHang',
                        'nguoi_gui_id'   => $khachHang->id,
                        'noi_dung'       => "⚠️ [Hệ thống] Khách hàng đã hủy toàn bộ đơn hàng/gói dịch vụ này.",
                        'thoi_gian_gui'  => now()
                    ]);
                    $phongChat->thoi_gian_nhan_tin_cuoi = now();
                    $phongChat->save();
                }
            }

            // Lưu log lịch sử hủy
            \App\Models\YeuCauXuLy::create([
                'loai_cap_do_yeu_cau' => 'DonHang',
                'don_hang_id'         => $donHang->id,
                'nguoi_yeu_cau_loai'  => 'KhachHang',
                'nguoi_yeu_cau_id'    => $khachHang->id,
                'loai_yeu_cau'        => 'HuyDonToanGoi',
                'trang_thai_duyet'    => 'DaDuyet',
                'ly_do'               => 'Khách hàng chủ động hủy toàn bộ đơn/gói',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Đã hủy đơn hàng thành công'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/khach-hang/don-hang/ca-lam/{id}/danh-gia
     */
    public function danhGiaCaLamViec(Request $request, $id)
    {
        try {
            $khachHang = $request->user()->khachHang;
            if (!$khachHang) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy hồ sơ khách.'], 404);
            }

            $caLamViec = \App\Models\CaLamViec::where('id', $id)
                ->whereHas('donHang', function($q) use ($khachHang) {
                    $q->where('khach_hang_id', $khachHang->id);
                })->first();

            if (!$caLamViec) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy ca làm việc.'], 404);
            }

            if ($caLamViec->trang_thai_ca !== 'DaHoanThanh') {
                return response()->json(['success' => false, 'message' => 'Chỉ có thể đánh giá ca đã hoàn thành.'], 400);
            }

            $request->validate([
                'sao_danh_gia' => 'required|integer|min:1|max:5',
                'noi_dung_danh_gia' => 'nullable|string'
            ]);

            $caLamViec->sao_danh_gia = $request->sao_danh_gia;
            $caLamViec->noi_dung_danh_gia = $request->noi_dung_danh_gia;
            $caLamViec->ngay_danh_gia = now();
            $caLamViec->save();

            return response()->json([
                'success' => true,
                'message' => 'Đánh giá thành công'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/khach-hang/don-hang/ca-lam/{id}/bao-cao
     */
    public function baoCaoSuCo(Request $request, $id)
    {
        try {
            $khachHang = $request->user()->khachHang;
            if (!$khachHang) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy hồ sơ khách.'], 404);
            }

            $caLamViec = \App\Models\CaLamViec::where('id', $id)
                ->whereHas('donHang', function($q) use ($khachHang) {
                    $q->where('khach_hang_id', $khachHang->id);
                })->first();

            if (!$caLamViec) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy ca làm việc.'], 404);
            }

            $request->validate([
                'ly_do_khieu_nai' => 'required|string|max:255',
                'mo_ta_chi_tiet' => 'nullable|string'
            ]);

            \App\Models\KhieuNai::create([
                'ca_lam_viec_id' => $caLamViec->id,
                'nguoi_khieu_nai_loai' => 'KhachHang',
                'nguoi_khieu_nai_id' => $khachHang->id,
                'ly_do_khieu_nai' => $request->ly_do_khieu_nai,
                'mo_ta_chi_tiet' => $request->mo_ta_chi_tiet,
                'trang_thai_xu_ly' => 'DangXuLy',
                'ngay_tao' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Đã gửi báo cáo sự cố thành công'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }
}
