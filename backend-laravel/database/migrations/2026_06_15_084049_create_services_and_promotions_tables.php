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
        // 9. DichVu
        Schema::create('DichVu', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nhom_dich_vu_id')->constrained('NhomDichVu');
            $table->string('ten_dich_vu', 255);
            $table->string('cap_do_dich_vu', 50);
            $table->boolean('is_noi_bat')->default(false);
            $table->boolean('co_bien_the');
            $table->decimal('don_gia_co_ban', 12, 2)->nullable();
            $table->integer('thoi_gian_chuan_co_ban')->nullable();
            $table->string('mo_ta', 500)->nullable();
            $table->longText('noi_dung_chi_tiet')->nullable();
            $table->boolean('trang_thai')->default(true);
        });

        // 10. KhuyenMai
        Schema::create('KhuyenMai', function (Blueprint $table) {
            $table->id();
            $table->string('ma_code', 50)->unique();
            $table->string('tag_hien_thi', 100)->nullable();
            $table->string('tieu_de', 255);
            $table->text('mo_ta')->nullable();
            $table->foreignId('dich_vu_id_ap_dung')->nullable()->constrained('DichVu');
            $table->decimal('gia_tri_don_toi_thieu', 12, 2)->default(0);
            $table->string('loai_giam_gia', 50);
            $table->decimal('gia_tri_giam', 12, 2);
            $table->decimal('giam_toi_da', 12, 2)->nullable();
            $table->dateTime('ngay_bat_dau');
            $table->dateTime('ngay_ket_thuc');
            $table->integer('luot_dung_moi_khach')->default(1);
            $table->integer('tong_luot_luu_toi_da');
            $table->integer('so_luong_da_luu')->default(0);
            $table->integer('tong_luot_dung_toi_da_toan_san');
            $table->integer('so_luong_da_dung')->default(0);
            $table->boolean('trang_thai')->default(true);
            $table->index(['trang_thai', 'ngay_bat_dau', 'ngay_ket_thuc'], 'idx_khuyenmai_hieuluc');
        });

        // 11. TuyChonBienTheDichVu
        Schema::create('TuyChonBienTheDichVu', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dich_vu_id')->constrained('DichVu');
            $table->string('ten_tuy_chon', 150);
            $table->string('don_vi_tinh', 50)->default('Phut');
            $table->integer('thoi_gian_chuan');
            $table->decimal('don_gia', 12, 2);
            $table->boolean('trang_thai')->default(true);
        });

        // 12. DichVu_LoaiGoi
        Schema::create('DichVu_LoaiGoi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dich_vu_id')->constrained('DichVu')->cascadeOnDelete();
            $table->foreignId('loai_goi_id')->constrained('LoaiGoiDichVu')->cascadeOnDelete();
            $table->boolean('trang_thai')->default(true);
            $table->unique(['dich_vu_id', 'loai_goi_id'], 'unique_dichvu_loaigoi');
        });

        // 13. DichVu_DichVuThem
        Schema::create('DichVu_DichVuThem', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dich_vu_id')->constrained('DichVu')->cascadeOnDelete();
            $table->foreignId('dich_vu_them_id')->constrained('DichVuThem')->cascadeOnDelete();
            $table->decimal('gia_cong_them', 12, 2);
            $table->integer('thoi_gian_cong');
            $table->boolean('trang_thai')->default(true);
            $table->unique(['dich_vu_id', 'dich_vu_them_id'], 'unique_dv_dvthem');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        Schema::dropIfExists('DichVu_DichVuThem');
        Schema::dropIfExists('DichVu_LoaiGoi');
        Schema::dropIfExists('TuyChonBienTheDichVu');
        Schema::dropIfExists('KhuyenMai');
        Schema::dropIfExists('DichVu');

        Schema::enableForeignKeyConstraints();
    }
};
