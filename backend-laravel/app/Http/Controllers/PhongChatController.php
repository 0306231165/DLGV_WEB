<?php

namespace App\Http\Controllers;

use App\Models\PhongChat;
use App\Models\TinNhan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PhongChatController extends Controller
{
    public function getCustomerRooms(Request $request)
    {
        $khachHangId = Auth::user()->khachHang->id;
        
        // TỰ ĐỘNG ĐỒNG BỘ CÁC ĐƠN HÀNG ĐÃ CÓ NHÂN VIÊN NHƯNG CHƯA TẠO PHÒNG CHAT
        $donHangs = \App\Models\DonHang::where('khach_hang_id', $khachHangId)
            ->whereHas('caLamViec', function($q) {
                $q->whereNotNull('nhan_vien_id');
            })
            ->with(['caLamViec' => function($q) {
                $q->whereNotNull('nhan_vien_id');
            }])
            ->get();
            
        foreach ($donHangs as $dh) {
            $nhanVienIds = $dh->caLamViec->pluck('nhan_vien_id')->unique();
            foreach ($nhanVienIds as $nvId) {
                PhongChat::firstOrCreate([
                    'don_hang_id' => $dh->id,
                    'khach_hang_id' => $khachHangId,
                    'nhan_vien_id' => $nvId,
                ], [
                    'trang_thai_phong' => 'DangHoatDong',
                    'thoi_gian_nhan_tin_cuoi' => $dh->ngay_tao
                ]);
            }
        }
        
        $rooms = PhongChat::with(['donHang.dichVuLoaiGoi.loaiGoi', 'donHang.dichVuLoaiGoi.dichVu', 'nhanVien.taiKhoan', 'tinNhan' => function($q) {
            $q->orderBy('thoi_gian_gui', 'desc')->take(1);
        }])
        ->where('khach_hang_id', $khachHangId)
        ->orderBy('thoi_gian_nhan_tin_cuoi', 'desc')
        ->get();

        $formattedRooms = $rooms->map(function ($room) {
            $isLocked = $room->trang_thai_phong === 'DaDong';
            $status = 'active';
            $statusLabel = 'Đang thực hiện';
            $bookingCode = null;
            $serviceTitle = 'Trò chuyện trực tiếp';
            $type = 'direct';

            if ($room->donHang) {
                $type = 'booking';
                $bookingCode = 'DH-' . str_pad($room->donHang->id, 6, '0', STR_PAD_LEFT);
                $serviceTitle = $room->donHang->dichVuLoaiGoi->dichVu->ten_dich_vu ?? 'Dịch vụ dọn dẹp';
                
                $tt = $room->donHang->trang_thai_don;
                if ($tt === 'DaHoanThanh') {
                    $status = 'completed';
                    $statusLabel = 'Đã hoàn thành';
                    $isLocked = true;
                } else if ($tt === 'DaHuy') {
                    $status = 'cancelled';
                    $statusLabel = 'Đã hủy';
                    $isLocked = true;
                } else if ($tt === 'ChoXuLy') {
                    $status = 'pending';
                    $statusLabel = 'Đã xác nhận';
                } else if ($tt === 'DangThucHien') {
                    $status = 'active';
                    $statusLabel = 'Đang thực hiện';
                }
            }

            $lastMsg = $room->tinNhan->first();
            $lastMsgText = $lastMsg ? $lastMsg->noi_dung : 'Chưa có tin nhắn';
            // Show time if today, else date
            $timeDateStr = $lastMsg ? $lastMsg->thoi_gian_gui : $room->thoi_gian_nhan_tin_cuoi;
            $isToday = date('Y-m-d') === date('Y-m-d', strtotime($timeDateStr));
            $lastMsgTime = $isToday ? date('H:i', strtotime($timeDateStr)) : date('d/m/Y', strtotime($timeDateStr));

            $unreadCount = TinNhan::where('phong_chat_id', $room->id)
                ->where('nguoi_gui_loai', '!=', 'KhachHang')
                ->where('trang_thai_doc', false)
                ->count();

            return [
                'id' => $room->id,
                'type' => $type,
                'bookingCode' => $bookingCode,
                'bookingId' => $room->donHang ? $room->donHang->id : null,
                'serviceTitle' => $serviceTitle,
                'status' => $status,
                'statusLabel' => $statusLabel,
                'staff' => [
                    'id' => $room->nhanVien->id,
                    'name' => $room->nhanVien->taiKhoan->ho_ten ?? 'Nhân viên',
                    'avatar' => $room->nhanVien->taiKhoan->anh_dai_dien ?? 'https://i.pravatar.cc/150',
                    'isOnline' => false,
                    'role' => 'Nhân viên phụ trách',
                    'phone' => $room->nhanVien->taiKhoan->so_dien_thoai ?? ''
                ],
                'lastMessage' => $lastMsgText,
                'lastMessageTime' => $lastMsgTime,
                'unreadCount' => $unreadCount,
                'isLocked' => $isLocked,
            ];
        });

        return response()->json($formattedRooms);
    }

    public function getMessages(Request $request, $id)
    {
        $user = Auth::user();
        $isKhachHang = $user->loai_tai_khoan === 'KhachHang';
        
        $room = PhongChat::findOrFail($id);

        // Kiểm tra quyền
        if ($isKhachHang) {
            if ($room->khach_hang_id !== $user->khachHang->id) abort(403);
            $nguoiGuiKhac = 'NhanVien';
        } else {
            if ($room->nhan_vien_id !== $user->nhanVien->id) abort(403);
            $nguoiGuiKhac = 'KhachHang';
        }

        // Đánh dấu đã đọc
        TinNhan::where('phong_chat_id', $id)
            ->where('nguoi_gui_loai', $nguoiGuiKhac)
            ->where('trang_thai_doc', false)
            ->update(['trang_thai_doc' => true]);

        $messages = TinNhan::where('phong_chat_id', $id)
            ->orderBy('thoi_gian_gui', 'asc')
            ->get()
            ->map(function ($msg) use ($isKhachHang) {
                // Nếu mình là khách hàng, thì tin nhắn của KhachHang là 'customer', của người khác là 'staff'.
                // Ngược lại, nếu mình là nhân viên, thì tin nhắn của NhanVien là 'customer' (phía frontend sẽ coi sender='customer' là 'tôi' - người đang chat),
                // Nhưng khoan, bên frontend PartnerMessagePage dùng logic gì? 
                // Thông thường isMe = msg.sender === 'staff' nếu ở PartnerMessagePage, 
                // hoặc frontend check msg.sender === 'me'.
                // Để thống nhất, thay vì sửa frontend phức tạp, ta trả về: 'customer' và 'staff'.
                return [
                    'id' => $msg->id,
                    'sender' => $msg->nguoi_gui_loai === 'KhachHang' ? 'customer' : 'staff',
                    'text' => $msg->noi_dung,
                    'time' => date('H:i', strtotime($msg->thoi_gian_gui)),
                    'date' => date('Y-m-d', strtotime($msg->thoi_gian_gui)),
                ];
            });

        return response()->json($messages);
    }

    public function sendMessage(Request $request, $id)
    {
        $request->validate([
            'text' => 'required|string'
        ]);

        $user = Auth::user();
        $isKhachHang = $user->loai_tai_khoan === 'KhachHang';
        
        $room = PhongChat::findOrFail($id);

        if ($isKhachHang) {
            if ($room->khach_hang_id !== $user->khachHang->id) abort(403);
            $nguoiGuiLoai = 'KhachHang';
            $nguoiGuiId = $user->khachHang->id;
            $senderLabel = 'customer';
        } else {
            if ($room->nhan_vien_id !== $user->nhanVien->id) abort(403);
            $nguoiGuiLoai = 'NhanVien';
            $nguoiGuiId = $user->nhanVien->id;
            $senderLabel = 'staff';
        }

        if ($room->trang_thai_phong === 'DaDong') {
            return response()->json(['message' => 'Phòng chat đã đóng'], 400);
        }

        $msg = TinNhan::create([
            'phong_chat_id' => $id,
            'nguoi_gui_loai' => $nguoiGuiLoai,
            'nguoi_gui_id' => $nguoiGuiId,
            'noi_dung' => $request->text,
            'thoi_gian_gui' => now(),
        ]);

        $room->thoi_gian_nhan_tin_cuoi = now();
        $room->save();

        return response()->json([
            'id' => $msg->id,
            'sender' => $senderLabel,
            'text' => $msg->noi_dung,
            'time' => date('H:i', strtotime($msg->thoi_gian_gui)),
            'date' => date('Y-m-d', strtotime($msg->thoi_gian_gui)),
        ]);
    }

    public function getStaffRooms(Request $request)
    {
        $nhanVienId = Auth::user()->nhanVien->id;
        
        $rooms = PhongChat::with(['donHang.dichVuLoaiGoi.loaiGoi', 'donHang.dichVuLoaiGoi.dichVu', 'khachHang.taiKhoan', 'tinNhan' => function($q) {
            $q->orderBy('thoi_gian_gui', 'desc')->take(1);
        }])
        ->where('nhan_vien_id', $nhanVienId)
        ->orderBy('thoi_gian_nhan_tin_cuoi', 'desc')
        ->get();

        $formattedRooms = $rooms->map(function ($room) {
            $isLocked = $room->trang_thai_phong === 'DaDong';
            $status = 'active';
            $statusLabel = 'Đang thực hiện';
            $bookingCode = null;
            $serviceTitle = 'Trò chuyện trực tiếp';
            $type = 'direct';

            if ($room->donHang) {
                $type = 'booking';
                $bookingCode = 'DH-' . str_pad($room->donHang->id, 6, '0', STR_PAD_LEFT);
                $serviceTitle = $room->donHang->dichVuLoaiGoi->dichVu->ten_dich_vu ?? 'Dịch vụ dọn dẹp';
                
                $tt = $room->donHang->trang_thai_don;
                if ($tt === 'DaHoanThanh') {
                    $status = 'completed';
                    $statusLabel = 'Đã hoàn thành';
                    $isLocked = true;
                } else if ($tt === 'DaHuy') {
                    $status = 'cancelled';
                    $statusLabel = 'Đã hủy';
                    $isLocked = true;
                } else if ($tt === 'ChoXuLy') {
                    $status = 'pending';
                    $statusLabel = 'Đã nhận đơn';
                } else if ($tt === 'DangThucHien') {
                    $status = 'active';
                    $statusLabel = 'Đang thực hiện';
                }
            }

            $lastMsg = $room->tinNhan->first();
            $lastMsgText = $lastMsg ? $lastMsg->noi_dung : 'Chưa có tin nhắn';
            
            $timeDateStr = $lastMsg ? $lastMsg->thoi_gian_gui : $room->thoi_gian_nhan_tin_cuoi;
            $isToday = date('Y-m-d') === date('Y-m-d', strtotime($timeDateStr));
            $lastMsgTime = $isToday ? date('H:i', strtotime($timeDateStr)) : date('d/m/Y', strtotime($timeDateStr));

            $unreadCount = TinNhan::where('phong_chat_id', $room->id)
                ->where('nguoi_gui_loai', '!=', 'NhanVien')
                ->where('trang_thai_doc', false)
                ->count();

            return [
                'id' => $room->id,
                'type' => $type,
                'bookingCode' => $bookingCode,
                'bookingId' => $room->donHang ? $room->donHang->id : null,
                'serviceTitle' => $serviceTitle,
                'status' => $status,
                'statusLabel' => $statusLabel,
                'customer' => [
                    'id' => $room->khachHang->id,
                    'name' => $room->khachHang->taiKhoan->ho_ten ?? 'Khách hàng',
                    'avatar' => $room->khachHang->taiKhoan->anh_dai_dien ?? 'https://i.pravatar.cc/150',
                    'isOnline' => false,
                    'role' => 'Khách hàng',
                    'phone' => $room->khachHang->taiKhoan->so_dien_thoai ?? ''
                ],
                'lastMessage' => $lastMsgText,
                'lastMessageTime' => $lastMsgTime,
                'unreadCount' => $unreadCount,
                'isLocked' => $isLocked,
            ];
        });

        return response()->json($formattedRooms);
    }

    public function getRoomOrderDetails(Request $request, $id)
    {
        $nhanVienId = Auth::user()->nhanVien->id;
        $room = PhongChat::with(['donHang.dichVuLoaiGoi.dichVu', 'donHang.dichVuThemDaChon.dichVuThem'])
            ->where('id', $id)
            ->where('nhan_vien_id', $nhanVienId)
            ->firstOrFail();

        if (!$room->donHang) {
            return response()->json(['message' => 'Chat room is not associated with an order'], 404);
        }

        $donHang = $room->donHang;
        
        $upcomingShifts = \App\Models\CaLamViec::where('don_hang_id', $donHang->id)
            ->where('nhan_vien_id', $nhanVienId)
            ->whereNotIn('trang_thai_ca', ['DaHoanThanh', 'DaHuy'])
            ->orderBy('ngay_lam', 'asc')
            ->orderBy('gio_bat_dau', 'asc')
            ->take(3)
            ->get()
            ->map(function ($ca) {
                return [
                    'id' => $ca->id,
                    'ngay_lam_viec' => $ca->ngay_lam,
                    'thoi_gian_bat_dau' => date('H:i', strtotime($ca->gio_bat_dau)),
                    'thoi_gian_ket_thuc' => date('H:i', strtotime($ca->gio_bat_dau) + $ca->thoi_gian_lam_phut * 60),
                    'trang_thai' => $ca->trang_thai_ca,
                ];
            });

        return response()->json([
            'donHang' => [
                'id' => $donHang->id,
                'ma_don' => 'DH-' . str_pad($donHang->id, 6, '0', STR_PAD_LEFT),
                'ten_dich_vu' => $donHang->dichVuLoaiGoi->dichVu->ten_dich_vu ?? '',
                'dia_chi' => $donHang->dia_chi_thuc_te,
                'ghi_chu' => $donHang->ghi_chu_cho_nhan_vien,
                'dich_vu_them' => $donHang->dichVuThemDaChon->map(function($ct) {
                    return $ct->dichVuThem->ten_dv_them ?? '';
                }),
                'trang_thai' => $donHang->trang_thai_don
            ],
            'upcomingShifts' => $upcomingShifts
        ]);
    }
}

