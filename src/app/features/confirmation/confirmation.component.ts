import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FlightSummaryCardComponent } from '../../shared/components/flight-summary-card/flight-summary-card.component';
import { BookingDetails } from '../../core/models/booking.model';
import { BookingService } from '../../core/services/booking.service';
import { FlightService } from '../../core/services/flight.service';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, FlightSummaryCardComponent],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
})
export class ConfirmationComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly flightService = inject(FlightService);
  private readonly router = inject(Router);

  booking: BookingDetails | null = null;

  readonly bookingDate = new Date();

  ngOnInit(): void {
    this.booking = this.bookingService.getBookingDetails();

    if (!this.booking) {
      this.router.navigate(['/search']);

      return;
    }
  }

  /**
   * Calculates the total price of the booking based
   * on the selected flights and number of passengers.
   */
  get totalPrice(): number {
    if (!this.booking) {
      return 0;
    }

    const outboundPrice = this.booking.outboundFlight.price;
    const returnPrice = this.booking.returnFlight?.price ?? 0;

    return (outboundPrice + returnPrice) * this.booking.passengers;
  }

  /**
   * Clears the current booking and search state,
   * then navigates the user back to the search page
   * to start a new booking.
   */
  bookAnotherFlight(): void {
    this.bookingService.clearBooking();
    this.flightService.resetSearch();

    this.router.navigate(['/search']);
  }
}
