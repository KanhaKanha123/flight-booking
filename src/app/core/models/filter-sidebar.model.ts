export interface FlightFilters {
  airlines: string[];
  departureSlots: string[];
  sortBy: 'price' | 'duration';
}
