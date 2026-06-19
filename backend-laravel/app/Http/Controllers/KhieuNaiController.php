<?php

namespace App\Http\Controllers;

use App\Models\KhieuNai;
use Illuminate\Http\Request;
use Carbon\Carbon;

class KhieuNaiController extends Controller
{
    public function indexAdmin()
    {
        $khieuNais = KhieuNai::with(['donHang.dichVu', 'nguoiKhieuNai'])
            ->orderBy('id', 'desc')
            ->get();

        $data = $khieuNais->map(function ($item) {
            $customerName = 'Khách Ẩn Danh';
            $customerPhone = 'Không có';
            if ($item->nguoi_khieu_nai_loai === 'KhachHang' && $item->nguoiKhieuNai) {
                $customerName = $item->nguoiKhieuNai->ho_ten ?? 'Không tên';
                $customerPhone = $item->nguoiKhieuNai->so_dien_thoai ?? 'Không có';
            }

            $serviceName = 'Chưa xác định';
            if ($item->donHang && $item->donHang->dichVu) {
                $serviceName = $item->donHang->dichVu->ten_dich_vu;
            }

            return [
                'id' => $item->id,
                'code' => '#FB-' . str_pad($item->id, 4, '0', STR_PAD_LEFT),
                'customer' => $customerName,
                'phone' => $customerPhone,
                'service' => $serviceName,
                'date' => $item->ngay_tao ? $item->ngay_tao->format('d/m/Y') : '',
                'type' => $item->ly_do_khieu_nai,
                'desc' => $item->mo_ta_chi_tiet,
                'status' => $item->trang_thai_xu_ly,
                'adminNote' => $item->ket_qua_xu_ly,
                'rating' => $item->rating,
                'isVisible' => $item->is_visible,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function updateReply(Request $request, $id)
    {
        try {
            $khieuNai = KhieuNai::findOrFail($id);
            $khieuNai->update([
                'ket_qua_xu_ly' => $request->input('adminNote'),
                'trang_thai_xu_ly' => $request->input('status', 'DaGiaiQuyet'),
                'admin_xu_ly_id' => $request->user()->id ?? null
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật phản hồi thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function toggleVisibility($id)
    {
        try {
            $khieuNai = KhieuNai::findOrFail($id);
            $khieuNai->update([
                'is_visible' => !$khieuNai->is_visible
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Đã thay đổi trạng thái hiển thị',
                'isVisible' => $khieuNai->is_visible
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $khieuNai = KhieuNai::findOrFail($id);
            $khieuNai->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa khiếu nại thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
