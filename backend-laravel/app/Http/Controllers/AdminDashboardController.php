<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function recentOrders()
    {
        // Sử dụng đúng cột 'khach_hang_id' như trong ảnh 3
        $orders = DB::table('donhang')
            ->join('taikhoan', 'donhang.khach_hang_id', '=', 'taikhoan.id') 
            ->select(
                'donhang.id', 
                'donhang.trang_thai_don', // Sử dụng đúng tên cột như trong ảnh 2
                'donhang.ngay_tao', 
                'taikhoan.ho_ten'
            )
            ->orderBy('donhang.ngay_tao', 'desc')
            ->take(10)
            ->get();

        $formattedOrders = $orders->map(function ($order) {
            
            // Lấy trạng thái đúng từ ảnh 2
            $status = $order->trang_thai_don; 
            $displayStatus = 'Đang chờ';
            
            // So sánh chuẩn xác với chữ 'DaHoanThanh' và 'DaHuy'
            if ($status === 'DaHoanThanh') {
                $displayStatus = 'Hoàn thành';
            } elseif ($status === 'DaHuy') {
                $displayStatus = 'Đã hủy';
            }

            return [
                // Trả về đúng ID thật từ MySQL (Ví dụ: ĐH-1, ĐH-2...)
                'ma_don' => 'ĐH-' . $order->id, 
                'khach_hang' => $order->ho_ten, 
                'ngay_dat' => date('d/m/Y H:i:s', strtotime($order->ngay_tao)),
                'trang_thai' => $displayStatus,
            ];
        });

        return response()->json($formattedOrders);
    }

    
}