import React from 'react';
import { BookingTabs, BookingCard, BOOKINGS } from './BookingUtils';

const AllBookingsPage = () => {
  return (
    <>
      <BookingTabs />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {BOOKINGS.all.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </div>
    </>
  );
};

export default AllBookingsPage;