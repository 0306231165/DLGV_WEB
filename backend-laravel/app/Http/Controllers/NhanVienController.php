<?php

namespace App\Http\Controllers;

use App\Models\NhanVien;
use App\Models\LichNghi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class NhanVienController extends Controller
{
    /**
     * GET /api/nhan-vien/profile
     * Trả về thông tin chi tiết nhân viên cùng danh sách dịch vụ (kỹ năng) đã được duyệt (DaDuyet).
     */
    public function profile(Request $request)
    {
        try {
            $taiKhoan = $request->user();
            $nhanVien = $taiKhoan->nhanVien;

            if (!$nhanVien) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin nhân viên.'], 404);
            }

            // Lấy các dịch vụ mà nhân viên đã đăng ký và được duyệt (DaDuyet)
            $skills = DB::table('NhanVien_DichVu')
                ->join('DichVu', 'NhanVien_DichVu.dich_vu_id', '=', 'DichVu.id')
                ->where('NhanVien_DichVu.nhan_vien_id', $nhanVien->id)
                ->where('NhanVien_DichVu.trang_thai_duyet', 'DaDuyet')
                ->pluck('DichVu.ten_dich_vu')
                ->toArray();

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $nhanVien->id,
                    'name' => $taiKhoan->ho_ten ?? 'Chưa cập nhật',
                    'code' => 'PT-' . str_pad($nhanVien->id, 4, '0', STR_PAD_LEFT),
                    'avatar' => $taiKhoan->avatar ?: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop',
                    'phone' => $taiKhoan->so_dien_thoai ?? 'Chưa cập nhật',
                    'email' => $taiKhoan->email ?? 'Chưa cập nhật',
                    'birthday' => $taiKhoan->ngay_sinh ? \Carbon\Carbon::parse($taiKhoan->ngay_sinh)->format('d/m/Y') : '15/08/1988',
                    'hometown' => $nhanVien->que_quan ?? 'Bến Tre',
                    'address' => $nhanVien->dia_chi ?? '248/12 Bùi Viện, Phường Phạm Ngũ Lão, Quận 1, TP. Hồ Chí Minh',
                    'vi_do' => $nhanVien->vi_do,      // ← Tọa độ nhà NV (dùng cho thuật toán 6km)
                    'kinh_do' => $nhanVien->kinh_do,  // ← Tọa độ nhà NV (dùng cho thuật toán 6km)
                    'joinDate' => $taiKhoan->ngay_tao ? \Carbon\Carbon::parse($taiKhoan->ngay_tao)->format('d/m/Y') : '12/02/2024',
                    'status' => 'Đã xác minh (Verified)',
                    'experience' => ($nhanVien->kinh_nghiem ?? '3') . ' năm',
                    'completedJobs' => (int) ($nhanVien->tong_so_ca_hoan_thanh ?? 1240),
                    'rating' => (float) ($nhanVien->danh_gia_sao_trung_binh ?? 4.9),
                    'skills' => $skills,
                    'identity' => [
                        'idCard' => $nhanVien->cccd ? (substr($nhanVien->cccd, 0, 3) . 'XXXXXXXXX') : '079XXXXXXXXX',
                        'issuedDate' => '20/10/2021',
                        'issuedPlace' => 'Cục Cảnh sát QLHC về trật tự xã hội'
                    ]
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Get Profile Error: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Có thể mở rộng lấy toàn bộ danh sách nhân viên nếu cần
        $staffs = NhanVien::with('taiKhoan')->get();
        
        $formattedStaffs = $staffs->map(function ($staff) {
            return [
                'id' => $staff->id,
                'name' => $staff->taiKhoan->ho_ten ?? 'Chưa cập nhật',
                'avatar' => $staff->taiKhoan->avatar ?? 'https://via.placeholder.com/150',
                'rating' => (float) $staff->danh_gia_sao_trung_binh,
                'completedJobs' => $staff->tong_so_ca_hoan_thanh,
                'reviews' => $staff->tong_so_danh_gia,
                'experience' => 'Chuyên gia'
            ];
        });

        return response()->json($formattedStaffs, 200);
    }

    public function show(int $id)
    {
        // Lấy thông tin nhân viên kèm theo bảng tài khoản gốc
        $staff = NhanVien::with('taiKhoan')->find($id);

        if (!$staff) {
            return response()->json([
                'message' => 'Không tìm thấy thông tin nhân viên này trong hệ thống.'
            ], 404);
        }

        // Format dữ liệu chuẩn chỉ để Frontend dễ hiển thị
        $formattedStaff = [
            'id' => $staff->id,
            'name' => $staff->taiKhoan->ho_ten ?? 'Chưa cập nhật',
            'avatar' => $staff->taiKhoan->avatar ?? 'https://via.placeholder.com/150',
            'rating' => (float) $staff->danh_gia_sao_trung_binh,
            'completedJobs' => $staff->tong_so_ca_hoan_thanh,
            'reviews' => $staff->tong_so_danh_gia,
            'experience' => 'Chuyên gia',
            'bio' => 'Chuyên gia vệ sinh tận tâm, tay nghề cao, luôn luôn lắng nghe ý kiến phản hồi từ khách hàng và làm việc với thái độ chu đáo nhất.'
        ];

        return response()->json($formattedStaff, 200);
    }

    public function getFeaturedStaff()
    {
        // Lấy FULL danh sách đạt chuẩn
        $staffs = NhanVien::with('taiKhoan')
            ->where('tong_so_ca_hoan_thanh', '>=', 1000)
            ->whereBetween('danh_gia_sao_trung_binh', [4.9, 5.0])
            ->get();

        $formattedStaffs = $staffs->map(function ($staff) {
            return [
                'id' => $staff->id,
                'name' => $staff->taiKhoan->ho_ten ?? 'Chưa cập nhật',
                'avatar' => $staff->taiKhoan->avatar ?? 'https://via.placeholder.com/150',
                'rating' => (float) $staff->danh_gia_sao_trung_binh,
                'completedJobs' => $staff->tong_so_ca_hoan_thanh,
                'reviews' => $staff->tong_so_danh_gia,
                'experience' => 'Chuyên gia'
            ];
        });

        return response()->json($formattedStaffs, 200);
    }

    /**
     * GET /api/khach-hang/nhan-vien-yeu-thich
     * Trả về danh sách nhân viên mà khách hàng đã lưu yêu thích.
     */
    public function getYeuThich(Request $request)
    {
        $khachHang = $request->user()->khachHang;
 
        if (!$khachHang) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy khách hàng.'], 404);
        }
 
        $staffs = $khachHang->nhanVienYeuThich()
            ->with('taiKhoan')
            ->get()
            ->map(fn($staff) => $this->formatStaff($staff));
 
        return response()->json(['success' => true, 'data' => $staffs]);
    }
 
    /**
     * POST /api/khach-hang/nhan-vien-yeu-thich/{nhanVienId}
     * Thêm nhân viên vào danh sách yêu thích.
     * Dùng syncWithoutDetaching để không bị lỗi nếu đã tồn tại.
     */
    public function themYeuThich(Request $request, int $nhanVienId)
    {
        $khachHang = $request->user()->khachHang;
 
        if (!$khachHang) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy khách hàng.'], 404);
        }
 
        // Kiểm tra nhân viên có tồn tại không
        $nhanVien = NhanVien::find($nhanVienId);
        if (!$nhanVien) {
            return response()->json(['success' => false, 'message' => 'Nhân viên không tồn tại.'], 404);
        }
 
        // syncWithoutDetaching: thêm nếu chưa có, bỏ qua nếu đã có → không lỗi duplicate
        $khachHang->nhanVienYeuThich()->syncWithoutDetaching([$nhanVienId]);
 
        return response()->json([
            'success' => true,
            'message' => 'Đã thêm nhân viên vào danh sách yêu thích.',
        ]);
    }
 
    /**
     * DELETE /api/khach-hang/nhan-vien-yeu-thich/{nhanVienId}
     * Xóa nhân viên khỏi danh sách yêu thích.
     */
    public function xoaYeuThich(Request $request, int $nhanVienId)
    {
        $khachHang = $request->user()->khachHang;
 
        if (!$khachHang) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy khách hàng.'], 404);
        }
 
        $khachHang->nhanVienYeuThich()->detach($nhanVienId);
 
        return response()->json([
            'success' => true,
            'message' => 'Đã xóa nhân viên khỏi danh sách yêu thích.',
        ]);
    }
 
    /**
     * GET /api/khach-hang/nhan-vien-da-lam
     * Trả về danh sách nhân viên đã từng làm ca hoàn thành cho khách hàng này.
     * DISTINCT theo nhan_vien_id để tránh hiển thị trùng lặp dù có nhiều ca.
     */
    public function getNhanVienDaLam(Request $request)
    {
        $khachHang = $request->user()->khachHang;
 
        if (!$khachHang) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy khách hàng.'], 404);
        }
 
        // JOIN: DonHang (của khách này) → CaLamViec (DaHoanThanh, có NV)
        // SELECT DISTINCT nhan_vien_id → chỉ trả về mỗi NV đúng 1 lần
        $nhanVienIds = DB::table('CaLamViec')
            ->join('DonHang', 'CaLamViec.don_hang_id', '=', 'DonHang.id')
            ->where('DonHang.khach_hang_id', $khachHang->id)
            ->where('CaLamViec.trang_thai_ca', 'DaHoanThanh')
            ->whereNotNull('CaLamViec.nhan_vien_id')
            ->distinct()
            ->pluck('CaLamViec.nhan_vien_id');
 
        // Lấy id NV đã yêu thích để đánh dấu is_saved trên frontend
        $savedIds = $khachHang->nhanVienYeuThich()->pluck('NhanVien.id')->toArray();
 
        $staffs = NhanVien::with('taiKhoan')
            ->whereIn('id', $nhanVienIds)
            ->get()
            ->map(function ($staff) use ($savedIds) {
                return array_merge($this->formatStaff($staff), [
                    'is_saved' => in_array($staff->id, $savedIds),
                ]);
            });
 
        return response()->json([
            'success'   => true,
            'data'      => $staffs,
            // debug_info: chỉ dùng để test, xóa khi deploy production
            '_debug'    => [
                'khach_hang_id'  => $khachHang->id,
                'nhan_vien_ids'  => $nhanVienIds->toArray(),
                'saved_ids'      => $savedIds,
                'staff_count'    => $staffs->count(),
            ],
        ]);
    }
 
    // ─────────────────────────────────────────────────────────────────────────
    // Helper dùng chung để format NhanVien → array trả về FE
    // ─────────────────────────────────────────────────────────────────────────
    private function formatStaff(NhanVien $staff): array
    {
        return [
            'id'           => $staff->id,
            'name'         => $staff->taiKhoan->ho_ten ?? 'Chưa cập nhật',
            'avatar'       => $staff->taiKhoan->avatar ?? 'https://via.placeholder.com/150',
            'rating'       => (float) $staff->danh_gia_sao_trung_binh,
            'completedJobs'=> $staff->tong_so_ca_hoan_thanh,
            'reviews'      => $staff->tong_so_danh_gia,
            'experience'   => 'Chuyên gia',
        ];
    }

    public function dashboard(Request $request)
    {
        try {
            $taiKhoan = $request->user();
            $nhanVien = $taiKhoan->nhanVien;

            if (!$nhanVien) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin nhân viên.'], 404);
            }

            // Lấy thời gian giả lập từ header X-Simulated-Date hoặc param date
            $simulatedDateStr = $request->header('X-Simulated-Date') ?? $request->input('date');
            $targetDate = $simulatedDateStr ? \Carbon\Carbon::parse($simulatedDateStr) : now();

            $monthStart = $targetDate->copy()->startOfMonth()->toDateString();
            $monthEnd = $targetDate->copy()->endOfMonth()->toDateString();

            // 1. Thu nhập trong tháng (từ ngày 1 đến cuối tháng của tháng được chọn)
            $thuNhapThangNay = DB::table('CaLamViec')
                ->where('nhan_vien_id', $nhanVien->id)
                ->where('trang_thai_ca', 'DaHoanThanh')
                ->whereBetween('ngay_lam', [$monthStart, $monthEnd])
                ->sum('thuc_nhan_nv');

            // 2. Số ca hoàn thành trong tháng (từ ngày 1 đến cuối tháng của tháng được chọn)
            $caHoanThanhThangNay = DB::table('CaLamViec')
                ->where('nhan_vien_id', $nhanVien->id)
                ->where('trang_thai_ca', 'DaHoanThanh')
                ->whereBetween('ngay_lam', [$monthStart, $monthEnd])
                ->count();


            // 3. Đánh giá sao trung bình trong tháng
            $avgRatingThang = DB::table('CaLamViec')
                ->where('nhan_vien_id', $nhanVien->id)
                ->where('trang_thai_ca', 'DaHoanThanh')
                ->whereBetween('ngay_lam', [$monthStart, $monthEnd])
                ->whereNotNull('sao_danh_gia')
                ->avg('sao_danh_gia');
            $danhGiaSaoThang = $avgRatingThang > 0 ? (float)$avgRatingThang : 5.0;

            // 4. Tổng số ca hoàn thành toàn bộ từ cột trong bảng nhanvien hoặc thực tế trong CaLamViec
            $tongCaHoanThanh = (int) $nhanVien->tong_so_ca_hoan_thanh;
            if ($tongCaHoanThanh <= 0) {
                $tongCaHoanThanh = DB::table('CaLamViec')
                    ->where('nhan_vien_id', $nhanVien->id)
                    ->where('trang_thai_ca', 'DaHoanThanh')
                    ->count();
            }

            // 5. Đánh giá sao tích lũy toàn bộ (cho khối Tổng quan trên cùng)
            $danhGiaSao = (float)$nhanVien->danh_gia_sao_trung_binh;
            if ($danhGiaSao <= 0) {
                $avgRating = DB::table('CaLamViec')
                    ->where('nhan_vien_id', $nhanVien->id)
                    ->whereNotNull('sao_danh_gia')
                    ->avg('sao_danh_gia');
                $danhGiaSao = $avgRating > 0 ? (float)$avgRating : 4.9;
            }

            // 6. Xếp hạng trong tháng của nhân viên
            $totalStaff = max(NhanVien::count(), 1); // Lấy số lượng nhân viên thực tế trong hệ thống

            if ($caHoanThanhThangNay > 0) {
                $higherRankCount = DB::table('CaLamViec')
                    ->select('nhan_vien_id')
                    ->where('trang_thai_ca', 'DaHoanThanh')
                    ->whereBetween('ngay_lam', [$monthStart, $monthEnd])
                    ->whereNotNull('nhan_vien_id')
                    ->groupBy('nhan_vien_id')
                    ->havingRaw('COUNT(*) > ?', [$caHoanThanhThangNay])
                    ->get()
                    ->count();

                $rank = $higherRankCount + 1;
                $xepHangThangStr = "Vị trí thứ {$rank} / {$totalStaff} nhân viên";
            } else {
                $rank = 0;
                $xepHangThangStr = "Chưa xếp hạng (0 ca)";
            }

            // 7. Thưởng dự kiến theo KPIs / Số ca hoàn thành
            $thuongDuKien = 0;
            if ($caHoanThanhThangNay >= 50 || $rank === 1) {
                $thuongDuKien = 1000000;
            } elseif ($caHoanThanhThangNay >= 30 || $rank <= 3) {
                $thuongDuKien = 500000;
            } elseif ($caHoanThanhThangNay >= 15) {
                $thuongDuKien = 300000;
            } elseif ($caHoanThanhThangNay >= 5) {
                $thuongDuKien = 150000;
            } elseif ($caHoanThanhThangNay > 0) {
                $thuongDuKien = 100000;
            }

            // 8. Ca làm tiếp theo
            $caTiepTheo = \App\Models\CaLamViec::with(['donHang.khachHang'])
                ->where('nhan_vien_id', $nhanVien->id)
                ->whereIn('trang_thai_ca', ['DaNhan', 'ChoXacNhan', 'ChoNhanVienChiDinhXacNhan'])
                ->where(function($query) use ($targetDate) {
                    $query->where('ngay_lam', '>', $targetDate->toDateString())
                          ->orWhere(function($q) use ($targetDate) {
                              $q->where('ngay_lam', $targetDate->toDateString())
                                ->where('gio_bat_dau', '>', $targetDate->toTimeString());
                          });
                })
                ->orderBy('ngay_lam', 'asc')
                ->orderBy('gio_bat_dau', 'asc')
                ->first();

            $caTiepTheoData = null;
            if ($caTiepTheo) {
                $gio_bat_dau = \Carbon\Carbon::parse($caTiepTheo->gio_bat_dau)->format('H:i');
                $ngay_lam = \Carbon\Carbon::parse($caTiepTheo->ngay_lam);
                $ngayHienThi = $ngay_lam->isToday() ? "Hôm nay" : ($ngay_lam->isTomorrow() ? "Ngày mai" : $ngay_lam->format('d/m/Y'));
                
                $caTiepTheoData = [
                    'thoi_gian_hien_thi' => "$gio_bat_dau $ngayHienThi",
                    'dia_chi' => $caTiepTheo->dia_chi_lam_viec,
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'thang_hien_thi' => "Tháng " . $targetDate->format('m/Y'),
                    'thu_nhap_thang_nay' => $thuNhapThangNay,
                    'ca_hoan_thanh' => $tongCaHoanThanh,
                    'ca_hoan_thanh_thang' => $caHoanThanhThangNay,
                    'danh_gia_sao' => $danhGiaSao,
                    'danh_gia_sao_thang' => $danhGiaSaoThang,
                    'xep_hang_thang' => $xepHangThangStr,
                    'thuong_du_kien' => $thuongDuKien,
                    'ca_tiep_theo' => $caTiepTheoData
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Dashboard Error: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()], 500);
        }
    }

    public function wallet(Request $request)
    {
        try {
            $taiKhoan = $request->user();
            \Illuminate\Support\Facades\Log::info("Wallet endpoint called by user: " . ($taiKhoan ? $taiKhoan->id : 'null'));
            if (!$taiKhoan) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy tài khoản.'], 404);
            }

            $viTien = \App\Models\ViTien::where('tai_khoan_id', $taiKhoan->id)->first();
            if (!$viTien) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'balance' => 0,
                        'transactions' => []
                    ]
                ]);
            }

            $transactions = \App\Models\GiaoDichVi::where('vi_tien_id', $viTien->id)
                ->orderBy('thoi_gian', 'desc')
                ->get()
                ->map(function($txn) {
                    $type = 'deposit';
                    if ($txn->loai_giao_dich === 'RutTien') $type = 'withdraw';
                    elseif (in_array($txn->loai_giao_dich, ['NhanLuongCaLam', 'HoanTien'])) $type = 'income';
                    elseif (in_array($txn->loai_giao_dich, ['ThanhToanDonHang', 'PhatHuyDon'])) $type = 'penalty';

                    return [
                        'id' => $txn->ma_giao_dich,
                        'type' => $type,
                        'loai_giao_dich' => $txn->loai_giao_dich,
                        'amount' => (float)$txn->so_tien,
                        'date' => \Carbon\Carbon::parse($txn->thoi_gian)->format('Y-m-d'),
                        'status' => $txn->trang_thai,
                        'description' => $txn->noi_dung
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'balance' => (float)$viTien->so_du,
                    'transactions' => $transactions
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Wallet Error: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()], 500);
        }
    }
    public function getCamKetLichNghi()
    {
        try {
            $nhanVienId = Auth::user()->nhanVien->id;
            
            $lichNghi = LichNghi::where('nhan_vien_id', $nhanVienId)
                ->where('loai_nghi', 'DinhKy')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $lichNghi
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Get Cam Ket Lich Nghi Error: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function saveCamKetLichNghi(Request $request)
    {
        try {
            $nhanVienId = Auth::user()->nhanVien->id;
            
            DB::beginTransaction();

            // Xóa tất cả các lịch nghỉ định kỳ cũ của nhân viên này
            LichNghi::where('nhan_vien_id', $nhanVienId)
                ->where('loai_nghi', 'DinhKy')
                ->delete();

            // Thêm lịch nghỉ định kỳ mới
            $payload = $request->input('lichNghi', []);
            $insertData = [];
            foreach ($payload as $item) {
                $insertData[] = [
                    'nhan_vien_id' => $nhanVienId,
                    'loai_nghi' => 'DinhKy',
                    'thu_trong_tuan' => $item['thu_trong_tuan'] ?? null,
                    'ngay_nghi' => null,
                    'gio_bat_dau_nghi' => $item['gio_bat_dau_nghi'] ?? null,
                    'gio_ket_thuc_nghi' => $item['gio_ket_thuc_nghi'] ?? null,
                    'ngay_bat_dau_ap_dung' => $item['ngay_bat_dau_ap_dung'] ?? null,
                    'ngay_ket_thuc_ap_dung' => $item['ngay_ket_thuc_ap_dung'] ?? null,
                    'ly_do' => $item['ly_do'] ?? null,
                    'trang_thai_duyet' => 'DaDuyet',
                ];
            }

            if (!empty($insertData)) {
                LichNghi::insert($insertData);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Lưu hợp đồng cam kết thành công!'
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Save Cam Ket Lich Nghi Error: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function cancelCamKetLichNghi(Request $request)
    {
        try {
            $taiKhoan = Auth::user();
            $nhanVien = $taiKhoan->nhanVien;
            $nhanVienId = $nhanVien->id;
            $nhanVienName = $nhanVien->taiKhoan->ho_ten ?? 'Nhân viên';
            
            $lyDo = $request->input('reason');
            if (empty($lyDo)) {
                $lyDo = 'Hủy cam kết lịch nghỉ định kỳ với hệ thống';
            }

            \Illuminate\Support\Facades\DB::beginTransaction();

            // 1. Xóa tất cả các lịch nghỉ định kỳ
            LichNghi::where('nhan_vien_id', $nhanVienId)
                ->where('loai_nghi', 'DinhKy')
                ->delete();

            // 2. Tìm toàn bộ ca làm việc tương lai (từ hôm nay) chưa thực hiện
            $casChuaLam = \App\Models\CaLamViec::where('nhan_vien_id', $nhanVienId)
                ->where('ngay_lam', '>=', now()->toDateString())
                ->whereIn('trang_thai_ca', ['DaNhan', 'ChoNhanVienChiDinhXacNhan'])
                ->get();

            $affectedCount = $casChuaLam->count();
            $tongTienPhat = 0;

            if ($affectedCount > 0) {
                $PENALTY_RATE = 0.20;
                $tongTienPhat = $casChuaLam->sum(fn($c) => (int) round(floatval($c->thuc_nhan_nv) * $PENALTY_RATE));
                
                // Nhóm ca theo don_hang
                $casByDonHang = $casChuaLam->groupBy('don_hang_id');
                
                // Giao dịch ví
                $viTien = \App\Models\ViTien::where('tai_khoan_id', $taiKhoan->id)->first();
                if (!$viTien) {
                    $viTien = \App\Models\ViTien::create(['tai_khoan_id' => $taiKhoan->id, 'so_du' => 0]);
                }
                $soDuSau = floatval($viTien->so_du) - $tongTienPhat;
                $viTien->so_du = $soDuSau;
                $viTien->save();

                // Tạo GiaoDichVi
                $detailParts = [];
                foreach ($casByDonHang as $dhId => $dsCa) {
                    $phatDon = (int) round($dsCa->sum(fn($c) => floatval($c->thuc_nhan_nv)) * $PENALTY_RATE);
                    $detailParts[] = 'DH#' . $dhId . '(' . $dsCa->count() . ' ca): ' . number_format($phatDon, 0, ',', '.') . 'đ';
                }
                $noiDungGD = 'Phạt hủy cam kết | ' . $affectedCount . ' ca | ' . implode(', ', $detailParts) . ' | Tổng: ' . number_format($tongTienPhat, 0, ',', '.') . 'đ';
                
                // Cắt ngắn chuỗi nếu quá 255 ký tự để tránh lỗi SQL Data too long
                if (mb_strlen($noiDungGD) > 250) {
                    $noiDungGD = mb_substr($noiDungGD, 0, 247) . '...';
                }

                $maGD = 'PAY-HUYCK-' . strtoupper(substr(md5(now()->timestamp . $nhanVienId), 0, 8));
                \App\Models\GiaoDichVi::create([
                    'vi_tien_id' => $viTien->id,
                    'ma_giao_dich' => $maGD,
                    'loai_giao_dich' => 'PhatHuyDon',
                    'loai_bien_dong' => 'Giam',
                    'so_tien' => $tongTienPhat,
                    'so_du_sau_giao_dich' => $soDuSau,
                    'noi_dung' => $noiDungGD,
                    'trang_thai' => 'ThanhCong',
                    'thoi_gian' => now(),
                ]);

                // Xử lý từng đơn và từng ca (Auto re-assign hoặc đẩy ra chợ)
                $caLamViecController = app(\App\Http\Controllers\CaLamViecController::class);

                foreach ($casByDonHang as $dhId => $dsCa) {
                    $phatDon = (int) round($dsCa->sum(fn($c) => floatval($c->thuc_nhan_nv)) * $PENALTY_RATE);
                    $donHang = \App\Models\DonHang::find($dhId);

                    if ($dsCa->count() == 1) {
                        // ĐƠN HÀNG 1 CA (CA LẺ)
                        $c = $dsCa->first();

                        \App\Models\YeuCauXuLy::create([
                            'loai_cap_do_yeu_cau' => 'CaLam',
                            'don_hang_id' => null,
                            'ca_lam_viec_id' => $c->id,
                            'nguoi_yeu_cau_loai' => 'NhanVien',
                            'nguoi_yeu_cau_id' => $nhanVienId,
                            'loai_yeu_cau' => 'HuyCaLe',
                            'ly_do' => $lyDo,
                            'trang_thai_duyet' => 'DaDuyet',
                            'so_tien_hoan_tra' => 0,
                            'so_tien_phat' => $phatDon,
                            'thoi_gian' => now()
                        ]);

                        // Auto-assign: gọi method trên controller
                        $replacementNv = $caLamViecController->autoAssignCancelledCa($c, $nhanVienId);
                        $ngayHienThi = \Carbon\Carbon::parse($c->ngay_lam)->format('d/m/Y');
                        $gioHienThi  = \Carbon\Carbon::parse($c->gio_bat_dau)->format('H:i');

                        if ($replacementNv) {
                            $c->nhan_vien_id = $replacementNv->id;
                            $c->trang_thai_ca = 'DaNhan';
                            $c->save();
                            \Illuminate\Support\Facades\Log::info("[Auto-Reassign via CamKet] Ca #{$c->id} gán cho NV #{$replacementNv->id}");

                            if ($donHang) {
                                \App\Models\ThongBao::create([
                                    'loai_nguoi_nhan' => 'KhachHang',
                                    'nguoi_nhan_id' => $donHang->khach_hang_id,
                                    'tieu_de' => '✅ Nhân viên thay thế đã được gán tự động',
                                    'noi_dung' => 'Nhân viên ' . $nhanVienName . ' đã hủy ca ngày ' . $ngayHienThi . ' lúc ' . $gioHienThi . '. Hệ thống đã tự động tìm và gán nhân viên ' . ($replacementNv->taiKhoan->ho_ten ?? 'mới') . ' để thay thế.',
                                    'loai_doi_tuong' => 'DonHang',
                                    'doi_tuong_id' => $donHang->id,
                                    'ngay_tao' => now(),
                                    'is_da_doc' => false
                                ]);
                            }
                        } else {
                            $c->nhan_vien_id = null;
                            $c->trang_thai_ca = 'ChoNhanVienTuDoNhan';
                            $c->save();

                            if ($donHang) {
                                \App\Models\ThongBao::create([
                                    'loai_nguoi_nhan' => 'KhachHang',
                                    'nguoi_nhan_id' => $donHang->khach_hang_id,
                                    'tieu_de' => '🚨 Nhân viên đã hủy ca làm việc',
                                    'noi_dung' => 'Nhân viên ' . $nhanVienName . ' đã hủy nhận ca làm việc ngày ' . $ngayHienThi . ' lúc ' . $gioHienThi . '. Lịch của bạn đã được đẩy lên chợ việc để các nhân viên khác nhận.',
                                    'loai_doi_tuong' => 'DonHang',
                                    'doi_tuong_id' => $donHang->id,
                                    'ngay_tao' => now(),
                                    'is_da_doc' => false
                                ]);
                            }
                        }

                    } else {
                        // ĐƠN HÀNG GÓI (NHIỀU CA)
                        \App\Models\YeuCauXuLy::create([
                            'loai_cap_do_yeu_cau' => 'DonHang',
                            'don_hang_id' => $dhId,
                            'ca_lam_viec_id' => null,
                            'nguoi_yeu_cau_loai' => 'NhanVien',
                            'nguoi_yeu_cau_id' => $nhanVienId,
                            'loai_yeu_cau' => 'HuyDonToanGoi',
                            'ly_do' => $lyDo,
                            'trang_thai_duyet' => 'DaDuyet',
                            'so_tien_hoan_tra' => 0,
                            'so_tien_phat' => $phatDon,
                            'thoi_gian' => now(),
                        ]);

                        if ($donHang) {
                            \App\Models\ThongBao::create([
                                'loai_nguoi_nhan' => 'KhachHang',
                                'nguoi_nhan_id' => $donHang->khach_hang_id,
                                'tieu_de' => '🚨 Nhân viên đã hủy hợp đồng làm việc (Gói)',
                                'noi_dung' => 'Nhân viên ' . $nhanVienName . ' đã hủy ' . $dsCa->count() . ' ca còn lại của đơn #DH-' . str_pad($dhId, 6, '0', STR_PAD_LEFT) . '. Gói dịch vụ của bạn đã được đẩy lại lên chợ việc để tìm nhân viên mới thay thế.',
                                'loai_doi_tuong' => 'DonHang',
                                'doi_tuong_id' => $dhId,
                                'ngay_tao' => now(),
                                'is_da_doc' => false,
                            ]);
                        }

                        // Không auto-assign cho Gói, mà đẩy toàn bộ ca chưa làm của gói về chợ việc
                        foreach ($dsCa as $c) {
                            $c->nhan_vien_id = null;
                            $c->trang_thai_ca = 'ChoNhanVienTuDoNhan';
                            $c->save();
                        }
                    }
                }

                $soDuText = $soDuSau >= 0 ? number_format($soDuSau, 0, ',', '.') . 'đ' : '-' . number_format(abs($soDuSau), 0, ',', '.') . 'đ (nợ)';
                \App\Models\ThongBao::create([
                    'loai_nguoi_nhan' => 'NhanVien',
                    'nguoi_nhan_id' => $nhanVienId,
                    'tieu_de' => '⚠️ Bạn bị phạt do hủy cam kết',
                    'noi_dung' => 'Bạn đã hủy cam kết làm việc và hủy ' . $affectedCount . ' ca chưa làm. Tiền phạt: ' . number_format($tongTienPhat, 0, ',', '.') . 'đ. Số dư ví: ' . $soDuText . '.',
                    'loai_doi_tuong' => 'None',
                    'ngay_tao' => now(),
                    'is_da_doc' => false,
                ]);
            }

            \Illuminate\Support\Facades\DB::commit();

            $msg = 'Hủy hợp đồng cam kết thành công!';
            if ($affectedCount > 0) {
                $msg = 'Hủy hợp đồng thành công. Đã hủy ' . $affectedCount . ' ca chưa làm và trừ ' . number_format($tongTienPhat, 0, ',', '.') . 'đ tiền phạt vào ví.';
            }

            return response()->json([
                'success' => true,
                'message' => $msg
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Cancel Cam Ket Lich Nghi Error: " . $e->getMessage() . " at " . $e->getLine());
            return response()->json(['success' => false, 'message' => 'Lỗi server khi hủy cam kết: ' . $e->getMessage()], 500);
        }
    }

    public function getBlockedDates()
    {
        try {
            $nhanVienId = Auth::user()->nhanVien->id;
            
            $blockedDates = LichNghi::where('nhan_vien_id', $nhanVienId)
                ->where('loai_nghi', 'DotXuat')
                ->pluck('ngay_nghi');

            return response()->json([
                'success' => true,
                'data' => $blockedDates
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Get Blocked Dates Error: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function saveBlockedDates(Request $request)
    {
        try {
            $nhanVienId = Auth::user()->nhanVien->id;
            
            DB::beginTransaction();

            // Xóa tất cả các lịch nghỉ đột xuất (khóa ngày) cũ của nhân viên này
            LichNghi::where('nhan_vien_id', $nhanVienId)
                ->where('loai_nghi', 'DotXuat')
                ->delete();

            // Thêm danh sách ngày bị khóa mới
            $dates = $request->input('dates', []);
            $insertData = [];
            foreach ($dates as $date) {
                $insertData[] = [
                    'nhan_vien_id' => $nhanVienId,
                    'loai_nghi' => 'DotXuat',
                    'thu_trong_tuan' => null,
                    'ngay_nghi' => $date,
                    'gio_bat_dau_nghi' => null,
                    'gio_ket_thuc_nghi' => null,
                    'ngay_bat_dau_ap_dung' => null,
                    'ngay_ket_thuc_ap_dung' => null,
                    'ly_do' => 'Đối tác tự khóa ngày làm việc',
                    'trang_thai_duyet' => 'DaDuyet',
                ];
            }

            if (!empty($insertData)) {
                LichNghi::insert($insertData);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật lịch bận cá nhân thành công!'
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Save Blocked Dates Error: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function nhanLuong(Request $request)
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:0',
            ]);

            $taiKhoan = $request->user();
            $viTien = \App\Models\ViTien::where('tai_khoan_id', $taiKhoan->id)->first();
            
            if (!$viTien) {
                $viTien = \App\Models\ViTien::create([
                    'tai_khoan_id' => $taiKhoan->id,
                    'so_du' => 0
                ]);
            }

            $month = (int) $request->input('month', date('m'));
            $year = (int) $request->input('year', date('Y'));

            $startOfMonth = \Carbon\Carbon::createFromDate($year, $month, 1)->startOfDay();
            $endOfMonth = (clone $startOfMonth)->endOfMonth()->endOfDay();

            // Kiểm tra trong bảng GiaoDichVi cột thoi_gian xem đã nhận lương tháng này chưa
            $exists = \App\Models\GiaoDichVi::where('vi_tien_id', $viTien->id)
                ->where('loai_giao_dich', 'NhanLuongCaLam')
                ->whereBetween('thoi_gian', [$startOfMonth, $endOfMonth])
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => true,
                    'already_settled' => true,
                    'message' => "Lương tháng $month/$year đã được chốt sổ và nhận trước đó.",
                    'balance' => $viTien->so_du
                ]);
            }

            DB::beginTransaction();
            
            $viTien->so_du += $request->amount;
            $viTien->save();
            
            $noiDung = $request->input('noi_dung', $request->input('description', "Nhận lương ca làm tháng $month/$year"));
            if (empty($noiDung)) $noiDung = "Nhận lương ca làm tháng $month/$year";

            // Đặt thời gian giao dịch là cuối tháng được quyết toán hoặc hiện tại
            $thoiGianGiaoDich = now();
            if ($endOfMonth->isPast() || $request->has('month')) {
                $thoiGianGiaoDich = $endOfMonth;
            }

            \App\Models\GiaoDichVi::create([
                'ma_giao_dich' => 'SAL' . time() . rand(100, 999),
                'vi_tien_id' => $viTien->id,
                'loai_giao_dich' => 'NhanLuongCaLam',
                'loai_bien_dong' => 'Tang',
                'so_tien' => $request->amount,
                'so_du_sau_giao_dich' => $viTien->so_du,
                'noi_dung' => $noiDung,
                'trang_thai' => 'ThanhCong',
                'thoi_gian' => $thoiGianGiaoDich
            ]);
            
            DB::commit();
            return response()->json(['success' => true, 'already_settled' => false, 'message' => 'Nhận lương thành công!', 'balance' => $viTien->so_du]);
        } catch (\Throwable $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Nhan Luong Error: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Lỗi nhận lương: ' . $e->getMessage()], 500);
        }
    }

    public function deposit(Request $request)
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:10000',
            ]);

            $taiKhoan = $request->user();
            $viTien = \App\Models\ViTien::where('tai_khoan_id', $taiKhoan->id)->first();
            
            if (!$viTien) {
                // For this demo, try to create one if it doesn't exist
                $viTien = \App\Models\ViTien::create([
                    'tai_khoan_id' => $taiKhoan->id,
                    'so_du' => 0
                ]);
            }

            DB::beginTransaction();
            
            $viTien->so_du += $request->amount;
            $viTien->save();
            
            \App\Models\GiaoDichVi::create([
                'ma_giao_dich' => 'DP' . time() . rand(100, 999),
                'vi_tien_id' => $viTien->id,
                'loai_giao_dich' => 'NapTien',
                'loai_bien_dong' => 'Tang',
                'so_tien' => $request->amount,
                'so_du_sau_giao_dich' => $viTien->so_du,
                'noi_dung' => 'Nạp tiền vào ví',
                'trang_thai' => 'ThanhCong',
                'thoi_gian' => now()
            ]);
            
            DB::commit();
            return response()->json(['success' => true, 'message' => 'Nạp tiền thành công!', 'balance' => $viTien->so_du]);
        } catch (\Throwable $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Deposit Error: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Lỗi nạp tiền: ' . $e->getMessage()], 500);
        }
    }

    public function withdraw(Request $request)
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:500000',
            ]);

            $taiKhoan = $request->user();
            $viTien = \App\Models\ViTien::where('tai_khoan_id', $taiKhoan->id)->first();
            
            if (!$viTien) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy ví tiền.'], 404);
            }

            if ($viTien->so_du - $request->amount < 500000) {
                return response()->json(['success' => false, 'message' => 'Bạn cần giữ lại tối thiểu 500.000đ trong ví.'], 400);
            }

            DB::beginTransaction();
            
            $viTien->so_du -= $request->amount;
            $viTien->save();
            
            \App\Models\GiaoDichVi::create([
                'ma_giao_dich' => 'WD' . time() . rand(100, 999),
                'vi_tien_id' => $viTien->id,
                'loai_giao_dich' => 'RutTien',
                'loai_bien_dong' => 'Giam',
                'so_tien' => $request->amount,
                'so_du_sau_giao_dich' => $viTien->so_du,
                'noi_dung' => 'Rút tiền về ngân hàng',
                'trang_thai' => 'ThanhCong',
                'thoi_gian' => now()
            ]);
            
            DB::commit();
            return response()->json(['success' => true, 'message' => 'Rút tiền thành công!', 'balance' => $viTien->so_du]);
        } catch (\Throwable $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Withdraw Error: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Lỗi rút tiền: ' . $e->getMessage()], 500);
        }
    }

    public function getReviews(Request $request)
    {
        try {
            $taiKhoan = $request->user();
            $nhanVien = $taiKhoan->nhanVien;

            if (!$nhanVien) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin nhân viên.'], 404);
            }

            // Truy vấn CaLamViec có sao_danh_gia != null và thuộc nhân viên này
            // Eager load donHang để lấy thông tin khách hàng (ho_ten_thuc_te)
            $reviews = \App\Models\CaLamViec::with(['donHang'])
                ->where('nhan_vien_id', $nhanVien->id)
                ->whereNotNull('sao_danh_gia')
                ->orderBy('ngay_danh_gia', 'desc')
                ->get()
                ->map(function($caLam) {
                    return [
                        'id' => 'rev_' . $caLam->id,
                        'customer' => $caLam->donHang->ho_ten_thuc_te ?? 'Khách hàng',
                        'rating' => (int) $caLam->sao_danh_gia,
                        'text' => isset($caLam->noi_dung_danh_gia) && strpos($caLam->noi_dung_danh_gia, '[HIDDEN]') === 0
                            ? 'Đánh giá này đã bị ẩn bởi quản trị viên.'
                            : ($caLam->noi_dung_danh_gia ?? 'Khách hàng không để lại bình luận.'),
                        'date' => \Carbon\Carbon::parse($caLam->ngay_danh_gia)->format('d/m/Y'),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $reviews
            ]);

        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Get Reviews Error: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Lỗi lấy danh sách đánh giá: ' . $e->getMessage()], 500);
        }
    }
    /**
     * GET /api/nhan-vien/{id}/lich-ban
     * Fetch busy schedule (contracts and assigned jobs) for a staff member.
     */
    public function getBusySchedule($id)
    {
        try {
            $nhanVien = NhanVien::find($id);
            if (!$nhanVien) {
                return response()->json(['success' => false, 'message' => 'Nhân viên không tồn tại'], 404);
            }

            // Get contract
            $lichNghi = \App\Models\LichNghi::where('nhan_vien_id', $id)
                ->where('loai_nghi', 'DinhKy')
                ->get();

            $contract = [
                'startDate' => null,
                'endDate' => null,
                'offDays' => []
            ];

            if ($lichNghi->isNotEmpty()) {
                $contract['startDate'] = $lichNghi->min('ngay_bat_dau_ap_dung');
                $contract['endDate'] = $lichNghi->max('ngay_ket_thuc_ap_dung');
                $contract['offDays'] = $lichNghi->pluck('thu_trong_tuan')->filter(function ($val) {
                    return !is_null($val);
                })->values()->toArray();
            }

            // Get busy jobs
            // Trang thai ca: DangThucHien, DaNhan, ChoNhanVienChiDinhXacNhan
            $busyJobs = \App\Models\CaLamViec::where('nhan_vien_id', $id)
                ->where('ngay_lam', '>=', date('Y-m-d'))
                ->whereIn('trang_thai_ca', ['DangThucHien', 'DaNhan', 'ChoNhanVienChiDinhXacNhan'])
                ->select('id', 'ngay_lam', 'gio_bat_dau', 'thoi_gian_lam_phut', 'trang_thai_ca')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'contract' => $contract,
                    'busyJobs' => $busyJobs
                ]
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Get busy schedule error: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Lỗi server'], 500);
        }
    }

    public function getSkills(Request $request)
    {
        try {
            $taiKhoan = $request->user();
            $nhanVien = $taiKhoan->nhanVien;

            if (!$nhanVien) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin nhân viên.'], 404);
            }

            // Get all active services
            $allServices = \App\Models\DichVu::where('trang_thai', true)->get();

            // Get registered services for this employee
            $registeredServices = DB::table('NhanVien_DichVu')
                ->where('nhan_vien_id', $nhanVien->id)
                ->get()
                ->keyBy('dich_vu_id');

            $formattedServices = $allServices->map(function ($service) use ($registeredServices) {
                $status = 'available';
                $statusText = 'Có thể đăng ký';
                $examSchedule = null;
                $registeredInfo = $registeredServices->get($service->id);

                if ($registeredInfo) {
                    if ($registeredInfo->trang_thai_duyet === 'DaDuyet') {
                        $status = 'active';
                        $statusText = 'Đang hoạt động';
                    } elseif ($registeredInfo->trang_thai_duyet === 'ChoDuyet') {
                        $status = 'pending';
                        $statusText = 'Đang chờ thi test';
                        // Generate mock exam schedule for UI purposes if it's pending
                        $examSchedule = [
                            'date' => \Carbon\Carbon::parse($registeredInfo->ngay_dang_ky)->addDays(2)->format('d/m/Y'),
                            'time' => '13:00 - 15:00',
                            'location' => 'Phòng thực hành tầng 3, Trụ sở CleanTrust Quận 1'
                        ];
                    }
                }

                $icon = 'cleaning_services';
                $desc = $service->mo_ta ?: 'Dịch vụ chuyên nghiệp từ CleanTrust.';
                if ($service->noi_dung_chi_tiet && is_array($service->noi_dung_chi_tiet)) {
                    if (isset($service->noi_dung_chi_tiet['icon'])) {
                        $icon = $service->noi_dung_chi_tiet['icon'];
                    }
                }

                return [
                    'id' => $service->id,
                    'name' => $service->ten_dich_vu,
                    'icon' => $icon,
                    'desc' => $desc,
                    'status' => $status,
                    'statusText' => $statusText,
                    'examSchedule' => $examSchedule
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedServices
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Get Skills Error: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Lỗi server: ' . $e->getMessage()], 500);
        }
    }

    public function registerSkill(Request $request, $id)
    {
        try {
            $taiKhoan = $request->user();
            $nhanVien = $taiKhoan->nhanVien;

            if (!$nhanVien) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin nhân viên.'], 404);
            }

            // Check if service exists
            $service = \App\Models\DichVu::find($id);
            if (!$service) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy dịch vụ.'], 404);
            }

            // Attach to pivot table if not already attached
            $exists = DB::table('NhanVien_DichVu')
                ->where('nhan_vien_id', $nhanVien->id)
                ->where('dich_vu_id', $id)
                ->exists();

            if ($exists) {
                return response()->json(['success' => false, 'message' => 'Bạn đã đăng ký dịch vụ này rồi.'], 400);
            }

            DB::table('NhanVien_DichVu')->insert([
                'nhan_vien_id' => $nhanVien->id,
                'dich_vu_id' => $id,
                'trang_thai_duyet' => 'ChoDuyet',
                'ngay_dang_ky' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Đăng ký lịch thi thành công!'
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Register Skill Error: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Lỗi server: ' . $e->getMessage()], 500);
        }
    }

    public function cancelSkill(Request $request, $id)
    {
        try {
            $taiKhoan = $request->user();
            $nhanVien = $taiKhoan->nhanVien;

            if (!$nhanVien) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin nhân viên.'], 404);
            }

            // Only allow cancellation if status is ChoDuyet
            $registeredInfo = DB::table('NhanVien_DichVu')
                ->where('nhan_vien_id', $nhanVien->id)
                ->where('dich_vu_id', $id)
                ->first();

            if (!$registeredInfo) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy lịch đăng ký dịch vụ này.'], 404);
            }

            if ($registeredInfo->trang_thai_duyet !== 'ChoDuyet') {
                return response()->json(['success' => false, 'message' => 'Chỉ có thể hủy đăng ký khi đang chờ duyệt.'], 400);
            }

            DB::table('NhanVien_DichVu')
                ->where('nhan_vien_id', $nhanVien->id)
                ->where('dich_vu_id', $id)
                ->delete();

            return response()->json([
                'success' => true,
                'message' => 'Đã hủy đăng ký lịch thi thành công!'
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Cancel Skill Error: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Lỗi server: ' . $e->getMessage()], 500);
        }
    }
}
