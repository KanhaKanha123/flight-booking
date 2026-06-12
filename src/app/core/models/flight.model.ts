export interface City {
  id: number;
  name: string;
  label: string;
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  originId: number;
  destinationId: number;
  departureDate: Date;
  arrivalDate: Date;
  duration: string;
  price: number;
  seatsAvailable: number;
}

export interface FlightSearchCriteria {
  originId: number;
  destinationId: number;
  departureDate: Date;
  returnDate: Date | null;
  roundTrip?: boolean;
  passengers: number;
}

export interface FlightSearchResult {
  departureFlights: Flight[];
  returnFlights: Flight[];
}
