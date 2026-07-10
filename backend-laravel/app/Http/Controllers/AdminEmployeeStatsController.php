<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NhanVien;
use App\Models\DonHang;
use App\Models\CaLamViec;
use Carbon\Carbon;

class AdminEmployeeStatsController extends Controller
{
    public function index(Request $request)
    {
        try {
            $nhanViens = NhanVien::with('taiKhoan')->get();
            $now = Carbon::now();
            
            $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date'))->startOfDay() : $now->copy()->startOfMonth();
            $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date'))->endOfDay() : $now->copy()->endOfDay();

            $stats = [];

            foreach ($nhanViens as $nv) {
                // Bỏ qua những nhân viên có tài khoản bị khóa (trạng thái khác HoatDong)
                if (isset($nv->taiKhoan) && $nv->taiKhoan->trang_thai !== 'HoatDong') {
                    continue;
                }

                // Lấy tất cả ca làm việc của nhân viên trong khoảng thời gian
                $caLamViecsQuery = CaLamViec::where('nhan_vien_id', $nv->id)
                                            ->whereBetween('ngay_lam', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);

                $totalShifts = (clone $caLamViecsQuery)->count();

                // Lấy danh sách ID đơn hàng liên quan đến các ca làm việc của nhân viên này trong kỳ
                $donHangIds = (clone $caLamViecsQuery)->pluck('don_hang_id')->unique();

                // Tính tổng tiền nhân viên kiếm được trên web trong kỳ
                $totalWebEarnings = DonHang::whereIn('id', $donHangIds)
                                           ->where('trang_thai_don', 'DaHoanThanh')
                                           ->sum('tong_tien_cuoi_cung');

                // Doanh thu kỳ (giữ nguyên biến weeklyEarnings để frontend đọc)
                // Ta vẫn có thể gán nó bằng totalWebEarnings vì đều tính trong cùng 1 kỳ
                $weeklyEarnings = DonHang::whereIn('id', $donHangIds)
                                         ->where('trang_thai_don', 'DaHoanThanh')
                                         ->whereBetween('ngay_tao', [$startDate, $endDate])
                                         ->sum('tong_tien_cuoi_cung');

                $stats[] = [
                    'id' => $nv->id,
                    'ho_ten' => $nv->taiKhoan->ho_ten ?? 'N/A',
                    'so_dien_thoai' => $nv->taiKhoan->so_dien_thoai ?? 'N/A',
                    'avatar' => $nv->taiKhoan->avatar ?? 'https://ui-avatars.com/api/?name=' . urlencode($nv->taiKhoan->ho_ten ?? 'NV') . '&background=random',
                    'tong_ca_lam_viec' => $totalShifts,
                    'doanh_thu_tuan' => $weeklyEarnings,
                    'tong_doanh_thu_web' => $totalWebEarnings,
                    'trang_thai' => $nv->taiKhoan->trang_thai ?? 'N/A'
                ];
            }

            // Sắp xếp theo tổng ca làm việc giảm dần, nếu bằng thì theo doanh thu tuần giảm dần
            usort($stats, function ($a, $b) {
                if ($a['tong_ca_lam_viec'] == $b['tong_ca_lam_viec']) {
                    return $b['doanh_thu_tuan'] <=> $a['doanh_thu_tuan'];
                }
                return $b['tong_ca_lam_viec'] <=> $a['tong_ca_lam_viec'];
            });

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thống kê nhân viên: ' . $e->getMessage()
            ], 500);
        }
    }
}
