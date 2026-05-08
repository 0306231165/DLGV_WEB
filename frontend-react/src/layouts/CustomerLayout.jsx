import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/customer/Header';
import Footer from '../components/customer/Footer';

const CustomerLayout = () => {
  return (
    <div className="bg-background text-on-background font-body-md antialiased pt-20">
      {/* Header luôn cố định ở trên */}
      <Header />
      
      {/* Outlet là nơi render các Component từ thư mục 'pages' tùy theo URL */}
      <main className="min-h-screen">
        <Outlet /> 
      </main>

      {/* Footer luôn cố định ở dưới */}
      <Footer />
    </div>
  );
};

export default CustomerLayout;