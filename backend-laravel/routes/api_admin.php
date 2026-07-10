<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\NhomDichVuController;
use App\Http\Controllers\DichVuController;
use App\Http\Controllers\DonHangController;
use App\Http\Controllers\AdminAccountController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\KhuyenMaiController;
use App\Http\Controllers\QuyDinhPhuPhiController;
use App\Http\Controllers\KhieuNaiController;
use App\Http\Controllers\AdminApprovalController;
use App\Http\Controllers\AdminBookingController;
use App\Http\Controllers\AdminEmployeeStatsController;
use App\Http\Controllers\AdminServiceStatsController;
// --- CÁC ROUTE ĐANG LÀM GIAO DIỆN CHƯA CẦN BẢO MẬT (Để ra ngoài này) ---
Route::prefix('admin')->group(function () {
    Route::get('/users', [AdminAccountController::class, 'index']);
    Route::patch('/users/{id}/status', [AdminAccountController::class, 'updateStatus']);
    Route::post('/users', [AdminAccountController::class, 'store']);
    Route::delete('/users/{id}', [AdminAccountController::class, 'destroy']);
    
    // Approval Routes
    Route::get('/approvals', [AdminApprovalController::class, 'index']);
    Route::put('/approvals/{id}/approve', [AdminApprovalController::class, 'approve']);
    Route::put('/approvals/{id}/reject', [AdminApprovalController::class, 'reject']);

    // Duyệt kỹ năng bổ sung cho đối tác đang hoạt động
    Route::get('/skills-approvals', [AdminApprovalController::class, 'getPendingSkills']);
    Route::put('/skills-approvals/{nhan_vien_id}/{dich_vu_id}/approve', [AdminApprovalController::class, 'approveSkill']);
    Route::put('/skills-approvals/{nhan_vien_id}/{dich_vu_id}/reject', [AdminApprovalController::class, 'rejectSkill']);

    // Booking Routes
    Route::get('/bookings', [AdminBookingController::class, 'index']);
    Route::put('/bookings/{id}/assign', [AdminBookingController::class, 'assign']);

    Route::get('/recent-orders', [AdminDashboardController::class, 'recentOrders']);
    Route::get('/reports', [AdminDashboardController::class, 'getReports']);
    Route::get('/employee-stats', [AdminEmployeeStatsController::class, 'index']);
    Route::get('/service-stats', [AdminServiceStatsController::class, 'index']);
});

// --- CÁC ROUTE CẦN ĐĂNG NHẬP MỚI ĐƯỢC XEM (Để trong này) ---
Route::middleware(['auth:sanctum', 'ability:role:admin'])->prefix('admin')->group(function () {
    Route::get('/nhom-dich-vu', [NhomDichVuController::class, 'index']);
    Route::post('/nhom-dich-vu/them', [NhomDichVuController::class, 'store']);
    Route::put('/nhom-dich-vu/{id}/sua', [NhomDichVuController::class, 'update']);

    Route::get('/dich-vu', [DichVuController::class, 'indexAdmin']);
    Route::post('/dich-vu/them', [DichVuController::class, 'store']);
    Route::put('/dich-vu/{id}', [DichVuController::class, 'update']);
    Route::delete('/dich-vu/{id}', [DichVuController::class, 'destroy']);
    Route::get('/tuy-chon-bien-the', [DichVuController::class, 'getAllTuyChonBienThe']);

    Route::get('/khuyen-mai', [KhuyenMaiController::class, 'indexAdmin']);
    Route::post('/khuyen-mai/them', [KhuyenMaiController::class, 'store']);
    Route::put('/khuyen-mai/{id}/trang-thai', [KhuyenMaiController::class, 'updateStatus']);
    Route::delete('/khuyen-mai/{id}', [KhuyenMaiController::class, 'destroy']);

    Route::get('/don-hang/tat-ca', [DonHangController::class, 'index']);
    Route::get('/don-hang/{id}/chi-tiet', [DonHangController::class, 'show']);

    Route::get('/quy-dinh-phu-phi', [QuyDinhPhuPhiController::class, 'index']);
    Route::put('/quy-dinh-phu-phi/{id}', [QuyDinhPhuPhiController::class, 'update']);

    Route::get('/khieu-nai', [KhieuNaiController::class, 'indexAdmin']);
    Route::put('/khieu-nai/{id}/phan-hoi', [KhieuNaiController::class, 'updateReply']);
    Route::put('/khieu-nai/{id}/trang-thai-hien-thi', [KhieuNaiController::class, 'toggleVisibility']);
    Route::delete('/khieu-nai/{id}', [KhieuNaiController::class, 'destroy']);

    Route::get('/danh-gia', [KhieuNaiController::class, 'indexReviews']);
    Route::put('/danh-gia/{id}/phan-hoi', [KhieuNaiController::class, 'updateReviewReply']);
    Route::put('/danh-gia/{id}/trang-thai-hien-thi', [KhieuNaiController::class, 'toggleReviewVisibility']);
    Route::delete('/danh-gia/{id}', [KhieuNaiController::class, 'deleteReview']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});