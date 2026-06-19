<?php

namespace App\Http\Controllers;

use App\Models\DichVu;
use App\Models\TuyChonBienTheDichVu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DonHangController extends Controller
{
    public function index() {}
    public function show(\App\Models\DonHang $donHang) {}
    public function update(Request $request, \App\Models\DonHang $donHang) {}
    public function destroy(\App\Models\DonHang $donHang) {}

}