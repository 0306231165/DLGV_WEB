<?php

namespace App\Http\Controllers;

use App\Models\CaLamViec;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CaLamViecController extends Controller
{
    /**
     * Lấy danh sách Lịch Mới (Chợ việc + Khách chỉ định)
     */
    public function getAvailableJobs(Request $request)
    {
        $nhanVienId = Auth::user()->nhanVien->id;
        
        $caLamViecs = CaLamViec::with(['donHang.khachHang.taiKhoan', 'donHang.dichVuLoaiGoi.dichVu', 'dichVu'])
            ->whereIn('trang_thai_ca', ['ChoNhanVienTuDoNhan', 'ChoNhanVienChiDinhXacNhan'])
            ->where(function($q) use ($nhanVienId) {
                // Ca tự do, HOẶC ca chỉ định đích danh nhân viên này
                $q->where('trang_thai_ca', 'ChoNhanVienTuDoNhan')
                  ->orWhere(function($subQ) use ($nhanVienId) {
                      $subQ->where('trang_thai_ca', 'ChoNhanVienChiDinhXacNhan')
                           ->where('nhan_vien_id', $nhanVienId);
                  });
            })
            ->orderBy('ngay_lam', 'asc')
            ->get();
            
        return response()->json(['success' => true, 'data' => $caLamViecs]);
    }

    /**
     * Lấy danh sách Lịch Đã Nhận
     */
    public function getAcceptedJobs(Request $request)
    {
        $nhanVienId = Auth::user()->nhanVien->id;
        
        $caLamViecs = CaLamViec::with(['donHang.khachHang.taiKhoan', 'donHang.dichVuLoaiGoi.dichVu', 'dichVu'])
            ->where('nhan_vien_id', $nhanVienId)
            ->whereIn('trang_thai_ca', ['DaNhan'])
            ->orderBy('ngay_lam', 'asc')
            ->get();
            
        return response()->json(['success' => true, 'data' => $caLamViecs]);
    }

    /**
     * Lấy danh sách Lịch Làm Việc (để chấm công)
     */
    public function getWorkingSchedule(Request $request)
    {
        $nhanVienId = Auth::user()->nhanVien->id;
        
        $caLamViecs = CaLamViec::with(['donHang.khachHang.taiKhoan', 'donHang.dichVuLoaiGoi.dichVu', 'dichVu'])
            ->where('nhan_vien_id', $nhanVienId)
            ->whereIn('trang_thai_ca', ['DaNhan', 'DangThucHien']) 
            ->orderBy('ngay_lam', 'asc')
            ->get();
            
        return response()->json(['success' => true, 'data' => $caLamViecs]);
    }

    /**
     * Lấy danh sách Lịch sử (Đã hoàn thành, Đã huỷ)
     */
    public function getJobHistory(Request $request)
    {
        $nhanVienId = Auth::user()->nhanVien->id;
        
        $caLamViecs = CaLamViec::with(['donHang.khachHang.taiKhoan', 'donHang.dichVuLoaiGoi.dichVu', 'dichVu'])
            ->where('nhan_vien_id', $nhanVienId)
            ->whereIn('trang_thai_ca', ['DaHoanThanh', 'DaHuy']) 
            ->orderBy('ngay_lam', 'desc')
            ->get();
            
        return response()->json(['success' => true, 'data' => $caLamViecs]);
    }

    /**
     * Nhân viên bấm NHẬN lịch
     */
    public function acceptJob(Request $request, $id)
    {
        $nhanVienId = Auth::user()->nhanVien->id;
        $ca = CaLamViec::findOrFail($id);
        
        if (!in_array($ca->trang_thai_ca, ['ChoNhanVienTuDoNhan', 'ChoNhanVienChiDinhXacNhan'])) {
            return response()->json(['success' => false, 'message' => 'Lịch này không còn khả dụng'], 400);
        }
        
        $ca->nhan_vien_id = $nhanVienId;
        $ca->trang_thai_ca = 'DaNhan';
        $ca->save();
        
        return response()->json(['success' => true, 'message' => 'Nhận lịch thành công']);
    }

    /**
     * Nhân viên bấm TỪ CHỐI lịch (chỉ dành cho khách chỉ định)
     */
    public function rejectJob(Request $request, $id)
    {
        $nhanVienId = Auth::user()->nhanVien->id;
        $ca = CaLamViec::findOrFail($id);
        
        if ($ca->trang_thai_ca == 'ChoNhanVienChiDinhXacNhan' && $ca->nhan_vien_id == $nhanVienId) {
            $donHang = $ca->donHang;
            
            if ($donHang && $donHang->phuong_an_thay_the === 'KhongTimThayThe') {
                $ca->trang_thai_ca = 'DaHuy';
                $ca->save();

                $donHang->trang_thai_don = 'DaHuy';
                $donHang->save();

                return response()->json(['success' => true, 'message' => 'Đã từ chối. Đơn hàng bị hủy do khách không muốn đổi nhân viên.']);
            } else {
                $ca->nhan_vien_id = null;
                $ca->trang_thai_ca = 'ChoNhanVienTuDoNhan'; // Đẩy ra chợ việc
                $ca->save();
                return response()->json(['success' => true, 'message' => 'Đã từ chối lịch. Lịch được đẩy lên chợ việc.']);
            }
        }
        
        return response()->json(['success' => false, 'message' => 'Không thể từ chối lịch này'], 400);
    }

    /**
     * Cập nhật tiến độ: Bắt đầu làm -> Hoàn thành
     */
    public function updateProgress(Request $request, $id)
    {
        $nhanVienId = Auth::user()->nhanVien->id;
        $ca = CaLamViec::with('donHang')->findOrFail($id);

        if ($ca->nhan_vien_id != $nhanVienId) {
            return response()->json(['success' => false, 'message' => 'Bạn không có quyền cập nhật ca này'], 403);
        }

        if ($ca->trang_thai_ca == 'DaNhan') {
            $ca->trang_thai_ca = 'DangThucHien';
            $ca->thoi_gian_checkin = now();
            $ca->save();
            
            if ($ca->donHang && $ca->donHang->trang_thai_don == 'ChoXuLy') {
                $ca->donHang->trang_thai_don = 'DangThucHien';
                $ca->donHang->save();
            }

            return response()->json(['success' => true, 'message' => 'Đã bắt đầu làm việc']);
        } elseif ($ca->trang_thai_ca == 'DangThucHien') {
            $ca->trang_thai_ca = 'DaHoanThanh';
            $ca->thoi_gian_checkout = now();
            $ca->save();

            if ($ca->donHang) {
                // Kiểm tra xem tất cả ca làm việc của đơn hàng này đã hoàn thành hoặc hủy chưa
                $allCompletedOrCanceled = !\App\Models\CaLamViec::where('don_hang_id', $ca->don_hang_id)
                    ->whereNotIn('trang_thai_ca', ['DaHoanThanh', 'DaHuy'])
                    ->exists();

                if ($allCompletedOrCanceled) {
                    $ca->donHang->trang_thai_don = 'DaHoanThanh';
                    $ca->donHang->save();
                }
            }
            
            return response()->json(['success' => true, 'message' => 'Đã hoàn thành ca làm việc']);
        }

        return response()->json(['success' => false, 'message' => 'Trạng thái ca không hợp lệ'], 400);
    }

    /**
     * Hủy ca làm việc đã nhận
     */
    public function cancelAcceptedJob(Request $request, $id)
    {
        $nhanVienId = Auth::user()->nhanVien->id;
        $ca = CaLamViec::findOrFail($id);

        if ($ca->nhan_vien_id != $nhanVienId) {
            return response()->json(['success' => false, 'message' => 'Bạn không có quyền hủy ca này'], 403);
        }

        if ($ca->trang_thai_ca == 'DaNhan') {
            $ca->nhan_vien_id = null;
            $ca->trang_thai_ca = 'ChoNhanVienTuDoNhan';
            $ca->save();

            return response()->json(['success' => true, 'message' => 'Đã hủy nhận ca. Lịch được đưa trở lại chợ việc.']);
        }

        return response()->json(['success' => false, 'message' => 'Chỉ có thể hủy ca khi chưa bắt đầu làm việc'], 400);
    }
}
