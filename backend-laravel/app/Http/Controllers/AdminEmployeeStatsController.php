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
            $startOfWeek = $now->copy()->startOfWeek();
            $endOfWeek = $now->copy()->endOfWeek();

            $stats = [];

            foreach ($nhanViens as $nv) {
                // Lấy tất cả ca làm việc của nhân viên
                $totalShifts = CaLamViec::where('nhan_vien_id', $nv->id)->count();

                // Lấy danh sách ID đơn hàng liên quan đến các ca làm việc của nhân viên này
                $donHangIds = CaLamViec::where('nhan_vien_id', $nv->id)
                                       ->pluck('don_hang_id')
                                       ->unique();

                // Tính tổng tiền nhân viên kiếm được trên web (Tất cả đơn hàng hoàn thành mà nhân viên có làm ca)
                $totalWebEarnings = DonHang::whereIn('id', $donHangIds)
                                           ->where('trang_thai_don', 'DaHoanThanh')
                                           ->sum('tong_tien_cuoi_cung');

                // Tính tổng số tiền theo tuần hiện tại
                $weeklyEarnings = DonHang::whereIn('id', $donHangIds)
                                         ->where('trang_thai_don', 'DaHoanThanh')
                                         ->whereBetween('ngay_tao', [$startOfWeek, $endOfWeek])
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
