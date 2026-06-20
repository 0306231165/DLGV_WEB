<?php

namespace App\Http\Controllers;

use App\Models\KhuyenMai;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

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
                'ma_code'      => 'required|string|max:50|unique:KhuyenMai,ma_code',
                'tag_hien_thi' => 'nullable|string|max:100',
                'tieu_de'      => 'required|string|max:255',
                'mo_ta'        => 'nullable|string',
                'loai_giam_gia'=> 'required|in:PhanTram,TienMat',
                'gia_tri_giam' => 'required|numeric|min:0',
                'tong_luot_luu_toi_da'            => 'required|integer|min:1',
                'tong_luot_dung_toi_da_toan_san'  => 'required|integer|min:1',
                'ngay_bat_dau' => 'required|date',
                'ngay_ket_thuc'=> 'required|date|after_or_equal:ngay_bat_dau',
            ]);

            $khuyenMai = KhuyenMai::create([
                'ma_code'      => strtoupper($validated['ma_code']),
                'tag_hien_thi' => $validated['tag_hien_thi'] ?? null,
                'tieu_de'      => $validated['tieu_de'],
                'mo_ta'        => $validated['mo_ta'] ?? null,
                'loai_giam_gia'=> $validated['loai_giam_gia'],
                'gia_tri_giam' => $validated['gia_tri_giam'],
                'tong_luot_luu_toi_da'           => $validated['tong_luot_luu_toi_da'],
                'tong_luot_dung_toi_da_toan_san' => $validated['tong_luot_dung_toi_da_toan_san'],
                'ngay_bat_dau' => $validated['ngay_bat_dau'],
                'ngay_ket_thuc'=> $validated['ngay_ket_thuc'],
                'trang_thai'   => true,
                'so_luong_da_luu'  => 0,
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

    public function updateStatus(Request $request, int $id): \Illuminate\Http\JsonResponse
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

    public function destroy(int $id): \Illuminate\Http\JsonResponse
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

    public function getPublicVouchers(Request $request)
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
                DB::raw('COALESCE(KhuyenMai.nhom_dich_vu_id_ap_dung, DichVu.nhom_dich_vu_id) as nhom_dich_vu_id_mapped')
            )
            ->orderBy('ngay_ket_thuc', 'asc')
            ->get();

        // 3. Lấy danh sách ID mã khuyến mãi mà user hiện tại ĐÃ LƯU
        $savedVoucherIds = [];
        $user = auth('sanctum')->user(); // Lấy user an toàn từ token trên route public

        if ($user) {
            $khachHang = DB::table('KhachHang')->where('tai_khoan_id', $user->id)->first();
            if ($khachHang) {
                $savedVoucherIds = DB::table('KhachHang_KhuyenMai')
                    ->where('khach_hang_id', $khachHang->id)
                    ->pluck('khuyen_mai_id')
                    ->toArray();
            }
        }

        return response()->json([
            'success' => true,
            'service_groups' => $serviceGroups,
            'vouchers' => $vouchers,
            'saved_vouchers' => $savedVoucherIds // Trả về thêm mảng này cho Frontend
        ]);
    }

    public function getMyVouchers(Request $request)
    {
        $khachHang = $request->user()->khachHang;

        if (!$khachHang) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy khách hàng.'], 404);
        }

        $now = Carbon::now();

        // Lấy tất cả voucher đã lưu kèm pivot + thông tin KhuyenMai
        $vouchers = $khachHang->khuyenMaiDaLuu()
            ->withPivot('ngay_luu', 'ngay_su_dung', 'trang_thai_luu')
            ->get()
            ->map(function ($km) use ($now) {
                $pivot = $km->pivot;

                // Xác định trạng thái hiển thị
                $isExpired = Carbon::parse($km->ngay_ket_thuc)->lt($now)
                    || $pivot->trang_thai_luu === 'HetHan';
                $isUsed    = $pivot->trang_thai_luu === 'DaSuDung';

                // Map loại giảm giá → hiển thị giống VoucherCard frontend
                $percent = rtrim(rtrim(number_format((float) $km->gia_tri_giam, 2, '.', ''), '0'), '.');

                $discountValue = $km->loai_giam_gia === 'PhanTram'
                    ? $percent . '%'
                    : number_format($km->gia_tri_giam, 0, ',', '.') . 'đ';

                $discountType = $km->loai_giam_gia === 'PhanTram' ? 'GIẢM' : 'GIẢM';

                // Màu card theo trạng thái
                $colorClass = $isExpired || $isUsed
                    ? 'bg-[#a3a3a3]'
                    : 'bg-[#1a368d]';

                return [
                    'id'            => $km->id,
                    'ma_code'       => $km->ma_code,
                    'type'          => $km->tag_hien_thi ?? 'Khuyến mãi',
                    'colorClass'    => $colorClass,
                    'discountValue' => $discountValue,
                    'discountType'  => $discountType,
                    'badge'         => $isExpired ? 'Hết hạn' : ($isUsed ? 'Đã dùng' : $km->tag_hien_thi),
                    'title'         => $km->tieu_de,
                    'description'   => $km->mo_ta ?? '',
                    'expiry'        => Carbon::parse($km->ngay_ket_thuc)->format('d/m/Y'),
                    'status'        => $isExpired ? 'expired' : ($isUsed ? 'used' : 'saved'),
                    // Thêm thông tin chi tiết để frontend hiển thị đầy đủ
                    'gia_tri_don_toi_thieu' => $km->gia_tri_don_toi_thieu,
                    'giam_toi_da'           => $km->giam_toi_da,
                    'ngay_luu'              => $pivot->ngay_luu,
                    'ngay_su_dung'          => $pivot->ngay_su_dung,
                    // ✅ FIX: bổ sung các field thô để frontend tính số tiền giảm thực tế
                    // (trước đây chỉ trả discountValue dạng chuỗi đã format → frontend tính NaN)
                    'loai_giam_gia'          => $km->loai_giam_gia,          // 'PhanTram' | 'TienMat'
                    'gia_tri_giam'           => $km->gia_tri_giam,           // số % hoặc số tiền thô
                    'dich_vu_id_ap_dung'     => $km->dich_vu_id_ap_dung,
                    'nhom_dich_vu_id_ap_dung' => $km->nhom_dich_vu_id_ap_dung,
                ];
            });

        return response()->json([
            'success' => true,
            'data'    => $vouchers,
            'total'   => $vouchers->count(),
        ]);
    }

    public function luuKhuyenMai(Request $request)
    {
        try {
            // 1. Validate dữ liệu gửi lên
            $request->validate([
                'khuyen_mai_id' => 'required|integer|exists:KhuyenMai,id'
            ]);

            $khuyenMaiId = $request->khuyen_mai_id;

            // 2. Kiểm tra Auth an toàn (Đề phòng route quên bọc middleware)
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn chưa đăng nhập hoặc token hết hạn!'
                ], 401);
            }

            $taiKhoanId = $user->id;

            // 3. Truy vấn sang bảng KhachHang
            $khachHang = DB::table('KhachHang')->where('tai_khoan_id', $taiKhoanId)->first();

            if (!$khachHang) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tài khoản này chưa được liên kết với hồ sơ khách hàng!'
                ], 404);
            }

            $khachHangId = $khachHang->id;

            // 4. Kiểm tra xem mã này khách đã lưu chưa? (CHỐNG LƯU TRÙNG)
            $daLuu = DB::table('KhachHang_KhuyenMai')
                ->where('khach_hang_id', $khachHangId)
                ->where('khuyen_mai_id', $khuyenMaiId)
                ->exists();

            if ($daLuu) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn đã lưu mã khuyến mãi này rồi!'
                ], 400);
            }

            // 5. Insert vào bảng trung gian
            DB::table('KhachHang_KhuyenMai')->insert([
                'khach_hang_id' => $khachHangId,
                'khuyen_mai_id' => $khuyenMaiId,
                'ngay_luu' => now()->toDateTimeString(), // CHÚ Ý SỬA LẠI THÀNH CHUỖI
                'ngay_su_dung' => null,
                'trang_thai_luu' => 'DaLuu',
                // NẾU BẢNG CÓ TIMESTAMP, HÃY MỞ COMMENT 2 DÒNG DƯỚI ĐÂY:
                // 'created_at' => now(),
                // 'updated_at' => now()
            ]);

            // 6. Cập nhật tăng số lượng đã lưu trong bảng KhuyenMai
            DB::table('KhuyenMai')->where('id', $khuyenMaiId)->increment('so_luong_da_luu');

            return response()->json([
                'success' => true,
                'message' => 'Lưu khuyến mãi thành công'
            ]);
        } catch (\Exception $e) {
            // NẾU CÓ LỖI XẢY RA, TRẢ VỀ ĐÚNG LỖI ĐỂ DEUBG THAY VÌ LỖI 500 MÙ MỜ
            return response()->json([
                'success' => false,
                'message' => 'Lỗi Server: ' . $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

}
