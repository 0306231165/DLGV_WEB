<?php

namespace App\Http\Controllers;

use App\Models\GiaoDichVi;
use App\Models\ViTien;
use App\Models\ThongTinNganHang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ViTienController extends Controller
{
    // ==========================================
    // GET /api/khach-hang/vi-tien
    // Lấy số dư + lịch sử giao dịch
    // ==========================================
    public function index(Request $request)
    {
        $taiKhoan = $request->user();
        $viTien = $taiKhoan->viTien;

        if (!$viTien) {
            return response()->json(['message' => 'Ví tiền không tồn tại.'], 404);
        }

        $giaoDich = $viTien->giaoDich()
            ->orderByDesc('thoi_gian')
            ->limit(50)
            ->get()
            ->map(fn($g) => [
                'id'                  => $g->id,
                'ma_giao_dich'        => $g->ma_giao_dich,
                'loai_giao_dich'      => $g->loai_giao_dich,
                'loai_bien_dong'      => $g->loai_bien_dong,
                'so_tien'             => (float) $g->so_tien,
                'so_du_sau_giao_dich' => (float) $g->so_du_sau_giao_dich,
                'noi_dung'            => $g->noi_dung,
                'trang_thai'          => $g->trang_thai,
                'thoi_gian'           => $g->thoi_gian,
            ]);

        return response()->json([
            'so_du'     => (float) $viTien->so_du,
            'giao_dich' => $giaoDich,
        ]);
    }

    // ==========================================
    // POST /api/khach-hang/vi-tien/nap
    // Nạp tiền vào ví
    // ==========================================
    public function napTien(Request $request)
    {
        $request->validate([
            'so_tien'         => 'required|numeric|min:10000',
            'phuong_thuc_nap' => 'required|string|max:100',
        ], [
            'so_tien.required' => 'Vui lòng nhập số tiền.',
            'so_tien.min'      => 'Số tiền nạp tối thiểu là 10,000đ.',
        ]);

        $taiKhoan = $request->user();

        DB::beginTransaction();
        try {
            $viTien = $taiKhoan->viTien()->lockForUpdate()->first();

            if (!$viTien) {
                DB::rollBack();
                return response()->json(['message' => 'Ví tiền không tồn tại.'], 404);
            }

            $soTien  = (float) $request->so_tien;
            $soDuMoi = $viTien->so_du + $soTien;

            $viTien->update(['so_du' => $soDuMoi]);

            $viTien->giaoDich()->create([
                'ma_giao_dich'          => 'NAP-' . strtoupper(Str::random(10)),
                'loai_giao_dich'        => 'NapTien',
                'loai_bien_dong'        => 'Tang',
                'so_tien'               => $soTien,
                'so_du_sau_giao_dich'   => $soDuMoi,
                'noi_dung'              => 'Nạp tiền qua ' . $request->phuong_thuc_nap,
                'trang_thai'            => 'ThanhCong',
            ]);

            DB::commit();

            return response()->json([
                'message'  => 'Nạp tiền thành công!',
                'so_du_moi' => $soDuMoi,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi hệ thống, vui lòng thử lại.'], 500);
        }
    }

    // ==========================================
    // POST /api/khach-hang/vi-tien/rut
    // Rút tiền về ngân hàng (phí 20%)
    // ==========================================
    public function rutTien(Request $request)
    {
        $request->validate([
            'so_tien'       => 'required|numeric|min:50000',
            // Một trong hai: dùng ngân hàng đã lưu HOẶC tự nhập
            'ngan_hang_id'  => 'nullable|integer',   // ID từ ThongTinNganHang
            'ten_ngan_hang' => 'nullable|string|max:100',
            'so_tai_khoan'  => 'nullable|string|max:50',
            'chu_tai_khoan' => 'nullable|string|max:150',
        ], [
            'so_tien.min' => 'Số tiền rút tối thiểu là 50,000đ.',
        ]);

        // Phải có ít nhất 1 trong 2 cách chọn ngân hàng
        $dungNganHangDaLuu = !empty($request->ngan_hang_id);
        $tuNhap = !empty($request->ten_ngan_hang) && !empty($request->so_tai_khoan) && !empty($request->chu_tai_khoan);

        if (!$dungNganHangDaLuu && !$tuNhap) {
            return response()->json(['message' => 'Vui lòng chọn ngân hàng đã lưu hoặc nhập thông tin ngân hàng.'], 422);
        }

        $taiKhoan = $request->user();

        DB::beginTransaction();
        try {
            $viTien = $taiKhoan->viTien()->lockForUpdate()->first();

            if (!$viTien) {
                DB::rollBack();
                return response()->json(['message' => 'Ví tiền không tồn tại.'], 404);
            }

            $soTien = (float) $request->so_tien;

            if ($viTien->so_du < $soTien) {
                DB::rollBack();
                return response()->json(['message' => 'Số dư ví không đủ để thực hiện lệnh rút.'], 422);
            }

            // Tính phí 20%
            $phi        = round($soTien * 0.20, 2);
            $thucNhan   = round($soTien - $phi, 2);
            $soDuMoi    = round($viTien->so_du - $soTien, 2);

            // Xác định thông tin ngân hàng đích
            if ($dungNganHangDaLuu) {
                $nganhang = DB::table('ThongTinNganHang')
                    ->where('id', $request->ngan_hang_id)
                    ->where('tai_khoan_id', $taiKhoan->id)
                    ->first();

                if (!$nganhang) {
                    DB::rollBack();
                    return response()->json(['message' => 'Thông tin ngân hàng không tồn tại.'], 404);
                }

                $tenNganHang  = $nganhang->ten_ngan_hang;
                $soTaiKhoanNH = $nganhang->so_tai_khoan;
                $chuTaiKhoan  = $nganhang->chu_tai_khoan;
            } else {
                $tenNganHang  = $request->ten_ngan_hang;
                $soTaiKhoanNH = $request->so_tai_khoan;
                $chuTaiKhoan  = $request->chu_tai_khoan;
            }

            $viTien->update(['so_du' => $soDuMoi]);

            $viTien->giaoDich()->create([
                'ma_giao_dich'          => 'RUT-' . strtoupper(Str::random(10)),
                'loai_giao_dich'        => 'RutTien',
                'loai_bien_dong'        => 'Giam',
                'so_tien'               => $soTien,
                'so_du_sau_giao_dich'   => $soDuMoi,
                'noi_dung'              => "Rút tiền về {$tenNganHang} - {$soTaiKhoanNH} ({$chuTaiKhoan}). Phí 20%: " . number_format($phi) . "đ. Thực nhận: " . number_format($thucNhan) . "đ",
                'trang_thai'            => 'ThanhCong',  // Rút thường cần duyệt
            ]);

            DB::commit();

            return response()->json([
                'message'    => 'Gửi yêu cầu rút tiền thành công!',
                'so_tien'    => $soTien,
                'phi_20'     => $phi,
                'thuc_nhan'  => $thucNhan,
                'so_du_moi'  => $soDuMoi,
                'ngan_hang'  => $tenNganHang,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi hệ thống, vui lòng thử lại.'], 500);
        }
    }

    // ==========================================
    // GET /api/khach-hang/vi-tien/ngan-hang
    // Lấy danh sách ngân hàng đã lưu (để chọn khi rút)
    // ==========================================
    public function getNganHangDaLuu(Request $request)
    {
        $list = DB::table('ThongTinNganHang')
            ->where('tai_khoan_id', $request->user()->id)
            ->where('ten_ngan_hang', '!=', 'MoMo')  // Loại MoMo ra, chỉ lấy ngân hàng
            ->where('trang_thai', true)
            ->orderByDesc('ngay_lien_ket')
            ->get()
            ->map(fn($r) => [
                'id'            => $r->id,
                'ten_ngan_hang' => $r->ten_ngan_hang,
                'so_tai_khoan'  => $r->so_tai_khoan,
                'chu_tai_khoan' => $r->chu_tai_khoan,
            ]);

        return response()->json(['data' => $list]);
    }
}