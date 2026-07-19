<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DichVu;
use App\Models\DonHang;
use Carbon\Carbon;

class AdminServiceStatsController extends Controller
{
    public function index(Request $request)
    {
        try {
            $dichVus = DichVu::with(['loaiGoi', 'nhomDichVu'])->get();
            $now = Carbon::now();
            
            $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date'))->startOfDay() : $now->copy()->startOfMonth();
            $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date'))->endOfDay() : $now->copy()->endOfDay();

            $stats = [];

            foreach ($dichVus as $dv) {
                // Kiểm tra trạng thái nếu cần, nhưng thường thống kê thì hiện cả dịch vụ cũ/mới, có thể bỏ qua check trạng thái hoặc chỉ lấy dịch vụ có trạng thái hiển thị
                
                // Lấy danh sách ID của DichVuLoaiGoi thuộc về dịch vụ này
                $dichVuLoaiGoiIds = $dv->loaiGoi->pluck('id');

                // Truy vấn các đơn hàng thuộc dịch vụ này, đã hoàn thành và nằm trong khoảng thời gian được lọc
                $donHangsQuery = DonHang::whereIn('dich_vu_loai_goi_id', $dichVuLoaiGoiIds)
                                        ->where('trang_thai_don', 'DaHoanThanh')
                                        ->whereBetween('ngay_tao', [$startDate, $endDate]);

                $soGoiDaDat = (clone $donHangsQuery)->count();
                $tongDoanhThu = (clone $donHangsQuery)->sum('tong_tien_cuoi_cung');

                $stats[] = [
                    'id' => $dv->id,
                    'ten_dich_vu' => $dv->ten_dich_vu ?? 'N/A',
                    'icon' => $dv->nhomDichVu->icon ?? 'cleaning_services',
                    'so_goi_da_dat' => $soGoiDaDat,
                    'tong_doanh_thu' => $tongDoanhThu,
                    'trang_thai' => $dv->trang_thai
                ];
            }

            // Sắp xếp theo số gói đã đặt giảm dần, nếu bằng thì theo doanh thu giảm dần
            usort($stats, function ($a, $b) {
                if ($a['so_goi_da_dat'] == $b['so_goi_da_dat']) {
                    return $b['tong_doanh_thu'] <=> $a['tong_doanh_thu'];
                }
                return $b['so_goi_da_dat'] <=> $a['so_goi_da_dat'];
            });

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thống kê dịch vụ: ' . $e->getMessage()
            ], 500);
        }
    }
}
