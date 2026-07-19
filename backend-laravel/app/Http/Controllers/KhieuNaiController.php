<?php

namespace App\Http\Controllers;

use App\Models\KhieuNai;
use Illuminate\Http\Request;
use Carbon\Carbon;

class KhieuNaiController extends Controller
{
    public function indexAdmin()
    {
        $khieuNais = KhieuNai::with(['caLamViec.dichVu'])
            ->orderBy('id', 'desc')
            ->get();

        $khachHangIds = $khieuNais->where('nguoi_khieu_nai_loai', 'KhachHang')->pluck('nguoi_khieu_nai_id')->unique();
        $khachHangs = \App\Models\KhachHang::with('taiKhoan')->whereIn('id', $khachHangIds)->get()->keyBy('id');

        $nhanVienIds = $khieuNais->where('nguoi_khieu_nai_loai', 'NhanVien')->pluck('nguoi_khieu_nai_id')->unique();
        $nhanViens = \App\Models\NhanVien::with('taiKhoan')->whereIn('id', $nhanVienIds)->get()->keyBy('id');

        $data = $khieuNais->map(function ($item) use ($khachHangs, $nhanViens) {
            $customerName = 'Khách Ẩn Danh';
            $customerPhone = 'Không có';

            if ($item->nguoi_khieu_nai_loai === 'KhachHang') {
                $kh = $khachHangs->get($item->nguoi_khieu_nai_id);
                if ($kh && $kh->taiKhoan) {
                    $customerName = $kh->taiKhoan->ho_ten ?? 'Không tên';
                    $customerPhone = $kh->taiKhoan->so_dien_thoai ?? 'Không có';
                }
            } elseif ($item->nguoi_khieu_nai_loai === 'NhanVien') {
                $nv = $nhanViens->get($item->nguoi_khieu_nai_id);
                if ($nv && $nv->taiKhoan) {
                    $customerName = $nv->taiKhoan->ho_ten ?? 'Không tên';
                    $customerPhone = $nv->taiKhoan->so_dien_thoai ?? 'Không có';
                }
            }

            $serviceName = 'Chưa xác định';
            if ($item->caLamViec && $item->caLamViec->dichVu) {
                $serviceName = $item->caLamViec->dichVu->ten_dich_vu;
            }

            return [
                'id' => $item->id,
                'code' => '#FB-' . str_pad($item->id, 4, '0', STR_PAD_LEFT),
                'customer' => $customerName,
                'phone' => $customerPhone,
                'service' => $serviceName,
                'date' => $item->ngay_tao ? $item->ngay_tao->format('d/m/Y') : '',
                'type' => $item->ly_do_khieu_nai,
                'desc' => $item->mo_ta_chi_tiet,
                'status' => $item->trang_thai_xu_ly,
                'adminNote' => $item->ket_qua_xu_ly,
                'rating' => $item->rating,
                'isVisible' => $item->is_visible,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function updateReply(Request $request, $id)
    {
        try {
            $khieuNai = KhieuNai::findOrFail($id);
            $khieuNai->update([
                'ket_qua_xu_ly' => $request->input('adminNote'),
                'trang_thai_xu_ly' => $request->input('status', 'DaGiaiQuyet'),
                'admin_xu_ly_id' => $request->user()->id ?? null
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật phản hồi thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function toggleVisibility($id)
    {
        try {
            $khieuNai = KhieuNai::findOrFail($id);
            $khieuNai->update([
                'is_visible' => !$khieuNai->is_visible
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Đã thay đổi trạng thái hiển thị',
                'isVisible' => $khieuNai->is_visible
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $khieuNai = KhieuNai::findOrFail($id);
            $khieuNai->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa khiếu nại thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function indexReviews()
    {
        $reviews = \App\Models\CaLamViec::with(['donHang.khachHang.taiKhoan', 'dichVu', 'nhanVien.taiKhoan'])
            ->whereNotNull('sao_danh_gia')
            ->orderBy('ngay_danh_gia', 'desc')
            ->get();

        $data = $reviews->map(function ($item) {
            $customerName = 'Khách Ẩn Danh';
            if ($item->donHang && $item->donHang->khachHang && $item->donHang->khachHang->taiKhoan) {
                $customerName = $item->donHang->khachHang->taiKhoan->ho_ten ?? 'Không tên';
            }

            $serviceName = $item->dichVu ? $item->dichVu->ten_dich_vu : 'Chưa xác định';
            
            $employeeName = 'Chưa phân công';
            $employeeId = null;
            if ($item->nhanVien && $item->nhanVien->taiKhoan) {
                $employeeName = $item->nhanVien->taiKhoan->ho_ten ?? 'Không tên';
                $employeeId = $item->nhanVien->id;
            }

            $desc = $item->noi_dung_danh_gia ?? '';
            $isVisible = true;
            if (strpos($desc, '[HIDDEN]') === 0) {
                $isVisible = false;
                $desc = substr($desc, strlen('[HIDDEN]'));
            }

            return [
                'id' => $item->id,
                'customer' => $customerName,
                'service' => $serviceName,
                'employee' => $employeeName,
                'employeeId' => $employeeId,
                'date' => $item->ngay_danh_gia ? \Carbon\Carbon::parse($item->ngay_danh_gia)->format('d/m/Y') : '',
                'type' => 'Đánh giá dịch vụ',
                'desc' => $desc,
                'rating' => $item->sao_danh_gia,
                'isVisible' => $isVisible,
                'adminNote' => null, // Default to null
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function updateReviewReply(Request $request, $id)
    {
        return response()->json([
            'success' => true,
            'message' => 'Cập nhật phản hồi thành công (Lưu ý: database chưa hỗ trợ lưu trữ)'
        ]);
    }

    public function toggleReviewVisibility($id)
    {
        try {
            $caLamViec = \App\Models\CaLamViec::findOrFail($id);
            $desc = $caLamViec->noi_dung_danh_gia ?? '';
            
            if (strpos($desc, '[HIDDEN]') === 0) {
                $caLamViec->noi_dung_danh_gia = substr($desc, strlen('[HIDDEN]'));
                $isVisible = true;
            } else {
                $caLamViec->noi_dung_danh_gia = '[HIDDEN]' . $desc;
                $isVisible = false;
            }
            
            $caLamViec->save();

            return response()->json([
                'success' => true,
                'message' => 'Đã thay đổi trạng thái hiển thị',
                'isVisible' => $isVisible
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function deleteReview($id)
    {
        try {
            $caLamViec = \App\Models\CaLamViec::findOrFail($id);
            $caLamViec->sao_danh_gia = null;
            $caLamViec->noi_dung_danh_gia = null;
            $caLamViec->ngay_danh_gia = null;
            $caLamViec->save();

            return response()->json([
                'success' => true,
                'message' => 'Xóa đánh giá thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
