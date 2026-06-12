import { Flight } from '../core/models/flight.model';
import { CITIES } from './cities';

/**
 * Mock flight inventory used by the application
 * to simulate flight search results.
 */
const FLIGHTS: Flight[] = [];

/**
 * Counter used to generate unique flight identifiers.
 */
let counter = 1000;

/**
 * Base date used for generating future flight schedules.
 */
const today = new Date();

/**
 * Sample airlines available in the mock dataset.
 */
const AIRLINES = [
  'KLM',
  'Lufthansa',
  'Emirates',
  'British Airways',
  'Qatar Airways',
  'Singapore Airlines',
  'Air France',
  'Delta Airlines',
];

/**
 * Available departure hours distributed
 * throughout the day.
 */
const DEPARTURE_HOURS = [5, 7, 9, 12, 15, 18, 21];

for (const origin of CITIES) {
  for (const destination of CITIES) {
    // Skip flights where origin and destination are the same.
    if (origin.id === destination.id) {
      continue;
    }

    // Generate flights for the next 30 days.
    for (let dayOffset = 1; dayOffset <= 30; dayOffset++) {
      // Generate multiple flight options per route and day.
      for (let flightIndex = 0; flightIndex < 5; flightIndex++) {
        const departureDate = new Date(today);

        departureDate.setDate(today.getDate() + dayOffset);

        const departureHour = DEPARTURE_HOURS[Math.floor(Math.random() * DEPARTURE_HOURS.length)];

        const departureMinute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];

        departureDate.setHours(departureHour, departureMinute, 0, 0);

        // Generate random flight duration.
        const durationHours = Math.floor(Math.random() * 10) + 2;

        const durationMinutes = [0, 15, 30, 45][Math.floor(Math.random() * 4)];

        const arrivalDate = new Date(departureDate);

        arrivalDate.setHours(arrivalDate.getHours() + durationHours);

        arrivalDate.setMinutes(arrivalDate.getMinutes() + durationMinutes);

        // Generate random pricing and seat availability.
        const price = Math.floor(Math.random() * 900) + 100;

        const seatsAvailable = Math.floor(Math.random() * 40) + 5;

        const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];

        FLIGHTS.push({
          id: `FL-${++counter}`,
          airline,
          flightNumber:
            airline.substring(0, 2).toUpperCase() + Math.floor(100 + Math.random() * 900),
          originId: origin.id,
          destinationId: destination.id,
          departureDate,
          arrivalDate,
          duration: `${durationHours}h ${durationMinutes}m`,
          price,
          seatsAvailable,
        });
      }
    }
  }
}

export { FLIGHTS };
