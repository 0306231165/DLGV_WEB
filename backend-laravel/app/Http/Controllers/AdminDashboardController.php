<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function recentOrders()
    {
        // Sử dụng JOIN giữa bảng 'donhang' và 'taikhoan' (vì dữ liệu khách hàng nằm ở bảng taikhoan)
        // Chú ý: 
        // 1. Nếu cột liên kết không phải 'khach_hang_id', hãy sửa lại trong join()
        // 2. Chúng ta lấy 'ho_ten' từ bảng 'taikhoan'
        $orders = DB::table('donhang')
            ->join('taikhoan', 'donhang.khach_hang_id', '=', 'taikhoan.id') 
            ->select(
                'donhang.id', 
                'donhang.trang_thai_don', 
                'donhang.ngay_tao', 
                'taikhoan.ho_ten'
            )
            ->orderBy('donhang.ngay_tao', 'desc')
            ->take(10)
            ->get();

        $formattedOrders = $orders->map(function ($order) {
            
            // Xử lý logic trạng thái đơn hàng
            $status = $order->trang_thai_don; 
            $displayStatus = 'Đang chờ';
            
            if ($status === 'HoanThanh') {
                $displayStatus = 'Hoàn thành';
            } elseif ($status === 'DaHuy') {
                $displayStatus = 'Đã hủy';
            }

            return [
                'ma_don' => 'ADM ' . str_pad($order->id, 7, '0', STR_PAD_LEFT), 
                'khach_hang' => $order->ho_ten ?? 'Khách hàng ẩn', 
                'ngay_dat' => date('m/d/Y H:i:s', strtotime($order->ngay_tao)),
                'trang_thai' => $displayStatus,
            ];
        });

        return response()->json($formattedOrders);
    }
}