<?php
// app/Http/Controllers/AuthController.php
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
    // 1. ĐĂNG KÝ KHÁCH HÀNG
    // ==========================================
    public function registerKhachHang(Request $request)
    {
        // Migration: TaiKhoan dùng so_dien_thoai là unique login
        $request->validate([
            'so_dien_thoai' => 'required|unique:TaiKhoan,so_dien_thoai|max:15',
            'mat_khau'      => 'required|min:6|confirmed', // confirmed = cần thêm mat_khau_confirmation
            'ho_ten'        => 'required|max:150',
            'email'         => 'nullable|email|max:100',
        ], [
            'so_dien_thoai.required' => 'Vui lòng nhập số điện thoại.',
            'so_dien_thoai.unique'   => 'Số điện thoại này đã được đăng ký.',
            'mat_khau.min'           => 'Mật khẩu phải có ít nhất 6 ký tự.',
            'mat_khau.confirmed'     => 'Xác nhận mật khẩu không khớp.',
            'ho_ten.required'        => 'Vui lòng nhập họ tên.',
        ]);

        DB::beginTransaction();
        try {
            // Bước 1: Tạo TaiKhoan (bảng gốc)
            $taiKhoan = TaiKhoan::create([
                'so_dien_thoai'  => $request->so_dien_thoai,
                'mat_khau'       => Hash::make($request->mat_khau),
                'ho_ten'         => $request->ho_ten,
                'email'          => $request->email,
                // Enum đúng với migration
                'loai_tai_khoan' => 'KhachHang',
                'trang_thai'     => 'HoatDong',
            ]);

            // Bước 2: Tạo bản ghi KhachHang gắn với TaiKhoan
            // (KhachHang chỉ có tai_khoan_id theo migration của bạn)
            KhachHang::create([
                'tai_khoan_id' => $taiKhoan->id,
            ]);

            // Bước 3: Tạo ví tiền tự động khi đăng ký
            $taiKhoan->viTien()->create([
                'so_du' => 0.00,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Đăng ký tài khoản thành công!',
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Lỗi hệ thống, vui lòng thử lại.',
                // Chỉ bật dòng dưới khi dev, tắt khi production
                // 'debug'   => $e->getMessage(),
            ], 500);
        }
    }

    // ==========================================
    // 2. ĐĂNG NHẬP KHÁCH HÀNG
    // ==========================================
    public function loginKhachHang(Request $request)
    {
        $request->validate([
            'so_dien_thoai' => 'required',
            'mat_khau'      => 'required',
        ], [
            'so_dien_thoai.required' => 'Vui lòng nhập số điện thoại.',
            'mat_khau.required'      => 'Vui lòng nhập mật khẩu.',
        ]);

        // Chỉ lấy tài khoản có quan hệ KhachHang (tránh NhanVien login nhầm vào đây)
        $taiKhoan = TaiKhoan::with('khachHang')
            ->where('so_dien_thoai', $request->so_dien_thoai)
            ->has('khachHang')
            ->first();

        // Kiểm tra tồn tại + mật khẩu — dùng chung 1 message để tránh lộ thông tin
        if (!$taiKhoan || !Hash::check($request->mat_khau, $taiKhoan->mat_khau)) {
            return response()->json([
                'message' => 'Số điện thoại hoặc mật khẩu không đúng.',
            ], 401);
        }

        // Kiểm tra trạng thái tài khoản (đúng enum trong migration)
        if ($taiKhoan->trang_thai === 'BiKhoa') {
            return response()->json([
                'message' => 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.',
            ], 403);
        }

        if ($taiKhoan->trang_thai === 'ChoXacMinh') {
            return response()->json([
                'message' => 'Tài khoản chưa được xác minh. Vui lòng kiểm tra SMS/Email.',
            ], 403);
        }

        // Xóa token cũ trước khi tạo mới (tránh token rác tích tụ)
        $taiKhoan->tokens()->delete();

        $token = $taiKhoan->createToken('KhachHangToken', ['role:khach-hang'])->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công!',
            'token'   => $token,
            'role'    => 'khach-hang',
            'user'    => [
                'id'             => $taiKhoan->khachHang->id,
                'tai_khoan_id'   => $taiKhoan->id,
                'ho_ten'         => $taiKhoan->ho_ten,
                'so_dien_thoai'  => $taiKhoan->so_dien_thoai,
                'email'          => $taiKhoan->email,
                'avatar'         => $taiKhoan->avatar,
            ],
        ]);
    }

    // ==========================================
    // 3. ĐĂNG NHẬP NHÂN VIÊN
    // ==========================================
    public function loginNhanVien(Request $request)
    {
        $request->validate([
            'so_dien_thoai' => 'required',
            'mat_khau'      => 'required',
        ]);

        $taiKhoan = TaiKhoan::with('nhanVien')
            ->where('so_dien_thoai', $request->so_dien_thoai)
            ->has('nhanVien')
            ->first();

        if (!$taiKhoan || !Hash::check($request->mat_khau, $taiKhoan->mat_khau)) {
            return response()->json([
                'message' => 'Số điện thoại hoặc mật khẩu không đúng.',
            ], 401);
        }

        if ($taiKhoan->trang_thai === 'BiKhoa') {
            return response()->json([
                'message' => 'Tài khoản của bạn đã bị khóa.',
            ], 403);
        }

        $taiKhoan->tokens()->delete();

        $token = $taiKhoan->createToken('NhanVienToken', ['role:nhan-vien'])->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công!',
            'token'   => $token,
            'role'    => 'nhan-vien',
            'user'    => [
                'id'            => $taiKhoan->nhanVien->id,
                'tai_khoan_id'  => $taiKhoan->id,
                'ho_ten'        => $taiKhoan->ho_ten,
                'so_dien_thoai' => $taiKhoan->so_dien_thoai,
                'avatar'        => $taiKhoan->avatar,
                'danh_gia_sao'  => $taiKhoan->nhanVien->danh_gia_sao_trung_binh,
            ],
        ]);
    }

    // ==========================================
    // 4. ĐĂNG NHẬP ADMIN
    // ==========================================
    public function loginAdmin(Request $request)
    {
        // 1. Tìm người dùng trong DB dựa vào tên đăng nhập (react gửi lên là 'email')
        $admin = TaiKhoanAdmin::where('ten_dang_nhap', $request->email)->first();

        // 2. Kiểm tra tài khoản có tồn tại và Mật khẩu có khớp không (Dùng Hash::check vì pass trong DB đang mã hóa)
        if (!$admin || !Hash::check($request->password, $admin->mat_khau)) {
            return response()->json([
                'message' => 'Tên đăng nhập hoặc mật khẩu không chính xác!'
            ], 401);
        }

        // 3. Kiểm tra xem tài khoản có bị khóa không (trang_thai = 1 là hoạt động)
        if ($admin->trang_thai != 1) {
            return response()->json([
                'message' => 'Tài khoản của bạn đã bị khóa!'
            ], 403);
        }

        // 4. Đăng nhập thành công -> Tạo 1 thẻ Token cho phép ra vào hệ thống
        $token = $admin->createToken('admin_token', ['role:admin'])->plainTextToken;

        // Trả Token và thông tin user về cho React
        return response()->json([
            'message' => 'Đăng nhập thành công',
            'token' => $token,
            'user' => [
                'id' => $admin->id,
                'ho_ten' => $admin->ho_ten,
                'quyen_han' => $admin->quyen_han,
            ]
        ]);
    }

    // ==========================================
    // 5. ĐĂNG XUẤT (Dùng chung cho cả 3)
    // ==========================================
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Đăng xuất thành công!',
        ]);
    }

    // Thêm vào AuthController.php
    public function me(Request $request)
    {
        $user = $request->user(); // TaiKhoan hoặc TaiKhoanAdmin

        // Phân biệt loại user qua abilities của token
        $abilities = $user->currentAccessToken()->abilities;

        if (in_array('role:admin', $abilities)) {
            return response()->json([
                'role' => 'admin',
                'user' => [
                    'id'        => $user->id,
                    'ho_ten'    => $user->ho_ten,
                    'quyen_han' => $user->quyen_han,
                ],
            ]);
        }

        if (in_array('role:nhan-vien', $abilities)) {
            $user->load('nhanVien');
            return response()->json([
                'role' => 'nhan-vien',
                'user' => [
                    'id'            => $user->nhanVien->id,
                    'ho_ten'        => $user->ho_ten,
                    'so_dien_thoai' => $user->so_dien_thoai,
                    'avatar'        => $user->avatar,
                ],
            ]);
        }

        // Mặc định: khach-hang
        $user->load('khachHang');
        return response()->json([
            'role' => 'khach-hang',
            'user' => [
                'id'            => $user->khachHang->id,
                'ho_ten'        => $user->ho_ten,
                'so_dien_thoai' => $user->so_dien_thoai,
                'email'         => $user->email,
                'avatar'        => $user->avatar,
            ],
        ]);
    }
}