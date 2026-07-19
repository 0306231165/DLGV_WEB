<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * StatisticsDataSeeder
 *
 * Tạo 100+ DonHang + CaLamViec đã hoàn thành trong năm 2026
 * phân bổ theo từng tháng, nhiều nhân viên khác nhau,
 * phục vụ màn hình thống kê Admin.
 *
 * Phân loại nhân viên (theo dữ liệu NhanVien hiện có):
 *   - Top performer     : NV ID 4, 7, 10  (nhiều ca nhất)
 *   - Trung bình - cao  : NV ID 1, 2, 15, 18
 *   - Trung bình        : NV ID 3, 5, 6, 9, 12
 *   - Lẻ tẻ / ít ca    : NV ID 8, 11, 13, 14, 16, 17, 19, 20
 *
 * Cấu trúc dữ liệu:
 *   - DonHang ID bắt đầu từ 7 (tránh trùng với OperationTransactionSeeder)
 *   - CaLamViec ID bắt đầu từ 7 (tương tự)
 *   - trang_thai_don = DaHoanThanh, trang_thai_ca = DaHoanThanh
 */
class StatisticsDataSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Mapping dịch vụ & biến thể ───────────────────────────────────
        // [dich_vu_loai_goi_id, tuy_chon_bien_the_id, dich_vu_id, don_gia, thoi_gian_phut]
        $serviceVariants = [
            [1,  1,  1, 200000, 120],  // Dọn hằng ngày - Dưới 55m²
            [1,  2,  1, 260000, 180],  // Dọn hằng ngày - 55-85m²
            [1,  3,  1, 350000, 240],  // Dọn hằng ngày - 85-120m²
            [2,  4,  2, 180000, 120],  // Dọn định kỳ - Dưới 55m²
            [2,  5,  2, 234000, 180],  // Dọn định kỳ - 55-85m²
            [3,  7,  3, 450000, 180],  // Tổng vệ sinh - Dưới 60m²
            [3,  8,  3, 549000, 240],  // Tổng vệ sinh - 60-80m²
            [3,  9,  3, 751500, 360],  // Tổng vệ sinh - 80-150m²
            [12, 13, 8, 180000, 60],   // Máy lạnh - Treo tường
            [14, 15, 9, 250000, 120],  // Sofa vải
            [16, 17, 10, 300000, 90],  // Nệm cao su
            [18, 19, 11, 220000, 120], // Bếp tiêu chuẩn
            [20, 21, 12, 200000, 60],  // Thảm nhỏ
            [22, 23, 13, 160000, 120], // Văn phòng nhỏ
            [22, 24, 13, 280000, 180], // Văn phòng vừa
        ];

        // ─── Địa chỉ thực tế ──────────────────────────────────────────────
        $addresses = [
            ['dia_chi' => 'Vinhomes Central Park, Q.Bình Thạnh, TP.HCM',    'vi_do' => 10.797, 'kinh_do' => 106.720],
            ['dia_chi' => 'Sunrise City, Quận 7, TP.HCM',                   'vi_do' => 10.734, 'kinh_do' => 106.700],
            ['dia_chi' => 'Masteri Thảo Điền, Quận 2, TP.HCM',              'vi_do' => 10.802, 'kinh_do' => 106.738],
            ['dia_chi' => 'Landmark 81, Q.Bình Thạnh, TP.HCM',              'vi_do' => 10.795, 'kinh_do' => 106.722],
            ['dia_chi' => 'The Sun Avenue, Quận 2, TP.HCM',                 'vi_do' => 10.778, 'kinh_do' => 106.736],
            ['dia_chi' => 'Saigon Pearl, Q.Bình Thạnh, TP.HCM',             'vi_do' => 10.791, 'kinh_do' => 106.715],
            ['dia_chi' => 'Hoàng Anh Gia Lai, Quận 7, TP.HCM',             'vi_do' => 10.727, 'kinh_do' => 106.698],
            ['dia_chi' => 'Him Lam Riverside, Quận 7, TP.HCM',              'vi_do' => 10.736, 'kinh_do' => 106.705],
            ['dia_chi' => 'Lexington Residence, Quận 2, TP.HCM',            'vi_do' => 10.795, 'kinh_do' => 106.743],
            ['dia_chi' => 'Chung cư Hà Đô, Quận 10, TP.HCM',               'vi_do' => 10.773, 'kinh_do' => 106.660],
            ['dia_chi' => 'Celadon City, Q.Tân Phú, TP.HCM',               'vi_do' => 10.757, 'kinh_do' => 106.617],
            ['dia_chi' => 'Richstar Residence, Q.Tân Phú, TP.HCM',         'vi_do' => 10.761, 'kinh_do' => 106.624],
            ['dia_chi' => 'Estella Heights, Quận 2, TP.HCM',                'vi_do' => 10.790, 'kinh_do' => 106.749],
            ['dia_chi' => 'Kingston Residence, Q.Bình Thạnh, TP.HCM',      'vi_do' => 10.788, 'kinh_do' => 106.706],
            ['dia_chi' => 'Botanica Premier, Q.Tân Bình, TP.HCM',          'vi_do' => 10.784, 'kinh_do' => 106.660],
        ];

        // ─── Tên khách hàng mẫu ───────────────────────────────────────────
        $customerNames = [
            'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Minh Cường', 'Phạm Thu Dung',
            'Hoàng Văn Em', 'Vũ Thị Phương', 'Đặng Quốc Giang', 'Bùi Thị Hoa',
            'Phan Minh Hùng', 'Ngô Thị Kim', 'Đinh Văn Long', 'Trương Thị Mai',
        ];

        $customerSdts = [
            '0901234567', '0912345678', '0923456789', '0934567890',
            '0945678901', '0956789012', '0967890123', '0978901234',
            '0989012345', '0990123456', '0971234568', '0982345679',
        ];

        // ─── Phân loại nhân viên theo hiệu suất ───────────────────────────
        // Format: [nhan_vien_id => so_ca_target_trong_nam]
        $staffDistribution = [
            // Top performer — nhiều ca nhất
            4  => 22,
            7  => 20,
            10 => 18,
            // Trung bình - cao
            1  => 14,
            2  => 12,
            15 => 11,
            18 => 10,
            // Trung bình
            3  => 7,
            5  => 6,
            6  => 6,
            9  => 5,
            12 => 5,
            // Lẻ tẻ / ít ca
            8  => 3,
            11 => 3,
            13 => 2,
            14 => 2,
            16 => 1,
            17 => 1,
            // 19, 20 không có ca (nhân viên mới)
        ];

        // ─── Phân bổ ca theo tháng (tỷ lệ %) ─────────────────────────────
        // T1 thấp (Tết), T3-T5 tăng, T6-T7 đỉnh cao, T8-T10 ổn định, T11-T12 giảm
        $monthWeights = [
            1 => 0.04, 2 => 0.06, 3 => 0.09, 4 => 0.10,
            5 => 0.11, 6 => 0.12, 7 => 0.12, 8 => 0.10, 9 => 0.09,
            10 => 0.08, 11 => 0.05, 12 => 0.04,
        ];

        // Các khung giờ làm việc phổ biến
        $timeSlots = [
            '08:00:00', '09:00:00', '10:00:00', '13:00:00',
            '14:00:00', '15:00:00', '07:30:00', '08:30:00',
        ];

        // ─── Xây dựng danh sách ca theo từng nhân viên + tháng ───────────
        $donHangs   = [];
        $caLamViecs = [];

        $donHangId  = 7;  // Bắt đầu từ ID 7 (sau 6 records của OperationTransactionSeeder)
        $caLamViecId = 7; // Tương tự
        $kh_index   = 0;
        $addr_index = 0;
        $svc_index  = 0;

        // Tháng hiện tại (chỉ seed đến tháng đã qua hoặc tháng hiện tại)
        $currentMonth = 7; // Tháng 7/2026 là mốc hiện tại

        foreach ($staffDistribution as $nvId => $totalCa) {
            $remaining = $totalCa;

            foreach ($monthWeights as $month => $weight) {
                if ($month > $currentMonth) break; // Không seed tương lai

                // Số ca của tháng này = weight * tổng ca (làm tròn, tối thiểu 1 nếu còn ca)
                $caThisMonth = (int) round($totalCa * $weight);
                if ($caThisMonth === 0 && $remaining > 0 && $weight > 0) {
                    $caThisMonth = 0; // OK nếu = 0
                }
                $caThisMonth = min($caThisMonth, $remaining);
                if ($caThisMonth <= 0) continue;

                // Số ngày trong tháng để rải đều
                $daysInMonth = Carbon::create(2026, $month, 1)->daysInMonth;

                for ($c = 0; $c < $caThisMonth; $c++) {
                    // Chọn ngày ngẫu nhiên trong tháng (không trùng ngày chủ nhật liên tục)
                    $day = (($c * 3 + $nvId * 7 + 11) % ($daysInMonth - 1)) + 1;
                    $day = max(1, min($day, $daysInMonth));

                    $ngayLam = Carbon::create(2026, $month, $day)->toDateString();
                    $ngayTao = Carbon::create(2026, $month, $day)->subDays(2)->toDateString();

                    // Chọn dịch vụ xoay vòng
                    $svc     = $serviceVariants[$svc_index % count($serviceVariants)];
                    $svc_index++;
                    [$loaiGoiId, $bienTheId, $dichVuId, $donGia, $thoiGianPhut] = $svc;

                    // Chọn địa chỉ xoay vòng
                    $addr     = $addresses[$addr_index % count($addresses)];
                    $addr_index++;

                    // Chọn khách hàng (KhachHang ID 1-5)
                    $khachHangId = ($kh_index % 5) + 1;
                    $kh_index++;
                    $customerName = $customerNames[$khachHangId - 1] ?? 'Nguyễn Văn An';
                    $customerSdt  = $customerSdts[$khachHangId - 1] ?? '0901234567';

                    // Chọn giờ làm
                    $gioBatDau = $timeSlots[($c + $nvId) % count($timeSlots)];

                    // Phí hoa hồng & thực nhận
                    $hoaHong  = (int) round($donGia * 0.20);
                    $thucNhan = $donGia - $hoaHong;

                    // Rating: top performer = 4.9-5.0, trung bình = 4.5-4.9, lẻ tẻ = 4.0-4.8
                    if (in_array($nvId, [4, 7, 10])) {
                        $sao = ($c % 5 === 0) ? 4.9 : 5.0;
                    } elseif (in_array($nvId, [1, 2, 15, 18])) {
                        $sao = ($c % 3 === 0) ? 4.7 : 4.9;
                    } else {
                        $sao = ($c % 4 === 0) ? 4.0 : 4.5;
                    }

                    $reviewTexts = [
                        'Nhân viên làm rất sạch, đúng giờ, chu đáo!',
                        'Dịch vụ tốt, giá hợp lý. Sẽ dùng lại.',
                        'Nhà sạch bóng, thơm tho. Cảm ơn bạn nhiều!',
                        'Làm việc cẩn thận, tỉ mỉ. Hài lòng lắm.',
                        'Đúng giờ, thái độ vui vẻ, kết quả xuất sắc.',
                        'Nhanh, sạch, đúng yêu cầu. Rất ổn.',
                    ];
                    $reviewText = $reviewTexts[($nvId + $c) % count($reviewTexts)];

                    // ── DonHang ──
                    $donHangs[] = [
                        'id'                          => $donHangId,
                        'khach_hang_id'               => $khachHangId,
                        'vi_do'                       => $addr['vi_do'],
                        'kinh_do'                     => $addr['kinh_do'],
                        'dich_vu_loai_goi_id'         => $loaiGoiId,
                        'tuy_chon_bien_the_id'        => $bienTheId,
                        'so_luong_tuy_chon'           => 1,
                        'khuyen_mai_id'               => null,
                        'nhan_vien_duoc_yeu_cau_id'   => null,
                        'phuong_an_thay_the'          => 'TimNhanVienTieuChuan',
                        'is_giu_nhan_vien'            => false,
                        'tong_so_buoi'                => 1,
                        'is_lap_lai_hang_tuan'        => false,
                        'cac_ngay_trong_tuan'         => null,
                        'gio_lam_mac_dinh'            => null,
                        'so_thang_goi_thang'          => null,
                        'ca_lam_247'                  => null,
                        'so_ngay_goi_247'             => null,
                        'tld_giam_goi_thang'          => 0,
                        'ngay_bat_dau'                => $ngayLam,
                        'ngay_ket_thuc'               => $ngayLam,
                        'ho_ten_thuc_te'              => $customerName,
                        'sdt_thuc_te'                 => $customerSdt,
                        'dia_chi_thuc_te'             => $addr['dia_chi'],
                        'ghi_chu_cho_nhan_vien'       => null,
                        'is_cao_cap'                  => false,
                        'ty_le_phu_phi_cao_cap_snapshot' => 0,
                        'phu_phi_cao_cap'             => 0,
                        'co_thu_cung'                 => false,
                        'uu_tien_nv_yt'               => false,
                        'phu_phi_chon_nhan_vien'      => 0,
                        'don_gia_co_ban'              => $donGia,
                        'tong_tien_ban_dau'           => $donGia,
                        'phu_phi_dat_gap'             => 0,
                        'tong_tien_cuoi_cung'         => $donGia,
                        'tien_giam_giu'               => 0,
                        'phuong_thuc_tt'              => 'Online',
                        'trang_thai_thanh_toan'       => 'DaThanhToan',
                        'ma_giao_dich_online'         => null,
                        'trang_thai_don'              => 'DaHoanThanh',
                        'ngay_tao'                    => $ngayTao,
                    ];

                    // ── CaLamViec ──
                    $checkin  = Carbon::parse("$ngayLam $gioBatDau");
                    $checkout = (clone $checkin)->addMinutes($thoiGianPhut);

                    $caLamViecs[] = [
                        'id'                   => $caLamViecId,
                        'don_hang_id'          => $donHangId,
                        'nhan_vien_id'         => $nvId,
                        'dich_vu_id'           => $dichVuId,
                        'chi_tiet_dich_vu_them'=> null,
                        'ngay_lam'             => $ngayLam,
                        'gio_bat_dau'          => $gioBatDau,
                        'thoi_gian_lam_phut'   => $thoiGianPhut,
                        'loai_goi_ca_lam'      => 'CaLe',
                        'dia_chi_lam_viec'     => $addr['dia_chi'],
                        'gia_ca_nay'           => $donGia,
                        'hoa_hong_app'         => $hoaHong,
                        'thuc_nhan_nv'         => $thucNhan,
                        'trang_thai_ca'        => 'DaHoanThanh',
                        'thoi_gian_day_len_cho'=> Carbon::parse($ngayTao . ' 07:00:00'),
                        'loai_ghep'            => 'TuDong',
                        'thoi_gian_checkin'    => $checkin,
                        'thoi_gian_checkout'   => $checkout,
                        'hinh_anh_xac_minh'   => null,
                        'sao_danh_gia'         => $sao,
                        'noi_dung_danh_gia'    => $reviewText,
                        'ngay_danh_gia'        => Carbon::parse($ngayLam)->addDay(),
                    ];

                    $donHangId++;
                    $caLamViecId++;
                    $remaining--;
                }
            }
        }

        // ─── Insert theo batch 50 records để tránh timeout ────────────────
        $chunkSize = 50;

        foreach (array_chunk($donHangs, $chunkSize) as $chunk) {
            DB::table('DonHang')->insert($chunk);
        }

        foreach (array_chunk($caLamViecs, $chunkSize) as $chunk) {
            DB::table('CaLamViec')->insert($chunk);
        }

        $totalDon = count($donHangs);
        $totalCa  = count($caLamViecs);
        $this->command->info("✅ StatisticsDataSeeder: Đã tạo $totalDon DonHang + $totalCa CaLamViec (DaHoanThanh) cho năm 2026.");
    }
}
