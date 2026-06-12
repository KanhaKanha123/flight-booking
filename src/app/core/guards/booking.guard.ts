import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BookingService } from '../services/booking.service';

export const bookingGuard: CanActivateFn = () => {
  const bookingService = inject(BookingService);

  const router = inject(Router);

  const outboundFlight = bookingService.getOutboundFlight();

  if (outboundFlight) {
    return true;
  }

  return router.createUrlTree(['/available-flights']);
};
