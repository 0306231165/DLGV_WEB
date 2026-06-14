import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Khởi tạo hàm chuyển hướng của React Router
  const navigate = useNavigate();

  // Xử lý khi nhấn nút Đăng nhập
  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Giả lập thời gian chờ xác thực từ máy chủ (1.5 giây)
    setTimeout(() => {
      setIsLoading(false);
      
      // Kiểm tra nếu người dùng đã nhập đủ email và password
      if (credentials.email && credentials.password) {
        
        // CHUYỂN HƯỚNG CHUẨN XÁC VÀO TRANG DASHBOARD THEO ĐÚNG ROUTER CỦA BẠN
        navigate('/admin/dashboard'); 
        
      } else {
        alert('❌ Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      
      {/* ================= CỘT TRÁI (BRANDING) - Ẩn trên Mobile ================= */}
      <div className="hidden lg:flex w-1/2 bg-[#0f2857] text-white flex-col justify-center items-center relative overflow-hidden">
        {/* Vòng tròn trang trí mờ ảo */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10 flex flex-col items-center text-center px-12">
          {/* Logo / Icon */}
          <div className="w-20 h-20 bg-white text-[#0f2857] rounded-2xl flex items-center justify-center shadow-2xl mb-8">
            <span className="material-symbols-outlined text-[40px]">shield_person</span>
          </div>
          <h1 className="text-4xl font-black mb-4 tracking-tight">CleanTrust Admin</h1>
          <p className="text-blue-200 text-lg font-medium max-w-md leading-relaxed">
            Hệ thống quản trị và điều phối dịch vụ vệ sinh chuyên nghiệp.
          </p>
        </div>
        
        {/* Footer của cột trái */}
        <div className="absolute bottom-8 text-sm text-blue-300 font-medium">
          © {new Date().getFullYear()} CleanTrust Home Services.
        </div>
      </div>

      {/* ================= CỘT PHẢI (FORM ĐĂNG NHẬP) ================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Lớp nền mờ giả lập bóng (chỉ hiện rõ trên mobile để tách biệt với nền) */}
        <div className="absolute inset-0 bg-white lg:bg-transparent shadow-[0_0_40px_rgba(0,0,0,0.05)] lg:shadow-none z-0"></div>

        <div className="w-full max-w-md relative z-10 bg-white lg:bg-transparent p-8 lg:p-0 rounded-3xl lg:rounded-none shadow-xl lg:shadow-none">
          
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Đăng nhập hệ thống</h2>
            <p className="text-slate-500 font-medium">Vui lòng nhập thông tin xác thực để tiếp tục.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Input Email / Username */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Tên đăng nhập hoặc Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="admin@cleantrust.com"
                  value={credentials.email}
                  onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 lg:bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700">Mật khẩu</label>
                <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 lg:bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
                {/* Nút Ẩn/Hiện mật khẩu */}
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Checkbox Ghi nhớ đăng nhập */}
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="remember" 
                className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
              />
              <label htmlFor="remember" className="ml-2 text-sm font-medium text-slate-600 cursor-pointer select-none">
                Ghi nhớ đăng nhập trên thiết bị này
              </label>
            </div>

            {/* Nút Đăng nhập */}
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#0f2857] hover:bg-[#1a3873] hover:shadow-lg active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">autorenew</span>
                  Đang xác thực...
                </>
              ) : (
                <>
                  Đăng nhập Quản trị
                  <span className="material-symbols-outlined text-[20px]">login</span>
                </>
              )}
            </button>

          </form>
          
          {/* Thông báo bảo mật */}
          <div className="mt-8 pt-6 border-t border-slate-100/60 text-center">
            <p className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">gpp_good</span>
              Khu vực truy cập giới hạn. Mọi hành vi đăng nhập trái phép sẽ bị ghi log.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default AdminLogin;