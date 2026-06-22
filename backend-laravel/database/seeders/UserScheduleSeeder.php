<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ══════════════════════════════════════════════════════════════════
        // 14. KhachHang (ID 1-5 từ bảng TaiKhoan)
        // ══════════════════════════════════════════════════════════════════
        DB::table('KhachHang')->insert([
            ['id' => 1, 'tai_khoan_id' => 1],
            ['id' => 2, 'tai_khoan_id' => 2],
            ['id' => 3, 'tai_khoan_id' => 3],
            ['id' => 4, 'tai_khoan_id' => 4],
            ['id' => 5, 'tai_khoan_id' => 5],
        ]);

        // ══════════════════════════════════════════════════════════════════
        // 15. NhanVien (ID 6-25 từ bảng TaiKhoan, mapping mockStaffs.js)
        // ══════════════════════════════════════════════════════════════════
        $staffData = [
            ['id' => 1,  'tai_khoan_id' => 6,  'cccd' => '079100000001', 'dia_chi' => 'Q.Bình Thạnh, TP.HCM', 'danh_gia_sao_trung_binh' => 5.0, 'tong_so_danh_gia' => 342, 'tong_so_ca_hoan_thanh' => 1250, 'tong_gio_lam' => 3500],
            ['id' => 2,  'tai_khoan_id' => 7,  'cccd' => '079100000002', 'dia_chi' => 'Quận 7, TP.HCM',       'danh_gia_sao_trung_binh' => 4.9, 'tong_so_danh_gia' => 215, 'tong_so_ca_hoan_thanh' => 890,  'tong_gio_lam' => 2600],
            ['id' => 3,  'tai_khoan_id' => 8,  'cccd' => '079100000003', 'dia_chi' => 'Quận 2, TP.HCM',       'danh_gia_sao_trung_binh' => 4.9, 'tong_so_danh_gia' => 189, 'tong_so_ca_hoan_thanh' => 720,  'tong_gio_lam' => 2100],
            ['id' => 4,  'tai_khoan_id' => 9,  'cccd' => '079100000004', 'dia_chi' => 'Quận 1, TP.HCM',       'danh_gia_sao_trung_binh' => 5.0, 'tong_so_danh_gia' => 410, 'tong_so_ca_hoan_thanh' => 1530, 'tong_gio_lam' => 4600],
            ['id' => 5,  'tai_khoan_id' => 10, 'cccd' => '079100000005', 'dia_chi' => 'Quận 10, TP.HCM',      'danh_gia_sao_trung_binh' => 4.9, 'tong_so_danh_gia' => 156, 'tong_so_ca_hoan_thanh' => 450,  'tong_gio_lam' => 1300],
            ['id' => 6,  'tai_khoan_id' => 11, 'cccd' => '079100000006', 'dia_chi' => 'Quận 8, TP.HCM',       'danh_gia_sao_trung_binh' => 4.9, 'tong_so_danh_gia' => 278, 'tong_so_ca_hoan_thanh' => 800,  'tong_gio_lam' => 2400],
            ['id' => 7,  'tai_khoan_id' => 12, 'cccd' => '079100000007', 'dia_chi' => 'Q.Tân Bình, TP.HCM',   'danh_gia_sao_trung_binh' => 5.0, 'tong_so_danh_gia' => 520, 'tong_so_ca_hoan_thanh' => 2100, 'tong_gio_lam' => 6200],
            ['id' => 8,  'tai_khoan_id' => 13, 'cccd' => '079100000008', 'dia_chi' => 'Q.Gò Vấp, TP.HCM',     'danh_gia_sao_trung_binh' => 4.9, 'tong_so_danh_gia' => 112, 'tong_so_ca_hoan_thanh' => 380,  'tong_gio_lam' => 1100],
            ['id' => 9,  'tai_khoan_id' => 14, 'cccd' => '079100000009', 'dia_chi' => 'Q.Tân Phú, TP.HCM',    'danh_gia_sao_trung_binh' => 4.9, 'tong_so_danh_gia' => 305, 'tong_so_ca_hoan_thanh' => 1100, 'tong_gio_lam' => 3300],
            ['id' => 10, 'tai_khoan_id' => 15, 'cccd' => '079100000010', 'dia_chi' => 'Quận 4, TP.HCM',       'danh_gia_sao_trung_binh' => 5.0, 'tong_so_danh_gia' => 440, 'tong_so_ca_hoan_thanh' => 1650, 'tong_gio_lam' => 4900],
            ['id' => 11, 'tai_khoan_id' => 16, 'cccd' => '079100000011', 'dia_chi' => 'Quận 5, TP.HCM',       'danh_gia_sao_trung_binh' => 4.9, 'tong_so_danh_gia' => 220, 'tong_so_ca_hoan_thanh' => 650,  'tong_gio_lam' => 1900],
            ['id' => 12, 'tai_khoan_id' => 17, 'cccd' => '079100000012', 'dia_chi' => 'Quận 6, TP.HCM',       'danh_gia_sao_trung_binh' => 5.0, 'tong_so_danh_gia' => 310, 'tong_so_ca_hoan_thanh' => 950,  'tong_gio_lam' => 2800],
            ['id' => 13, 'tai_khoan_id' => 18, 'cccd' => '079100000013', 'dia_chi' => 'Q.Bình Tân, TP.HCM',   'danh_gia_sao_trung_binh' => 4.9, 'tong_so_danh_gia' => 180, 'tong_so_ca_hoan_thanh' => 520,  'tong_gio_lam' => 1500],
            ['id' => 14, 'tai_khoan_id' => 19, 'cccd' => '079100000014', 'dia_chi' => 'Quận 11, TP.HCM',      'danh_gia_sao_trung_binh' => 4.9, 'tong_so_danh_gia' => 260, 'tong_so_ca_hoan_thanh' => 820,  'tong_gio_lam' => 2400],
            ['id' => 15, 'tai_khoan_id' => 20, 'cccd' => '079100000015', 'dia_chi' => 'Quận 12, TP.HCM',      'danh_gia_sao_trung_binh' => 5.0, 'tong_so_danh_gia' => 390, 'tong_so_ca_hoan_thanh' => 1300, 'tong_gio_lam' => 3900],
            ['id' => 16, 'tai_khoan_id' => 21, 'cccd' => '079100000016', 'dia_chi' => 'H.Hóc Môn, TP.HCM',    'danh_gia_sao_trung_binh' => 4.9, 'tong_so_danh_gia' => 150, 'tong_so_ca_hoan_thanh' => 400,  'tong_gio_lam' => 1200],
            ['id' => 17, 'tai_khoan_id' => 22, 'cccd' => '079100000017', 'dia_chi' => 'H.Bình Chánh, TP.HCM', 'danh_gia_sao_trung_binh' => 4.9, 'tong_so_danh_gia' => 195, 'tong_so_ca_hoan_thanh' => 600,  'tong_gio_lam' => 1800],
            ['id' => 18, 'tai_khoan_id' => 23, 'cccd' => '079100000018', 'dia_chi' => 'H.Nhà Bè, TP.HCM',     'danh_gia_sao_trung_binh' => 5.0, 'tong_so_danh_gia' => 480, 'tong_so_ca_hoan_thanh' => 1800, 'tong_gio_lam' => 5400],
            ['id' => 19, 'tai_khoan_id' => 24, 'cccd' => '079100000019', 'dia_chi' => 'TP.Thủ Đức, TP.HCM',   'danh_gia_sao_trung_binh' => 4.9, 'tong_so_danh_gia' => 210, 'tong_so_ca_hoan_thanh' => 710,  'tong_gio_lam' => 2100],
            ['id' => 20, 'tai_khoan_id' => 25, 'cccd' => '079100000020', 'dia_chi' => 'TP.Thủ Đức, TP.HCM',   'danh_gia_sao_trung_binh' => 4.9, 'tong_so_danh_gia' => 290, 'tong_so_ca_hoan_thanh' => 1050, 'tong_gio_lam' => 3100],
        ];
        DB::table('NhanVien')->insert($staffData);

        // ══════════════════════════════════════════════════════════════════
        // 16. ViTien (Của người dùng)
        // ══════════════════════════════════════════════════════════════════
        $wallets = [];
        for ($i = 1; $i <= 25; $i++) {
            $wallets[] = [
                'id' => $i,
                'tai_khoan_id' => $i,
                'so_du' => $i <= 5 ? 850000 : 2500000, // Khách hàng 850k (như mock), Nhân viên 2.5m
                'ngay_cap_nhat' => now(),
            ];
        }
        DB::table('ViTien')->insert($wallets);

        // ══════════════════════════════════════════════════════════════════
        // 17. ThongTinNganHang
        // ══════════════════════════════════════════════════════════════════
        $banks = [];
        for ($i = 6; $i <= 25; $i++) {
            $banks[] = [
                'tai_khoan_id' => $i,
                'ten_ngan_hang' => 'Vietcombank',
                'so_tai_khoan' => '001100' . str_pad($i, 5, '0', STR_PAD_LEFT),
                'chu_tai_khoan' => 'NHAN VIEN ' . ($i - 5),
                'chi_nhanh' => 'Hội sở HCM',
                'trang_thai' => true,
                'ngay_lien_ket' => now()->subMonths(6),
            ];
        }
        DB::table('ThongTinNganHang')->insert($banks);

        // ══════════════════════════════════════════════════════════════════
        // 18. DiaChiDaLuu & 19. LienHeDaLuu (Mock từ SAVED_ADDRESSES)
        // ══════════════════════════════════════════════════════════════════
        for ($i = 1; $i <= 5; $i++) {
            DB::table('DiaChiDaLuu')->insert([
                ['khach_hang_id' => $i, 'ten_goi_nho' => 'Nhà riêng', 'dia_chi_chi_tiet' => '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM'],
                ['khach_hang_id' => $i, 'ten_goi_nho' => 'Văn phòng', 'dia_chi_chi_tiet' => '456 Lê Lợi, Phường Phạm Ngũ Lão, Quận 1, TP.HCM'],
            ]);
            
            DB::table('LienHeDaLuu')->insert([
                ['khach_hang_id' => $i, 'ten_nguoi_nhan' => 'Nguyễn Văn A', 'sdt_nhan' => '0901234567'],
                ['khach_hang_id' => $i, 'ten_nguoi_nhan' => 'Trần Thị B',   'sdt_nhan' => '0912345678'],
            ]);
        }

        // ══════════════════════════════════════════════════════════════════
        // 20. NhanVienYeuThich
        // ══════════════════════════════════════════════════════════════════
        DB::table('NhanVienYeuThich')->insert([
            ['khach_hang_id' => 1, 'nhan_vien_id' => 1],
            ['khach_hang_id' => 1, 'nhan_vien_id' => 2],
            ['khach_hang_id' => 2, 'nhan_vien_id' => 3],
        ]);

        // ══════════════════════════════════════════════════════════════════
        // 21. NhanVien_DichVu
        // ══════════════════════════════════════════════════════════════════
        $staffServices = [];
        $dichVuList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
        
        foreach ($staffData as $nv) {
            // Mỗi nhân viên đăng ký 3-5 dịch vụ ngẫu nhiên (chọn theo id NV)
            $count = ($nv['id'] % 3) + 3;
            for ($i = 0; $i < $count; $i++) {
                $serviceId = $dichVuList[($nv['id'] + $i) % count($dichVuList)];
                $staffServices[] = [
                    'nhan_vien_id' => $nv['id'],
                    'dich_vu_id' => $serviceId,
                    'trang_thai_duyet' => 'DaDuyet',
                    'ngay_dang_ky' => now()->subMonths(6),
                    'ngay_duyet' => now()->subMonths(5),
                ];
            }
        }
        
        // Remove duplicates if any
        $uniqueStaffServices = collect($staffServices)->unique(function ($item) {
            return $item['nhan_vien_id'].'-'.$item['dich_vu_id'];
        })->values()->all();

        DB::table('NhanVien_DichVu')->insert($uniqueStaffServices);

        // ══════════════════════════════════════════════════════════════════
        // 22. LichNghi
        // ══════════════════════════════════════════════════════════════════
        
    }
}
