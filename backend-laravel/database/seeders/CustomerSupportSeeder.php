<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CustomerSupportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();

        // ══════════════════════════════════════════════════════════════════
        // 31. KhachHang_KhuyenMai
        // ══════════════════════════════════════════════════════════════════
        DB::table('KhachHang_KhuyenMai')->insert([
            ['khach_hang_id' => 1, 'khuyen_mai_id' => 1, 'ngay_luu' => $now->subDays(5), 'ngay_su_dung' => null, 'trang_thai_luu' => 'DaLuu'],
            ['khach_hang_id' => 1, 'khuyen_mai_id' => 2, 'ngay_luu' => $now->subDays(10), 'ngay_su_dung' => $now->subDays(2), 'trang_thai_luu' => 'DaSuDung'],
            ['khach_hang_id' => 1, 'khuyen_mai_id' => 3, 'ngay_luu' => $now->subDays(20), 'ngay_su_dung' => null, 'trang_thai_luu' => 'DaLuu'],
        ]);

        // ══════════════════════════════════════════════════════════════════
        // 32. ThongBao (MOCK_ALL_NOTIFICATIONS từ NotificationPage.jsx)
        // ══════════════════════════════════════════════════════════════════
        DB::table('ThongBao')->insert([
            [
                'loai_nguoi_nhan' => 'KhachHang', 'nguoi_nhan_id' => 1,
                'tieu_de' => '💼 Nhân viên đã nhận lịch',
                'noi_dung' => 'Chị Trần Thị Mai đã xác nhận tham gia ca làm việc ngày mai (09/06) tại nhà của bạn.',
                'ngay_tao' => Carbon::now()->subHours(1),
                'is_da_doc' => false,
                'loai_doi_tuong' => 'Booking', 'doi_tuong_id' => 1
            ],
            [
                'loai_nguoi_nhan' => 'KhachHang', 'nguoi_nhan_id' => 1,
                'tieu_de' => '💰 Biến động số dư ví',
                'noi_dung' => 'Tài khoản ví CleanTrust của bạn đã thanh toán tự động 200.000đ cho đơn lịch #1.',
                'ngay_tao' => Carbon::now()->subHours(4),
                'is_da_doc' => true,
                'loai_doi_tuong' => 'Transaction', 'doi_tuong_id' => 1
            ],
            [
                'loai_nguoi_nhan' => 'KhachHang', 'nguoi_nhan_id' => 1,
                'tieu_de' => '🔥 Khuyến mãi độc quyền cuối tuần',
                'noi_dung' => 'Nhập ngay mã CLEAN50 để nhận ưu đãi giảm giá 50.000đ cho tất cả các dịch vụ Tổng vệ sinh (Deep Clean). Áp dụng duy nhất tuần này!',
                'ngay_tao' => Carbon::now()->subDays(2),
                'is_da_doc' => true,
                'loai_doi_tuong' => 'Promotion', 'doi_tuong_id' => 3
            ],
        ]);

        // ══════════════════════════════════════════════════════════════════
        // 33. PhongChat & 34. TinNhan
        // ══════════════════════════════════════════════════════════════════
        DB::table('PhongChat')->insert([
            ['id' => 1, 'khach_hang_id' => 1, 'nhan_vien_id' => 1, 'don_hang_id' => 1, 'thoi_gian_nhan_tin_cuoi' => Carbon::now()->subMinutes(30), 'trang_thai_phong' => 'DangHoatDong'],
            ['id' => 2, 'khach_hang_id' => 1, 'nhan_vien_id' => 2, 'don_hang_id' => 2, 'thoi_gian_nhan_tin_cuoi' => Carbon::now()->subDays(1), 'trang_thai_phong' => 'DangHoatDong'],
        ]);

        DB::table('TinNhan')->insert([
            ['phong_chat_id' => 1, 'nguoi_gui_loai' => 'KhachHang', 'nguoi_gui_id' => 1, 'noi_dung' => 'Chào chị Mai, mai chị đến lúc 8h nhé.', 'is_bi_chan' => false, 'trang_thai_doc' => true, 'thoi_gian_gui' => Carbon::now()->subMinutes(35)],
            ['phong_chat_id' => 1, 'nguoi_gui_loai' => 'NhanVien', 'nguoi_gui_id' => 1, 'noi_dung' => 'Dạ vâng ạ, mai em sẽ có mặt đúng giờ.', 'is_bi_chan' => false, 'trang_thai_doc' => false, 'thoi_gian_gui' => Carbon::now()->subMinutes(30)],
            ['phong_chat_id' => 2, 'nguoi_gui_loai' => 'NhanVien', 'nguoi_gui_id' => 2, 'noi_dung' => 'Cảm ơn anh chị đã sử dụng dịch vụ!', 'is_bi_chan' => false, 'trang_thai_doc' => true, 'thoi_gian_gui' => Carbon::now()->subDays(1)],
        ]);

        // ══════════════════════════════════════════════════════════════════
        // 36. LienHe (Khách vãng lai)
        // ══════════════════════════════════════════════════════════════════
        DB::table('LienHe')->insert([
            ['ho_ten' => 'Lê Khách', 'so_dien_thoai' => '0999888777', 'email' => 'khach@example.com', 'tieu_de' => 'Hỏi về dịch vụ tổng vệ sinh', 'noi_dung' => 'Cho mình hỏi giá tổng vệ sinh nhà 3 tầng 150m2 ạ.', 'trang_thai' => 'ChuaXuLy', 'ngay_gui' => Carbon::now()->subHours(2), 'admin_xu_ly_id' => null],
            ['ho_ten' => 'Trần Đối Tác', 'so_dien_thoai' => '0888777666', 'email' => 'doitac@example.com', 'tieu_de' => 'Hợp tác B2B', 'noi_dung' => 'Mình muốn liên hệ để dọn dẹp văn phòng định kỳ cho công ty.', 'trang_thai' => 'DangXuLy', 'ngay_gui' => Carbon::now()->subDays(1), 'admin_xu_ly_id' => 2],
        ]);
    }
}
