import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
   * Original unfiltered flight collections.
   * Filters are always applied against these
   * arrays to avoid losing data.
   */
  private allDepartureFlights: Flight[] = [];
  private allReturnFlights: Flight[] = [];

  /**
   * UI state.
   */
  readonly availableAirlines = signal<string[]>([]);
  readonly isRoundTrip = signal(false);
  readonly departureFlights = signal<Flight[]>([]);
  readonly returnFlights = signal<Flight[]>([]);
  readonly selectedOutboundFlight = signal<Flight | null>(null);
  readonly selectedReturnFlight = signal<Flight | null>(null);

  /**
   * Derived state.
   */
  readonly departureFlightsFound = computed(() => this.departureFlights().length > 0);
  readonly hasReturnFlights = computed(() => this.isRoundTrip() && this.returnFlights().length > 0);
  readonly hasSearchResults = computed(
    () => this.allDepartureFlights.length > 0 || this.allReturnFlights.length > 0,
  );
  readonly canContinue = computed(() => {
    if (!this.isRoundTrip()) {
      return !!this.selectedOutboundFlight();
    }

    return !!this.selectedOutboundFlight() && !!this.selectedReturnFlight();
  });

  ngOnInit(): void {
    this.initializeState();
  }

  /**
   * Initializes component state using
   * previously stored search results.
   */
  private initializeState(): void {
    const searchResult = this.flightService.getFlightSearchResult();

    if (!searchResult) {
      this.router.navigate(['/search']);

      return;
    }

    const searchCriteria = this.flightService.getSearchCriteria();
    this.isRoundTrip.set(!!searchCriteria?.roundTrip);
    this.departureFlights.set(searchResult.departureFlights ?? []);
    this.returnFlights.set(searchResult.returnFlights ?? []);
    this.allDepartureFlights = [...this.departureFlights()];
    this.allReturnFlights = [...this.returnFlights()];

    /**
     * Generates airline filter options
     * from the available search results.
     */
    this.availableAirlines.set([
      ...new Set(
        [...this.departureFlights(), ...this.returnFlights()]
          .map((flight) => flight.airline)
          .filter(Boolean),
      ),
    ]);

    this.applyFilters({
      airlines: [],
      departureSlots: [],
      sortBy: 'price',
    });
  }

  /**
   * Stores the selected outbound flight.
   */
  selectOutboundFlight(flight: Flight): void {
    this.selectedOutboundFlight.set(flight);
  }

  /**
   * Stores the selected return flight.
   */
  selectReturnFlight(flight: Flight): void {
    this.selectedReturnFlight.set(flight);
  }

  /**
   * Persists the selected flights and
   * navigates to the booking page.
   */
  continueToBooking(): void {
    if (!this.canContinue()) {
      return;
    }

    this.bookingService.saveSelectedFlights(
      this.selectedOutboundFlight()!,
      this.selectedReturnFlight() ?? undefined,
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
    this.departureFlights.set(this.filterFlights(this.allDepartureFlights, filters));

    this.returnFlights.set(this.filterFlights(this.allReturnFlights, filters));
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
   */
  private durationToMinutes(duration: string): number {
    const [hours, minutes] = duration.split('h');

    return Number(hours.trim()) * 60 + Number(minutes?.replace('m', '').trim());
  }
}
