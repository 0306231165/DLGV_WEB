import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';

export default function PartnerLogin() {
  const navigate = useNavigate();
  
  // 1. Các State quản lý Form Đăng nhập
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 2. Refs phục vụ cho hiệu ứng bong bóng nền di chuyển theo chuột
  const shape1Ref = useRef(null);
  const shape2Ref = useRef(null);

  // 3. Xử lý hiệu ứng di chuột (Atmospheric mouse track effect)
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

  // 4. Hàm xử lý gửi dữ liệu Đăng nhập
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const response = await axiosClient.post('/nhan-vien/dang-nhap', {
        so_dien_thoai: emailOrPhone,
        mat_khau: password
      });
      
      // Lưu token vào localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.role);
      
      // Chuyển hướng sang Dashboard
      navigate('/partner/dashboard');
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      alert(error.message || "Tài khoản hoặc mật khẩu không đúng.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800 font-sans min-h-screen w-screen flex items-center justify-center relative py-10 overflow-y-auto">
      
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

      {/* 1. DECORATIVE BACKGROUND */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div ref={shape1Ref} className="organic-shape-1"></div>
        <div ref={shape2Ref} className="organic-shape-2"></div>
      </div>

      {/* 2. BACK TO HOME */}
      <a 
        className="fixed top-8 left-8 z-50 flex items-center gap-2 px-5 py-2.5 rounded-full glass-morphism text-emerald-600 font-semibold text-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 group shadow-sm" 
        href="/"
      >
        <span className="material-symbols-outlined text-base transition-transform group-hover:-translate-x-1">arrow_back</span>
        Trang chủ chính (Khách hàng)
      </a>

      {/* 3. MAIN CANVAS */}
      <main className="relative z-10 w-full max-w-[1140px] flex items-center justify-center px-4 md:px-10">
        <div className="flex flex-col md:flex-row w-full bg-white/50 rounded-[28px] overflow-hidden glass-morphism shadow-xl border border-slate-200">
          
          {/* CỘT TRÁI: Nhận diện thương hiệu Đối tác (Xanh Lá Emerald) */}
          <div className="hidden md:flex md:w-1/2 relative min-h-[580px] flex-col justify-between p-12 bg-emerald-600 overflow-hidden">
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <img 
                className="w-full h-full object-cover mix-blend-overlay" 
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000" 
                alt="CleanTrust Staff Workspace" 
              />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-black text-white mb-4 leading-snug">Cổng thông tin Đối tác giúp việc</h2>
              <p className="text-emerald-100 text-base max-w-sm">
                Đăng nhập để nhận lịch làm việc, quản lý ví thu nhập và cập nhật trạng thái hồ sơ của bạn.
              </p>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <div className="w-12 h-12 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-2xl font-bold">verified</span>
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Thu nhập ổn định & Tự do</p>
                  <p className="text-emerald-100 text-xs opacity-90">Đồng hành cùng hơn 2,000 nhân sự chuyên nghiệp</p>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Form điền dữ liệu */}
          <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-white/80">
            <div className="mb-8 text-center md:text-left">
              <div className="text-emerald-600 font-black text-2xl mb-1 tracking-tight flex items-center justify-center md:justify-start gap-2">
                <span className="material-symbols-outlined text-2xl">local_laundry_service</span> CleanTrust
              </div>
              <h1 className="text-2xl font-black text-slate-900 mb-1.5">Đối tác Đăng nhập</h1>
              <p className="text-sm text-slate-500 font-medium">Vui lòng điền tài khoản nhân viên để tiếp tục</p>
            </div>

            <form className="space-y-5" onSubmit={handleLoginSubmit}>
              {/* Ô tài khoản */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider" htmlFor="email">
                  Số điện thoại / Email đối tác
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <span className="material-symbols-outlined text-xl">badge</span>
                  </span>
                  <input 
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-slate-800 text-sm"
                    id="email"
                    type="text" 
                    placeholder="0912xxxxxx hoặc email@đối-tác"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Ô mật khẩu */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider" htmlFor="password">
                    Mật khẩu
                  </label>
                  <a className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline" href="/partner/forgot-password">
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <span className="material-symbols-outlined text-xl">lock</span>
                  </span>
                  <input 
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-slate-800 text-sm"
                    id="password"
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
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

              {/* Nút Submit */}
              <button 
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-wide shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all active:scale-[0.99]"
              >
                Đăng nhập làm việc
              </button>
            </form>

            {/* Điều hướng sang Đăng ký */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 font-medium">
                Bạn muốn đăng ký trở thành người giúp việc của CleanTrust?{' '}
                <button 
                  onClick={() => navigate('/partner/register')}
                  className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline cursor-pointer"
                >
                  Đăng ký ứng tuyển ngay
                </button>
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}