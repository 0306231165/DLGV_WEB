<?php

namespace App\Http\Controllers;

use App\Models\NhanVien;
use Illuminate\Http\Request;

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

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
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

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, NhanVien $nhanVien)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(NhanVien $nhanVien)
    {
        //
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
}
