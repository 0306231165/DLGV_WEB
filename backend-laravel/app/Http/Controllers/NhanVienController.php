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

            $thuNhapThangNay = DB::table('CaLamViec')
                ->where('nhan_vien_id', $nhanVien->id)
                ->where('trang_thai_ca', 'DaHoanThanh')
                ->whereMonth('ngay_lam', now()->month)
                ->whereYear('ngay_lam', now()->year)
                ->sum('thuc_nhan_nv');

            $caTiepTheo = \App\Models\CaLamViec::with(['donHang.khachHang'])
                ->where('nhan_vien_id', $nhanVien->id)
                ->whereIn('trang_thai_ca', ['DaNhan', 'ChoXacNhan', 'ChoNhanVienChiDinhXacNhan'])
                ->where(function($query) {
                    $query->where('ngay_lam', '>', now()->toDateString())
                          ->orWhere(function($q) {
                              $q->where('ngay_lam', now()->toDateString())
                                ->where('gio_bat_dau', '>', now()->toTimeString());
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
                    'thu_nhap_thang_nay' => $thuNhapThangNay,
                    'ca_hoan_thanh' => $nhanVien->tong_so_ca_hoan_thanh,
                    'danh_gia_sao' => (float)$nhanVien->danh_gia_sao_trung_binh,
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
            $nhanVienId = Auth::user()->nhanVien->id;

            // Xóa tất cả các lịch nghỉ định kỳ
            LichNghi::where('nhan_vien_id', $nhanVienId)
                ->where('loai_nghi', 'DinhKy')
                ->delete();

            return response()->json([
                'success' => true,
                'message' => 'Hủy hợp đồng cam kết thành công!'
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Cancel Cam Ket Lich Nghi Error: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
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
}
