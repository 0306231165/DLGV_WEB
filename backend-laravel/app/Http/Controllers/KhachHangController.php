<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\TaiKhoan;
use App\Models\KhachHang;

class KhachHangController extends Controller
{
    /**
     * GET /api/khach-hang/profile
     * Trả về thông tin tài khoản của khách hàng đang đăng nhập.
     */
    public function profile(Request $request)
    {
        /** @var TaiKhoan $taiKhoan */
        $taiKhoan = $request->user();

        // Load quan hệ khachHang để lấy id KhachHang (dùng cho các query liên quan)
        $taiKhoan->load('khachHang');

        return response()->json([
            'success' => true,
            'data' => [
                'id'         => $taiKhoan->id,
                'ho_ten'     => $taiKhoan->ho_ten,
                'email'      => $taiKhoan->email,
                'so_dien_thoai' => $taiKhoan->so_dien_thoai,
                'ngay_sinh'  => $taiKhoan->ngay_sinh,
                'gioi_tinh'  => $taiKhoan->gioi_tinh,
                'avatar'     => $taiKhoan->avatar,
                'trang_thai' => $taiKhoan->trang_thai,
                // Tier thành viên — hiện tại dựa vào tổng đơn hoàn thành,
                // có thể mở rộng thành bảng hạng thẻ sau
                'hang_thanh_vien' => $this->getTier($taiKhoan->khachHang),
            ],
        ]);
    }

    /**
     * PUT /api/khach-hang/profile
     * Cập nhật họ tên, SĐT, ngày sinh, giới tính.
     * Email KHÔNG cho đổi (đã xác minh).
     */
    public function updateProfile(Request $request)
    {
        $request->validate([
            'ho_ten'    => 'required|string|max:150',
            'so_dien_thoai' => [
                'required',
                'string',
                'max:15',
                // Unique trừ chính user này
                \Illuminate\Validation\Rule::unique('TaiKhoan', 'so_dien_thoai')
                    ->ignore($request->user()->id),
            ],
            'ngay_sinh' => 'nullable|date',
            'gioi_tinh' => 'nullable|in:Nam,Nữ,Khác',
        ]);

        /** @var TaiKhoan $taiKhoan */
        $taiKhoan = $request->user();
        $taiKhoan->update([
            'ho_ten'         => $request->ho_ten,
            'so_dien_thoai'  => $request->so_dien_thoai,
            'ngay_sinh'      => $request->ngay_sinh,
            'gioi_tinh'      => $request->gioi_tinh,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin thành công.',
            'data' => [
                'ho_ten'        => $taiKhoan->ho_ten,
                'so_dien_thoai' => $taiKhoan->so_dien_thoai,
                'ngay_sinh'     => $taiKhoan->ngay_sinh,
                'gioi_tinh'     => $taiKhoan->gioi_tinh,
            ],
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // Địa chỉ đã lưu
    // ──────────────────────────────────────────────────────────────

    /**
     * GET /api/khach-hang/dia-chi
     */
    public function getAddresses(Request $request)
    {
        $khachHang = $request->user()->khachHang;
        if (!$khachHang) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy khách hàng.'], 404);
        }

        $addresses = $khachHang->diaChiDaLuu()->get()->map(function ($item) {
            return [
                'id'        => $item->id,
                'label'     => $item->ten_goi_nho,
                'address'   => $item->dia_chi_chi_tiet,
                'isDefault' => (bool) $item->is_mac_dinh,
            ];
        });

        return response()->json(['success' => true, 'data' => $addresses]);
    }

    public function storeAddress(Request $request)
    {
        $request->validate([
            'label'   => 'required|string|max:100',
            'address' => 'required|string|max:255',
        ]);

        $khachHang = $request->user()->khachHang;
        if (!$khachHang) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy khách hàng.'], 404);
        }

        $isFirst = $khachHang->diaChiDaLuu()->count() === 0;

        $addr = $khachHang->diaChiDaLuu()->create([
            'ten_goi_nho'      => $request->label,
            'dia_chi_chi_tiet' => $request->address,
            'is_mac_dinh'      => $isFirst,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thêm địa chỉ thành công.',
            'data' => [
                'id'        => $addr->id,
                'label'     => $addr->ten_goi_nho,
                'address'   => $addr->dia_chi_chi_tiet,
                'isDefault' => (bool) $addr->is_mac_dinh,
            ],
        ], 201);
    }

    public function updateAddress(Request $request, int $id)
    {
        $request->validate([
            'label'   => 'required|string|max:100',
            'address' => 'required|string|max:255',
        ]);

        $khachHang = $request->user()->khachHang;
        $addr = $khachHang->diaChiDaLuu()->findOrFail($id);

        $addr->update([
            'ten_goi_nho'      => $request->label,
            'dia_chi_chi_tiet' => $request->address,
        ]);

        return response()->json(['success' => true, 'message' => 'Cập nhật địa chỉ thành công.']);
    }

    /**
     * DELETE /api/khach-hang/dia-chi/{id}
     */
    public function deleteAddress(Request $request, int $id)
    {
        $khachHang = $request->user()->khachHang;
        $addr = $khachHang->diaChiDaLuu()->findOrFail($id);
        $wasDefault = $addr->is_mac_dinh;
        $addr->delete();

        // Nếu xóa địa chỉ mặc định → gán cái đầu tiên còn lại làm mặc định
        if ($wasDefault) {
            $next = $khachHang->diaChiDaLuu()->first();
            if ($next) {
                $next->update(['is_mac_dinh' => true]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Xóa địa chỉ thành công.',
        ]);
    }

    /**
     * POST /api/khach-hang/dia-chi/{id}/mac-dinh
     */
    public function setDefaultAddress(Request $request, int $id)
    {
        $khachHang = $request->user()->khachHang;

        // Bỏ mặc định tất cả
        $khachHang->diaChiDaLuu()->update(['is_mac_dinh' => false]);

        // Set mặc định cho địa chỉ được chọn
        $khachHang->diaChiDaLuu()->findOrFail($id)->update(['is_mac_dinh' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Đã đặt địa chỉ mặc định.',
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // Helper: xác định hạng thành viên theo số đơn hoàn thành
    // ──────────────────────────────────────────────────────────────
    private function getTier(?KhachHang $khachHang): string
    {
        if (!$khachHang) return 'Thành viên';

        $sodon = $khachHang->donHang()
            ->where('trang_thai_don', 'DaHoanThanh')
            ->count();

        if ($sodon >= 50) return 'Thành viên Bạch Kim';
        if ($sodon >= 20) return 'Thành viên Vàng';
        if ($sodon >= 5)  return 'Thành viên Bạc';
        return 'Thành viên';
    }
}
