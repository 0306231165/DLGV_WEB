<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TaiKhoan;

class AdminAccountController extends Controller
{
    // ==========================================
    // 1. HÀM LẤY DANH SÁCH (Hiển thị lên bảng)
    // ==========================================
    public function index()
    {
        $taikhoans = TaiKhoan::orderBy('ngay_tao', 'desc')->get();

        $users = $taikhoans->map(function ($tk) {
            // Xử lý dịch Vai trò
            $role = 'Khách hàng'; 
            if ($tk->loai_tai_khoan === 'NhanVien') {
                $role = 'Nhân viên vệ sinh';
            } elseif ($tk->loai_tai_khoan === 'Admin') { 
                $role = 'Quản trị viên';
            }

            // Xử lý dịch Trạng thái
            $status = 'Hoạt động';
            if ($tk->trang_thai === 'DaKhoa' || $tk->trang_thai === 'Khoa') { 
                $status = 'Đã khóa';
            }

            return [
                'id' => $tk->id,
                'name' => $tk->ho_ten, 
                'email' => $tk->email,
                'avatar' => $tk->avatar, 
                'role' => $role,
                'status' => $status,
                'created_at' => date('d \T\h\m, Y', strtotime($tk->ngay_tao)), 
            ];
        });

        return response()->json($users);
    }

    // ==========================================
    // 2. HÀM XỬ LÝ KHÓA / MỞ KHÓA TÀI KHOẢN
    // ==========================================
    public function updateStatus(Request $request, $id)
    {
        $taiKhoan = TaiKhoan::find($id);

        if (!$taiKhoan) {
            return response()->json(['message' => 'Không tìm thấy tài khoản'], 404);
        }

        $taiKhoan->trang_thai = $request->trang_thai;
        $taiKhoan->save(); 

        return response()->json(['message' => 'Cập nhật trạng thái thành công']);
    }

    // ==========================================
    // 3. HÀM XỬ LÝ THÊM TÀI KHOẢN MỚI
    // ==========================================
    public function store(Request $request)
    {
        $taiKhoanMoi = new TaiKhoan();
        $taiKhoanMoi->ho_ten = $request->ho_ten;
        $taiKhoanMoi->so_dien_thoai = $request->so_dien_thoai;
        $taiKhoanMoi->email = $request->email;
        $taiKhoanMoi->mat_khau = bcrypt($request->mat_khau); 
        $taiKhoanMoi->loai_tai_khoan = $request->loai_tai_khoan;
        $taiKhoanMoi->trang_thai = 'HoatDong'; 
        $taiKhoanMoi->ngay_tao = now(); 
        
        $taiKhoanMoi->save();

        return response()->json(['message' => 'Thêm tài khoản thành công', 'user' => $taiKhoanMoi]);
    }
}