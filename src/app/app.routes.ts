import { Routes } from '@angular/router';

import { bookingGuard } from './core/guards/booking.guard';

import { confirmationGuard } from './core/guards/confirmation.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'search',
    pathMatch: 'full',
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/search/flight-search.component').then(
        (m) => m.FlightSearchComponent,
      ),
  },
  {
    path: 'available-flights',
    loadComponent: () =>
      import('./features/available-flights/available-flights.component').then(
        (m) => m.AvailableFlightsComponent,
      ),
  },
  {
    path: 'booking',
    canActivate: [bookingGuard],
    loadComponent: () =>
      import('./features/booking/booking.component').then(
        (m) => m.BookingComponent,
      ),
  },
  {
    path: 'confirmation',
    canActivate: [confirmationGuard],
    loadComponent: () =>
      import('./features/confirmation/confirmation.component').then(
        (m) => m.ConfirmationComponent,
      ),
  },
  {
    path: '**',
    redirectTo: 'search',
  },
];
