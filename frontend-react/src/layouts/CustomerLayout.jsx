import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/customer/Header';
import Footer from '../components/customer/Footer';

const CustomerLayout = () => {
  const location = useLocation();

  useEffect(() => {
    // Không scroll top khi đang ở trang booking (BookingPage tự quản lý scroll)
    if (location.pathname.startsWith('/booking')) return;

    const timeout = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, 50);

    return () => clearTimeout(timeout);
  }, [location.pathname, location.key]); // ← cả hai: pathname để detect đổi trang, key để detect click cùng link

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