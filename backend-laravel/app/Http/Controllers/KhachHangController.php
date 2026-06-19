<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\TaiKhoan;
use App\Models\KhachHang;
use Illuminate\Support\Facades\DB;

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

    /**
     * GET /api/khach-hang/lien-he
     */
    public function getContacts(Request $request)
    {
        $khachHang = $request->user()->khachHang;
        if (!$khachHang) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy khách hàng.'], 404);
        }

        $contacts = $khachHang->lienHeDaLuu()->get()->map(fn($c) => [
            'id'             => $c->id,
            'ten_nguoi_nhan' => $c->ten_nguoi_nhan,
            'sdt_nhan'       => $c->sdt_nhan,
        ]);

        return response()->json(['success' => true, 'data' => $contacts]);
    }

    /**
     * POST /api/khach-hang/lien-he/them
     */
    public function storeContact(Request $request)
    {
        $request->validate([
            'ten_nguoi_nhan' => 'required|string|max:150',
            'sdt_nhan'       => 'required|string|max:15',
        ]);

        $khachHang = $request->user()->khachHang;
        if (!$khachHang) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy khách hàng.'], 404);
        }

        if ($khachHang->lienHeDaLuu()->count() >= 10) {
            return response()->json(['success' => false, 'message' => 'Chỉ lưu tối đa 10 liên hệ.'], 422);
        }

        $contact = $khachHang->lienHeDaLuu()->create([
            'ten_nguoi_nhan' => $request->ten_nguoi_nhan,
            'sdt_nhan'       => $request->sdt_nhan,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thêm liên hệ thành công.',
            'data'    => [
                'id'             => $contact->id,
                'ten_nguoi_nhan' => $contact->ten_nguoi_nhan,
                'sdt_nhan'       => $contact->sdt_nhan,
            ],
        ], 201);
    }

    /**
     * DELETE /api/khach-hang/lien-he/{id}
     */
    public function deleteContact(Request $request, int $id)
    {
        $khachHang = $request->user()->khachHang;
        $contact = $khachHang->lienHeDaLuu()->findOrFail($id);
        $contact->delete();

        return response()->json(['success' => true, 'message' => 'Đã xóa liên hệ.']);
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

    // ──────────────────────────────────────────────────────────────
// Thanh toán: Thẻ & MoMo (đều lưu trong ThongTinNganHang)
// ──────────────────────────────────────────────────────────────

    /**
     * GET /api/khach-hang/thanh-toan
     * Trả về danh sách thẻ + trạng thái MoMo của khách hàng.
     */
    public function getPaymentMethods(Request $request)
    {
        $taiKhoanId = $request->user()->id;

        $all = DB::table('ThongTinNganHang')
            ->where('tai_khoan_id', $taiKhoanId)
            ->get();

        $cards = $all->where('ten_ngan_hang', '!=', 'MoMo')->values()->map(fn($r) => [
            'id'           => $r->id,
            'ten_ngan_hang' => $r->ten_ngan_hang,
            'so_tai_khoan' => $r->so_tai_khoan,   // masked ở frontend
            'chu_tai_khoan' => $r->chu_tai_khoan,
            'trang_thai'   => $r->trang_thai,
            'ngay_lien_ket' => $r->ngay_lien_ket,
        ]);

        $momo = $all->firstWhere('ten_ngan_hang', 'MoMo');

        return response()->json([
            'success' => true,
            'data' => [
                'cards' => $cards,
                'momo'  => $momo ? [
                    'id'         => $momo->id,
                    'so_dien_thoai' => $momo->so_tai_khoan,
                    'trang_thai' => $momo->trang_thai,
                ] : null,
            ],
        ]);
    }

    /**
     * POST /api/khach-hang/thanh-toan/them-the
     * Body: { ten_ngan_hang, so_tai_khoan, chu_tai_khoan }
     */
    public function addCard(Request $request)
    {
        $request->validate([
            'ten_ngan_hang' => 'required|string|max:100',
            'so_tai_khoan'  => 'required|string|max:50',
            'chu_tai_khoan' => 'required|string|max:150',
        ]);

        $taiKhoanId = $request->user()->id;

        // Giới hạn 5 thẻ / tài khoản
        $count = DB::table('ThongTinNganHang')
            ->where('tai_khoan_id', $taiKhoanId)
            ->where('ten_ngan_hang', '!=', 'MoMo')
            ->count();

        if ($count >= 5) {
            return response()->json(['success' => false, 'message' => 'Bạn chỉ có thể lưu tối đa 5 thẻ.'], 422);
        }

        $id = DB::table('ThongTinNganHang')->insertGetId([
            'tai_khoan_id'  => $taiKhoanId,
            'ten_ngan_hang' => $request->ten_ngan_hang,
            'so_tai_khoan'  => $request->so_tai_khoan,
            'chu_tai_khoan' => $request->chu_tai_khoan,
            'chi_nhanh'     => null,
            'trang_thai'    => true,
            'ngay_lien_ket' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thêm thẻ thành công.',
            'data'    => [
                'id'            => $id,
                'ten_ngan_hang' => $request->ten_ngan_hang,
                'so_tai_khoan'  => $request->so_tai_khoan,
                'chu_tai_khoan' => $request->chu_tai_khoan,
                'trang_thai'    => true,
            ],
        ], 201);
    }

    /**
     * DELETE /api/khach-hang/thanh-toan/{id}
     * Xóa thẻ hoặc ví (theo id ThongTinNganHang).
     */
    public function deletePaymentMethod(Request $request, int $id)
    {
        $deleted = DB::table('ThongTinNganHang')
            ->where('id', $id)
            ->where('tai_khoan_id', $request->user()->id)
            ->delete();

        if (!$deleted) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy.'], 404);
        }

        return response()->json(['success' => true, 'message' => 'Xóa thành công.']);
    }

    /**
     * POST /api/khach-hang/thanh-toan/momo/lien-ket
     * Body: { so_dien_thoai }
     */
    public function linkMomo(Request $request)
    {
        $request->validate([
            'so_dien_thoai' => 'required|string|max:15',
        ]);

        $taiKhoanId = $request->user()->id;

        // Nếu đã có → update
        $existing = DB::table('ThongTinNganHang')
            ->where('tai_khoan_id', $taiKhoanId)
            ->where('ten_ngan_hang', 'MoMo')
            ->first();

        if ($existing) {
            DB::table('ThongTinNganHang')->where('id', $existing->id)->update([
                'so_tai_khoan' => $request->so_dien_thoai,
                'trang_thai'   => true,
            ]);
            $momoId = $existing->id;
        } else {
            $momoId = DB::table('ThongTinNganHang')->insertGetId([
                'tai_khoan_id'  => $taiKhoanId,
                'ten_ngan_hang' => 'MoMo',
                'so_tai_khoan'  => $request->so_dien_thoai,
                'chu_tai_khoan' => $request->user()->ho_ten,
                'trang_thai'    => true,
                'ngay_lien_ket' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Liên kết MoMo thành công.',
            'data'    => ['id' => $momoId, 'so_dien_thoai' => $request->so_dien_thoai],
        ]);
    }

    /**
     * DELETE /api/khach-hang/thanh-toan/momo/huy
     */
    public function unlinkMomo(Request $request)
    {
        DB::table('ThongTinNganHang')
            ->where('tai_khoan_id', $request->user()->id)
            ->where('ten_ngan_hang', 'MoMo')
            ->delete();

        return response()->json(['success' => true, 'message' => 'Đã hủy liên kết MoMo.']);
    }
}
