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
            
            $table->string('phuong_an_thay_the', 100)->nullable();
            $table->boolean('is_giu_nhan_vien')->default(false);
            $table->integer('tong_so_buoi')->default(1);
            $table->boolean('is_lap_lai_hang_tuan');
            $table->string('cac_ngay_trong_tuan', 50)->nullable();
            $table->time('gio_lam_mac_dinh')->nullable();
            $table->integer('so_thang_goi_thang')->nullable();
            $table->string('ca_lam_247', 50)->nullable();
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
            
            $table->string('phuong_thuc_tt', 50);
            $table->string('trang_thai_thanh_toan', 50)->default('ChuaThanhToan');
            $table->string('ma_giao_dich_online', 255)->nullable();
            $table->string('trang_thai_don', 50);
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

        // 26. CaLamViec
        Schema::create('CaLamViec', function (Blueprint $table) {
            $table->id();
            $table->foreignId('don_hang_id')->constrained('DonHang');
            $table->foreignId('nhan_vien_id')->nullable()->constrained('NhanVien');
            $table->foreignId('dich_vu_id')->constrained('DichVu');
            
            $table->json('chi_tiet_dich_vu_them')->nullable();
            
            $table->date('ngay_lam');
            $table->time('gio_bat_dau');
            $table->integer('thoi_gian_lam_phut');
            $table->string('loai_goi_ca_lam', 50);
            $table->string('dia_chi_lam_viec', 255);
            
            $table->decimal('gia_ca_nay', 12, 2);
            $table->decimal('hoa_hong_app', 12, 2);
            $table->decimal('thuc_nhan_nv', 12, 2);
            
            $table->string('trang_thai_ca', 50)->default('ChoNhanVienTuDoNhan');
            $table->dateTime('thoi_gian_day_len_cho')->nullable();
            $table->string('loai_ghep', 50)->default('TuDong');
            
            $table->dateTime('thoi_gian_checkin')->nullable();
            $table->dateTime('thoi_gian_checkout')->nullable();
            $table->text('hinh_anh_xac_minh')->nullable();
            
            $table->integer('sao_danh_gia')->nullable();
            $table->text('noi_dung_danh_gia')->nullable();
            $table->dateTime('ngay_danh_gia')->nullable();

            $table->index(['ngay_lam', 'trang_thai_ca'], 'idx_ngay_trang_thai');
            $table->index(['nhan_vien_id', 'ngay_lam'], 'idx_nhanvien_ngaylam');
        });

        // 27. YeuCauXuLy
        Schema::create('YeuCauXuLy', function (Blueprint $table) {
            $table->id();
            $table->string('loai_cap_do_yeu_cau', 50);
            $table->foreignId('don_hang_id')->nullable()->constrained('DonHang')->cascadeOnDelete();
            $table->foreignId('ca_lam_viec_id')->nullable()->constrained('CaLamViec')->cascadeOnDelete();
            $table->string('nguoi_yeu_cau_loai', 50);
            $table->integer('nguoi_yeu_cau_id');
            $table->string('loai_yeu_cau', 50);
            $table->text('ly_do');
            $table->string('trang_thai_duyet', 50)->default('ChoXuLy');
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
            $table->string('loai_giao_dich', 50);
            $table->string('loai_bien_dong', 10);
            $table->decimal('so_tien', 12, 2);
            $table->decimal('so_du_sau_giao_dich', 12, 2);
            $table->unsignedBigInteger('ma_tham_chieu_he_thong')->nullable();
            $table->string('noi_dung', 255);
            $table->string('trang_thai', 50)->default('ThanhCong');
            $table->dateTime('thoi_gian')->useCurrent();

            $table->index(['vi_tien_id', 'thoi_gian'], 'idx_giaodich_vitien_thoigian');
            $table->index(['loai_giao_dich', 'trang_thai'], 'idx_giaodich_loai');
        });

        // 29. LogThanhToanOnline
        Schema::create('LogThanhToanOnline', function (Blueprint $table) {
            $table->id();
            $table->foreignId('don_hang_id')->constrained('DonHang');
            $table->string('nha_cung_cap_tt', 50);
            $table->string('ma_giao_dich_noi_bo', 100)->unique();
            $table->string('ma_giao_dich_doi_tac', 255)->nullable();
            $table->decimal('so_tien_giao_dich', 12, 2);
            $table->string('trang_thai_giao_dich', 50)->default('DangXuLy');
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
