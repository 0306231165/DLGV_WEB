<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminBookingController extends Controller
{
    // Lấy danh sách booking và thông tin nhân sự
    public function index()
    {
        // 1. Lấy danh sách đơn hàng
        $ordersRaw = DB::table('donhang')
            ->join('taikhoan as kh', 'donhang.khach_hang_id', '=', 'kh.id')
            ->join('dichvu_loaigoi', 'donhang.dich_vu_loai_goi_id', '=', 'dichvu_loaigoi.id')
            ->join('dichvu', 'dichvu_loaigoi.dich_vu_id', '=', 'dichvu.id')
            ->leftJoin('taikhoan as nv_tk', 'donhang.nhan_vien_duoc_yeu_cau_id', '=', 'nv_tk.id')
            ->select(
                'donhang.id',
                'dichvu.ten_dich_vu as serviceType',
                'donhang.ho_ten_thuc_te as customer',
                'donhang.dia_chi_thuc_te as location',
                'donhang.ngay_bat_dau',
                'donhang.gio_lam_mac_dinh',
                'donhang.trang_thai_don',
                'donhang.nhan_vien_duoc_yeu_cau_id',
                'nv_tk.ho_ten as worker_name',
                'nv_tk.avatar as worker_avatar'
            )
            ->orderBy('donhang.ngay_tao', 'desc')
            ->get();

        $orders = $ordersRaw->map(function($order) {
            // Xác định status cho frontend
            $status = 'pending';
            if ($order->trang_thai_don === 'DangThucHien') {
                $status = 'in_progress';
            } elseif ($order->trang_thai_don === 'DaHoanThanh') {
                $status = 'completed';
            } elseif ($order->trang_thai_don === 'ChoXuLy' && $order->nhan_vien_duoc_yeu_cau_id) {
                $status = 'assigned';
            }

            // Định dạng ngày giờ
            $start = Carbon::parse($order->ngay_bat_dau);
            $timeText = $start->format('d/m/Y');
            if ($start->isToday()) $timeText = 'Hôm nay';
            elseif ($start->isTomorrow()) $timeText = 'Ngày mai';

            $timeRange = $order->gio_lam_mac_dinh ? Carbon::parse($order->gio_lam_mac_dinh)->format('H:i') : 'Chưa rõ';

            // timeStatus: delayed, active, normal
            $timeStatus = 'normal';
            if ($status === 'in_progress') $timeStatus = 'active';
            elseif ($status === 'pending' && $start->isPast()) $timeStatus = 'delayed';

            // Service Color
            $serviceColor = 'bg-slate-500';
            if (str_contains(mb_strtolower($order->serviceType), 'tổng vệ sinh')) $serviceColor = 'bg-blue-600';
            elseif (str_contains(mb_strtolower($order->serviceType), 'máy lạnh')) $serviceColor = 'bg-cyan-500';
            elseif (str_contains(mb_strtolower($order->serviceType), 'sân vườn')) $serviceColor = 'bg-emerald-500';
            elseif (str_contains(mb_strtolower($order->serviceType), 'cơ bản')) $serviceColor = 'bg-blue-400';
            elseif (str_contains(mb_strtolower($order->serviceType), 'khẩn cấp')) $serviceColor = 'bg-orange-500';

            // Worker info
            $worker = null;
            if ($order->nhan_vien_duoc_yeu_cau_id) {
                $nameParts = explode(' ', trim($order->worker_name));
                $initials = '';
                if (count($nameParts) >= 2) {
                    $initials = mb_strtoupper(mb_substr($nameParts[0], 0, 1) . mb_substr(end($nameParts), 0, 1));
                } elseif (count($nameParts) == 1) {
                    $initials = mb_strtoupper(mb_substr($nameParts[0], 0, 2));
                }

                $worker = [
                    'id' => 'W-' . $order->nhan_vien_duoc_yeu_cau_id,
                    'name' => $order->worker_name,
                    'avatar' => $order->worker_avatar,
                    'initials' => $initials
                ];
            }

            return [
                'id' => '#CT-' . str_pad($order->id, 4, '0', STR_PAD_LEFT),
                'raw_id' => $order->id,
                'serviceType' => $order->serviceType,
                'serviceColor' => $serviceColor,
                'customer' => $order->customer,
                'location' => $order->location,
                'timeText' => $timeText,
                'timeRange' => $timeRange,
                'timeStatus' => $timeStatus,
                'status' => $status,
                'worker' => $worker
            ];
        });

        // 2. Lấy danh sách nhân viên sẵn sàng (Ví dụ: trạng thái HoatDong)
        $workersRaw = DB::table('taikhoan')
            ->join('nhanvien', 'taikhoan.id', '=', 'nhanvien.tai_khoan_id')
            ->where('taikhoan.loai_tai_khoan', 'NhanVien')
            ->where('taikhoan.trang_thai', 'HoatDong')
            ->select('taikhoan.id', 'taikhoan.ho_ten', 'taikhoan.avatar')
            ->get();

        $availableWorkers = $workersRaw->map(function($w) {
            return [
                'id' => 'W-' . $w->id,
                'raw_id' => $w->id,
                'name' => $w->ho_ten,
                'role' => 'Chuyên viên', // Có thể join lấy dịch vụ chính của họ sau
                'rating' => 4.8, // Giả lập hoặc lấy từ DB
                'distance' => rand(1, 10) . '.' . rand(0, 9) . ' km', // Giả lập khoảng cách
                'avatar' => $w->avatar
            ];
        });

        // 3. Thống kê
        $stats = [
            'pending' => $orders->where('status', 'pending')->count(),
            'assigned' => $orders->where('status', 'assigned')->count(),
            'inProgress' => $orders->where('status', 'in_progress')->count(),
            'completed' => $orders->where('status', 'completed')->count(),
        ];

        return response()->json([
            'orders' => array_values($orders->toArray()),
            'availableWorkers' => $availableWorkers,
            'stats' => $stats
        ]);
    }

    // Gán nhân sự
    public function assign(Request $request, $id)
    {
        $workerId = $request->input('worker_id'); // truyền dạng raw_id (taikhoan.id)

        try {
            DB::table('donhang')
                ->where('id', $id)
                ->update([
                    'nhan_vien_duoc_yeu_cau_id' => $workerId,
                    'trang_thai_don' => 'DangThucHien'
                ]);

            $nhanVien = DB::table('nhanvien')->where('tai_khoan_id', $workerId)->first();
            if ($nhanVien) {
                DB::table('calamviec')
                    ->where('don_hang_id', $id)
                    ->update([
                        'nhan_vien_id' => $nhanVien->id,
                        'trang_thai_ca' => 'ChoNhanVienChiDinhXacNhan'
                    ]);
            }
            return response()->json(['success' => true, 'message' => 'Phân công thành công']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi cập nhật đơn hàng: ' . $e->getMessage()], 400);
        }
    }
}
