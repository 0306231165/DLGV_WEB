<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 24. DonHang
        Schema::create('DonHang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('khach_hang_id')->constrained('KhachHang');
            $table->foreignId('dich_vu_loai_goi_id')->constrained('DichVu_LoaiGoi');
            $table->foreignId('tuy_chon_bien_the_id')->nullable()->constrained('TuyChonBienTheDichVu');
            $table->integer('so_luong_tuy_chon')->default(1);
            $table->foreignId('khuyen_mai_id')->nullable()->constrained('KhuyenMai');
            $table->foreignId('nhan_vien_duoc_yeu_cau_id')->nullable()->constrained('NhanVien');
            
            $table->enum('phuong_an_thay_the', [
                'TimNhanVienYeuThich',
                'TimNhanVienTieuChuan',
                'KhongTimThayThe',
            ])->nullable();

            $table->boolean('is_giu_nhan_vien')->default(false);
            $table->integer('tong_so_buoi')->default(1);
            $table->boolean('is_lap_lai_hang_tuan');
            $table->string('cac_ngay_trong_tuan', 50)->nullable();
            $table->time('gio_lam_mac_dinh')->nullable();
            $table->integer('so_thang_goi_thang')->nullable();
            $table->enum('ca_lam_247', ['Ngay', 'Dem', 'CaNgay'])->nullable();
            $table->integer('so_ngay_goi_247')->nullable();
            $table->integer('tld_giam_goi_thang')->default(0);
            
            $table->date('ngay_bat_dau');
            $table->date('ngay_ket_thuc');
            $table->string('ho_ten_thuc_te', 150);
            $table->string('sdt_thuc_te', 15);
            $table->string('dia_chi_thuc_te', 255);
            $table->text('ghi_chu_cho_nhan_vien')->nullable();
            
            $table->boolean('is_cao_cap')->default(false);
            $table->integer('ty_le_phu_phi_cao_cap_snapshot')->default(0);
            $table->decimal('phu_phi_cao_cap', 12, 2)->default(0.00);
            $table->boolean('co_thu_cung')->default(false);
            $table->boolean('uu_tien_nv_yt')->default(false);
            $table->decimal('phu_phi_chon_nhan_vien', 12, 2)->default(0.00);
            $table->decimal('don_gia_co_ban', 12, 2)->nullable();
            $table->decimal('tong_tien_ban_dau', 12, 2);
            $table->decimal('phu_phi_dat_gap', 12, 2)->default(0.00);
            $table->decimal('tong_tien_cuoi_cung', 12, 2);
            $table->decimal('tien_giam_giu', 12, 2)->default(0.00);
            
            // CHUYỂN SANG ENUM: Hình thức thanh toán đơn hàng
            $table->enum('phuong_thuc_tt', ['ViTien', 'ChuyenKhoan', 'Online', 'TienMat']);
            // CHUYỂN SANG ENUM: Tiến độ dòng tiền thanh toán đơn hàng
            $table->enum('trang_thai_thanh_toan', ['ChuaThanhToan', 'DaThanhToan', 'HoanTien'])->default('ChuaThanhToan');
            $table->string('ma_giao_dich_online', 255)->nullable();
            // CHUYỂN SANG ENUM: Tiến độ hoàn thành của tổng đơn
            $table->enum('trang_thai_don', ['ChoXuLy', 'DangThucHien', 'DaHoanThanh', 'DaHuy']);
            $table->dateTime('ngay_tao')->useCurrent();

            $table->index(['khach_hang_id', 'trang_thai_don'], 'idx_donhang_khach_trangthai');
            $table->index('ngay_tao', 'idx_donhang_ngaytao');
        });

        // 25. DonHang_DichVuThem
        Schema::create('DonHang_DichVuThem', function (Blueprint $table) {
            $table->foreignId('don_hang_id')->constrained('DonHang')->cascadeOnDelete();
            $table->foreignId('dich_vu_dich_vu_them_id')->constrained('DichVu_DichVuThem')->cascadeOnDelete();
            $table->integer('so_luong')->default(1);
            $table->decimal('gia_luc_dat', 12, 2);
            $table->primary(['don_hang_id', 'dich_vu_dich_vu_them_id']);
        });

        // 26. CaLamViec (Bảng lõi vận hành)
        Schema::create('CaLamViec', function (Blueprint $table) {
            $table->id();
            $table->foreignId('don_hang_id')->constrained('DonHang');
            $table->foreignId('nhan_vien_id')->nullable()->constrained('NhanVien');
            $table->foreignId('dich_vu_id')->constrained('DichVu');
            
            $table->json('chi_tiet_dich_vu_them')->nullable();
            
            $table->date('ngay_lam');
            $table->time('gio_bat_dau');
            $table->integer('thoi_gian_lam_phut');
            // CHUYỂN SANG ENUM: Nhóm ca làm việc tương ứng loại gói dịch vụ
            $table->enum('loai_goi_ca_lam', ['CaLe', 'GoiThang', 'Goi247']);
            $table->string('dia_chi_lam_viec', 255);
            
            $table->decimal('gia_ca_nay', 12, 2);
            $table->decimal('hoa_hong_app', 12, 2);
            $table->decimal('thuc_nhan_nv', 12, 2);
            
            // CHUYỂN SANG ENUM: Trạng thái chi tiết phục vụ cho cả FE & BE kiểm soát nghiệp vụ nút bấm
            $table->enum('trang_thai_ca', [
                'ChoXacNhan', 
                'ChoNhanVienChiDinhXacNhan', 
                'ChoNhanVienTuDoNhan', 
                'DaNhan', 
                'NhanVienHuy', 
                'KhachHuy', 
                'NhanVienKhongDenLam', 
                'DaHoanThanh'
            ])->default('ChoNhanVienTuDoNhan');
            
            $table->dateTime('thoi_gian_day_len_cho')->nullable();
            // CHUYỂN SANG ENUM: Phương thức ghép nối nhân viên vào ca lẻ này
            $table->enum('loai_ghep', ['TuDong', 'ThuCong'])->default('TuDong');
            
            $table->dateTime('thoi_gian_checkin')->nullable();
            $table->dateTime('thoi_gian_checkout')->nullable();
            $table->text('hinh_anh_xac_minh')->nullable();
            
            $table->integer('sao_danh_gia')->nullable();
            $table->text('noi_dung_danh_gia')->nullable();
            $table->dateTime('ngay_danh_gia')->nullable();

            $table->index(['ngay_lam', 'trang_thai_ca'], 'idx_ngay_trang_thai');
            $table->index(['nhan_vien_id', 'ngay_lam'], 'idx_nhanvien_ngaylam');
        });

        // 27. YeuCauXuLy (Khiếu nại/Đổi lịch/Huỷ ngang đơn hàng)
        Schema::create('YeuCauXuLy', function (Blueprint $table) {
            $table->id();
            // CHUYỂN SANG ENUM: Phạm vi tác động của yêu cầu xử lý
            $table->enum('loai_cap_do_yeu_cau', ['DonHang', 'CaLam']);
            $table->foreignId('don_hang_id')->nullable()->constrained('DonHang')->cascadeOnDelete();
            $table->foreignId('ca_lam_viec_id')->nullable()->constrained('CaLamViec')->cascadeOnDelete();
            // CHUYỂN SANG ENUM: Đối tượng thực hiện gửi yêu cầu lên hệ thống
            $table->enum('nguoi_yeu_cau_loai', ['KhachHang', 'NhanVien']);
            $table->integer('nguoi_yeu_cau_id');
            // CHUYỂN SANG ENUM: Loại hình hành động nghiệp vụ cần can thiệp
            $table->enum('loai_yeu_cau', ['HuyDonToanGoi', 'HuyCaLe', 'DoiLich', 'DoiNhanVien']);
            $table->text('ly_do');
            // CHUYỂN SANG ENUM
            $table->enum('trang_thai_duyet', ['ChoXuLy', 'DaDuyet', 'TuChoi', 'TuDongDuyet'])->default('DaDuyet');
            $table->decimal('so_tien_hoan_tra', 12, 2)->default(0.00);
            $table->decimal('so_tien_phat', 12, 2)->default(0.00);
            $table->dateTime('thoi_gian')->useCurrent();
        });

        // 28. GiaoDichVi
        Schema::create('GiaoDichVi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vi_tien_id')->nullable()->constrained('ViTien')->cascadeOnDelete();
            $table->foreignId('vi_he_thong_id')->nullable()->constrained('ViHeThong');
            $table->string('ma_giao_dich', 100)->unique();
            // CHUYỂN SANG ENUM: Mục đích dòng tiền di chuyển
            $table->enum('loai_giao_dich', ['NapTien', 'RutTien', 'ThanhToanDonHang', 'HoanTien', 'NhanLuongCaLam', 'PhatHuyDon']);
            // CHUYỂN SANG ENUM: Hướng đi của dòng tiền đối với ví đích
            $table->enum('loai_bien_dong', ['Tang', 'Giam']);
            $table->decimal('so_tien', 12, 2);
            $table->decimal('so_du_sau_giao_dich', 12, 2);
            $table->unsignedBigInteger('ma_tham_chieu_he_thong')->nullable();
            $table->string('noi_dung', 255);
            // CHUYỂN SANG ENUM: Trạng thái lệnh thanh toán/rút nạp
            $table->enum('trang_thai', ['ThanhCong', 'DangXuLy', 'TuChoi'])->default('ThanhCong');
            $table->dateTime('thoi_gian')->useCurrent();

            $table->index(['vi_tien_id', 'thoi_gian'], 'idx_giaodich_vitien_thoigian');
            $table->index(['loai_giao_dich', 'trang_thai'], 'idx_giaodich_loai');
        });

        // 29. LogThanhToanOnline
        Schema::create('LogThanhToanOnline', function (Blueprint $table) {
            $table->id();
            $table->foreignId('don_hang_id')->constrained('DonHang');
            $table->string('nha_cung_cap_tt', 50); // MoMo, VNPAY, v.v.
            $table->string('ma_giao_dich_noi_bo', 100)->unique();
            $table->string('ma_giao_dich_doi_tac', 255)->nullable();
            $table->decimal('so_tien_giao_dich', 12, 2);
            // CHUYỂN SANG ENUM: Trạng thái webhook trả về từ cổng thanh toán gateway
            $table->enum('trang_thai_giao_dich', ['DangXuLy', 'ThanhCong', 'ThatBai'])->default('DangXuLy');
            $table->string('ma_loi_api', 50)->nullable();
            $table->string('tin_nhan_loi', 255)->nullable();
            $table->text('du_lieu_gui_di_json')->nullable();
            $table->text('du_lieu_tra_ve_json')->nullable();
            $table->dateTime('ngay_tao_giao_dich')->useCurrent();
            $table->dateTime('ngay_cap_nhat')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        Schema::dropIfExists('LogThanhToanOnline');
        Schema::dropIfExists('GiaoDichVi');
        Schema::dropIfExists('YeuCauXuLy');
        Schema::dropIfExists('CaLamViec');
        Schema::dropIfExists('DonHang_DichVuThem');
        Schema::dropIfExists('DonHang');

        Schema::enableForeignKeyConstraints();
    }
};
