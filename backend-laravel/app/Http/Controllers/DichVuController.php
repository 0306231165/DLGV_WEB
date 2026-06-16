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
