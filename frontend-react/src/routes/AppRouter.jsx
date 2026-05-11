import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Layouts
import CustomerLayout from '../layouts/CustomerLayout';
import AccountLayout  from '../pages/customer/account/AccountLayout';

// Import Pages — Customer
import Home           from '../pages/customer/Home';
import MyBookingsPage from '../pages/customer/MyBookingsPage';
import BookingPage    from '../pages/customer/BookingPage';

// Import Pages — Account
import ProfilePage    from '../pages/customer/account/ProfilePage';
import AddressesPage  from '../pages/customer/account/AddressesPage';
import PaymentPage    from '../pages/customer/account/PaymentPage';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Phân vùng Khách hàng */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />

          <Route path="my-booking" element={<MyBookingsPage />} />
          <Route path="booking"    element={<BookingPage />} />

          {/* Trang tài khoản — nested layout với sidebar riêng */}
          <Route path="account" element={<AccountLayout />}>
            <Route index             element={<Navigate to="profile" replace />} />
            <Route path="profile"    element={<ProfilePage />} />
            <Route path="addresses"  element={<AddressesPage />} />
            <Route path="payment"    element={<PaymentPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;