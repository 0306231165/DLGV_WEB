<?php

namespace App\Http\Controllers;

use App\Models\DichVu;
use App\Models\NhomDichVu;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DichVuController extends Controller
{
    public function indexAdmin(): JsonResponse
    {
        // Lấy tất cả dịch vụ (kể cả bị ẩn), kèm theo tên nhóm
        $dichVu = DichVu::with('nhomDichVu')->orderBy('id', 'asc')->get();
        return response()->json([
            'success' => true,
            'data' => $dichVu
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'nhom_dich_vu_id' => 'required|exists:NhomDichVu,id',
                'ten_dich_vu' => 'required|string|max:255',
                'cap_do_dich_vu' => 'required|in:TieuChuan,CaoCap',
                'don_gia_co_ban' => 'required|numeric|min:0',
                'thoi_gian_chuan_co_ban' => 'required|integer|min:0',
                'mo_ta' => 'nullable|string|max:500',
                'co_bien_the' => 'boolean'
            ]);

            $dichVu = DichVu::create([
                'nhom_dich_vu_id' => $validated['nhom_dich_vu_id'],
                'ten_dich_vu' => $validated['ten_dich_vu'],
                'cap_do_dich_vu' => $validated['cap_do_dich_vu'],
                'don_gia_co_ban' => $validated['don_gia_co_ban'],
                'thoi_gian_chuan_co_ban' => $validated['thoi_gian_chuan_co_ban'],
                'mo_ta' => $validated['mo_ta'] ?? null,
                'co_bien_the' => $validated['co_bien_the'] ?? false,
                'trang_thai' => true,
                'is_noi_bat' => false
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Thêm dịch vụ thành công',
                'data' => $dichVu
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        try {
            $dichVu = DichVu::findOrFail($id);

            $validated = $request->validate([
                'don_gia_co_ban' => 'required|numeric|min:0',
            ]);

            $dichVu->update([
                'don_gia_co_ban' => $validated['don_gia_co_ban'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật dịch vụ thành công',
                'data' => $dichVu
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            $dichVu = DichVu::findOrFail($id);
            $dichVu->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Xóa dịch vụ thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa dịch vụ này vì đang được sử dụng.'
            ], 500);
        }
    }

    public function getServicesPageData(): JsonResponse
    {
        // 1. Lấy tất cả nhóm dịch vụ để làm thanh lọc (Filter Pills)
        $nhomDichVu = NhomDichVu::all();

        // 2. Lấy tất cả dịch vụ, kèm theo quan hệ loaiGoi để check gói tháng/ca lẻ
        $dichVu = DichVu::with(['loaiGoi.loaiGoi'])->where('trang_thai', true)->get();

        return response()->json([
            'success' => true,
            'groups'  => $nhomDichVu,
            'services'=> $dichVu
        ], 200);
    }

    public function getServiceDetail($id): JsonResponse
    {
        try {
            // Nạp kèm loaiGoi (để hiển thị tag Gói tháng) và nhomDichVu (để hiển thị Tên nhóm)
            // Lưu ý: Đảm bảo tên quan hệ 'nhomDichVu' viết đúng như bạn định nghĩa trong Model DichVu
            $dichVu = DichVu::with(['loaiGoi.loaiGoi', 'nhomDichVu'])
                ->where('trang_thai', true)
                ->find($id);

            // Nếu không tìm thấy dịch vụ hoặc dịch vụ đang bị ẩn (trang_thai = false)
            if (!$dichVu) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy dịch vụ hoặc dịch vụ đã ngừng cung cấp.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'service' => $dichVu
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Đã có lỗi hệ thống xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }
}
