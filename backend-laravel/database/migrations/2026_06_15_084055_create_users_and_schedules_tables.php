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
        // 14. KhachHang
        Schema::create('KhachHang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tai_khoan_id')->unique()->constrained('TaiKhoan')->cascadeOnDelete();
        });

        // 15. NhanVien
        Schema::create('NhanVien', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tai_khoan_id')->unique()->constrained('TaiKhoan')->cascadeOnDelete();
            $table->string('cccd', 20)->unique();
            $table->string('dia_chi', 255);
            $table->decimal('danh_gia_sao_trung_binh', 3, 2)->default(5.00);
            $table->integer('tong_so_danh_gia')->default(0);
            $table->integer('tong_so_ca_hoan_thanh')->default(0);
            $table->integer('tong_gio_lam')->default(0);
        });

        // 16. ViTien
        Schema::create('ViTien', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tai_khoan_id')->unique()->constrained('TaiKhoan')->cascadeOnDelete();
            $table->decimal('so_du', 12, 2)->default(0.00);
            $table->dateTime('ngay_cap_nhat')->useCurrent()->useCurrentOnUpdate();
        });

        // 17. ThongTinNganHang
        Schema::create('ThongTinNganHang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tai_khoan_id')->constrained('TaiKhoan')->cascadeOnDelete();
            $table->string('ten_ngan_hang', 100);
            $table->string('so_tai_khoan', 50);
            $table->string('chu_tai_khoan', 150);
            $table->string('chi_nhanh', 150)->nullable();
            $table->boolean('trang_thai')->default(true);
            $table->dateTime('ngay_lien_ket')->useCurrent();
        });

        // 18. DiaChiDaLuu
        Schema::create('DiaChiDaLuu', function (Blueprint $table) {
            $table->id();
            $table->foreignId('khach_hang_id')->constrained('KhachHang')->cascadeOnDelete();
            $table->string('ten_goi_nho', 100);
            $table->string('dia_chi_chi_tiet', 255);
        });

        // 19. LienHeDaLuu
        Schema::create('LienHeDaLuu', function (Blueprint $table) {
            $table->id();
            $table->foreignId('khach_hang_id')->constrained('KhachHang')->cascadeOnDelete();
            $table->string('ten_nguoi_nhan', 150);
            $table->string('sdt_nhan', 15);
        });

        // 20. NhanVienYeuThich
        Schema::create('NhanVienYeuThich', function (Blueprint $table) {
            $table->foreignId('khach_hang_id')->constrained('KhachHang')->cascadeOnDelete();
            $table->foreignId('nhan_vien_id')->constrained('NhanVien')->cascadeOnDelete();
            $table->primary(['khach_hang_id', 'nhan_vien_id']);
        });

        // 21. NhanVien_DichVu
        Schema::create('NhanVien_DichVu', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nhan_vien_id')->constrained('NhanVien')->cascadeOnDelete();
            $table->foreignId('dich_vu_id')->constrained('DichVu')->cascadeOnDelete();
            // CHUYỂN SANG ENUM: Trạng thái phê duyệt kỹ năng phục vụ của NV
            $table->enum('trang_thai_duyet', ['ChoDuyet', 'DaDuyet', 'TuChoi'])->default('ChoDuyet');
            $table->dateTime('ngay_dang_ky')->useCurrent();
            $table->dateTime('ngay_duyet')->nullable();
            $table->unique(['nhan_vien_id', 'dich_vu_id'], 'unique_nhanvien_dichvu');
        });

        // 22. LichNghi
        Schema::create('LichNghi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nhan_vien_id')->constrained('NhanVien')->cascadeOnDelete();
            // CHUYỂN SANG ENUM: Bản chất ngày nghỉ (Định kỳ hàng tuần hay phát sinh đột xuất)
            $table->enum('loai_nghi', ['DinhKy', 'DotXuat']);
            $table->integer('thu_trong_tuan')->nullable();
            $table->date('ngay_nghi')->nullable();
            $table->time('gio_bat_dau_nghi')->nullable();
            $table->time('gio_ket_thuc_nghi')->nullable();
            $table->date('ngay_bat_dau_ap_dung')->nullable();
            $table->date('ngay_ket_thuc_ap_dung')->nullable();
            $table->string('ly_do', 255)->nullable();
            // CHUYỂN SANG ENUM: Trạng thái chốt đơn xin nghỉ
            $table->enum('trang_thai_duyet', ['ChoDuyet', 'DaDuyet', 'TuChoi'])->default('DaDuyet');
            
            $table->index(['nhan_vien_id', 'ngay_bat_dau_ap_dung', 'ngay_ket_thuc_ap_dung'], 'idx_thoigian_ap_dung');
            $table->index(['nhan_vien_id', 'ngay_nghi'], 'idx_ngay_dot_xuat');
        });

        // 23. LogThayDoiLich
        Schema::create('LogThayDoiLich', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nhan_vien_id')->constrained('NhanVien')->cascadeOnDelete();
            // CHUYỂN SANG ENUM: Hành động tác động lịch làm việc
            $table->enum('loai_thay_doi', ['ThemLich', 'SuaLich', 'XinNghi', 'HuyNghi']);
            $table->text('noi_dung_thay_doi');
            $table->dateTime('thoi_gian_tao')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        Schema::dropIfExists('LogThayDoiLich');
        Schema::dropIfExists('LichNghi');
        Schema::dropIfExists('NhanVien_DichVu');
        Schema::dropIfExists('NhanVienYeuThich');
        Schema::dropIfExists('LienHeDaLuu');
        Schema::dropIfExists('DiaChiDaLuu');
        Schema::dropIfExists('ThongTinNganHang');
        Schema::dropIfExists('ViTien');
        Schema::dropIfExists('NhanVien');
        Schema::dropIfExists('KhachHang');

        Schema::enableForeignKeyConstraints();
    }
};
