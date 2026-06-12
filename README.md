# FlightBooking

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.27.

## Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project run:

```bash
npm build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
npm test
```

# Flight Booking Application

A modern Angular 19 flight booking application that simulates a complete flight reservation workflow.

Note: For the best experience, please select travel dates between 15/06/2026 and 10/07/2026. The application uses mock flight data with limited availability outside this date range.

Users can:

- Search for available flights
- Select outbound and return flights
- Filter and sort flight results
- Complete passenger booking information
- View booking confirmation details

The application is built using Angular Standalone Components, Angular Material, Reactive Forms, Signals, RxJS, and Route Guards.

---

# Tech Stack

- Angular 19
- TypeScript
- Angular Material
- Reactive Forms
- Angular Signals
- RxJS
- SCSS
- Standalone Components

---

# Features

## Flight Search

Users can search flights by:

- Origin
- Destination
- Departure Date
- Return Date (optional)
- Round Trip Selection

### Search Validations

- Origin is required
- Destination is required
- Departure Date is required
- Return Date is required for round trips
- Origin and destination cannot be the same
- Return date must be after departure date
- Users must select cities from the autocomplete suggestions

### Additional Functionality

- Origin/Destination swap button
- Autocomplete city search
- Form state restoration when navigating back

---

## Available Flights

Displays:

- Outbound flights
- Return flights
- Flight details
- Pricing information

### Filters

- Airline Filter
- Departure slots

### Sorting

- Sort by Price
- Sort by Duration

### Additional Functionality

- Flight selection
- Empty state handling
- Search modification support

---

## Booking

Passenger details form:

- Full Name
- Email Address
- Contact Number
- Number of Passengers

### Booking Validations

- Full Name required
- Valid Email required
- Contact Number required
- Minimum 1 passenger

### Additional Functionality

- Dynamic fare calculation
- Trip summary
- Selected flight summary

---

## Confirmation

Displays:

- Booking Reference
- Booking Date
- Passenger Details
- Flight Details
- Payment Summary

### Additional Functionality

- Start a new booking
- Reset previous booking data

---

# Route Guards

The application prevents invalid navigation using Angular Route Guards.

## Booking Guard

Protects:

```text
/booking
```

Users cannot access the booking page without selecting a flight.

## Confirmation Guard

Protects:

```text
/confirmation
```

Users cannot access the confirmation page without completing a booking.

---

# Project Structure

```text
src
│
├── app
│   │
│   ├── core
│   │   │
│   │   ├── guards
│   │   │   ├── booking.guard.ts
│   │   │   └── confirmation.guard.ts
│   │   │
│   │   ├── models
│   │   │   ├── booking.model.ts
│   │   │   ├── filter-sidebar.model.ts
│   │   │   └── flight.model.ts
│   │   │
│   │   └── services
│   │       ├── booking.service.ts
│   │       └── flight.service.ts
│   │
│   ├── features
│   │   │
│   │   ├── search
│   │   │   ├── flight-search.component.ts
│   │   │   ├── flight-search.component.html
│   │   │   └── flight-search.component.scss
│   │   │
│   │   ├── available-flights
│   │   │   ├── available-flights.component.ts
│   │   │   ├── available-flights.component.html
│   │   │   └── available-flights.component.scss
│   │   │
│   │   ├── booking
│   │   │   ├── booking.component.ts
│   │   │   ├── booking.component.html
│   │   │   └── booking.component.scss
│   │   │
│   │   └── confirmation
│   │       ├── confirmation.component.ts
│   │       ├── confirmation.component.html
│   │       └── confirmation.component.scss
│   │
│   ├── mock-data
│   │   ├── cities.ts
│   │   └── flights.ts
│   │
│   ├── shared
│   │   │
│   │   ├── components
│   │   │   ├── filter-sidebar
│   │   │   ├── flight-card
│   │   │   └── flight-summary-card
│   │   │
│   │   └── containers
│   │       └── page-shell
│   │
│   ├── app.routes.ts
│   ├── app.config.ts
│   └── app.component.ts
│
├── styles.scss
└── main.ts
```

---

# Application Flow

```text
Search Flights
      │
      ▼
Available Flights
      │
      ▼
Booking
      │
      ▼
Confirmation
```

---

# State Management

The application uses lightweight service-based state management.

## FlightService

Responsible for:

- Search Criteria
- Flight Search Results

## BookingService

Responsible for:

- Selected Flights
- Booking Details
- Confirmation Data

This approach keeps the application simple while maintaining separation of concerns.

---

# Mock Data

The application uses locally generated mock data.

### Cities

Located in:

```text
src/app/mock-data/cities.ts
```

### Flights

Located in:

```text
src/app/mock-data/flights.ts
```

Flight data is dynamically generated for:

- Multiple airlines
- Multiple departure times
- Next 30 days availability
- Outbound and return routes

---

# Running the Application

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm start
```

Open:

```text
http://localhost:4200
```

---

# Design Decisions

### Standalone Components

Angular Standalone Components were chosen to reduce module complexity and improve maintainability.

### Reactive Forms

Reactive Forms provide:

- Strong validation support
- Better scalability
- Easier testing

### Route Guards

Guards ensure users follow the intended booking flow and prevent invalid page access.

### Service-Based State

Application state is maintained through dedicated services instead of introducing heavier state-management libraries.

---

# Future Improvements

Potential enhancements:

- Backend API Integration
- Authentication & Authorization
- Seat Selection
- Passenger Management
- Fare Breakdown & Taxes
- Unit Tests for all the components
- E2E Tests
- State Management with NgRx Signal Store
- Internationalization (i18n)
- Responsive Mobile Enhancements

---

# Author

Kanaiya Lal

Angular Flight Booking Demo Application
