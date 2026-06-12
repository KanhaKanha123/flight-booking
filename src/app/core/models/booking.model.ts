import { Flight } from './flight.model';

export interface BookingDetails {
  bookingReference: string;
  fullName: string;
  email: string;
  contactNumber: string;
  passengers: number;
  outboundFlight: Flight;
  returnFlight: Flight | null;
}
