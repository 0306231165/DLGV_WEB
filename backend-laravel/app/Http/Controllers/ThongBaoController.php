<?php

namespace App\Http\Controllers;

use App\Models\ThongBao;
use Illuminate\Http\Request;

class ThongBaoController extends Controller
{
    /**
     * Lấy danh sách thông báo của Khách hàng hiện tại
     */
    public function getCustomerNotifications(Request $request)
    {
        $khachHang = \Illuminate\Support\Facades\Auth::user()->khachHang;
        if (!$khachHang) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy tài khoản khách hàng'], 404);
        }

        $notifications = ThongBao::where('loai_nguoi_nhan', 'KhachHang')
            ->where('nguoi_nhan_id', $khachHang->id)
            ->orderBy('ngay_tao', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }

    /**
     * Đánh dấu 1 thông báo là đã đọc
     */
    public function markAsRead(Request $request, $id)
    {
        $khachHang = \Illuminate\Support\Facades\Auth::user()->khachHang;
        if (!$khachHang) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy tài khoản khách hàng'], 404);
        }

        $notification = ThongBao::where('id', $id)
            ->where('loai_nguoi_nhan', 'KhachHang')
            ->where('nguoi_nhan_id', $khachHang->id)
            ->first();

        if ($notification) {
            $notification->is_da_doc = true;
            $notification->save();
        }

        return response()->json(['success' => true, 'message' => 'Đã đánh dấu đọc']);
    }

    /**
     * Đánh dấu tất cả thông báo là đã đọc
     */
    public function markAllAsRead(Request $request)
    {
        $khachHang = \Illuminate\Support\Facades\Auth::user()->khachHang;
        if (!$khachHang) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy tài khoản khách hàng'], 404);
        }

        ThongBao::where('loai_nguoi_nhan', 'KhachHang')
            ->where('nguoi_nhan_id', $khachHang->id)
            ->where('is_da_doc', false)
            ->update(['is_da_doc' => true]);

        return response()->json(['success' => true, 'message' => 'Đã đánh dấu đọc tất cả']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $khachHang = \Illuminate\Support\Facades\Auth::user()->khachHang;
        if (!$khachHang) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy tài khoản khách hàng'], 404);
        }

        ThongBao::where('id', $id)
            ->where('loai_nguoi_nhan', 'KhachHang')
            ->where('nguoi_nhan_id', $khachHang->id)
            ->delete();

        return response()->json(['success' => true, 'message' => 'Đã xóa thông báo']);
    }
}
