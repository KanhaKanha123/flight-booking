import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FlightSummaryCardComponent } from '../../shared/components/flight-summary-card/flight-summary-card.component';
import { BookingService } from '../../core/services/booking.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FlightSummaryCardComponent,
  ],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
})
export class BookingComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);

  /**
   * Flights selected by the user
   * on the Available Flights page.
   */
  readonly outboundFlight = this.bookingService.getOutboundFlight();
  readonly returnFlight = this.bookingService.getReturnFlight();

  /**
   * Passenger information required
   * to complete the booking.
   */
  bookingForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    contactNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]+$/)]],
    passengers: [1, [Validators.required, Validators.min(1)]],
  });

  /**
   * Calculates the booking total
   * based on selected flights and
   * number of passengers.
   */
  get totalPrice(): number {
    const passengers = Number(this.bookingForm.value.passengers ?? 1);
    const outboundPrice = this.outboundFlight?.price ?? 0;
    const returnPrice = this.returnFlight?.price ?? 0;

    return (outboundPrice + returnPrice) * passengers;
  }

  /**
   * Validates the form,
   * creates booking details
   * and redirects to the
   * confirmation page.
   */
  submit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();

      return;
    }

    /**
     * Simple reference generator
     * for demo purposes.
     */
    const bookingReference = `BK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    this.bookingService.saveBookingDetails({
      bookingReference,
      fullName: this.bookingForm.value.fullName!,
      email: this.bookingForm.value.email!,
      contactNumber: this.bookingForm.value.contactNumber!,
      passengers: Number(this.bookingForm.value.passengers),
      outboundFlight: this.outboundFlight!,
      returnFlight: this.returnFlight,
    });

    this.router.navigate(['/confirmation']);
  }
}
