import React from 'react';
import { BookingTabs, BookingCard, BOOKINGS } from './BookingUtils';

const ActiveBookingsPage = () => {
  return (
    <>
      <BookingTabs />
      {BOOKINGS.active.length === 0 ? (
        <EmptyState message="Hiện không có đơn nào đang được thực hiện." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          {BOOKINGS.active.map((booking) => (
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
      <span className="material-symbols-outlined text-5xl text-outline">hourglass_empty</span>
    </div>
    <h2 className="font-h2 text-h2 text-on-surface mb-2">Không có đơn đang thực hiện</h2>
    <p className="text-on-surface-variant max-w-md mx-auto font-body-md">{message}</p>
  </div>
);

export default ActiveBookingsPage;