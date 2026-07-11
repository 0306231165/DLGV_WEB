<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TaiKhoan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminAccountController extends Controller
{
    // 1. LẤY DANH SÁCH TÀI KHOẢN
    public function index()
    {
        $taikhoans = TaiKhoan::orderBy('ngay_tao', 'desc')->get();

        $users = $taikhoans->map(function ($tk) {
            $role = 'Khách hàng'; 
            if ($tk->loai_tai_khoan === 'NhanVien') {
                $role = 'Nhân viên vệ sinh';
            } elseif ($tk->loai_tai_khoan === 'Admin') { 
                $role = 'Quản trị viên';
            }

            $status = 'Hoạt động';
            if ($tk->trang_thai === 'BiKhoa' || $tk->trang_thai === 'ChoXacMinh') { 
                $status = 'Đã khóa';
            }

            return [
                'id' => $tk->id,
                'name' => $tk->ho_ten, 
                'email' => $tk->email,
                'avatar' => $tk->avatar, 
                'role' => $role,
                'status' => $status,
                'created_at' => date('d/m/Y', strtotime($tk->ngay_tao)), 
                'so_dien_thoai' => $tk->so_dien_thoai,
            ];
        });

        // Lấy thêm danh sách Admin từ bảng taikhoanadmin
        $admins = \App\Models\TaiKhoanAdmin::all();
        $adminUsers = $admins->map(function ($admin) {
            $status = $admin->trang_thai ? 'Hoạt động' : 'Đã khóa';
            return [
                'id' => 'admin_' . $admin->id,
                'name' => $admin->ho_ten,
                'email' => $admin->ten_dang_nhap,
                'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode($admin->ho_ten),
                'role' => 'Quản trị viên',
                'status' => $status,
                'created_at' => 'N/A', // Bảng taikhoanadmin không có ngay_tao
                'so_dien_thoai' => $admin->ten_dang_nhap,
            ];
        });

        // Gộp 2 mảng lại với nhau
        $allUsers = $users->merge($adminUsers);

        return response()->json($allUsers);
    }

    // 2. CẬP NHẬT TRẠNG THÁI
    public function updateStatus(Request $request, $id)
    {
        try {
            // XỬ LÝ RIÊNG NẾU LÀ ADMIN
            if (str_starts_with($id, 'admin_')) {
                $adminId = str_replace('admin_', '', $id);
                $admin = \App\Models\TaiKhoanAdmin::find($adminId);
                if (!$admin) {
                    return response()->json(['message' => 'Không tìm thấy tài khoản quản trị'], 404);
                }
                
                // Trạng thái admin lưu kiểu boolean (1/0)
                $admin->trang_thai = ($request->trang_thai === 'BiKhoa') ? 0 : 1;
                
                if ($admin->save()) {
                    return response()->json(['message' => 'Cập nhật thành công']);
                } else {
                    return response()->json(['message' => 'Không lưu được vào database'], 500);
                }
            }

            $taiKhoan = TaiKhoan::find($id);
            if (!$taiKhoan) {
                return response()->json(['message' => 'Không tìm thấy tài khoản'], 404);
            }

            // Ghi log để xem giá trị thực tế đang truyền lên
            Log::info("Đang cập nhật ID: $id thành trạng thái: " . $request->trang_thai);

            $taiKhoan->trang_thai = $request->trang_thai;
            
            // Dùng save() và kiểm tra xem có lưu được không
            if ($taiKhoan->save()) {
                return response()->json(['message' => 'Cập nhật thành công']);
            } else {
                return response()->json(['message' => 'Không lưu được vào database'], 500);
            }
        } catch (\Throwable $e) {
            // TRẢ VỀ LỖI CỤ THỂ ĐỂ BẠN BIẾT
            return response()->json(['message' => 'Lỗi DB: ' . $e->getMessage()], 400);
        }
    }

    // 3. THÊM TÀI KHOẢN MỚI
    public function store(Request $request)
    {
        try {
            // NẾU LÀ ADMIN
            if ($request->loai_tai_khoan === 'Admin') {
                $adminMoi = new \App\Models\TaiKhoanAdmin();
                $adminMoi->ten_dang_nhap = $request->email; 
                $adminMoi->ho_ten = $request->ho_ten;
                $adminMoi->mat_khau = bcrypt($request->mat_khau);
                $adminMoi->quyen_han = 'Admin'; 
                $adminMoi->trang_thai = 1; 
                $adminMoi->save();
                return response()->json(['message' => 'Thêm Quản trị viên thành công!']);
            }

            // NẾU LÀ KHÁCH / NHÂN VIÊN
            $taiKhoanMoi = new TaiKhoan();
            $taiKhoanMoi->ho_ten = $request->ho_ten;
            $taiKhoanMoi->so_dien_thoai = $request->so_dien_thoai;
            $taiKhoanMoi->email = $request->email;
            $taiKhoanMoi->mat_khau = bcrypt($request->mat_khau);
            $taiKhoanMoi->loai_tai_khoan = $request->loai_tai_khoan;
            $taiKhoanMoi->trang_thai = 'HoatDong';
            $taiKhoanMoi->ngay_tao = now();
            $taiKhoanMoi->gioi_tinh = 'Nam'; 
            $taiKhoanMoi->ngay_sinh = '2000-01-01'; 
            $taiKhoanMoi->avatar = 'https://ui-avatars.com/api/?name=' . urlencode($request->ho_ten);
            $taiKhoanMoi->save();

            // TẠO HỒ SƠ PHỤ (Dùng DB::table để tránh lỗi Model)
            if ($request->loai_tai_khoan === 'KhachHang') {
                DB::table('khachhang')->insert(['tai_khoan_id' => $taiKhoanMoi->id]);
           } elseif ($request->loai_tai_khoan === 'NhanVien') {
                \Illuminate\Support\Facades\DB::table('nhanvien')->insert([
                    'tai_khoan_id' => $taiKhoanMoi->id,
                    'cccd' => '000' . time(),
                    'dia_chi' => 'Chưa cập nhật',
                    'danh_gia_sao_trung_binh' => 5.0,
                    'tong_so_danh_gia' => 0,
                    'tong_so_ca_hoan_thanh' => 0,
                    'tong_gio_lam' => 0
                    // XÓA DÒNG 'id' NẾU BẠN CÓ VIẾT TRONG NÀY, ĐỂ MYSQL TỰ TĂNG
                ]);
            }

            // TẠO VÍ TIỀN
            DB::table('vitien')->insert([
                'tai_khoan_id' => $taiKhoanMoi->id,
                'so_du' => 0
            ]);

            return response()->json(['message' => 'Thêm tài khoản thành công!']);

        } catch (\Throwable $e) {
            // Ghi log lỗi chi tiết vào server
            Log::error($e->getMessage());
            // Trả về lỗi 400 để trình duyệt hiển thị nội dung lỗi thay vì trắng trang
            return response()->json(['message' => 'Lỗi: ' . $e->getMessage()], 400);
        }
    }

    // 4. XÓA TÀI KHOẢN
    public function destroy($id)
    {
        if (str_starts_with($id, 'admin_')) {
            $adminId = str_replace('admin_', '', $id);
            $admin = \App\Models\TaiKhoanAdmin::find($adminId);
            if (!$admin) return response()->json(['message' => 'Không tìm thấy tài khoản quản trị'], 404);
            
            try {
                $admin->delete();
                return response()->json(['message' => 'Đã xóa quản trị viên thành công!']);
            } catch (\Throwable $e) {
                return response()->json(['message' => 'Không thể xóa: ' . $e->getMessage()], 400);
            }
        }

        $taiKhoan = TaiKhoan::find($id);
        if (!$taiKhoan) return response()->json(['message' => 'Không tìm thấy tài khoản'], 404);

        try {
            DB::table('donhang')->where('khach_hang_id', $taiKhoan->id)->delete();
            DB::table('khachhang')->where('tai_khoan_id', $taiKhoan->id)->delete();
            DB::table('nhanvien')->where('tai_khoan_id', $taiKhoan->id)->delete();
            DB::table('vitien')->where('tai_khoan_id', $taiKhoan->id)->delete();
            $taiKhoan->delete();
            return response()->json(['message' => 'Đã xóa tài khoản thành công!']);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Không thể xóa: ' . $e->getMessage()], 400);
        }
    }
}