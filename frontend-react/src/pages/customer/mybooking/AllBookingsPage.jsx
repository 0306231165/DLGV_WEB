import React from 'react';
import { BookingTabs, BookingCard, getBookingsSnapshot } from './BookingUtils';

const AllBookingsPage = () => {
  const bookings = getBookingsSnapshot();

  return (
    <>
      <BookingTabs />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {bookings.all.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </div>
    </>
  );
};

export default AllBookingsPage;
