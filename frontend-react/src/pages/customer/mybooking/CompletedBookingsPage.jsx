import React from 'react';
import { BookingTabs, BookingCard, BOOKINGS } from './BookingUtils';

const CompletedBookingsPage = () => {
  return (
    <>
      <BookingTabs />
      {BOOKINGS.completed.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          {BOOKINGS.completed.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-6 border border-outline-variant/30">
      <span className="material-symbols-outlined text-5xl text-outline">history</span>
    </div>
    <h2 className="font-h2 text-h2 text-on-surface mb-2">Chưa có lịch sử</h2>
    <p className="text-on-surface-variant max-w-md mx-auto font-body-md">
      Các đơn đã hoàn thành sẽ xuất hiện ở đây.
    </p>
  </div>
);

export default CompletedBookingsPage;