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
        // 30. KhieuNai
        Schema::create('KhieuNai', function (Blueprint $table) {
            $table->id();
            $table->foreignId('don_hang_id')->constrained('DonHang');
            $table->string('nguoi_khieu_nai_loai', 50);
            $table->integer('nguoi_khieu_nai_id');
            $table->string('ly_do_khieu_nai', 255);
            $table->text('mo_ta_chi_tiet')->nullable();
            $table->text('hinh_anh_bang_chung')->nullable();
            $table->string('trang_thai_xu_ly', 50)->default('DangXuLy');
            $table->text('ket_qua_xu_ly')->nullable();
            $table->dateTime('ngay_tao')->useCurrent();
            $table->dateTime('ngay_dong')->nullable();
            $table->foreignId('admin_xu_ly_id')->nullable()->constrained('TaiKhoanAdmin');
        });

        // 31. KhachHang_KhuyenMai
        Schema::create('KhachHang_KhuyenMai', function (Blueprint $table) {
            $table->id();
            $table->foreignId('khach_hang_id')->constrained('KhachHang')->cascadeOnDelete();
            $table->foreignId('khuyen_mai_id')->constrained('KhuyenMai')->cascadeOnDelete();
            $table->dateTime('ngay_luu')->useCurrent();
            $table->dateTime('ngay_su_dung')->nullable();
            $table->string('trang_thai_luu', 50)->default('DaLuu');
            $table->unique(['khach_hang_id', 'khuyen_mai_id'], 'unique_khachhang_khuyenmai');
        });

        // 32. ThongBao
        Schema::create('ThongBao', function (Blueprint $table) {
            $table->id();
            $table->string('loai_nguoi_nhan', 50);
            $table->integer('nguoi_nhan_id');
            $table->string('tieu_de', 255);
            $table->text('noi_dung');
            $table->dateTime('ngay_tao')->useCurrent();
            $table->boolean('is_da_doc')->default(false);
            $table->string('loai_doi_tuong', 50)->nullable();
            $table->integer('doi_tuong_id')->nullable();
        });

        // 33. PhongChat
        Schema::create('PhongChat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('khach_hang_id')->constrained('KhachHang')->cascadeOnDelete();
            $table->foreignId('nhan_vien_id')->constrained('NhanVien')->cascadeOnDelete();
            $table->foreignId('don_hang_id')->nullable()->constrained('DonHang')->nullOnDelete();
            $table->dateTime('thoi_gian_nhan_tin_cuoi')->useCurrent();
            $table->string('trang_thai_phong', 50)->default('DangHoatDong');
            $table->index('thoi_gian_nhan_tin_cuoi', 'idx_phongchat_thoigiancuoi');
        });

        // 34. TinNhan
        Schema::create('TinNhan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('phong_chat_id')->constrained('PhongChat')->cascadeOnDelete();
            $table->string('nguoi_gui_loai', 50);
            $table->integer('nguoi_gui_id');
            $table->text('noi_dung');
            $table->boolean('is_bi_chan')->default(false);
            $table->boolean('trang_thai_doc')->default(false);
            $table->dateTime('thoi_gian_gui')->useCurrent();
            $table->index(['phong_chat_id', 'thoi_gian_gui'], 'idx_tinnhan_phong_thoigian');
        });

        // 35. LichSuCuocGoi
        Schema::create('LichSuCuocGoi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('phong_chat_id')->constrained('PhongChat')->cascadeOnDelete();
            $table->string('nguoi_goi_loai', 50);
            $table->integer('nguoi_goi_id');
            $table->string('nguoi_nhan_loai', 50);
            $table->integer('nguoi_nhan_id');
            $table->dateTime('thoi_gian_bat_dau')->useCurrent();
            $table->dateTime('thoi_gian_ket_thuc')->nullable();
            $table->integer('thoi_luong_giay')->default(0);
            $table->string('trang_thai_cuoc_goi', 50);
        });

        // 36. LienHe (Khách vãng lai)
        Schema::create('LienHe', function (Blueprint $table) {
            $table->id();
            $table->string('ho_ten', 150);
            $table->string('so_dien_thoai', 15);
            $table->string('email', 100)->nullable();
            $table->string('tieu_de', 255)->nullable();
            $table->text('noi_dung');
            $table->string('trang_thai', 50)->default('ChuaXuLy');
            $table->dateTime('ngay_gui')->useCurrent();
            $table->foreignId('admin_xu_ly_id')->nullable()->constrained('TaiKhoanAdmin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        Schema::dropIfExists('LienHe');
        Schema::dropIfExists('LichSuCuocGoi');
        Schema::dropIfExists('TinNhan');
        Schema::dropIfExists('PhongChat');
        Schema::dropIfExists('ThongBao');
        Schema::dropIfExists('KhachHang_KhuyenMai');
        Schema::dropIfExists('KhieuNai');

        Schema::enableForeignKeyConstraints();
    }
};
