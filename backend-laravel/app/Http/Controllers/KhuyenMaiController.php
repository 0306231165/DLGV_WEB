<?php

namespace App\Http\Controllers;

use App\Models\KhuyenMai;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KhuyenMaiController extends Controller
{
    public function indexAdmin(): \Illuminate\Http\JsonResponse
    {
        $promotions = KhuyenMai::orderBy('id', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $promotions
        ]);
    }

    public function store(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $validated = $request->validate([
                'ma_code' => 'required|string|max:50|unique:KhuyenMai,ma_code',
                'tieu_de' => 'required|string|max:255',
                'mo_ta' => 'nullable|string',
                'loai_giam_gia' => 'required|in:PhanTram,TienMat',
                'gia_tri_giam' => 'required|numeric|min:0',
                'tong_luot_luu_toi_da' => 'required|integer|min:1',
                'tong_luot_dung_toi_da_toan_san' => 'required|integer|min:1',
                'ngay_bat_dau' => 'required|date',
                'ngay_ket_thuc' => 'required|date|after_or_equal:ngay_bat_dau',
            ]);

            $khuyenMai = KhuyenMai::create([
                'ma_code' => strtoupper($validated['ma_code']),
                'tieu_de' => $validated['tieu_de'],
                'mo_ta' => $validated['mo_ta'] ?? null,
                'loai_giam_gia' => $validated['loai_giam_gia'],
                'gia_tri_giam' => $validated['gia_tri_giam'],
                'tong_luot_luu_toi_da' => $validated['tong_luot_luu_toi_da'],
                'tong_luot_dung_toi_da_toan_san' => $validated['tong_luot_dung_toi_da_toan_san'],
                'ngay_bat_dau' => $validated['ngay_bat_dau'],
                'ngay_ket_thuc' => $validated['ngay_ket_thuc'],
                'trang_thai' => true,
                'so_luong_da_luu' => 0,
                'so_luong_da_dung' => 0,
                'luot_dung_moi_khach' => 1,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Thêm khuyến mãi thành công',
                'data' => $khuyenMai
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        try {
            $khuyenMai = KhuyenMai::findOrFail($id);
            $khuyenMai->update([
                'trang_thai' => !$khuyenMai->trang_thai,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật trạng thái thành công',
                'data' => $khuyenMai
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id): \Illuminate\Http\JsonResponse
    {
        try {
            $khuyenMai = KhuyenMai::findOrFail($id);
            $khuyenMai->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Xóa khuyến mãi thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa khuyến mãi này vì đang được sử dụng.'
            ], 500);
        }
    }

    public function getPublicVouchers()
    {
        $now = now();

        // 1. Lấy danh sách nhóm dịch vụ để làm Dropdown (chỉ lấy các nhóm đang hoạt động)
        $serviceGroups = DB::table('NhomDichVu')
            ->where('trang_thai', true)
            ->orderBy('thu_tu_hien_thi')
            ->select('id as value', 'ten_nhom as label')
            ->get();

        // 2. Lấy danh sách khuyến mãi kèm theo nhom_dich_vu_id
        $vouchers = DB::table('KhuyenMai')
            ->leftJoin('DichVu', 'KhuyenMai.dich_vu_id_ap_dung', '=', 'DichVu.id')
            ->where('KhuyenMai.trang_thai', true)
            ->where('ngay_bat_dau', '<=', $now)
            ->where('ngay_ket_thuc', '>=', $now)
            ->whereColumn('so_luong_da_luu', '<', 'tong_luot_luu_toi_da')
            ->select(
                'KhuyenMai.*',
                // Cột này sẽ quyết định mã KM nằm ở tab Dropdown nào trên Frontend
                DB::raw('COALESCE(KhuyenMai.nhom_dich_vu_id_ap_dung, DichVu.nhom_dich_vu_id) as nhom_dich_vu_id_mapped')
            )
            ->orderBy('ngay_ket_thuc', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'service_groups' => $serviceGroups,
            'vouchers' => $vouchers
        ]);
    }
}
