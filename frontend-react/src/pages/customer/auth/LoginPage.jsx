import React, { useState, useEffect, useRef } from 'react';

export default function LoginPage() {
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

  // 4. Hàm xử lý gửi dữ liệu Đăng nhập
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log("Dữ liệu đăng nhập:", { emailOrPhone, password });
    // Tích hợp logic gọi API đăng nhập của bạn ở đây...
  };

  return (
    <div className="bg-surface text-on-surface font-body-md overflow-hidden h-screen w-screen flex items-center justify-center relative">
      
      {/* Thêm Font & Icon Material Symbols trực tiếp vào trang thông qua thẻ style (Nếu dự án của bạn chưa cài toàn cục) */}
      <style>{`
        .glass-morphism {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(156, 163, 175, 0.4);
        }
        .organic-shape-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(184, 196, 255, 0.4) 0%, rgba(248, 249, 255, 0) 70%);
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
          background: radial-gradient(circle, rgba(213, 228, 248, 0.5) 0%, rgba(248, 249, 255, 0) 70%);
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

      {/* 1. DECORATIVE ORGANIC BACKGROUND (Hình nền động loang màu) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div ref={shape1Ref} className="organic-shape-1"></div>
        <div ref={shape2Ref} className="organic-shape-2"></div>
      </div>

      {/* 2. BACK TO HOME FLOATING BUTTON */}
      <a 
        className="fixed top-8 left-8 z-50 flex items-center gap-2 px-5 py-3 rounded-full glass-morphism text-primary font-label-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 group" 
        href="/"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transition-transform group-hover:-translate-x-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Trang chủ
      </a>

      {/* 3. MAIN LOGIN CANVAS */}
      <main className="relative z-10 w-full max-w-[1200px] flex items-center justify-center px-5 md:px-16">
        <div className="flex flex-col md:flex-row w-full bg-white/40 rounded-[32px] overflow-hidden glass-morphism shadow-2xl">
          
          {/* CỘT TRÁI: Thương hiệu & Hình ảnh minh họa tinh tế */}
          <div className="hidden md:flex md:w-1/2 relative min-h-[600px] flex-col justify-between p-12 bg-primary overflow-hidden">
            {/* Ảnh mờ nghệ thuật phản chiếu nền kính sang trọng */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <img 
                className="w-full h-full object-cover mix-blend-overlay" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhHDvD8AdpBsU7-6KHWB1TkXjKTlRhRGqDUm5JOhulB6UH_zCGJdu9reHu1o4l0OjCey_H5MCIs1VHofXR2nDVITfp1z86XudOuS_ewHK5x0_0ayQ2tMCxzfupVT6Oqa2t6PUcmyhBhxnxXFDpelWtks1l76p_3hbJ9z9DaMd1bUciqtOB5KycFeN1CqQ61YeDBbKW6quD5eeAYQ6-_QcTHliJ8DS0UptzcoIQMUjAC2GM0bBD5tG5-GgIHSnPhTrwXoYZmHxxiffq" 
                alt="CleanTrust Luxury Space" 
              />
            </div>
            
            <div className="relative z-10">
              <h2 className="font-h2 text-h2 text-white mb-4 leading-snug">Chào mừng trở lại với CleanTrust</h2>
              <p className="font-body-lg text-body-lg text-primary-fixed max-w-sm">
                Giải pháp vệ sinh chuyên nghiệp, tin cậy cho ngôi nhà của bạn.
              </p>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-white">
                  {/* Icon Verified tích xanh */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.14-.1l3.75-5.25Z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-label-sm font-semibold">Hơn 5,000 khách hàng tin dùng</p>
                  <p className="text-primary-fixed text-sm opacity-90">Chất lượng dịch vụ 5 sao tại Việt Nam</p>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Khối điền Form Đăng Nhập */}
          <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white/60">
            <div className="mb-10 text-center md:text-left">
              <div className="text-primary font-h3 text-h3 font-bold mb-2 tracking-tight">CleanTrust</div>
              <h1 className="font-h2 text-h3 md:text-h2 text-on-surface mb-2">Đăng nhập</h1>
              <p className="font-body-md text-on-surface-variant">Nhập thông tin của bạn để tiếp tục</p>
            </div>

            <form className="space-y-6" onSubmit={handleLoginSubmit}>
              {/* Ô Nhập Email hoặc Số điện thoại */}
              <div className="space-y-2">
                <label className="block font-label-sm text-on-surface-variant" htmlFor="email">
                  Email hoặc Số điện thoại
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </span>
                  <input 
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface" 
                    id="email" 
                    type="text" 
                    placeholder="name@example.com"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Ô Nhập Mật khẩu */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block font-label-sm text-on-surface-variant" htmlFor="password">
                    Mật khẩu
                  </label>
                  <a className="text-primary font-label-sm hover:underline font-medium" href="/forgot-password">
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0V10.5m-2.25 0h13.5m-13.5 0a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25h-13.5m3 4.5h.008v.008H9.75v-.008ZM12 15h.008v.008H12V15Zm2.25 0h.008v.008h-.008V15Z" />
                    </svg>
                  </span>
                  <input 
                    className="w-full pl-12 pr-12 py-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface" 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {/* Nút ẩn/hiện mật khẩu (Đã chuyển đổi tương tác micro-interaction sang React) */}
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary transition-colors" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 1-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Nút gửi form */}
              <button 
                type="submit"
                className="w-full bg-primary text-white font-h3 py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all duration-300 font-semibold"
              >
                Đăng nhập
              </button>
            </form>

            {/* Khối đăng nhập mạng xã hội phụ */}
            <div className="mt-8">
              <div className="relative flex items-center justify-center mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant/30"></div>
                </div>
                <span className="relative px-4 bg-transparent text-on-surface-variant/60 font-label-sm">
                  Hoặc đăng nhập với
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Google */}
                <button className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-outline-variant bg-white hover:bg-surface-container-low transition-colors duration-200">
                  <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJYbcEjr4kVicisi_d4W0XoAZ9sKsk2bO1MkkVJLzXcqi5dpqZY4xz_LzfEM2Gqf0eCjkHPqaSsxrlPGgJQArU28lhT_JZHfn248-nYvTFYWHC5w0Uh6CnZtcig6R1PnCUqNuEfsx2nYV4-jcyoOsDkDIaZAp4-dCJcVrhC94FNETFnCtzNc5_GSW1STWfQRGzEEANwSthkdkoS9XYiQxo0WYTkv6Hwn5tgok9O8w_fu1W48oWY06nJP4cA2SHV2ubUX5-DsFzTErU"/>
                  <span className="font-label-sm font-semibold text-on-surface">Google</span>
                </button>
                {/* Facebook */}
                <button className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-outline-variant bg-white hover:bg-surface-container-low transition-colors duration-200">
                  <svg className="w-5 h-5 text-blue-600 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
                  </svg>
                  <span className="font-label-sm font-semibold text-on-surface">Facebook</span>
                </button>
              </div>
            </div>

            {/* Chuyển hướng sang đăng ký */}
            <p className="mt-10 text-center font-body-md text-on-surface-variant">
              Chưa có tài khoản?{' '}
              <a className="text-primary font-bold hover:underline decoration-primary/30 underline-offset-4" href="/register">
                Đăng ký ngay
              </a>
            </p>
          </div>

        </div>
      </main>

    </div>
  );
}