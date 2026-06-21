import React from 'react';
import { BookingTabs, BookingCard } from './BookingUtils';
import { useBookingFilter } from './MyBookingsLayout';

const AllBookingsPage = () => {
  const { bookings, loading } = useBookingFilter();

  return (
    <>
      <BookingTabs />
      {loading ? (
        <div className="py-20 text-center text-on-surface-variant">Đang tải dữ liệu...</div>
      ) : bookings.all.length === 0 ? (
        <EmptyState message="Bạn chưa có đơn nào." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          {bookings.all.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </>
  );
};

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-6 border border-outline-variant/30">
      <span className="material-symbols-outlined text-5xl text-outline">inbox</span>
    </div>
    <h2 className="font-h2 text-h2 text-on-surface mb-2">Chưa có lịch hẹn</h2>
    <p className="text-on-surface-variant max-w-md mx-auto font-body-md">{message}</p>
  </div>
);

export default AllBookingsPage;
