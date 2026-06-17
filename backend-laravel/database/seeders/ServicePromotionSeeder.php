<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServicePromotionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ══════════════════════════════════════════════════════════════════
        // Khai báo các đoạn text dùng chung cho tiện
        $descChung1 = 'Tại CleanTrust, chúng tôi hiểu rằng một không gian sạch sẽ không chỉ mang lại vẻ đẹp thẩm mỹ mà còn bảo vệ sức khỏe cho bạn và những người thân yêu. Gói dịch vụ được thiết kế tỉ mỉ với quy trình chuẩn hóa, sử dụng trang thiết bị hiện đại và dung dịch tẩy rửa an toàn.';
        $descChung2 = 'Đội ngũ nhân viên của chúng tôi không chỉ được đào tạo bài bản về kỹ năng chuyên môn mà còn thấm nhuần tinh thần tận tâm, chuyên nghiệp, cam kết mang đến sự hài lòng cao nhất. Bạn hoàn toàn có thể yên tâm giao phó không gian của mình cho chúng tôi để tận hưởng những phút giây thảnh thơi trọn vẹn.';

        $taskTieuChuan = [
            'Quét và lau sàn toàn bộ các phòng',
            'Lau sạch bụi bẩn trên bề mặt đồ đạc (TV, kệ, bàn ghế)',
            'Gom rác, thay túi rác và đổ rác đúng nơi quy định',
            'Vệ sinh bề mặt bếp, lau dọn khu vực nấu nướng',
            'Chà rửa bồn cầu, bồn rửa mặt, gương trong nhà vệ sinh',
            'Xếp dọn gọn gàng đồ đạc, đồ chơi, chăn gối',
        ];

        $taskChuyenSau = [
            'Tất cả công việc vệ sinh Tiêu chuẩn',
            'Chà bóng, tẩy ố sàn gạch, đánh bay vết bẩn cứng đầu',
            'Làm sạch kính cửa sổ (mặt trong và mặt ngoài nếu an toàn)',
            'Vệ sinh sâu tủ bếp, tẩy dầu mỡ bám lâu ngày',
            'Lau quạt trần, đèn trang trí và các vị trí trên cao',
            'Đánh bóng thiết bị vệ sinh, tẩy cặn canxi',
            'Xử lý bụi mịn, vết sơn, xi măng dư thừa (Dọn sau xây dựng)',
        ];

        // ══════════════════════════════════════════════════════════════════
        // 9. DichVu
        // ══════════════════════════════════════════════════════════════════
        DB::table('DichVu')->insert([
            [
                'id' => 1,
                'nhom_dich_vu_id' => 1,
                'ten_dich_vu' => 'Dọn dẹp hằng ngày',
                'cap_do_dich_vu' => 'TieuChuan',
                'is_noi_bat' => true,
                'co_bien_the' => true,
                'don_gia_co_ban' => 200000,
                'thoi_gian_chuan_co_ban' => 120,
                'mo_ta' => 'Quét lau sàn, lau bụi nội thất, dọn rác và vệ sinh bếp, toilet cơ bản.',
                'trang_thai' => true,
                'noi_dung_chi_tiet' => json_encode(['description' => [$descChung1, $descChung2], 'tasks' => $taskTieuChuan], JSON_UNESCAPED_UNICODE)
            ],
            [
                'id' => 2,
                'nhom_dich_vu_id' => 1,
                'ten_dich_vu' => 'Dọn dẹp định kỳ',
                'cap_do_dich_vu' => 'TieuChuan',
                'is_noi_bat' => true,
                'co_bien_the' => true,
                'don_gia_co_ban' => 180000,
                'thoi_gian_chuan_co_ban' => 120,
                'mo_ta' => 'Giữ nhà luôn sạch sẽ với lịch dọn dẹp thường xuyên, tiết kiệm đến 20%.',
                'trang_thai' => true,
                'noi_dung_chi_tiet' => json_encode(['description' => [$descChung1, $descChung2], 'tasks' => $taskTieuChuan], JSON_UNESCAPED_UNICODE)
            ],
            [
                'id' => 3,
                'nhom_dich_vu_id' => 1,
                'ten_dich_vu' => 'Tổng vệ sinh chuyên sâu',
                'cap_do_dich_vu' => 'CaoCap',
                'is_noi_bat' => true,
                'co_bien_the' => true,
                'don_gia_co_ban' => 450000,
                'thoi_gian_chuan_co_ban' => 180,
                'mo_ta' => 'Làm sạch toàn diện mọi ngóc ngách, chà sàn, tẩy ố nhà vệ sinh, lau kính.',
                'trang_thai' => true,
                'noi_dung_chi_tiet' => json_encode(['description' => [$descChung1, $descChung2], 'tasks' => $taskChuyenSau], JSON_UNESCAPED_UNICODE)
            ],
            [
                'id' => 4,
                'nhom_dich_vu_id' => 2,
                'ten_dich_vu' => 'Chăm sóc người lớn tuổi',
                'cap_do_dich_vu' => 'TieuChuan',
                'is_noi_bat' => false,
                'co_bien_the' => false,
                'don_gia_co_ban' => 300000,
                'thoi_gian_chuan_co_ban' => 240,
                'mo_ta' => 'Chăm sóc, hỗ trợ sinh hoạt hằng ngày cho người cao tuổi tại nhà.',
                'trang_thai' => true,
                'noi_dung_chi_tiet' => json_encode(['description' => ['Dịch vụ chăm sóc người cao tuổi tận tâm, mang lại sự an tâm tuyệt đối cho gia đình bạn.', $descChung2], 'tasks' => [
                    'Hỗ trợ vệ sinh cá nhân hàng ngày (tắm rửa, thay quần áo)',
                    'Chuẩn bị và hỗ trợ bữa ăn theo chế độ dinh dưỡng',
                    'Đo huyết áp, theo dõi sức khỏe cơ bản hàng ngày',
                    'Đưa đón đi khám bệnh, hỗ trợ mua thuốc',
                    'Trò chuyện, đọc sách, giải trí để giảm sự cô đơn',
                    'Dọn dẹp phòng ngủ, khu vực sinh hoạt và giặt giũ nhẹ',
                    'Nhắc nhở uống thuốc đúng giờ, đúng liều lượng'
                ]], JSON_UNESCAPED_UNICODE)
            ],
            [
                'id' => 5,
                'nhom_dich_vu_id' => 2,
                'ten_dich_vu' => 'Trông trẻ',
                'cap_do_dich_vu' => 'TieuChuan',
                'is_noi_bat' => false,
                'co_bien_the' => false,
                'don_gia_co_ban' => 250000,
                'thoi_gian_chuan_co_ban' => 240,
                'mo_ta' => 'Trông giữ trẻ tại nhà an toàn, tận tâm, phù hợp cho các bé từ 6 tháng trở lên.',
                'trang_thai' => true,
                'noi_dung_chi_tiet' => json_encode(['description' => ['Mang đến môi trường an toàn và vui vẻ cho bé yêu của bạn khi bạn vắng nhà.', $descChung2], 'tasks' => [
                    'Trông giữ và chơi cùng bé an toàn tại nhà',
                    'Chuẩn bị bữa ăn nhẹ, pha sữa và cho bé ăn',
                    'Thay tã, tắm rửa, vệ sinh cá nhân cho bé',
                    'Đọc truyện, hát và tham gia các hoạt động giáo dục nhẹ',
                    'Ru bé ngủ và theo dõi giấc ngủ sát sao',
                    'Cập nhật tình hình, gửi hình ảnh/video cho phụ huynh',
                    'Đảm bảo không gian chơi của bé luôn sạch sẽ, an toàn'
                ]], JSON_UNESCAPED_UNICODE)
            ],
            [
                'id' => 6,
                'nhom_dich_vu_id' => 2,
                'ten_dich_vu' => 'Chăm sóc người bệnh',
                'cap_do_dich_vu' => 'TieuChuan',
                'is_noi_bat' => false,
                'co_bien_the' => false,
                'don_gia_co_ban' => 350000,
                'thoi_gian_chuan_co_ban' => 240,
                'mo_ta' => 'Chăm sóc, hỗ trợ người bệnh tại nhà, theo dõi sức khỏe và hỗ trợ phục hồi.',
                'trang_thai' => true,
                'noi_dung_chi_tiet' => json_encode(['description' => ['Chăm sóc y tế cơ bản và hỗ trợ sinh hoạt cho người bệnh trong quá trình phục hồi.', $descChung2], 'tasks' => [
                    'Hỗ trợ vệ sinh cá nhân tại giường hoặc phòng tắm',
                    'Theo dõi liên tục dấu hiệu sinh tồn (mạch, huyết áp, nhiệt độ)',
                    'Nhắc và hỗ trợ người bệnh uống thuốc đúng giờ',
                    'Hỗ trợ di chuyển, thay đổi tư thế, tập vật lý trị liệu nhẹ',
                    'Chuẩn bị bữa ăn tuân thủ nghiêm ngặt chế độ bệnh lý',
                    'Ghi chép nhật ký sức khỏe chi tiết hàng ngày',
                    'Liên hệ ngay với gia đình và y tế khi có dấu hiệu bất thường'
                ]], JSON_UNESCAPED_UNICODE)
            ],
            [
                'id' => 7,
                'nhom_dich_vu_id' => 3,
                'ten_dich_vu' => 'Dọn sau xây dựng',
                'cap_do_dich_vu' => 'CaoCap',
                'is_noi_bat' => true,
                'co_bien_the' => true,
                'don_gia_co_ban' => 500000,
                'thoi_gian_chuan_co_ban' => 240,
                'mo_ta' => 'Xử lý bụi mịn, vết sơn, xi măng dư thừa sau quá trình thi công.',
                'trang_thai' => true,
                'noi_dung_chi_tiet' => json_encode(['description' => [$descChung1, $descChung2], 'tasks' => $taskChuyenSau], JSON_UNESCAPED_UNICODE)
            ],
            [
                'id' => 8,
                'nhom_dich_vu_id' => 4,
                'ten_dich_vu' => 'Vệ sinh máy lạnh',
                'cap_do_dich_vu' => 'TieuChuan',
                'is_noi_bat' => false,
                'co_bien_the' => true,
                'don_gia_co_ban' => 180000,
                'thoi_gian_chuan_co_ban' => 60,
                'mo_ta' => 'Bao gồm rửa sạch bụi bẩn, xịt diệt khuẩn, kiểm tra và bơm gas.',
                'trang_thai' => true,
                'noi_dung_chi_tiet' => json_encode(['description' => [$descChung1, $descChung2], 'tasks' => ['Vệ sinh lồng sóc, mặt nạ máy lạnh', 'Xịt rửa dàn nóng, dàn lạnh', 'Kiểm tra gas và thông đường ống nước thải']], JSON_UNESCAPED_UNICODE)
            ],
            [
                'id' => 9,
                'nhom_dich_vu_id' => 4,
                'ten_dich_vu' => 'Giặt ghế sofa',
                'cap_do_dich_vu' => 'TieuChuan',
                'is_noi_bat' => false,
                'co_bien_the' => true,
                'don_gia_co_ban' => 250000,
                'thoi_gian_chuan_co_ban' => 120,
                'mo_ta' => 'Hút bụi sâu, phun hút hơi nước nóng đánh bay vết bẩn và vi khuẩn.',
                'trang_thai' => true,
                'noi_dung_chi_tiet' => json_encode(['description' => [$descChung1, $descChung2], 'tasks' => ['Hút bụi khô bề mặt sofa', 'Phun dung dịch giặt chuyên dụng', 'Dùng máy đánh tay chuyên dụng chà sạch vết bẩn', 'Dùng máy hút công suất lớn hút sạch nước bẩn', 'Sấy khô (hỗ trợ)']], JSON_UNESCAPED_UNICODE)
            ],
            [
                'id' => 10,
                'nhom_dich_vu_id' => 4,
                'ten_dich_vu' => 'Giặt nệm',
                'cap_do_dich_vu' => 'TieuChuan',
                'is_noi_bat' => false,
                'co_bien_the' => true,
                'don_gia_co_ban' => 300000,
                'thoi_gian_chuan_co_ban' => 90,
                'mo_ta' => 'Loại bỏ mạt bụi, tế bào chết và khử mùi hôi nệm phòng ngủ.',
                'trang_thai' => true,
                'noi_dung_chi_tiet' => json_encode(['description' => [$descChung1, $descChung2], 'tasks' => ['Hút bụi mạt giường, tế bào chết trên nệm', 'Phun hơi nước nóng diệt vi khuẩn', 'Phun dung dịch làm sạch và xử lý vết ố', 'Hút sạch bọt và dung dịch bẩn']], JSON_UNESCAPED_UNICODE)
            ],
            [
                'id' => 11,
                'nhom_dich_vu_id' => 4,
                'ten_dich_vu' => 'Vệ sinh bếp chuyên sâu',
                'cap_do_dich_vu' => 'TieuChuan',
                'is_noi_bat' => false,
                'co_bien_the' => true,
                'don_gia_co_ban' => 220000,
                'thoi_gian_chuan_co_ban' => 120,
                'mo_ta' => 'Tẩy mỡ màng, làm sạch kỹ lưỡng tủ lạnh, lò vi sóng, bếp ga và bồn rửa.',
                'trang_thai' => true,
                'noi_dung_chi_tiet' => json_encode(['description' => [$descChung1, $descChung2], 'tasks' => ['Làm sạch sâu mảng bám dầu mỡ trên tường và mặt bếp', 'Vệ sinh bên trong và ngoài lò vi sóng, tủ lạnh', 'Tẩy cặn bồn rửa chén', 'Lau dọn kệ và tủ bếp']], JSON_UNESCAPED_UNICODE)
            ],
            [
                'id' => 12,
                'nhom_dich_vu_id' => 4,
                'ten_dich_vu' => 'Giặt thảm',
                'cap_do_dich_vu' => 'TieuChuan',
                'is_noi_bat' => false,
                'co_bien_the' => true,
                'don_gia_co_ban' => 200000,
                'thoi_gian_chuan_co_ban' => 60,
                'mo_ta' => 'Giặt sạch và khử mùi các loại thảm trang trí, thảm văn phòng.',
                'trang_thai' => true,
                'noi_dung_chi_tiet' => json_encode(['description' => [$descChung1, $descChung2], 'tasks' => ['Hút bụi khô bề mặt thảm', 'Phun hóa chất tẩy điểm các vết bẩn cứng đầu', 'Sử dụng máy đánh sàn chuyên dụng chà sạch thảm', 'Hút sạch nước dơ bằng máy hút công nghiệp']], JSON_UNESCAPED_UNICODE)
            ],
            [
                'id' => 13,
                'nhom_dich_vu_id' => 5,
                'ten_dich_vu' => 'Dọn văn phòng',
                'cap_do_dich_vu' => 'TieuChuan',
                'is_noi_bat' => false,
                'co_bien_the' => true,
                'don_gia_co_ban' => 160000,
                'thoi_gian_chuan_co_ban' => 120,
                'mo_ta' => 'Lau dọn bàn làm việc, phòng họp, khu vực sinh hoạt chung của công ty.',
                'trang_thai' => true,
                'noi_dung_chi_tiet' => json_encode(['description' => ['Không gian làm việc sạch sẽ giúp tăng cường sự tập trung và năng suất cho nhân viên.', $descChung2], 'tasks' => ['Lau dọn bàn ghế làm việc', 'Vệ sinh phòng họp, khu vực lễ tân', 'Dọn dẹp khu vực pantry (bếp văn phòng)', 'Gom và đổ rác', 'Lau sàn toàn bộ văn phòng']], JSON_UNESCAPED_UNICODE)
            ],
        ]);

        // ══════════════════════════════════════════════════════════════════
        // 10. KhuyenMai (từ VOUCHERS và VoucherPage)
        // ══════════════════════════════════════════════════════════════════
        $now = now();
        $nextMonth = now()->addMonths(1);
        DB::table('KhuyenMai')->insert([
            // 1. TOÀN SÀN: Cả 2 ID đều null
            ['id' => 1, 'ma_code' => 'CLEANTRUST10', 'tag_hien_thi' => 'Người dùng mới', 'tieu_de' => 'Giảm 10% cho khách hàng mới', 'mo_ta' => 'Áp dụng cho mọi dịch vụ', 'nhom_dich_vu_id_ap_dung' => null, 'dich_vu_id_ap_dung' => null, 'gia_tri_don_toi_thieu' => 0, 'loai_giam_gia' => 'PhanTram', 'gia_tri_giam' => 10, 'giam_toi_da' => 50000, 'ngay_bat_dau' => $now, 'ngay_ket_thuc' => $nextMonth, 'luot_dung_moi_khach' => 1, 'tong_luot_luu_toi_da' => 1000, 'tong_luot_dung_toi_da_toan_san' => 5000, 'trang_thai' => true],

            // 2. THEO NHÓM: Truyền nhom_dich_vu_id_ap_dung, để null ở dich_vu
            ['id' => 2, 'ma_code' => 'FAMILY50K', 'tag_hien_thi' => 'Gia đình', 'tieu_de' => 'Giảm 50K dịch vụ Gia đình', 'mo_ta' => 'Áp dụng cho Chăm sóc người lớn tuổi, Trông trẻ, Chăm sóc người bệnh', 'nhom_dich_vu_id_ap_dung' => 2, 'dich_vu_id_ap_dung' => null, 'gia_tri_don_toi_thieu' => 200000, 'loai_giam_gia' => 'TienMat', 'gia_tri_giam' => 50000, 'giam_toi_da' => 50000, 'ngay_bat_dau' => $now, 'ngay_ket_thuc' => $nextMonth, 'luot_dung_moi_khach' => 1, 'tong_luot_luu_toi_da' => 500, 'tong_luot_dung_toi_da_toan_san' => 2000, 'trang_thai' => true],
            ['id' => 3, 'ma_code' => 'DEEP200K', 'tag_hien_thi' => 'Tổng vệ sinh', 'tieu_de' => 'Giảm 200K dịch vụ Chuyên sâu', 'mo_ta' => 'Áp dụng cho Dọn sau xây dựng, Tổng vệ sinh', 'nhom_dich_vu_id_ap_dung' => 3, 'dich_vu_id_ap_dung' => null, 'gia_tri_don_toi_thieu' => 1000000, 'loai_giam_gia' => 'TienMat', 'gia_tri_giam' => 200000, 'giam_toi_da' => 200000, 'ngay_bat_dau' => $now, 'ngay_ket_thuc' => $nextMonth, 'luot_dung_moi_khach' => 1, 'tong_luot_luu_toi_da' => 200, 'tong_luot_dung_toi_da_toan_san' => 500, 'trang_thai' => true],
            ['id' => 4, 'ma_code' => 'CARE15', 'tag_hien_thi' => 'Nội thất', 'tieu_de' => 'Giảm 15% làm sạch nội thất', 'mo_ta' => 'Áp dụng giặt nệm, sofa, máy lạnh', 'nhom_dich_vu_id_ap_dung' => 4, 'dich_vu_id_ap_dung' => null, 'gia_tri_don_toi_thieu' => 400000, 'loai_giam_gia' => 'PhanTram', 'gia_tri_giam' => 15, 'giam_toi_da' => 80000, 'ngay_bat_dau' => $now, 'ngay_ket_thuc' => $nextMonth, 'luot_dung_moi_khach' => 1, 'tong_luot_luu_toi_da' => 500, 'tong_luot_dung_toi_da_toan_san' => 1500, 'trang_thai' => true],
            ['id' => 5, 'ma_code' => 'CARENEW20', 'tag_hien_thi' => 'Khách mới Nội thất', 'tieu_de' => 'Khách hàng mới Nội thất', 'mo_ta' => 'Giảm 20% cho lần đầu đặt dịch vụ làm sạch nội thất', 'nhom_dich_vu_id_ap_dung' => 4, 'dich_vu_id_ap_dung' => null, 'gia_tri_don_toi_thieu' => 300000, 'loai_giam_gia' => 'PhanTram', 'gia_tri_giam' => 20, 'giam_toi_da' => 100000, 'ngay_bat_dau' => $now, 'ngay_ket_thuc' => $nextMonth, 'luot_dung_moi_khach' => 1, 'tong_luot_luu_toi_da' => 500, 'tong_luot_dung_toi_da_toan_san' => 1000, 'trang_thai' => true],

            // 3. THEO 1 DỊCH VỤ RIÊNG: Truyền dich_vu_id_ap_dung, để null ở nhom_dich_vu
            ['id' => 6, 'ma_code' => 'BUSINESS10', 'tag_hien_thi' => 'Doanh nghiệp', 'tieu_de' => 'Giảm 10% Dọn văn phòng', 'mo_ta' => 'Áp dụng cho Doanh nghiệp', 'nhom_dich_vu_id_ap_dung' => null, 'dich_vu_id_ap_dung' => 13, 'gia_tri_don_toi_thieu' => 500000, 'loai_giam_gia' => 'PhanTram', 'gia_tri_giam' => 10, 'giam_toi_da' => 200000, 'ngay_bat_dau' => $now, 'ngay_ket_thuc' => $nextMonth, 'luot_dung_moi_khach' => 5, 'tong_luot_luu_toi_da' => 100, 'tong_luot_dung_toi_da_toan_san' => 500, 'trang_thai' => true],
        ]);

        // ══════════════════════════════════════════════════════════════════
        // 11. TuyChonBienTheDichVu (Area options, CARE_OPTIONS_MAP)
        // ══════════════════════════════════════════════════════════════════
        DB::table('TuyChonBienTheDichVu')->insert([
            // Dọn dẹp hằng ngày (1) & định kỳ (2)
            ['id' => 1, 'dich_vu_id' => 1, 'ten_tuy_chon' => 'Dưới 55m² (1-2 phòng)', 'don_vi_tinh' => 'Goi', 'thoi_gian_chuan' => 120, 'don_gia' => 200000, 'trang_thai' => true],
            ['id' => 2, 'dich_vu_id' => 1, 'ten_tuy_chon' => '55 – 85m² (2-3 phòng)', 'don_vi_tinh' => 'Goi', 'thoi_gian_chuan' => 180, 'don_gia' => 260000, 'trang_thai' => true],
            ['id' => 3, 'dich_vu_id' => 1, 'ten_tuy_chon' => '85 – 120m² (3-4 phòng)', 'don_vi_tinh' => 'Goi', 'thoi_gian_chuan' => 240, 'don_gia' => 350000, 'trang_thai' => true],
            ['id' => 4, 'dich_vu_id' => 2, 'ten_tuy_chon' => 'Dưới 55m² (1-2 phòng)', 'don_vi_tinh' => 'Goi', 'thoi_gian_chuan' => 120, 'don_gia' => 180000, 'trang_thai' => true],
            ['id' => 5, 'dich_vu_id' => 2, 'ten_tuy_chon' => '55 – 85m² (2-3 phòng)', 'don_vi_tinh' => 'Goi', 'thoi_gian_chuan' => 180, 'don_gia' => 234000, 'trang_thai' => true],
            ['id' => 6, 'dich_vu_id' => 2, 'ten_tuy_chon' => '85 – 120m² (3-4 phòng)', 'don_vi_tinh' => 'Goi', 'thoi_gian_chuan' => 240, 'don_gia' => 315000, 'trang_thai' => true],
            // Tổng vệ sinh (3) & Dọn sau xây dựng (7)
            ['id' => 7, 'dich_vu_id' => 3, 'ten_tuy_chon' => 'Dưới 60m² (1-2 phòng)', 'don_vi_tinh' => 'Goi', 'thoi_gian_chuan' => 180, 'don_gia' => 450000, 'trang_thai' => true],
            ['id' => 8, 'dich_vu_id' => 3, 'ten_tuy_chon' => '60 – 80m² (2-3 phòng)', 'don_vi_tinh' => 'Goi', 'thoi_gian_chuan' => 240, 'don_gia' => 549000, 'trang_thai' => true],
            ['id' => 9, 'dich_vu_id' => 3, 'ten_tuy_chon' => '80 – 150m² (3-5 phòng)', 'don_vi_tinh' => 'Goi', 'thoi_gian_chuan' => 240, 'don_gia' => 751500, 'trang_thai' => true],
            ['id' => 10, 'dich_vu_id' => 7, 'ten_tuy_chon' => 'Dưới 60m² (1-2 phòng)', 'don_vi_tinh' => 'Goi', 'thoi_gian_chuan' => 180, 'don_gia' => 500000, 'trang_thai' => true],
            ['id' => 11, 'dich_vu_id' => 7, 'ten_tuy_chon' => '60 – 80m² (2-3 phòng)', 'don_vi_tinh' => 'Goi', 'thoi_gian_chuan' => 240, 'don_gia' => 610000, 'trang_thai' => true],
            ['id' => 12, 'dich_vu_id' => 7, 'ten_tuy_chon' => '80 – 150m² (3-5 phòng)', 'don_vi_tinh' => 'Goi', 'thoi_gian_chuan' => 240, 'don_gia' => 835000, 'trang_thai' => true],
            // Máy lạnh (8)
            ['id' => 13, 'dich_vu_id' => 8, 'ten_tuy_chon' => 'Máy lạnh treo tường', 'don_vi_tinh' => 'May', 'thoi_gian_chuan' => 60, 'don_gia' => 180000, 'trang_thai' => true],
            ['id' => 14, 'dich_vu_id' => 8, 'ten_tuy_chon' => 'Máy lạnh âm trần', 'don_vi_tinh' => 'May', 'thoi_gian_chuan' => 120, 'don_gia' => 350000, 'trang_thai' => true],
            // Sofa (9)
            ['id' => 15, 'dich_vu_id' => 9, 'ten_tuy_chon' => 'Sofa vải / nỉ', 'don_vi_tinh' => 'Bo', 'thoi_gian_chuan' => 120, 'don_gia' => 250000, 'trang_thai' => true],
            ['id' => 16, 'dich_vu_id' => 9, 'ten_tuy_chon' => 'Sofa da', 'don_vi_tinh' => 'Bo', 'thoi_gian_chuan' => 120, 'don_gia' => 400000, 'trang_thai' => true],
            // Nệm (10)
            ['id' => 17, 'dich_vu_id' => 10, 'ten_tuy_chon' => 'Nệm cao su', 'don_vi_tinh' => 'Tam', 'thoi_gian_chuan' => 90, 'don_gia' => 300000, 'trang_thai' => true],
            ['id' => 18, 'dich_vu_id' => 10, 'ten_tuy_chon' => 'Nệm lò xo / bông ép', 'don_vi_tinh' => 'Tam', 'thoi_gian_chuan' => 60, 'don_gia' => 420000, 'trang_thai' => true],
            // Bếp (11)
            ['id' => 19, 'dich_vu_id' => 11, 'ten_tuy_chon' => 'Vệ sinh bếp tiêu chuẩn', 'don_vi_tinh' => 'Goi', 'thoi_gian_chuan' => 120, 'don_gia' => 220000, 'trang_thai' => true],
            ['id' => 20, 'dich_vu_id' => 11, 'ten_tuy_chon' => 'Vệ sinh bếp + Máy hút mùi', 'don_vi_tinh' => 'Goi', 'thoi_gian_chuan' => 180, 'don_gia' => 420000, 'trang_thai' => true],
            // Thảm (12)
            ['id' => 21, 'dich_vu_id' => 12, 'ten_tuy_chon' => 'Thảm nhỏ (dưới 4m²)', 'don_vi_tinh' => 'Tam', 'thoi_gian_chuan' => 60, 'don_gia' => 200000, 'trang_thai' => true],
            ['id' => 22, 'dich_vu_id' => 12, 'ten_tuy_chon' => 'Thảm lớn (trên 4m²)', 'don_vi_tinh' => 'Tam', 'thoi_gian_chuan' => 120, 'don_gia' => 360000, 'trang_thai' => true],
            // Văn phòng (13)
            ['id' => 23, 'dich_vu_id' => 13, 'ten_tuy_chon' => 'Văn phòng nhỏ (dưới 50m²)', 'don_vi_tinh' => 'Goi', 'thoi_gian_chuan' => 120, 'don_gia' => 160000, 'trang_thai' => true],
            ['id' => 24, 'dich_vu_id' => 13, 'ten_tuy_chon' => 'Văn phòng vừa (50–100m²)', 'don_vi_tinh' => 'Goi', 'thoi_gian_chuan' => 180, 'don_gia' => 280000, 'trang_thai' => true],
            ['id' => 25, 'dich_vu_id' => 13, 'ten_tuy_chon' => 'Văn phòng lớn (trên 100m²)', 'don_vi_tinh' => 'Goi', 'thoi_gian_chuan' => 300, 'don_gia' => 450000, 'trang_thai' => true],
        ]);

        // ══════════════════════════════════════════════════════════════════
        // 12. DichVu_LoaiGoi (Loai goi: 1 = Ca lẻ, 2 = Gói tháng, 3 = 24/7)
        // ══════════════════════════════════════════════════════════════════
        DB::table('DichVu_LoaiGoi')->insert([
            ['id' => 1, 'dich_vu_id' => 1, 'loai_goi_id' => 1, 'trang_thai' => true], // Dọn dẹp hằng ngày - Ca lẻ
            ['id' => 2, 'dich_vu_id' => 2, 'loai_goi_id' => 2, 'trang_thai' => true], // Dọn dẹp định kỳ - Gói tháng
            ['id' => 3, 'dich_vu_id' => 3, 'loai_goi_id' => 1, 'trang_thai' => true], // Tổng vệ sinh - Ca lẻ
            ['id' => 4, 'dich_vu_id' => 4, 'loai_goi_id' => 1, 'trang_thai' => true], // CS người lớn tuổi - Ca lẻ
            ['id' => 5, 'dich_vu_id' => 4, 'loai_goi_id' => 2, 'trang_thai' => true], // CS người lớn tuổi - Gói tháng
            ['id' => 6, 'dich_vu_id' => 4, 'loai_goi_id' => 3, 'trang_thai' => true], // CS người lớn tuổi - 24/7
            ['id' => 7, 'dich_vu_id' => 5, 'loai_goi_id' => 1, 'trang_thai' => true], // Trông trẻ - Ca lẻ
            ['id' => 8, 'dich_vu_id' => 6, 'loai_goi_id' => 1, 'trang_thai' => true], // CS người bệnh - Ca lẻ
            ['id' => 9, 'dich_vu_id' => 6, 'loai_goi_id' => 2, 'trang_thai' => true], // CS người bệnh - Gói tháng
            ['id' => 10, 'dich_vu_id' => 6, 'loai_goi_id' => 3, 'trang_thai' => true], // CS người bệnh - 24/7
            ['id' => 11, 'dich_vu_id' => 7, 'loai_goi_id' => 1, 'trang_thai' => true], // Dọn sau XD - Ca lẻ
            ['id' => 12, 'dich_vu_id' => 8, 'loai_goi_id' => 1, 'trang_thai' => true], // Máy lạnh - Ca lẻ
            ['id' => 14, 'dich_vu_id' => 9, 'loai_goi_id' => 1, 'trang_thai' => true], // Sofa - Ca lẻ
            ['id' => 16, 'dich_vu_id' => 10, 'loai_goi_id' => 1, 'trang_thai' => true], // Nệm - Ca lẻ
            ['id' => 18, 'dich_vu_id' => 11, 'loai_goi_id' => 1, 'trang_thai' => true], // Bếp - Ca lẻ
            ['id' => 20, 'dich_vu_id' => 12, 'loai_goi_id' => 1, 'trang_thai' => true], // Thảm - Ca lẻ
            ['id' => 22, 'dich_vu_id' => 13, 'loai_goi_id' => 1, 'trang_thai' => true], // Văn phòng - Ca lẻ
            ['id' => 23, 'dich_vu_id' => 13, 'loai_goi_id' => 2, 'trang_thai' => true], // Văn phòng - Gói tháng
        ]);

        // ══════════════════════════════════════════════════════════════════
        // 13. DichVu_DichVuThem (1 = Tủ lạnh, 2 = Kính, 3 = Ủi đồ)
        // ══════════════════════════════════════════════════════════════════
        DB::table('DichVu_DichVuThem')->insert([
            ['id' => 1, 'dich_vu_id' => 1, 'dich_vu_them_id' => 1, 'gia_cong_them' => 100000, 'thoi_gian_cong' => 60, 'trang_thai' => true],
            ['id' => 2, 'dich_vu_id' => 1, 'dich_vu_them_id' => 2, 'gia_cong_them' => 150000, 'thoi_gian_cong' => 60, 'trang_thai' => true],
            ['id' => 3, 'dich_vu_id' => 1, 'dich_vu_them_id' => 3, 'gia_cong_them' => 80000, 'thoi_gian_cong' => 60, 'trang_thai' => true],
            ['id' => 4, 'dich_vu_id' => 2, 'dich_vu_them_id' => 1, 'gia_cong_them' => 100000, 'thoi_gian_cong' => 60, 'trang_thai' => true],
            ['id' => 5, 'dich_vu_id' => 2, 'dich_vu_them_id' => 2, 'gia_cong_them' => 150000, 'thoi_gian_cong' => 60, 'trang_thai' => true],
            ['id' => 6, 'dich_vu_id' => 2, 'dich_vu_them_id' => 3, 'gia_cong_them' => 80000, 'thoi_gian_cong' => 60, 'trang_thai' => true],
        ]);
    }
}
