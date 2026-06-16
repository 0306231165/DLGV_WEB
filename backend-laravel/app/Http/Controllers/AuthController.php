<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TaiKhoan;
use App\Models\KhachHang;
use App\Models\TaiKhoanAdmin;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    // ==========================================
    // 1. ĐĂNG KÝ (Chỉ dành cho Khách hàng)
    // ==========================================
    public function registerKhachHang(Request $request)
    {
        $request->validate([
            'ten_dang_nhap' => 'required|unique:TaiKhoan,ten_dang_nhap',
            'mat_khau' => 'required|min:6',
            'ho_ten' => 'required',
            'so_dien_thoai' => 'required|unique:KhachHang,so_dien_thoai',
        ]);

        // Dùng Transaction để đảm bảo: Nếu tạo Khách Hàng lỗi thì rollback không tạo Tài Khoản luôn
        DB::beginTransaction();
        try {
            // 1. Tạo tài khoản trước
            $taiKhoan = TaiKhoan::create([
                'ten_dang_nhap' => $request->ten_dang_nhap,
                'mat_khau' => Hash::make($request->mat_khau), // Mã hóa mật khẩu
                'loai_tai_khoan' => 'khach_hang', // Giả sử bạn có cột này
                'trang_thai' => 'hoat_dong'
            ]);

            // 2. Tạo Profile Khách hàng gắn với tài khoản trên
            $khachHang = KhachHang::create([
                'tai_khoan_id' => $taiKhoan->id,
                'ho_ten' => $request->ho_ten,
                'so_dien_thoai' => $request->so_dien_thoai,
                // Thêm email hoặc các cột khác nếu bạn có
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Đăng ký tài khoản thành công!',
                'user' => $khachHang
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi hệ thống: ' . $e->getMessage()], 500);
        }
    }

    // ==========================================
    // 2. ĐĂNG NHẬP KHÁCH HÀNG
    // ==========================================
    public function loginKhachHang(Request $request)
    {
        $request->validate([
            'ten_dang_nhap' => 'required',
            'mat_khau' => 'required',
        ]);

        $taiKhoan = TaiKhoan::where('ten_dang_nhap', $request->ten_dang_nhap)->has('khachHang')->first();

        if (!$taiKhoan || !Hash::check($request->mat_khau, $taiKhoan->mat_khau)) {
            return response()->json(['message' => 'Sai tài khoản hoặc mật khẩu'], 401);
        }

        $token = $taiKhoan->createToken('KhachHangToken', ['role:khach-hang'])->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công',
            'token' => $token,
            'user' => $taiKhoan->khachHang
        ]);
    }

    // ==========================================
    // 3. ĐĂNG NHẬP NHÂN VIÊN
    // ==========================================
    public function loginNhanVien(Request $request)
    {
        $request->validate([
            'ten_dang_nhap' => 'required',
            'mat_khau' => 'required',
        ]);

        $taiKhoan = TaiKhoan::where('ten_dang_nhap', $request->ten_dang_nhap)->has('nhanVien')->first();

        if (!$taiKhoan || !Hash::check($request->mat_khau, $taiKhoan->mat_khau)) {
            return response()->json(['message' => 'Sai tài khoản hoặc mật khẩu'], 401);
        }

        $token = $taiKhoan->createToken('NhanVienToken', ['role:nhan-vien'])->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công',
            'token' => $token,
            'user' => $taiKhoan->nhanVien
        ]);
    }

    // ==========================================
    // 4. ĐĂNG NHẬP ADMIN
    // ==========================================
    public function loginAdmin(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        $admin = TaiKhoanAdmin::where('username', $request->username)->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json(['message' => 'Sai tài khoản hoặc mật khẩu'], 401);
        }

        $token = $admin->createToken('AdminToken', ['role:admin'])->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập Admin thành công',
            'token' => $token,
            'user' => $admin
        ]);
    }

    // ==========================================
    // 5. ĐĂNG XUẤT (Dùng chung cho cả 3)
    // ==========================================
    public function logout(Request $request)
    {
        // Nhờ Sanctum, nó tự biết ai đang gọi API để xóa đúng cái token của người đó.
        // Chỉ cần 1 dòng này là dọn dẹp sạch sẽ chìa khóa trên server!
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Đăng xuất thành công!'
        ]);
    }
}