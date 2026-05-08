import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Layouts
import CustomerLayout from '../layouts/CustomerLayout';

// Import Pages
import Home from '../pages/customer/Home';
import MyBookingsPage from '../pages/customer/MyBookingsPage';
import BookingPage from '../pages/customer/BookingPage';   // ← THÊM DÒNG NÀY

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Phân vùng Khách hàng */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} /> 
          
          <Route path="my-booking" element={<MyBookingsPage />} />
          
          {/* Trang Đặt lịch */}
          <Route path="booking" element={<BookingPage />} />   {/* ← THÊM ROUTE NÀY */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;