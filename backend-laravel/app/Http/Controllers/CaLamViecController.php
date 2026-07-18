<?php

namespace App\Http\Controllers;

use App\Models\CaLamViec;
use App\Models\DonHang;
use App\Models\ThongBao;
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

        // Lấy danh sách các dich_vu_id mà nhân viên này đã đăng ký và được duyệt (DaDuyet)
        $myApprovedServiceIds = \Illuminate\Support\Facades\DB::table('NhanVien_DichVu')
            ->where('nhan_vien_id', $nhanVienId)
            ->where('trang_thai_duyet', 'DaDuyet')
            ->pluck('dich_vu_id')
            ->toArray();

        // =========================================================================
        // LỌC BLACKLIST: Loại trừ các ca/đơn mà nhân viên này đã từng hủy
        // =========================================================================
        // TH1: Hủy ca lẻ (loai_cap_do_yeu_cau = 'CaLam') -> lấy ra danh sách ca_lam_viec_id đã hủy
        $cancelledCaIds = \App\Models\YeuCauXuLy::where('nguoi_yeu_cau_loai', 'NhanVien')
            ->where('nguoi_yeu_cau_id', $nhanVienId)
            ->where('loai_cap_do_yeu_cau', 'CaLam')
            ->whereIn('loai_yeu_cau', ['HuyCaLe'])
            ->whereNotNull('ca_lam_viec_id')
            ->pluck('ca_lam_viec_id')
            ->toArray();

        // TH2: Hủy hợp đồng (loai_cap_do_yeu_cau = 'DonHang') -> lấy ra danh sách don_hang_id đã hủy hợp đồng
        $cancelledDonHangIds = \App\Models\YeuCauXuLy::where('nguoi_yeu_cau_loai', 'NhanVien')
            ->where('nguoi_yeu_cau_id', $nhanVienId)
            ->where('loai_cap_do_yeu_cau', 'DonHang')
            ->whereIn('loai_yeu_cau', ['HuyDonToanGoi'])
            ->whereNotNull('don_hang_id')
            ->pluck('don_hang_id')
            ->toArray();

        $caLamViecs = CaLamViec::with(['donHang.khachHang.taiKhoan', 'donHang.dichVuLoaiGoi.dichVu', 'dichVu'])
            ->where(function($q) use ($nhanVienId, $myApprovedServiceIds) {
                $q->where(function($subFree) use ($myApprovedServiceIds) {
                    $subFree->where('trang_thai_ca', 'ChoNhanVienTuDoNhan')
                            ->whereIn('dich_vu_id', $myApprovedServiceIds); // CHỈ hiển thị ca tự do khớp với kỹ năng/dịch vụ đã được duyệt của nhân viên
                })
                ->orWhere(function($subQ) use ($nhanVienId) {
                    $subQ->where('trang_thai_ca', 'ChoNhanVienChiDinhXacNhan')
                         ->where('nhan_vien_id', $nhanVienId);
                });
            })
            // Loại trừ các ca mà nhân viên đã từng hủy trực tiếp (HuyCaLe)
            ->when(!empty($cancelledCaIds), function($q) use ($cancelledCaIds) {
                $q->whereNotIn('id', $cancelledCaIds);
            })
            // Loại trừ toàn bộ ca của đơn hàng mà nhân viên đã hủy hợp đồng (HuyDonToanGoi)
            ->when(!empty($cancelledDonHangIds), function($q) use ($cancelledDonHangIds) {
                $q->whereNotIn('don_hang_id', $cancelledDonHangIds);
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

                ThongBao::create([
                    'loai_nguoi_nhan' => 'KhachHang',
                    'nguoi_nhan_id' => $donHang->khach_hang_id,
                    'tieu_de' => '💼 Nhân viên đã nhận gói dịch vụ',
                    'noi_dung' => 'Nhân viên ' . Auth::user()->nhanVien->ho_ten . ' đã xác nhận nhận thực hiện gói lịch dọn dẹp của bạn.',
                    'loai_doi_tuong' => 'DonHang',
                    'doi_tuong_id' => $donHangId,
                    'ngay_tao' => now(),
                    'is_da_doc' => false
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

            ThongBao::create([
                'loai_nguoi_nhan' => 'KhachHang',
                'nguoi_nhan_id' => $donHang->khach_hang_id,
                'tieu_de' => '💼 Nhân viên đã nhận lịch làm việc',
                'noi_dung' => 'Nhân viên ' . Auth::user()->nhanVien->ho_ten . ' đã xác nhận nhận thực hiện ca làm việc ngày ' . \Carbon\Carbon::parse($ca->ngay_lam)->format('d/m/Y') . ' lúc ' . \Carbon\Carbon::parse($ca->gio_bat_dau)->format('H:i') . '.',
                'loai_doi_tuong' => 'DonHang',
                'doi_tuong_id' => $donHang->id,
                'ngay_tao' => now(),
                'is_da_doc' => false
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
        $reason = trim($request->input('reason', ''));
        $reasonText = $reason !== '' ? " Lý do: {$reason}." : "";

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
                $donHang->nhan_vien_duoc_yeu_cau_id = null;
                $donHang->save();

                ThongBao::create([
                    'loai_nguoi_nhan' => 'KhachHang',
                    'nguoi_nhan_id' => $donHang->khach_hang_id,
                    'tieu_de' => '⚠️ Nhân viên từ chối lịch chỉ định',
                    'noi_dung' => 'Nhân viên ' . Auth::user()->nhanVien->ho_ten . ' không thể tham gia gói lịch chỉ định của bạn.' . $reasonText . ' Đơn hàng đã bị hủy theo yêu cầu không đổi nhân viên của bạn.',
                    'loai_doi_tuong' => 'DonHang',
                    'doi_tuong_id' => $donHang->id,
                    'ngay_tao' => now(),
                    'is_da_doc' => false
                ]);

                return response()->json(['success' => true, 'message' => 'Đã từ chối. Đơn hàng bị hủy do khách không muốn đổi nhân viên.']);
            } else {
                foreach ($cas as $ca) {
                    $ca->nhan_vien_id = null;
                    $ca->trang_thai_ca = 'ChoNhanVienTuDoNhan';
                    $ca->save();
                }

                if ($donHang) {
                    $donHang->nhan_vien_duoc_yeu_cau_id = null;
                    $donHang->save();

                    ThongBao::create([
                        'loai_nguoi_nhan' => 'KhachHang',
                        'nguoi_nhan_id' => $donHang->khach_hang_id,
                        'tieu_de' => '⚠️ Nhân viên từ chối lịch chỉ định',
                        'noi_dung' => 'Nhân viên ' . Auth::user()->nhanVien->ho_ten . ' không thể tham gia gói lịch chỉ định của bạn.' . $reasonText . ' Lịch đã được chuyển sang chế độ tự do trên chợ việc cho các nhân viên khác nhận.',
                        'loai_doi_tuong' => 'DonHang',
                        'doi_tuong_id' => $donHang->id,
                        'ngay_tao' => now(),
                        'is_da_doc' => false
                    ]);
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
                $donHang->nhan_vien_duoc_yeu_cau_id = null;
                $donHang->save();

                ThongBao::create([
                    'loai_nguoi_nhan' => 'KhachHang',
                    'nguoi_nhan_id' => $donHang->khach_hang_id,
                    'tieu_de' => '⚠️ Nhân viên từ chối lịch chỉ định',
                    'noi_dung' => 'Nhân viên ' . Auth::user()->nhanVien->ho_ten . ' không thể tham gia lịch chỉ định của bạn.' . $reasonText . ' Đơn hàng đã bị hủy theo yêu cầu không đổi nhân viên.',
                    'loai_doi_tuong' => 'DonHang',
                    'doi_tuong_id' => $donHang->id,
                    'ngay_tao' => now(),
                    'is_da_doc' => false
                ]);

                return response()->json(['success' => true, 'message' => 'Đã từ chối. Đơn hàng bị hủy do khách không muốn đổi nhân viên.']);
            } else {
                $ca->nhan_vien_id = null;
                $ca->trang_thai_ca = 'ChoNhanVienTuDoNhan'; // Đẩy ra chợ việc
                $ca->save();

                if ($donHang) {
                    $donHang->nhan_vien_duoc_yeu_cau_id = null;
                    $donHang->save();

                    ThongBao::create([
                        'loai_nguoi_nhan' => 'KhachHang',
                        'nguoi_nhan_id' => $donHang->khach_hang_id,
                        'tieu_de' => '⚠️ Nhân viên từ chối lịch chỉ định',
                        'noi_dung' => 'Nhân viên ' . Auth::user()->nhanVien->ho_ten . ' không thể tham gia lịch chỉ định của bạn.' . $reasonText . ' Lịch đã được chuyển sang chế độ tự do cho các nhân viên khác nhận.',
                        'loai_doi_tuong' => 'DonHang',
                        'doi_tuong_id' => $donHang->id,
                        'ngay_tao' => now(),
                        'is_da_doc' => false
                    ]);
                }

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

                ThongBao::create([
                    'loai_nguoi_nhan' => 'KhachHang',
                    'nguoi_nhan_id' => $ca->donHang->khach_hang_id,
                    'tieu_de' => '⭐ Ca làm việc đã hoàn thành',
                    'noi_dung' => 'Ca làm việc ngày ' . \Carbon\Carbon::parse($ca->ngay_lam)->format('d/m/Y') . ' đã được nhân viên ' . Auth::user()->nhanVien->ho_ten . ' hoàn thành. Hãy gửi phản hồi đánh giá nhé!',
                    'loai_doi_tuong' => 'DonHang',
                    'doi_tuong_id' => $ca->don_hang_id,
                    'ngay_tao' => now(),
                    'is_da_doc' => false
                ]);
            }
            
            return response()->json(['success' => true, 'message' => 'Đã hoàn thành ca làm việc']);
        }

        return response()->json(['success' => false, 'message' => 'Trạng thái ca không hợp lệ'], 400);
    }

    /**
     * Hủy ca làm việc đã nhận
     * Sau khi hủy, hệ thống tự động tìm NV thay thế (Auto-Reassignment).
     * Nếu tìm được → gán luôn cho NV đó. Nếu không → đẩy ra chợ việc.
     */
    public function cancelAcceptedJob(Request $request, $id)
    {
        $nhanVienId = Auth::user()->nhanVien->id;
        $ca = CaLamViec::with('donHang')->findOrFail($id);

        if ($ca->nhan_vien_id != $nhanVienId) {
            return response()->json(['success' => false, 'message' => 'Bạn không có quyền hủy ca này'], 403);
        }

        if ($ca->trang_thai_ca == 'DaNhan') {
            // Bước 1: Ghi nhận yêu cầu hủy vào YeuCauXuLy (TRƯỚC khi đổi trạng thái)
            \App\Models\YeuCauXuLy::create([
                'loai_cap_do_yeu_cau' => 'CaLam',
                'don_hang_id'         => null,
                'ca_lam_viec_id'      => $ca->id,
                'nguoi_yeu_cau_loai'  => 'NhanVien',
                'nguoi_yeu_cau_id'    => $nhanVienId,
                'loai_yeu_cau'        => 'HuyCaLe',
                'ly_do'               => $request->input('ly_do', 'Nhân viên hủy ca làm việc'),
                'trang_thai_duyet'    => 'DaDuyet',
                'so_tien_hoan_tra'    => 0,
                'so_tien_phat'        => 0,
                'thoi_gian'           => now()
            ]);

            // Bước 2: Thử tự động tìm NV thay thế trong bán kính 3km
            $replacementNv = $this->autoAssignCancelledCa($ca, $nhanVienId);

            $donHang = $ca->donHang ?? DonHang::find($ca->don_hang_id);
            $cancellerName = Auth::user()->nhanVien->ho_ten;
            $ngayHienThi = \Carbon\Carbon::parse($ca->ngay_lam)->format('d/m/Y');
            $gioHienThi  = \Carbon\Carbon::parse($ca->gio_bat_dau)->format('H:i');

            if ($replacementNv) {
                // ✅ Tìm được NV thay thế → gán ca trực tiếp
                $ca->nhan_vien_id  = $replacementNv->id;
                $ca->trang_thai_ca = 'DaNhan';
                $ca->save();

                \Log::info("[Auto-Reassign] Ca #{$ca->id} đã được gán cho NV #{$replacementNv->id} sau khi NV #{$nhanVienId} hủy.");

                if ($donHang) {
                    ThongBao::create([
                        'loai_nguoi_nhan' => 'KhachHang',
                        'nguoi_nhan_id'   => $donHang->khach_hang_id,
                        'tieu_de'         => '✅ Nhân viên thay thế đã được gán tự động',
                        'noi_dung'        => 'Nhân viên ' . $cancellerName . ' đã hủy ca ngày ' . $ngayHienThi . ' lúc ' . $gioHienThi . '. Hệ thống đã tự động tìm và gán nhân viên ' . ($replacementNv->taiKhoan->ho_ten ?? 'mới') . ' để thay thế. Bạn không cần lo lắng!',
                        'loai_doi_tuong'  => 'DonHang',
                        'doi_tuong_id'    => $donHang->id,
                        'ngay_tao'        => now(),
                        'is_da_doc'       => false
                    ]);
                }

                return response()->json(['success' => true, 'message' => 'Đã hủy nhận ca. Hệ thống đã tự động tìm và gán nhân viên thay thế cho khách hàng.']);
            } else {
                // ❌ Không tìm được NV phù hợp → đẩy ra chợ việc như cũ
                $ca->nhan_vien_id  = null;
                $ca->trang_thai_ca = 'ChoNhanVienTuDoNhan';
                $ca->save();

                if ($donHang) {
                    ThongBao::create([
                        'loai_nguoi_nhan' => 'KhachHang',
                        'nguoi_nhan_id'   => $donHang->khach_hang_id,
                        'tieu_de'         => '🚨 Nhân viên đã hủy ca làm việc',
                        'noi_dung'        => 'Nhân viên ' . $cancellerName . ' đã hủy nhận ca làm việc ngày ' . $ngayHienThi . ' lúc ' . $gioHienThi . '. Hệ thống đang tìm nhân viên thay thế — lịch của bạn đã được đẩy lên chợ việc để các nhân viên khác nhận.',
                        'loai_doi_tuong'  => 'DonHang',
                        'doi_tuong_id'    => $donHang->id,
                        'ngay_tao'        => now(),
                        'is_da_doc'       => false
                    ]);
                }

                return response()->json(['success' => true, 'message' => 'Đã hủy nhận ca. Lịch được đưa trở lại chợ việc.']);
            }
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
            \App\Models\YeuCauXuLy::create([
                'loai_cap_do_yeu_cau' => 'DonHang',
                'don_hang_id' => $don_hang_id,
                'ca_lam_viec_id' => null,
                'nguoi_yeu_cau_loai' => 'NhanVien',
                'nguoi_yeu_cau_id' => $nhanVienId,
                'loai_yeu_cau' => 'HuyDonToanGoi',
                'ly_do' => $request->input('ly_do', 'Nhân viên hủy hợp đồng làm việc'),
                'trang_thai_duyet' => 'DaDuyet',
                'so_tien_hoan_tra' => 0,
                'so_tien_phat' => 0,
                'thoi_gian' => now()
            ]);

            $donHang = DonHang::find($don_hang_id);
            if ($donHang) {
                ThongBao::create([
                    'loai_nguoi_nhan' => 'KhachHang',
                    'nguoi_nhan_id' => $donHang->khach_hang_id,
                    'tieu_de' => '🚨 Nhân viên đã hủy hợp đồng làm việc',
                    'noi_dung' => 'Nhân viên ' . Auth::user()->nhanVien->ho_ten . ' đã hủy tiếp tục thực hiện các ca làm việc còn lại của hợp đồng #' . $don_hang_id . '. Các lịch chưa làm đã được đẩy lại lên chợ việc.',
                    'loai_doi_tuong' => 'DonHang',
                    'doi_tuong_id' => $don_hang_id,
                    'ngay_tao' => now(),
                    'is_da_doc' => false
                ]);
            }

            return response()->json(['success' => true, 'message' => "Đã hủy toàn bộ $affectedRows ca làm việc còn lại của hợp đồng. Lịch đã được đẩy lên chợ việc."]);
        }

        return response()->json(['success' => false, 'message' => 'Không có ca làm việc nào chưa bắt đầu để hủy'], 400);
    }

    /**
     * Thống kê hủy ca trong tháng (trực tiếp từ bảng YeuCauXuLy)
     */
    public function getCancelStatistics(Request $request)
    {
        $nhanVienId = Auth::user()->nhanVien->id;
        $month = (int) $request->input('month', date('m'));
        $year = (int) $request->input('year', date('Y'));

        $startOfMonth = \Carbon\Carbon::createFromDate($year, $month, 1)->startOfDay();
        $endOfMonth = (clone $startOfMonth)->endOfMonth()->endOfDay();

        $list = \App\Models\YeuCauXuLy::where('nguoi_yeu_cau_loai', 'NhanVien')
            ->where('nguoi_yeu_cau_id', $nhanVienId)
            ->whereIn('loai_yeu_cau', ['HuyCaLe', 'HuyDonToanGoi'])
            ->whereBetween('thoi_gian', [$startOfMonth, $endOfMonth])
            ->orderBy('thoi_gian', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'count' => $list->count(),
            'data' => $list,
            'start_date' => $startOfMonth->format('d/m/Y'),
            'end_date' => $endOfMonth->format('d/m/Y')
        ]);
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

    /**
     * Thuật toán Auto-Reassignment: Tìm NV thay thế khi NV hủy ca lẻ.
     * Trả về đối tượng NhanVien phù hợp nhất (gần nhất trong 3km), hoặc null nếu không tìm được.
     *
     * Điều kiện NV thay thế hợp lệ:
     *  1. Có dịch vụ được duyệt khớp với ca
     *  2. Không phải NV vừa hủy
     *  3. Chưa từng hủy ca này (blacklist YeuCauXuLy)
     *  4. Có LichNghi DinhKy bao phủ ngày đó & không bị nghỉ định kỳ/đột xuất
     *  5. Không có CaLamViec trùng giờ (buffer ±1 tiếng)
     *  6. Tọa độ trong bán kính 3km từ ca liền kề cùng ngày (hoặc nhà nếu trống lịch)
     */
    private function autoAssignCancelledCa(CaLamViec $ca, int $cancelledByNhanVienId): ?\App\Models\NhanVien
    {
        try {
            $ngayLam        = $ca->ngay_lam;
            $gioBatDau      = $ca->gio_bat_dau;
            $thoiGianPhut   = $ca->thoi_gian_lam_phut;
            $dichVuId       = $ca->dich_vu_id;

            $donHang = $ca->donHang ?? DonHang::find($ca->don_hang_id);
            if (!$donHang) return null;

            $latKhach = (float) $donHang->vi_do;
            $lngKhach = (float) $donHang->kinh_do;
            if (!$latKhach || !$lngKhach) return null; // Không có tọa độ → bỏ qua

            $startDt      = \Carbon\Carbon::parse($ngayLam . ' ' . $gioBatDau);
            $endDt        = (clone $startDt)->addMinutes($thoiGianPhut);
            $bufferStart  = (clone $startDt)->subMinutes(60); // Trừ 1 tiếng đệm
            $bufferEnd    = (clone $endDt)->addMinutes(60);   // Cộng 1 tiếng đệm
            $dow          = (int) date('w', strtotime($ngayLam)); // 0=CN, 6=T7

            // ── Bước 1: Lấy danh sách NV có kỹ năng phù hợp ──────────────────
            $candidateIds = \Illuminate\Support\Facades\DB::table('NhanVien_DichVu')
                ->where('dich_vu_id', $dichVuId)
                ->where('trang_thai_duyet', 'DaDuyet')
                ->where('nhan_vien_id', '!=', $cancelledByNhanVienId)
                ->pluck('nhan_vien_id')
                ->toArray();

            if (empty($candidateIds)) return null;

            // ── Bước 2: Lọc blacklist (NV đã từng hủy ca này) ─────────────────
            $blacklistedIds = \App\Models\YeuCauXuLy::where('nguoi_yeu_cau_loai', 'NhanVien')
                ->where('ca_lam_viec_id', $ca->id)
                ->pluck('nguoi_yeu_cau_id')
                ->toArray();
            $candidateIds = array_diff($candidateIds, $blacklistedIds);
            if (empty($candidateIds)) return null;

            // ── Bước 3: Lọc theo LichNghi, DotXuat, trùng giờ ────────────────
            $validIds = [];
            foreach ($candidateIds as $nvId) {
                // 3a. Phải có LichNghi DinhKy bao phủ ngay_lam
                $lichNghiList = \App\Models\LichNghi::where('nhan_vien_id', $nvId)
                    ->where('loai_nghi', 'DinhKy')
                    ->get();
                if ($lichNghiList->isEmpty()) continue;

                $startDate = $lichNghiList->min('ngay_bat_dau_ap_dung');
                $endDate   = $lichNghiList->max('ngay_ket_thuc_ap_dung');
                if ($ngayLam < $startDate || $ngayLam > $endDate) continue;

                // 3b. Ngày đó không phải ngày nghỉ định kỳ trong tuần
                $offDows = $lichNghiList->pluck('thu_trong_tuan')->filter()->toArray();
                if (in_array($dow, $offDows)) continue;

                // 3c. Không có DotXuat block cho ngày đó
                $hasBlock = \App\Models\LichNghi::where('nhan_vien_id', $nvId)
                    ->where('loai_nghi', 'DotXuat')
                    ->where('ngay_nghi', $ngayLam)
                    ->exists();
                if ($hasBlock) continue;

                // 3d. Khung giờ ca không chồng lên giờ nghỉ định kỳ
                $nghiEntry = $lichNghiList->firstWhere('thu_trong_tuan', null);
                if ($nghiEntry && $nghiEntry->gio_bat_dau_nghi && $nghiEntry->gio_ket_thuc_nghi) {
                    $rS = \Carbon\Carbon::parse($nghiEntry->gio_bat_dau_nghi);
                    $rE = \Carbon\Carbon::parse($nghiEntry->gio_ket_thuc_nghi);
                    if ($rS <= $rE) {
                        $intersects = ($startDt->format('H:i:s') < $rE->format('H:i:s') && $endDt->format('H:i:s') > $rS->format('H:i:s'));
                    } else {
                        $intersects = ($startDt->format('H:i:s') > $rS->format('H:i:s') || $endDt->format('H:i:s') < $rE->format('H:i:s'));
                    }
                    if ($intersects) continue;
                }

                // 3e. Không có CaLamViec nào trùng giờ (buffer ±1 tiếng)
                $existingCas = CaLamViec::where('nhan_vien_id', $nvId)
                    ->whereIn('trang_thai_ca', ['DaNhan', 'DangThucHien'])
                    ->where('ngay_lam', $ngayLam)
                    ->get(['gio_bat_dau', 'thoi_gian_lam_phut']);

                $hasOverlap = $existingCas->contains(function ($ex) use ($bufferStart, $bufferEnd, $ngayLam) {
                    $exStart = \Carbon\Carbon::parse($ngayLam . ' ' . $ex->gio_bat_dau);
                    $exEnd   = (clone $exStart)->addMinutes($ex->thoi_gian_lam_phut);
                    return $exStart < $bufferEnd && $exEnd > $bufferStart;
                });
                if ($hasOverlap) continue;

                $validIds[] = $nvId;
            }

            if (empty($validIds)) return null;

            // ── Bước 4: Spatial check – chọn NV gần nhất trong 3km ───────────
            $bestNv   = null;
            $bestDist = PHP_INT_MAX;

            foreach ($validIds as $nvId) {
                $nv = \App\Models\NhanVien::with('taiKhoan')->find($nvId);
                if (!$nv) continue;

                // Tìm ca liền kề cùng ngày để dùng làm điểm tham chiếu
                $sameDayShifts = CaLamViec::where('nhan_vien_id', $nvId)
                    ->whereIn('trang_thai_ca', ['DaNhan', 'DangThucHien'])
                    ->where('ngay_lam', $ngayLam)
                    ->orderBy('gio_bat_dau')
                    ->get();

                $refLat = null;
                $refLng = null;

                if ($sameDayShifts->isEmpty()) {
                    // Không có ca nào trong ngày → dùng tọa độ nhà
                    $refLat = (float) $nv->vi_do;
                    $refLng = (float) $nv->kinh_do;
                } else {
                    // Có ca khác → tìm ca liền kề gần nhất theo thời gian
                    $newStartMin = $startDt->hour * 60 + $startDt->minute;
                    $newEndMin   = $endDt->hour * 60 + $endDt->minute;
                    $minGap      = PHP_INT_MAX;
                    $closestShift = null;

                    foreach ($sameDayShifts as $s) {
                        $sStart  = \Carbon\Carbon::parse($ngayLam . ' ' . $s->gio_bat_dau);
                        $sEnd    = (clone $sStart)->addMinutes($s->thoi_gian_lam_phut);
                        $sStartM = $sStart->hour * 60 + $sStart->minute;
                        $sEndM   = $sEnd->hour * 60 + $sEnd->minute;
                        $gap     = min(abs($newStartMin - $sEndM), abs($sStartM - $newEndMin));
                        if ($gap < $minGap) {
                            $minGap       = $gap;
                            $closestShift = $s;
                        }
                    }

                    if ($closestShift) {
                        $adjDonHang = DonHang::find($closestShift->don_hang_id);
                        if ($adjDonHang) {
                            $refLat = (float) $adjDonHang->vi_do;
                            $refLng = (float) $adjDonHang->kinh_do;
                        }
                    }

                    // Fallback sang nhà nếu ca liền kề không có tọa độ
                    if (!$refLat || !$refLng) {
                        $refLat = (float) $nv->vi_do;
                        $refLng = (float) $nv->kinh_do;
                    }
                }

                if (!$refLat || !$refLng) continue; // Vẫn không có tọa độ → bỏ qua

                $dist = $this->haversineDistance($refLat, $refLng, $latKhach, $lngKhach);

                if ($dist <= 3000 && $dist < $bestDist) {
                    $bestDist = $dist;
                    $bestNv   = $nv;
                }
            }

            return $bestNv;
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('[Auto-Reassign] Lỗi tìm NV thay thế: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Tính khoảng cách Haversine (mặt cầu) giữa 2 tọa độ GPS, trả về đơn vị mét.
     */
    private function haversineDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $R    = 6371000; // Bán kính Trái Đất (mét)
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a    = sin($dLat / 2) ** 2
              + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        return $R * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
