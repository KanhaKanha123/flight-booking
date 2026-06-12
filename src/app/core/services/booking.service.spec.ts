import { TestBed } from '@angular/core/testing';
import { BookingService } from './booking.service';
import { Flight } from '../models/flight.model';
import { BookingDetails } from '../models/booking.model';

describe('BookingService', () => {
  let service: BookingService;

  const outboundFlight: Flight = {
    id: 'FL-1001',
    airline: 'KLM',
    flightNumber: 'KL123',
    originId: 1,
    destinationId: 2,
    departureDate: new Date(),
    arrivalDate: new Date(),
    duration: '2h 30m',
    price: 250,
    seatsAvailable: 10,
  };

  const returnFlight: Flight = {
    id: 'FL-1002',
    airline: 'KLM',
    flightNumber: 'KL456',
    originId: 2,
    destinationId: 1,
    departureDate: new Date(),
    arrivalDate: new Date(),
    duration: '2h 15m',
    price: 220,
    seatsAvailable: 12,
  };

  const bookingDetails: BookingDetails = {
    bookingReference: 'BK-12345',
    fullName: 'John Doe',
    email: 'john@test.com',
    contactNumber: '+31612345678',
    passengers: 2,
    outboundFlight,
    returnFlight,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});

    service = TestBed.inject(BookingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save and retrieve round trip value', () => {
    service.saveRoundTrip(true);

    expect(service.getRoundTrip()).toBeTrue();

    service.saveRoundTrip(false);

    expect(service.getRoundTrip()).toBeFalse();
  });

  it('should save and retrieve selected flights', () => {
    service.saveSelectedFlights(outboundFlight, returnFlight);

    expect(service.getOutboundFlight()).toEqual(outboundFlight);
    expect(service.getReturnFlight()).toEqual(returnFlight);
  });

  it('should save outbound flight without return flight', () => {
    service.saveSelectedFlights(outboundFlight);

    expect(service.getOutboundFlight()).toEqual(outboundFlight);
    expect(service.getReturnFlight()).toBeNull();
  });

  it('should emit selected flight through observable', (done) => {
    service.selectedFlight$.subscribe((flight) => {
      if (flight) {
        expect(flight).toEqual(outboundFlight);

        done();
      }
    });

    service.selectFlight(outboundFlight);
  });

  it('should save and retrieve booking details', () => {
    service.saveBookingDetails(bookingDetails);

    expect(service.getBookingDetails()).toEqual(bookingDetails);
  });

  it('should clear all booking state', () => {
    service.saveRoundTrip(true);

    service.saveSelectedFlights(outboundFlight, returnFlight);

    service.saveBookingDetails(bookingDetails);

    service.selectFlight(outboundFlight);

    service.clearBooking();

    expect(service.getRoundTrip()).toBeFalse();
    expect(service.getOutboundFlight()).toBeNull();
    expect(service.getReturnFlight()).toBeNull();
    expect(service.getBookingDetails()).toBeNull();
  });

  it('should emit null after clearBooking', (done) => {
    const emissions: (Flight | null)[] = [];

    service.selectedFlight$.subscribe((flight) => {
      emissions.push(flight);

      if (emissions.length === 3) {
        expect(emissions[0]).toBeNull();
        expect(emissions[1]).toEqual(outboundFlight);
        expect(emissions[2]).toBeNull();

        done();
      }
    });

    service.selectFlight(outboundFlight);
    service.clearBooking();
  });
});
