import React from 'react';
import { BookingTabs, BookingCard, BOOKINGS } from './BookingUtils';

const UpcomingBookingsPage = () => {
  return (
    <>
      <BookingTabs />
      {BOOKINGS.upcoming.length === 0 ? (
        <EmptyState message="Bạn không có đơn sắp tới nào." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          {BOOKINGS.upcoming.map((booking) => (
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
      <span className="material-symbols-outlined text-5xl text-outline">event_busy</span>
    </div>
    <h2 className="font-h2 text-h2 text-on-surface mb-2">Không có lịch hẹn</h2>
    <p className="text-on-surface-variant max-w-md mx-auto mb-8 font-body-md">{message}</p>
    <button className="px-10 py-4 bg-primary text-on-primary rounded-2xl font-h3 shadow-lg shadow-primary/30 hover:-translate-y-1 transition-all active:translate-y-0">
      Đặt lịch ngay
    </button>
  </div>
);

export default UpcomingBookingsPage;