import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  Flight,
  FlightSearchCriteria,
  FlightSearchResult,
} from '../models/flight.model';
import { FLIGHTS } from '../../mock-data/flights';

@Injectable({
  providedIn: 'root',
})
export class FlightService {
  /**
   * Mock flight inventory used to simulate
   * backend flight search responses.
   */
  private readonly flights = FLIGHTS;

  /**
   * Stores the latest search result in memory.
   * This allows subsequent pages to access
   * flight results without re-executing a search.
   */
  readonly flightSearchResult = signal<FlightSearchResult | null>(null);

  /**
   * Persists the last search criteria so the
   * search form can be restored when users
   * navigate back from later steps.
   */
  private readonly searchCriteriaSubject =
    new BehaviorSubject<FlightSearchCriteria | null>(null);

  readonly searchCriteria$ = this.searchCriteriaSubject.asObservable();

  /**
   * Searches outbound and return flights.
   * For round-trip bookings both searches
   * are executed and combined into a single result.
   */
  searchFlights(
    criteria: FlightSearchCriteria,
  ): Observable<FlightSearchResult> {
    const departureFlights$ = this.findFlights(
      criteria.originId,
      criteria.destinationId,
      criteria.departureDate,
    );

    const returnFlights$ =
      criteria.roundTrip && criteria.returnDate
        ? this.findFlights(
            criteria.destinationId,
            criteria.originId,
            criteria.returnDate,
          )
        : of([]);

    return combineLatest([departureFlights$, returnFlights$]).pipe(
      map(([departureFlights, returnFlights]) => ({
        departureFlights,
        returnFlights,
      })),
    );
  }

  /**
   * Saves the latest search criteria.
   */
  saveSearchCriteria(criteria: FlightSearchCriteria): void {
    this.searchCriteriaSubject.next(criteria);
  }

  /**
   * Returns the most recent search criteria.
   */
  getSearchCriteria(): FlightSearchCriteria | null {
    return this.searchCriteriaSubject.value;
  }

  /**
   * Stores search results in memory so
   * other pages can consume them.
   */
  saveFlightSearchResult(result: FlightSearchResult): void {
    this.flightSearchResult.set(result);
  }

  /**
   * Returns the most recent search result.
   */
  getFlightSearchResult(): FlightSearchResult | null {
    return this.flightSearchResult();
  }

  /**
   * Finds flights matching route and date.
   * Simulates an API call using RxJS and
   * mock data.
   */
  private findFlights(
    originId: number,
    destinationId: number,
    date?: Date,
  ): Observable<Flight[]> {
    if (!date) {
      return of([]);
    }

    const searchDate = this.formatDate(date);

    return of(this.flights).pipe(
      /**
       * Artificial delay to demonstrate
       * loading state behaviour in the UI.
       * Can be removed when integrating
       * with a real backend.
       */
      delay(1500),

      map((flights) =>
        flights.filter(
          (flight) =>
            flight.originId === originId &&
            flight.destinationId === destinationId &&
            this.formatDate(flight.departureDate) === searchDate,
        ),
      ),
    );
  }

  /**
   * Normalizes dates into a consistent
   * yyyy-MM-dd format for comparison.
   * Uses local time to avoid timezone
   * issues caused by UTC conversion.
   */
  private formatDate(date: Date | string): string {
    const d = new Date(date);

    const year = d.getFullYear();

    const month = String(d.getMonth() + 1).padStart(2, '0');

    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /**
   * Clears search-related state when
   * starting a completely new booking flow.
   */
  resetSearch(): void {
    this.searchCriteriaSubject.next(null);

    this.flightSearchResult.set(null);
  }
}
