import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Layouts
import CustomerLayout from '../layouts/CustomerLayout';
import AccountLayout  from '../pages/customer/account/AccountLayout';

// Import Pages — Customer
import Home           from '../pages/customer/home/Home';
import ServicesPage   from '../pages/customer/services/ServicesPage';
import ServiceDetailPage from '../pages/customer/services/ServiceDetailPage';
import BookingPage    from '../pages/customer/BookingPage';
import VoucherPage    from '../pages/customer/voucher/VoucherPage';

// Import Pages — Staff
import StaffListPage   from '../pages/customer/staff/StaffListPage';
import StaffDetailPage from '../pages/customer/staff/StaffDetailPage';

// Import Pages — Account
import ProfilePage    from '../pages/customer/account/ProfilePage';
import AddressesPage  from '../pages/customer/account/AddressesPage';
import PaymentPage    from '../pages/customer/account/PaymentPage';
import MyVouchersPage from '../pages/customer/account/MyVouchersPage';

// Import Pages — MyBooking
import MyBookingsLayout    from '../pages/customer/mybooking/MyBookingsLayout';
import AllBookingsPage     from '../pages/customer/mybooking/AllBookingsPage';
import UpcomingBookingsPage from '../pages/customer/mybooking/UpcomingBookingsPage';
import ActiveBookingsPage  from '../pages/customer/mybooking/ActiveBookingsPage';
import CompletedBookingsPage from '../pages/customer/mybooking/CompletedBookingsPage';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Phân vùng Khách hàng */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="services"   element={<ServicesPage />} />
          <Route path="services/:id" element={<ServiceDetailPage />} />
          <Route path="booking"    element={<BookingPage />} />
          <Route path="promotions" element={<VoucherPage />} />
          <Route path="staff"      element={<StaffListPage />} />
          <Route path="staff/:id"  element={<StaffDetailPage />} />

          {/* Trang tài khoản — nested layout với sidebar riêng */}
          <Route path="account" element={<AccountLayout />}>
            <Route index             element={<Navigate to="profile" replace />} />
            <Route path="profile"    element={<ProfilePage />} />
            <Route path="addresses"  element={<AddressesPage />} />
            <Route path="payment"    element={<PaymentPage />} />
            <Route path="vouchers"   element={<MyVouchersPage />} />
          </Route>

          {/* Trang lịch của tôi — nested layout với sidebar riêng */}
          <Route path="/my-bookings" element={<MyBookingsLayout />}>
            <Route index             element={<AllBookingsPage />} />
            <Route path="upcoming"   element={<UpcomingBookingsPage />} />
            <Route path="active"     element={<ActiveBookingsPage />} />
            <Route path="completed"  element={<CompletedBookingsPage />} />
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;