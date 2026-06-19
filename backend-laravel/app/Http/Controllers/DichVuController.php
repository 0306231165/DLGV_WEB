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
                'co_bien_the' => 'boolean',
                'noi_dung_chi_tiet' => 'nullable|array'
            ]);

            $dichVu = DichVu::create([
                'nhom_dich_vu_id' => $validated['nhom_dich_vu_id'],
                'ten_dich_vu' => $validated['ten_dich_vu'],
                'cap_do_dich_vu' => $validated['cap_do_dich_vu'],
                'don_gia_co_ban' => $validated['don_gia_co_ban'],
                'thoi_gian_chuan_co_ban' => $validated['thoi_gian_chuan_co_ban'],
                'mo_ta' => $validated['mo_ta'] ?? null,
                'noi_dung_chi_tiet' => $validated['noi_dung_chi_tiet'] ?? null,
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
        // 1. Lấy tất cả nhóm dịch vụ để làm thanh lọc (Filter Pills), sắp theo thứ tự hiển thị
        $nhomDichVu = NhomDichVu::where('trang_thai', true)
            ->orderBy('thu_tu_hien_thi', 'asc')
            ->get();

        // 2. Lấy tất cả dịch vụ, kèm loaiGoi (Ca lẻ/Gói tháng/24-7),
        //    tuyChonBienThe (giá theo diện tích, chỉ có khi co_bien_the = true)
        //    và dichVuThem (dịch vụ thêm tùy chọn, nếu có)
        $dichVu = DichVu::with([
                'loaiGoi.loaiGoi',
                'tuyChonBienThe' => function ($q) {
                    $q->where('trang_thai', true);
                },
                'dichVuThem' => function ($q) {
                    $q->where('trang_thai', true);
                },
                'dichVuThem.dichVuThem',
            ])
            ->where('trang_thai', true)
            ->get();

        return response()->json([
            'success' => true,
            'groups'  => $nhomDichVu,
            'services' => $dichVu
        ], 200);
    }

    public function getServiceDetail(int $id): JsonResponse
    {
        try {
            $dichVu = DichVu::with([
                'loaiGoi.loaiGoi',
                'nhomDichVu',
                'tuyChonBienThe' => function ($q) {
                    $q->where('trang_thai', true);
                },
                'dichVuThem' => function ($q) {
                    $q->where('trang_thai', true);
                },
                'dichVuThem.dichVuThem',
            ])
                ->where('trang_thai', true)
                ->find($id);

            if (!$dichVu) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy dịch vụ hoặc dịch vụ đã ngừng cung cấp.'
                ], 404);
            }

            return response()->json(['success' => true, 'service' => $dichVu], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Đã có lỗi hệ thống xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }
}
