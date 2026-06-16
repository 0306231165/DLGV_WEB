import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import RequireAuth from "../components/guards/RequireAuth";

// =========================================================
// 1. IMPORT LAYOUTS (Dùng chung cho toàn hệ thống)
// =========================================================
// -- CUSTOMER
import CustomerLayout from "../layouts/CustomerLayout";
import AccountLayout from "../pages/customer/account/AccountLayout";
import MyBookingsLayout from "../pages/customer/mybooking/MyBookingsLayout";
//------------------------------------------------------------------------------------------

// =========================================================
// 2. IMPORT PAGES — KHÁCH HÀNG (CUSTOMER)
// =========================================================
import Home from "../pages/customer/home/Home";
import ServicesPage from "../pages/customer/services/ServicesPage";
import ServiceDetailPage from "../pages/customer/services/ServiceDetailPage";
import BookingPage from "../pages/customer/BookingPage";
import VoucherPage from "../pages/customer/voucher/VoucherPage";
import ContactPage from "../pages/customer/contact/ContactPage";
import WalletPage from "../pages/customer/wallet/WalletPage";

// -- Pages — Staff (Liên quan đến Nhân viên như 'xem thông tin, nhân viên yêu thích, ...)
import StaffListPage from "../pages/customer/staff/StaffListPage";
import StaffDetailPage from "../pages/customer/staff/StaffDetailPage";
import SavedStaffPage from "../pages/customer/staff/SavedStaffPage";

// -- Pages — Account
import ProfilePage from "../pages/customer/account/ProfilePage";
import AddressesPage from "../pages/customer/account/AddressesPage";
import PaymentPage from "../pages/customer/account/PaymentPage";
import MyVouchersPage from "../pages/customer/account/MyVouchersPage";

// -- Pages — MyBooking
import AllBookingsPage from "../pages/customer/mybooking/AllBookingsPage";
import UpcomingBookingsPage from "../pages/customer/mybooking/UpcomingBookingsPage";
import ActiveBookingsPage from "../pages/customer/mybooking/ActiveBookingsPage";
import CompletedBookingsPage from "../pages/customer/mybooking/CompletedBookingsPage";
import BookingHistoryPage from "../pages/customer/mybooking/BookingHistoryPage";
import BookingDetailPage from "../pages/customer/mybooking/BookingDetailPage";

// -- Pages — Notification
import NotificationPage from "../pages/customer/notifications/NotificationPage";

// -- Pages — Message
import MessagePage from "../pages/customer/messages/MessagePage";

// -- Pages - Auth
import LoginPage from "../pages/customer/auth/LoginPage";
import RegisterPage from "../pages/customer/auth/RegisterPage";
//------------------------------------------------------------------------------------------

// =========================================================
// 3. IMPORT PAGES — NHÂN VIÊN (PARTNER / NHANVIEN)
// =========================================================
import PartnerLayout from "../layouts/PartnerLayout";
import PartnerDashboard from "../pages/partner/dashboard/PartnerDashboard";
import ScheduleManager from "../pages/partner/schedule/ScheduleManager";
import PartnerWallet from "../pages/partner/wallet/PartnerWallet";
import PartnerReviews from "../pages/partner/reviews/PartnerReviews";
import PartnerProfile from "../pages/partner/profile/PartnerProfile";
import SkillsRegistration from "../pages/partner/skills/SkillsRegistration";
import PartnerNotifications from "../pages/partner/notifications/PartnerNotifications";
import PartnerMessagePage from "../pages/partner/messages/PartnerMessagePage";

import PartnerLogin from "../pages/partner/auth/PartnerLogin";
import PartnerRegister from "../pages/partner/auth/PartnerRegister";

//------------------------------------------------------------------------------------------

// =========================================================
// 4. IMPORT PAGES — QUẢN TRỊ VIÊN (ADMIN)
// =========================================================
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";
import AdminAccount from "../pages/admin/account/AdminAccount";
import AdminApprovals from "../pages/admin/approvals/AdminApprovals";
import AdminServices from "../pages/admin/services/AdminServices";
import AdminBookings from "../pages/admin/bookings/AdminBookings";
import AdminReports from "../pages/admin/reports/AdminReports";
import AdminComplain from "../pages/admin/complain/AdminComplain";
import AdminLogin from "../pages/admin/login/AdminLogin";
import AdminReviews from "../pages/admin/reviews/AdminReviews";
//------------------------------------------------------------------------------------------

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========================================================= */}
        {/* TOÀN BỘ PHÂN VÙNG KHÁCH HÀNG (Bọc chung CustomerLayout)    */}
        {/* ========================================================= */}
        <Route path="/" element={<CustomerLayout />}>
          {/* ✅ PUBLIC — Ai cũng vào được */}
          <Route index element={<Home />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/:id" element={<ServiceDetailPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          {/* 🔒 PROTECTED — Phải đăng nhập */}
          <Route
            path="booking"
            element={
              <RequireAuth>
                <BookingPage />
              </RequireAuth>
            }
          />
          <Route
            path="promotions"
            element={
              <RequireAuth>
                <VoucherPage />
              </RequireAuth>
            }
          />
          <Route
            path="wallet"
            element={
              <RequireAuth>
                <WalletPage />
              </RequireAuth>
            }
          />
          <Route
            path="notifications"
            element={
              <RequireAuth>
                <NotificationPage />
              </RequireAuth>
            }
          />
          <Route
            path="messages"
            element={
              <RequireAuth>
                <MessagePage />
              </RequireAuth>
            }
          />
          <Route path="staff" element={<StaffListPage />} /> {/* Public */}
          <Route path="staff/:id" element={<StaffDetailPage />} />{" "}
          {/* Public */}
          <Route
            path="saved-staffs"
            element={
              <RequireAuth>
                <SavedStaffPage />
              </RequireAuth>
            }
          />
          {/* 🔒 Account (cả nhóm) */}
          <Route
            path="account"
            element={
              <RequireAuth>
                <AccountLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="addresses" element={<AddressesPage />} />
            <Route path="payment" element={<PaymentPage />} />
            <Route path="vouchers" element={<MyVouchersPage />} />
          </Route>
          {/* 🔒 My Bookings (cả nhóm) */}
          <Route path="my-bookings">
            <Route
              element={
                <RequireAuth>
                  <MyBookingsLayout />
                </RequireAuth>
              }
            >
              <Route index element={<AllBookingsPage />} />
              <Route path="upcoming" element={<UpcomingBookingsPage />} />
              <Route path="active" element={<ActiveBookingsPage />} />
              <Route path="completed" element={<CompletedBookingsPage />} />
            </Route>
            <Route
              path="history"
              element={
                <RequireAuth>
                  <BookingHistoryPage />
                </RequireAuth>
              }
            />
            <Route
              path=":id"
              element={
                <RequireAuth>
                  <BookingDetailPage />
                </RequireAuth>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* ========================================================= */}
        {/* TOÀN BỘ PHÂN VÙNG NHÂN VIÊN                               */}
        {/* ========================================================= */}
        <Route path="/partner" element={<PartnerLayout />}>
          <Route index element={<Navigate to="/partner/dashboard" replace />} />

          <Route path="login" element={<PartnerLogin />} />
          <Route path="register" element={<PartnerRegister />} />

          <Route path="dashboard" element={<PartnerDashboard />} />
          <Route path="schedule" element={<ScheduleManager />} />
          <Route path="wallet" element={<PartnerWallet />} />
          <Route path="reviews" element={<PartnerReviews />} />
          <Route path="profile" element={<PartnerProfile />} />
          <Route path="notifications" element={<PartnerNotifications />} />
          <Route path="messages" element={<PartnerMessagePage />} />

          <Route path="skills-registration" element={<SkillsRegistration />} />

          {/* Cơ chế 2: Nhân viên gõ sai URL trong phân vùng của mình */}
          {/* Ví dụ: /nhanvien/sai-chinh-ta -> đá về trang chủ nhân viên /nhanvien */}
          <Route
            path="/partner/*"
            element={<Navigate to="/partner/dashboard" replace />}
          />
        </Route>

        {/* ========================================================= */}
        {/* TOÀN BỘ PHÂN VÙNG ADMIN                                  */}
        {/* ========================================================= */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/login" replace />} />

          {/* SỬA CHÍNH XÁC DÒNG NÀY: GỌI COMPONENT AdminDashboard VÀO ĐÂY */}

          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminAccount />} />
          <Route path="approvals" element={<AdminApprovals />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="complain" element={<AdminComplain />} />
          <Route path="reviews" element={<AdminReviews />} />

          {/* Cơ chế 3: Admin gõ sai URL trong phân vùng quản trị */}
          {/* Ví dụ: /admin/chuc-nang-linh-tinh -> đá về /admin */}
          <Route
            path="/admin/*"
            element={<Navigate to="/admin/dashboard" replace />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
