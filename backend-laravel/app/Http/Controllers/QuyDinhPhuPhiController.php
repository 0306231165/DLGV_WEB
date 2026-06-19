<?php

namespace App\Http\Controllers;

use App\Models\QuyDinhPhuPhi;
use Illuminate\Http\Request;

class QuyDinhPhuPhiController extends Controller
{
    /**
     * Lấy toàn bộ danh sách quy định phụ phí, sắp xếp theo id tăng dần.
     */
    public function index(): \Illuminate\Http\JsonResponse
    {
        $data = QuyDinhPhuPhi::orderBy('id', 'asc')->get();
        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    /**
     * Cập nhật một quy định phụ phí theo ID.
     */
    public function update(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        try {
            $validated = $request->validate([
                'ten_phu_phi'   => 'sometimes|string|max:150',
                'loai_phu_phi'  => 'sometimes|in:PhanTram,TienMat',
                'gia_tri_phu_phi' => 'sometimes|numeric|min:0',
                'trang_thai'    => 'sometimes|boolean',
                'mo_ta'         => 'sometimes|nullable|string|max:255',
            ]);

            $record = QuyDinhPhuPhi::findOrFail($id);
            $record->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật thành công',
                'data'    => $record,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage(),
            ], 500);
        }
    }
}
