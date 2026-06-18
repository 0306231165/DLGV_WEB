<?php

namespace App\Http\Controllers;

use App\Models\NhanVien;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NhanVienController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Có thể mở rộng lấy toàn bộ danh sách nhân viên nếu cần
        $staffs = NhanVien::with('taiKhoan')->get();
        
        $formattedStaffs = $staffs->map(function ($staff) {
            return [
                'id' => $staff->id,
                'name' => $staff->taiKhoan->ho_ten ?? 'Chưa cập nhật',
                'avatar' => $staff->taiKhoan->avatar ?? 'https://via.placeholder.com/150',
                'rating' => (float) $staff->danh_gia_sao_trung_binh,
                'completedJobs' => $staff->tong_so_ca_hoan_thanh,
                'reviews' => $staff->tong_so_danh_gia,
                'experience' => 'Chuyên gia'
            ];
        });

        return response()->json($formattedStaffs, 200);
    }

    public function show(int $id)
    {
        // Lấy thông tin nhân viên kèm theo bảng tài khoản gốc
        $staff = NhanVien::with('taiKhoan')->find($id);

        if (!$staff) {
            return response()->json([
                'message' => 'Không tìm thấy thông tin nhân viên này trong hệ thống.'
            ], 404);
        }

        // Format dữ liệu chuẩn chỉ để Frontend dễ hiển thị
        $formattedStaff = [
            'id' => $staff->id,
            'name' => $staff->taiKhoan->ho_ten ?? 'Chưa cập nhật',
            'avatar' => $staff->taiKhoan->avatar ?? 'https://via.placeholder.com/150',
            'rating' => (float) $staff->danh_gia_sao_trung_binh,
            'completedJobs' => $staff->tong_so_ca_hoan_thanh,
            'reviews' => $staff->tong_so_danh_gia,
            'experience' => 'Chuyên gia',
            'bio' => 'Chuyên gia vệ sinh tận tâm, tay nghề cao, luôn luôn lắng nghe ý kiến phản hồi từ khách hàng và làm việc với thái độ chu đáo nhất.'
        ];

        return response()->json($formattedStaff, 200);
    }

    public function getFeaturedStaff()
    {
        // Lấy FULL danh sách đạt chuẩn
        $staffs = NhanVien::with('taiKhoan')
            ->where('tong_so_ca_hoan_thanh', '>=', 1000)
            ->whereBetween('danh_gia_sao_trung_binh', [4.9, 5.0])
            ->get();

        $formattedStaffs = $staffs->map(function ($staff) {
            return [
                'id' => $staff->id,
                'name' => $staff->taiKhoan->ho_ten ?? 'Chưa cập nhật',
                'avatar' => $staff->taiKhoan->avatar ?? 'https://via.placeholder.com/150',
                'rating' => (float) $staff->danh_gia_sao_trung_binh,
                'completedJobs' => $staff->tong_so_ca_hoan_thanh,
                'reviews' => $staff->tong_so_danh_gia,
                'experience' => 'Chuyên gia'
            ];
        });

        return response()->json($formattedStaffs, 200);
    }

    /**
     * GET /api/khach-hang/nhan-vien-yeu-thich
     * Trả về danh sách nhân viên mà khách hàng đã lưu yêu thích.
     */
    public function getYeuThich(Request $request)
    {
        $khachHang = $request->user()->khachHang;
 
        if (!$khachHang) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy khách hàng.'], 404);
        }
 
        $staffs = $khachHang->nhanVienYeuThich()
            ->with('taiKhoan')
            ->get()
            ->map(fn($staff) => $this->formatStaff($staff));
 
        return response()->json(['success' => true, 'data' => $staffs]);
    }
 
    /**
     * POST /api/khach-hang/nhan-vien-yeu-thich/{nhanVienId}
     * Thêm nhân viên vào danh sách yêu thích.
     * Dùng syncWithoutDetaching để không bị lỗi nếu đã tồn tại.
     */
    public function themYeuThich(Request $request, int $nhanVienId)
    {
        $khachHang = $request->user()->khachHang;
 
        if (!$khachHang) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy khách hàng.'], 404);
        }
 
        // Kiểm tra nhân viên có tồn tại không
        $nhanVien = NhanVien::find($nhanVienId);
        if (!$nhanVien) {
            return response()->json(['success' => false, 'message' => 'Nhân viên không tồn tại.'], 404);
        }
 
        // syncWithoutDetaching: thêm nếu chưa có, bỏ qua nếu đã có → không lỗi duplicate
        $khachHang->nhanVienYeuThich()->syncWithoutDetaching([$nhanVienId]);
 
        return response()->json([
            'success' => true,
            'message' => 'Đã thêm nhân viên vào danh sách yêu thích.',
        ]);
    }
 
    /**
     * DELETE /api/khach-hang/nhan-vien-yeu-thich/{nhanVienId}
     * Xóa nhân viên khỏi danh sách yêu thích.
     */
    public function xoaYeuThich(Request $request, int $nhanVienId)
    {
        $khachHang = $request->user()->khachHang;
 
        if (!$khachHang) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy khách hàng.'], 404);
        }
 
        $khachHang->nhanVienYeuThich()->detach($nhanVienId);
 
        return response()->json([
            'success' => true,
            'message' => 'Đã xóa nhân viên khỏi danh sách yêu thích.',
        ]);
    }
 
    /**
     * GET /api/khach-hang/nhan-vien-da-lam
     * Trả về danh sách nhân viên đã từng làm ca hoàn thành cho khách hàng này.
     * DISTINCT theo nhan_vien_id để tránh hiển thị trùng lặp dù có nhiều ca.
     */
    public function getNhanVienDaLam(Request $request)
    {
        $khachHang = $request->user()->khachHang;
 
        if (!$khachHang) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy khách hàng.'], 404);
        }
 
        // JOIN: DonHang (của khách này) → CaLamViec (DaHoanThanh, có NV)
        // SELECT DISTINCT nhan_vien_id → chỉ trả về mỗi NV đúng 1 lần
        $nhanVienIds = DB::table('CaLamViec')
            ->join('DonHang', 'CaLamViec.don_hang_id', '=', 'DonHang.id')
            ->where('DonHang.khach_hang_id', $khachHang->id)
            ->where('CaLamViec.trang_thai_ca', 'DaHoanThanh')
            ->whereNotNull('CaLamViec.nhan_vien_id')
            ->distinct()
            ->pluck('CaLamViec.nhan_vien_id');
 
        // Lấy id NV đã yêu thích để đánh dấu is_saved trên frontend
        $savedIds = $khachHang->nhanVienYeuThich()->pluck('NhanVien.id')->toArray();
 
        $staffs = NhanVien::with('taiKhoan')
            ->whereIn('id', $nhanVienIds)
            ->get()
            ->map(function ($staff) use ($savedIds) {
                return array_merge($this->formatStaff($staff), [
                    'is_saved' => in_array($staff->id, $savedIds),
                ]);
            });
 
        return response()->json([
            'success'   => true,
            'data'      => $staffs,
            // debug_info: chỉ dùng để test, xóa khi deploy production
            '_debug'    => [
                'khach_hang_id'  => $khachHang->id,
                'nhan_vien_ids'  => $nhanVienIds->toArray(),
                'saved_ids'      => $savedIds,
                'staff_count'    => $staffs->count(),
            ],
        ]);
    }
 
    // ─────────────────────────────────────────────────────────────────────────
    // Helper dùng chung để format NhanVien → array trả về FE
    // ─────────────────────────────────────────────────────────────────────────
    private function formatStaff(NhanVien $staff): array
    {
        return [
            'id'           => $staff->id,
            'name'         => $staff->taiKhoan->ho_ten ?? 'Chưa cập nhật',
            'avatar'       => $staff->taiKhoan->avatar ?? 'https://via.placeholder.com/150',
            'rating'       => (float) $staff->danh_gia_sao_trung_binh,
            'completedJobs'=> $staff->tong_so_ca_hoan_thanh,
            'reviews'      => $staff->tong_so_danh_gia,
            'experience'   => 'Chuyên gia',
        ];
    }
}
