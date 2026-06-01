import React, { useState } from 'react';

export default function ContactPage() {
  // State quản lý dữ liệu Form (Thêm trường customSubject)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    subject: 'Hỗ trợ dịch vụ',
    customSubject: '', // ← Lưu chủ đề tự nhập khi chọn "Khác"
    message: ''
  });

  // State xử lý trạng thái gửi form
  const [status, setStatus] = useState('idle'); // idle | loading | success

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('loading');

    // Chuẩn bị dữ liệu để gửi lên Server / API
    const dataToSend = {
      fullName: formData.fullName,
      phone: formData.phone,
      // Nếu chọn "Khác" thì lấy giá trị nhập tay, ngược lại lấy giá trị select mặc định
      subject: formData.subject === 'Khác' ? formData.customSubject : formData.subject,
      message: formData.message
    };

    console.log("Dữ liệu gửi đi:", dataToSend);

    // Giả lập gửi API trong 1.5 giây
    setTimeout(() => {
      setStatus('success');
      setFormData({ 
        fullName: '', 
        phone: '', 
        subject: 'Hỗ trợ dịch vụ', 
        customSubject: '', 
        message: '' 
      });
      
      // Reset về trạng thái ban đầu sau 3 giây thành công
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }, 1500);
  };

  return (
    <div className="bg-surface text-on-background font-body-md min-h-screen">
      
      <main>
        
        {/* 1. HERO & HERO MAP BACKGROUND SECTION */}
        <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              className="w-full h-full object-cover grayscale opacity-30" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRYbtX1MdZMmBOBv133seYxw0rOIPu993vcK4sWNE5joSsrinS23srNGG9uu3drrRWAs6Yh_nnzmn2okrCxe5nZjM1qITldpmbUrP9bqwE68kMAlqpSVUN1ru65TPFArKgjBfrWfgvicosKgGuWqihiORtR3riyBjTv8yGnrArA45nlx5ctkmrWyVUkyKlQ9TBmzMoqNzgJxQZvyAOAoBBSmv2sGaIec0MKrrb1Uc8JqhNhV6bhPgt1yMldNb_5aSfpI9Yo7btmoRr" 
              alt="Bản đồ định vị văn phòng" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-surface/50 via-surface/20 to-surface"></div>
          </div>
          
          <div className="relative z-10 text-center px-5 max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-sm mb-6">
              Liên hệ với chúng tôi
            </span>
            <h1 className="font-h1 text-h1 text-primary mb-6">
              Sẵn sàng hỗ trợ bạn kiến tạo không gian sạch
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
              Chúng tôi luôn lắng nghe và sẵn lòng giải đáp mọi thắc mắc của bạn về dịch vụ vệ sinh chuyên nghiệp CleanTrust.
            </p>
          </div>
        </section>

        {/* 2. CONTACT CONTENT GRID */}
        <section className="max-w-[1280px] mx-auto px-5 md:px-16 -mt-32 relative z-20 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Cột trái: 3 Thẻ thông tin liên hệ */}
            <div className="lg:col-span-4 space-y-6">
              {/* Địa chỉ */}
              <div className="bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-md border border-primary/10 hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                  <h3 className="font-h3 text-h3 font-bold text-on-background">Văn phòng chính</h3>
                </div>
                <p className="text-on-surface-variant leading-relaxed">Tòa nhà TrustTower, 123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</p>
              </div>

              {/* Hotline */}
              <div className="bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-md border border-primary/10 hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a12.035 12.035 0 0 1-7.108-7.108c-.154-.441.012-.928.387-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                  </div>
                  <h3 className="font-h3 text-h3 font-bold text-on-background">Hotline hỗ trợ</h3>
                </div>
                <p className="text-primary font-bold text-2xl">1900 6789</p>
                <p className="text-label-sm text-outline mt-1 font-medium">Hoạt động: 8:00 - 20:00 hàng ngày</p>
              </div>

              {/* Email */}
              <div className="bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-md border border-primary/10 hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <h3 className="font-h3 text-h3 font-bold text-on-background">Email Support</h3>
                </div>
                <p className="text-on-surface-variant font-medium">hotro@cleantrust.vn</p>
                <p className="text-on-surface-variant font-medium">doitac@cleantrust.vn</p>
              </div>
            </div>

            {/* Cột phải: Form Nhận Thông tin Tin nhắn */}
            <div className="lg:col-span-8">
              <div className="bg-surface-container-lowest p-8 md:p-12 rounded-xl shadow-lg border border-outline-variant">
                <h2 className="font-h2 text-h2 text-primary mb-8">Gửi tin nhắn cho chúng tôi</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-label-sm text-on-surface-variant block">Họ và tên</label>
                      <input 
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-on-background" 
                        placeholder="Nhập tên của bạn" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label-sm text-on-surface-variant block">Số điện thoại</label>
                      <input 
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-on-background" 
                        placeholder="Nhập số điện thoại" 
                      />
                    </div>
                  </div>

                  {/* Khu vực chọn chủ đề */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="font-label-sm text-on-surface-variant block">Chủ đề</label>
                      <div className="relative">
                        <select 
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-on-background appearance-none pr-12"
                        >
                          <option>Hỗ trợ dịch vụ</option>
                          <option>Khiếu nại khách hàng</option>
                          <option>Hợp tác kinh doanh</option>
                          <option>Khác</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-on-surface-variant">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* BIẾN ĐỘNG THEO LOGIC: Chỉ hiển thị ô input này nếu khách hàng nhấn chọn "Khác" */}
                    {formData.subject === 'Khác' && (
                      <div className="space-y-2 animate-fade-in">
                        <label className="font-label-sm text-primary block font-medium">Vui lòng nhập lý do/chủ đề khác:</label>
                        <input 
                          type="text"
                          name="customSubject"
                          value={formData.customSubject}
                          onChange={handleInputChange}
                          required={formData.subject === 'Khác'} // Bắt buộc nhập nếu đang hiển thị
                          className="w-full bg-surface-container-low border-2 border-primary/30 rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-on-background shadow-inner" 
                          placeholder="Ví dụ: Góp ý ứng dụng, Sự cố thanh toán..." 
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="font-label-sm text-on-surface-variant block">Lời nhắn</label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows="4"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-on-background" 
                      placeholder="Chúng tôi có thể giúp gì cho bạn?" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={status === 'loading'}
                    className={`w-full py-4 rounded-xl font-label-sm transition-all shadow-md flex items-center justify-center gap-2 text-on-primary
                      ${status === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary-container'}
                    `}
                  >
                    {status === 'idle' && 'Gửi tin nhắn ngay'}
                    {status === 'loading' && (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Đang gửi...
                      </>
                    )}
                    {status === 'success' && '✓ Đã gửi thành công!'}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </section>

        {/* 3. RECRUITMENT / PARTNERSHIP SECTION */}
        <section className="bg-primary-container py-20 overflow-hidden relative">
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-20 hidden lg:block">
            <img 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoe9u9TwPV6uYKWKAN5qV3aY_oVa-w1CX3TsDCtOKcmTQo8u6qTb7JVQBrvPMtA9R7Qk1JXTV6w2lahlvqtZX3opvEBu2RsKtvsFtwx6YGYlpt7Si3bNht8_JkXIHwZObOCXGd-dX6WNztVx7v7wBecQ5MhASBSdrE2tv8Vb4IBEYbCDolcEC0bIeuEfyzWEpJQBB5hju6WBWqdovse91N3JCCR1ykI3JQpxNSPF9oitdXddevmiKscX-2BQPyyBbZlw74QDxhuNu_" 
              alt="Đối tác làm việc CleanTrust" 
            />
          </div>
          
          <div className="max-w-[1280px] mx-auto px-5 md:px-16 grid grid-cols-1 lg:grid-cols-2 items-center">
            <div className="relative z-10 text-on-primary">
              <h2 className="font-h2 text-h2 mb-6 text-white">Trở thành đối tác cùng CleanTrust</h2>
              <p className="font-body-lg text-body-lg mb-8 text-on-primary-container opacity-90">
                Gia nhập đội ngũ cộng tác viên vệ sinh chuyên nghiệp hàng đầu. Thu nhập hấp dẫn, thời gian linh hoạt và được đào tạo bài bản theo tiêu chuẩn 5 sao.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button className="bg-surface-container-lowest text-primary px-8 py-4 rounded-full font-label-sm hover:bg-surface-container-high transition-all flex items-center gap-2 shadow-md">
                  Ứng tuyển ngay 
                  <svg xmlns="http://www.w3.org/2000/xl" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
                <button className="border border-on-primary text-white px-8 py-4 rounded-full font-label-sm hover:bg-white/10 transition-all">
                  Tìm hiểu thêm
                </button>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-8">
                <div>
                  <div className="text-3xl font-bold mb-2 text-white">5,000+</div>
                  <div className="text-on-primary-container text-label-sm opacity-80">Đối tác tin cậy</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2 text-white">20tr+</div>
                  <div className="text-on-primary-container text-label-sm opacity-80">Thu nhập hàng tháng</div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}