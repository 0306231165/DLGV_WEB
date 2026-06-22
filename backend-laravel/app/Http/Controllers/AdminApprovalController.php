<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminApprovalController extends Controller
{
    // Lấy danh sách hồ sơ chờ duyệt
    public function index()
    {
        // Giải pháp: Vì tài khoản mới tạo có thể chưa có dịch vụ, ta đếm các tài khoản 'HoatDong' được tạo trong tuần này
        $approvedThisWeek = DB::table('taikhoan')
            ->where('loai_tai_khoan', 'NhanVien')
            ->where('trang_thai', 'HoatDong')
            ->whereBetween('ngay_tao', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            ->count();

        // Chỉ tính thời gian phản hồi cho các hồ sơ được tạo trong vòng 30 ngày gần đây để LOẠI BỎ dữ liệu lỗi (3624 giờ)
        $approvals = DB::table('nhanvien_dichvu')
            ->join('nhanvien', 'nhanvien_dichvu.nhan_vien_id', '=', 'nhanvien.id')
            ->join('taikhoan', 'nhanvien.tai_khoan_id', '=', 'taikhoan.id')
            ->where('nhanvien_dichvu.trang_thai_duyet', 'DaDuyet')
            ->whereNotNull('nhanvien_dichvu.ngay_duyet')
            ->where('taikhoan.ngay_tao', '>=', Carbon::now()->subDays(30))
            ->select('taikhoan.ngay_tao', 'nhanvien_dichvu.ngay_duyet')
            ->get();

        $totalHours = 0;
        $count = 0;
        foreach ($approvals as $a) {
            if ($a->ngay_tao && $a->ngay_duyet) {
                $created = Carbon::parse($a->ngay_tao);
                $approved = Carbon::parse($a->ngay_duyet);
                // Dùng abs() để lấy trị tuyệt đối, tránh số âm do data test bị ngược thời gian
                $totalHours += abs($created->diffInHours($approved, false));
                $count++;
            }
        }
        $avgResponseTime = $count > 0 ? round($totalHours / $count, 1) : 0;

        $candidates = DB::table('taikhoan')
            ->join('nhanvien', 'taikhoan.id', '=', 'nhanvien.tai_khoan_id')
            ->where('taikhoan.loai_tai_khoan', 'NhanVien')
            ->where('taikhoan.trang_thai', 'ChoXacMinh')
            ->select(
                'taikhoan.id',
                'taikhoan.ho_ten as name',
                'taikhoan.ngay_tao',
                'taikhoan.avatar',
                'taikhoan.so_dien_thoai as phone',
                'taikhoan.ngay_sinh',
                'taikhoan.email',
                'nhanvien.cccd',
                'nhanvien.dia_chi as location',
                'nhanvien.kinh_nghiem',
                'nhanvien.id as nhanvien_id'
            )
            ->orderBy('taikhoan.ngay_tao', 'desc')
            ->get()
            ->map(function ($c) {
                // Lấy danh sách kỹ năng từ nhanvien_dichvu
                $skills = DB::table('nhanvien_dichvu')
                    ->join('dichvu', 'nhanvien_dichvu.dich_vu_id', '=', 'dichvu.id')
                    ->where('nhanvien_dichvu.nhan_vien_id', $c->nhanvien_id)
                    ->select('dichvu.ten_dich_vu as title', 'dichvu.mo_ta as desc')
                    ->get();

                // Tính tuổi
                $age = null;
                if ($c->ngay_sinh) {
                    $age = Carbon::parse($c->ngay_sinh)->age . ' tuổi';
                }

                // Format apply time
                $createdAt = Carbon::parse($c->ngay_tao);
                if ($createdAt->isToday()) {
                    $applyTime = 'Ứng tuyển: ' . $createdAt->format('H:i') . ' Hôm nay';
                } elseif ($createdAt->isYesterday()) {
                    $applyTime = 'Ứng tuyển: ' . $createdAt->format('H:i') . ' Hôm qua';
                } else {
                    $applyTime = 'Ứng tuyển: ' . $createdAt->format('H:i d/m/Y');
                }

                // isNew flag (trong vòng 24h)
                $isNew = $createdAt->diffInHours(now()) <= 24;

                // Initials cho avatar fallback
                $nameParts = explode(' ', trim($c->name));
                $initials = '';
                if (count($nameParts) >= 2) {
                    $initials = strtoupper(mb_substr($nameParts[0], 0, 1) . mb_substr(end($nameParts), 0, 1));
                } elseif (count($nameParts) === 1) {
                    $initials = strtoupper(mb_substr($nameParts[0], 0, 2));
                }

                return [
                    'id' => $c->id,
                    'name' => $c->name,
                    'email' => $c->email ?: 'Chưa cập nhật',
                    'cccd' => $c->cccd ?: 'Chưa cập nhật',
                    'applyTime' => $applyTime,
                    'isNew' => $isNew,
                    'avatar' => $c->avatar,
                    'initials' => $initials,
                    'quote' => 'Mong muốn được hợp tác và mang lại chất lượng dịch vụ tốt nhất.',
                    'location' => $c->location ?: 'Chưa cập nhật',
                    'phone' => $c->phone,
                    'age' => $age ?: 'Chưa cập nhật',
                    'skills' => $skills,
                    'kinh_nghiem' => $c->kinh_nghiem
                ];
            });

        return response()->json([
            'candidates' => $candidates,
            'stats' => [
                'approvedThisWeek' => $approvedThisWeek,
                'avgResponseTime' => $avgResponseTime
            ]
        ]);
    }

    // Phê duyệt hồ sơ
    public function approve($id)
    {
        DB::beginTransaction();
        try {
            // Cập nhật trạng thái tài khoản
            $affected = DB::table('taikhoan')
                ->where('id', $id)
                ->where('loai_tai_khoan', 'NhanVien')
                ->where('trang_thai', 'ChoXacMinh')
                ->update([
                    'trang_thai' => 'HoatDong',
                    'ly_do_tu_choi' => null
                ]);

            if ($affected === 0) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy hồ sơ chờ duyệt.'], 404);
            }

            // Cập nhật các dịch vụ của nhân viên thành DaDuyet
            $nhanVien = DB::table('nhanvien')->where('tai_khoan_id', $id)->first();
            if ($nhanVien) {
                DB::table('nhanvien_dichvu')
                    ->where('nhan_vien_id', $nhanVien->id)
                    ->where('trang_thai_duyet', 'ChoDuyet')
                    ->update([
                        'trang_thai_duyet' => 'DaDuyet',
                        'ngay_duyet' => now()
                    ]);
            }

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Đã phê duyệt đối tác.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    // Từ chối hồ sơ
    public function reject(Request $request, $id)
    {
        $reason = $request->input('reason', 'Không đạt yêu cầu');

        DB::beginTransaction();
        try {
            $affected = DB::table('taikhoan')
                ->where('id', $id)
                ->where('loai_tai_khoan', 'NhanVien')
                ->where('trang_thai', 'ChoXacMinh')
                ->update([
                    'trang_thai' => 'BiKhoa',
                    'ly_do_tu_choi' => $reason
                ]);

            if ($affected === 0) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy hồ sơ chờ duyệt.'], 404);
            }

            // Từ chối các dịch vụ đăng ký
            $nhanVien = DB::table('nhanvien')->where('tai_khoan_id', $id)->first();
            if ($nhanVien) {
                DB::table('nhanvien_dichvu')
                    ->where('nhan_vien_id', $nhanVien->id)
                    ->where('trang_thai_duyet', 'ChoDuyet')
                    ->update([
                        'trang_thai_duyet' => 'TuChoi',
                        'ngay_duyet' => now()
                    ]);
            }

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Đã từ chối đối tác.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }
}
