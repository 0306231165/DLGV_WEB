<?php

namespace App\Http\Controllers;

use App\Models\KhuyenMai;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KhuyenMaiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(KhuyenMai $khuyenMai)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, KhuyenMai $khuyenMai)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(KhuyenMai $khuyenMai)
    {
        //
    }

    public function getPublicVouchers()
    {
        $now = now();

        // 1. Lấy danh sách nhóm dịch vụ để làm Dropdown (chỉ lấy các nhóm đang hoạt động)
        $serviceGroups = DB::table('NhomDichVu')
            ->where('trang_thai', true)
            ->orderBy('thu_tu_hien_thi')
            ->select('id as value', 'ten_nhom as label')
            ->get();

        // 2. Lấy danh sách khuyến mãi kèm theo nhom_dich_vu_id
        $vouchers = DB::table('KhuyenMai')
            ->leftJoin('DichVu', 'KhuyenMai.dich_vu_id_ap_dung', '=', 'DichVu.id')
            ->where('KhuyenMai.trang_thai', true)
            ->where('ngay_bat_dau', '<=', $now)
            ->where('ngay_ket_thuc', '>=', $now)
            ->whereColumn('so_luong_da_luu', '<', 'tong_luot_luu_toi_da')
            ->select(
                'KhuyenMai.*',
                // Cột này sẽ quyết định mã KM nằm ở tab Dropdown nào trên Frontend
                DB::raw('COALESCE(KhuyenMai.nhom_dich_vu_id_ap_dung, DichVu.nhom_dich_vu_id) as nhom_dich_vu_id_mapped')
            )
            ->orderBy('ngay_ket_thuc', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'service_groups' => $serviceGroups,
            'vouchers' => $vouchers
        ]);
    }
}
