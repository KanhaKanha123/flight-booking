import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FlightService } from './flight.service';
import { FlightSearchCriteria, FlightSearchResult } from '../models/flight.model';

describe('FlightService', () => {
  let service: FlightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save and retrieve search criteria', () => {
    const criteria: FlightSearchCriteria = {
      originId: 1,
      destinationId: 2,
      departureDate: new Date(),
      returnDate: null,
      passengers: 1,
      roundTrip: false,
    };

    service.saveSearchCriteria(criteria);
    expect(service.getSearchCriteria()).toEqual(criteria);
  });

  it('should save and retrieve search results', () => {
    const result: FlightSearchResult = {
      departureFlights: [],
      returnFlights: [],
    };

    service.saveFlightSearchResult(result);
    expect(service.getFlightSearchResult()).toEqual(result);
  });

  it('should reset search state', () => {
    const criteria: FlightSearchCriteria = {
      originId: 1,
      destinationId: 2,
      departureDate: new Date(),
      returnDate: null,
      passengers: 1,
      roundTrip: false,
    };

    service.saveSearchCriteria(criteria);
    service.saveFlightSearchResult({
      departureFlights: [],
      returnFlights: [],
    });

    service.resetSearch();

    expect(service.getSearchCriteria()).toBeNull();
    expect(service.getFlightSearchResult()).toBeNull();
  });

  it('should return outbound flights for one-way search', fakeAsync(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const criteria: FlightSearchCriteria = {
      originId: 1,
      destinationId: 2,
      departureDate: tomorrow,
      returnDate: null,
      passengers: 1,
      roundTrip: false,
    };

    let result: FlightSearchResult | undefined;

    service.searchFlights(criteria).subscribe((response) => {
      result = response;
    });

    tick(1500);

    expect(result).toBeDefined();
    expect(result!.departureFlights).toBeDefined();
    expect(result!.returnFlights).toEqual([]);
  }));

  it('should return outbound and return flights for round-trip search', fakeAsync(() => {
    const departureDate = new Date();
    departureDate.setDate(departureDate.getDate() + 1);

    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 2);

    const criteria: FlightSearchCriteria = {
      originId: 1,
      destinationId: 2,
      departureDate,
      returnDate,
      passengers: 1,
      roundTrip: true,
    };

    let result: FlightSearchResult | undefined;

    service.searchFlights(criteria).subscribe((response) => {
      result = response;
    });

    tick(1500);

    expect(result).toBeDefined();
    expect(result!.departureFlights).toBeDefined();
    expect(result!.returnFlights).toBeDefined();
  }));

  it('should return empty arrays when no flights match', fakeAsync(() => {
    const criteria: FlightSearchCriteria = {
      originId: 999,
      destinationId: 888,
      departureDate: new Date(),
      returnDate: null,
      passengers: 1,
      roundTrip: false,
    };

    let result: FlightSearchResult | undefined;

    service.searchFlights(criteria).subscribe((response) => {
      result = response;
    });

    tick(1500);

    expect(result).toEqual({
      departureFlights: [],
      returnFlights: [],
    });
  }));

  it('should emit search criteria through observable', (done) => {
    const criteria: FlightSearchCriteria = {
      originId: 1,
      destinationId: 2,
      departureDate: new Date(),
      returnDate: null,
      passengers: 1,
      roundTrip: false,
    };

    let emissionCount = 0;

    service.searchCriteria$.subscribe((value) => {
      emissionCount++;

      if (emissionCount === 2) {
        expect(value).toEqual(criteria);

        done();
      }
    });

    service.saveSearchCriteria(criteria);
  });
});
