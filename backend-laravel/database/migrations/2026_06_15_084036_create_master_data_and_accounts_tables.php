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
        // 1. NhomDichVu
        Schema::create('NhomDichVu', function (Blueprint $table) {
            $table->id();
            $table->string('ma_nhom', 50)->unique();
            $table->string('ten_nhom', 150);
            $table->string('icon', 500)->nullable();
            $table->integer('thu_tu_hien_thi')->default(0);
            $table->boolean('trang_thai')->default(true);
        });

        // 2. LoaiGoiDichVu
        Schema::create('LoaiGoiDichVu', function (Blueprint $table) {
            $table->id();
            $table->string('ten_loai_goi', 100);
            $table->string('mo_ta', 255)->nullable();
            $table->boolean('trang_thai')->default(true);
        });

        // 3. CauHinhGoiThang
        Schema::create('CauHinhGoiThang', function (Blueprint $table) {
            $table->id();
            $table->integer('so_thang');
            $table->integer('phan_tram_giam');
            $table->boolean('trang_thai')->default(true);
        });

        // 4. DichVuThem
        Schema::create('DichVuThem', function (Blueprint $table) {
            $table->id();
            $table->string('ten_dv_them', 150)->unique();
            $table->string('icon', 255)->nullable();
            $table->string('mo_ta', 255)->nullable();
            $table->boolean('trang_thai')->default(true);
        });

        // 5. QuyDinhPhuPhi
        Schema::create('QuyDinhPhuPhi', function (Blueprint $table) {
            $table->id();
            $table->string('ma_phu_phi', 50)->unique();
            $table->string('ten_phu_phi', 150);
            $table->string('loai_phu_phi', 50)->default('PhanTram');
            $table->decimal('gia_tri_phu_phi', 12, 2);
            $table->boolean('trang_thai')->default(true);
            $table->string('mo_ta', 255)->nullable();
        });

        // 6. TaiKhoan (Gốc)
        Schema::create('TaiKhoan', function (Blueprint $table) {
            $table->id();
            $table->string('so_dien_thoai', 15)->unique();
            $table->string('mat_khau', 255);
            $table->string('ho_ten', 150);
            $table->string('email', 100)->nullable();
            $table->string('avatar', 255)->nullable();
            $table->date('ngay_sinh')->nullable();
            $table->string('gioi_tinh', 10)->nullable();
            $table->string('loai_tai_khoan', 50);
            $table->dateTime('ngay_tao')->useCurrent();
            $table->string('trang_thai', 50)->default('HoatDong');
        });

        // 7. TaiKhoanAdmin
        Schema::create('TaiKhoanAdmin', function (Blueprint $table) {
            $table->id();
            $table->string('ten_dang_nhap', 50)->unique();
            $table->string('mat_khau', 255);
            $table->string('ho_ten', 150);
            $table->string('quyen_han', 50);
            $table->boolean('trang_thai')->default(true);
        });

        // 8. ViHeThong
        Schema::create('ViHeThong', function (Blueprint $table) {
            $table->id();
            $table->string('loai_vi', 50)->unique();
            $table->decimal('tong_so_du', 15, 2)->default(0.00);
            $table->dateTime('ngay_cap_nhat')->useCurrent()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        // Xóa từ dưới lên trên so với hàm up()
        Schema::dropIfExists('ViHeThong');
        Schema::dropIfExists('TaiKhoanAdmin');
        Schema::dropIfExists('TaiKhoan');
        Schema::dropIfExists('QuyDinhPhuPhi');
        Schema::dropIfExists('DichVuThem');
        Schema::dropIfExists('CauHinhGoiThang');
        Schema::dropIfExists('LoaiGoiDichVu');
        Schema::dropIfExists('NhomDichVu');

        Schema::enableForeignKeyConstraints();
    }
};
