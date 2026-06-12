import { City } from '../core/models/flight.model';

export const CITIES: City[] = [
  { id: 1, name: 'New York', label: 'New York (JFK)' },
  { id: 2, name: 'San Francisco', label: 'San Francisco (SFO)' },
  { id: 3, name: 'Singapore', label: 'Singapore (SIN)' },
  { id: 4, name: 'London', label: 'London (LHR)' },
  { id: 5, name: 'Dubai', label: 'Dubai (DXB)' },
  { id: 6, name: 'Sydney', label: 'Sydney (SYD)' },
  { id: 7, name: 'Paris', label: 'Paris (CDG)' },
  { id: 8, name: 'Amsterdam', label: 'Amsterdam (AMS)' },
  { id: 9, name: 'Frankfurt', label: 'Frankfurt (FRA)' },
  { id: 10, name: 'Madrid', label: 'Madrid (MAD)' },
  { id: 11, name: 'Barcelona', label: 'Barcelona (BCN)' },
  { id: 12, name: 'Rome', label: 'Rome (FCO)' },
  { id: 13, name: 'Berlin', label: 'Berlin (BER)' },
  { id: 14, name: 'Munich', label: 'Munich (MUC)' },
  { id: 15, name: 'Zurich', label: 'Zurich (ZRH)' },
];

export const CITY_MAP = new Map(CITIES.map((city) => [city.id, city]));

export function getCityLabel(id: number | undefined, fallback = ''): string {
  return id ? (CITY_MAP.get(id)?.label ?? fallback) : fallback;
}

