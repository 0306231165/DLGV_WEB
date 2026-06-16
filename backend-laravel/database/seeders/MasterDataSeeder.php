<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class MasterDataSeeder extends Seeder
{
    /**
     * Seed: NhomDichVu, LoaiGoiDichVu, CauHinhGoiThang, DichVuThem, QuyDinhPhuPhi, TaiKhoan, TaiKhoanAdmin, ViHeThong
     */
    public function run(): void
    {
        // ══════════════════════════════════════════════════════════════════
        // 1. NhomDichVu — Nhóm dịch vụ (mapping từ PACKAGE_GROUPS frontend)
        // ══════════════════════════════════════════════════════════════════
        DB::table('NhomDichVu')->insert([
            ['id' => 1, 'ma_nhom' => 'home_cleaning',  'ten_nhom' => 'Dọn dẹp nhà',                       'icon' => 'home',              'thu_tu_hien_thi' => 1, 'trang_thai' => true],
            ['id' => 2, 'ma_nhom' => 'family',   'ten_nhom' => 'Chăm sóc gia đình',              'icon' => 'volunteer_activism', 'thu_tu_hien_thi' => 2, 'trang_thai' => true],
            ['id' => 3, 'ma_nhom' => 'deep',     'ten_nhom' => 'Chuyên sâu',                     'icon' => 'flare',             'thu_tu_hien_thi' => 3, 'trang_thai' => true],
            ['id' => 4, 'ma_nhom' => 'care',     'ten_nhom' => 'Chăm sóc & Làm sạch nội thất',   'icon' => 'auto_fix_high',     'thu_tu_hien_thi' => 4, 'trang_thai' => true],
            ['id' => 5, 'ma_nhom' => 'business', 'ten_nhom' => 'Doanh nghiệp',                   'icon' => 'domain',            'thu_tu_hien_thi' => 5, 'trang_thai' => true],
        ]);

        // ══════════════════════════════════════════════════════════════════
        // 2. LoaiGoiDichVu — Loại gói: Ca lẻ, Gói tháng, 24/7 Thường trực
        // ══════════════════════════════════════════════════════════════════
        DB::table('LoaiGoiDichVu')->insert([
            ['id' => 1, 'ten_loai_goi' => 'Ca lẻ',            'mo_ta' => 'Đặt lịch theo từng buổi, linh hoạt theo nhu cầu. Không ràng buộc cam kết dài hạn.',                    'trang_thai' => true],
            ['id' => 2, 'ten_loai_goi' => 'Gói tháng',        'mo_ta' => 'Đăng ký lịch cố định hàng tuần trong 1–6 tháng. Tiết kiệm lên đến 20%.',                                'trang_thai' => true],
            ['id' => 3, 'ten_loai_goi' => '24/7 Thường trực', 'mo_ta' => 'Nhân viên túc trực tại nhà 24 giờ, 7 ngày/tuần. Phù hợp người cần chăm sóc toàn thời gian.',            'trang_thai' => true],
        ]);

        // ══════════════════════════════════════════════════════════════════
        // 3. CauHinhGoiThang — Cấu hình giảm giá theo số tháng đăng ký
        //    (MONTHLY_DURATION_OPTIONS từ BookingPage.jsx)
        // ══════════════════════════════════════════════════════════════════
        DB::table('CauHinhGoiThang')->insert([
            ['id' => 1, 'so_thang' => 1, 'phan_tram_giam' => 0,  'trang_thai' => true],
            ['id' => 2, 'so_thang' => 2, 'phan_tram_giam' => 5,  'trang_thai' => true],
            ['id' => 3, 'so_thang' => 3, 'phan_tram_giam' => 10, 'trang_thai' => true],
            ['id' => 4, 'so_thang' => 6, 'phan_tram_giam' => 20, 'trang_thai' => true],
        ]);

        // ══════════════════════════════════════════════════════════════════
        // 4. DichVuThem — Dịch vụ cộng thêm (EXTRA_SERVICES từ BookingPage)
        // ══════════════════════════════════════════════════════════════════
        DB::table('DichVuThem')->insert([
            ['id' => 1, 'ten_dv_them' => 'Làm sạch tủ lạnh', 'icon' => 'kitchen', 'mo_ta' => 'Vệ sinh bên trong và bên ngoài tủ lạnh, khử mùi hôi.',       'trang_thai' => true],
            ['id' => 2, 'ten_dv_them' => 'Lau kính',          'icon' => 'window',  'mo_ta' => 'Lau sạch toàn bộ cửa kính, cửa sổ trong nhà.',                'trang_thai' => true],
            ['id' => 3, 'ten_dv_them' => 'Ủi quần áo',        'icon' => 'iron',    'mo_ta' => 'Ủi phẳng và xếp gọn quần áo cho cả gia đình.',                'trang_thai' => true],
        ]);

        // ══════════════════════════════════════════════════════════════════
        // 5. QuyDinhPhuPhi — Phụ phí hệ thống (từ constants BookingPage)
        // ══════════════════════════════════════════════════════════════════
        DB::table('QuyDinhPhuPhi')->insert([
            ['id' => 1, 'ma_phu_phi' => 'DAT_GAP',        'ten_phu_phi' => 'Phụ phí đặt gấp',              'loai_phu_phi' => 'TienMat',    'gia_tri_phu_phi' => 50000,  'trang_thai' => true, 'mo_ta' => 'Áp dụng khi đặt lịch trong vòng 1.5 giờ tới.'],
            ['id' => 2, 'ma_phu_phi' => 'CHON_NV',        'ten_phu_phi' => 'Phụ phí chọn nhân viên',       'loai_phu_phi' => 'TienMat',    'gia_tri_phu_phi' => 20000,  'trang_thai' => true, 'mo_ta' => 'Phí chỉ định nhân viên cụ thể cho ca làm.'],
            ['id' => 3, 'ma_phu_phi' => 'CAO_CAP',        'ten_phu_phi' => 'Phụ phí dịch vụ cao cấp',      'loai_phu_phi' => 'PhanTram',  'gia_tri_phu_phi' => 25.00,  'trang_thai' => true, 'mo_ta' => 'Cộng thêm 25% khi chọn gói dịch vụ cao cấp.'],
            ['id' => 4, 'ma_phu_phi' => 'RUT_TIEN',       'ten_phu_phi' => 'Phí rút tiền về ngân hàng',    'loai_phu_phi' => 'PhanTram',  'gia_tri_phu_phi' => 20.00,  'trang_thai' => true, 'mo_ta' => 'Khấu trừ 20% khi rút tiền từ ví về tài khoản ngân hàng.'],
            ['id' => 5, 'ma_phu_phi' => 'GIAM_VI',        'ten_phu_phi' => 'Giảm giá thanh toán bằng ví',  'loai_phu_phi' => 'PhanTram',  'gia_tri_phu_phi' => 2.00,   'trang_thai' => true, 'mo_ta' => 'Giảm 2% khi thanh toán trực tiếp bằng Ví CleanTrust.'],
        ]);

        // ══════════════════════════════════════════════════════════════════
        // 6. TaiKhoan — Tài khoản hệ thống (Khách hàng + Nhân viên)
        // ══════════════════════════════════════════════════════════════════
        $password = Hash::make('123456');
        $now = now();

        // --- Khách hàng (id 1-5) ---
        DB::table('TaiKhoan')->insert([
            ['id' => 1,  'so_dien_thoai' => '0901234567', 'mat_khau' => $password, 'ho_ten' => 'Nguyễn Văn An',    'email' => 'an.nguyen@email.com',    'avatar' => 'https://i.pravatar.cc/150?u=an',    'ngay_sinh' => '1995-03-15', 'gioi_tinh' => 'Nam',  'loai_tai_khoan' => 'KhachHang', 'ngay_tao' => $now, 'trang_thai' => 'HoatDong'],
            ['id' => 2,  'so_dien_thoai' => '0912345678', 'mat_khau' => $password, 'ho_ten' => 'Trần Thị Bích',    'email' => 'bich.tran@email.com',    'avatar' => 'https://i.pravatar.cc/150?u=bich',   'ngay_sinh' => '1990-07-22', 'gioi_tinh' => 'Nữ',   'loai_tai_khoan' => 'KhachHang', 'ngay_tao' => $now, 'trang_thai' => 'HoatDong'],
            ['id' => 3,  'so_dien_thoai' => '0923456789', 'mat_khau' => $password, 'ho_ten' => 'Lê Hoàng Cường',   'email' => 'cuong.le@email.com',     'avatar' => 'https://i.pravatar.cc/150?u=cuong',   'ngay_sinh' => '1988-11-05', 'gioi_tinh' => 'Nam',  'loai_tai_khoan' => 'KhachHang', 'ngay_tao' => $now, 'trang_thai' => 'HoatDong'],
            ['id' => 4,  'so_dien_thoai' => '0934567890', 'mat_khau' => $password, 'ho_ten' => 'Phạm Minh Đức',    'email' => 'duc.pham@email.com',     'avatar' => 'https://i.pravatar.cc/150?u=duc',     'ngay_sinh' => '1992-01-18', 'gioi_tinh' => 'Nam',  'loai_tai_khoan' => 'KhachHang', 'ngay_tao' => $now, 'trang_thai' => 'HoatDong'],
            ['id' => 5,  'so_dien_thoai' => '0945678901', 'mat_khau' => $password, 'ho_ten' => 'Hoàng Thị Em',     'email' => 'em.hoang@email.com',     'avatar' => 'https://i.pravatar.cc/150?u=em',      'ngay_sinh' => '1997-09-30', 'gioi_tinh' => 'Nữ',   'loai_tai_khoan' => 'KhachHang', 'ngay_tao' => $now, 'trang_thai' => 'HoatDong'],
        ]);

        // --- Nhân viên (id 6-25, mapping từ ELITE_STAFFS mockStaffs.js) ---
        $staffs = [
            ['id' => 6,  'so_dien_thoai' => '0961000001', 'ho_ten' => 'Trần Thị Mai',      'avatar' => 'https://i.pravatar.cc/150?u=mai',    'ngay_sinh' => '1993-04-12', 'gioi_tinh' => 'Nữ'],
            ['id' => 7,  'so_dien_thoai' => '0961000002', 'ho_ten' => 'Lê Văn Hoàng',      'avatar' => 'https://i.pravatar.cc/150?u=hoang',   'ngay_sinh' => '1996-08-25', 'gioi_tinh' => 'Nam'],
            ['id' => 8,  'so_dien_thoai' => '0961000003', 'ho_ten' => 'Phạm Thu Hương',     'avatar' => 'https://i.pravatar.cc/150?u=huong',   'ngay_sinh' => '1994-02-17', 'gioi_tinh' => 'Nữ'],
            ['id' => 9,  'so_dien_thoai' => '0961000004', 'ho_ten' => 'Nguyễn Văn Minh',    'avatar' => 'https://i.pravatar.cc/150?u=minh',    'ngay_sinh' => '1991-06-03', 'gioi_tinh' => 'Nam'],
            ['id' => 10, 'so_dien_thoai' => '0961000005', 'ho_ten' => 'Vũ Thị Lan',         'avatar' => 'https://i.pravatar.cc/150?u=lan',     'ngay_sinh' => '1998-12-10', 'gioi_tinh' => 'Nữ'],
            ['id' => 11, 'so_dien_thoai' => '0961000006', 'ho_ten' => 'Hoàng Quốc Tuấn',    'avatar' => 'https://i.pravatar.cc/150?u=tuan',    'ngay_sinh' => '1994-05-20', 'gioi_tinh' => 'Nam'],
            ['id' => 12, 'so_dien_thoai' => '0961000007', 'ho_ten' => 'Bùi Thị Hà',         'avatar' => 'https://i.pravatar.cc/150?u=ha',      'ngay_sinh' => '1989-01-08', 'gioi_tinh' => 'Nữ'],
            ['id' => 13, 'so_dien_thoai' => '0961000008', 'ho_ten' => 'Đặng Minh Khôi',     'avatar' => 'https://i.pravatar.cc/150?u=khoi',    'ngay_sinh' => '1995-09-14', 'gioi_tinh' => 'Nam'],
            ['id' => 14, 'so_dien_thoai' => '0961000009', 'ho_ten' => 'Ngô Thu Thủy',       'avatar' => 'https://i.pravatar.cc/150?u=thuy',    'ngay_sinh' => '1993-07-22', 'gioi_tinh' => 'Nữ'],
            ['id' => 15, 'so_dien_thoai' => '0961000010', 'ho_ten' => 'Lý Trọng Tín',       'avatar' => 'https://i.pravatar.cc/150?u=tin',     'ngay_sinh' => '1990-11-05', 'gioi_tinh' => 'Nam'],
            ['id' => 16, 'so_dien_thoai' => '0961000011', 'ho_ten' => 'Đoàn Thị Kim',       'avatar' => 'https://i.pravatar.cc/150?u=kim',     'ngay_sinh' => '1994-03-28', 'gioi_tinh' => 'Nữ'],
            ['id' => 17, 'so_dien_thoai' => '0961000012', 'ho_ten' => 'Trương Ngọc Ánh',    'avatar' => 'https://i.pravatar.cc/150?u=anh',     'ngay_sinh' => '1993-10-15', 'gioi_tinh' => 'Nữ'],
            ['id' => 18, 'so_dien_thoai' => '0961000013', 'ho_ten' => 'Mai Thanh Sơn',      'avatar' => 'https://i.pravatar.cc/150?u=son',     'ngay_sinh' => '1995-06-08', 'gioi_tinh' => 'Nam'],
            ['id' => 19, 'so_dien_thoai' => '0961000014', 'ho_ten' => 'Đỗ Thùy Trang',      'avatar' => 'https://i.pravatar.cc/150?u=trang',   'ngay_sinh' => '1994-04-02', 'gioi_tinh' => 'Nữ'],
            ['id' => 20, 'so_dien_thoai' => '0961000015', 'ho_ten' => 'Lương Thế Vinh',     'avatar' => 'https://i.pravatar.cc/150?u=vinh',    'ngay_sinh' => '1991-12-20', 'gioi_tinh' => 'Nam'],
            ['id' => 21, 'so_dien_thoai' => '0961000016', 'ho_ten' => 'Châu Mỹ Hạnh',      'avatar' => 'https://i.pravatar.cc/150?u=hanh',    'ngay_sinh' => '1998-02-14', 'gioi_tinh' => 'Nữ'],
            ['id' => 22, 'so_dien_thoai' => '0961000017', 'ho_ten' => 'Thái Bình',          'avatar' => 'https://i.pravatar.cc/150?u=binh',    'ngay_sinh' => '1995-08-30', 'gioi_tinh' => 'Nam'],
            ['id' => 23, 'so_dien_thoai' => '0961000018', 'ho_ten' => 'Phùng Thị Tuyết',    'avatar' => 'https://i.pravatar.cc/150?u=tuyet',   'ngay_sinh' => '1990-05-17', 'gioi_tinh' => 'Nữ'],
            ['id' => 24, 'so_dien_thoai' => '0961000019', 'ho_ten' => 'Hồ Quang Hiếu',     'avatar' => 'https://i.pravatar.cc/150?u=hieu',    'ngay_sinh' => '1994-01-25', 'gioi_tinh' => 'Nam'],
            ['id' => 25, 'so_dien_thoai' => '0961000020', 'ho_ten' => 'Dương Yến Ngọc',     'avatar' => 'https://i.pravatar.cc/150?u=ngoc',    'ngay_sinh' => '1993-03-11', 'gioi_tinh' => 'Nữ'],
        ];

        foreach ($staffs as $s) {
            DB::table('TaiKhoan')->insert([
                'id'              => $s['id'],
                'so_dien_thoai'   => $s['so_dien_thoai'],
                'mat_khau'        => $password,
                'ho_ten'          => $s['ho_ten'],
                'email'           => strtolower(str_replace(' ', '', $this->removeVietnamese($s['ho_ten']))) . '@cleantrust.vn',
                'avatar'          => $s['avatar'],
                'ngay_sinh'       => $s['ngay_sinh'],
                'gioi_tinh'       => $s['gioi_tinh'],
                'loai_tai_khoan'  => 'NhanVien',
                'ngay_tao'        => $now,
                'trang_thai'      => 'HoatDong',
            ]);
        }

        // ══════════════════════════════════════════════════════════════════
        // 7. TaiKhoanAdmin — Admin hệ thống
        // ══════════════════════════════════════════════════════════════════
        DB::table('TaiKhoanAdmin')->insert([
            ['id' => 1, 'ten_dang_nhap' => 'admin',       'mat_khau' => $password, 'ho_ten' => 'Admin CleanTrust',    'quyen_han' => 'Admin', 'trang_thai' => true],
            ['id' => 2, 'ten_dang_nhap' => 'moderator01', 'mat_khau' => $password, 'ho_ten' => 'Nguyễn Thị Hồng',    'quyen_han' => 'Manager',  'trang_thai' => true],
            ['id' => 3, 'ten_dang_nhap' => 'support01',   'mat_khau' => $password, 'ho_ten' => 'Trần Văn Phúc',      'quyen_han' => 'CSKH',    'trang_thai' => true],
        ]);

        // ══════════════════════════════════════════════════════════════════
        // 8. ViHeThong — Ví hệ thống
        // ══════════════════════════════════════════════════════════════════
        DB::table('ViHeThong')->insert([
            ['id' => 1, 'loai_vi' => 'ViTamGiu',   'tong_so_du' => 15250000.00, 'ngay_cap_nhat' => $now],
            ['id' => 2, 'loai_vi' => 'ViDoanhThu',     'tong_so_du' => 8750000.00,  'ngay_cap_nhat' => $now],
        ]);
    }

    /**
     * Helper: Chuyển chuỗi tiếng Việt có dấu thành không dấu (dùng tạo email).
     */
    private function removeVietnamese(string $str): string
    {
        $unicode = [
            'a'=>'á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ',
            'd'=>'đ', 'e'=>'é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ',
            'i'=>'í|ì|ỉ|ĩ|ị', 'o'=>'ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ',
            'u'=>'ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự', 'y'=>'ý|ỳ|ỷ|ỹ|ỵ',
            'A'=>'Á|À|Ả|Ã|Ạ|Ă|Ắ|Ằ|Ẳ|Ẵ|Ặ|Â|Ấ|Ầ|Ẩ|Ẫ|Ậ',
            'D'=>'Đ', 'E'=>'É|È|Ẻ|Ẽ|Ẹ|Ê|Ế|Ề|Ể|Ễ|Ệ',
            'I'=>'Í|Ì|Ỉ|Ĩ|Ị', 'O'=>'Ó|Ò|Ỏ|Õ|Ọ|Ô|Ố|Ồ|Ổ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ở|Ỡ|Ợ',
            'U'=>'Ú|Ù|Ủ|Ũ|Ụ|Ư|Ứ|Ừ|Ử|Ữ|Ự', 'Y'=>'Ý|Ỳ|Ỷ|Ỹ|Ỵ',
        ];
        foreach ($unicode as $nonUnicode => $uni) {
            $str = preg_replace("/($uni)/i", $nonUnicode, $str);
        }
        return $str;
    }
}
