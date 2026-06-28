<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function recentOrders()
    {
        // Khắc phục lỗi join sai bảng: donhang.khach_hang_id phải join với khachhang.id, sau đó mới join tới taikhoan
        $orders = DB::table('donhang')
            ->join('khachhang', 'donhang.khach_hang_id', '=', 'khachhang.id')
            ->join('taikhoan', 'khachhang.tai_khoan_id', '=', 'taikhoan.id') 
            ->select(
                'donhang.id', 
                'donhang.trang_thai_don', 
                'donhang.ngay_tao', 
                'taikhoan.ho_ten'
            )
            ->orderBy('donhang.ngay_tao', 'desc')
            ->take(10)
            ->get();

        $formattedOrders = $orders->map(function ($order) {
            
            // Lấy trạng thái đúng từ ảnh 2
            $status = $order->trang_thai_don; 
            $displayStatus = 'Đang chờ';
            
            // So sánh chuẩn xác với chữ 'DaHoanThanh' và 'DaHuy'
            if ($status === 'DaHoanThanh') {
                $displayStatus = 'Hoàn thành';
            } elseif ($status === 'DaHuy') {
                $displayStatus = 'Đã hủy';
            }

            return [
                // Trả về đúng ID thật từ MySQL (Ví dụ: ĐH-1, ĐH-2...)
                'ma_don' => 'ĐH-' . $order->id, 
                'khach_hang' => $order->ho_ten, 
                'ngay_dat' => date('d/m/Y H:i:s', strtotime($order->ngay_tao)),
                'trang_thai' => $displayStatus,
            ];
        });

        return response()->json($formattedOrders);
    }

    public function getReports(Request $request)
    {
        try {
            $now = \Carbon\Carbon::now();
            $currentMonthStart = $now->copy()->startOfMonth();
            $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
            $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();

            // 1. Overview Stats
            $totalRevenue = DB::table('donhang')
                ->where('trang_thai_don', 'DaHoanThanh')
                ->sum('tong_tien_cuoi_cung');

            $currentMonthRevenue = DB::table('donhang')
                ->where('trang_thai_don', 'DaHoanThanh')
                ->where('ngay_tao', '>=', $currentMonthStart)
                ->sum('tong_tien_cuoi_cung');

            $lastMonthRevenue = DB::table('donhang')
                ->where('trang_thai_don', 'DaHoanThanh')
                ->whereBetween('ngay_tao', [$lastMonthStart, $lastMonthEnd])
                ->sum('tong_tien_cuoi_cung');

            $monthlyGrowth = 0;
            if ($lastMonthRevenue > 0) {
                $monthlyGrowth = (($currentMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100;
            } elseif ($currentMonthRevenue > 0) {
                $monthlyGrowth = 100;
            }

            $activeUsers = DB::table('donhang')
                ->where('ngay_tao', '>=', $now->copy()->subDays(30))
                ->distinct('khach_hang_id')
                ->count('khach_hang_id');

            $totalOrdersCount = DB::table('donhang')->count();
            $completedOrdersCount = DB::table('donhang')->where('trang_thai_don', 'DaHoanThanh')->count();
            $completionRate = $totalOrdersCount > 0 ? ($completedOrdersCount / $totalOrdersCount) * 100 : 0;

            $overview = [
                'total_revenue' => $totalRevenue,
                'monthly_growth' => round($monthlyGrowth, 1),
                'active_users' => $activeUsers,
                'total_orders' => $totalOrdersCount,
                'completion_rate' => round($completionRate, 1)
            ];

            // 2. Yearly Data
            $yearlyData = [];
            
            // Get all orders that are completed
            $completedOrders = DB::table('donhang')
                ->join('dichvu_loaigoi', 'donhang.dich_vu_loai_goi_id', '=', 'dichvu_loaigoi.id')
                ->join('dichvu', 'dichvu_loaigoi.dich_vu_id', '=', 'dichvu.id')
                ->select(
                    'donhang.id',
                    'donhang.tong_tien_cuoi_cung',
                    'donhang.ngay_tao',
                    'donhang.trang_thai_don',
                    'dichvu.id as dichvu_id',
                    'dichvu.ten_dich_vu'
                )
                ->get();

            $years = $completedOrders->pluck('ngay_tao')->map(function ($date) {
                return \Carbon\Carbon::parse($date)->year;
            })->unique()->sortDesc()->values()->toArray();

            if (empty($years)) {
                $years = [date('Y')];
            }

            foreach ($years as $year) {
                $ordersInYear = $completedOrders->filter(function ($order) use ($year) {
                    return \Carbon\Carbon::parse($order->ngay_tao)->year == $year;
                });
                
                $completedInYear = $ordersInYear->filter(function ($order) {
                    return $order->trang_thai_don == 'DaHoanThanh';
                });

                // Chart Data
                $chart = [];
                for ($i = 1; $i <= 12; $i++) {
                    $monthRevenue = $completedInYear->filter(function ($order) use ($i) {
                        return \Carbon\Carbon::parse($order->ngay_tao)->month == $i;
                    })->sum('tong_tien_cuoi_cung');

                    // Format amount like 1.8B, 900M
                    $amountFormatted = $monthRevenue >= 1000000000 
                        ? round($monthRevenue / 1000000000, 1) . 'B' 
                        : ($monthRevenue >= 1000000 
                            ? round($monthRevenue / 1000000) . 'M' 
                            : number_format($monthRevenue));
                            
                    if ($monthRevenue == 0) $amountFormatted = '0';

                    $chart[] = [
                        'month' => 'TH ' . $i,
                        'revenue' => $monthRevenue,
                        'amount' => $amountFormatted
                    ];
                }

                // Determine peak month
                $maxRevenue = max(array_column($chart, 'revenue'));
                foreach ($chart as &$c) {
                    $c['value'] = $maxRevenue > 0 ? round(($c['revenue'] / $maxRevenue) * 100) : 0;
                    $c['isPeak'] = ($maxRevenue > 0 && $c['revenue'] == $maxRevenue);
                    unset($c['revenue']);
                }

                // Services Data
                $servicesMap = [];
                foreach ($ordersInYear as $order) {
                    $svcId = $order->dichvu_id;
                    if (!isset($servicesMap[$svcId])) {
                        $servicesMap[$svcId] = [
                            'name' => $order->ten_dich_vu,
                            'orders' => 0,
                            'revenue' => 0
                        ];
                    }
                    $servicesMap[$svcId]['orders'] += 1;
                    if ($order->trang_thai_don == 'DaHoanThanh') {
                        $servicesMap[$svcId]['revenue'] += $order->tong_tien_cuoi_cung;
                    }
                }

                // Sort by orders desc
                usort($servicesMap, function ($a, $b) {
                    return $b['orders'] <=> $a['orders'];
                });

                $totalOrdersInYear = array_sum(array_column($servicesMap, 'orders'));

                $topServices = [];
                $detailedServices = [];
                foreach (array_slice($servicesMap, 0, 5) as $svc) {
                    $percent = $totalOrdersInYear > 0 ? round(($svc['orders'] / $totalOrdersInYear) * 100) : 0;
                    $topServices[] = [
                        'name' => $svc['name'],
                        'percent' => $percent
                    ];

                    // Determine trend randomly or simply by percent for now
                    $trend = 'Ổn định';
                    $trendColor = 'text-slate-600 bg-slate-50 border-slate-100';
                    if ($percent >= 30) {
                        $trend = 'Dẫn đầu thị trường';
                        $trendColor = 'text-purple-700 bg-purple-50 border-purple-100';
                    } elseif ($percent >= 20) {
                        $trend = 'Tăng trưởng mạnh';
                        $trendColor = 'text-emerald-700 bg-emerald-50 border-emerald-100';
                    } elseif ($percent < 10) {
                        $trend = 'Bão hòa';
                        $trendColor = 'text-orange-700 bg-orange-50 border-orange-100';
                    }

                    $detailedServices[] = [
                        'name' => $svc['name'],
                        'orders' => number_format($svc['orders'], 0, ',', '.'),
                        'revenue' => number_format($svc['revenue'], 0, ',', '.') . ' đ',
                        'trend' => $trend,
                        'trendColor' => $trendColor
                    ];
                }

                $yearlyData[$year] = [
                    'chart' => $chart,
                    'topServices' => $topServices,
                    'detailedServices' => $detailedServices
                ];
            }

            // 3. Recent Transactions
            $transactions = DB::table('donhang')
                ->join('khachhang', 'donhang.khach_hang_id', '=', 'khachhang.id')
                ->join('taikhoan', 'khachhang.tai_khoan_id', '=', 'taikhoan.id')
                ->join('dichvu_loaigoi', 'donhang.dich_vu_loai_goi_id', '=', 'dichvu_loaigoi.id')
                ->join('dichvu', 'dichvu_loaigoi.dich_vu_id', '=', 'dichvu.id')
                ->select(
                    'donhang.id',
                    'taikhoan.ho_ten as customer',
                    'taikhoan.avatar',
                    'dichvu.ten_dich_vu as service',
                    'donhang.ngay_tao as date',
                    'donhang.tong_tien_cuoi_cung as amount',
                    'donhang.trang_thai_don as status'
                )
                ->orderBy('donhang.ngay_tao', 'desc')
                ->take(100)
                ->get()
                ->map(function ($tr) {
                    $statusMap = [
                        'ChoXuLy' => 'Đang xử lý',
                        'DangThucHien' => 'Đang xử lý',
                        'DaHoanThanh' => 'Hoàn thành',
                        'DaHuy' => 'Hủy'
                    ];
                    $displayStatus = $statusMap[$tr->status] ?? 'Đang xử lý';
                    
                    // Handle default avatar
                    $avatar = $tr->avatar;
                    if (!$avatar || !filter_var($avatar, FILTER_VALIDATE_URL)) {
                        $avatar = 'https://ui-avatars.com/api/?name=' . urlencode($tr->customer) . '&background=random';
                    }

                    return [
                        'id' => '#CT-' . $tr->id,
                        'customer' => $tr->customer,
                        'avatar' => $avatar,
                        'service' => $tr->service,
                        'date' => date('d/m/Y', strtotime($tr->date)),
                        'amount' => number_format($tr->amount, 0, ',', '.') . ' đ',
                        'status' => $displayStatus
                    ];
                });

            return response()->json([
                'success' => true,
                'overview' => $overview,
                'yearly_data' => $yearlyData,
                'years_available' => $years,
                'transactions' => $transactions
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}