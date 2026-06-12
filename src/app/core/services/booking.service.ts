import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Flight } from '../models/flight.model';
import { BookingDetails } from '../models/booking.model';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  /**
   * Indicates whether the user selected
   * a one-way or round-trip journey.
   */
  readonly isRoundTrip = signal(false);

  /**
   * Stores the outbound flight selected
   * by the user during the flight selection step.
   */
  readonly outboundFlight = signal<Flight | null>(null);

  /**
   * Stores the return flight selected
   * for round-trip bookings.
   */
  readonly returnFlight = signal<Flight | null>(null);

  /**
   * Stores booking confirmation details in memory.
   * The confirmation page retrieves its data from
   * this signal after a booking is completed.
   */
  readonly bookingDetails = signal<BookingDetails | null>(null);

  /**
   * Observable-based selected flight state.
   * Retained for compatibility with RxJS consumers.
   */
  private readonly selectedFlightSubject = new BehaviorSubject<Flight | null>(null);

  readonly selectedFlight$ = this.selectedFlightSubject.asObservable();

  /**
   * Persists the selected trip type.
   */
  saveRoundTrip(value: boolean): void {
    this.isRoundTrip.set(value);
  }

  /**
   * Returns whether the current booking
   * is a round-trip journey.
   */
  getRoundTrip(): boolean {
    return this.isRoundTrip();
  }

  /**
   * Saves the flights selected by the user
   * before navigating to the booking page.
   */
  saveSelectedFlights(outboundFlight: Flight, returnFlight?: Flight): void {
    this.outboundFlight.set(outboundFlight);

    this.returnFlight.set(returnFlight ?? null);
  }

  /**
   * Returns the currently selected
   * outbound flight.
   */
  getOutboundFlight(): Flight | null {
    return this.outboundFlight();
  }

  /**
   * Returns the currently selected
   * return flight.
   */
  getReturnFlight(): Flight | null {
    return this.returnFlight();
  }

  /**
   * Updates the observable selected-flight state.
   */
  selectFlight(flight: Flight): void {
    this.selectedFlightSubject.next(flight);
  }

  /**
   * Stores booking details after successful
   * form submission and before navigation
   * to the confirmation page.
   */
  saveBookingDetails(booking: BookingDetails): void {
    this.bookingDetails.set(booking);
  }

  /**
   * Returns the booking confirmation data.
   */
  getBookingDetails(): BookingDetails | null {
    return this.bookingDetails();
  }

  /**
   * Clears all booking-related state.
   * Used when starting a completely new booking flow.
   */
  clearBooking(): void {
    this.outboundFlight.set(null);
    this.returnFlight.set(null);
    this.bookingDetails.set(null);
    this.isRoundTrip.set(false);
    this.selectedFlightSubject.next(null);
  }
}
