import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BookingService } from '../services/booking.service';

export const confirmationGuard: CanActivateFn = () => {
  const bookingService = inject(BookingService);

  const router = inject(Router);

  const booking = bookingService.getBookingDetails();

  if (booking) {
    return true;
  }

  return router.createUrlTree(['/search']);
};
