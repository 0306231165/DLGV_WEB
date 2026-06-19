import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';

export default function PartnerRegister() {
  const navigate = useNavigate();

  // 1. Các State quản lý Form Đăng ký ứng tuyển dựa theo cấu trúc DB mới
  const [hoTen, setHoTen] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [email, setEmail] = useState('');
  const [cccd, setCccd] = useState('');
  const [diaChi, setDiaChi] = useState('');
  const [kinhNghiem, setKinhNghiem] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Sửa lỗi ESLint: Đã sử dụng setShowPassword ở button mắt kính phía dưới
  const [showPassword, setShowPassword] = useState(false);

  // 2. Refs phục vụ cho hiệu ứng bong bóng nền di chuyển theo chuột
  const shape1Ref = useRef(null);
  const shape2Ref = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      if (shape1Ref.current && shape2Ref.current) {
        shape1Ref.current.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
        shape2Ref.current.style.transform = `translate(${x * -30}px, ${y * -30}px)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  // 3. Xử lý submit thông tin đăng ký ứng tuyển
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (matKhau !== confirmPassword) {
      alert("Mật khẩu xác nhận của đối tác chưa trùng khớp!");
      return;
    }

    const registerPayload = {
      so_dien_thoai: soDienThoai,
      mat_khau: matKhau,
      ho_ten: hoTen,
      email: email || null,
      cccd: cccd,
      dia_chi: diaChi,
      kinh_nghiem: kinhNghiem
    };

    try {
      setIsLoading(true);
      await axiosClient.post('/nhan-vien/dang-ky', registerPayload);
      alert("Đăng ký thành công! Hồ sơ của bạn đã được gửi cho Quản trị viên phê duyệt.");
      navigate('/partner/login');
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      alert(error.message || "Có lỗi xảy ra khi đăng ký.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800 font-sans min-h-screen w-full overflow-x-hidden flex items-center justify-center relative py-12 md:py-16">
      
      <style>{`
        .glass-morphism {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .organic-shape-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(248, 250, 252, 0) 70%);
          border-radius: 43% 57% 70% 30% / 30% 45% 55% 70%;
          position: absolute;
          top: -10%;
          right: -10%;
          z-index: 1;
          animation: morph 20s ease-in-out infinite alternate;
          transition: transform 0.2s ease-out;
        }
        .organic-shape-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(52, 211, 153, 0.2) 0%, rgba(248, 250, 252, 0) 70%);
          border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          position: absolute;
          bottom: -5%;
          left: -5%;
          z-index: 1;
          animation: morph 25s ease-in-out infinite alternate-reverse;
          transition: transform 0.2s ease-out;
        }
        @keyframes morph {
          0% { border-radius: 43% 57% 70% 30% / 30% 45% 55% 70%; transform: rotate(0deg); }
          100% { border-radius: 70% 30% 45% 55% / 43% 57% 70% 30%; transform: rotate(15deg); }
        }
      `}</style>

      {/* BACKGROUND GRAPHIC */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div ref={shape1Ref} className="organic-shape-1"></div>
        <div ref={shape2Ref} className="organic-shape-2"></div>
      </div>

      {/* FLOATING RETURN BUTTON */}
      <a 
        className="fixed top-8 left-8 z-50 flex items-center gap-2 px-5 py-2.5 rounded-full glass-morphism text-emerald-600 font-semibold text-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 group shadow-sm" 
        href="/"
      >
        <span className="material-symbols-outlined text-base transition-transform group-hover:-translate-x-1">arrow_back</span>
        Trang chủ chính (Khách hàng)
      </a>

      {/* MAIN LAYOUT BOX */}
      <main className="relative z-10 w-full max-w-[1140px] flex items-center justify-center px-4 md:px-10">
        <div className="flex flex-col md:flex-row w-full bg-white/50 rounded-[28px] overflow-hidden glass-morphism shadow-xl border border-slate-200">
          
          {/* CỘT TRÁI */}
          <div className="hidden md:flex md:w-1/2 relative min-h-[750px] flex-col justify-between p-12 bg-emerald-600 overflow-hidden">
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <img 
                className="w-full h-full object-cover mix-blend-overlay" 
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000" 
                alt="CleanTrust Staff Workspace" 
              />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-black text-white mb-4 leading-snug">Gia nhập đội ngũ CleanTrust Partner</h2>
              <p className="text-emerald-100 text-base max-w-sm">
                Quy trình xét duyệt hồ sơ nhanh chóng, xác minh căn cước minh bạch và cơ hội tối ưu lịch rảnh để nhận thu nhập hấp dẫn.
              </p>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <div className="w-12 h-12 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-2xl font-bold">assignment_ind</span>
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Hồ sơ điện tử chuẩn hóa</p>
                  <p className="text-emerald-100 text-xs opacity-90">Điền chính xác thông tin CCCD giúp đẩy nhanh xét duyệt</p>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center bg-white/80">
            <div className="mb-5 text-center md:text-left">
              <div className="text-emerald-600 font-black text-2xl mb-1 tracking-tight flex items-center justify-center md:justify-start gap-2">
                <span className="material-symbols-outlined text-2xl">local_laundry_service</span> CleanTrust
              </div>
              <h1 className="text-2xl font-black text-slate-900 mb-1">Đăng ký Đối tác mới</h1>
              <p className="text-sm text-slate-500 font-medium">Vui lòng cung cấp thông tin lý lịch phục vụ hồ sơ lao động</p>
            </div>

            <form className="space-y-3.5" onSubmit={handleRegisterSubmit}>
              
              {/* Họ tên */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider" htmlFor="hoTen">
                  Họ và tên nhân viên
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <span className="material-symbols-outlined text-xl">person</span>
                  </span>
                  <input 
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-slate-800 text-sm"
                    id="hoTen"
                    type="text" 
                    placeholder="Ví dụ: Nguyễn Thị Hoa"
                    value={hoTen}
                    onChange={(e) => setHoTen(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Grid 2 cột: Số điện thoại và CCCD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Số điện thoại */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider" htmlFor="soDienThoai">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <span className="material-symbols-outlined text-xl">call</span>
                    </span>
                    <input 
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-slate-800 text-sm"
                      id="soDienThoai"
                      type="tel" 
                      placeholder="0912xxxxxx"
                      value={soDienThoai}
                      onChange={(e) => setSoDienThoai(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Số CCCD (Bảng NhanVien) */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider" htmlFor="cccd">
                    Số CCCD (12 số)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <span className="material-symbols-outlined text-xl">badge</span>
                    </span>
                    <input 
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-slate-800 text-sm"
                      id="cccd"
                      type="text" 
                      maxLength="12"
                      placeholder="031xxxxxxxx"
                      value={cccd}
                      onChange={(e) => setCccd(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email (Tùy chọn) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider" htmlFor="email">
                  Địa chỉ Email <span className="text-slate-400 font-normal">(Không bắt buộc)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <span className="material-symbols-outlined text-xl">mail</span>
                  </span>
                  <input 
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-slate-800 text-sm"
                    id="email"
                    type="email" 
                    placeholder="partner@cleantrust.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Địa chỉ cư trú (Bảng NhanVien) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider" htmlFor="diaChi">
                  Địa chỉ cư trú hiện tại
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <span className="material-symbols-outlined text-xl">home_pin</span>
                  </span>
                  <input 
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-slate-800 text-sm"
                    id="diaChi"
                    type="text" 
                    placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện"
                    value={diaChi}
                    onChange={(e) => setDiaChi(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Kinh nghiệm làm việc */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider" htmlFor="kinhNghiem">
                  Kinh nghiệm làm việc <span className="text-slate-400 font-normal">(Không bắt buộc)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-400">
                    <span className="material-symbols-outlined text-xl">work_history</span>
                  </span>
                  <textarea 
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-slate-800 text-sm min-h-[100px] resize-y"
                    id="kinhNghiem"
                    placeholder="- Quét và lau sàn toàn bộ các phòng&#10;- Lau sạch bụi bẩn trên bề mặt đồ đạc..."
                    value={kinhNghiem}
                    onChange={(e) => setKinhNghiem(e.target.value)}
                  />
                </div>
              </div>

              {/* Mật khẩu */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider" htmlFor="matKhau">
                  Thiết lập mật khẩu ứng dụng
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <span className="material-symbols-outlined text-xl">lock</span>
                  </span>
                  <input 
                    className="w-full pl-11 pr-12 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-slate-800 text-sm"
                    id="matKhau"
                    type={showPassword ? "text" : "password"} 
                    placeholder="Tối thiểu 6 ký tự"
                    value={matKhau}
                    onChange={(e) => setMatKhau(e.target.value)}
                    required
                  />
                  {/* Sửa cảnh báo ESLint: Gắn hàm setShowPassword vào nút icon */}
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 flex items-center"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Xác nhận lại mật khẩu */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider" htmlFor="confirmPassword">
                  Xác nhận lại mật khẩu
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <span className="material-symbols-outlined text-xl">lock_reset</span>
                  </span>
                  <input 
                    className="w-full pl-11 pr-12 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-slate-800 text-sm"
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"} 
                    placeholder="Nhập trùng khớp mật khẩu trên"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm tracking-wide shadow-md transition-all ${
                    isLoading 
                      ? 'bg-emerald-400 cursor-not-allowed flex items-center justify-center gap-2' 
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10 hover:shadow-lg active:scale-[0.99]'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang gửi yêu cầu...
                    </>
                  ) : (
                    "Gửi thông tin ứng tuyển"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 font-medium">
                Bạn đã có tài khoản đối tác hoạt động?{' '}
                <button 
                  onClick={() => navigate('/partner/login')}
                  className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline cursor-pointer"
                >
                  Đăng nhập tại đây
                </button>
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}