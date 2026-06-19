<?php

namespace App\Http\Controllers;

use App\Models\DichVu;
use App\Models\NhomDichVu;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DichVuController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(DichVu $dichVu)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DichVu $dichVu)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DichVu $dichVu)
    {
        //
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
