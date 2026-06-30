<?php

namespace App\Http\Controllers;

use App\Models\CaLamViec;
use App\Models\DonHang;
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
        
        $lichNghi = \App\Models\LichNghi::where('nhan_vien_id', $nhanVienId)
            ->where('loai_nghi', 'DinhKy')
            ->get();

        $startDate = null;
        $endDate = null;
        $offDays = [];
        $nghiStart = null;
        $nghiEnd = null;

        if ($lichNghi->isNotEmpty()) {
            $startDate = $lichNghi->min('ngay_bat_dau_ap_dung');
            $endDate = $lichNghi->max('ngay_ket_thuc_ap_dung');
            $offDays = $lichNghi->pluck('thu_trong_tuan')->filter(function ($val) {
                return !is_null($val);
            })->toArray();
            
            $firstLichNghi = $lichNghi->firstWhere('thu_trong_tuan', null);
            if ($firstLichNghi && $firstLichNghi->gio_bat_dau_nghi && $firstLichNghi->gio_ket_thuc_nghi) {
                $nghiStart = $firstLichNghi->gio_bat_dau_nghi;
                $nghiEnd = $firstLichNghi->gio_ket_thuc_nghi;
            }
        }

        $caLamViecs = CaLamViec::with(['donHang.khachHang.taiKhoan', 'donHang.dichVuLoaiGoi.dichVu', 'dichVu'])
            ->where(function($q) use ($nhanVienId) {
                $q->where('trang_thai_ca', 'ChoNhanVienTuDoNhan')
                  ->orWhere(function($subQ) use ($nhanVienId) {
                      $subQ->where('trang_thai_ca', 'ChoNhanVienChiDinhXacNhan')
                           ->where('nhan_vien_id', $nhanVienId);
                  });
            })
            ->get();

        $grouped = collect($caLamViecs)->groupBy('don_hang_id');
        $result = [];
        
        foreach ($grouped as $don_hang_id => $cas) {
            $firstCa = $cas->first();
            $isAssigned = $firstCa->trang_thai_ca === 'ChoNhanVienChiDinhXacNhan' && $firstCa->nhan_vien_id == $nhanVienId;
            $isCaLe = $firstCa->loai_goi_ca_lam === 'CaLe';
            
            if (!$isAssigned && $isCaLe) {
                if (!$startDate || !$endDate) {
                    continue; // Phải đăng ký lịch rảnh thì mới được nhận Ca lẻ
                }
                
                $isValidPackage = true;
                foreach ($cas as $ca) {
                    if ($ca->ngay_lam < $startDate || $ca->ngay_lam > $endDate) {
                        \Log::info('CaLe Hidden due to Date Range', ['don_hang' => $don_hang_id, 'ca_ngay_lam' => $ca->ngay_lam, 'startDate' => $startDate, 'endDate' => $endDate]);
                        $isValidPackage = false;
                        break;
                    }
                    
                    $dow = (int) date('w', strtotime($ca->ngay_lam));
                    if (in_array($dow, $offDays)) {
                        \Log::info('CaLe Hidden due to DOW', ['don_hang' => $don_hang_id, 'dow' => $dow, 'offDays' => $offDays]);
                        $isValidPackage = false;
                        break;
                    }
                    
                    if ($nghiStart && $nghiEnd && $ca->gio_bat_dau && $ca->thoi_gian_lam_phut) {
                        $cStart = \Carbon\Carbon::parse($ca->gio_bat_dau);
                        $cEnd = (clone $cStart)->addMinutes($ca->thoi_gian_lam_phut);
                        
                        $rStart = \Carbon\Carbon::parse($nghiStart);
                        $rEnd = \Carbon\Carbon::parse($nghiEnd);
                        
                        // Fix intersection logic for midnight crossing
                        $intersects = false;
                        if ($rStart <= $rEnd) {
                            $intersects = ($cStart->format('H:i:s') < $rEnd->format('H:i:s') && $cEnd->format('H:i:s') > $rStart->format('H:i:s'));
                        } else {
                            // Crosses midnight (e.g. 23:00 to 06:00)
                            $intersects = ($cStart->format('H:i:s') > $rStart->format('H:i:s') || $cEnd->format('H:i:s') < $rEnd->format('H:i:s'));
                        }
                        
                        if ($intersects) {
                            \Log::info('CaLe Hidden due to Time', ['ca' => $ca->id, 'cStart' => $cStart->format('H:i:s'), 'cEnd' => $cEnd->format('H:i:s'), 'rStart' => $rStart->format('H:i:s'), 'rEnd' => $rEnd->format('H:i:s')]);
                            $isValidPackage = false;
                            break;
                        }
                    }
                }
                
                if (!$isValidPackage) {
                    continue; 
                }
            }

            if ($cas->count() == 1) {
                $result[] = $cas->first()->toArray();
            } else {
                $firstCa = $cas->sortBy('ngay_lam')->first();
                $packageCa = $firstCa->toArray();
                $packageCa['id'] = 'PACKAGE_' . $don_hang_id;
                $packageCa['thuc_nhan_nv'] = $cas->sum('thuc_nhan_nv');
                $packageCa['is_package'] = true;
                $packageCa['so_ca_kha_dung'] = $cas->count();
                $packageCa['ngay_lam_end'] = $cas->max('ngay_lam');
                $packageCa['ngay_lam_start'] = $cas->min('ngay_lam');
                $result[] = $packageCa;
            }
        }
        
        usort($result, function($a, $b) {
            $dateA = isset($a['is_package']) && $a['is_package'] ? $a['ngay_lam_start'] : $a['ngay_lam'];
            $dateB = isset($b['is_package']) && $b['is_package'] ? $b['ngay_lam_start'] : $b['ngay_lam'];
            return strtotime($dateA) <=> strtotime($dateB);
        });

        return response()->json(['success' => true, 'data' => $result]);
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
            
        $grouped = collect($caLamViecs)->groupBy('don_hang_id');
        $result = [];
        
        foreach ($grouped as $don_hang_id => $cas) {
            if ($cas->count() == 1) {
                $result[] = $cas->first()->toArray();
            } else {
                $firstCa = $cas->sortBy('ngay_lam')->first();
                $packageCa = $firstCa->toArray();
                $packageCa['id'] = 'PACKAGE_' . $don_hang_id;
                $packageCa['thuc_nhan_nv'] = $cas->sum('thuc_nhan_nv');
                $packageCa['is_package'] = true;
                $packageCa['so_ca_kha_dung'] = $cas->count();
                $packageCa['ngay_lam_end'] = $cas->max('ngay_lam');
                $packageCa['ngay_lam_start'] = $cas->min('ngay_lam');
                $result[] = $packageCa;
            }
        }
        
        usort($result, function($a, $b) {
            $dateA = isset($a['is_package']) && $a['is_package'] ? $a['ngay_lam_start'] : $a['ngay_lam'];
            $dateB = isset($b['is_package']) && $b['is_package'] ? $b['ngay_lam_start'] : $b['ngay_lam'];
            return strtotime($dateA) <=> strtotime($dateB);
        });

        return response()->json(['success' => true, 'data' => $result]);
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

        if (str_starts_with($id, 'PACKAGE_')) {
            $donHangId = str_replace('PACKAGE_', '', $id);
            $cas = CaLamViec::where('don_hang_id', $donHangId)
                ->whereIn('trang_thai_ca', ['ChoNhanVienTuDoNhan', 'ChoNhanVienChiDinhXacNhan'])
                ->get();
                
            if ($cas->isEmpty()) {
                return response()->json(['success' => false, 'message' => 'Gói lịch này không còn khả dụng'], 400);
            }
            
            $errorMsg = $this->checkOverlappingAndGap($cas, $nhanVienId);
            if ($errorMsg) {
                return response()->json(['success' => false, 'message' => $errorMsg], 400);
            }
            
            foreach ($cas as $ca) {
                $ca->nhan_vien_id = $nhanVienId;
                $ca->trang_thai_ca = 'DaNhan';
                $ca->save();
            }
            
            $donHang = DonHang::find($donHangId);
            if ($donHang) {
                \App\Models\PhongChat::firstOrCreate([
                    'don_hang_id' => $donHangId,
                    'khach_hang_id' => $donHang->khach_hang_id,
                    'nhan_vien_id' => $nhanVienId,
                ], [
                    'trang_thai_phong' => 'DangHoatDong',
                    'thoi_gian_nhan_tin_cuoi' => now()
                ]);
            }
            
            return response()->json(['success' => true, 'message' => 'Nhận gói lịch thành công']);
        }

        $ca = CaLamViec::findOrFail($id);
        
        if (!in_array($ca->trang_thai_ca, ['ChoNhanVienTuDoNhan', 'ChoNhanVienChiDinhXacNhan'])) {
            return response()->json(['success' => false, 'message' => 'Lịch này không còn khả dụng'], 400);
        }
        
        $errorMsg = $this->checkOverlappingAndGap(collect([$ca]), $nhanVienId);
        if ($errorMsg) {
            return response()->json(['success' => false, 'message' => $errorMsg], 400);
        }
        
        $ca->nhan_vien_id = $nhanVienId;
        $ca->trang_thai_ca = 'DaNhan';
        $ca->save();
        
        $donHang = DonHang::find($ca->don_hang_id);
        if ($donHang) {
            \App\Models\PhongChat::firstOrCreate([
                'don_hang_id' => $donHang->id,
                'khach_hang_id' => $donHang->khach_hang_id,
                'nhan_vien_id' => $nhanVienId,
            ], [
                'trang_thai_phong' => 'DangHoatDong',
                'thoi_gian_nhan_tin_cuoi' => now()
            ]);
        }
        
        return response()->json(['success' => true, 'message' => 'Nhận lịch thành công']);
    }

    /**
     * Nhân viên bấm TỪ CHỐI lịch (chỉ dành cho khách chỉ định)
     */
    public function rejectJob(Request $request, $id)
    {
        $nhanVienId = Auth::user()->nhanVien->id;

        if (str_starts_with($id, 'PACKAGE_')) {
            $donHangId = str_replace('PACKAGE_', '', $id);
            $cas = CaLamViec::where('don_hang_id', $donHangId)
                ->where('trang_thai_ca', 'ChoNhanVienChiDinhXacNhan')
                ->where('nhan_vien_id', $nhanVienId)
                ->get();
                
            if ($cas->isEmpty()) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy gói lịch để từ chối'], 400);
            }
            
            $donHang = $cas->first()->donHang;
            
            if ($donHang && $donHang->phuong_an_thay_the === 'KhongTimThayThe') {
                foreach ($cas as $ca) {
                    $ca->trang_thai_ca = 'NhanVienHuy';
                    $ca->save();
                }
                $donHang->trang_thai_don = 'DaHuy';
                $donHang->save();
                return response()->json(['success' => true, 'message' => 'Đã từ chối. Đơn hàng bị hủy do khách không muốn đổi nhân viên.']);
            } else {
                foreach ($cas as $ca) {
                    $ca->nhan_vien_id = null;
                    $ca->trang_thai_ca = 'ChoNhanVienTuDoNhan';
                    $ca->save();
                }
                return response()->json(['success' => true, 'message' => 'Đã từ chối gói lịch. Lịch được đẩy lên chợ việc.']);
            }
        }

        $ca = CaLamViec::findOrFail($id);
        
        if ($ca->trang_thai_ca == 'ChoNhanVienChiDinhXacNhan' && $ca->nhan_vien_id == $nhanVienId) {
            $donHang = $ca->donHang;
            
            if ($donHang && $donHang->phuong_an_thay_the === 'KhongTimThayThe') {
                $ca->trang_thai_ca = 'NhanVienHuy';
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

    /**
     * Hủy toàn bộ hợp đồng (đẩy tất cả ca chưa làm của hợp đồng lên chợ việc)
     */
    public function cancelContract(Request $request, $id)
    {
        $nhanVienId = Auth::user()->nhanVien->id;
        $ca = CaLamViec::findOrFail($id);

        if ($ca->nhan_vien_id != $nhanVienId) {
            return response()->json(['success' => false, 'message' => 'Bạn không có quyền hủy hợp đồng này'], 403);
        }

        $don_hang_id = $ca->don_hang_id;

        // Cancel all un-worked shifts of this contract assigned to this staff
        $affectedRows = CaLamViec::where('don_hang_id', $don_hang_id)
            ->where('nhan_vien_id', $nhanVienId)
            ->whereIn('trang_thai_ca', ['DaNhan', 'ChoNhanVienChiDinhXacNhan'])
            ->update([
                'nhan_vien_id' => null,
                'trang_thai_ca' => 'ChoNhanVienTuDoNhan'
            ]);

        if ($affectedRows > 0) {
            return response()->json(['success' => true, 'message' => "Đã hủy toàn bộ $affectedRows ca làm việc còn lại của hợp đồng. Lịch đã được đẩy lên chợ việc."]);
        }

        return response()->json(['success' => false, 'message' => 'Không có ca làm việc nào chưa bắt đầu để hủy'], 400);
    }

    /**
     * Helper: Kiểm tra trùng lịch và khoảng cách 1 tiếng giữa các ca làm việc
     */
    private function checkOverlappingAndGap($cas, $nhanVienId)
    {
        $dates = $cas->pluck('ngay_lam')->unique()->toArray();
        
        $existingCas = CaLamViec::where('nhan_vien_id', $nhanVienId)
            ->whereIn('trang_thai_ca', ['DaNhan', 'DangThucHien'])
            ->whereIn('ngay_lam', $dates)
            ->get(['id', 'ngay_lam', 'gio_bat_dau', 'thoi_gian_lam_phut']);
            
        foreach ($cas as $newCa) {
            $newStartStr = $newCa->gio_bat_dau;
            $newDuration = $newCa->thoi_gian_lam_phut;
            if (!$newStartStr || !$newDuration) continue;
            
            $newStartDt = \Carbon\Carbon::parse($newCa->ngay_lam . ' ' . $newStartStr);
            $newEndDt = (clone $newStartDt)->addMinutes($newDuration);
            
            // Mở rộng thời gian ca mới +- 60 phút để đảm bảo khoảng nghỉ
            $expandedStartDt = (clone $newStartDt)->subMinutes(60);
            $expandedEndDt = (clone $newEndDt)->addMinutes(60);
            
            foreach ($existingCas as $existingCa) {
                if ($existingCa->ngay_lam === $newCa->ngay_lam) {
                    $existStartStr = $existingCa->gio_bat_dau;
                    $existDuration = $existingCa->thoi_gian_lam_phut;
                    if (!$existStartStr || !$existDuration) continue;
                    
                    $existStartDt = \Carbon\Carbon::parse($existingCa->ngay_lam . ' ' . $existStartStr);
                    $existEndDt = (clone $existStartDt)->addMinutes($existDuration);
                    
                    if ($existStartDt < $expandedEndDt && $existEndDt > $expandedStartDt) {
                        return "Nhận lịch thất bại! Ca ngày {$newCa->ngay_lam} (từ {$newStartDt->format('H:i')} đến {$newEndDt->format('H:i')}) bị trùng hoặc chưa cách lịch làm việc hiện tại tối thiểu 1 tiếng để nghỉ ngơi/di chuyển. Vui lòng kiểm tra lại.";
                    }
                }
            }
        }
        return null;
    }
}
