import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { Flight } from '../../core/models/flight.model';
import { FlightFilters } from '../../core/models/filter-sidebar.model';

import { FlightService } from '../../core/services/flight.service';
import { BookingService } from '../../core/services/booking.service';

import { getCityLabel } from '../../mock-data/cities';

import { FlightCardComponent } from '../../shared/components/flight-card/flight-card.component';
import { FilterSidebarComponent } from '../../shared/components/filter-sidebar/filter-sidebar.component';

@Component({
  selector: 'app-available-flights',
  standalone: true,
  imports: [CommonModule, RouterModule, FlightCardComponent, FilterSidebarComponent],
  templateUrl: './available-flights.component.html',
  styleUrls: ['./available-flights.component.scss'],
})
export class AvailableFlightsComponent implements OnInit {
  readonly flightService = inject(FlightService);

  readonly bookingService = inject(BookingService);

  readonly router = inject(Router);

  /**
   * Cached copy of the original search results.
   * Filters are always applied against these collections
   * so users can freely change filter combinations without
   * losing the complete result set.
   */
  private allDepartureFlights: Flight[] = [];

  private allReturnFlights: Flight[] = [];

  /**
   * Unique airline values extracted from the search results.
   * Used to populate the airline filter options.
   */
  availableAirlines: string[] = [];

  isRoundTrip = false;

  departureFlights: Flight[] = [];

  returnFlights: Flight[] = [];

  selectedOutboundFlight?: Flight;

  selectedReturnFlight?: Flight;

  ngOnInit(): void {
    this.initializeState();
  }

  /**
   * Initializes component state using
   * previously stored search results.
   *
   * Users reaching this page directly
   * without performing a search are
   * redirected back to the search page.
   */
  private initializeState(): void {
    const searchResult = this.flightService.getFlightSearchResult();

    if (!searchResult) {
      this.router.navigate(['/search']);

      return;
    }

    const searchCriteria = this.flightService.getSearchCriteria();

    this.isRoundTrip = !!searchCriteria?.roundTrip;

    this.departureFlights = searchResult.departureFlights ?? [];

    this.returnFlights = searchResult.returnFlights ?? [];

    this.allDepartureFlights = [...this.departureFlights];

    this.allReturnFlights = [...this.returnFlights];

    /**
     * Generates airline filter options
     * from the available search results.
     */
    this.availableAirlines = [
      ...new Set(
        [...this.departureFlights, ...this.returnFlights]
          .map((flight) => flight.airline)
          .filter(Boolean),
      ),
    ];

    this.applyFilters({
      airlines: [],
      departureSlots: [],
      sortBy: 'price',
    });
  }

  get departureFlightsFound(): boolean {
    return this.departureFlights.length > 0;
  }

  get hasReturnFlights(): boolean {
    return this.isRoundTrip && this.returnFlights.length > 0;
  }

  /**
   * Determines whether any flights were returned
   * from the original search request.
   */
  get hasSearchResults(): boolean {
    return this.allDepartureFlights.length > 0 || this.allReturnFlights.length > 0;
  }

  /**
   * Determines whether the user can continue
   * to the booking step.
   *
   * One-way trip:
   * - Outbound flight must be selected
   *
   * Round-trip:
   * - Both outbound and return flights
   *   must be selected.
   */
  get canContinue(): boolean {
    if (!this.isRoundTrip) {
      return !!this.selectedOutboundFlight;
    }

    return !!this.selectedOutboundFlight && !!this.selectedReturnFlight;
  }

  /**
   * Stores the selected outbound flight.
   */
  selectOutboundFlight(flight: Flight): void {
    this.selectedOutboundFlight = flight;
  }

  /**
   * Stores the selected return flight.
   */
  selectReturnFlight(flight: Flight): void {
    this.selectedReturnFlight = flight;
  }

  /**
   * Persists the selected flights and
   * navigates to the booking page.
   */
  continueToBooking(): void {
    if (!this.canContinue) {
      return;
    }

    this.bookingService.saveSelectedFlights(
      this.selectedOutboundFlight!,
      this.selectedReturnFlight,
    );

    this.router.navigate(['/booking']);
  }

  /**
   * Returns the user to the search page
   * to modify search criteria.
   */
  searchAgain(): void {
    this.router.navigate(['/search']);
  }

  getCityLabel(cityId: number | undefined, fallback?: string): string {
    return getCityLabel(cityId, fallback);
  }

  /**
   * Applies all active filters and sorting
   * to both outbound and return flight results.
   */
  applyFilters(filters: FlightFilters): void {
    this.departureFlights = this.filterFlights(this.allDepartureFlights, filters);

    this.returnFlights = this.filterFlights(this.allReturnFlights, filters);
  }

  /**
   * Applies airline filtering,
   * departure-time filtering,
   * and sorting to a flight collection.
   */
  private filterFlights(flights: Flight[], filters: FlightFilters): Flight[] {
    let filtered = [...flights];

    if (filters.airlines.length) {
      filtered = filtered.filter((flight) => filters.airlines.includes(flight.airline));
    }

    if (filters.departureSlots.length) {
      filtered = filtered.filter((flight) => this.matchesTimeSlot(flight, filters.departureSlots));
    }

    return this.sortFlights(filtered, filters.sortBy);
  }

  /**
   * Determines whether a flight falls
   * within one of the selected departure
   * time categories.
   */
  private matchesTimeSlot(flight: Flight, slots: string[]): boolean {
    const hour = new Date(flight.departureDate).getHours();

    return slots.some((slot) => {
      switch (slot) {
        case 'Morning':
          return hour >= 5 && hour < 12;

        case 'Afternoon':
          return hour >= 12 && hour < 18;

        case 'Evening':
          return hour >= 18 || hour < 5;

        default:
          return false;
      }
    });
  }

  /**
   * Sorts flights according to the
   * selected sort criteria.
   *
   * Supported options:
   * - price
   * - duration
   */
  private sortFlights(flights: Flight[], sortBy: 'price' | 'duration'): Flight[] {
    const sorted = [...flights];

    if (sortBy === 'price') {
      return sorted.sort((a, b) => a.price - b.price);
    }

    return sorted.sort(
      (a, b) => this.durationToMinutes(a.duration) - this.durationToMinutes(b.duration),
    );
  }

  /**
   * Converts duration strings such as
   * "2h 30m" into total minutes.
   *
   * This simplifies duration-based sorting.
   */
  private durationToMinutes(duration: string): number {
    const [hours, minutes] = duration.split('h');

    return Number(hours.trim()) * 60 + Number(minutes?.replace('m', '').trim());
  }
}
