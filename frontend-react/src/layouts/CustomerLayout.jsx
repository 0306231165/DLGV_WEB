import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/customer/Header';
import Footer from '../components/customer/Footer';

const CustomerLayout = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll mượt + delay nhỏ để đảm bảo nội dung đã render xong
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'     // thay vì instant
      });
    };

    // Delay một chút để scroll mượt hơn
    const timeout = setTimeout(scrollToTop, 50);

    return () => clearTimeout(timeout);
  }, [location.pathname, location.key]);   // ← thêm location.key rất quan trọng

  return (
    <div className="bg-background text-on-background font-body-md antialiased pt-20">
      <Header />
      
      <main className="min-h-screen">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default CustomerLayout;