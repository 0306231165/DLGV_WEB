<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OperationTransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();
        
        // ══════════════════════════════════════════════════════════════════
        // 24. DonHang
        // ══════════════════════════════════════════════════════════════════
        $donHangs = [];
        
        // Dữ liệu mẫu tương ứng với HISTORY_DATA trong BookingHistoryPage.jsx
        $historyData = [
            ['id' => 1, 'dich_vu_loai_goi_id' => 3, 'tuy_chon_bien_the_id' => 7, 'trang_thai' => 'DaHoanThanh', 'ngay' => '2023-10-15', 'gio' => '08:00:00', 'tong_tien' => 1250000, 'dia_chi' => 'Vinhomes Central Park, Q.Bình Thạnh', 'dich_vu_id' => 3],
            ['id' => 2, 'dich_vu_loai_goi_id' => 1, 'tuy_chon_bien_the_id' => 1, 'trang_thai' => 'DaHoanThanh', 'ngay' => '2023-10-14', 'gio' => '09:00:00', 'tong_tien' => 450000,  'dia_chi' => 'Chung cư Sunrise City, Quận 7', 'dich_vu_id' => 1],
            ['id' => 3, 'dich_vu_loai_goi_id' => 14, 'tuy_chon_bien_the_id' => 15, 'trang_thai' => 'DaHoanThanh', 'ngay' => '2023-10-12', 'gio' => '14:00:00', 'tong_tien' => 750000,  'dia_chi' => 'Masteri Thảo Điền, Quận 2', 'dich_vu_id' => 9],
            ['id' => 4, 'dich_vu_loai_goi_id' => 22, 'tuy_chon_bien_the_id' => 24, 'trang_thai' => 'DaHoanThanh', 'ngay' => '2023-10-08', 'gio' => '13:00:00', 'tong_tien' => 2200000, 'dia_chi' => 'Tòa nhà Bitexco, Quận 1', 'dich_vu_id' => 13],
            ['id' => 5, 'dich_vu_loai_goi_id' => 12, 'tuy_chon_bien_the_id' => 13, 'trang_thai' => 'DaHoanThanh', 'ngay' => '2023-10-03', 'gio' => '09:00:00', 'tong_tien' => 350000,  'dia_chi' => 'Chung cư Hà Đô, Quận 10', 'dich_vu_id' => 8],
            ['id' => 6, 'dich_vu_loai_goi_id' => 1, 'tuy_chon_bien_the_id' => 1, 'trang_thai' => 'DaHuy',       'ngay' => '2023-10-02', 'gio' => '14:00:00', 'tong_tien' => 450000,  'dia_chi' => 'Masteri Thảo Điền, Quận 2', 'dich_vu_id' => 1],
        ];

        foreach ($historyData as $item) {
            $donHangs[] = [
                'id' => $item['id'],
                'khach_hang_id' => 1, // Mặc định khách hàng 1
                'dich_vu_loai_goi_id' => $item['dich_vu_loai_goi_id'],
                'tuy_chon_bien_the_id' => $item['tuy_chon_bien_the_id'],
                'so_luong_tuy_chon' => 1,
                'khuyen_mai_id' => null,
                'nhan_vien_duoc_yeu_cau_id' => null,
                
                'phuong_an_thay_the' => 'standard',
                'is_giu_nhan_vien' => false,
                'tong_so_buoi' => 1,
                'is_lap_lai_hang_tuan' => false,
                'cac_ngay_trong_tuan' => null,
                'gio_lam_mac_dinh' => null,
                'so_thang_goi_thang' => null,
                'ca_lam_247' => null,
                'so_ngay_goi_247' => null,
                'tld_giam_goi_thang' => 0,
                
                'ngay_bat_dau' => $item['ngay'],
                'ngay_ket_thuc' => $item['ngay'],
                'ho_ten_thuc_te' => 'Nguyễn Văn An',
                'sdt_thuc_te' => '0901234567',
                'dia_chi_thuc_te' => $item['dia_chi'],
                'ghi_chu_cho_nhan_vien' => null,
                
                'is_cao_cap' => false,
                'ty_le_phu_phi_cao_cap_snapshot' => 0,
                'phu_phi_cao_cap' => 0,
                'co_thu_cung' => false,
                'uu_tien_nv_yt' => false,
                'phu_phi_chon_nhan_vien' => 0,
                'don_gia_co_ban' => $item['tong_tien'],
                'tong_tien_ban_dau' => $item['tong_tien'],
                'phu_phi_dat_gap' => 0,
                'tong_tien_cuoi_cung' => $item['tong_tien'],
                'tien_giam_giu' => 0,
                
                'phuong_thuc_tt' => 'TienMat',
                'trang_thai_thanh_toan' => $item['trang_thai'] === 'DaHoanThanh' ? 'DaThanhToan' : 'ChuaThanhToan',
                'ma_giao_dich_online' => null,
                'trang_thai_don' => $item['trang_thai'],
                'ngay_tao' => Carbon::parse($item['ngay'])->subDays(2),
            ];
        }
        
        DB::table('DonHang')->insert($donHangs);

        // ══════════════════════════════════════════════════════════════════
        // 26. CaLamViec
        // ══════════════════════════════════════════════════════════════════
        $caLamViecs = [];
        foreach ($historyData as $index => $item) {
            $caLamViecs[] = [
                'id' => $index + 1,
                'don_hang_id' => $item['id'],
                'nhan_vien_id' => $item['trang_thai'] === 'DaHoanThanh' ? 1 : null, // Gán cho nhân viên 1 nếu hoàn thành
                'dich_vu_id' => $item['dich_vu_id'],
                
                'chi_tiet_dich_vu_them' => null,
                
                'ngay_lam' => $item['ngay'],
                'gio_bat_dau' => $item['gio'],
                'thoi_gian_lam_phut' => 120, // Giả sử 2 tiếng
                'loai_goi_ca_lam' => 'CaLe',
                'dia_chi_lam_viec' => $item['dia_chi'],
                
                'gia_ca_nay' => $item['tong_tien'],
                'hoa_hong_app' => $item['tong_tien'] * 0.2, // 20%
                'thuc_nhan_nv' => $item['tong_tien'] * 0.8, // 80%
                
                'trang_thai_ca' => $item['trang_thai'] === 'DaHoanThanh' ? 'DaHoanThanh' : 'KhachHuy',
                'thoi_gian_day_len_cho' => Carbon::parse($item['ngay'])->subDays(2),
                'loai_ghep' => 'TuDong',
                
                'thoi_gian_checkin' => $item['trang_thai'] === 'DaHoanThanh' ? Carbon::parse($item['ngay'] . ' ' . $item['gio']) : null,
                'thoi_gian_checkout' => $item['trang_thai'] === 'DaHoanThanh' ? Carbon::parse($item['ngay'] . ' ' . $item['gio'])->addMinutes(120) : null,
                'hinh_anh_xac_minh' => null,
                
                'sao_danh_gia' => $item['trang_thai'] === 'DaHoanThanh' ? 5 : null,
                'noi_dung_danh_gia' => $item['trang_thai'] === 'DaHoanThanh' ? 'Làm rất tốt, sạch sẽ.' : null,
                'ngay_danh_gia' => $item['trang_thai'] === 'DaHoanThanh' ? Carbon::parse($item['ngay'])->addDays(1) : null,
            ];
        }

        DB::table('CaLamViec')->insert($caLamViecs);

        // ══════════════════════════════════════════════════════════════════
        // 28. GiaoDichVi (MOCK_TRANSACTIONS trong WalletPage.jsx)
        // ══════════════════════════════════════════════════════════════════
        DB::table('GiaoDichVi')->insert([
            ['id' => 1, 'vi_tien_id' => 1, 'vi_he_thong_id' => 1, 'ma_giao_dich' => 'TXN-001', 'loai_giao_dich' => 'NapTien',     'loai_bien_dong' => 'Tang', 'so_tien' => 500000, 'so_du_sau_giao_dich' => 850000, 'ma_tham_chieu_he_thong' => null, 'noi_dung' => 'Nạp tiền vào ví',                           'trang_thai' => 'ThanhCong', 'thoi_gian' => '2026-06-05 14:20:00'],
            ['id' => 2, 'vi_tien_id' => 1, 'vi_he_thong_id' => 1,    'ma_giao_dich' => 'TXN-002', 'loai_giao_dich' => 'ThanhToanDonHang',   'loai_bien_dong' => 'Giam', 'so_tien' => 425000, 'so_du_sau_giao_dich' => 425000, 'ma_tham_chieu_he_thong' => 1,    'noi_dung' => 'Thanh toán lịch hẹn CLN-20240001',        'trang_thai' => 'ThanhCong', 'thoi_gian' => '2026-06-04 08:30:00'],
            ['id' => 3, 'vi_tien_id' => 1, 'vi_he_thong_id' => 2,    'ma_giao_dich' => 'TXN-003', 'loai_giao_dich' => 'HoanTien',    'loai_bien_dong' => 'Tang', 'so_tien' => 200000, 'so_du_sau_giao_dich' => 625000, 'ma_tham_chieu_he_thong' => 2,    'noi_dung' => 'Hoàn tiền hủy lịch hẹn CLN-20240009',     'trang_thai' => 'ThanhCong', 'thoi_gian' => '2026-06-02 17:00:00'],
            ['id' => 4, 'vi_tien_id' => 1, 'vi_he_thong_id' => 2, 'ma_giao_dich' => 'TXN-004', 'loai_giao_dich' => 'RutTien',     'loai_bien_dong' => 'Giam', 'so_tien' => 200000, 'so_du_sau_giao_dich' => 425000, 'ma_tham_chieu_he_thong' => null, 'noi_dung' => 'Rút tiền về tài khoản ngân hàng',             'trang_thai' => 'DangXuLy',  'thoi_gian' => '2026-05-30 11:15:00'],
            ['id' => 5, 'vi_tien_id' => 1, 'vi_he_thong_id' => 1, 'ma_giao_dich' => 'TXN-005', 'loai_giao_dich' => 'RutTien',     'loai_bien_dong' => 'Giam', 'so_tien' => 100000, 'so_du_sau_giao_dich' => 325000, 'ma_tham_chieu_he_thong' => null, 'noi_dung' => 'Rút tiền về tài khoản ngân hàng',             'trang_thai' => 'ThanhCong', 'thoi_gian' => '2026-05-25 09:00:00'],
        ]);
    }
}
